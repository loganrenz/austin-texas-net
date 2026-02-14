<!-- eslint-disable atx/no-fetch-in-component -- SSR page data fetching -->
<script setup lang="ts">
import type {
  GeoJSONFeatureCollection,
  GeoJSONFeatureProperties,
  OverlayStyle,
} from '~/components/AppMapKit.vue'

/**
 * neighborhoods/[slug].vue — Individual neighborhood page.
 * Fetches neighborhood data from the API by slug.
 * Data-driven alternative to the static [category]/[slug].vue catch-all.
 */

interface NeighborhoodData {
  id: number
  name: string
  slug: string
  lat: number
  lng: number
  city: string
  region: string
  zipCode: string | null
  description: string | null
  population: number | null
  featured: boolean
}

const route = useRoute()
const slug = computed(() => route.params.slug as string)

const { data, error } = await useFetch<{ neighborhood: NeighborhoodData }>(
  `/api/neighborhoods/${slug.value}`,
)

if (error.value || !data.value?.neighborhood) {
  throw createError({ statusCode: 404, statusMessage: 'Neighborhood not found', fatal: true })
}

const neighborhood = computed(() => data.value!.neighborhood)

const displayName = computed(() => neighborhood.value.name)
const cityLabel = computed(() => {
  const city = neighborhood.value.city
  return city && city !== 'Austin' ? `, ${city}` : ''
})

usePageSeo({
  title: `${displayName.value}${cityLabel.value} — Austin Neighborhood Guide`,
  description:
    neighborhood.value.description ||
    `Explore ${displayName.value}${cityLabel.value} — local dining, activities, real estate, and everything you need to know about this Austin-area neighborhood.`,
})

useSchemaOrg([
  defineWebPage({
    name: `${displayName.value} Neighborhood Guide`,
    description:
      neighborhood.value.description ||
      `Guide to ${displayName.value}${cityLabel.value} — dining, activities, and neighborhood info.`,
  }),
])

const { items: breadcrumbs } = useBreadcrumbs()

// ── GeoJSON boundary data (filtered to this neighborhood) ────
const { data: allGeojson } = await useFetch<GeoJSONFeatureCollection>(
  '/api/neighborhoods/geojson',
  { key: `neighborhood-geojson-${slug.value}` },
)

const neighborhoodGeojson = computed<GeoJSONFeatureCollection | null>(() => {
  if (!allGeojson.value?.features) return null
  const feature = allGeojson.value.features.find((f) => f.properties.slug === slug.value)
  if (!feature) return null
  return { type: 'FeatureCollection', features: [feature] }
})

function overlayStyleFn(_properties: GeoJSONFeatureProperties): OverlayStyle {
  /* eslint-disable atx/no-inline-hex -- MapKit overlay style */
  return {
    strokeColor: '#0d9488',
    strokeOpacity: 0.9,
    fillColor: '#14b8a6',
    fillOpacity: 0.15,
    lineWidth: 2.5,
  }
  /* eslint-enable atx/no-inline-hex */
}

// Fetch sibling neighborhoods in the same region
const { data: regionData } = await useFetch('/api/neighborhoods', {
  query: { region: neighborhood.value.region },
})

const siblings = computed(() =>
  (regionData.value?.neighborhoods ?? [])
    .filter((n: { slug: string }) => n.slug !== slug.value)
    .slice(0, 6),
)

// Cross-category links
const { categories } = useSiteData()
const crossLinks = computed(() => categories.filter((c) => c.slug !== 'neighborhoods').slice(0, 4))
</script>

