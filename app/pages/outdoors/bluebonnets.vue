<!-- eslint-disable atx/no-fetch-in-component -- SSR page data fetching -->
<script setup lang="ts">
/**
 * Bluebonnet Map — iNaturalist observation data visualization.
 *
 * Renders thousands of Lupinus texensis (Texas Bluebonnet) sightings
 * as circle overlays on an Apple MapKit map. Data sourced from
 * iNaturalist's citizen-science platform.
 */

const { getCategoryBySlug, categories } = useSiteData()
const category = getCategoryBySlug('outdoors')!
const siblings = category.subApps.filter((a) => a.slug !== 'bluebonnets')
const crossLinks = categories.filter((c) => c.slug !== 'outdoors').slice(0, 4)
const { items: breadcrumbs } = useBreadcrumbs()

// ── Year filter ────────────────────────────────────────────
const currentYear = new Date().getFullYear()
const selectedYear = ref<string>(String(currentYear))

const yearOptions = computed(() => {
  const opts = [{ label: 'All Time', value: 'all' }]
  // Recent 5 years
  for (let y = currentYear; y >= currentYear - 4; y--) {
    opts.push({ label: String(y), value: String(y) })
  }
  return opts
})

// ── Fetch observations ─────────────────────────────────────
const apiUrl = computed(() => {
  const base = '/api/bluebonnets/observations'
  return selectedYear.value === 'all' ? base : `${base}?year=${selectedYear.value}`
})

interface ObservationPoint {
  lat: number
  lng: number
  observed_on: string
  photo_url: string | null
  observer: string
  place: string
  url: string
}

const { data, status } = await useFetch<{
  observations: ObservationPoint[]
  total: number
  fetched: number
  yearRange: { min: number; max: number }
}>(apiUrl, { watch: [apiUrl] })

const observations = computed(() => data.value?.observations ?? [])
const totalCount = computed(() => data.value?.total ?? 0)

// ── Selected observation (click-to-view) ───────────────────
const selectedObs = ref<ObservationPoint | null>(null)

function handleMapClick(coords: { lat: number; lng: number }) {
  // Find the nearest observation to the click point
  let best: ObservationPoint | null = null
  let bestDist = Infinity

  for (const obs of observations.value) {
    const dlat = obs.lat - coords.lat
    const dlng = obs.lng - coords.lng
    const dist = dlat * dlat + dlng * dlng
    if (dist < bestDist) {
      bestDist = dist
      best = obs
    }
  }

  // Only select if within a reasonable distance (~0.02 degrees ≈ 2km)
  if (best && bestDist < 0.02 * 0.02) {
    selectedObs.value = best
  } else {
    selectedObs.value = null
  }
}

// ── Circle overlays for the map ────────────────────────────
/* eslint-disable atx/no-inline-hex -- MapKit circle overlay colors */
const circles = computed(() =>
  observations.value.map((obs) => ({
    lat: obs.lat,
    lng: obs.lng,
    radius: 500,
    color: '#6366f1',
    opacity: 0.7,
  })),
)
/* eslint-enable atx/no-inline-hex */

// ── SEO ────────────────────────────────────────────────────
usePageSeo({
  title: 'Bluebonnet Map — Texas Wildflower Sightings Across the State',
  description:
    'Interactive map of Texas bluebonnet (Lupinus texensis) sightings across the Lone Star State, powered by iNaturalist citizen-science data. See where wildflowers are blooming.',
})

useSchemaOrg([
  defineWebPage({
    name: 'Texas Bluebonnet Map',
    description:
      'Interactive map of Texas bluebonnet sightings across the state, powered by iNaturalist citizen-science data.',
  }),
])
</script>

