import { sql } from 'drizzle-orm'

/**
 * GET /api/real-estate/home-prices
 *
 * Returns home price data from D1.
 * Supports: ?zip=78704 (single zip), ?months=12 (limit), ?latest=true (latest per zip only)
 */
export default defineEventHandler(async (event) => {
  const db = useDatabase()
  const query = getQuery(event)
  const zip = query.zip as string | undefined
  const months = parseInt(query.months as string) || 24
  const latest = query.latest === 'true'

  try {
    if (latest) {
      // Latest price per zip code
      const result = await db.run(sql`
        SELECT hp.*
        FROM home_prices hp
        INNER JOIN (
          SELECT zip_code, MAX(period) as max_period
          FROM home_prices
          GROUP BY zip_code
        ) latest ON hp.zip_code = latest.zip_code AND hp.period = latest.max_period
        ORDER BY hp.median_value DESC
      `)

      interface HomePriceRow {
        zip_code: string
        period: string
        median_value: number
        yoy_change: number | null
        source: string
      }

      const rows = (result.results ?? []) as HomePriceRow[]
      return {
        prices: rows.map(r => ({
          zipCode: r.zip_code,
          period: r.period,
          medianValue: r.median_value,
          yoyChange: r.yoy_change,
          source: r.source,
        })),
        source: 'db',
      }
    }

    if (zip) {
      // Time series for a specific zip
      const result = await db.run(sql`
        SELECT * FROM home_prices
        WHERE zip_code = ${zip}
        ORDER BY period DESC
        LIMIT ${months}
      `)

      interface HomePriceRow {
        zip_code: string
        period: string
        median_value: number
        yoy_change: number | null
        source: string
      }

      const rows = (result.results ?? []) as HomePriceRow[]
      return {
        prices: rows.map(r => ({
          zipCode: r.zip_code,
          period: r.period,
          medianValue: r.median_value,
          yoyChange: r.yoy_change,
          source: r.source,
        })),
        source: 'db',
      }
    }

    // Default: latest price per zip code
    const result = await db.run(sql`
      SELECT hp.*
      FROM home_prices hp
      INNER JOIN (
        SELECT zip_code, MAX(period) as max_period
        FROM home_prices
        GROUP BY zip_code
      ) latest ON hp.zip_code = latest.zip_code AND hp.period = latest.max_period
      ORDER BY hp.median_value DESC
    `)

    interface HomePriceRow {
      zip_code: string
      period: string
      median_value: number
      yoy_change: number | null
      source: string
    }

    const rows = (result.results ?? []) as HomePriceRow[]
    return {
      prices: rows.map(r => ({
        zipCode: r.zip_code,
        period: r.period,
        medianValue: r.median_value,
        yoyChange: r.yoy_change,
        source: r.source,
      })),
      source: 'db',
    }
  }
  catch {
    return { prices: [], source: 'error' }
  }
})
