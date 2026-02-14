<script setup lang="ts">
/**
 * MapPin — Category icon map pin for MapKit JS annotations.
 *
 * A compact circular pin with a Lucide category icon, a small rank badge,
 * and a bold name label underneath. Uses inline SVG via useMapIcons()
 * because pins render inside isolated createApp() micro-apps.
 */

const props = defineProps<{
  rank: number
  name: string
  icon: string
  selected: boolean
  pinColor?: string
}>()

const emit = defineEmits<{
  select: []
}>()

const { getIconPaths } = useMapIcons()
const paths = computed(() => getIconPaths(props.icon))
</script>

<template>
  <div
    class="pin"
    :class="{ 'is-selected': selected }"
    data-map-pin
    @click.stop="emit('select')"
  >
    <div class="pin-bubble">
      <div
        class="pin-circle"
        :style="pinColor ? { background: `linear-gradient(145deg, ${pinColor}, color-mix(in srgb, ${pinColor} 55%, #000))` } : undefined"
      >
        <svg
          class="pin-icon"
          viewBox="0 0 24 24"
          fill="none"
          stroke="currentColor"
          stroke-width="2.2"
          stroke-linecap="round"
          stroke-linejoin="round"
        >
          <path v-for="(d, i) in paths" :key="i" :d="d" />
        </svg>
      </div>
      <span class="pin-rank">{{ rank }}</span>
    </div>
    <span class="pin-name">{{ name }}</span>
  </div>
</template>

<style scoped>
.pin {
  cursor: pointer;
  z-index: 1;
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 2px;
  width: max-content;
}

.pin.is-selected {
  z-index: 100;
}

.pin-bubble {
  position: relative;
}

.pin-circle {
  display: flex;
  align-items: center;
  justify-content: center;
  width: 30px;
  height: 30px;
  border-radius: 50%;
  background: linear-gradient(145deg, #d97706, #7c2d12);
  box-shadow:
    0 1px 5px rgba(0, 0, 0, 0.25),
    0 0 0 2px white;
  transition: transform 0.2s ease, box-shadow 0.2s ease;
}

.pin-circle:hover {
  transform: scale(1.12);
}

.pin-icon {
  width: 16px;
  height: 16px;
  color: white;
  filter: drop-shadow(0 1px 1px rgba(0, 0, 0, 0.15));
}

.is-selected .pin-circle {
  transform: scale(1.18);
  box-shadow:
    0 2px 10px rgba(245, 158, 11, 0.5),
    0 0 0 2.5px white,
    0 0 0 4.5px rgba(245, 158, 11, 0.25);
}

/* Rank badge */
.pin-rank {
  position: absolute;
  bottom: -3px;
  right: -5px;
  display: flex;
  align-items: center;
  justify-content: center;
  min-width: 15px;
  height: 15px;
  padding: 0 3px;
  border-radius: 8px;
  background: white;
  color: #92400e;
  font-size: 9px;
  font-weight: 800;
  font-family: var(--font-display);
  line-height: 1;
  box-shadow: 0 1px 3px rgba(0, 0, 0, 0.2);
}

:is(.dark) .pin-rank {
  background: #1c1c1e;
  color: #fbbf24;
  box-shadow: 0 1px 3px rgba(0, 0, 0, 0.5);
}

/* Name label */
.pin-name {
  display: block;
  max-width: 100px;
  font-size: 11px;
  font-weight: 700;
  font-family: var(--font-display);
  line-height: 1.15;
  text-align: center;
  color: #1e293b;
  text-shadow:
    0 0 4px white,
    0 0 4px white,
    1px 0 3px white,
    -1px 0 3px white,
    0 1px 3px white,
    0 -1px 3px white;
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
  pointer-events: none;
}

:is(.dark) .pin-name {
  color: #f1f5f9;
  text-shadow:
    0 0 4px rgba(0, 0, 0, 0.9),
    0 0 4px rgba(0, 0, 0, 0.9),
    1px 0 3px rgba(0, 0, 0, 0.8),
    -1px 0 3px rgba(0, 0, 0, 0.8);
}

.is-selected .pin-name {
  font-weight: 800;
  color: #92400e;
}

:is(.dark) .is-selected .pin-name {
  color: #fbbf24;
}
</style>
