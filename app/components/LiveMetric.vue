<script setup lang="ts">
/**
 * LiveMetric — single editorial metric block for the live strip.
 * Displays a gradient card with large value, subtitle details, and LiveBadge.
 */
const props = defineProps<{
  title: string
  value: string | number | null
  unit?: string
  subtitle?: string
  details?: string[]
  updatedAt?: string | null
  gradient: string
  liveLabel?: string
  to?: string
}>()

const component = computed(() => props.to ? resolveComponent('NuxtLink') : 'div')
</script>

<template>
  <component
    :is="component"
    :to="to"
    class="group relative flex flex-col overflow-hidden rounded-2xl border border-default transition-all duration-200 hover:shadow-lg"
    :class="[to ? 'cursor-pointer' : '']"
  >
    <!-- Gradient header -->
    <div
      class="px-5 pt-5 pb-4"
      :class="gradient"
    >
      <div class="flex items-center justify-between mb-2">
        <span class="text-sm font-semibold text-white/90">
          {{ title }}
        </span>
        <LiveBadge
          v-if="liveLabel"
          :label="liveLabel"
        />
      </div>
      <div class="flex items-baseline gap-2">
        <ClientOnly>
          <span
            v-if="value !== null"
            class="text-4xl font-extrabold text-white tracking-tight font-display"
          >
            {{ value }}
          </span>
          <span
            v-else
            class="text-4xl font-extrabold text-white/50 tracking-tight font-display"
          >
            —
          </span>
          <template #fallback>
            <span class="text-4xl font-extrabold text-white/50 tracking-tight font-display">—</span>
          </template>
        </ClientOnly>
        <span
          v-if="unit"
          class="text-sm font-bold uppercase tracking-wider text-white/70"
        >
          {{ unit }}
        </span>
      </div>
    </div>

    <!-- Details section -->
    <div class="flex-1 bg-default px-5 py-3 space-y-1.5">
      <LiveBadge :updated-at="updatedAt" />
      <p
        v-if="subtitle"
        class="text-xs text-muted leading-relaxed"
      >
        {{ subtitle }}
      </p>
      <ul
        v-if="details?.length"
        class="space-y-0.5"
      >
        <li
          v-for="detail in details"
          :key="detail"
          class="text-[11px] text-muted"
        >
          {{ detail }}
        </li>
      </ul>
    </div>
  </component>
</template>
