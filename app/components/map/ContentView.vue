<script setup lang="ts">
/**
 * MapContentView — Generic MapKit JS map with selectable pins.
 *
 * Replaces BreakfastTacoMap.vue. Accepts MapSpot[] + MapPageConfig.
 * Each pin shows a rank number and the place name underneath.
 * Selecting a pin highlights it; detail is shown in the main page view.
 */
import { createApp, h } from 'vue'
import type { MapSpot, MapPageConfig } from '~/types/mapSpot'
import MapPin from '~/components/map/Pin.vue'

/* eslint-disable @typescript-eslint/no-explicit-any */
declare const mapkit: any

const props = defineProps<{
  spots: MapSpot[]
  config: MapPageConfig
}>()

const { mapkitReady, mapkitError } = useMapKit()
const mapContainer = ref<HTMLElement | null>(null)
const selectedSlug = ref<string | null>(null)

const selectedSpot = computed<MapSpot | null>(
  () => props.spots.find((s) => s.slug === selectedSlug.value) ?? null,
)



/** Track mounted Vue micro-apps so we can unmount on cleanup */
const mountedApps: Array<{ unmount: () => void }> = []

let map: any = null
/** Store the default overview region so we can zoom back */
let overviewRegion: any = null

function createAnnotationElement(spot: MapSpot): HTMLElement {
  const wrapper = document.createElement('div')

  const app = createApp({
    setup() {
      return () =>
        h(MapPin, {
          rank: spot.rank,
          name: spot.name,
          icon: props.config.categoryIcon || 'i-lucide-map-pin',
          selected: selectedSlug.value === spot.slug,
          pinColor: props.config.pinColor,
          onSelect: () => {
            selectedSlug.value = selectedSlug.value === spot.slug ? null : spot.slug
          },
        })
    },
  })

  mountedApps.push(app)
  app.mount(wrapper)

  return wrapper
}

function initMap() {
  if (!mapContainer.value) return

  // Compute bounding region from actual spot coordinates (tight crop)
  if (props.spots.length > 0) {
    let minLat = Infinity, maxLat = -Infinity
    let minLng = Infinity, maxLng = -Infinity
    for (const s of props.spots) {
      if (s.lat < minLat) minLat = s.lat
      if (s.lat > maxLat) maxLat = s.lat
      if (s.lng < minLng) minLng = s.lng
      if (s.lng > maxLng) maxLng = s.lng
    }
    const padding = 0.05 // 5% breathing room
    const latDelta = Math.max((maxLat - minLat) * (1 + padding), 0.005)
    const lngDelta = Math.max((maxLng - minLng) * (1 + padding), 0.006)
    const center = new mapkit.Coordinate(
      (minLat + maxLat) / 2,
      (minLng + maxLng) / 2,
    )
    overviewRegion = new mapkit.CoordinateRegion(
      center,
      new mapkit.CoordinateSpan(latDelta, lngDelta),
    )
  }
  else {
    const { lat, lng } = props.config.mapCenter
    const center = new mapkit.Coordinate(lat, lng)
    overviewRegion = new mapkit.CoordinateRegion(
      center,
      new mapkit.CoordinateSpan(0.08, 0.1),
    )
  }

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

  // Tap on the map background (not an annotation) dismisses selection
  map.element.addEventListener('click', (e: MouseEvent) => {
    const target = e.target as HTMLElement
    if (target.closest('[data-map-pin]')) return
    if (selectedSlug.value) {
      selectedSlug.value = null
    }
  })

  addAnnotations()
}

function addAnnotations() {
  if (!map) return
  const annotations = props.spots.map((spot: MapSpot) => {
    const coord = new mapkit.Coordinate(spot.lat, spot.lng)
    return new mapkit.Annotation(coord, () => createAnnotationElement(spot), {
      anchorOffset: new DOMPoint(0, -6),
      calloutEnabled: false,
      size: { width: 100, height: 56 },
      data: { slug: spot.slug },
    })
  })
  map.addAnnotations(annotations)
}


/**
 * Zoom in on a spot, centering the pin in the map.
 */
function zoomToSpot(spot: MapSpot) {
  if (!map) return
  const zoomSpan = new mapkit.CoordinateSpan(0.002, 0.0025)
  const center = new mapkit.Coordinate(spot.lat, spot.lng)
  const zoomRegion = new mapkit.CoordinateRegion(center, zoomSpan)
  map.setRegionAnimated(zoomRegion, true)
}

/**
 * Zoom back out to the overview showing all pins.
 */
