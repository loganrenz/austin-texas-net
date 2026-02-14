<script lang="ts">
/* eslint-disable @typescript-eslint/no-explicit-any */
declare const mapkit: any
</script>

<script setup lang="ts" generic="T extends { id: string; lat: number; lng: number }">
/**
 * AppMapKit — Reusable Apple MapKit JS map component.
 *
 * Supports two rendering modes (can be combined):
 *   1. Pin annotations — pass `items` + `createPinElement`
 *   2. GeoJSON polygon overlays — pass `geojson` + optional `overlayStyleFn`
 *
 * Handles MapKit loading, map initialization, bounding region calculation,
 * pin annotations with selection, polygon overlays, zoom behavior, dark mode
 * sync, and cleanup.
 */

export interface GeoJSONGeometry {
  type: string
  coordinates: unknown
}

export interface GeoJSONFeatureProperties {
  name?: string
  slug?: string
  region?: string
  city?: string
  centerLat?: number | null
  centerLng?: number | null
  source?: string
  [key: string]: unknown
}

export interface GeoJSONFeature {
  type: 'Feature'
  geometry: GeoJSONGeometry
  properties: GeoJSONFeatureProperties
}

export interface GeoJSONFeatureCollection {
  type: 'FeatureCollection'
  features: GeoJSONFeature[]
}

export interface OverlayStyle {
  strokeColor: string
  strokeOpacity?: number
  fillColor: string
  fillOpacity?: number
  lineWidth: number
}

const props = withDefaults(
  defineProps<{
    /** Pin annotation items (optional when using geojson-only mode). */
    items?: T[]
    /** Factory to create pin DOM elements. Required when items are provided. */
    createPinElement?: (
      item: T,
      isSelected: boolean,
    ) => { element: HTMLElement; cleanup?: () => void }
    /** GeoJSON FeatureCollection with Polygon/MultiPolygon features. */
    geojson?: GeoJSONFeatureCollection | null
    /** Custom style function for each GeoJSON overlay polygon. */
    overlayStyleFn?: (properties: GeoJSONFeatureProperties) => OverlayStyle
    annotationSize?: { width: number; height: number }
    zoomSpan?: { lat: number; lng: number }
    boundingPadding?: number
    fallbackCenter?: { lat: number; lng: number }
  }>(),
  {
    items: () => [] as any,
    createPinElement: undefined,
    geojson: null,
    overlayStyleFn: undefined,
    annotationSize: () => ({ width: 100, height: 56 }),
    zoomSpan: () => ({ lat: 0.002, lng: 0.0025 }),
    boundingPadding: 0.05,
    fallbackCenter: () => ({ lat: 30.2672, lng: -97.7431 }),
  },
)

const emit = defineEmits<{
  /** Emitted when a GeoJSON polygon overlay is clicked. */
  'feature-select': [feature: GeoJSONFeature]
}>()

const selectedId = defineModel<string | null>('selectedId', { default: null })

const { mapkitReady, mapkitError } = useMapKit()
const mapContainer = ref<HTMLElement | null>(null)

const pinCleanups: Array<() => void> = []
let map: any = null
let overviewRegion: any = null
const overlayFeatureMap = new WeakMap<any, GeoJSONFeature>()

// ── Bounding region ──────────────────────────────────────────

function computeBoundingRegion(): any {
  let minLat = Infinity,
    maxLat = -Infinity
  let minLng = Infinity,
    maxLng = -Infinity
  let hasPoints = false

  // From pin items
  for (const s of props.items) {
    if (s.lat < minLat) minLat = s.lat
    if (s.lat > maxLat) maxLat = s.lat
    if (s.lng < minLng) minLng = s.lng
    if (s.lng > maxLng) maxLng = s.lng
    hasPoints = true
  }

  // From GeoJSON features
  if (props.geojson?.features) {
    for (const feat of props.geojson.features) {
      const points = extractAllPoints(feat.geometry)
      for (const [lng, lat] of points) {
        if (lat < minLat) minLat = lat
        if (lat > maxLat) maxLat = lat
        if (lng < minLng) minLng = lng
        if (lng > maxLng) maxLng = lng
        hasPoints = true
      }
    }
  }

  if (hasPoints) {
    const pad = props.boundingPadding
    const latDelta = Math.max((maxLat - minLat) * (1 + pad), 0.005)
    const lngDelta = Math.max((maxLng - minLng) * (1 + pad), 0.006)
    const center = new mapkit.Coordinate((minLat + maxLat) / 2, (minLng + maxLng) / 2)
    return new mapkit.CoordinateRegion(center, new mapkit.CoordinateSpan(latDelta, lngDelta))
  }

  const { lat, lng } = props.fallbackCenter
  return new mapkit.CoordinateRegion(
    new mapkit.Coordinate(lat, lng),
    new mapkit.CoordinateSpan(0.08, 0.1),
  )
}

