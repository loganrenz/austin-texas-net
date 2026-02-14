import { z } from 'zod'

const POSTHOG_PROJECT_ID = '312295'
const DOMAIN = 'austin-texas.net'

const querySchema = z.object({
  days: z.string().optional().default('30'),
})

export default defineEventHandler(async (event) => {
  await requireAdmin(event)

  const config = useRuntimeConfig()
  const apiKey = config.posthogApiKey || ''
  const query = await getValidatedQuery(event, querySchema.parse)

  if (!apiKey) {
    throw createError({ statusCode: 500, statusMessage: 'PostHog API key not configured' })
  }

  const days = parseInt(query.days) || 30

  try {
    // Entry pages — first page viewed in a session
    const entryRes: any = await $fetch(`https://us.posthog.com/api/projects/${POSTHOG_PROJECT_ID}/query/`, {
      method: 'POST',
      headers: {
        Authorization: `Bearer ${apiKey}`,
        'Content-Type': 'application/json',
      },
      body: {
        query: {
          kind: 'HogQLQuery',
          query: `
            SELECT
              replaceRegexpAll(properties.$pathname, '\\\\?.*', '') AS page,
              count() AS entries
            FROM events
            WHERE event = '$pageview'
              AND timestamp >= now() - toIntervalDay(${days})
              AND properties.$current_url LIKE '%${DOMAIN}%'
              AND properties.$is_initial_landing = true
            GROUP BY page
            ORDER BY entries DESC
            LIMIT 10
          `,
        },
      },
    })

    // Exit pages — approximate via last pageview per session
    const exitRes: any = await $fetch(`https://us.posthog.com/api/projects/${POSTHOG_PROJECT_ID}/query/`, {
      method: 'POST',
      headers: {
        Authorization: `Bearer ${apiKey}`,
        'Content-Type': 'application/json',
      },
      body: {
        query: {
          kind: 'HogQLQuery',
          query: `
            SELECT
              replaceRegexpAll(properties.$pathname, '\\\\?.*', '') AS page,
              count() AS exits
            FROM events
            WHERE event = '$pageleave'
              AND timestamp >= now() - toIntervalDay(${days})
              AND properties.$current_url LIKE '%${DOMAIN}%'
            GROUP BY page
            ORDER BY exits DESC
            LIMIT 10
          `,
        },
      },
    })

    const entryPages = (entryRes.results || []).map((row: any[]) => ({
      page: row[0] || '/',
      count: row[1] || 0,
    }))

    const exitPages = (exitRes.results || []).map((row: any[]) => ({
      page: row[0] || '/',
      count: row[1] || 0,
    }))

    return { entryPages, exitPages }
  } catch (error: any) {
    throw createError({
      statusCode: error.status || error.statusCode || 500,
      statusMessage: `PostHog Error: ${error.message}`,
    })
  }
})