<template>
  <UContainer>
    <div>
      <!-- Hero -->
      <section class="pt-8 pb-6">
        <UBreadcrumb v-if="breadcrumbs.length > 0" :items="breadcrumbs" class="mb-6" />
        <div class="text-center">
          <!-- Map pin icon -->
          <div
            class="size-20 rounded-3xl inline-flex items-center justify-center mb-6"
            style="
              background: linear-gradient(135deg, var(--color-orange-500), var(--color-orange-700));
            "
          >
            <UIcon name="i-lucide-map-pin" class="size-10 text-white" />
          </div>

          <h1 class="text-3xl sm:text-4xl lg:text-5xl font-extrabold tracking-tight mb-3">
            {{ displayName }}
          </h1>

          <div class="flex items-center justify-center gap-2 mb-4">
            <UBadge
              v-if="neighborhood.city && neighborhood.city !== 'Austin'"
              color="neutral"
              variant="subtle"
              size="md"
              :label="neighborhood.city"
            />
            <UBadge
              v-if="neighborhood.region"
              color="primary"
              variant="subtle"
              size="md"
              :label="neighborhood.region"
            />
            <UBadge
              v-if="neighborhood.zipCode"
              color="neutral"
              variant="outline"
              size="md"
              :label="neighborhood.zipCode"
            />
          </div>

          <p class="text-base sm:text-lg text-muted max-w-xl mx-auto leading-relaxed">
            {{
              neighborhood.description ||
              `Explore ${displayName}${cityLabel} — dining, entertainment, real estate, and local life in this Austin-area neighborhood.`
            }}
          </p>
        </div>
      </section>

      <!-- Neighborhood Boundary Map -->
      <section
        v-if="neighborhoodGeojson"
        class="mb-8 -mx-4 sm:-mx-6 lg:mx-0 lg:rounded-2xl lg:overflow-hidden lg:border lg:border-default"
      >
        <ClientOnly>
          <AppMapKit
            :geojson="neighborhoodGeojson"
            :overlay-style-fn="overlayStyleFn"
            :bounding-padding="0.15"
          />
          <template #fallback>
            <div class="mapkit-placeholder">
              <div class="mapkit-spinner" />
              <p class="text-sm text-muted mt-3">Loading map…</p>
            </div>
          </template>
        </ClientOnly>
      </section>

      <!-- Quick Facts -->
      <section class="rounded-2xl border border-default bg-elevated p-6 sm:p-8 mb-8">
        <h2 class="text-sm font-bold uppercase tracking-widest text-muted mb-5">Quick Facts</h2>
        <div class="grid grid-cols-2 sm:grid-cols-4 gap-4">
          <div class="text-center">
            <p class="text-xs text-dimmed uppercase tracking-wide mb-1">Region</p>
            <p class="text-sm font-semibold">{{ neighborhood.region || '—' }}</p>
          </div>
          <div class="text-center">
            <p class="text-xs text-dimmed uppercase tracking-wide mb-1">City</p>
            <p class="text-sm font-semibold">{{ neighborhood.city || 'Austin' }}</p>
          </div>
          <div class="text-center">
            <p class="text-xs text-dimmed uppercase tracking-wide mb-1">ZIP Code</p>
            <p class="text-sm font-semibold">{{ neighborhood.zipCode || '—' }}</p>
          </div>
          <div class="text-center">
            <p class="text-xs text-dimmed uppercase tracking-wide mb-1">Coordinates</p>
            <p class="text-sm font-semibold">
              {{ neighborhood.lat.toFixed(2) }}°N, {{ Math.abs(neighborhood.lng).toFixed(2) }}°W
            </p>
          </div>
        </div>
      </section>

      <!-- Coming soon placeholder -->
      <section class="rounded-2xl border border-default bg-elevated p-6 sm:p-8 mb-8">
        <h2 class="text-sm font-bold uppercase tracking-widest text-muted mb-4">What's Coming</h2>
        <div class="text-sm text-muted leading-relaxed space-y-3">
          <p>
            We're building <strong class="text-default">{{ displayName }}</strong
            >'s neighborhood guide as part of
            <NuxtLink to="/neighborhoods/" class="text-primary hover:underline"
              >Neighborhoods</NuxtLink
            >
            on Austin-Texas.net — a set of free, fast, locally-focused tools powered by live data.
          </p>
          <p>
            When this page is fully built out, you'll find local dining and drinks, real estate
            trends, things to do, parks and green spaces, and community insights — all specific to
            <strong class="text-default">{{ displayName }}</strong
            >.
          </p>
        </div>
      </section>

      <!-- Sibling neighborhoods in same region -->
      <section v-if="siblings.length" class="mb-8">
        <h2 class="text-xs font-bold uppercase tracking-widest text-muted mb-4">
          More in {{ neighborhood.region }}
        </h2>
        <div class="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
          <NuxtLink
            v-for="n in siblings"
            :key="n.slug"
            :to="`/neighborhoods/${n.slug}/`"
            class="group flex items-center justify-between rounded-xl border border-default bg-elevated p-4 transition-all duration-200 hover:border-accented hover:shadow-sm"
          >
            <div>
              <h3 class="text-sm font-semibold mb-1">{{ n.name }}</h3>
              <p class="text-xs text-muted line-clamp-1">{{ n.city }}</p>
            </div>
            <UIcon
              name="i-lucide-chevron-right"
              class="size-4 text-dimmed group-hover:text-primary transition-colors shrink-0 ml-3"
            />
          </NuxtLink>
        </div>
      </section>

      <!-- Back to all neighborhoods -->
      <section class="mb-8">
        <UButton
          to="/neighborhoods/"
          variant="outline"
          color="neutral"
          size="lg"
          label="View all neighborhoods"
          icon="i-lucide-arrow-left"
        />
      </section>

      <!-- Cross-links -->
      <section class="mb-6">
        <h2 class="text-xs font-bold uppercase tracking-widest text-muted mb-4">Explore More</h2>
        <div class="grid grid-cols-2 sm:grid-cols-4 gap-2">
          <NuxtLink
            v-for="c in crossLinks"
            :key="c.slug"
            :to="`/${c.slug}/`"
            class="flex items-center gap-2.5 rounded-xl border border-default bg-elevated px-4 py-3 transition-all duration-200 hover:border-accented"
          >
            <UIcon :name="c.icon" class="size-4" :class="c.color" />
            <span class="text-sm font-medium">{{ c.title }}</span>
          </NuxtLink>
        </div>
      </section>
    </div>
  </UContainer>
</template>
