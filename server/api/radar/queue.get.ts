import { sql } from 'drizzle-orm'

/**
 * GET /api/radar/queue
 *
 * Content queue: top uncovered keywords sorted by strategic score.
 * Admin-only.
 */
export default defineEventHandler(async (event) => {
  await requireAdmin(event)
  const db = useDatabase()

  const limit = Math.min(50, Number(getQuery(event).limit) || 20)

  const rows = await db.select()
    .from(schema.keywords)
    .where(sql`${schema.keywords.matchedApp} IS NULL AND ${schema.keywords.pageExists} = 0`)
    .orderBy(sql`${schema.keywords.strategicScore} DESC`)
    .limit(limit)

  return { data: rows, total: rows.length }
})
