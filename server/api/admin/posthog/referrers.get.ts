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
    const res: any = await $fetch(`https://us.posthog.com/api/projects/${POSTHOG_PROJECT_ID}/query/`, {
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
              coalesce(nullIf(properties.$referring_domain, ''), '(direct)') AS referrer,
              count() AS visits,
              count(DISTINCT person_id) AS unique_visitors
            FROM events
            WHERE event = '$pageview'
              AND timestamp >= now() - toIntervalDay(${days})
              AND properties.$current_url LIKE '%${DOMAIN}%'
            GROUP BY referrer
            ORDER BY visits DESC
            LIMIT 15
          `,
        },
      },
    })

    const rows = (res.results || []).map((row: any[]) => ({
      referrer: row[0] || '(direct)',
      visits: row[1] || 0,
      uniqueVisitors: row[2] || 0,
    }))

    return { rows }
  } catch (error: any) {
    throw createError({
      statusCode: error.status || error.statusCode || 500,
      statusMessage: `PostHog Error: ${error.message}`,
    })
  }
})
