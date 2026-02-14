/**
 * GET /api/neighborhoods/geojson
 *
 * Returns all neighborhoods as a GeoJSON FeatureCollection.
 * Each neighborhood is a Point feature with properties including
 * name, slug, region, city, and population.
 *
 * Query params (optional):
 *   city   — filter by city name, e.g. "Austin"
 *   region — filter by region, e.g. "Central"
 */
import { eq, and, asc } from 'drizzle-orm'
import { z } from 'zod'
import { neighborhoodsTable } from '~~/server/database/schema'

const querySchema = z.object({
  city: z.string().optional(),
  region: z.string().optional(),
})

interface GeoJSONPoint {
  type: 'Point'
  coordinates: [number, number]
}

interface NeighborhoodProperties {
  name: string
  slug: string
  region: string | null
  city: string | null
  population: number | null
  zipCode: string | null
  description: string | null
  featured: boolean | null
  centerLat: number
  centerLng: number
}

interface GeoJSONFeature {
  type: 'Feature'
  geometry: GeoJSONPoint
  properties: NeighborhoodProperties
}

interface GeoJSONFeatureCollection {
  type: 'FeatureCollection'
  features: GeoJSONFeature[]
}

export default defineEventHandler(async (event): Promise<GeoJSONFeatureCollection> => {
  const query = getQuery(event)
  const { city, region } = querySchema.parse(query)

  const db = useDatabase()

  try {
    const conditions = []

    if (city) {
      conditions.push(eq(neighborhoodsTable.city, city))
    }

    if (region) {
      conditions.push(eq(neighborhoodsTable.region, region))
    }

    const neighborhoods = await db
      .select()
      .from(neighborhoodsTable)
      .where(conditions.length ? and(...conditions) : undefined)
      .orderBy(asc(neighborhoodsTable.region), asc(neighborhoodsTable.name))
      .all()

    const features: GeoJSONFeature[] = neighborhoods
      .filter((n) => Number.isFinite(n.lat) && Number.isFinite(n.lng))
      .map((n) => ({
        type: 'Feature' as const,
        geometry: {
          type: 'Point' as const,
          coordinates: [n.lng, n.lat] as [number, number],
        },
        properties: {
          name: n.name,
          slug: n.slug,
          region: n.region,
          city: n.city,
          population: n.population,
          zipCode: n.zipCode,
          description: n.description,
          featured: n.featured,
          centerLat: n.lat,
          centerLng: n.lng,
        },
      }))

    return {
      type: 'FeatureCollection',
      features,
    }
  } catch {
    return { type: 'FeatureCollection', features: [] }
  }
})
