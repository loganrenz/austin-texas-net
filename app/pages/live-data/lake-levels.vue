<script setup lang="ts">
/**
 * /live-data/lake-levels/ — Live Lake Levels
 *
 * Map-based page showing Austin-area reservoir levels from TWDB.
 * Each pin shows the current % full. Tapping a pin opens a detail
 * panel with elevation, capacity, and a historical trend chart.
 */

/* eslint-disable @typescript-eslint/no-explicit-any */
declare const mapkit: any

interface LakeSpot {
  id: string
  name: string
  lat: number
  lng: number
  elevation: number
  percentFull: number | null
  conservationCapacity: number | null
  conservationStorage: number | null
  displayValue: string
  timestamp: string
}

const { getCategoryBySlug, categories } = useSiteData()
const category = getCategoryBySlug('live-data')!
const siblings = category.subApps.filter(a => a.slug !== 'lake-levels' && a.status === 'live')
const crossLinks = categories.filter(c => c.slug !== 'live-data').slice(0, 4)
const { items: breadcrumbs } = useBreadcrumbs()

usePageSeo({
  title: 'Austin Lake Levels — Lake Travis, Lake Austin & More',
  description: 'Live lake levels for Lake Travis, Lake Austin, Lake Buchanan, and area reservoirs. Real-time elevation, percent full, and historical charts.',
})

useSchemaOrg([
  defineWebPage({
    name: 'Austin Lake Levels — Real-Time Data',
    description: 'Live reservoir levels for Austin-area lakes sourced from the Texas Water Development Board.',
  }),
])

// Fetch spots from API
const { data: apiData } = await useFetch<{ spots: LakeSpot[] }>('/api/live/lake-levels')
const spots = computed<LakeSpot[]>(() => apiData.value?.spots || [])

// Map state
const { mapkitReady, mapkitError } = useMapKit()
const mapContainer = ref<HTMLElement | null>(null)
const selectedId = ref<string | null>(null)
const selectedSpot = computed<LakeSpot | null>(() =>
  spots.value.find(s => s.id === selectedId.value) ?? null,
)

// History chart data
const historyDays = ref(30)
const { data: historyData, status: historyStatus, refresh: refreshHistory } = await useFetch<{
  data: Array<{ percentFull: number; elevation: number; timestamp: string }>
}>(() => `/api/live/lake-levels/history?lake=${selectedId.value || 'Travis'}&days=${historyDays.value}`, {
  watch: false,
  immediate: false,
})

watch(selectedId, (id) => {
  if (id) refreshHistory()
})

function onPeriodChange(days: number) {
  historyDays.value = days
  refreshHistory()
}

const chartData = computed(() => {
  const raw = historyData.value?.data || []
  return raw.map(d => ({
    timestamp: d.timestamp,
    value: d.percentFull ?? d.elevation,
  }))
})

// Map logic
let map: any = null
let overviewRegion: any = null

function createPinElement(spot: LakeSpot): HTMLElement {
  const wrapper = document.createElement('div')
  wrapper.setAttribute('data-map-pin', '')

  const isSelected = selectedId.value === spot.id
  const pct = spot.percentFull != null ? Math.round(spot.percentFull) : null
  const fillColor = pct != null
    ? pct >= 80 ? '#22c55e' : pct >= 50 ? '#f59e0b' : '#ef4444'
    : '#06b6d4'

  const pinHtml = `
    <div style="cursor:pointer;display:flex;flex-direction:column;align-items:center;gap:2px;width:max-content;${isSelected ? 'z-index:100;' : 'z-index:1;'}">
      <div style="display:flex;align-items:center;justify-content:center;padding:5px 12px;border-radius:20px;background:linear-gradient(145deg,${fillColor},color-mix(in srgb,${fillColor} 60%,#000));color:white;font-size:13px;font-weight:800;font-family:var(--font-display);box-shadow:0 2px 8px ${fillColor}66${isSelected ? `,0 0 0 3px ${fillColor}4d` : ''};transition:transform 0.2s;${isSelected ? 'transform:scale(1.15);' : ''}">${spot.displayValue}</div>
      <span style="font-size:11px;font-weight:700;font-family:var(--font-display);color:#1e293b;text-shadow:0 0 4px white,0 0 4px white,1px 0 3px white,-1px 0 3px white;white-space:nowrap;max-width:120px;overflow:hidden;text-overflow:ellipsis;">${spot.name}</span>
    </div>
  `
  wrapper.innerHTML = pinHtml
  wrapper.addEventListener('click', (e) => {
    e.stopPropagation()
    selectedId.value = selectedId.value === spot.id ? null : spot.id
  })

  return wrapper
}