// ── GeoJSON helpers ──────────────────────────────────────────

function extractAllPoints(geometry: GeoJSONGeometry): Array<[number, number]> {
  const coords = geometry.coordinates
  if (!Array.isArray(coords)) return []

  const points: Array<[number, number]> = []

  if (geometry.type === 'Polygon') {
    const outer = coords[0]
    if (Array.isArray(outer)) {
      for (const pt of outer) {
        if (Array.isArray(pt) && pt.length >= 2) {
          points.push([pt[0] as number, pt[1] as number])
        }
      }
    }
  } else if (geometry.type === 'MultiPolygon') {
    for (const polygon of coords) {
      if (!Array.isArray(polygon)) continue
      const outer = polygon[0]
      if (!Array.isArray(outer)) continue
      for (const pt of outer) {
        if (Array.isArray(pt) && pt.length >= 2) {
          points.push([pt[0] as number, pt[1] as number])
        }
      }
    }
  }

  return points
}

function defaultOverlayStyle(): OverlayStyle {
  return {
    strokeColor: '#065f46',
    strokeOpacity: 1,
    fillColor: '#10b981',
    fillOpacity: 0.2,
    lineWidth: 1.5,
  }
}

function buildPolygonRings(geometry: GeoJSONGeometry): Array<any[]> {
  const coords = geometry.coordinates
  if (!Array.isArray(coords)) return []

  const rings: Array<any[]> = []

  if (geometry.type === 'Polygon') {
    const outer = coords[0]
    if (Array.isArray(outer)) {
      const ring = outer
        .filter((pt: unknown) => Array.isArray(pt) && (pt as number[]).length >= 2)
        .map((pt: unknown) => new mapkit.Coordinate((pt as number[])[1], (pt as number[])[0]))
      if (ring.length >= 3) rings.push(ring)
    }
  } else if (geometry.type === 'MultiPolygon') {
    for (const polygon of coords) {
      if (!Array.isArray(polygon)) continue
      const outer = polygon[0]
      if (!Array.isArray(outer)) continue
      const ring = outer
        .filter((pt: unknown) => Array.isArray(pt) && (pt as number[]).length >= 2)
        .map((pt: unknown) => new mapkit.Coordinate((pt as number[])[1], (pt as number[])[0]))
      if (ring.length >= 3) rings.push(ring)
    }
  }

  return rings
}

// ── Map initialization ───────────────────────────────────────

function initMap() {
  if (!mapContainer.value) return

  overviewRegion = computeBoundingRegion()

  map = new mapkit.Map(mapContainer.value, {
    center: overviewRegion.center,
    region: overviewRegion,
    showsCompass: mapkit.FeatureVisibility.Hidden,
    showsMapTypeControl: false,
    showsZoomControl: true,
    showsScale: mapkit.FeatureVisibility.Adaptive,
    colorScheme: document.documentElement.classList.contains('dark')
      ? mapkit.Map.ColorSchemes.Dark
      : mapkit.Map.ColorSchemes.Light,
    padding: new mapkit.Padding(10, 10, 10, 10),
  })

  // Click on map background (not a pin) clears selection
  map.element.addEventListener('click', (e: MouseEvent) => {
    const target = e.target as HTMLElement
    if (target.closest('[data-map-pin]')) return
    if (selectedId.value) selectedId.value = null
  })

  addAnnotations()
  addOverlays()
}

// ── Pin annotations ──────────────────────────────────────────

function clearPinCleanups() {
  for (const fn of pinCleanups) fn()
  pinCleanups.length = 0
}

function addAnnotations() {
  if (!map || !props.items.length || !props.createPinElement) return

  const annotations = props.items.map((item) => {
    const coord = new mapkit.Coordinate(item.lat, item.lng)
    return new mapkit.Annotation(
      coord,
      () => {
        const isSelected = selectedId.value === item.id
        const { element, cleanup } = props.createPinElement!(item, isSelected)

        const wrapper = document.createElement('div')
        wrapper.setAttribute('data-map-pin', '')
        wrapper.style.cursor = 'pointer'
        wrapper.appendChild(element)
        wrapper.addEventListener('click', (e) => {
          e.stopPropagation()
          selectedId.value = selectedId.value === item.id ? null : item.id
        })

        if (cleanup) pinCleanups.push(cleanup)

        return wrapper
      },
      {
        anchorOffset: new DOMPoint(0, -6),
        calloutEnabled: false,
        size: props.annotationSize,
        data: { id: item.id },
      },
    )
  })
  map.addAnnotations(annotations)
}

