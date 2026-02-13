<script setup lang="ts">
/**
 * HomeSectionLinks — "Austin, Texas" footer content section with 4 category columns.
 * Sources from useSiteData(), filtered to Food / Events / Real Estate / Culture.
 */
const { categories } = useSiteData()

const footerSlugs = ['food', 'events', 'real-estate', 'culture']
const footerCategories = computed(
  () =>
    footerSlugs
      .map((slug) => categories.find((c) => c.slug === slug))
      .filter(Boolean) as typeof categories,
)

/** Per-category accent colors */
const footerColors: Record<string, string> = {
  food: 'text-amber-600 dark:text-amber-400',
  events: 'text-violet-600 dark:text-violet-400',
  'real-estate': 'text-sky-600 dark:text-sky-400',
  culture: 'text-rose-600 dark:text-rose-400',
}

/** Override link labels to match mock exactly */
const footerLinkOverrides: Record<string, Array<{ title: string; slug: string }>> = {
  food: [
    { title: 'Breakfast Tacos', slug: 'breakfast-tacos' },
    { title: 'Happy Hours', slug: 'happy-hours' },
    { title: 'Barbecue', slug: 'great-hills-restaurants' },
    { title: 'Food Trucks', slug: 'food-trucks' },
  ],
  events: [
    { title: 'Events Calendar', slug: 'live-music' },
    { title: 'Live Music', slug: 'live-music' },
    { title: 'Festivals', slug: 'rodeo-austin' },
    { title: 'Markets', slug: 'chicken-shit-bingo' },
  ],
  'real-estate': [
    { title: 'Home Prices', slug: 'neighborhoods' },
    { title: 'Rent Heatmap', slug: 'rent-heatmap' },
    { title: 'Top Neighborhoods', slug: 'neighborhoods' },
    { title: 'Market Trends', slug: 'rent-heatmap' },
  ],
  culture: [
    { title: 'Live Music Venues', slug: 'street-art' },
    { title: 'Museums', slug: 'street-art' },
    { title: 'Art Galleries', slug: 'street-art' },
    { title: 'Historic Sites', slug: 'haunted-austin' },
  ],
}
</script>

<template>
  <section class="bg-elevated/50 border-t border-default py-12">
    <UContainer>
      <h2 class="text-xl font-extrabold tracking-tight font-display mb-6 text-muted">
        Austin, <span class="italic font-normal">Texas</span>
      </h2>

      <div class="grid grid-cols-2 sm:grid-cols-4 gap-6">
        <div v-for="cat in footerCategories" :key="cat.slug">
          <NuxtLink :to="`/${cat.slug}/`" class="flex items-center gap-1.5 mb-2 group">
            <UIcon :name="cat.icon" class="size-3.5" :class="footerColors[cat.slug] || cat.color" />
            <span
              class="text-xs font-bold uppercase tracking-wider group-hover:underline underline-offset-2 transition-colors"
              :class="footerColors[cat.slug] || cat.color"
            >
              {{ cat.title }}
            </span>
          </NuxtLink>
          <ul class="space-y-1">
            <li
              v-for="link in footerLinkOverrides[cat.slug] || cat.subApps.slice(0, 4)"
              :key="link.slug"
            >
              <NuxtLink
                :to="`/${cat.slug}/${link.slug}/`"
                class="text-sm text-muted hover:text-default transition-colors"
              >
                {{ link.title }}
              </NuxtLink>
            </li>
          </ul>
        </div>
      </div>
    </UContainer>
  </section>
</template>
