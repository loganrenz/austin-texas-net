<!-- eslint-disable atx/no-fetch-in-component -- SSR page data fetching -->
<script setup lang="ts">
/**
 * /real-estate/median-home-prices/ — Median Home Prices by Zip Code
 *
 * Map-based page showing Austin-area median home values from Zillow ZHVI.
 * Each pin shows the current median value for a zip code.
 * List view shows all zips with price, YoY change, and trend.
 */

import { getCategoryHexColor } from '~/utils/categoryHexColors'

interface HomePriceSpot {
  id: string
  name: string
  lat: number
  lng: number
  medianValue: number
  yoyChange: number | null
  period: string
  displayValue: string
}

/**
 * Austin zip code center coordinates for map display.
 * These are approximate centroids of each zip code area.
 */
const ZIP_COORDS: Record<string, { lat: number; lng: number }> = {
  '78701': { lat: 30.2700, lng: -97.7431 },
  '78702': { lat: 30.2621, lng: -97.7208 },
  '78703': { lat: 30.2937, lng: -97.7636 },
  '78704': { lat: 30.2420, lng: -97.7638 },
  '78705': { lat: 30.2906, lng: -97.7417 },
  '78712': { lat: 30.2849, lng: -97.7341 },
  '78717': { lat: 30.4844, lng: -97.7559 },
  '78719': { lat: 30.1560, lng: -97.6879 },
  '78721': { lat: 30.2703, lng: -97.6910 },
  '78722': { lat: 30.2822, lng: -97.7139 },
  '78723': { lat: 30.3078, lng: -97.6905 },
  '78724': { lat: 30.3199, lng: -97.6345 },
  '78725': { lat: 30.2638, lng: -97.6326 },
  '78726': { lat: 30.4330, lng: -97.8303 },
  '78727': { lat: 30.4253, lng: -97.7197 },
  '78728': { lat: 30.4467, lng: -97.6937 },
  '78729': { lat: 30.4564, lng: -97.7676 },
  '78730': { lat: 30.3650, lng: -97.8271 },
  '78731': { lat: 30.3474, lng: -97.7644 },
  '78732': { lat: 30.3780, lng: -97.8888 },
  '78733': { lat: 30.3200, lng: -97.8750 },
  '78734': { lat: 30.3790, lng: -97.9420 },
  '78735': { lat: 30.2650, lng: -97.8460 },
  '78736': { lat: 30.2260, lng: -97.8870 },
  '78737': { lat: 30.1790, lng: -97.8780 },
  '78738': { lat: 30.3150, lng: -97.9330 },
  '78739': { lat: 30.1760, lng: -97.8310 },
  '78741': { lat: 30.2290, lng: -97.7199 },
  '78742': { lat: 30.2380, lng: -97.6730 },
  '78744': { lat: 30.1930, lng: -97.7350 },
  '78745': { lat: 30.2060, lng: -97.7940 },
  '78746': { lat: 30.3100, lng: -97.8050 },
  '78747': { lat: 30.1520, lng: -97.7560 },
  '78748': { lat: 30.1770, lng: -97.8040 },
  '78749': { lat: 30.2300, lng: -97.8530 },
  '78750': { lat: 30.4060, lng: -97.7910 },
  '78751': { lat: 30.3128, lng: -97.7234 },
  '78752': { lat: 30.3300, lng: -97.7100 },
  '78753': { lat: 30.3730, lng: -97.6770 },
  '78754': { lat: 30.3720, lng: -97.6410 },
  '78756': { lat: 30.3230, lng: -97.7390 },
  '78757': { lat: 30.3530, lng: -97.7360 },
  '78758': { lat: 30.3870, lng: -97.7130 },
  '78759': { lat: 30.3990, lng: -97.7590 },
  '78610': { lat: 30.0810, lng: -97.8400 },
  '78613': { lat: 30.5070, lng: -97.8210 },
  '78615': { lat: 30.5600, lng: -97.5500 },
  '78617': { lat: 30.1300, lng: -97.6300 },
  '78620': { lat: 30.1900, lng: -98.0870 },
  '78626': { lat: 30.6330, lng: -97.6770 },
  '78628': { lat: 30.6700, lng: -97.7330 },
  '78633': { lat: 30.7100, lng: -97.7600 },
  '78634': { lat: 30.5570, lng: -97.5470 },
  '78640': { lat: 30.0000, lng: -97.8700 },
  '78641': { lat: 30.5750, lng: -97.8530 },
  '78642': { lat: 30.6570, lng: -97.9070 },
  '78653': { lat: 30.3320, lng: -97.5470 },
  '78660': { lat: 30.4390, lng: -97.6200 },
  '78664': { lat: 30.5360, lng: -97.6620 },
  '78665': { lat: 30.5770, lng: -97.7320 },
  '78666': { lat: 29.8830, lng: -97.9410 },
  '78669': { lat: 30.3180, lng: -97.9420 },
  '78681': { lat: 30.5100, lng: -97.7370 },
}