function initMap() {
  if (!mapContainer.value || !spots.value.length) return

  let minLat = Infinity, maxLat = -Infinity
  let minLng = Infinity, maxLng = -Infinity
  for (const s of spots.value) {
    if (s.lat < minLat) minLat = s.lat
    if (s.lat > maxLat) maxLat = s.lat
    if (s.lng < minLng) minLng = s.lng
    if (s.lng > maxLng) maxLng = s.lng
  }
  const padding = 0.15
  const latDelta = Math.max((maxLat - minLat) * (1 + padding), 0.05)
  const lngDelta = Math.max((maxLng - minLng) * (1 + padding), 0.06)
  const center = new mapkit.Coordinate((minLat + maxLat) / 2, (minLng + maxLng) / 2)
  overviewRegion = new mapkit.CoordinateRegion(center, new mapkit.CoordinateSpan(latDelta, lngDelta))

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

  map.element.addEventListener('click', (e: MouseEvent) => {
    const target = e.target as HTMLElement
    if (target.closest('[data-map-pin]')) return
    if (selectedId.value) selectedId.value = null
  })

  addAnnotations()
}

function addAnnotations() {
  if (!map) return
  for (const spot of spots.value) {
    const coord = new mapkit.Coordinate(spot.lat, spot.lng)
    const annotation = new mapkit.Annotation(coord, () => createPinElement(spot), {
      anchorOffset: new DOMPoint(0, -6),
      calloutEnabled: false,
      size: { width: 130, height: 56 },
      data: { id: spot.id },
    })
    map.addAnnotation(annotation)
  }
}

function rebuildAnnotations() {
  if (!map) return
  map.removeAnnotations(map.annotations)
  addAnnotations()
}

function zoomToSpot(spot: LakeSpot) {
  if (!map) return
  const zoomSpan = new mapkit.CoordinateSpan(0.03, 0.035)
  const center = new mapkit.Coordinate(spot.lat, spot.lng)
  map.setRegionAnimated(new mapkit.CoordinateRegion(center, zoomSpan), true)
}

function zoomOut() {
  if (!map || !overviewRegion) return
  map.setRegionAnimated(overviewRegion, true)
}

watch(selectedId, (newId) => {
  rebuildAnnotations()
  if (newId) {
    const spot = spots.value.find(s => s.id === newId)
    if (spot) zoomToSpot(spot)
  }
  else {
    zoomOut()
  }
})

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
  if (map) { map.destroy(); map = null }
})

function formatNumber(n: number | null): string {
  if (n == null) return '—'
  return n.toLocaleString()
}
</script>

