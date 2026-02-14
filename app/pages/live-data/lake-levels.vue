<!-- eslint-disable atx/no-fetch-in-component -- SSR page data fetching -->
<script setup lang="ts">
/**
 * /live-data/lake-levels/ — Live Lake Levels
 *
 * Map-based page showing Austin-area reservoir levels from TWDB.
 * Each pin shows the current % full. Tapping a pin opens a detail
 * panel with elevation, capacity, and a historical trend chart.
 */

import { getCategoryHexColor } from '~/utils/categoryHexColors'

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
const siblings = category.subApps.filter((a) => a.slug !== 'lake-levels' && a.status === 'live')
const crossLinks = categories.value.filter((c) => c.slug !== 'live-data').slice(0, 4)
const { items: breadcrumbs } = useBreadcrumbs()

usePageSeo({
  title: 'Austin Lake Levels — Lake Travis, Lake Austin & More',
  description:
    'Live lake levels for Lake Travis, Lake Austin, Lake Buchanan, and area reservoirs. Real-time elevation, percent full, and historical charts.',
  ogImageComponent: 'OgImageSubApp',
  ogImageProps: {
    category: category.title,
    categoryColor: getCategoryHexColor('live-data'),
  },
})

useSchemaOrg([
  defineWebPage({
    name: 'Austin Lake Levels — Real-Time Data',
    description:
      'Live reservoir levels for Austin-area lakes sourced from the Texas Water Development Board.',
  }),
])

// Fetch spots from API
const { data: apiData } = await useFetch<{ spots: LakeSpot[] }>('/api/live/lake-levels')
const spots = computed<LakeSpot[]>(() => apiData.value?.spots || [])

// Selection state
const selectedId = ref<string | null>(null)
const selectedSpot = computed<LakeSpot | null>(
  () => spots.value.find((s) => s.id === selectedId.value) ?? null,
)

// History chart data
const historyDays = ref(30)
const {
  data: historyData,
  status: historyStatus,
  refresh: refreshHistory,
} = await useFetch<{
  data: Array<{ percentFull: number; elevation: number; timestamp: string }>
}>(
  () =>
    `/api/live/lake-levels/history?lake=${selectedId.value || 'Travis'}&days=${historyDays.value}`,
  {
    watch: false,
    immediate: false,
  },
)

watch(selectedId, (id) => {
  if (id) refreshHistory()
})

function onPeriodChange(days: number) {
  historyDays.value = days
  refreshHistory()
}

const chartData = computed(() => {
  const raw = historyData.value?.data || []
  return raw.map((d) => ({
    timestamp: d.timestamp,
    value: d.percentFull ?? d.elevation,
  }))
})

// Pin factory for AppMapKit
function createPinElement(
  spot: LakeSpot,
  isSelected: boolean,
): { element: HTMLElement; cleanup?: () => void } {
  const pct = spot.percentFull != null ? Math.round(spot.percentFull) : null

  /* eslint-disable atx/no-inline-hex -- MapKit pin fill status gradient */
  const fillColor =
    pct != null ? (pct >= 80 ? '#22c55e' : pct >= 50 ? '#f59e0b' : '#ef4444') : '#06b6d4'
  /* eslint-enable atx/no-inline-hex */

  const el = document.createElement('div')
  el.innerHTML = `
    <div style="display:flex;flex-direction:column;align-items:center;gap:2px;width:max-content;${isSelected ? 'z-index:100;' : 'z-index:1;'}">
      <div style="display:flex;align-items:center;justify-content:center;padding:5px 12px;border-radius:20px;background:linear-gradient(145deg,${fillColor},color-mix(in srgb,${fillColor} 60%,#000));color:white;font-size:13px;font-weight:800;font-family:var(--font-display);box-shadow:0 2px 8px ${fillColor}66${isSelected ? `,0 0 0 3px ${fillColor}4d` : ''};transition:transform 0.2s;${isSelected ? 'transform:scale(1.15);' : ''}">${spot.displayValue}</div>
      <span style="font-size:11px;font-weight:700;font-family:var(--font-display);color:#1e293b;text-shadow:0 0 4px white,0 0 4px white,1px 0 3px white,-1px 0 3px white;white-space:nowrap;max-width:120px;overflow:hidden;text-overflow:ellipsis;">${spot.name}</span>
    </div>
  `
  return { element: el }
}

function formatNumber(n: number | null): string {
  if (n == null) return '—'
  return n.toLocaleString()
}

function percentFullColor(pct: number | null): string {
  if (pct == null) return 'text-muted'
  if (pct >= 80) return 'text-green-500'
  if (pct >= 50) return 'text-amber-500'
  return 'text-red-500'
}

function percentFullBg(pct: number | null): string {
  if (pct == null) return 'bg-neutral-400'
  if (pct >= 80) return 'bg-green-500'
  if (pct >= 50) return 'bg-amber-500'
  return 'bg-red-500'
}
</script>

