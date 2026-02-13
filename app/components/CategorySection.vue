<script setup lang="ts">
/**
 * CategorySection — "Explore Austin" grid of category blocks with link lists.
 * Sources data from useSiteData().
 */
const { categories } = useSiteData()

// Show 6 categories in the explore grid (matching mock: Food, Outdoors, Allergies, Real Estate + 2 more)
const displayCategories = computed(() => categories.slice(0, 6))
</script>

<template>
  <section class="mb-10">
    <h2 class="text-2xl font-extrabold tracking-tight font-display mb-6">
      Explore Austin
    </h2>

    <div class="grid grid-cols-2 md:grid-cols-4 gap-6 p-6 rounded-2xl border border-default bg-default">
      <CategoryLinkList
        v-for="cat in displayCategories"
        :key="cat.slug"
        :title="cat.title"
        :icon="cat.icon"
        :color="cat.color"
        :slug="cat.slug"
        :links="cat.subApps.slice(0, 4).map((a: { title: string; slug: string; status: string }) => ({ title: a.title, slug: a.slug, status: a.status }))"
      />
    </div>
  </section>
</template>
