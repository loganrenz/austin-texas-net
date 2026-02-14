/**
 * GET /api/bluebonnets/observations
 *
 * Proxies the iNaturalist public API for Lupinus texensis (Texas Bluebonnet)
 * observations within the greater Austin bounding box.
 *
 * Query params:
 *   - year (optional): filter to a specific observation year
 *
 * Response: { observations: { lat, lng, observed_on }[], total, yearRange }
 *
 * Cached for 6 hours — iNaturalist data doesn't change rapidly and we want
 * to be respectful of their public API.
 */

interface INatObservation {
  id: number
  geojson: { type: string; coordinates: [number, number] } | null
  observed_on: string | null
  place_guess: string | null
  uri: string | null
  user: { login: string; name: string | null } | null
  photos: Array<{ id: number; url: string }>
}

interface INatResponse {
  total_results: number
  page: number
  per_page: number
  results: INatObservation[]
}

interface BluebonnetPoint {
  lat: number
  lng: number
  observed_on: string
  photo_url: string | null
  observer: string
  place: string
  url: string
}

const TAXON_ID = 49564 // Lupinus texensis
const BBOX = { swlat: 25.8, swlng: -106.7, nelat: 36.5, nelng: -93.5 }
const PER_PAGE = 200
const MAX_PAGES = 15 // cap at ~3,000 observations to stay reasonable

export default defineCachedEventHandler(
  async (event) => {
    const query = getQuery(event)
    const year = query.year ? Number(query.year) : undefined

    const allPoints: BluebonnetPoint[] = []
    let totalResults = 0
    let page = 1
    let hasMore = true

    while (hasMore && page <= MAX_PAGES) {
      const params = new URLSearchParams({
        taxon_id: String(TAXON_ID),
        swlat: String(BBOX.swlat),
        swlng: String(BBOX.swlng),
        nelat: String(BBOX.nelat),
        nelng: String(BBOX.nelng),
        per_page: String(PER_PAGE),
        page: String(page),
        order: 'desc',
        order_by: 'observed_on',
        quality_grade: 'research,needs_id',
      })

      if (year) {
        params.set('d1', `${year}-01-01`)
        params.set('d2', `${year}-12-31`)
      }

      const url = `https://api.inaturalist.org/v1/observations?${params.toString()}`

      const data = await $fetch<INatResponse>(url, {
        headers: {
          'User-Agent': 'austin-texas.net/1.0 (contact@austin-texas.net)',
        },
      })

      totalResults = data.total_results

      for (const obs of data.results) {
        if (obs.geojson?.coordinates) {
          const [lng, lat] = obs.geojson.coordinates
          // Build medium-size photo URL from the square thumbnail
          const photoUrl = obs.photos?.[0]?.url?.replace('/square.', '/medium.') ?? null
          allPoints.push({
            lat,
            lng,
            observed_on: obs.observed_on ?? '',
            photo_url: photoUrl,
            observer: obs.user?.name || obs.user?.login || 'Anonymous',
            place: obs.place_guess || '',
            url: obs.uri || `https://www.inaturalist.org/observations/${obs.id}`,
          })
        }
      }

      hasMore = page * PER_PAGE < totalResults
      page++

      // Small delay between pages to be respectful of iNaturalist's API
      if (hasMore) {
        await new Promise((resolve) => setTimeout(resolve, 200))
      }
    }

    // Compute year range from observations
    const years = allPoints
      .map((p) => {
        const y = parseInt(p.observed_on?.split('-')[0] ?? '', 10)
        return isNaN(y) ? null : y
      })
      .filter((y): y is number => y !== null)

    const yearRange = years.length
      ? { min: Math.min(...years), max: Math.max(...years) }
      : { min: new Date().getFullYear(), max: new Date().getFullYear() }

    return {
      observations: allPoints,
      total: totalResults,
      fetched: allPoints.length,
      yearRange,
    }
  },
  {
    maxAge: 60 * 60 * 6, // 6 hours
    name: 'bluebonnet-observations',
    getKey: (event) => {
      const query = getQuery(event)
      return `bluebonnets-${query.year || 'all'}`
    },
  },
)