function rebuildAnnotations() {
  if (!map) return
  clearPinCleanups()
  map.removeAnnotations(map.annotations)
  addAnnotations()
}

// ── Polygon overlays ─────────────────────────────────────────

function addOverlays() {
  if (!map || !props.geojson?.features?.length) return

  for (const feature of props.geojson.features) {
    const rings = buildPolygonRings(feature.geometry)
    if (rings.length === 0) continue

    const styleCfg = props.overlayStyleFn
      ? props.overlayStyleFn(feature.properties)
      : defaultOverlayStyle()

    const style = new mapkit.Style({
      strokeColor: styleCfg.strokeColor,
      strokeOpacity: styleCfg.strokeOpacity ?? 1,
      fillColor: styleCfg.fillColor,
      fillOpacity: styleCfg.fillOpacity ?? 0.2,
      lineWidth: styleCfg.lineWidth,
    })

    for (const ring of rings) {
      const overlay = new mapkit.PolygonOverlay(ring, { style })
      overlay.enabled = true
      overlayFeatureMap.set(overlay, feature)
      map.addOverlay(overlay)
    }
  }

  // Listen for overlay selection
  map.addEventListener('select', (event: any) => {
    const overlay = event.overlay
    if (!overlay) return
    const feature = overlayFeatureMap.get(overlay)
    if (feature) {
      emit('feature-select', feature)
    }
  })
}

function clearOverlays() {
  if (!map) return
  map.removeOverlays(map.overlays)
}

// ── Zoom behavior ────────────────────────────────────────────

function zoomToItem(item: T) {
  if (!map) return
  const center = new mapkit.Coordinate(item.lat, item.lng)
  const span = new mapkit.CoordinateSpan(props.zoomSpan.lat, props.zoomSpan.lng)
  map.setRegionAnimated(new mapkit.CoordinateRegion(center, span), true)
}

function zoomOut() {
  if (!map || !overviewRegion) return
  map.setRegionAnimated(overviewRegion, true)
}

// ── Watchers ─────────────────────────────────────────────────

// Re-render annotations and handle zoom when selection changes
watch(selectedId, (newId) => {
  if (!map) return
  rebuildAnnotations()
  if (newId) {
    const item = props.items.find((i) => i.id === newId)
    if (item) zoomToItem(item)
  } else {
    zoomOut()
  }
})

// Re-render and re-fit when items change
watch(
  () => props.items,
  () => {
    if (!map) return
    selectedId.value = null
    clearPinCleanups()
    map.removeAnnotations(map.annotations)
    overviewRegion = computeBoundingRegion()
    addAnnotations()
    if (overviewRegion) map.setRegionAnimated(overviewRegion, true)
  },
  { deep: false },
)

// Re-render overlays when geojson changes
watch(
  () => props.geojson,
  () => {
    if (!map) return
    clearOverlays()
    overviewRegion = computeBoundingRegion()
    addOverlays()
    if (overviewRegion) map.setRegionAnimated(overviewRegion, true)
  },
  { deep: false },
)

// Dark mode sync
const colorMode = useColorMode()
watch(
  () => colorMode.value,
  (mode) => {
    if (map) {
      map.colorScheme =
        mode === 'dark' ? mapkit.Map.ColorSchemes.Dark : mapkit.Map.ColorSchemes.Light
    }
  },
)

watch(mapkitReady, (ready) => {
  if (ready) nextTick(initMap)
})

onMounted(() => {
  if (mapkitReady.value) initMap()
})

onBeforeUnmount(() => {
  clearPinCleanups()
  if (map) {
    map.destroy()
    map = null
  }
})

function scrollIntoView() {
  mapContainer.value?.scrollIntoView({ behavior: 'smooth', block: 'start' })
}

defineExpose({ scrollIntoView })
</script>

<template>
  <div class="mapkit-wrapper">
    <div v-if="mapkitError" class="mapkit-status">
      <UIcon name="i-lucide-map-off" class="size-10 text-warning mb-3" />
      <h3 class="text-lg font-bold font-display mb-1">Map Unavailable</h3>
      <p class="text-sm text-muted">{{ mapkitError }}</p>
    </div>

    <div v-else-if="!mapkitReady" class="mapkit-status">
      <div class="mapkit-spinner" />
      <p class="text-sm text-muted mt-3">Loading map…</p>
    </div>

    <div ref="mapContainer" class="mapkit-canvas" :class="{ 'opacity-0': !mapkitReady }" />
  </div>
</template>