<template>
  <div>
    <!-- Map -->
    <ClientOnly>
      <div class="map-view-wrapper">
        <div v-if="mapkitError" class="map-view-status">
          <UIcon name="i-lucide-map-off" class="size-10 text-blue-500 mb-3" />
          <h3 class="text-lg font-bold font-display mb-1">Map Unavailable</h3>
          <p class="text-sm text-muted">{{ mapkitError }}</p>
        </div>
        <div v-else-if="!mapkitReady" class="map-view-status">
          <div class="map-view-spinner" />
          <p class="text-sm text-muted mt-3">Loading map…</p>
        </div>
        <div ref="mapContainer" class="map-view-canvas" :class="{ 'opacity-0': !mapkitReady }" />
      </div>
      <template #fallback>
        <div class="map-placeholder">
          <div class="text-center">
            <UIcon name="i-lucide-map" class="size-10 text-muted mb-2" />
            <p class="text-sm text-muted">Loading map…</p>
          </div>
        </div>
      </template>
    </ClientOnly>

    <!-- Content -->
    <UContainer class="py-8 md:py-12">
      <UBreadcrumb v-if="breadcrumbs.length > 0 && !selectedSpot" :items="breadcrumbs" class="mb-6" />

      <!-- Header -->
      <div v-if="!selectedSpot" class="mb-8 animate-fade-up">
        <div class="flex items-center gap-3 mb-4">
          <div class="flex items-center justify-center size-12 rounded-2xl bg-blue-100 dark:bg-blue-900/30">
            <UIcon name="i-lucide-waves" class="size-6 text-blue-600 dark:text-blue-400" />
          </div>
          <div>
            <h1 class="text-2xl sm:text-3xl lg:text-4xl font-extrabold tracking-tight font-display">
              Lake Levels
            </h1>
          </div>
        </div>
        <p class="text-base sm:text-lg text-muted max-w-2xl leading-relaxed">
          Real-time reservoir levels for Austin-area lakes from the Texas Water Development Board.
          <strong class="text-default">Tap any lake on the map</strong> to see current data and trends.
        </p>
      </div>

      <!-- Selected Lake Detail -->
      <section v-if="selectedSpot" class="mb-10 animate-fade-up">
        <button
          class="flex items-center gap-1.5 text-xs font-bold uppercase tracking-widest text-muted mb-5 hover:text-default transition-colors"
          @click="selectedId = null"
        >
          <UIcon name="i-lucide-arrow-left" class="size-3.5" />
          Back to All Lakes
        </button>

        <div class="lake-detail-panel">
          <div class="flex items-start gap-4 mb-4">
            <div class="flex items-center justify-center size-11 rounded-full bg-gradient-to-br from-blue-500 to-blue-700 shadow-lg">
              <UIcon name="i-lucide-waves" class="size-5 text-white" />
            </div>
            <div class="flex-1 min-w-0">
              <h2 class="text-xl sm:text-2xl font-extrabold font-display leading-tight mb-1">
                {{ selectedSpot.name }}
              </h2>
              <p class="text-sm text-muted">
                As of {{ selectedSpot.timestamp }}
              </p>
            </div>
          </div>

          <!-- Stats grid -->
          <div class="grid grid-cols-2 sm:grid-cols-4 gap-3 mb-5">
            <div class="lake-stat-card">
              <span class="lake-stat-value" :class="percentFullClass(selectedSpot.percentFull)">
                {{ selectedSpot.percentFull != null ? `${Math.round(selectedSpot.percentFull)}%` : '—' }}
              </span>
              <span class="lake-stat-label">Full</span>
            </div>
            <div class="lake-stat-card">
              <span class="lake-stat-value">{{ selectedSpot.elevation.toFixed(1) }}</span>
              <span class="lake-stat-label">Elevation (ft)</span>
            </div>
            <div class="lake-stat-card">
              <span class="lake-stat-value">{{ formatNumber(selectedSpot.conservationCapacity) }}</span>
              <span class="lake-stat-label">Capacity (ac-ft)</span>
            </div>
            <div class="lake-stat-card">
              <span class="lake-stat-value">{{ formatNumber(selectedSpot.conservationStorage) }}</span>
              <span class="lake-stat-label">Storage (ac-ft)</span>
            </div>
          </div>

          <UBadge color="info" variant="subtle" size="sm" label="TWDB / LCRA Data" class="mb-6" />

          <!-- Historical Chart -->
          <ClientOnly>
            <LiveDataChart
              :data="chartData"
              title="Level Trend"
              unit="%"
              accent-color="#3b82f6"
              :loading="historyStatus === 'pending'"
              embedded
              @period-change="onPeriodChange"
            />
          </ClientOnly>
        </div>
      </section>

      <!-- Lake List -->
      <section v-else class="mb-10 animate-fade-up-delay-1">
        <h2 class="text-xs font-bold uppercase tracking-widest text-muted mb-5">
          Austin-Area Reservoirs
        </h2>
        <div class="space-y-3">
          <button
            v-for="spot in spots"
            :key="spot.id"
            class="lake-list-item group"
            @click="selectedId = spot.id"
          >
            <div class="lake-list-fill" :class="percentFullClass(spot.percentFull)">
              {{ spot.displayValue }}
            </div>
            <div class="flex-1 min-w-0 text-left">
              <h3 class="text-sm sm:text-base font-bold truncate">{{ spot.name }}</h3>
              <p class="text-xs text-muted">
                Elevation {{ spot.elevation.toFixed(1) }} ft · {{ spot.timestamp }}
              </p>
            </div>
            <!-- Mini fill bar -->
            <div class="lake-fill-bar">
              <div
                class="lake-fill-bar-inner"
                :class="percentFullClass(spot.percentFull)"
                :style="{ width: `${Math.min(spot.percentFull || 0, 100)}%` }"
              />
            </div>
            <UIcon
              name="i-lucide-chevron-right"
              class="size-4 text-muted group-hover:text-blue-500 transition-colors shrink-0"
            />
          </button>
        </div>
      </section>

      <!-- More in Live Data -->
      <section v-if="siblings.length && !selectedSpot" class="mb-8 animate-fade-up-delay-2">
        <h2 class="text-xs font-bold uppercase tracking-widest text-muted mb-4">
          More in Live Data
        </h2>
        <div class="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
          <NuxtLink
            v-for="app in siblings"
            :key="app.slug"
            :to="`/live-data/${app.slug}/`"
            class="group flex items-center justify-between rounded-xl border border-default bg-default p-4 transition-all duration-200 hover:border-primary/30 hover:shadow-sm"
          >
            <div>
              <h3 class="text-sm font-semibold mb-1">{{ app.title }}</h3>
              <p class="text-xs text-muted line-clamp-1">{{ app.description }}</p>
            </div>
            <UIcon name="i-lucide-chevron-right" class="size-4 text-dimmed group-hover:text-primary transition-colors" />
          </NuxtLink>
        </div>
      </section>

      <!-- Explore More -->
      <section v-if="!selectedSpot" class="mb-6 animate-fade-up-delay-3">
        <h2 class="text-xs font-bold uppercase tracking-widest text-muted mb-4">
          Explore More
        </h2>
        <div class="grid grid-cols-2 sm:grid-cols-4 gap-2">
          <NuxtLink
            v-for="c in crossLinks"
            :key="c.slug"
            :to="`/${c.slug}/`"
            class="flex items-center gap-2.5 rounded-xl border border-default bg-default px-4 py-3 transition-all duration-200 hover:border-primary/30"
          >
            <UIcon :name="c.icon" class="size-4" :class="c.color" />
            <span class="text-sm font-medium">{{ c.title }}</span>
          </NuxtLink>
        </div>
      </section>
    </UContainer>
  </div>
