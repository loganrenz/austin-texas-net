import { z } from 'zod'

const querySchema = z.object({
  propertyId: z.string().optional().default('484498498'),
  startDate: z.string().optional(),
  endDate: z.string().optional(),
})

export default defineEventHandler(async (event) => {
  await requireAdmin(event)

  const query = await getValidatedQuery(event, querySchema.parse)

  const endDate = query.endDate || new Date().toISOString().split('T')[0]
  const start = new Date(endDate)
  start.setDate(start.getDate() - 30)
  const startDate = query.startDate || start.toISOString().split('T')[0]

  try {
    const data: any = await googleApiFetch(
      `https://analyticsdata.googleapis.com/v1beta/properties/${query.propertyId}:runReport`,
      GA_SCOPES,
      {
        method: 'POST',
        body: JSON.stringify({
          dateRanges: [{ startDate, endDate }],
          metrics: [
            { name: 'activeUsers' },
            { name: 'sessions' },
            { name: 'screenPageViews' },
            { name: 'bounceRate' },
            { name: 'averageSessionDuration' },
          ],
          dimensions: [{ name: 'date' }],
        }),
      },
    )

    return {
      totals: data.totals?.[0]?.metricValues || [],
      rows: data.rows || [],
      startDate,
      endDate,
    }
  } catch (error: any) {
    throw createError({
      statusCode: error.statusCode || 500,
      statusMessage: `GA4 Error: ${error.statusMessage || error.message}`,
    })
  }
})
