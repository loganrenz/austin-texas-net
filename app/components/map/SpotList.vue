<script setup lang="ts">
/**
 * MapSpotList — Ranked list of map spots.
 *
 * Shows each spot with a category icon pin (matching the map), name,
 * known-for highlight, neighborhood, rating, and a map-pin action icon.
 * Uses the shared useMapIcons() composable for icon SVG paths.
 */
import type { MapSpot } from '~/types/mapSpot'

defineProps<{
  spots: MapSpot[]
  accentColor?: string
  categoryIcon?: string
  pinColor?: string
}>()

const emit = defineEmits<{
  select: [slug: string]
}>()

const { getIconPaths } = useMapIcons()
</script>

<template>
  <section class="mb-10 animate-fade-up-delay-1">
    <h2 class="text-xs font-bold uppercase tracking-widest text-muted mb-5">The Rankings</h2>
    <div class="space-y-3">
      <!-- eslint-disable-next-line atx/no-native-button -- complex card layout -->
      <button
        v-for="spot in spots"
        :key="spot.slug"
        class="map-list-item group"
        @click="emit('select', spot.slug)"
      >
        <div class="map-list-pin">
          <div
            class="map-list-icon"
            :class="{ 'is-top-3': spot.rank <= 3 }"
            :style="
              pinColor
                ? {
                    background: `linear-gradient(145deg, ${pinColor}, color-mix(in srgb, ${pinColor} 55%, #000))`,
                  }
                : undefined
            "
          >
            <!-- eslint-disable-next-line atx/no-inline-svg -- dynamic icon paths from useMapIcons() -->
            <svg
              class="map-list-svg"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              stroke-width="2.2"
              stroke-linecap="round"
              stroke-linejoin="round"
            >
              <path v-for="(d, i) in getIconPaths(categoryIcon)" :key="i" :d="d" />
            </svg>
          </div>
          <span class="map-list-rank">{{ spot.rank }}</span>
        </div>
        <div class="flex-1 min-w-0 text-left">
          <div class="flex items-center gap-2 mb-0.5">
            <h3 class="text-sm sm:text-base font-bold truncate">{{ spot.name }}</h3>
            <UBadge
              v-if="spot.priceRange"
              :label="spot.priceRange"
              color="success"
              variant="subtle"
              size="xs"
            />
          </div>
          <!-- eslint-disable-next-line atx/no-raw-tailwind-colors -->
          <p class="text-xs sm:text-sm text-muted truncate">
            <!-- eslint-disable-next-line atx/no-raw-tailwind-colors -->
            <span class="font-medium text-amber-600 dark:text-amber-400">{{ spot.knownFor }}</span>
            <span class="mx-1.5 text-dimmed">·</span>
            {{ spot.neighborhood }}
          </p>
        </div>
        <div v-if="spot.rating" class="map-list-rating shrink-0">
          <!-- eslint-disable-next-line atx/no-raw-tailwind-colors -->
          <UIcon name="i-lucide-star" class="size-3.5 text-amber-400" />
          <span>{{ spot.rating }}</span>
        </div>
        <!-- eslint-disable atx/no-raw-tailwind-colors -- amber hover accent -->
        <UIcon
          name="i-lucide-map-pin"
          class="size-4 text-muted group-hover:text-amber-500 transition-colors shrink-0"
        />
      </button>
    </div>
  </section>
</template>

<!-- eslint-disable atx/no-style-block-layout -->
<style scoped>
.map-list-item {
  display: flex;
  align-items: center;
  gap: 12px;
  width: 100%;
  padding: 14px 16px;
  border-radius: 14px;
  border: 1px solid var(--ui-border);
  background: var(--ui-bg);
  transition: all 0.2s ease;
  cursor: pointer;
}

.map-list-item:hover {
  border-color: var(--color-amber-300);
  box-shadow: 0 2px 12px rgba(217, 119, 6, 0.08);
  transform: translateY(-1px);
}

:is(.dark) .map-list-item:hover {
  border-color: rgba(217, 119, 6, 0.3);
  box-shadow: 0 2px 12px rgba(217, 119, 6, 0.12);
}

.map-list-pin {
  position: relative;
  flex-shrink: 0;
}

.map-list-icon {
  display: flex;
  align-items: center;
  justify-content: center;
  width: 36px;
  height: 36px;
  border-radius: 50%;
  background: var(--ui-bg-elevated);
  color: var(--ui-text-muted);
  transition: all 0.2s ease;
}

.map-list-icon.is-top-3 {
  background: linear-gradient(145deg, #d97706, #7c2d12);
  color: white;
  box-shadow: 0 2px 8px rgba(217, 119, 6, 0.3);
}

.map-list-svg {
  width: 18px;
  height: 18px;
}

.map-list-rank {
  position: absolute;
  bottom: -3px;
  right: -5px;
  display: flex;
  align-items: center;
  justify-content: center;
  min-width: 16px;
  height: 16px;
  padding: 0 3px;
  border-radius: 8px;
  background: white;
  color: #92400e;
  font-size: 9px;
  font-weight: 800;
  font-family: var(--font-display);
  line-height: 1;
  box-shadow: 0 1px 3px rgba(0, 0, 0, 0.15);
}

:is(.dark) .map-list-rank {
  background: #1c1c1e;
  color: #fbbf24;
  box-shadow: 0 1px 3px rgba(0, 0, 0, 0.5);
}

.map-list-rating {
  display: flex;
  align-items: center;
  gap: 3px;
  font-size: 13px;
  font-weight: 700;
  color: var(--ui-text-muted);
}
</style>
