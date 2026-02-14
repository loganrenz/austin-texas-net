<script setup lang="ts">
import type { WaterBody } from '~/data/water-bodies'

const props = defineProps<{
  spots: WaterBody[]
  selectedSlug?: string | null
}>()

const emit = defineEmits<{
  (e: 'select', slug: string): void
}>()

const runtimeConfig = useRuntimeConfig()
const mapkitJsApiKey = runtimeConfig.public.mapkitJsApiKey

const mapElement = ref<HTMLElement | null>(null)
const mapReady = ref(false)
const loadError = ref('')
const isLocating = ref(false)

let mapInstance: any | null = null
let markerAnnotations: any[] = []
let mapKitLoadPromise: Promise<any> | null = null
let userLocationAnnotation: any = null
const annotationBySlug = new Map<string, any>()

async function loadMapkitJsLibrary() {
  if ((window as any).mapkit?.loadedLibraries?.length) {
    return (window as any).mapkit
  }
  if (mapKitLoadPromise) return mapKitLoadPromise

  mapKitLoadPromise = new Promise((resolve, reject) => {
    const callbackName = `__mapkitReady_${Math.random().toString(36).slice(2)}` as string
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
    script.dataset.libraries = 'full-map,services'
    script.dataset.token = mapkitJsApiKey

    script.onerror = () => {
      delete (window as any)[callbackName]
      reject(new Error('Failed to load Apple MapKit JS'))
    }
    document.head.appendChild(script)
  })

  return mapKitLoadPromise
}

function computeBoundingRegion(spots: WaterBody[]) {
  const mapkit = (window as any).mapkit
  if (!spots.length) {
    return new mapkit.CoordinateRegion(
      new mapkit.Coordinate(30.2672, -97.7431),
      new mapkit.CoordinateSpan(0.12, 0.12)
    )
  }

  let minLat = Infinity
  let maxLat = -Infinity
  let minLng = Infinity
  let maxLng = -Infinity

  for (const spot of spots) {
    minLat = Math.min(minLat, spot.coordinates.lat)
    maxLat = Math.max(maxLat, spot.coordinates.lat)
    minLng = Math.min(minLng, spot.coordinates.lng)
    maxLng = Math.max(maxLng, spot.coordinates.lng)
  }

  const centerLat = (minLat + maxLat) / 2
  const centerLng = (minLng + maxLng) / 2
  const padding = 1.3
  const latSpan = Math.max((maxLat - minLat) * padding, 0.02)
  const lngSpan = Math.max((maxLng - minLng) * padding, 0.02)

  return new mapkit.CoordinateRegion(
    new mapkit.Coordinate(centerLat, centerLng),
    new mapkit.CoordinateSpan(latSpan, lngSpan)
  )
}

function tempColor(temp: number): string {
  if (temp < 60) return '#3B82F6'  // blue — cold
  if (temp < 68) return '#06B6D4'  // cyan — cool
  if (temp <= 75) return '#10B981' // emerald — ideal
  return '#F97316'                 // orange — warm
}

function initializeMap() {
  if (!mapElement.value || !(window as any).mapkit) return

  const mapkit = (window as any).mapkit
  const region = computeBoundingRegion(props.spots)

  mapInstance = new mapkit.Map(mapElement.value, {
    region,
    showsCompass: mapkit.FeatureVisibility.Visible,
    showsMapTypeControl: true,
  })

  mapInstance.addEventListener('select', (event: any) => {
    const slug = event?.annotation?.spotSlug
    if (slug) {
      emit('select', slug)
    }
  })

  mapReady.value = true
  renderAnnotations()
}

function renderAnnotations() {
  if (!mapInstance || !(window as any).mapkit) return

  const mapkit = (window as any).mapkit
  mapInstance.removeAnnotations(markerAnnotations)
  markerAnnotations = []
  annotationBySlug.clear()

  markerAnnotations = props.spots.map((spot) => {
    const isSelected = props.selectedSlug === spot.slug
    const color = tempColor(spot.temp)

    const annotation = new mapkit.MarkerAnnotation(
      new mapkit.Coordinate(spot.coordinates.lat, spot.coordinates.lng),
      {
        title: spot.name,
        subtitle: `${spot.temp}°F`,
        glyphText: spot.isSwimmable ? '🏊' : '🌊',
        color: isSelected ? '#F59E0B' : color,
        displayPriority: isSelected ? 1000 : 500,
        animates: true,
      }
    )

    annotation.spotSlug = spot.slug
    annotationBySlug.set(spot.slug, annotation)
    return annotation
  })

  mapInstance.addAnnotations(markerAnnotations)

  if (props.selectedSlug) {
    const selectedAnnotation = annotationBySlug.get(props.selectedSlug)
    if (selectedAnnotation) {
      mapInstance.selectedAnnotation = selectedAnnotation
    }
  }
}

