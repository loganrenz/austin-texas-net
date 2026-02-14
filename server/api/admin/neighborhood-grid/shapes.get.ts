/**
 * GET /api/admin/neighborhood-grid/shapes
 *
 * Computes GeoJSON polygon boundaries from accumulated grid points.
 * Uses convex hull algorithm on points labeled with each neighborhood name.
 *
 * Query params (optional):
 *   minPoints — minimum points required for a neighborhood shape (default: 5)
 *   neighborhood — filter to a single neighborhood name
 */
import { z } from 'zod'
import { sql } from 'drizzle-orm'
import { neighborhoodGrid } from '~~/server/database/schema'

const querySchema = z.object({
  minPoints: z.coerce.number().min(3).optional().default(5),
  neighborhood: z.string().optional(),
})

/**
 * Compute convex hull of a set of 2D points using Graham scan.
 * Returns points in counter-clockwise order.
 */
function convexHull(points: Array<{ lat: number; lng: number }>): Array<{ lat: number; lng: number }> {
  if (points.length < 3) return points

  // Find the bottom-most (min lat) point, break ties by min lng
  let pivot = points[0]!
  for (const p of points) {
    if (p.lat < pivot.lat || (p.lat === pivot.lat && p.lng < pivot.lng)) {
      pivot = p
    }
  }

  // Sort by polar angle relative to pivot
  const sorted = points
    .filter(p => p !== pivot)
    .sort((a, b) => {
      const angleA = Math.atan2(a.lat - pivot.lat, a.lng - pivot.lng)
      const angleB = Math.atan2(b.lat - pivot.lat, b.lng - pivot.lng)
      if (angleA !== angleB) return angleA - angleB
      // Same angle — closer point first
      const distA = (a.lng - pivot.lng) ** 2 + (a.lat - pivot.lat) ** 2
      const distB = (b.lng - pivot.lng) ** 2 + (b.lat - pivot.lat) ** 2
      return distA - distB
    })

  const hull = [pivot, sorted[0]!]

  for (let i = 1; i < sorted.length; i++) {
    let top = hull[hull.length - 1]!
    let nextToTop = hull[hull.length - 2]!
    const current = sorted[i]!

    // While the turn from nextToTop → top → current is not counter-clockwise, pop
    while (
      hull.length >= 2 &&
      cross(nextToTop, top, current) <= 0
    ) {
      hull.pop()
      top = hull[hull.length - 1]!
      nextToTop = hull[hull.length - 2]!
    }

    hull.push(current)
  }

  return hull
}

function cross(o: { lat: number; lng: number }, a: { lat: number; lng: number }, b: { lat: number; lng: number }): number {
  return (a.lng - o.lng) * (b.lat - o.lat) - (a.lat - o.lat) * (b.lng - o.lng)
}

export default defineEventHandler(async (event) => {
  const query = getQuery(event)
  const { minPoints, neighborhood: filterNeighborhood } = querySchema.parse(query)

  const db = useDatabase()

  // Get all labeled points, optionally filtered
  let condition = sql`neighborhood IS NOT NULL`
  if (filterNeighborhood) {
    condition = sql`neighborhood = ${filterNeighborhood}`
  }

  const points = await db
    .select({
      neighborhood: neighborhoodGrid.neighborhood,
      lat: neighborhoodGrid.lat,
      lng: neighborhoodGrid.lng,
    })
    .from(neighborhoodGrid)
    .where(condition)
    .all()

  // Group points by neighborhood
  const byNeighborhood = new Map<string, Array<{ lat: number; lng: number }>>()
  for (const p of points) {
    if (!p.neighborhood) continue
    const list = byNeighborhood.get(p.neighborhood) || []
    list.push({ lat: p.lat, lng: p.lng })
    byNeighborhood.set(p.neighborhood, list)
  }

  // Compute convex hull for each neighborhood with enough points
  interface GeoJSONFeature {
    type: 'Feature'
    geometry: { type: string; coordinates: number[][][] }
    properties: { name: string; pointCount: number; centerLat: number; centerLng: number; source: string }
  }

  const features: GeoJSONFeature[] = []

  for (const [name, pts] of byNeighborhood.entries()) {
    if (pts.length < minPoints) continue

    const hull = convexHull(pts)
    if (hull.length < 3) continue

    // Close the ring (GeoJSON requires first point = last point)
    const ring = hull.map(p => [p.lng, p.lat])
    ring.push(ring[0]!)

    // Compute centroid
    const centerLat = pts.reduce((s, p) => s + p.lat, 0) / pts.length
    const centerLng = pts.reduce((s, p) => s + p.lng, 0) / pts.length

    features.push({
      type: 'Feature',
      geometry: {
        type: 'Polygon',
        coordinates: [ring],
      },
      properties: {
        name,
        pointCount: pts.length,
        centerLat: Math.round(centerLat * 1e6) / 1e6,
        centerLng: Math.round(centerLng * 1e6) / 1e6,
        source: 'apple-maps-grid-crawler',
      },
    })
  }

  // Sort by name
  features.sort((a, b) => a.properties.name.localeCompare(b.properties.name))

  return {
    type: 'FeatureCollection',
    features,
    _meta: {
      totalNeighborhoods: byNeighborhood.size,
      withEnoughPoints: features.length,
      skipped: byNeighborhood.size - features.length,
      minPointsThreshold: minPoints,
    },
  }
})
