import { z } from 'zod'

const querySchema = z.object({
  startDate: z.string().optional(),
  endDate: z.string().optional(),
  dimension: z.enum(['query', 'page', 'device', 'country', 'searchAppearance']).optional().default('query'),
})

const SITE_URL = 'https://austin-texas.net'

export default defineEventHandler(async (event) => {
  await requireAdmin(event)

  const query = await getValidatedQuery(event, querySchema.parse)

  const endDate = query.endDate || new Date().toISOString().split('T')[0]
  const start = new Date(endDate)
  start.setDate(start.getDate() - 30)
  const startDate = query.startDate || start.toISOString().split('T')[0]

  try {
    const data: any = await googleApiFetch(
      `https://www.googleapis.com/webmasters/v3/sites/${encodeURIComponent(SITE_URL)}/searchAnalytics/query`,
      GSC_SCOPES,
      {
        method: 'POST',
        body: JSON.stringify({
          startDate,
          endDate,
          dimensions: [query.dimension],
          rowLimit: 50,
        }),
      },
    )

    return {
      rows: data.rows || [],
      startDate,
      endDate,
      dimension: query.dimension,
    }
  } catch (error: any) {
    throw createError({
      statusCode: error.statusCode || 500,
      statusMessage: `GSC performance error: ${error.statusMessage || error.message}`,
    })
  }
})