function zoomOut() {
  if (!map || !overviewRegion) return
  map.setRegionAnimated(overviewRegion, true)
}

// Re-render annotations and handle zoom when selection changes
watch(selectedSlug, (newSlug) => {
  if (!map) return

  // Re-render annotations to update selected state
  mountedApps.forEach((app) => app.unmount())
  mountedApps.length = 0
  map.removeAnnotations(map.annotations)
  addAnnotations()

  // Zoom behavior
  if (newSlug) {
    const spot = props.spots.find((s) => s.slug === newSlug)
    if (spot) zoomToSpot(spot)
  }
  else {
    zoomOut()
  }
})

// Re-render annotations and re-fit map when spots list changes (e.g. area filter)
watch(() => props.spots, () => {
  if (!map) return

  // Clear selection
  selectedSlug.value = null

  // Unmount existing pin apps
  mountedApps.forEach((app) => app.unmount())
  mountedApps.length = 0
  map.removeAnnotations(map.annotations)

  // Recompute bounding region for new spot set
  if (props.spots.length > 0) {
    let minLat = Infinity, maxLat = -Infinity
    let minLng = Infinity, maxLng = -Infinity
    for (const s of props.spots) {
      if (s.lat < minLat) minLat = s.lat
      if (s.lat > maxLat) maxLat = s.lat
      if (s.lng < minLng) minLng = s.lng
      if (s.lng > maxLng) maxLng = s.lng
    }
    const padding = 0.05
    const latDelta = Math.max((maxLat - minLat) * (1 + padding), 0.005)
    const lngDelta = Math.max((maxLng - minLng) * (1 + padding), 0.006)
    const center = new mapkit.Coordinate(
      (minLat + maxLat) / 2,
      (minLng + maxLng) / 2,
    )
    overviewRegion = new mapkit.CoordinateRegion(
      center,
      new mapkit.CoordinateSpan(latDelta, lngDelta),
    )
  }

  addAnnotations()
  if (overviewRegion) map.setRegionAnimated(overviewRegion, true)
}, { deep: false })

// Watch for color mode changes
const colorMode = useColorMode()
watch(() => colorMode.value, (mode) => {
  if (map) {
    map.colorScheme = mode === 'dark'
      ? mapkit.Map.ColorSchemes.Dark
      : mapkit.Map.ColorSchemes.Light
  }
})

watch(mapkitReady, (ready) => {
  if (ready) nextTick(initMap)
})

onMounted(() => {
  if (mapkitReady.value) initMap()
})

onBeforeUnmount(() => {
  mountedApps.forEach((app) => app.unmount())
  mountedApps.length = 0
  if (map) {
    map.destroy()
    map = null
  }
})



function scrollToSpot(slug: string) {
  selectedSlug.value = slug
  mapContainer.value?.scrollIntoView({ behavior: 'smooth', block: 'start' })
}

defineExpose({ scrollToSpot, selectedSlug })
</script>

<template>
  <div class="map-view-wrapper">
    <!-- Error / missing token state -->
    <div v-if="mapkitError" class="map-view-status">
      <UIcon name="i-lucide-map-off" class="size-10 text-amber-500 mb-3" />
      <h3 class="text-lg font-bold font-display mb-1">Map Unavailable</h3>
      <p class="text-sm text-muted">{{ mapkitError }}</p>
    </div>

    <!-- Loading state -->
    <div v-else-if="!mapkitReady" class="map-view-status">
      <div class="map-view-spinner" />
      <p class="text-sm text-muted mt-3">Loading map…</p>
    </div>

    <!-- Map -->
    <div
      ref="mapContainer"
      class="map-view-canvas"
      :class="{ 'opacity-0': !mapkitReady }"
    />


  </div>
</template>

<style scoped>
.map-view-wrapper {
  position: relative;
  width: 100%;
  height: 50vh;
  min-height: 340px;
  max-height: 560px;
  overflow: hidden;
  border-bottom: 1px solid var(--ui-border);
}

.map-view-canvas {
  width: 100%;
  height: 100%;
  transition: opacity 0.3s ease;
}

.map-view-status {
  position: absolute;
  inset: 0;
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  background: var(--ui-bg);
  text-align: center;
  padding: 2rem;
}

.map-view-spinner {
  width: 32px;
  height: 32px;
  border: 3px solid var(--ui-border);
  border-top-color: var(--ui-text-muted);
  border-radius: 50%;
  animation: map-spin 0.8s linear infinite;
}

@keyframes map-spin {
  to { transform: rotate(360deg); }
}


</style>
