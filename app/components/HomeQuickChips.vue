<script setup lang="ts">
/**
 * HomeQuickChips — popular page shortcuts as soft pill badges.
 */
const chips = [
  { label: 'Breakfast Tacos', to: '/food/breakfast-tacos/', color: 'warning' as const },
  { label: 'Happy Hours', to: '/food/happy-hours/', color: 'warning' as const },
  { label: 'Water Temps', to: '/outdoors/water-temps/', color: 'success' as const },
  { label: 'Bluebonnets', to: '/outdoors/bluebonnets/', color: 'success' as const },
  { label: 'Rent Heatmap', to: '/real-estate/rent-heatmap/', color: 'info' as const },
  { label: 'Culture', to: '/culture/', color: 'neutral' as const },
]
</script>

<template>
  <section class="pb-10">
    <UContainer>
      <p class="text-xs font-semibold uppercase tracking-wider text-muted mb-3">Popular</p>
      <div class="flex flex-wrap gap-2">
        <UBadge
          v-for="chip in chips"
          :key="chip.to"
          :label="chip.label"
          :color="chip.color"
          variant="soft"
          size="lg"
          :to="chip.to"
          as="NuxtLink"
          class="cursor-pointer hover:opacity-80 transition-opacity"
        />
      </div>
    </UContainer>
  </section>
</template>
