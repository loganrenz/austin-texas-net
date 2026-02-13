<script setup lang="ts">
/**
 * [category]/[slug].vue — Coming Soon catch-all page.
 * Matches routes like /food/breakfast-tacos/ and renders a branded
 * "coming soon" page when the sub-app is registered but not yet built.
 * Falls through to a 404 if neither category nor sub-app exist.
 */
const route = useRoute()
const { getCategoryBySlug, categories } = useSiteData()

const categorySlug = computed(() => route.params.category as string)
const slug = computed(() => route.params.slug as string)
const category = computed(() => getCategoryBySlug(categorySlug.value))
const subApp = computed(() =>
  category.value?.subApps.find(a => a.slug === slug.value)
)

// 404 if category or sub-app not found
if (!category.value || !subApp.value) {
  throw createError({ statusCode: 404, statusMessage: 'Page not found' })
}

const displayName = computed(() =>
  subApp.value?.title ?? slug.value.replace(/-/g, ' ').replace(/\b\w/g, (l: string) => l.toUpperCase())
)

usePageSeo({
  title: `${displayName.value} — Coming Soon`,
  description: subApp.value?.description ?? `${displayName.value} is coming soon to Austin-Texas.net.`,
})

useSchemaOrg([
  defineWebPage({
    name: `${displayName.value} — Coming Soon`,
    description: subApp.value?.description ?? `${displayName.value} is coming soon to Austin-Texas.net.`,
  }),
])

// Sibling sub-apps in the same category
const siblings = computed(() =>
  category.value?.subApps.filter(a => a.slug !== slug.value) ?? []
)

// Cross-link categories
const crossLinks = computed(() =>
  categories.filter(c => c.slug !== categorySlug.value).slice(0, 4)
)
</script>

<template>
  <div>
    <!-- Breadcrumb -->
    <div class="flex items-center gap-2 text-sm text-muted mb-6">
      <NuxtLink to="/" class="hover:text-primary transition-colors">Home</NuxtLink>
      <UIcon name="i-lucide-chevron-right" class="size-3" />
      <NuxtLink :to="`/${categorySlug}/`" class="hover:text-primary transition-colors">
        {{ category?.title }}
      </NuxtLink>
      <UIcon name="i-lucide-chevron-right" class="size-3" />
      <span class="text-default font-medium">{{ displayName }}</span>
    </div>

    <!-- Coming Soon hero -->
    <section class="text-center py-12 sm:py-20">
      <!-- Icon -->
      <div
        class="inline-flex items-center justify-center size-20 rounded-3xl mb-6 animate-fade-up"
        style="background: linear-gradient(135deg, var(--color-primary-500), var(--color-primary-700));"
      >
        <UIcon :name="category!.icon" class="size-10 text-white" />
      </div>

      <!-- Title -->
      <h1 class="text-3xl sm:text-4xl lg:text-5xl font-extrabold tracking-tight font-display mb-4 animate-fade-up-delay-1">
        {{ displayName }}
      </h1>

      <!-- Badge -->
      <div class="flex justify-center mb-5 animate-fade-up-delay-1">
        <UBadge color="warning" variant="subtle" size="md" label="Coming Soon" icon="i-lucide-clock" />
      </div>

      <!-- Description -->
      <p class="text-base sm:text-lg text-muted max-w-xl mx-auto leading-relaxed animate-fade-up-delay-2">
        {{ subApp?.description }}
      </p>

      <!-- CTA row -->
      <div class="flex flex-wrap items-center justify-center gap-3 mt-8 animate-fade-up-delay-3">
        <UButton
          v-if="subApp?.standaloneUrl"
          :to="subApp.standaloneUrl"
          target="_blank"
          rel="noopener"
          color="primary"
          size="lg"
          label="Preview on ATX Apps"
          icon="i-lucide-external-link"
        />
        <UButton
          :to="`/${categorySlug}/`"
          variant="outline"
          color="neutral"
          size="lg"
          label="Browse all in this category"
          icon="i-lucide-arrow-left"
        />
      </div>
    </section>

    <!-- What to expect -->
    <section class="rounded-2xl border border-default bg-default p-6 sm:p-8 mb-8 animate-fade-up-delay-3">
      <h2 class="text-sm font-bold uppercase tracking-widest text-muted mb-4">
        What to Expect
      </h2>
      <div class="text-sm text-muted leading-relaxed space-y-3">
        <p>
          We're building <strong class="text-default">{{ displayName }}</strong> as part of
          <NuxtLink :to="`/${categorySlug}/`" class="text-primary hover:underline">{{ category?.title }}</NuxtLink>
          on Austin-Texas.net — a set of free, fast, locally-focused tools powered by live data.
        </p>
        <p>
          When this page goes live, you'll get real-time information, mobile-friendly design, and zero
          ads — just useful Austin data. We build each tool with public APIs, local sensors, and
          community-sourced information.
        </p>
      </div>
    </section>

    <!-- Sibling sub-apps -->
    <section v-if="siblings.length" class="mb-8">
      <h2 class="text-xs font-bold uppercase tracking-widest text-muted mb-4">
        More in {{ category?.title }}
      </h2>
      <div class="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
        <NuxtLink
          v-for="app in siblings"
          :key="app.slug"
          :to="`/${categorySlug}/${app.slug}/`"
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
        Explore More
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
