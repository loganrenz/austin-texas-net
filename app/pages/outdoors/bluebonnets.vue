<!-- eslint-disable atx/no-fetch-in-component -- SSR page data fetching -->
<!-- eslint-disable atx/prefer-ulink -- External attribution links to iNaturalist -->
<script setup lang="ts">
definePageMeta({ layout: 'fullscreen' })
/**
 * Bluebonnet Map — iNaturalist observation data visualization.
 *
 * Renders thousands of Lupinus texensis (Texas Bluebonnet) sightings
 * as bluebonnet flower icon annotations on an Apple MapKit map.
 * Uses MapKit clustering to group nearby sightings at low zoom.
 * Data sourced from iNaturalist's citizen-science platform.
 */

// ── SEO ────────────────────────────────────────────────────
// eslint-disable-next-line import/first -- definePageMeta must be at top per Nuxt convention
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

// ── Bluebonnet cluster factory ──────────────────────────────
// Small flower SVG for cluster bouquet (no stem, just the bloom)
const CLUSTER_FLOWER = `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" width="100%" height="100%">
  <g transform="translate(12,12)">
    <ellipse cx="0" cy="-5" rx="2.8" ry="4.8" fill="#5b5fc7"/>
    <ellipse cx="5" cy="-1.5" rx="2.8" ry="4.8" fill="#6e72d4" transform="rotate(72)"/>
    <ellipse cx="3" cy="4.5" rx="2.8" ry="4.8" fill="#5b5fc7" transform="rotate(144)"/>
    <ellipse cx="-3" cy="4.5" rx="2.8" ry="4.8" fill="#6e72d4" transform="rotate(216)"/>
    <ellipse cx="-5" cy="-1.5" rx="2.8" ry="4.8" fill="#5b5fc7" transform="rotate(288)"/>
    <circle cx="0" cy="0" r="2.2" fill="#f7c948"/>
  </g>
</svg>`

// Bouquet layout positions (offset x, y from center in px) for each flower size tier
const BOUQUET_POSITIONS = [
  // 3 flowers: small clusters
  [
    { x: 0, y: -8 },
    { x: -7, y: 5 },
    { x: 7, y: 5 },
  ],
  // 5 flowers: medium/large clusters
  [
    { x: 0, y: -10 },
    { x: -9, y: -2 },
    { x: 9, y: -2 },
    { x: -5, y: 8 },
    { x: 5, y: 8 },
  ],
]

