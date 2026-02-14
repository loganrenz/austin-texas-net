/**
 * GET /api/geo/texas-outline
 *
 * Returns a simplified GeoJSON Feature with the Texas state boundary polygon.
 * Used by AppMapKit's `texasMask` prop to draw an inverted overlay that dims
 * everything outside Texas.
 *
 * The file is ~3 KB (152 vertices) so it's cached aggressively.
 */

interface TexasGeoJSON {
  type: string
  geometry: { type: string; coordinates: unknown }
  properties: Record<string, unknown>
}

let _cached: TexasGeoJSON | null = null

export default defineEventHandler(async (event) => {
  // Aggressive cache — the Texas border doesn't change
  setResponseHeader(event, 'Cache-Control', 'public, max-age=604800, immutable')
  setResponseHeader(event, 'Content-Type', 'application/geo+json')

  if (_cached) return _cached

  const storage = useStorage('assets:server')
  const raw = await storage.getItem<TexasGeoJSON>('data/texas-outline.geojson')

  if (raw && typeof raw === 'object' && raw.geometry) {
    _cached = raw
    return _cached
  }

  throw createError({ statusCode: 500, statusMessage: 'Texas GeoJSON not found' })
})
