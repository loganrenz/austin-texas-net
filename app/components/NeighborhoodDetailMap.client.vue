<script setup lang="ts">
interface NeighborhoodGeometry {
  type?: string
  coordinates?: unknown
}

interface NeighborhoodFeature {
  type: 'Feature'
  geometry: NeighborhoodGeometry
  properties: {
    name: string
    squareMiles: number | null
    centerLat: number | null
    centerLng: number | null
    region: string
    source: 'city-of-austin' | 'community' | 'apple-maps-server'
  }
}

const props = defineProps<{
  feature: NeighborhoodFeature
}>()

const runtimeConfig = useRuntimeConfig()
const mapkitJsApiKey = runtimeConfig.public.mapkitJsApiKey

const mapElement = ref<HTMLElement | null>(null)
const loadError = ref('')

let mapInstance: any | null = null
let mapKitLoadPromise: Promise<any> | null = null

function pointFromCoordinatePair(value: unknown): [number, number] | null {
  if (!Array.isArray(value) || value.length < 2) {
    return null
  }

  const lng = Number(value[0])
  const lat = Number(value[1])

  if (!Number.isFinite(lat) || !Number.isFinite(lng)) {
    return null
  }

  return [lng, lat]
}

function extractPolygonRings(feature: NeighborhoodFeature): Array<Array<[number, number]>> {
  const geometryType = feature.geometry?.type
  const coordinates = feature.geometry?.coordinates

  if (!Array.isArray(coordinates)) {
    return []
  }

  const rings: Array<Array<[number, number]>> = []

  if (geometryType === 'Polygon') {
    const outerRing = Array.isArray(coordinates[0]) ? coordinates[0] : null
    if (Array.isArray(outerRing)) {
      const normalizedRing = outerRing
        .map(pointFromCoordinatePair)
        .filter((value): value is [number, number] => value !== null)
      if (normalizedRing.length >= 3) {
        rings.push(normalizedRing)
      }
    }
  }

  if (geometryType === 'MultiPolygon') {
    for (const polygon of coordinates) {
      if (!Array.isArray(polygon)) {
        continue
      }

      const outerRing = Array.isArray(polygon[0]) ? polygon[0] : null
      if (!Array.isArray(outerRing)) {
        continue
      }

      const normalizedRing = outerRing
        .map(pointFromCoordinatePair)
        .filter((value): value is [number, number] => value !== null)

      if (normalizedRing.length >= 3) {
        rings.push(normalizedRing)
      }
    }
  }

  return rings
}

function computeBounds(feature: NeighborhoodFeature) {
  const rings = extractPolygonRings(feature)
  const allPoints = rings.flat()

  if (allPoints.length === 0) {
    return null
  }

  let minLat = Number.POSITIVE_INFINITY
  let maxLat = Number.NEGATIVE_INFINITY
  let minLng = Number.POSITIVE_INFINITY
  let maxLng = Number.NEGATIVE_INFINITY

  for (const [lng, lat] of allPoints) {
    minLat = Math.min(minLat, lat)
    maxLat = Math.max(maxLat, lat)
    minLng = Math.min(minLng, lng)
    maxLng = Math.max(maxLng, lng)
  }

  return { minLat, maxLat, minLng, maxLng }
}

