/**
 * GET /api/neighborhoods/geojson
 *
 * Returns all neighborhoods as a GeoJSON FeatureCollection with
 * polygon boundaries. Polygon data is sourced from a static file
 * (City of Austin, OpenStreetMap, blackmad/neighborhoods).
 * D1 metadata (population, description, etc.) is merged in when available.
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

interface GeoJSONGeometry {
  type: string
  coordinates: unknown
}

interface StaticFeatureProperties {
  name: string
  slug: string
  region: string
  city: string
  centerLat: number | null
  centerLng: number | null
  source: string
}

interface StaticFeature {
  type: 'Feature'
  geometry: GeoJSONGeometry
  properties: StaticFeatureProperties
}

interface StaticFeatureCollection {
  type: 'FeatureCollection'
  features: StaticFeature[]
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
  centerLat: number | null
  centerLng: number | null
  source: string
}

interface GeoJSONFeature {
  type: 'Feature'
  geometry: GeoJSONGeometry
  properties: NeighborhoodProperties
}

interface GeoJSONFeatureCollection {
  type: 'FeatureCollection'
  features: GeoJSONFeature[]
}

/** Lazily cached static GeoJSON (loaded once per cold start). */
let _cachedGeo: StaticFeatureCollection | null = null

async function loadStaticGeoJSON(): Promise<StaticFeatureCollection> {
  if (_cachedGeo) return _cachedGeo

  try {
    // Use Nitro's built-in $fetch to read from public/data/
    // This works reliably in dev, preview, and Cloudflare Pages
    const raw = await $fetch<StaticFeatureCollection>('/data/austin-neighborhoods.geojson')
    if (raw && typeof raw === 'object' && Array.isArray(raw.features)) {
      _cachedGeo = raw
    } else {
      _cachedGeo = { type: 'FeatureCollection', features: [] }
    }
  } catch {
    _cachedGeo = { type: 'FeatureCollection', features: [] }
  }

  return _cachedGeo
}

export default defineEventHandler(async (event): Promise<GeoJSONFeatureCollection> => {
  const query = getQuery(event)
  const { city, region } = querySchema.parse(query)

  // Load static polygon data (edge-compatible, reads from public/)
  const staticData = await loadStaticGeoJSON()

  // Build slug-indexed lookup from static features
  const staticBySlug = new Map<string, StaticFeature>()
  for (const feat of staticData.features) {
    staticBySlug.set(feat.properties.slug, feat)
  }

  // Try to enrich with D1 metadata
  let dbBySlug = new Map<string, typeof neighborhoodsTable.$inferSelect>()
  try {
    const db = useDatabase()
    const conditions = []

    if (city) {
      conditions.push(eq(neighborhoodsTable.city, city))
    }
    if (region) {
      conditions.push(eq(neighborhoodsTable.region, region))
    }

    const rows = await db
      .select()
      .from(neighborhoodsTable)
      .where(conditions.length ? and(...conditions) : undefined)
      .orderBy(asc(neighborhoodsTable.region), asc(neighborhoodsTable.name))
      .all()

    dbBySlug = new Map(rows.map((r) => [r.slug, r]))
  } catch {
    // DB not available — use static data only
  }

  // Determine which features to return
  let slugsToInclude: Set<string>

  if (city || region) {
    // When filtering, only include neighborhoods that match the filter in D1
    slugsToInclude = new Set(dbBySlug.keys())
  } else {
    // No filter — include all from static, plus any D1-only
    slugsToInclude = new Set([...staticBySlug.keys(), ...dbBySlug.keys()])
  }

  const features: GeoJSONFeature[] = []

  for (const slug of slugsToInclude) {
    const staticFeat = staticBySlug.get(slug)
    const dbRow = dbBySlug.get(slug)

    if (staticFeat) {
      features.push({
        type: 'Feature',
        geometry: staticFeat.geometry,
        properties: {
          name: dbRow?.name ?? staticFeat.properties.name,
          slug,
          region: dbRow?.region ?? staticFeat.properties.region,
          city: dbRow?.city ?? staticFeat.properties.city,
          population: dbRow?.population ?? null,
          zipCode: dbRow?.zipCode ?? null,
          description: dbRow?.description ?? null,
          featured: dbRow?.featured ?? null,
          centerLat: dbRow?.lat ?? staticFeat.properties.centerLat,
          centerLng: dbRow?.lng ?? staticFeat.properties.centerLng,
          source: staticFeat.properties.source,
        },
      })
    } else if (dbRow && Number.isFinite(dbRow.lat) && Number.isFinite(dbRow.lng)) {
      // Neighborhood exists in D1 but not in static file — Point fallback
      features.push({
        type: 'Feature',
        geometry: {
          type: 'Point',
          coordinates: [dbRow.lng, dbRow.lat],
        },
        properties: {
          name: dbRow.name,
          slug,
          region: dbRow.region,
          city: dbRow.city,
          population: dbRow.population,
          zipCode: dbRow.zipCode,
          description: dbRow.description,
          featured: dbRow.featured,
          centerLat: dbRow.lat,
          centerLng: dbRow.lng,
          source: 'database',
        },
      })
    }
  }

  return { type: 'FeatureCollection', features }
})
