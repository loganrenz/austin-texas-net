import { z } from 'zod'

const POSTHOG_PROJECT_ID = '312295'
const DOMAIN = 'austin-texas.net'

const querySchema = z.object({
  startDate: z.string().optional(),
  endDate: z.string().optional(),
})

export default defineEventHandler(async (event) => {
  await requireAdmin(event)

  const config = useRuntimeConfig()
  const apiKey = config.posthogApiKey || ''
  const query = await getValidatedQuery(event, querySchema.parse)

  if (!apiKey) {
    throw createError({
      statusCode: 500,
      statusMessage: 'PostHog API key not configured (POSTHOG_PERSONAL_API_KEY)',
    })
  }

  const dateFrom = query.startDate || '-30d'
  const dateTo = query.endDate === 'now' ? undefined : query.endDate

  try {
    const res: any = await $fetch(`https://us.posthog.com/api/projects/${POSTHOG_PROJECT_ID}/query/`, {
      method: 'POST',
      headers: {
        Authorization: `Bearer ${apiKey}`,
        'Content-Type': 'application/json',
      },
      body: {
        query: {
          kind: 'TrendsQuery',
          dateRange: {
            date_from: dateFrom,
            date_to: dateTo,
          },
          series: [
            { kind: 'EventsNode', event: '$pageview', math: 'total', name: 'Pageviews' },
            { kind: 'EventsNode', event: '$pageview', math: 'dau', name: 'Unique Visitors' },
          ],
          properties: {
            type: 'AND',
            values: [
              {
                type: 'AND',
                values: [{ key: '$current_url', value: DOMAIN, operator: 'icontains', type: 'event' }],
              },
            ],
          },
        },
      },
    })

    return res
  } catch (error: any) {
    throw createError({
      statusCode: error.status || error.statusCode || 500,
      statusMessage: `PostHog Error: ${error.message}`,
    })
  }
})
