<!-- eslint-disable atx/no-fetch-in-component -- SSR page data fetching -->
<script setup lang="ts">
import type { MapPageConfig, MapSpot } from '~/types/mapSpot'
import { bbqSpots as staticSpots } from '~/data/bbqSpots'

import { getCategoryHexColor } from '~/utils/categoryHexColors'

const { getCategoryBySlug, categories } = useSiteData()
const category = getCategoryBySlug('food')!
const siblings = category.subApps.filter((a) => a.slug !== 'bbq')
const crossLinks = categories.filter((c) => c.slug !== 'food').slice(0, 4)

const config: MapPageConfig = {
  title: 'Top 10 BBQ Joints',
  description:
    "Find the best BBQ in Austin, TX. Interactive map of the top 10 spots — from Franklin's legendary brisket to Valentina's Tex-Mex BBQ fusion.",
  introText:
    'Austin is the barbecue capital of the world. From East Side legends to suburban smokehouses — <strong class="text-default">tap any pin</strong> to explore the best brisket, ribs, and sausage in town.',
  parentCategory: 'food',
  parentLabel: '← Food',
  parentPath: '/food/',
  mapCenter: { lat: 30.2672, lng: -97.7431 },
  accentColor: 'red',
  // eslint-disable-next-line atx/no-inline-hex -- MapKit pin gradient
  pinColor: '#dc2626',
  categoryIcon: 'i-lucide-flame',
  apiEndpoint: '/api/map-spots?category=bbq',
  staticFallback: staticSpots,
}

usePageSeo({
  title: 'Top 10 BBQ in Austin — Best Brisket, Ribs & Smokehouses',
  description: config.description,
  ogImageComponent: 'OgImageSubApp',
  ogImageProps: {
    category: category.title,
    categoryColor: getCategoryHexColor('food'),
  },
})

useSchemaOrg([defineWebPage({ name: config.title, description: config.description })])

const { data: apiData } = await useFetch<{ spots: MapSpot[] }>(config.apiEndpoint!)
const spots = computed<MapSpot[]>(() => {
  const apiSpots = apiData.value?.spots
  if (apiSpots && apiSpots.length > 0) {
    return apiSpots.map((s, i) => ({
      id: s.id,
      rank: s.rank ?? i + 1,
      name: s.name,
      slug: s.id,
      neighborhood: s.neighborhood || '',
      knownFor: s.knownFor || s.category || '',
      category: s.category || 'BBQ',
      description: s.description || '',
      priceRange: s.priceRange || '$$',
      rating: s.rating ?? 0,
      lat: s.lat,
      lng: s.lng,
      address: s.address || '',
    }))
  }
  return config.staticFallback ?? []
})
</script>

<template>
  <MapContentPage :config="config" :spots="spots">
    <template #related>
      <section v-if="siblings.length" class="mb-8 animate-fade-up-delay-2">
        <h2 class="text-xs font-bold uppercase tracking-widest text-muted mb-4">More in Food</h2>
        <div class="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
          <NuxtLink
            v-for="app in siblings"
            :key="app.slug"
            :to="`/food/${app.slug}/`"
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
    </template>
  </MapContentPage>
</template>
