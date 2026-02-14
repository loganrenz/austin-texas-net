#!/usr/bin/env tsx
/**
 * Content Pipeline — AI-powered content curation for Austin-Texas.net
 *
 * Usage:
 *   pnpm run content:refresh                          # dry-run all categories
 *   pnpm run content:refresh -- --category food       # dry-run food only
 *   pnpm run content:refresh -- --topic bbq           # dry-run single topic
 *   pnpm run content:refresh -- --commit              # write to actual files
 *
 * Requires .env.content with:
 *   OPENAI_API_KEY=sk-...
 *   TAVILY_API_KEY=tvly-...
 */

import { resolve, dirname } from 'node:path'
import { writeFileSync, mkdirSync, readFileSync, existsSync } from 'node:fs'
import { fileURLToPath } from 'node:url'
import { config as loadEnv } from 'dotenv'
import OpenAI from 'openai'
import { tavily } from '@tavily/core'
import { pipelineCategories } from './content-pipeline.config.js'
import type { CategoryConfig, TopicConfig } from './content-pipeline.config.js'

// ─── Paths ──────────────────────────────────────────────────
const __filename = fileURLToPath(import.meta.url)
const __dirname = dirname(__filename)
const ROOT = resolve(__dirname, '..')
const OUTPUT_DIR = resolve(__dirname, 'content-output')
const CONTENT_DIR = resolve(ROOT, 'content', 'categories')
const DATA_DIR = resolve(ROOT, 'app', 'data')

// ─── CLI args ───────────────────────────────────────────────
const args = process.argv.slice(2)
const commitMode = args.includes('--commit')
const categoryFilter = getArg('--category')
const topicFilter = getArg('--topic')
const verbose = args.includes('--verbose')

function getArg(flag: string): string | undefined {
  const idx = args.indexOf(flag)
  return idx !== -1 && args[idx + 1] ? args[idx + 1] : undefined
}

// ─── Env ────────────────────────────────────────────────────
loadEnv({ path: resolve(ROOT, '.env.content') })

const openaiKey = process.env.OPENAI_API_KEY
const tavilyKey = process.env.TAVILY_API_KEY

if (!openaiKey) {
  console.error('❌ OPENAI_API_KEY not set. Create .env.content with your key.')
  process.exit(1)
}
if (!tavilyKey) {
  console.error('❌ TAVILY_API_KEY not set. Create .env.content with your key.')
  process.exit(1)
}

const openai = new OpenAI({ apiKey: openaiKey })
const tvly = tavily({ apiKey: tavilyKey })

// ─── Types ──────────────────────────────────────────────────
interface SpotResult {
  id: string
  name: string
  slug: string
  lat: number
  lng: number
  address: string
  neighborhood: string
  rank: number
  category: string
  knownFor: string
  description: string
  priceRange: string
  rating: number
}

interface TopicOutput {
  key: string
  label: string
  spots: SpotResult[]
}

interface _CategoryOutput {
  slug: string
  bodyMarkdown: string
  faqItems: Array<{ question: string; answer: string }>
  topics: TopicOutput[]
}

// ─── Step 1: Research via Tavily ────────────────────────────
async function research(queries: string[]): Promise<string> {
  const results: string[] = []

  for (const query of queries) {
    if (verbose) console.log(`  🔍 Searching: "${query}"`)
    try {
      const response = await tvly.search(query, {
        maxResults: 5,
        searchDepth: 'advanced',
        includeAnswer: true,
      })

      if (response.answer) {
        results.push(`## AI Summary for "${query}"\n${response.answer}\n`)
      }

      for (const r of response.results) {
        results.push(`### ${r.title}\nURL: ${r.url}\n${r.content}\n`)
      }
    } catch (err) {
      console.warn(`  ⚠️  Search failed for "${query}": ${(err as Error).message}`)
    }
  }

  return results.join('\n---\n')
}