<template>
  <div>
    <!-- Map -->
    <ClientOnly>
      <AppMapKit
        :circles="circles"
        :fallback-center="{ lat: 31.0, lng: -99.5 }"
        :bounding-padding="0.08"
        @map-click="handleMapClick"
      />
      <template #fallback>
        <div class="mapkit-placeholder">
          <div class="text-center">
            <UIcon name="i-lucide-flower-2" class="mb-2 size-10 text-muted" />
            <p class="text-sm text-muted">Loading bluebonnet map…</p>
          </div>
        </div>
      </template>
    </ClientOnly>

    <!-- Selected observation photo card -->
    <div
      v-if="selectedObs"
      class="relative z-10 -mt-2 mx-auto max-w-md px-4"
    >
      <div class="rounded-2xl border border-default bg-elevated shadow-lg overflow-hidden animate-fade-up">
        <button
          class="absolute top-3 right-3 z-10 flex items-center justify-center size-7 rounded-full bg-black/50 text-white hover:bg-black/70 transition-colors"
          @click="selectedObs = null"
        >
          <UIcon name="i-lucide-x" class="size-4" />
        </button>
        <img
          v-if="selectedObs.photo_url"
          :src="selectedObs.photo_url"
          alt="Bluebonnet observation photo"
          class="w-full h-48 sm:h-56 object-cover"
          loading="lazy"
        />
        <div class="p-4">
          <div class="flex items-center gap-2 mb-2">
            <UIcon name="i-lucide-flower-2" class="size-4 text-primary" />
            <span class="text-sm font-semibold">Texas Bluebonnet</span>
          </div>
          <div class="space-y-1 text-xs text-muted">
            <p v-if="selectedObs.place">
              <UIcon name="i-lucide-map-pin" class="inline size-3 mr-1" />
              {{ selectedObs.place }}
            </p>
            <p v-if="selectedObs.observed_on">
              <UIcon name="i-lucide-calendar" class="inline size-3 mr-1" />
              {{ selectedObs.observed_on }}
            </p>
            <p>
              <UIcon name="i-lucide-user" class="inline size-3 mr-1" />
              {{ selectedObs.observer }}
            </p>
          </div>
          <a
            :href="selectedObs.url"
            target="_blank"
            rel="noopener"
            class="mt-3 inline-flex items-center gap-1.5 text-xs font-medium text-primary hover:underline"
          >
            View on iNaturalist
            <UIcon name="i-lucide-external-link" class="size-3" />
          </a>
        </div>
      </div>
    </div>

    <!-- Content below map -->
    <UContainer class="py-8 md:py-12">
      <!-- Breadcrumbs -->
      <UBreadcrumb
        v-if="breadcrumbs.length > 0"
        :items="breadcrumbs"
        class="mb-6"
      />

      <!-- Header -->
      <div class="mb-8 animate-fade-up">
        <div class="flex items-center gap-3 mb-4">
          <div
            class="flex items-center justify-center size-12 rounded-2xl"
            :class="category.bgColor"
          >
            <UIcon name="i-lucide-flower-2" class="size-6" :class="category.color" />
          </div>
          <div class="flex-1 min-w-0">
            <h1 class="text-2xl sm:text-3xl lg:text-4xl font-extrabold tracking-tight font-display">
              Bluebonnet Map
            </h1>
          </div>
        </div>

        <p class="text-base sm:text-lg text-muted max-w-2xl leading-relaxed mb-5">
          Texas bluebonnets (<em>Lupinus texensis</em>) are the state flower
          and bloom across Central Texas every spring. This map shows
          <strong class="text-default">{{ totalCount.toLocaleString() }}</strong>
          citizen-science observations from
          <a
            href="https://www.inaturalist.org"
            target="_blank"
            rel="noopener"
            class="text-primary hover:underline"
          >iNaturalist</a> across the entire state of Texas — tap the year filter to explore seasonal patterns.
        </p>

        <!-- Controls bar -->
        <div class="flex flex-wrap items-center gap-4">
          <!-- Year filter -->
          <div class="flex items-center gap-2 rounded-xl border border-default bg-elevated px-3.5 py-2.5">
            <UIcon name="i-lucide-calendar" class="size-4 shrink-0 text-muted" />
            <USelect
              v-model="selectedYear"
              :items="yearOptions"
              size="sm"
              class="min-w-[120px]"
            />
          </div>

          <!-- Stats -->
          <div class="flex items-center gap-3 text-sm text-muted">
            <div v-if="status === 'pending'" class="flex items-center gap-1.5">
              <div class="size-3 rounded-full bg-primary/40 animate-pulse" />
              <span>Loading…</span>
            </div>
            <template v-else>
              <span>
                <strong class="text-default">{{ observations.length.toLocaleString() }}</strong>
                observations shown
              </span>
              <span class="text-dimmed">·</span>
              <span>{{ totalCount.toLocaleString() }} total</span>
            </template>
          </div>
        </div>
      </div>

      <!-- Peak season info card -->
      <div class="mb-8 rounded-2xl border border-default bg-elevated p-5 animate-fade-up-delay-1">
        <div class="flex items-start gap-3">
          <UIcon name="i-lucide-info" class="size-5 shrink-0 text-primary mt-0.5" />
          <div class="text-sm text-muted leading-relaxed">
            <p class="font-semibold text-default mb-1">Peak Season: March – April</p>
            <p>
              Bluebonnets typically begin appearing in late February and peak in mid-March through April.
              The best spots cluster along roadsides, meadows, and open fields across the
              Hill Country and eastern Travis County. Each dot represents a verified citizen-science
              observation from iNaturalist contributors.
            </p>
          </div>
        </div>
      </div>

      <!-- Related sections -->
      <section v-if="siblings.length" class="mb-8 animate-fade-up-delay-2">
        <h2 class="text-xs font-bold uppercase tracking-widest text-muted mb-4">More in Outdoors</h2>
        <div class="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
          <NuxtLink
            v-for="app in siblings"
            :key="app.slug"
            :to="`/outdoors/${app.slug}/`"
            class="group flex items-center justify-between rounded-xl border border-default bg-default p-4 transition-all duration-200 hover:border-primary/30 hover:shadow-sm"
          >
            <div>
              <h3 class="text-sm font-semibold mb-1">{{ app.title }}</h3>
              <p class="text-xs text-muted line-clamp-1">{{ app.description }}</p>
            </div>
            <div class="flex items-center gap-2 shrink-0 ml-3">
              <UBadge
                :color="app.status === 'live' ? 'success' : 'neutral'"
                variant="subtle"
                size="xs"
                :label="app.status === 'live' ? 'Live' : 'Coming Soon'"
              />
              <UIcon
                name="i-lucide-chevron-right"
                class="size-4 text-dimmed group-hover:text-primary transition-colors"
              />
            </div>
          </NuxtLink>
        </div>
      </section>

      <section class="mb-6 animate-fade-up-delay-3">
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

      <!-- iNaturalist attribution -->
      <div class="mt-8 pt-6 border-t border-default text-xs text-dimmed">
        <p>
          Observation data from
          <a
            href="https://www.inaturalist.org"
            target="_blank"
            rel="noopener"
            class="text-primary hover:underline"
          >iNaturalist</a>.
          Observations are contributed by citizen scientists and may include
          research-grade and needs-identification records for
          <a
            href="https://www.inaturalist.org/taxa/49564-Lupinus-texensis"
            target="_blank"
            rel="noopener"
            class="text-primary hover:underline"
          >Lupinus texensis</a>.
        </p>
      </div>
    </UContainer>
  </div>
</template>
