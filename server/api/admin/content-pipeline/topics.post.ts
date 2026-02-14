/**
 * POST /api/admin/content-pipeline/topics
 *
 * Create or update a content pipeline topic config.
 * If a topic with the same category_slug + topic_key exists, it's updated.
 */
import { z } from 'zod'
import { eq, and } from 'drizzle-orm'
import { contentPipelineTopics } from '~~/server/database/schema'

const bodySchema = z.object({
  categorySlug: z.string().min(1),
  categoryLabel: z.string().min(1),
  topicKey: z.string().min(1),
  topicLabel: z.string().min(1),
  contentType: z.string().min(1),
  spotFile: z.string().min(1),
  maxSpots: z.number().int().min(1).max(50).optional().default(10),
  searchQueries: z.array(z.string()).optional().default([]),
  bodySystemPrompt: z.string().optional(),
  faqSystemPrompt: z.string().optional(),
  enabled: z.boolean().optional().default(true),
})

export default defineEventHandler(async (event) => {
  const body = bodySchema.parse(await readBody(event))

  const db = useDatabase()

  // Check if it already exists
  const existing = await db
    .select()
    .from(contentPipelineTopics)
    .where(
      and(
        eq(contentPipelineTopics.categorySlug, body.categorySlug),
        eq(contentPipelineTopics.topicKey, body.topicKey),
      ),
    )
    .get()

  const data = {
    categorySlug: body.categorySlug,
    categoryLabel: body.categoryLabel,
    topicKey: body.topicKey,
    topicLabel: body.topicLabel,
    contentType: body.contentType,
    spotFile: body.spotFile,
    maxSpots: body.maxSpots,
    searchQueries: JSON.stringify(body.searchQueries),
    bodySystemPrompt: body.bodySystemPrompt ?? null,
    faqSystemPrompt: body.faqSystemPrompt ?? null,
    enabled: body.enabled,
    updatedAt: new Date().toISOString(),
  }

  if (existing) {
    await db
      .update(contentPipelineTopics)
      .set(data)
      .where(eq(contentPipelineTopics.id, existing.id))

    return { ok: true, action: 'updated', id: existing.id }
  }

  const result = await db.insert(contentPipelineTopics).values(data).returning()

  return { ok: true, action: 'created', id: result[0]?.id }
})