</template>

<script lang="ts">
function percentFullClass(pct: number | null): string {
  if (pct == null) return 'fill-unknown'
  if (pct >= 80) return 'fill-good'
  if (pct >= 50) return 'fill-moderate'
  return 'fill-low'
}
</script>

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
@keyframes map-spin { to { transform: rotate(360deg); } }
.map-placeholder {
  width: 100%;
  height: 50vh;
  min-height: 340px;
  max-height: 560px;
  display: flex;
  align-items: center;
  justify-content: center;
  background: var(--ui-bg-elevated);
  border-bottom: 1px solid var(--ui-border);
}

/* Lake detail panel */
.lake-detail-panel {
  padding: 20px 24px;
  border-radius: 16px;
  border: 1px solid var(--ui-border);
  background: var(--ui-bg);
  box-shadow: 0 2px 12px rgba(0, 0, 0, 0.04);
}
:is(.dark) .lake-detail-panel {
  box-shadow: 0 2px 12px rgba(0, 0, 0, 0.2);
}

/* Stat cards */
.lake-stat-card {
  display: flex;
  flex-direction: column;
  align-items: center;
  padding: 10px 12px;
  border-radius: 12px;
  background: rgba(59, 130, 246, 0.05);
  border: 1px solid rgba(59, 130, 246, 0.15);
}
:is(.dark) .lake-stat-card {
  background: rgba(59, 130, 246, 0.06);
  border-color: rgba(59, 130, 246, 0.12);
}
.lake-stat-value {
  font-size: 1.25rem;
  font-weight: 800;
  font-family: var(--font-display);
  color: var(--ui-text);
}
.lake-stat-label {
  font-size: 0.65rem;
  font-weight: 600;
  text-transform: uppercase;
  letter-spacing: 0.06em;
  color: var(--ui-text-muted);
  text-align: center;
}

/* Fill status colors */
.fill-good { color: #22c55e; }
.fill-moderate { color: #f59e0b; }
.fill-low { color: #ef4444; }
.fill-unknown { color: var(--ui-text-muted); }

/* Lake list */
.lake-list-item {
  display: flex;
  align-items: center;
  gap: 12px;
  width: 100%;
  padding: 14px 16px;
  border-radius: 14px;
  border: 1px solid var(--ui-border);
  background: var(--ui-bg);
  transition: all 0.2s ease;
  cursor: pointer;
}
.lake-list-item:hover {
  border-color: rgba(59, 130, 246, 0.4);
  box-shadow: 0 2px 12px rgba(59, 130, 246, 0.08);
  transform: translateY(-1px);
}
:is(.dark) .lake-list-item:hover {
  border-color: rgba(59, 130, 246, 0.3);
  box-shadow: 0 2px 12px rgba(59, 130, 246, 0.12);
}

.lake-list-fill {
  display: flex;
  align-items: center;
  justify-content: center;
  min-width: 50px;
  padding: 6px 10px;
  border-radius: 10px;
  font-size: 14px;
  font-weight: 800;
  font-family: var(--font-display);
  background: rgba(59, 130, 246, 0.08);
  border: 1px solid rgba(59, 130, 246, 0.15);
  shrink: 0;
}

.lake-fill-bar {
  width: 60px;
  height: 6px;
  border-radius: 3px;
  background: var(--ui-bg-elevated);
  overflow: hidden;
  shrink: 0;
}
.lake-fill-bar-inner {
  height: 100%;
  border-radius: 3px;
  transition: width 0.5s ease;
}
.lake-fill-bar-inner.fill-good { background: #22c55e; }
.lake-fill-bar-inner.fill-moderate { background: #f59e0b; }
.lake-fill-bar-inner.fill-low { background: #ef4444; }
</style>
