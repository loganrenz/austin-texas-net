<script setup lang="ts">
/**
 * HomeExploreGrid — "Explore Austin" section with 4 category cards.
 * Sources from useSiteData(), filtered to Food / Outdoors / Allergies / Real Estate.
 */
const { categories } = useSiteData()

const exploreSlugs = ['food', 'outdoors', 'allergies', 'real-estate']
const exploreCategories = computed(() =>
  exploreSlugs
    .map(slug => categories.find(c => c.slug === slug))
    .filter(Boolean) as typeof categories
)

const exploreIcons: Record<string, string> = {
  food: 'i-lucide-utensils-crossed',
  outdoors: 'i-lucide-map-pin',
  allergies: 'i-lucide-flower-2',
  'real-estate': 'i-lucide-landmark',
}

/** Map mock labels to category subApp slugs */
const exploreLinkOverrides: Record<string, Array<{ title: string; slug: string }>> = {
  food: [
    { title: 'Breakfast Tacos', slug: 'breakfast-tacos' },
    { title: 'Happy Hours', slug: 'happy-hours' },
    { title: 'Barbecue', slug: 'great-hills-restaurants' },
    { title: 'Food Trucks', slug: 'food-trucks' },
  ],
  outdoors: [
    { title: 'Hiking Trails', slug: 'disc-golf' },
    { title: 'Swimming Holes', slug: 'water-temps' },
    { title: 'Parks & Gardens', slug: 'bluebonnets' },
    { title: 'Camping Spots', slug: 'kayak-launches' },
  ],
  allergies: [
    { title: 'Pollen Count', slug: 'cedar-pollen' },
    { title: '7 Day Forecast', slug: 'cedar-pollen' },
    { title: 'Allergy Remedies', slug: 'oak-pollen' },
    { title: 'Weather Forecast', slug: 'oak-pollen' },
  ],
  'real-estate': [
    { title: 'Home Prices', slug: 'neighborhoods' },
    { title: 'Rent Heatmap', slug: 'rent-heatmap' },
    { title: 'Top Neighborhoods', slug: 'neighborhoods' },
    { title: 'Market Trends', slug: 'rent-heatmap' },
  ],
}
</script>

<template>
  <section class="mb-10">
    <h2 class="text-2xl sm:text-3xl font-extrabold tracking-tight font-display mb-6 pb-2 border-b border-default">
      Explore Austin
    </h2>

    <div class="grid grid-cols-2 md:grid-cols-4 gap-6 p-6 rounded-2xl border border-default bg-default">
      <div
        v-for="cat in exploreCategories"
        :key="cat.slug"
        class="flex flex-col"
      >
        <!-- Category header -->
        <NuxtLink
          :to="`/${cat.slug}/`"
          class="flex items-center gap-2 mb-3 group"
        >
          <UIcon
            :name="exploreIcons[cat.slug] || cat.icon"
            class="size-4"
            :class="cat.color"
          />
          <h3
            class="text-base font-bold tracking-tight group-hover:text-primary transition-colors"
            :class="cat.color"
          >
            {{ cat.title }}
          </h3>
        </NuxtLink>

        <!-- Links -->
        <ul class="space-y-1">
          <li
            v-for="link in (exploreLinkOverrides[cat.slug] || cat.subApps.slice(0, 4))"
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