// ─── Step 2: Curate spots via LLM ──────────────────────────
async function curateSpots(
  topic: TopicConfig,
  researchContext: string,
  existingSpots: string,
): Promise<SpotResult[]> {
  if (verbose) console.log(`  🤖 Curating spots for ${topic.label}...`)

  const prompt = `You are a local Austin, TX food expert curating a "Top ${topic.maxSpots}" list for "${topic.label}".

## Current list (may be outdated)
${existingSpots}

## Recent research
${researchContext}

## Instructions
1. Review the research and the current list
2. Keep spots that are still open and well-regarded
3. Add any noteworthy NEW spots that appear in the research
4. Remove any spots that have closed or declined significantly
5. Re-rank based on current quality and relevance
6. Write a fresh, opinionated 1-2 sentence description for each spot
7. Return EXACTLY ${topic.maxSpots} spots

## Output Format
Return a JSON array of objects with these exact fields:
- id: kebab-case identifier (e.g. "franklin-bbq")
- name: official name
- slug: same as id
- lat: latitude (number)
- lng: longitude (number)
- address: full street address
- neighborhood: Austin neighborhood name
- rank: 1-${topic.maxSpots}
- category: "${topic.label}"
- knownFor: signature item or highlight (short phrase)
- description: 1-2 sentences, local and opinionated
- priceRange: "$", "$$", or "$$$"
- rating: 0-5 (one decimal)

Return ONLY the JSON array, no markdown fences, no explanation.`

  const response = await openai.chat.completions.create({
    model: 'gpt-4o-mini',
    temperature: 0.7,
    response_format: { type: 'json_object' },
    messages: [
      {
        role: 'system',
        content: 'You return valid JSON. Always wrap arrays in an object with a "spots" key.',
      },
      { role: 'user', content: prompt },
    ],
  })

  const content = response.choices[0]?.message?.content
  if (!content) throw new Error('Empty LLM response for spots curation')

  try {
    const parsed = JSON.parse(content)
    const spots = parsed.spots || parsed
    if (!Array.isArray(spots)) throw new Error('Response is not an array')
    return spots as SpotResult[]
  } catch (err) {
    console.error(`  ❌ Failed to parse spots JSON: ${(err as Error).message}`)
    console.error(`  Raw response: ${content.slice(0, 500)}`)
    return []
  }
}

// ─── Step 3: Generate category copy ────────────────────────
async function generateCategoryCopy(
  category: CategoryConfig,
  allResearch: string,
  existingContent: string,
): Promise<{ bodyMarkdown: string; faqItems: Array<{ question: string; answer: string }> }> {
  if (verbose) console.log(`  ✍️  Generating copy for ${category.label}...`)

  // Generate body
  const bodyResponse = await openai.chat.completions.create({
    model: 'gpt-4o-mini',
    temperature: 0.8,
    messages: [
      { role: 'system', content: category.bodySystemPrompt },
      {
        role: 'user',
        content: `Here is the current body copy for the ${category.label} category page:

${existingContent}

Here is recent research about Austin's ${category.label.toLowerCase()} scene:

${allResearch.slice(0, 6000)}

Write updated body copy for the ${category.label} category page. Keep the same general structure
(2-3 sections with ## headers) but refresh the content with current information.
Include specific place names, neighborhoods, and dishes. Under 400 words total.
Return ONLY the markdown body (starting with ##), no frontmatter.`,
      },
    ],
  })

  const bodyMarkdown = bodyResponse.choices[0]?.message?.content || ''

  // Generate FAQ
  const faqResponse = await openai.chat.completions.create({
    model: 'gpt-4o-mini',
    temperature: 0.7,
    response_format: { type: 'json_object' },
    messages: [
      { role: 'system', content: category.faqSystemPrompt },
      {
        role: 'user',
        content: `Generate 4-6 FAQ items about Austin ${category.label.toLowerCase()}.
Use the following research for accuracy:

${allResearch.slice(0, 4000)}

Return a JSON object like: { "faqItems": [{ "question": "...", "answer": "..." }] }`,
      },
    ],
  })

  const faqContent = faqResponse.choices[0]?.message?.content || '{}'
  let faqItems: Array<{ question: string; answer: string }> = []
  try {
    const parsed = JSON.parse(faqContent)
    faqItems = parsed.faqItems || []
  } catch {
    console.warn('  ⚠️  Failed to parse FAQ JSON, using empty array')
  }

  return { bodyMarkdown, faqItems }
}

