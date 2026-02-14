import { sql } from 'drizzle-orm'

/**
 * GET /api/real-estate/rent-trends
 *
 * Returns rent price data from D1.
 * Supports: ?zip=78704 (single zip), ?months=12 (limit), ?latest=true
 */
export default defineEventHandler(async (event) => {
  const db = useDatabase()
  const query = getQuery(event)
  const zip = query.zip as string | undefined
  const months = parseInt(query.months as string) || 24
  const latest = query.latest === 'true'

  try {
    if (latest || !zip) {
      // Latest rent per zip code
      const result = await db.run(sql`
        SELECT rp.*
        FROM rent_prices rp
        INNER JOIN (
          SELECT zip_code, MAX(period) as max_period
          FROM rent_prices
          GROUP BY zip_code
        ) latest ON rp.zip_code = latest.zip_code AND rp.period = latest.max_period
        ORDER BY rp.median_rent DESC
      `)

      interface RentPriceRow {
        zip_code: string
        period: string
        median_rent: number
        yoy_change: number | null
        source: string
      }

      const rows = (result.results ?? []) as RentPriceRow[]
      return {
        prices: rows.map(r => ({
          zipCode: r.zip_code,
          period: r.period,
          medianRent: r.median_rent,
          yoyChange: r.yoy_change,
          source: r.source,
        })),
        source: 'db',
      }
    }

    // Time series for a specific zip
    const result = await db.run(sql`
      SELECT * FROM rent_prices
      WHERE zip_code = ${zip}
      ORDER BY period DESC
      LIMIT ${months}
    `)

    interface RentPriceRow {
      zip_code: string
      period: string
      median_rent: number
      yoy_change: number | null
      source: string
    }

    const rows = (result.results ?? []) as RentPriceRow[]
    return {
      prices: rows.map(r => ({
        zipCode: r.zip_code,
        period: r.period,
        medianRent: r.median_rent,
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
