import { desc, gte, sql } from 'drizzle-orm'

/**
 * GET /api/pollen/history
 *
 * Returns historical pollen readings from D1.
 *
 * Query params:
 *   days  — number of days to return (default: 30, max: 730)
 *   agg   — 'daily' | 'weekly' (default: auto based on days)
 */
export default defineEventHandler(async (event) => {
  const query = getQuery(event)
  const days = Math.min(Math.max(Number(query.days) || 30, 1), 730)

  // Auto-aggregate for large ranges
  const aggMode = (query.agg as string) || (days > 90 ? 'weekly' : 'daily')

  const db = useDatabase()
  const { pollenReadings } = await import('../../database/schema')

  const startDate = new Date()
  startDate.setDate(startDate.getDate() - days)
  const startDateStr = startDate.toISOString().split('T')[0]!

  if (aggMode === 'weekly') {
    // Weekly averages for long-range views
    // Group by ISO week: strftime('%Y-W%W', date)
    const results = await db.all(sql`
      SELECT
        strftime('%Y-W%W', date) as week,
        MIN(date) as date,
        ROUND(AVG(count), 0) as count,
        MAX(count) as peak,
        COUNT(*) as data_points
      FROM pollen_readings
      WHERE date >= ${startDateStr}
      GROUP BY strftime('%Y-W%W', date)
      ORDER BY date ASC
    `)

    return {
      readings: results.map((r: any) => ({
        date: r.date,
        week: r.week,
        count: r.count,
        peak: r.peak,
        dataPoints: r.data_points,
        level: getSeverityLabel(r.count),
      })),
      meta: {
        total: results.length,
        aggregation: 'weekly',
        days,
        earliest: results.length > 0 ? (results[0] as any).date : null,
        latest: results.length > 0 ? (results[results.length - 1] as any).date : null,
      },
    }
  }

  // Daily readings
  const results = await db
    .select()
    .from(pollenReadings)
    .where(gte(pollenReadings.date, startDateStr))
    .orderBy(pollenReadings.date)

  return {
    readings: results.map((r) => ({
      date: r.date,
      count: r.count,
      level: getSeverityLabel(r.count),
      source: r.source,
    })),
    meta: {
      total: results.length,
      aggregation: 'daily',
      days,
      earliest: results.length > 0 ? results[0]!.date : null,
      latest: results.length > 0 ? results[results.length - 1]!.date : null,
    },
  }
})

function getSeverityLabel(count: number): string {
  if (count < 50) return 'Low'
  if (count < 500) return 'Medium'
  if (count < 1500) return 'High'
  if (count < 5000) return 'Very High'
  return 'Severe'
}