<template>
  <div>
    <!-- Map -->
    <ClientOnly>
      <AppMapKit
        v-model:selected-id="selectedId"
        :items="spots"
        :create-pin-element="createPinElement"
        :bounding-padding="0.15"
        :zoom-span="{ lat: 0.03, lng: 0.035 }"
        :annotation-size="{ width: 130, height: 56 }"
      />
      <template #fallback>
        <div class="mapkit-placeholder">
          <div class="text-center">
            <UIcon name="i-lucide-map" class="size-10 text-muted mb-2" />
            <p class="text-sm text-muted">Loading map…</p>
          </div>
        </div>
      </template>
    </ClientOnly>

    <!-- Content -->
    <UContainer class="py-8 md:py-12">
      <UBreadcrumb
        v-if="breadcrumbs.length > 0 && !selectedSpot"
        :items="breadcrumbs"
        class="mb-6"
      />

      <!-- Header -->
      <div v-if="!selectedSpot" class="mb-8 animate-fade-up">
        <div class="flex items-center gap-3 mb-4">
          <div class="flex items-center justify-center size-12 rounded-2xl bg-primary/10">
            <UIcon name="i-lucide-waves" class="size-6 text-primary" />
          </div>
          <div>
            <h1 class="text-2xl sm:text-3xl lg:text-4xl font-extrabold tracking-tight font-display">
              Lake Levels
            </h1>
          </div>
        </div>
        <p class="text-base sm:text-lg text-muted max-w-2xl leading-relaxed">
          Real-time reservoir levels for Austin-area lakes from the Texas Water Development Board.
          <strong class="text-default">Tap any lake on the map</strong> to see current data and
          trends.
        </p>
      </div>

      <!-- Selected Lake Detail -->
      <section v-if="selectedSpot" class="mb-10 animate-fade-up">
        <UButton
          variant="link"
          color="neutral"
          size="xs"
          icon="i-lucide-arrow-left"
          class="text-xs font-bold uppercase tracking-widest mb-5"
          @click="selectedId = null"
        >
          Back to All Lakes
        </UButton>

        <div
          class="rounded-2xl border border-default bg-default px-6 py-5 shadow-sm dark:shadow-md"
        >
          <div class="flex items-start gap-4 mb-4">
            <div
              class="flex items-center justify-center size-11 rounded-full bg-linear-to-br from-primary to-primary/70 shadow-lg"
            >
              <UIcon name="i-lucide-waves" class="size-5 text-white" />
            </div>
            <div class="flex-1 min-w-0">
              <h2 class="text-xl sm:text-2xl font-extrabold font-display leading-tight mb-1">
                {{ selectedSpot.name }}
              </h2>
              <p class="text-sm text-muted">As of {{ selectedSpot.timestamp }}</p>
            </div>
          </div>

          <!-- Stats grid -->
          <div class="grid grid-cols-2 sm:grid-cols-4 gap-3 mb-5">
            <div
              class="flex flex-col items-center rounded-xl border border-primary/15 bg-primary/5 px-3 py-2.5"
            >
              <span
                class="text-xl font-extrabold font-display"
                :class="percentFullColor(selectedSpot.percentFull)"
              >
                {{
                  selectedSpot.percentFull != null
                    ? `${Math.round(selectedSpot.percentFull)}%`
                    : '—'
                }}
              </span>
              <span
                class="text-[0.65rem] font-semibold uppercase tracking-wider text-muted text-center"
                >Full</span
              >
            </div>
            <div
              class="flex flex-col items-center rounded-xl border border-primary/15 bg-primary/5 px-3 py-2.5"
            >
              <span class="text-xl font-extrabold font-display">{{
                selectedSpot.elevation.toFixed(1)
              }}</span>
              <span
                class="text-[0.65rem] font-semibold uppercase tracking-wider text-muted text-center"
                >Elevation (ft)</span
              >
            </div>
            <div
              class="flex flex-col items-center rounded-xl border border-primary/15 bg-primary/5 px-3 py-2.5"
            >
              <span class="text-xl font-extrabold font-display">{{
                formatNumber(selectedSpot.conservationCapacity)
              }}</span>
              <span
                class="text-[0.65rem] font-semibold uppercase tracking-wider text-muted text-center"
                >Capacity (ac-ft)</span
              >
            </div>
            <div
              class="flex flex-col items-center rounded-xl border border-primary/15 bg-primary/5 px-3 py-2.5"
            >
              <span class="text-xl font-extrabold font-display">{{
                formatNumber(selectedSpot.conservationStorage)
              }}</span>
              <span
                class="text-[0.65rem] font-semibold uppercase tracking-wider text-muted text-center"
                >Storage (ac-ft)</span
              >
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
          <UButton
            v-for="spot in spots"
            :key="spot.id"
            variant="ghost"
            color="neutral"
            class="group flex w-full items-center gap-3 rounded-[14px] border border-default bg-default px-4 py-3.5 transition-all duration-200 hover:-translate-y-px hover:border-primary/40 hover:shadow-sm"
            @click="selectedId = spot.id"
          >
            <div
              class="flex items-center justify-center min-w-[50px] shrink-0 rounded-[10px] border border-primary/15 bg-primary/8 px-2.5 py-1.5 text-sm font-extrabold font-display"
              :class="percentFullColor(spot.percentFull)"
            >
              {{ spot.displayValue }}
            </div>
            <div class="flex-1 min-w-0 text-left">
              <h3 class="text-sm sm:text-base font-bold truncate">{{ spot.name }}</h3>
              <p class="text-xs text-muted">
                Elevation {{ spot.elevation.toFixed(1) }} ft · {{ spot.timestamp }}
              </p>
            </div>
            <!-- Mini fill bar -->
            <div class="w-[60px] h-1.5 shrink-0 rounded-full bg-elevated overflow-hidden">
              <div
                class="h-full rounded-full transition-[width] duration-500"
                :class="percentFullBg(spot.percentFull)"
                :style="{ width: `${Math.min(spot.percentFull || 0, 100)}%` }"
              />
            </div>
            <UIcon
              name="i-lucide-chevron-right"
              class="size-4 text-muted group-hover:text-primary transition-colors shrink-0"
            />
          </UButton>
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
            <UIcon
              name="i-lucide-chevron-right"
              class="size-4 text-dimmed group-hover:text-primary transition-colors"
            />
          </NuxtLink>
        </div>
      </section>

      <!-- Explore More -->
      <section v-if="!selectedSpot" class="mb-6 animate-fade-up-delay-3">
        <h2 class="text-xs font-bold uppercase tracking-widest text-muted mb-4">Explore More</h2>
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
