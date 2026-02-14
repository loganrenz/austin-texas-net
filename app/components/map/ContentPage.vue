<script setup lang="ts">
/**
 * MapContentPage — Full page wrapper for the Map Content Type pattern.
 *
 * Composes MapContentView (map + pins), MapSpotList (ranked list),
 * and MapSpotDetail (expanded detail). This is the single component
 * that each page (breakfast-tacos, BBQ, live-music, etc.) uses.
 *
 * Provides a `#related` slot so each page can add its own
 * "More in Food" / "Explore More" sections.
 *
 * Area filter: fetches the neighborhoods API to build a
 * neighborhood → region lookup, then lets users filter spots by region.
 */
import type { MapSpot, MapPageConfig } from '~/types/mapSpot'

const props = defineProps<{
  config: MapPageConfig
  spots: MapSpot[]
}>()

const { getCategoryBySlug } = useSiteData()
const category = computed(() => getCategoryBySlug(props.config.parentCategory))
const { items: breadcrumbs } = useBreadcrumbs()

const mapView = ref<InstanceType<typeof import('~/components/map/ContentView.vue').default> | null>(null)

// ── Area / Region filter ───────────────────────────────────────
const selectedRegion = ref('')

// Fetch neighborhoods to build neighborhood-name → region lookup
const { data: neighborhoodData } = await useFetch<{ neighborhoods: { name: string; region: string }[] }>('/api/neighborhoods')

const regionLookup = computed<Record<string, string>>(() => {
  const map: Record<string, string> = {}
  for (const n of neighborhoodData.value?.neighborhoods ?? []) {
    map[n.name.toLowerCase()] = n.region ?? ''
  }
  return map
})

/** Resolve a spot's neighborhood string to a region */
function spotRegion(spot: MapSpot): string {
  return regionLookup.value[spot.neighborhood.toLowerCase()] ?? ''
}

/** Regions that actually have spots on this page (keeps the dropdown relevant) */
const availableRegions = computed(() => {
  const set = new Set<string>()
  for (const spot of props.spots) {
    const r = spotRegion(spot)
    if (r) set.add(r)
  }
  return [...set].sort()
})

const regionOptions = computed(() => [
  { label: 'All Areas', value: '' },
  ...availableRegions.value.map((r) => ({ label: r, value: r })),
])

const filteredSpots = computed<MapSpot[]>(() => {
  if (!selectedRegion.value) return props.spots
  return props.spots.filter((s) => spotRegion(s) === selectedRegion.value)
})

// ── Selection state ────────────────────────────────────────────
const selectedSpot = computed<MapSpot | null>(() => {
  const slug = mapView.value?.selectedSlug
  if (!slug) return null
  return filteredSpots.value.find((s) => s.slug === slug) ?? null
})

function selectOnMap(slug: string) {
  mapView.value?.scrollToSpot(slug)
}

function clearSelection() {
  if (mapView.value) {
    mapView.value.selectedSlug = null
  }
}

// Clear detail selection when region changes
watch(selectedRegion, () => clearSelection())
</script>

<template>
  <div>
    <!-- Map — top half -->
    <ClientOnly>
      <MapContentView ref="mapView" :spots="filteredSpots" :config="config" />
      <template #fallback>
        <div class="map-placeholder">
          <div class="text-center">
            <UIcon name="i-lucide-map" class="size-10 text-muted mb-2" />
            <p class="text-sm text-muted">Loading map…</p>
          </div>
        </div>
      </template>
    </ClientOnly>

    <!-- Content — below the map -->
    <UContainer class="py-8 md:py-12">
      <!-- Breadcrumbs -->
      <UBreadcrumb v-if="breadcrumbs.length > 0 && !selectedSpot" :items="breadcrumbs" class="mb-6" />

      <!-- Header (hidden when a spot is selected) -->
      <div v-if="!selectedSpot" class="mb-8 animate-fade-up">
        <div class="flex items-center gap-3 mb-4">
          <div
            v-if="category"
            class="flex items-center justify-center size-12 rounded-2xl"
            :class="category.bgColor"
          >
            <UIcon :name="category.icon" class="size-6" :class="category.color" />
          </div>
          <div class="flex-1 min-w-0">
            <h1 class="text-2xl sm:text-3xl lg:text-4xl font-extrabold tracking-tight font-display">
              {{ config.title }}
            </h1>
          </div>
        </div>

        <p class="text-base sm:text-lg text-muted max-w-2xl leading-relaxed mb-5" v-html="config.introText" />

        <!-- Area filter -->
        <div v-if="regionOptions.length > 2" class="area-filter">
          <UIcon name="i-lucide-map-pin" class="size-4 text-muted shrink-0" />
          <USelect
            v-model="selectedRegion"
            :items="regionOptions"
            size="sm"
            class="area-filter-select"
          />
          <span v-if="selectedRegion" class="text-xs text-muted">
            {{ filteredSpots.length }} of {{ spots.length }} spots
          </span>
        </div>
      </div>

      <!-- Selected Spot Detail (replaces list) -->
      <MapSpotDetail
        v-if="selectedSpot"
        :spot="selectedSpot"
        :config="config"
        @back="clearSelection"
      />

      <!-- Ranked List (default) -->
      <MapSpotList
        v-else
        :spots="filteredSpots"
        :accent-color="config.accentColor"
        :category-icon="config.categoryIcon"
        :pin-color="config.pinColor"
        @select="selectOnMap"
      />

      <!-- Page-specific related sections -->
      <slot name="related" />
    </UContainer>
  </div>
</template>

<style scoped>
.area-filter {
  display: flex;
  align-items: center;
  gap: 8px;
  padding: 10px 14px;
  border-radius: 12px;
  border: 1px solid var(--ui-border);
  background: var(--ui-bg-elevated);
  width: fit-content;
}

.area-filter-select {
  min-width: 140px;
  max-width: 200px;
}

.map-placeholder {
  width: 100%;
  height: 50vh;
  min-height: 360px;
  max-height: 600px;
  display: flex;
  align-items: center;
  justify-content: center;
  background: var(--ui-bg-elevated);
  border-bottom: 1px solid var(--ui-border);
}
</style>
