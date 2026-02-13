<script setup lang="ts">
/**
 * HomeSectionLinks — "Austin, Texas" footer content section with 4 category columns.
 * Sources from useSiteData(), filtered to Food / Events / Real Estate / Culture.
 */
const { categories } = useSiteData()

const footerSlugs = ['food', 'events', 'real-estate', 'culture']
const footerCategories = computed(() =>
  footerSlugs
    .map(slug => categories.find(c => c.slug === slug))
    .filter(Boolean) as typeof categories
)

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
  <section class="border-t border-default pt-10 pb-6">
    <h2 class="text-2xl sm:text-3xl font-extrabold tracking-tight font-display mb-6">
      Austin, <span class="italic font-normal text-muted">Texas</span>
    </h2>

    <div class="grid grid-cols-2 sm:grid-cols-4 gap-6">
      <div
        v-for="cat in footerCategories"
        :key="cat.slug"
      >
        <NuxtLink
          :to="`/${cat.slug}/`"
          class="flex items-center gap-1.5 mb-3 group"
        >
          <UIcon
            :name="cat.icon"
            class="size-4"
            :class="cat.color"
          />
          <span
            class="text-sm font-bold group-hover:text-primary transition-colors"
            :class="cat.color"
          >
            {{ cat.title }}
          </span>
        </NuxtLink>
        <ul class="space-y-1">
          <li
            v-for="link in (footerLinkOverrides[cat.slug] || cat.subApps.slice(0, 4))"
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
  </section>
</template>