// ─── Output: Write TypeScript data file ─────────────────────
function writeSpotFile(topic: TopicConfig, spots: SpotResult[], outDir: string) {
  const varName = topic.spotFile.replace('.ts', '')
  const entries = spots
    .map((s) => {
      const desc = s.description.replace(/'/g, "\\'")
      const knownFor = s.knownFor.replace(/'/g, "\\'")
      const name = s.name.replace(/'/g, "\\'")
      return `  {
    id: '${s.id}',
    rank: ${s.rank},
    name: '${name}',
    slug: '${s.slug}',
    neighborhood: '${s.neighborhood}',
    knownFor: '${knownFor}',
    category: '${s.category}',
    description: '${desc}',
    priceRange: '${s.priceRange}',
    rating: ${s.rating},
    lat: ${s.lat},
    lng: ${s.lng},
    address: '${s.address}',
  }`
    })
    .join(',\n')

  const content = `/**
 * ${varName} — Top ${spots.length} ${topic.label} in Austin
 * Static fallback data. DB data via /api/map-spots?category=${topic.contentType} takes priority.
 *
 * AUTO-GENERATED by content-pipeline on ${new Date().toISOString().split('T')[0]}
 * Manual edits will be overwritten on next pipeline run.
 */
import type { MapSpot } from '~/types/mapSpot'

export const ${varName}: MapSpot[] = [
${entries}
]
`

  const filePath = resolve(outDir, topic.spotFile)
  writeFileSync(filePath, content, 'utf-8')
  console.log(`  📄 Wrote ${filePath}`)
}

// ─── Output: Write category markdown ────────────────────────
function writeCategoryMarkdown(
  slug: string,
  bodyMarkdown: string,
  faqItems: Array<{ question: string; answer: string }>,
  outDir: string,
) {
  const faqYaml = faqItems
    .map(
      (f) =>
        `  - question: '${f.question.replace(/'/g, "''")}'
    answer: '${f.answer.replace(/'/g, "''")}'`,
    )
    .join('\n')

  const content = `---
slug: ${slug}
faqItems:
${faqYaml}
---

${bodyMarkdown}
`

  const filePath = resolve(outDir, `${slug}.md`)
  writeFileSync(filePath, content, 'utf-8')
  console.log(`  📄 Wrote ${filePath}`)
}

// ─── Output: Write SQL seed ─────────────────────────────────
function writeSqlSeed(categorySlug: string, allTopics: TopicOutput[], outDir: string) {
  const lines: string[] = [
    `-- Auto-generated map_spots seed for ${categorySlug}`,
    `-- Generated by content-pipeline on ${new Date().toISOString().split('T')[0]}`,
    '',
  ]

  for (const topic of allTopics) {
    lines.push(`-- ${topic.label}`)
    for (const s of topic.spots) {
      const esc = (v: string) => v.replace(/'/g, "''")
      lines.push(
        `INSERT OR REPLACE INTO map_spots (id, name, lat, lng, address, neighborhood, category, content_type, rank, known_for, description, price_range, rating, featured) VALUES ('${esc(s.id)}', '${esc(s.name)}', ${s.lat}, ${s.lng}, '${esc(s.address)}', '${esc(s.neighborhood)}', '${esc(s.category)}', '${topic.key}', ${s.rank}, '${esc(s.knownFor)}', '${esc(s.description)}', '${s.priceRange}', ${s.rating}, 1);`,
      )
    }
    lines.push('')
  }

  const filePath = resolve(outDir, `content-${categorySlug}.sql`)
  writeFileSync(filePath, lines.join('\n'), 'utf-8')
  console.log(`  📄 Wrote ${filePath}`)
}

// ─── Read existing data for context ─────────────────────────
function readExistingSpots(spotFile: string): string {
  const filePath = resolve(DATA_DIR, spotFile)
  if (existsSync(filePath)) {
    return readFileSync(filePath, 'utf-8')
  }
  return '(no existing data)'
}

function readExistingContent(slug: string): string {
  const filePath = resolve(CONTENT_DIR, `${slug}.md`)
  if (existsSync(filePath)) {
    return readFileSync(filePath, 'utf-8')
  }
  return '(no existing content)'
}

// ─── Main ───────────────────────────────────────────────────
async function main() {
  console.log('\n🚀 Austin-Texas.net Content Pipeline')
  console.log(
    `   Mode: ${commitMode ? '⚡ COMMIT (writing to real files)' : '👀 DRY-RUN (writing to content-output/)'}`,
  )
  console.log('')

  const _targetDir = commitMode ? ROOT : OUTPUT_DIR

  // Prepare output directories
  if (!commitMode) {
    mkdirSync(resolve(OUTPUT_DIR, 'data'), { recursive: true })
    mkdirSync(resolve(OUTPUT_DIR, 'content'), { recursive: true })
    mkdirSync(resolve(OUTPUT_DIR, 'sql'), { recursive: true })
  }

  // Filter categories
  const categories = categoryFilter
    ? pipelineCategories.filter((c) => c.slug === categoryFilter)
    : pipelineCategories

  if (categories.length === 0) {
    console.error(`❌ No category found matching "${categoryFilter}"`)
    process.exit(1)
  }

  for (const category of categories) {
    console.log(`\n📂 Processing: ${category.label}`)
    console.log('─'.repeat(50))

    // Filter topics if specified
    const topics = topicFilter
      ? category.topics.filter((t) => t.key === topicFilter)
      : category.topics

    if (topics.length === 0) {
      console.error(`  ❌ No topic found matching "${topicFilter}"`)
      continue
    }

    const topicOutputs: TopicOutput[] = []
    let allResearch = ''

    // Process each topic
    for (const topic of topics) {
      console.log(`\n  🍽️  Topic: ${topic.label}`)

      // Step 1: Research
      const researchResults = await research(topic.searchQueries)
      allResearch += `\n\n### ${topic.label}\n${researchResults}`

      // Step 2: Curate spots
      const existingSpots = readExistingSpots(topic.spotFile)
      const spots = await curateSpots(topic, researchResults, existingSpots)

      if (spots.length > 0) {
        topicOutputs.push({ key: topic.key, label: topic.label, spots })

        // Write spot data file
        const dataDir = commitMode ? DATA_DIR : resolve(OUTPUT_DIR, 'data')
        writeSpotFile(topic, spots, dataDir)
      } else {
        console.warn(`  ⚠️  No spots generated for ${topic.label}, skipping output`)
      }
    }

    // Step 3: Generate category copy
    const existingContent = readExistingContent(category.slug)
    const { bodyMarkdown, faqItems } = await generateCategoryCopy(
      category,
      allResearch,
      existingContent,
    )

    // Write content markdown
    const contentDir = commitMode ? CONTENT_DIR : resolve(OUTPUT_DIR, 'content')
    writeCategoryMarkdown(category.slug, bodyMarkdown, faqItems, contentDir)

    // Write SQL seed
    const sqlDir = commitMode ? resolve(ROOT, 'drizzle', 'seeds') : resolve(OUTPUT_DIR, 'sql')
    mkdirSync(sqlDir, { recursive: true })
    writeSqlSeed(category.slug, topicOutputs, sqlDir)

    console.log(`\n  ✅ ${category.label} complete!`)
  }

  console.log('\n' + '═'.repeat(50))
  if (commitMode) {
    console.log('✅ All files written to project. Run `git diff` to review.')
  } else {
    console.log(`✅ Dry-run complete. Review output in:`)
    console.log(`   ${OUTPUT_DIR}/`)
    console.log('\n   To commit changes: pnpm run content:refresh -- --commit')
  }
  console.log('')
}

main().catch((err) => {
  console.error('\n💥 Pipeline failed:', err)
  process.exit(1)
})