const { getCategoryBySlug, categories } = useSiteData()
const category = getCategoryBySlug('real-estate')!
const siblings = category.subApps.filter(a => a.slug !== 'median-home-prices' && a.status === 'live')
const crossLinks = categories.filter(c => c.slug !== 'real-estate').slice(0, 4)
const { items: breadcrumbs } = useBreadcrumbs()

usePageSeo({
  title: 'Median Home Prices in Austin by Zip Code — 2025 Data',
  description:
    'Explore median home prices across Austin, TX zip codes. Interactive map with Zillow ZHVI data, year-over-year changes, and neighborhood comparisons.',
  ogImageComponent: 'OgImageSubApp',
  ogImageProps: {
    category: category.title,
    categoryColor: getCategoryHexColor('real-estate'),
  },
})

useSchemaOrg([
  defineWebPage({
    name: 'Austin Median Home Prices by Zip Code',
    description: 'Interactive map of median home values across Austin-area zip codes from Zillow Home Value Index data.',
  }),
])

// Fetch data from API
const { data: apiData } = await useFetch<{ prices: Array<{ zipCode: string; period: string; medianValue: number; yoyChange: number | null }> }>('/api/real-estate/home-prices?latest=true')

const spots = computed<HomePriceSpot[]>(() => {
  const prices = apiData.value?.prices || []
  return prices
    .filter(p => ZIP_COORDS[p.zipCode])
    .map(p => ({
      id: p.zipCode,
      name: `Zip ${p.zipCode}`,
      lat: ZIP_COORDS[p.zipCode]!.lat,
      lng: ZIP_COORDS[p.zipCode]!.lng,
      medianValue: p.medianValue,
      yoyChange: p.yoyChange,
      period: p.period,
      displayValue: `$${Math.round(p.medianValue / 1000)}K`,
    }))
})

// Selection state
const selectedId = ref<string | null>(null)
const selectedSpot = computed<HomePriceSpot | null>(
  () => spots.value.find(s => s.id === selectedId.value) ?? null,
)

// Sort state
const sortBy = ref<'price-high' | 'price-low' | 'yoy-high' | 'yoy-low'>('price-high')
const sortedSpots = computed(() => {
  const list = [...spots.value]
  switch (sortBy.value) {
    case 'price-high': return list.sort((a, b) => b.medianValue - a.medianValue)
    case 'price-low': return list.sort((a, b) => a.medianValue - b.medianValue)
    case 'yoy-high': return list.sort((a, b) => (b.yoyChange ?? 0) - (a.yoyChange ?? 0))
    case 'yoy-low': return list.sort((a, b) => (a.yoyChange ?? 0) - (b.yoyChange ?? 0))
    default: return list
  }
})

// Pin factory for map
function createPinElement(
  spot: HomePriceSpot,
  isSelected: boolean,
): { element: HTMLElement; cleanup?: () => void } {
  const value = spot.medianValue

  /* eslint-disable atx/no-inline-hex -- MapKit pin gradient */
  const fillColor = value >= 800000 ? '#7c3aed' : value >= 500000 ? '#3b82f6' : value >= 300000 ? '#22c55e' : '#f59e0b'
  /* eslint-enable atx/no-inline-hex */

  const el = document.createElement('div')
  el.innerHTML = `
    <div style="display:flex;flex-direction:column;align-items:center;gap:2px;width:max-content;${isSelected ? 'z-index:100;' : 'z-index:1;'}">
      <div style="display:flex;align-items:center;justify-content:center;padding:4px 10px;border-radius:20px;background:linear-gradient(145deg,${fillColor},color-mix(in srgb,${fillColor} 60%,#000));color:white;font-size:12px;font-weight:800;font-family:var(--font-display);box-shadow:0 2px 8px ${fillColor}66${isSelected ? `,0 0 0 3px ${fillColor}4d` : ''};transition:transform 0.2s;${isSelected ? 'transform:scale(1.15);' : ''}">${spot.displayValue}</div>
      <span style="font-size:10px;font-weight:700;font-family:var(--font-display);color:#1e293b;text-shadow:0 0 4px white,0 0 4px white,1px 0 3px white,-1px 0 3px white;white-space:nowrap;">${spot.id}</span>
    </div>
  `
  return { element: el }
}

function formatPrice(n: number): string {
  return `$${n.toLocaleString()}`
}

function formatYoy(change: number | null): string {
  if (change == null) return '—'
  const pct = (change * 100).toFixed(1)
  return change >= 0 ? `+${pct}%` : `${pct}%`
}

function yoyColor(change: number | null): string {
  if (change == null) return 'text-muted'
  return change >= 0 ? 'text-green-500' : 'text-red-500'
}