watch(() => props.selectedSlug, (newSlug) => {
  if (!mapInstance || !newSlug) return
  const annotation = annotationBySlug.get(newSlug)
  if (annotation) {
    mapInstance.selectedAnnotation = annotation
    const mapkit = (window as any).mapkit
    mapInstance.setRegionAnimated(new mapkit.CoordinateRegion(
      annotation.coordinate,
      new mapkit.CoordinateSpan(0.02, 0.02)
    ))
  }
  renderAnnotations()
})

function fitAllMarkers() {
  if (!mapInstance) return
  const region = computeBoundingRegion(props.spots)
  mapInstance.setRegionAnimated(region)
}

function centerOnMe() {
  if (!mapInstance || !(window as any).mapkit || !navigator.geolocation) return

  isLocating.value = true
  navigator.geolocation.getCurrentPosition(
    (position) => {
      const mapkit = (window as any).mapkit
      const { latitude, longitude } = position.coords
      const userCoord = new mapkit.Coordinate(latitude, longitude)

      if (userLocationAnnotation) {
        mapInstance.removeAnnotation(userLocationAnnotation)
      }

      const dotFactory = () => {
        const el = document.createElement('div')
        el.className = 'user-location-dot'
        el.innerHTML = `
          <span class="user-dot-ring"></span>
          <span class="user-dot-ring user-dot-ring--delayed"></span>
          <span class="user-dot-core"></span>
        `
        return el
      }

      userLocationAnnotation = new mapkit.Annotation(userCoord, dotFactory, {
        title: 'You are here',
        anchorOffset: new DOMPoint(0, 0),
        displayPriority: 1100,
        size: { width: 44, height: 44 },
      })
      mapInstance.addAnnotation(userLocationAnnotation)
      mapInstance.setCenterAnimated(userCoord)
      isLocating.value = false
    },
    () => {
      isLocating.value = false
    },
    { enableHighAccuracy: true, timeout: 8000 }
  )
}

onMounted(async () => {
  try {
    await loadMapkitJsLibrary()
    initializeMap()
  } catch (err) {
    loadError.value = 'Failed to load Apple Maps'
    console.error(err)
  }
})

onBeforeUnmount(() => {
  if (mapInstance) {
    mapInstance.removeAnnotations(markerAnnotations)
  }
})
</script>

<template>
  <div class="relative h-[50vh] min-h-[400px] w-full overflow-hidden rounded-b-3xl border-b border-default lg:h-[50vh]">
    <div ref="mapElement" class="h-full w-full bg-muted" />

    <!-- Floating Map Controls -->
    <div class="absolute bottom-6 right-6 flex flex-col gap-2">
      <UButton
        icon="i-lucide-locate"
        color="neutral"
        variant="soft"
        class="bg-default/80 backdrop-blur-md"
        :loading="isLocating"
        @click="centerOnMe"
      />
      <UButton
        icon="i-lucide-maximize"
        color="neutral"
        variant="soft"
        class="bg-default/80 backdrop-blur-md"
        @click="fitAllMarkers"
      />
    </div>

    <!-- Loading Overlay -->
    <div v-if="!mapReady && !loadError" class="absolute inset-0 flex items-center justify-center bg-default/50 backdrop-blur-sm">
      <div class="flex flex-col items-center gap-3">
        <UIcon name="i-lucide-loader-2" class="size-8 animate-spin text-primary" />
        <p class="text-sm font-medium">Loading water spots map...</p>
      </div>
    </div>

    <!-- Error Overlay -->
    <div v-if="loadError" class="absolute inset-0 flex items-center justify-center bg-default/80 backdrop-blur-md">
      <div class="glass-card p-6 text-center">
        <UIcon name="i-lucide-map-pin-off" class="mx-auto mb-2 size-10 text-red-500" />
        <p class="text-sm font-medium">{{ loadError }}</p>
      </div>
    </div>
  </div>
</template>

<style scoped>
.user-location-dot {
  position: relative;
  width: 20px;
  height: 20px;
}
.user-dot-core {
  position: absolute;
  top: 50%;
  left: 50%;
  transform: translate(-50%, -50%);
  width: 12px;
  height: 12px;
  background: #3b82f6;
  border: 2px solid white;
  border-radius: 50%;
  box-shadow: 0 0 10px rgba(59, 130, 246, 0.5);
}
.user-dot-ring {
  position: absolute;
  top: 50%;
  left: 50%;
  transform: translate(-50%, -50%);
  width: 12px;
  height: 12px;
  background: rgba(59, 130, 246, 0.3);
  border-radius: 50%;
  animation: pulse-ring 2s cubic-bezier(0.215, 0.61, 0.355, 1) infinite;
}
.user-dot-ring--delayed {
  animation-delay: 1s;
}

@keyframes pulse-ring {
  0% { transform: translate(-50%, -50%) scale(1); opacity: 0.8; }
  100% { transform: translate(-50%, -50%) scale(4); opacity: 0; }
}
</style>
