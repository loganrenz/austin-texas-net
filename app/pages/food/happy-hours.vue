<!-- eslint-disable atx/no-fetch-in-component -- SSR page data fetching -->
<script setup lang="ts">
import type { MapPageConfig, MapSpot } from '~/types/mapSpot'
import { happyHourSpots as staticSpots } from '~/data/happyHourSpots'

import { getCategoryHexColor } from '~/utils/categoryHexColors'

const { getCategoryBySlug, categories } = useSiteData()
const category = getCategoryBySlug('food')!
const siblings = category.subApps.filter((a) => a.slug !== 'happy-hours')
const crossLinks = categories.filter((c) => c.slug !== 'food').slice(0, 4)

const config: MapPageConfig = {
  title: 'Top 10 Happy Hour Spots',
  description:
    'Find the best happy hours in Austin, TX. Interactive map of the top 10 spots — craft cocktails, $4 pints, and half-off small plates.',
  introText:
    'Austin\'s happy hour scene goes way beyond cheap wells. From craft cocktail bars to brewery patios — <strong class="text-default">tap any pin</strong> to find the best deals in town.',
  parentCategory: 'food',
  parentLabel: '← Food',
  parentPath: '/food/',
  mapCenter: { lat: 30.2672, lng: -97.7431 },
  accentColor: 'violet',
  // eslint-disable-next-line atx/no-inline-hex -- MapKit pin gradient
  pinColor: '#7c3aed',
  categoryIcon: 'i-lucide-wine',
  apiEndpoint: '/api/map-spots?category=happy-hours',
  staticFallback: staticSpots,
}

usePageSeo({
  title: 'Top 10 Happy Hours in Austin — Best Deals, Cocktails & Patios',
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
      category: s.category || 'Happy Hour',
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