function priceTierLabel(value: number): string {
  if (value >= 800000) return 'Premium'
  if (value >= 500000) return 'Mid-Range'
  if (value >= 300000) return 'Affordable'
  return 'Entry'
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
        :bounding-padding="0.08"
        :zoom-span="{ lat: 0.03, lng: 0.035 }"
        :annotation-size="{ width: 100, height: 46 }"
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
            <UIcon name="i-lucide-home" class="size-6 text-primary" />
          </div>
          <div>
            <h1 class="text-2xl sm:text-3xl lg:text-4xl font-extrabold tracking-tight font-display">
              Median Home Prices
            </h1>
          </div>
        </div>
        <p class="text-base sm:text-lg text-muted max-w-2xl leading-relaxed">
          Median home values across Austin-area zip codes from the Zillow Home Value Index.
          <strong class="text-default">Tap any pin</strong> to see current value and year-over-year change.
        </p>
      </div>

      <!-- Selected Zip Detail -->
      <section v-if="selectedSpot" class="mb-10 animate-fade-up">
        <UButton
          variant="link"
          color="neutral"
          size="xs"
          icon="i-lucide-arrow-left"
          class="text-xs font-bold uppercase tracking-widest mb-5"
          @click="selectedId = null"
        >
          Back to All Zips
        </UButton>

        <div class="rounded-2xl border border-default bg-default px-6 py-5 shadow-sm dark:shadow-md">
          <div class="flex items-start gap-4 mb-4">
            <div class="flex items-center justify-center size-11 rounded-full bg-linear-to-br from-primary to-primary/70 shadow-lg">
              <UIcon name="i-lucide-home" class="size-5 text-white" />
            </div>
            <div class="flex-1 min-w-0">
              <h2 class="text-xl sm:text-2xl font-extrabold font-display leading-tight mb-1">
                Zip Code {{ selectedSpot.id }}
              </h2>
              <p class="text-sm text-muted">As of {{ selectedSpot.period }} · {{ priceTierLabel(selectedSpot.medianValue) }}</p>
            </div>
          </div>

          <!-- Stats grid -->
          <div class="grid grid-cols-2 gap-3 mb-5">
            <div class="flex flex-col items-center rounded-xl border border-primary/15 bg-primary/5 px-3 py-2.5">
              <span class="text-xl font-extrabold font-display">{{ formatPrice(selectedSpot.medianValue) }}</span>
              <span class="text-[0.65rem] font-semibold uppercase tracking-wider text-muted text-center">Median Home Value</span>
            </div>
            <div class="flex flex-col items-center rounded-xl border border-primary/15 bg-primary/5 px-3 py-2.5">
              <span class="text-xl font-extrabold font-display" :class="yoyColor(selectedSpot.yoyChange)">
                {{ formatYoy(selectedSpot.yoyChange) }}
              </span>
              <span class="text-[0.65rem] font-semibold uppercase tracking-wider text-muted text-center">Year-over-Year</span>
            </div>
          </div>

          <UBadge color="info" variant="subtle" size="sm" label="Zillow ZHVI" class="mb-3" />
        </div>
      </section>

      <!-- Zip Code List -->
      <section v-if="!selectedSpot" class="mb-10 animate-fade-up-delay-1">
        <div class="flex items-center justify-between mb-5">
          <h2 class="text-xs font-bold uppercase tracking-widest text-muted">
            Austin-Area Zip Codes
          </h2>
          <USelect
            v-model="sortBy"
            size="xs"
            :items="[
              { label: 'Price: High → Low', value: 'price-high' },
              { label: 'Price: Low → High', value: 'price-low' },
              { label: 'YoY: High → Low', value: 'yoy-high' },
              { label: 'YoY: Low → High', value: 'yoy-low' },
            ]"
          />
        </div>
        <div class="space-y-3">
          <UButton
            v-for="spot in sortedSpots"
            :key="spot.id"
            variant="ghost"
            color="neutral"
            class="group flex w-full items-center gap-3 rounded-[14px] border border-default bg-default px-4 py-3.5 transition-all duration-200 hover:-translate-y-px hover:border-primary/40 hover:shadow-sm"
            @click="selectedId = spot.id"
          >
            <div
              class="flex items-center justify-center min-w-[70px] shrink-0 rounded-[10px] border border-primary/15 bg-primary/8 px-2.5 py-1.5 text-sm font-extrabold font-display"
            >
              {{ spot.displayValue }}
            </div>
            <div class="flex-1 min-w-0 text-left">
              <h3 class="text-sm sm:text-base font-bold truncate">Zip {{ spot.id }}</h3>
              <p class="text-xs text-muted">
                {{ spot.period }} ·
                <span :class="yoyColor(spot.yoyChange)">{{ formatYoy(spot.yoyChange) }} YoY</span>
              </p>
            </div>
            <UIcon
              name="i-lucide-chevron-right"
              class="size-4 text-muted group-hover:text-primary transition-colors shrink-0"
            />
          </UButton>
        </div>
      </section>

      <!-- More in Real Estate -->
      <section v-if="siblings.length && !selectedSpot" class="mb-8 animate-fade-up-delay-2">
        <h2 class="text-xs font-bold uppercase tracking-widest text-muted mb-4">
          More in Real Estate
        </h2>
        <div class="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
          <NuxtLink
            v-for="app in siblings"
            :key="app.slug"
            :to="`/real-estate/${app.slug}/`"
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
