<script setup lang="ts">
/**
 * CategoryLinkList — a single category block with icon, title header, and link list.
 * Used within CategorySection for the "Explore Austin" grid.
 */
defineProps<{
  title: string
  icon: string
  color: string
  slug: string
  links: Array<{ title: string; slug: string; status: string }>
}>()
</script>

<template>
  <div class="flex flex-col">
    <!-- Category header -->
    <NuxtLink
      :to="`/${slug}/`"
      class="flex items-center gap-2 mb-3 group"
    >
      <UIcon
        :name="icon"
        class="size-4"
        :class="color"
      />
      <h3
        class="text-base font-bold tracking-tight group-hover:text-primary transition-colors"
        :class="color"
      >
        {{ title }}
      </h3>
    </NuxtLink>

    <!-- Link list -->
    <ul class="space-y-1">
      <li
        v-for="link in links"
        :key="link.slug"
      >
        <NuxtLink
          :to="`/${slug}/${link.slug}/`"
          class="text-sm text-muted hover:text-default transition-colors"
        >
          {{ link.title }}
        </NuxtLink>
      </li>
    </ul>
  </div>
</template>
