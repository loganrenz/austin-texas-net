<script setup lang="ts">
/**
 * [category]/index.vue — Dynamic category hub page.
 * Uses route param to look up category from useSiteData().
 * Renders H1, SEO content, child link list, and "Coming Soon" badges.
 */
const route = useRoute()
const { getCategoryBySlug, categories } = useSiteData()

const categorySlug = computed(() => route.params.category as string)
const category = computed(() => getCategoryBySlug(categorySlug.value))

// 404 if category not found
if (!category.value) {
  throw createError({ statusCode: 404, statusMessage: 'Category not found' })
}

usePageSeo({
  title: `${category.value.title} in Austin, Texas`,
  description: category.value.tagline,
})

useSchemaOrg([
  defineWebPage({
    name: `${category.value.title} in Austin, Texas`,
    description: category.value.tagline,
  }),
])

// Cross-link categories
const crossLinks = computed(() =>
  categories.filter(c => c.slug !== categorySlug.value).slice(0, 4)
)
</script>

<template>
  <div v-if="category">
    <!-- Breadcrumb -->
    <div class="flex items-center gap-2 text-sm text-muted mb-6">
      <NuxtLink to="/" class="hover:text-primary transition-colors">
        Home
      </NuxtLink>
      <UIcon name="i-lucide-chevron-right" class="size-3" />
      <span class="text-default font-medium">{{ category.title }}</span>
    </div>

    <!-- Hero -->
    <section class="text-center py-8 sm:py-12">
      <div
        class="inline-flex items-center justify-center size-16 rounded-2xl mb-4"
        :class="category.color"
        style="background: currentColor;"
      >
        <UIcon :name="category.icon" class="size-8 text-white" />
      </div>
      <h1 class="text-3xl sm:text-4xl font-extrabold tracking-tight font-display mb-3">
        {{ category.title }} in Austin
      </h1>
      <p class="text-base text-muted max-w-lg mx-auto leading-relaxed">
        {{ category.tagline }}
      </p>
    </section>

    <!-- SEO content block (150-300 words) -->
    <section class="rounded-2xl border border-default bg-default p-6 sm:p-8 mb-8">
      <div class="text-sm text-muted leading-relaxed space-y-4">
        <p>
          Austin, Texas is one of the most vibrant cities in the American South, known for its live music scene,
          incredible food, outdoor recreation, and a unique culture that locals call "Keep Austin Weird." Whether
          you're a longtime resident or visiting for the first time, having access to real-time, locally-sourced
          data makes all the difference in planning your days.
        </p>
        <p>
          This {{ category.title.toLowerCase() }} hub brings together the best tools and guides for exploring
          {{ category.title.toLowerCase() }} in Austin. Each tool below is built with live data integrations,
          pulling from public APIs, local sensors, and community-sourced information to give you the most
          accurate and up-to-date picture possible.
        </p>
        <p>
          Browse the tools below to find exactly what you need, or explore our other category hubs for more
          ways to experience Austin. Every page is designed to load fast, work on mobile, and deliver the
          specific information you're looking for — no filler, no ads, just useful Austin data.
        </p>
      </div>
    </section>

    <!-- Sub-app cards -->
    <section class="mb-8">
      <h2 class="text-xs font-bold uppercase tracking-widest text-muted mb-4">
        Explore {{ category.title }}
      </h2>
      <div class="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
        <NuxtLink
          v-for="app in category.subApps"
          :key="app.slug"
          :to="`/${category.slug}/${app.slug}/`"
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

    <!-- Cross-links -->
    <section class="mb-6">
      <h2 class="text-xs font-bold uppercase tracking-widest text-muted mb-4">
        More from Austin
      </h2>
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
  </div>
</template>
