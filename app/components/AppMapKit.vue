<script lang="ts">
/* eslint-disable @typescript-eslint/no-explicit-any */
declare const mapkit: any
</script>

<script setup lang="ts" generic="T extends { id: string; lat: number; lng: number }">
/**
 * AppMapKit — Reusable Apple MapKit JS map component.
 *
 * Handles MapKit loading, map initialization, bounding region calculation,
 * pin annotations with selection, zoom behavior, dark mode sync, and cleanup.
 *
 * Consumers provide items and a pin factory function. The component handles
 * all map lifecycle management.
 */

const props = withDefaults(
  defineProps<{
    items: T[]
    createPinElement: (
      item: T,
      isSelected: boolean,
    ) => { element: HTMLElement; cleanup?: () => void }
    annotationSize?: { width: number; height: number }
    zoomSpan?: { lat: number; lng: number }
    boundingPadding?: number
    fallbackCenter?: { lat: number; lng: number }
  }>(),
  {
    annotationSize: () => ({ width: 100, height: 56 }),
    zoomSpan: () => ({ lat: 0.002, lng: 0.0025 }),
    boundingPadding: 0.05,
    fallbackCenter: () => ({ lat: 30.2672, lng: -97.7431 }),
  },
)

const selectedId = defineModel<string | null>('selectedId', { default: null })

const { mapkitReady, mapkitError } = useMapKit()
const mapContainer = ref<HTMLElement | null>(null)

const pinCleanups: Array<() => void> = []
let map: any = null
let overviewRegion: any = null

function computeBoundingRegion(items: T[]): any {
  if (items.length > 0) {
    let minLat = Infinity,
      maxLat = -Infinity
    let minLng = Infinity,
      maxLng = -Infinity
    for (const s of items) {
      if (s.lat < minLat) minLat = s.lat
      if (s.lat > maxLat) maxLat = s.lat
      if (s.lng < minLng) minLng = s.lng
      if (s.lng > maxLng) maxLng = s.lng
    }
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

function initMap() {
  if (!mapContainer.value) return

  overviewRegion = computeBoundingRegion(props.items)

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
}

function clearPinCleanups() {
  for (const fn of pinCleanups) fn()
  pinCleanups.length = 0
}

function addAnnotations() {
  if (!map) return
  const annotations = props.items.map((item) => {
    const coord = new mapkit.Coordinate(item.lat, item.lng)
    return new mapkit.Annotation(
      coord,
      () => {
        const isSelected = selectedId.value === item.id
        const { element, cleanup } = props.createPinElement(item, isSelected)

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
    if (props.items.length > 0) {
      overviewRegion = computeBoundingRegion(props.items)
    }
    addAnnotations()
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