function createBluebonnetCluster(
  _cluster: { memberAnnotations: unknown[]; coordinate: unknown },
  count: number,
): HTMLElement {
  const el = document.createElement('div')
  el.style.cssText = 'position:relative;display:flex;align-items:center;justify-content:center;'

  // Choose layout tier based on count
  const positions =
    (count > 15 ? BOUQUET_POSITIONS[1] : BOUQUET_POSITIONS[0]) ?? BOUQUET_POSITIONS[0]!
  const flowerSize = count > 15 ? 20 : 18
  const wrapperSize = count > 15 ? 52 : 44

  // Build bouquet of flowers
  let flowersHtml = ''
  for (const pos of positions) {
    flowersHtml += `<div style="
      position:absolute;
      width:${flowerSize}px;height:${flowerSize}px;
      left:50%;top:50%;
      transform:translate(calc(-50% + ${pos.x}px), calc(-50% + ${pos.y}px));
      filter:drop-shadow(0 1px 2px rgba(0,0,0,0.2));
    ">${CLUSTER_FLOWER}</div>`
  }

  // Count badge
  const badgeSize = count > 99 ? 22 : 18
  const fontSize = count > 99 ? 9 : 10
  flowersHtml += `<div style="
    position:absolute;bottom:-4px;right:-4px;
    min-width:${badgeSize}px;height:${badgeSize}px;padding:0 4px;
    border-radius:${badgeSize}px;
    background:linear-gradient(145deg,#4a4eae,#3b3f99);
    box-shadow:0 1px 4px rgba(0,0,0,0.3),0 0 0 2px white;
    display:flex;align-items:center;justify-content:center;
    font-size:${fontSize}px;font-weight:800;font-family:var(--font-display);
    color:white;line-height:1;
  ">${count}</div>`

  el.innerHTML = `<div style="
    position:relative;width:${wrapperSize}px;height:${wrapperSize}px;
    transition:transform 0.2s ease;cursor:pointer;
  " onmouseover="this.style.transform='scale(1.15)'" onmouseout="this.style.transform='scale(1)'">${flowersHtml}</div>`

  return el
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
  <div class="bb-shell">
    <!-- ─── Top nav bar ─── -->
    <!-- eslint-disable-next-line atx/no-native-layout -- custom app-level topbar, not a content layout element -->
    <header class="bb-topbar">
      <div class="bb-topbar-left">
        <div class="bb-topbar-brand-row">
          <NuxtLink to="/" class="bb-topbar-brand"> Austin-Texas.net </NuxtLink>
          <span class="bb-topbar-sep">/</span>
          <span class="bb-topbar-title">Bluebonnet Sightings Map</span>
        </div>
        <UBreadcrumb v-if="breadcrumbs.length > 0" :items="breadcrumbs" class="bb-topbar-crumbs" />
      </div>
      <div class="bb-topbar-right">
        <UColorModeButton size="xs" />
      </div>
    </header>

    <!-- ─── Main content area: side-by-side (desktop) or stacked (mobile) ─── -->
    <div class="bb-layout">
      <!-- ─── Left info panel (desktop) / below-map content (mobile) ─── -->
      <aside class="bb-panel">
        <!-- ─── Header + intro (hidden when a sighting is selected) ─── -->
        <div v-if="!selectedObs" class="animate-fade-up">
          <div class="flex items-center gap-3 mb-3">
            <div
              class="flex items-center justify-center size-10 rounded-xl"
              :class="category.bgColor"
            >
              <UIcon name="i-lucide-flower-2" class="size-5" :class="category.color" />
            </div>
            <h1 class="text-xl sm:text-2xl lg:text-2xl font-extrabold tracking-tight font-display">
              Bluebonnet Map
            </h1>
          </div>

          <p class="text-sm text-muted leading-relaxed mb-4">
            Texas bluebonnets (<em>Lupinus texensis</em>) bloom across Central Texas every spring.
            This map shows
            <strong class="text-default">{{ totalCount.toLocaleString() }}</strong>
            citizen-science observations from
            <a
              href="https://www.inaturalist.org"
              target="_blank"
              rel="noopener"
              class="text-primary hover:underline"
              >iNaturalist</a
            >
            — <strong class="text-default">tap any flower</strong> to see the photo.
          </p>

          <!-- Controls bar -->
          <div class="flex flex-wrap items-center gap-3 mb-4">
            <div
              class="flex items-center gap-2 rounded-xl border border-default bg-elevated px-3 py-2"
            >
              <UIcon name="i-lucide-calendar" class="size-4 shrink-0 text-muted" />
              <USelect
                v-model="selectedYear"
                :items="yearOptions"
                size="sm"
                class="min-w-[110px]"
              />
            </div>

            <div class="flex items-center gap-2 text-xs text-muted">
              <div v-if="status === 'pending'" class="flex items-center gap-1.5">
                <div class="size-2.5 rounded-full bg-primary/40 animate-pulse" />
                <span>Loading…</span>
              </div>
              <template v-else>
                <span>
                  <strong class="text-default">{{ observations.length.toLocaleString() }}</strong>
                  shown
                </span>
                <span class="text-dimmed">·</span>
                <span>{{ totalCount.toLocaleString() }} total</span>
              </template>
            </div>
          </div>

          <!-- Peak season info -->
          <div class="rounded-xl border border-default bg-elevated p-4 mb-4">
            <div class="flex items-start gap-2.5">
              <UIcon name="i-lucide-info" class="size-4 shrink-0 text-primary mt-0.5" />
              <div class="text-xs text-muted leading-relaxed">
                <p class="font-semibold text-default mb-1">Peak Season: March – April</p>
                <p>
                  Bluebonnets typically begin appearing in late February and peak in mid-March
                  through April. The best spots cluster along roadsides, meadows, and open fields
                  across the Hill Country.
                </p>
              </div>
            </div>
          </div>
        </div>

        <!-- ─── Selected observation detail ─── -->
        <section v-if="selectedObs" class="animate-fade-up">
          <UButton
            variant="link"
            color="neutral"
            size="sm"
            icon="i-lucide-arrow-left"
            label="Back to Map"
            class="text-xs font-bold uppercase tracking-widest mb-4"
            @click="selectedId = null"
          />

          <div class="spot-detail-panel">
            <!-- Hero photo -->
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
              class="w-full h-36 rounded-t-2xl bg-elevated flex items-center justify-center"
            >
              <UIcon name="i-lucide-image-off" class="size-10 text-dimmed" />
            </div>

            <div class="spot-detail-body">
              <div class="flex items-start gap-3 mb-3">
                <div
                  class="flex items-center justify-center size-9 rounded-full shrink-0"
                  :class="category.bgColor"
                >
                  <UIcon name="i-lucide-flower-2" class="size-4" :class="category.color" />
                </div>
                <div class="min-w-0 flex-1">
                  <h2 class="text-lg font-extrabold font-display leading-tight">
                    Texas Bluebonnet
                  </h2>
                  <p
                    v-if="selectedObs.place"
                    class="text-xs text-muted mt-0.5 flex items-center gap-1"
                  >
                    <UIcon name="i-lucide-map-pin" class="size-3 shrink-0" />
                    {{ selectedObs.place }}
                  </p>
                </div>
              </div>

              <!-- Meta row -->
              <div class="flex flex-wrap items-center gap-1.5 mb-4">
                <UBadge
                  v-if="selectedObs.observed_on"
                  :label="formatObsDate(selectedObs.observed_on)"
                  color="neutral"
                  variant="subtle"
                  size="xs"
                  icon="i-lucide-calendar"
                />
                <UBadge
                  :label="selectedObs.observer"
                  color="neutral"
                  variant="subtle"
                  size="xs"
                  icon="i-lucide-user"
                />
                <UBadge
                  label="Lupinus texensis"
                  color="success"
                  variant="subtle"
                  size="xs"
                  icon="i-lucide-leaf"
                />
              </div>

              <UButton
                :to="selectedObs.url"
                target="_blank"
                rel="noopener"
                variant="soft"
                color="primary"
                size="xs"
                icon="i-lucide-external-link"
                label="View on iNaturalist"
                trailing
              />
            </div>
          </div>
        </section>

        <!-- ─── Bottom links (visible when no selection) ─── -->
        <div v-if="!selectedObs" class="mt-auto pt-4">
          <!-- Related sections -->
          <section v-if="siblings.length" class="mb-4">
            <h2 class="text-xs font-bold uppercase tracking-widest text-muted mb-2">
              More in Outdoors
            </h2>
            <div class="space-y-1.5">
              <NuxtLink
                v-for="app in siblings"
                :key="app.slug"
                :to="`/outdoors/${app.slug}/`"
                class="group flex items-center justify-between rounded-lg border border-default bg-default px-3 py-2 transition-all duration-200 hover:border-primary/30"
              >
                <div class="min-w-0">
                  <h3 class="text-xs font-semibold">{{ app.title }}</h3>
                  <p class="text-[11px] text-muted truncate">{{ app.description }}</p>
                </div>
                <div class="flex items-center gap-1.5 shrink-0 ml-2">
                  <UBadge
                    :color="app.status === 'live' ? 'success' : 'neutral'"
                    variant="subtle"
                    size="xs"
                    :label="app.status === 'live' ? 'Live' : 'Soon'"
                  />
                  <UIcon
                    name="i-lucide-chevron-right"
                    class="size-3.5 text-dimmed group-hover:text-primary transition-colors"
                  />
                </div>
              </NuxtLink>
            </div>
          </section>

          <section class="mb-4">
            <h2 class="text-xs font-bold uppercase tracking-widest text-muted mb-2">
              Explore More
            </h2>
            <div class="grid grid-cols-2 gap-1.5">
              <NuxtLink
                v-for="c in crossLinks"
                :key="c.slug"
                :to="`/${c.slug}/`"
                class="flex items-center gap-2 rounded-lg border border-default bg-default px-3 py-2 transition-all duration-200 hover:border-primary/30"
              >
                <UIcon :name="c.icon" class="size-3.5" :class="c.color" />
                <span class="text-xs font-medium">{{ c.title }}</span>
              </NuxtLink>
            </div>
          </section>

          <!-- iNaturalist attribution -->
          <div class="pt-3 border-t border-default text-[11px] text-dimmed leading-relaxed">
            Data from
            <a
              href="https://www.inaturalist.org"
              target="_blank"
              rel="noopener"
              class="text-primary hover:underline"
              >iNaturalist</a
            >. Observations contributed by citizen scientists for
            <a
              href="https://www.inaturalist.org/taxa/49564-Lupinus-texensis"
              target="_blank"
              rel="noopener"
              class="text-primary hover:underline"
              >Lupinus texensis</a
            >.
          </div>
        </div>
      </aside>

      <!-- ─── Map fills remaining space ─── -->
      <div class="bb-map">
        <ClientOnly>
          <AppMapKit
            v-model:selected-id="selectedId"
            :items="mapItems"
            :create-pin-element="createBluebonnetPin"
            :create-cluster-element="createBluebonnetCluster"
            clustering-identifier="bluebonnets"
            :annotation-size="{ width: 28, height: 28 }"
            :fallback-center="{ lat: 31.4, lng: -99.3 }"
            :bounding-padding="1.2"
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
    </div>
  </div>
</template>

<!-- eslint-disable atx/no-style-block-layout -->
<style scoped>
/* ── Shell ──────────────────────────────────────────────────── */
.bb-shell {
  display: flex;
  flex-direction: column;
  height: 100dvh;
  overflow: hidden;
}

/* ── Top navbar ──────────────────────────────────────────────── */
.bb-topbar {
  display: flex;
  align-items: flex-start;
  justify-content: space-between;
  padding: 0.625rem 1rem;
  border-bottom: 1px solid var(--ui-border);
  background: var(--ui-bg);
  flex-shrink: 0;
  z-index: 20;
}

.bb-topbar-left {
  display: flex;
  flex-direction: column;
  gap: 0.125rem;
  min-width: 0;
}

.bb-topbar-brand-row {
  display: flex;
  align-items: center;
  gap: 0.5rem;
}

.bb-topbar-brand {
  font-family: var(--font-display);
  font-weight: 800;
  font-size: 0.875rem;
  color: var(--ui-text);
  text-decoration: none;
  white-space: nowrap;
}

.bb-topbar-brand:hover {
  color: var(--ui-primary);
}

.bb-topbar-sep {
  color: var(--ui-text-dimmed);
  font-size: 0.875rem;
}

.bb-topbar-title {
  font-size: 0.8125rem;
  font-weight: 600;
  color: var(--ui-text-muted);
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
}

.bb-topbar-crumbs {
  font-size: 0.75rem;
}

.bb-topbar-right {
  display: flex;
  align-items: center;
  gap: 0.75rem;
  padding-top: 0.125rem;
}

/* ── Layout ─────────────────────────────────────────────────── */
.bb-layout {
  display: flex;
  flex-direction: column;
  flex: 1;
  min-height: 0;
  overflow: hidden;
}

@media (min-width: 1024px) {
  .bb-layout {
    flex-direction: row;
  }
}

/* ── Left panel ──────────────────────────────────────────────── */
.bb-panel {
  padding: 1.25rem 1.25rem 1rem;
  display: flex;
  flex-direction: column;
}

@media (min-width: 1024px) {
  .bb-panel {
    width: 400px;
    min-width: 360px;
    max-width: 420px;
    overflow-y: auto;
    border-right: 1px solid var(--ui-border);
    padding: 1.5rem;
  }
}

/* ── Map area ────────────────────────────────────────────────── */
.bb-map {
  position: relative;
}

@media (min-width: 1024px) {
  .bb-map {
    flex: 1;
    min-width: 0;
  }

  /* Override AppMapKit height constraints for full-viewport mode */
  .bb-map :deep(.mapkit-wrapper) {
    height: 100%;
    max-height: none;
    min-height: 100%;
    border-bottom: none;
  }

  .bb-map :deep(.mapkit-canvas) {
    height: 100%;
  }
}

/* ── Spot detail panel ──────────────────────────────────────── */
.spot-detail-panel {
  border-radius: 12px;
  border: 1px solid var(--ui-border);
  background: var(--ui-bg);
  box-shadow: 0 2px 12px rgba(0, 0, 0, 0.04);
  overflow: hidden;
}

:is(.dark) .spot-detail-panel {
  box-shadow: 0 2px 12px rgba(0, 0, 0, 0.2);
}

.spot-detail-body {
  padding: 16px 20px 20px;
}

.spot-hero-wrapper {
  position: relative;
  width: 100%;
  max-height: 260px;
  overflow: hidden;
}

.spot-hero-img {
  width: 100%;
  max-height: 260px;
  object-fit: cover;
  display: block;
}

.spot-hero-gradient {
  position: absolute;
  bottom: 0;
  left: 0;
  right: 0;
  height: 50px;
  background: linear-gradient(to top, var(--ui-bg), transparent);
  pointer-events: none;
}

/* ── Floating hint chip ─────────────────────────────────────── */
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
