<!-- eslint-disable atx/no-fetch-in-component -- SSR page data fetching -->
<!-- eslint-disable atx/prefer-ulink -- External attribution links to iNaturalist -->
<script setup lang="ts">
/**
 * Bluebonnet Map — iNaturalist observation data visualization.
 *
 * Renders thousands of Lupinus texensis (Texas Bluebonnet) sightings
 * as bluebonnet flower icon annotations on an Apple MapKit map.
 * Uses MapKit clustering to group nearby sightings at low zoom.
 * Data sourced from iNaturalist's citizen-science platform.
 */

// ── SEO ────────────────────────────────────────────────────
// ── SEO ────────────────────────────────────────────────────
import { getCategoryHexColor } from '~/utils/categoryHexColors'
const { getCategoryBySlug, categories } = useSiteData()
const category = getCategoryBySlug('outdoors')!
const siblings = category.subApps.filter((a) => a.slug !== 'bluebonnets')
const crossLinks = categories.value.filter((c) => c.slug !== 'outdoors').slice(0, 4)
const { items: breadcrumbs } = useBreadcrumbs()

// ── Year filter ────────────────────────────────────────────
const currentYear = new Date().getFullYear()
const selectedYear = ref<string>(String(currentYear))

const yearOptions = computed(() => {
  const opts = [{ label: 'All Time', value: 'all' }]
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
  quality_grade: string
}

const { data, status } = await useFetch<{
  observations: ObservationPoint[]
  total: number
  fetched: number
  yearRange: { min: number; max: number }
}>(apiUrl, { watch: [apiUrl] })

const observations = computed(() => data.value?.observations ?? [])
const totalCount = computed(() => data.value?.total ?? 0)

// ── Map items (pin annotations) ────────────────────────────
interface BluebonnetItem {
  id: string
  lat: number
  lng: number
  quality_grade: string
  has_photo: boolean
}

const mapItems = computed<BluebonnetItem[]>(() =>
  observations.value.map((obs, i) => ({
    id: `bb-${i}`,
    lat: obs.lat,
    lng: obs.lng,
    quality_grade: obs.quality_grade || 'needs_id',
    has_photo: !!obs.photo_url,
  })),
)

// ── Selected observation (click-to-view) ───────────────────
const selectedId = ref<string | null>(null)
const hasEverSelected = ref(false)

const selectedObs = computed<ObservationPoint | null>(() => {
  if (!selectedId.value) return null
  const idx = parseInt(selectedId.value.replace('bb-', ''))
  return observations.value[idx] ?? null
})

watch(selectedId, (id) => {
  if (id) hasEverSelected.value = true
})

// Clear selection when year changes
watch(selectedYear, () => {
  selectedId.value = null
})

// ── Bluebonnet pin factory ─────────────────────────────────

const BLUEBONNET_SVG = `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 32 32" width="28" height="28">
  <g transform="translate(16,14)">
    <ellipse cx="0" cy="-7" rx="3.5" ry="6" fill="#5b5fc7" />
    <ellipse cx="6.5" cy="-2" rx="3.5" ry="6" fill="#6e72d4" transform="rotate(72)" />
    <ellipse cx="4" cy="5.5" rx="3.5" ry="6" fill="#5b5fc7" transform="rotate(144)" />
    <ellipse cx="-4" cy="5.5" rx="3.5" ry="6" fill="#6e72d4" transform="rotate(216)" />
    <ellipse cx="-6.5" cy="-2" rx="3.5" ry="6" fill="#5b5fc7" transform="rotate(288)" />
    <circle cx="0" cy="0" r="3" fill="#f7c948" />
  </g>
  <rect x="14.5" y="22" width="3" height="8" rx="1.5" fill="#3d9a50" />
  <ellipse cx="12" cy="26" rx="4" ry="2" fill="#3d9a50" transform="rotate(-30 12 26)" />
</svg>`

function createBluebonnetPin(
  item: BluebonnetItem,
  _isSelected: boolean,
): { element: HTMLElement; cleanup?: () => void } {
  const wrapper = document.createElement('div')
  wrapper.innerHTML = BLUEBONNET_SVG
  wrapper.style.cursor = 'pointer'

  // Opacity based on quality grade
  if (item.quality_grade === 'research') {
    wrapper.style.opacity = '1'
  } else if (item.has_photo) {
    wrapper.style.opacity = '0.7'
  } else {
    wrapper.style.opacity = '0.45'
  }

  // Subtle drop shadow for depth
  wrapper.style.filter = 'drop-shadow(0 1px 2px rgba(0,0,0,0.25))'

  return { element: wrapper }
}

/** Format ISO date string as human-readable (e.g. "March 15, 2025") */
function formatObsDate(iso: string): string {
  try {
    const d = new Date(iso + 'T00:00:00')
    return d.toLocaleDateString('en-US', { month: 'long', day: 'numeric', year: 'numeric' })
  } catch {
    return iso
  }
}

usePageSeo({
  title: 'Bluebonnet Map — Texas Wildflower Sightings Across the State',
  description:
    'Interactive map of Texas bluebonnet (Lupinus texensis) sightings across the Lone Star State, powered by iNaturalist citizen-science data. See where wildflowers are blooming.',
  ogImageComponent: 'OgImageSubApp',
  ogImageProps: {
    category: category.title,
    categoryColor: getCategoryHexColor('outdoors'),
  },
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
    <!-- Map + hint overlay -->
    <div class="relative">
      <ClientOnly>
        <AppMapKit
          v-model:selected-id="selectedId"
          :items="mapItems"
          :create-pin-element="createBluebonnetPin"
          clustering-identifier="bluebonnets"
          :annotation-size="{ width: 28, height: 28 }"
          :fallback-center="{ lat: 31.0, lng: -99.5 }"
          :bounding-padding="0.3"
          :zoom-span="{ lat: 0.15, lng: 0.2 }"
          preserve-region
          texas-mask
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

      <!-- Interaction hint -->
      <Transition name="fade">
        <div v-if="!hasEverSelected && observations.length > 0" class="hint-chip">
          <UIcon name="i-lucide-mouse-pointer-click" class="size-4" />
          <span>Tap a flower to see the photo</span>
        </div>
      </Transition>
    </div>

    <!-- Content below map -->
    <UContainer class="py-8 md:py-12">
      <!-- Breadcrumbs (hidden when viewing a detail) -->
      <UBreadcrumb
        v-if="breadcrumbs.length > 0 && !selectedObs"
        :items="breadcrumbs"
        class="mb-6"
      />

      <!-- ─── Header + intro (hidden when a sighting is selected) ─── -->
      <div v-if="!selectedObs" class="mb-8 animate-fade-up">
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
          Texas bluebonnets (<em>Lupinus texensis</em>) are the state flower and bloom across
          Central Texas every spring. This map shows
          <strong class="text-default">{{ totalCount.toLocaleString() }}</strong>
          citizen-science observations from
          <a
            href="https://www.inaturalist.org"
            target="_blank"
            rel="noopener"
            class="text-primary hover:underline"
            >iNaturalist</a
          >
          across the entire state of Texas — <strong class="text-default">tap any flower</strong> to
          see the photo.
        </p>

        <!-- Controls bar -->
        <div class="flex flex-wrap items-center gap-4">
          <div
            class="flex items-center gap-2 rounded-xl border border-default bg-elevated px-3.5 py-2.5"
          >
            <UIcon name="i-lucide-calendar" class="size-4 shrink-0 text-muted" />
            <USelect v-model="selectedYear" :items="yearOptions" size="sm" class="min-w-[120px]" />
          </div>

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

      <!-- ─── Selected observation detail (replaces intro) ─── -->
      <section v-if="selectedObs" class="mb-10 animate-fade-up">
        <UButton
          variant="link"
          color="neutral"
          size="sm"
          icon="i-lucide-arrow-left"
          label="Back to Map"
          class="text-xs font-bold uppercase tracking-widest mb-5"
          @click="selectedId = null"
        />

        <div class="spot-detail-panel">
          <!-- Hero photo with gradient -->
          <div v-if="selectedObs.photo_url" class="spot-hero-wrapper">
            <img
              :src="selectedObs.photo_url"
              alt="Bluebonnet observation"
              class="spot-hero-img"
              loading="lazy"
            />
            <div class="spot-hero-gradient" />
          </div>
          <div
            v-else
            class="w-full h-48 rounded-t-2xl bg-elevated flex items-center justify-center"
          >
            <UIcon name="i-lucide-image-off" class="size-10 text-dimmed" />
          </div>

          <div class="spot-detail-body">
            <!-- Title row -->
            <div class="flex items-start gap-4 mb-3">
              <div
                class="flex items-center justify-center size-11 rounded-full shrink-0"
                :class="category.bgColor"
              >
                <UIcon name="i-lucide-flower-2" class="size-5" :class="category.color" />
              </div>
              <div class="min-w-0 flex-1">
                <h2 class="text-xl sm:text-2xl font-extrabold font-display leading-tight">
                  Texas Bluebonnet
                </h2>
                <p
                  v-if="selectedObs.place"
                  class="text-sm text-muted mt-0.5 flex items-center gap-1.5"
                >
                  <UIcon name="i-lucide-map-pin" class="size-3.5 shrink-0" />
                  {{ selectedObs.place }}
                </p>
              </div>
            </div>

            <!-- Meta row -->
            <div class="flex flex-wrap items-center gap-2 mb-5">
              <UBadge
                v-if="selectedObs.observed_on"
                :label="formatObsDate(selectedObs.observed_on)"
                color="neutral"
                variant="subtle"
                size="sm"
                icon="i-lucide-calendar"
              />
              <UBadge
                :label="selectedObs.observer"
                color="neutral"
                variant="subtle"
                size="sm"
                icon="i-lucide-user"
              />
              <UBadge
                label="Lupinus texensis"
                color="success"
                variant="subtle"
                size="sm"
                icon="i-lucide-leaf"
              />
            </div>

            <!-- iNaturalist link -->
            <UButton
              :to="selectedObs.url"
              target="_blank"
              rel="noopener"
              variant="soft"
              color="primary"
              size="sm"
              icon="i-lucide-external-link"
              label="View on iNaturalist"
              trailing
            />
          </div>
        </div>
      </section>

      <!-- ─── Peak season info (only when no selection) ─── -->
      <div
        v-if="!selectedObs"
        class="mb-8 rounded-2xl border border-default bg-elevated p-5 animate-fade-up-delay-1"
      >
        <div class="flex items-start gap-3">
          <UIcon name="i-lucide-info" class="size-5 shrink-0 text-primary mt-0.5" />
          <div class="text-sm text-muted leading-relaxed">
            <p class="font-semibold text-default mb-1">Peak Season: March – April</p>
            <p>
              Bluebonnets typically begin appearing in late February and peak in mid-March through
              April. The best spots cluster along roadsides, meadows, and open fields across the
              Hill Country and eastern Travis County. Each dot represents a verified citizen-science
              observation from iNaturalist contributors.
            </p>
          </div>
        </div>
      </div>

      <!-- Related sections -->
      <section v-if="siblings.length" class="mb-8 animate-fade-up-delay-2">
        <h2 class="text-xs font-bold uppercase tracking-widest text-muted mb-4">
          More in Outdoors
        </h2>
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
            >iNaturalist</a
          >. Observations are contributed by citizen scientists and may include research-grade and
          needs-identification records for
          <a
            href="https://www.inaturalist.org/taxa/49564-Lupinus-texensis"
            target="_blank"
            rel="noopener"
            class="text-primary hover:underline"
            >Lupinus texensis</a
          >.
        </p>
      </div>
    </UContainer>
  </div>
</template>

<!-- eslint-disable atx/no-style-block-layout -->
<style scoped>
.spot-detail-panel {
  border-radius: 16px;
  border: 1px solid var(--ui-border);
  background: var(--ui-bg);
  box-shadow: 0 2px 12px rgba(0, 0, 0, 0.04);
  overflow: hidden;
}

:is(.dark) .spot-detail-panel {
  box-shadow: 0 2px 12px rgba(0, 0, 0, 0.2);
}

.spot-detail-body {
  padding: 20px 24px 24px;
}

.spot-hero-wrapper {
  position: relative;
  width: 100%;
  max-height: 380px;
  overflow: hidden;
}

.spot-hero-img {
  width: 100%;
  max-height: 380px;
  object-fit: cover;
  display: block;
}

.spot-hero-gradient {
  position: absolute;
  bottom: 0;
  left: 0;
  right: 0;
  height: 60px;
  background: linear-gradient(to top, var(--ui-bg), transparent);
  pointer-events: none;
}

/* Floating hint chip */
.hint-chip {
  position: absolute;
  bottom: 18px;
  left: 50%;
  transform: translateX(-50%);
  display: flex;
  align-items: center;
  gap: 6px;
  padding: 6px 14px;
  border-radius: 999px;
  background: rgba(0, 0, 0, 0.65);
  color: #fff;
  font-size: 13px;
  font-weight: 500;
  pointer-events: none;
  z-index: 10;
  backdrop-filter: blur(6px);
  -webkit-backdrop-filter: blur(6px);
}

:is(.dark) .hint-chip {
  background: rgba(255, 255, 255, 0.15);
}

.fade-enter-active,
.fade-leave-active {
  transition: opacity 0.4s ease;
}
.fade-enter-from,
.fade-leave-to {
  opacity: 0;
}
</style>
