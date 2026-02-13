<script setup lang="ts">
/**
 * [category]/tool/[slug].vue — Tool detail pattern page.
 * Serves as a shell for individual tool pages with title, description, and breadcrumb.
 */
const route = useRoute()
const { getCategoryBySlug } = useSiteData()

const categorySlug = computed(() => route.params.category as string)
const slug = computed(() => route.params.slug as string)
const category = computed(() => getCategoryBySlug(categorySlug.value))

const toolName = computed(() =>
  slug.value.replace(/-/g, ' ').replace(/\b\w/g, (l: string) => l.toUpperCase())
)

const subApp = computed(() =>
  category.value?.subApps.find((a: { slug: string }) => a.slug === slug.value)
)

usePageSeo({
  title: `${toolName.value} — ${category.value?.title ?? 'Austin'}`,
  description: subApp.value?.description ?? `${toolName.value} tool for Austin, Texas.`,
})

useSchemaOrg([
  defineWebPage({
    name: `${toolName.value} — ${category.value?.title ?? 'Austin'}`,
    description: subApp.value?.description ?? `${toolName.value} tool for Austin, Texas.`,
  }),
])
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
      <span class="text-default font-medium">{{ toolName }}</span>
    </div>

    <!-- Tool header -->
    <section class="mb-8">
      <div class="flex items-center gap-3 mb-3">
        <UIcon
          v-if="category"
          :name="category.icon"
          class="size-6"
          :class="category.color"
        />
        <h1 class="text-2xl sm:text-3xl font-extrabold tracking-tight font-display">
          {{ toolName }}
        </h1>
        <UBadge
          v-if="subApp"
          :color="subApp.status === 'live' ? 'success' : 'neutral'"
          variant="subtle"
          size="xs"
          :label="subApp.status === 'live' ? 'Live' : 'Coming Soon'"
        />
      </div>
      <p
        v-if="subApp"
        class="text-muted text-sm max-w-2xl leading-relaxed"
      >
        {{ subApp.description }}
      </p>
    </section>

    <!-- Tool content placeholder -->
    <div class="rounded-2xl border border-default bg-default p-8 sm:p-12 text-center">
      <UIcon
        name="i-lucide-wrench"
        class="size-10 text-muted mb-4 mx-auto"
      />
      <h2 class="text-lg font-semibold mb-2">
        Tool Content
      </h2>
      <p class="text-sm text-muted max-w-md mx-auto mb-6">
        This is a tool detail page template. The actual tool interface, data visualizations,
        and interactive elements will be built here.
      </p>
      <UButton
        :to="`/${categorySlug}/`"
        variant="outline"
        color="neutral"
        size="sm"
        label="Back to category"
        icon="i-lucide-arrow-left"
      />
    </div>
  </div>
</template>
