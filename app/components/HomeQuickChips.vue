<script setup lang="ts">
/**
 * HomeQuickChips — colored pill badge row for popular pages.
 */
const chips = [
  { label: 'Breakfast Tacos', to: '/food/breakfast-tacos/', color: 'warning' as const },
  { label: 'Happy Hours', to: '/food/happy-hours/', color: 'error' as const },
  { label: 'Water Temps', to: '/outdoors/water-temps/', color: 'success' as const },
  { label: 'Bluebonnets', to: '/outdoors/bluebonnets/', color: 'info' as const },
  { label: 'Rent Heatmap', to: '/real-estate/rent-heatmap/', color: 'error' as const },
  { label: 'Culture', to: '/culture/', color: 'neutral' as const },
]
</script>

<template>
  <section class="mb-10">
    <UContainer>
    <div class="flex flex-wrap gap-2">
      <UBadge
        v-for="chip in chips"
        :key="chip.to"
        :label="chip.label"
        :color="chip.color"
        variant="outline"
        size="lg"
        :to="chip.to"
        as="NuxtLink"
        class="cursor-pointer"
      />
    </div>
    </UContainer>
  </section>
</template>
