<script setup lang="ts">
/**
 * HomeExploreGrid — "Explore Austin" section with 4 category cards.
 * Sources from useSiteData(), filtered to Food / Outdoors / Allergies / Real Estate.
 */
const { categories } = useSiteData()

const exploreSlugs = ['food', 'outdoors', 'allergies', 'real-estate']
const exploreCategories = computed(
  () =>
    exploreSlugs
      .map((slug) => categories.find((c) => c.slug === slug))
      .filter(Boolean) as typeof categories,
)

const exploreIcons: Record<string, string> = {
  food: 'i-lucide-utensils-crossed',
  outdoors: 'i-lucide-map-pin',
  allergies: 'i-lucide-flower-2',
  'real-estate': 'i-lucide-landmark',
}

/** Per-category accent colors for visual distinction */
const exploreColors: Record<string, string> = {
  food: 'text-amber-600 dark:text-amber-400',
  outdoors: 'text-emerald-600 dark:text-emerald-400',
  allergies: 'text-rose-600 dark:text-rose-400',
  'real-estate': 'text-sky-600 dark:text-sky-400',
}

/** Subtle icon background tints */
const exploreBg: Record<string, string> = {
  food: 'bg-amber-100 dark:bg-amber-900/30',
  outdoors: 'bg-emerald-100 dark:bg-emerald-900/30',
  allergies: 'bg-rose-100 dark:bg-rose-900/30',
  'real-estate': 'bg-sky-100 dark:bg-sky-900/30',
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
  <section class="py-10">
    <UContainer>
      <h2 class="text-2xl sm:text-3xl font-extrabold tracking-tight font-display mb-6">
        Explore Austin
      </h2>

      <div class="grid grid-cols-2 md:grid-cols-4 gap-4">
        <NuxtLink
          v-for="cat in exploreCategories"
          :key="cat.slug"
          :to="`/${cat.slug}/`"
          class="group flex flex-col rounded-xl border border-default bg-elevated/50 p-5 hover:border-primary/40 hover:shadow-sm transition-all"
        >
          <!-- Category header -->
          <div class="flex items-center gap-2 mb-4">
            <div
              class="flex items-center justify-center size-8 rounded-lg"
              :class="exploreBg[cat.slug]"
            >
              <UIcon
                :name="exploreIcons[cat.slug] || cat.icon"
                class="size-4"
                :class="exploreColors[cat.slug] || cat.color"
              />
            </div>
            <h3
              class="text-sm font-bold tracking-tight"
              :class="exploreColors[cat.slug] || cat.color"
            >
              {{ cat.title }}
            </h3>
          </div>

          <!-- Links -->
          <ul class="space-y-1.5 flex-1">
            <li
              v-for="link in exploreLinkOverrides[cat.slug] || cat.subApps.slice(0, 4)"
              :key="link.slug"
              class="text-sm text-muted group-hover:text-default/70 transition-colors"
            >
              {{ link.title }}
            </li>
          </ul>

          <span
            class="mt-4 text-xs font-medium text-primary opacity-0 group-hover:opacity-100 transition-opacity"
          >
            Explore →
          </span>
        </NuxtLink>
      </div>
    </UContainer>
  </section>
</template>
