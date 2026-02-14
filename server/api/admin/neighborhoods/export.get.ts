/**
 * GET /api/admin/neighborhoods/export
 *
 * Admin-only endpoint that exports the full neighborhoods table as JSON,
 * including boundary_geojson shapes. This enables syncing local crawl
 * data to production without re-crawling.
 *
 * Response: { neighborhoods: [...], exportedAt: string, count: number }
 */
import { neighborhoodsTable } from '~~/server/database/schema'
import { getAuthUser } from '~~/server/utils/auth'

export default defineEventHandler(async (event) => {
  const user = await getAuthUser(event)
  if (!user?.isAdmin) {
    throw createError({ statusCode: 401, statusMessage: 'Unauthorized' })
  }

  const db = useDatabase()
  const neighborhoods = await db.select().from(neighborhoodsTable).all()

  return {
    neighborhoods,
    exportedAt: new Date().toISOString(),
    count: neighborhoods.length,
  }
})
