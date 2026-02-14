/**
 * GET /api/admin/neighborhood-grid/points
 *
 * Returns all crawled point coordinates for map visualization.
 * Response is a compact array of { lat, lng, neighborhood } objects.
 */
import { neighborhoodGrid } from '~~/server/database/schema'
import { getAuthUser } from '~~/server/utils/auth'

export default defineEventHandler(async (event) => {
  const user = await getAuthUser(event)
  if (!user?.isAdmin) {
    throw createError({ statusCode: 401, statusMessage: 'Unauthorized' })
  }

  const db = useDatabase()

  const rows = await db
    .select({
      lat: neighborhoodGrid.lat,
      lng: neighborhoodGrid.lng,
      neighborhood: neighborhoodGrid.neighborhood,
    })
    .from(neighborhoodGrid)
    .all()

  return rows
})
