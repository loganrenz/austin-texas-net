<script setup lang="ts">
/**
 * Homepage — Austin, Texas — Live Local Intelligence
 * Matches the editorial mock: hero → live strip → explore section → quick-links → footer content.
 */
usePageSeo({
  title: 'Austin, Texas — Live Local Intelligence',
  description: 'Real-time pollen, water temps, events, and where to go in Austin, Texas.',
})

useSchemaOrg([
  defineWebPage({
    name: 'Austin, Texas — Live Local Intelligence',
    description: 'Real-time pollen, water temps, events, and where to go in Austin, Texas.',
  }),
])

const { categories } = useSiteData()

// Quick-link chips — popular tool pages
const quickLinks = [
  { label: 'Breakfast Tacos', to: '/food/breakfast-tacos/' },
  { label: 'Happy Hours', to: '/food/happy-hours/' },
  { label: 'Water Temps', to: '/outdoors/water-temps/' },
  { label: 'Bluebonnets', to: '/outdoors/bluebonnets/' },
  { label: 'Rent Heatmap', to: '/real-estate/rent-heatmap/' },
  { label: 'Culture', to: '/culture/' },
]

// Footer category columns — 4 selected categories for the bottom section
const footerCategories = computed(() =>
  categories
    .filter(c => ['food', 'events', 'real-estate', 'culture'].includes(c.slug))
)
</script>

<template>
  <div>
    <!-- Hero -->
    <section class="text-center py-12 sm:py-16">
      <h1 class="text-4xl sm:text-5xl lg:text-6xl font-extrabold tracking-tight font-display leading-tight mb-4">
        Austin, Texas — Live Local Intelligence
      </h1>
      <p class="text-lg text-muted max-w-xl mx-auto leading-relaxed">
        Real-time pollen, water temps, events, and where to go.
      </p>
    </section>

    <!-- Live Strip -->
    <LiveStrip />

    <!-- Explore Austin -->
    <CategorySection />

    <!-- Quick-link chips -->
    <section class="mb-10">
      <div class="flex flex-wrap gap-2">
        <UButton
          v-for="link in quickLinks"
          :key="link.to"
          :to="link.to"
          variant="outline"
          color="neutral"
          size="sm"
          :label="link.label"
        />
      </div>
    </section>

    <!-- Footer content section: "Austin, Texas" with category columns -->
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
              v-for="app in cat.subApps.slice(0, 4)"
              :key="app.slug"
            >
              <NuxtLink
                :to="`/${cat.slug}/${app.slug}/`"
                class="text-sm text-muted hover:text-default transition-colors"
              >
                {{ app.title }}
              </NuxtLink>
            </li>
          </ul>
        </div>
      </div>
    </section>
  </div>
</template>