function renderFeature() {
  if (!mapInstance || !(window as any).mapkit) {
    return
  }

  const mapkit = (window as any).mapkit
  const feature = props.feature

  if (feature.geometry?.type === 'Point') {
    const point = pointFromCoordinatePair(feature.geometry.coordinates)
    if (!point) {
      return
    }

    const annotation = new mapkit.MarkerAnnotation(
      new mapkit.Coordinate(point[1], point[0]),
      {
        title: feature.properties.name,
        glyphText: 'N',
        color: '#059669',
        glyphColor: '#ffffff',
        displayPriority: 1000,
        animates: true,
      },
    )

    mapInstance.addAnnotation(annotation)

    const center = new mapkit.Coordinate(point[1], point[0])
    const span = new mapkit.CoordinateSpan(0.015, 0.015)
    mapInstance.region = new mapkit.CoordinateRegion(center, span)
    return
  }

  const rings = extractPolygonRings(feature)
  if (rings.length === 0) {
    return
  }

  const style = new mapkit.Style({
    lineWidth: 2.5,
    strokeColor: '#065f46',
    fillColor: 'rgba(16,185,129,0.35)',
  })

  for (const ring of rings) {
    const ringCoordinates = ring.map(([lng, lat]) => new mapkit.Coordinate(lat, lng))
    const overlay = new mapkit.PolygonOverlay(ringCoordinates)
    overlay.style = style
    overlay.enabled = true
    mapInstance.addOverlay(overlay)
  }

  const bounds = computeBounds(feature)
  if (bounds) {
    const centerLat = (bounds.minLat + bounds.maxLat) / 2
    const centerLng = (bounds.minLng + bounds.maxLng) / 2
    const latSpan = Math.max((bounds.maxLat - bounds.minLat) * 1.5, 0.012)
    const lngSpan = Math.max((bounds.maxLng - bounds.minLng) * 1.5, 0.012)

    const center = new mapkit.Coordinate(centerLat, centerLng)
    const span = new mapkit.CoordinateSpan(latSpan, lngSpan)
    mapInstance.region = new mapkit.CoordinateRegion(center, span)
  }
}

async function loadMapkitJsLibrary() {
  if ((window as any).mapkit?.loadedLibraries?.length) {
    return (window as any).mapkit
  }

  if (mapKitLoadPromise) {
    return mapKitLoadPromise
  }

  mapKitLoadPromise = new Promise((resolve, reject) => {
    const callbackName = `__mapkitReady_${Math.random().toString(36).slice(2)}`
    const script = document.createElement('script')

    ;(window as any)[callbackName] = () => {
      const mapkit = (window as any).mapkit
      delete (window as any)[callbackName]

      if (!mapkit?.loadedLibraries?.length) {
        reject(new Error('MapKit JS loaded without required libraries'))
        return
      }

      resolve(mapkit)
    }

    script.src = 'https://cdn.apple-mapkit.com/mk/5.x.x/mapkit.core.js'
    script.async = true
    script.crossOrigin = 'anonymous'
    script.dataset.callback = callbackName
    script.dataset.libraries = 'full-map,services,overlays,geojson'
    script.dataset.token = mapkitJsApiKey

    script.onerror = () => {
      delete (window as any)[callbackName]
      reject(new Error('Failed to load Apple MapKit JS'))
    }

    document.head.appendChild(script)
  })

  return mapKitLoadPromise
}

function initializeMap() {
  if (!mapElement.value || !(window as any).mapkit) {
    return
  }

  const mapkit = (window as any).mapkit
  const lat = props.feature.properties.centerLat ?? 30.2672
  const lng = props.feature.properties.centerLng ?? -97.7431
  const center = new mapkit.Coordinate(lat, lng)
  const span = new mapkit.CoordinateSpan(0.03, 0.03)

  mapInstance = new mapkit.Map(mapElement.value, {
    region: new mapkit.CoordinateRegion(center, span),
    showsCompass: mapkit.FeatureVisibility.Visible,
    showsMapTypeControl: true,
    isRotationEnabled: false,
  })
}

onMounted(async () => {
  if (!mapkitJsApiKey) {
    loadError.value = 'MAPKIT_JS_API_KEY is missing.'
    return
  }

  try {
    await loadMapkitJsLibrary()
    initializeMap()
    renderFeature()
  } catch {
    if (window.location.hostname.endsWith('.pages.dev')) {
      loadError.value = 'MapKit JS token is scoped to *.atx-apps.com. Open this page on your custom domain.'
      return
    }

    loadError.value = 'Apple MapKit JS failed to initialize.'
  }
})

onBeforeUnmount(() => {
  mapInstance?.destroy?.()
  mapInstance = null
})
</script>

<template>
  <div class="space-y-3">
    <div v-if="loadError" class="rounded-xl border border-warning/40 bg-warning/10 px-4 py-3 text-sm text-warning">
      {{ loadError }}
    </div>

    <div ref="mapElement" class="h-[360px] w-full rounded-2xl border border-default bg-muted sm:h-[440px]" />
  </div>
</template>

<style scoped>
:deep(.mk-map-view) {
  border-radius: 1rem;
  overflow: hidden;
}
</style>
