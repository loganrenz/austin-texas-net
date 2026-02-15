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

  // Try the built-in Nitro server assets first (dev mode),
  // then fall back to 'assets:data' (serverAssets config for prod builds)
  for (const ns of ['assets:server', 'assets:data']) {
    const storage = useStorage(ns)
    const keys = ['data/texas-outline.geojson', 'texas-outline.geojson']
    for (const key of keys) {
      const raw = await storage.getItem<TexasGeoJSON>(key)
      if (raw && typeof raw === 'object' && 'geometry' in raw) {
        _cached = raw as TexasGeoJSON
        return _cached
      }
    }
  }

  throw createError({
    statusCode: 500,
    statusMessage: 'Texas GeoJSON not found in any storage namespace',
  })
})
