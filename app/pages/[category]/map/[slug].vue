<script setup lang="ts">
/**
 * [category]/map/[slug].vue — Map pattern placeholder page.
 * No heavy map libraries yet; shows a placeholder with intent.
 */
const route = useRoute()
const { getCategoryBySlug } = useSiteData()

const categorySlug = computed(() => route.params.category as string)
const slug = computed(() => route.params.slug as string)
const category = computed(() => getCategoryBySlug(categorySlug.value))

const pageTitle = computed(() => {
  const name = slug.value.replace(/-/g, ' ').replace(/\b\w/g, (l: string) => l.toUpperCase())
  return `${name} Map — ${category.value?.title ?? 'Austin'}`
})

usePageSeo({
  title: pageTitle.value,
  description: `Interactive map of ${slug.value.replace(/-/g, ' ')} locations in Austin, Texas.`,
})
</script>

<template>
  <div>
    <!-- Breadcrumb -->
    <div class="flex items-center gap-2 text-sm text-muted mb-6">
      <NuxtLink to="/" class="hover:text-primary transition-colors">Home</NuxtLink>
      <UIcon name="i-lucide-chevron-right" class="size-3" />
      <NuxtLink :to="`/${categorySlug}/`" class="hover:text-primary transition-colors">
        {{ category?.title ?? categorySlug }}
      </NuxtLink>
      <UIcon name="i-lucide-chevron-right" class="size-3" />
      <span class="text-default font-medium capitalize">{{ slug.replace(/-/g, ' ') }}</span>
    </div>

    <!-- Header -->
    <section class="mb-6">
      <h1 class="text-2xl sm:text-3xl font-extrabold tracking-tight font-display mb-2 capitalize">
        {{ slug.replace(/-/g, ' ') }} Map
      </h1>
    </section>

    <!-- Map placeholder -->
    <div class="flex flex-col items-center justify-center rounded-2xl border-2 border-dashed border-default bg-elevated/50 py-20 px-6">
      <UIcon
        name="i-lucide-map"
        class="size-12 text-muted mb-4"
      />
      <h2 class="text-lg font-semibold mb-2">
        Map View Coming Soon
      </h2>
      <p class="text-sm text-muted text-center max-w-md">
        An interactive map of {{ slug.replace(/-/g, ' ') }} locations across Austin will appear here.
        This page type supports MapKit JS, Mapbox, or Leaflet integrations.
      </p>
      <UButton
        :to="`/${categorySlug}/`"
        variant="outline"
        color="neutral"
        size="sm"
        label="Back to category"
        icon="i-lucide-arrow-left"
        class="mt-6"
      />
    </div>
  </div>
</template>
