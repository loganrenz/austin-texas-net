<script setup lang="ts">
/**
 * [category]/list/[slug].vue — Filterable list pattern page.
 * Demonstrates the list page type with search and placeholder items.
 */
const route = useRoute()
const { getCategoryBySlug } = useSiteData()

const categorySlug = computed(() => route.params.category as string)
const slug = computed(() => route.params.slug as string)
const category = computed(() => getCategoryBySlug(categorySlug.value))

const pageTitle = computed(() => {
  const name = slug.value.replace(/-/g, ' ').replace(/\b\w/g, (l: string) => l.toUpperCase())
  return `${name} — ${category.value?.title ?? 'Austin'}`
})

usePageSeo({
  title: pageTitle.value,
  description: `Browse and filter ${slug.value.replace(/-/g, ' ')} in Austin, Texas.`,
})

const searchQuery = ref('')

// Placeholder list items
const items = ref([
  { id: 1, name: 'Example Item 1', description: 'This is a placeholder for the list pattern.' },
  { id: 2, name: 'Example Item 2', description: 'Real data will replace these placeholders.' },
  { id: 3, name: 'Example Item 3', description: 'Each list page can be customized per tool.' },
])

const filteredItems = computed(() =>
  items.value.filter((item: { id: number; name: string; description: string }) =>
    item.name.toLowerCase().includes(searchQuery.value.toLowerCase())
  )
)
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
        {{ slug.replace(/-/g, ' ') }}
      </h1>
      <p class="text-muted text-sm">
        Browse and filter results. This is a list pattern template.
      </p>
    </section>

    <!-- Search -->
    <div class="mb-6">
      <UInput
        v-model="searchQuery"
        placeholder="Search..."
        icon="i-lucide-search"
        size="lg"
        class="max-w-md"
      />
    </div>

    <!-- List -->
    <div class="space-y-3">
      <div
        v-for="item in filteredItems"
        :key="item.id"
        class="flex items-center justify-between rounded-xl border border-default bg-default p-4"
      >
        <div>
          <h3 class="text-sm font-semibold">{{ item.name }}</h3>
          <p class="text-xs text-muted">{{ item.description }}</p>
        </div>
        <UIcon name="i-lucide-chevron-right" class="size-4 text-dimmed" />
      </div>

      <div
        v-if="filteredItems.length === 0"
        class="text-center py-12 text-muted text-sm"
      >
        No items match your search.
      </div>
    </div>
  </div>
</template>
