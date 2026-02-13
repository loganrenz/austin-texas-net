<script setup lang="ts">
/**
 * ForecastCard — daily pollen forecast tile with cedar/tree UPI and active species.
 * No emojis. Uses severity color bars and clean typography.
 */

defineProps<{
  dayName: string
  date: string
  level: string
  count: number
  treeUpi: number
  treeCategory: string
  activeSpecies: string[]
  inSeason: boolean
}>()

function getLevelColor(level: string): string {
  const map: Record<string, string> = {
    'None': '#64748B',
    'Very Low': '#22C55E',
    'Low': '#22C55E',
    'Medium': '#EAB308',
    'Moderate': '#EAB308',
    'High': '#F97316',
    'Very High': '#EF4444',
    'Severe': '#A855F7',
  }
  return map[level] || '#64748B'
}
</script>

<template>
  <div class="forecast-card">
    <div class="card-accent" :style="{ backgroundColor: getLevelColor(level) }" />
    <div class="card-header">
      <span class="card-day">{{ dayName }}</span>
      <span class="card-date">{{ date.split('-').slice(1).join('/') }}</span>
    </div>

    <div class="card-count" :style="{ color: getLevelColor(level) }">
      {{ count > 0 ? count.toLocaleString() : '—' }}
    </div>
    <div class="card-unit">grains/m³ (est.)</div>

    <div class="card-level-badge" :style="{ backgroundColor: getLevelColor(level) + '18', color: getLevelColor(level) }">
      {{ level }}
    </div>

    <div class="card-divider" />

    <div class="card-metrics">
      <div class="metric">
        <span class="metric-label">Tree Pollen</span>
        <span class="metric-value" :style="{ color: getLevelColor(treeCategory) }">{{ treeCategory }}</span>
      </div>
      <div class="metric">
        <span class="metric-label">Cedar</span>
        <span class="metric-value" :style="{ color: getLevelColor(level) }">{{ level }}</span>
      </div>
      <div v-if="activeSpecies.length > 0" class="metric species-metric">
        <span class="metric-label">Active Species</span>
        <span class="metric-value species-list">{{ activeSpecies.slice(0, 4).join(', ') }}</span>
      </div>
      <div class="metric">
        <span class="metric-label">Season</span>
        <span class="metric-value">{{ inSeason ? 'Active' : 'Off-season' }}</span>
      </div>
    </div>
  </div>
</template>

<style scoped>
.forecast-card {
  position: relative;
  background: var(--color-surface);
  border: 1px solid var(--color-border);
  border-radius: 16px;
  padding: 20px 16px;
  overflow: hidden;
  transition: transform 0.2s ease, border-color 0.2s ease;
}

.forecast-card:hover {
  transform: translateY(-2px);
  border-color: var(--color-border-hover);
}

.card-accent {
  position: absolute;
  top: 0;
  left: 0;
  right: 0;
  height: 3px;
  opacity: 0.8;
}

.card-header {
  display: flex;
  justify-content: space-between;
  align-items: baseline;
  margin-bottom: 16px;
}

.card-day {
  font-weight: 700;
  font-size: 1rem;
  color: var(--color-text-secondary);
}

.card-date {
  font-size: 0.75rem;
  color: var(--color-text-faint);
  font-variant-numeric: tabular-nums;
}

.card-count {
  font-size: 1.75rem;
  font-weight: 700;
  line-height: 1;
  font-variant-numeric: tabular-nums;
}

.card-unit {
  font-size: 0.65rem;
  color: var(--color-text-faint);
  text-transform: uppercase;
  letter-spacing: 0.06em;
  margin-top: 2px;
  margin-bottom: 10px;
}

.card-level-badge {
  display: inline-block;
  padding: 3px 10px;
  border-radius: 99px;
  font-size: 0.7rem;
  font-weight: 600;
  letter-spacing: 0.02em;
}

.card-divider {
  height: 1px;
  background: var(--color-border);
  margin: 14px 0;
}

.card-metrics {
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: 8px;
}

.metric {
  display: flex;
  flex-direction: column;
  gap: 1px;
}

.species-metric {
  grid-column: 1 / -1;
}

.metric-label {
  font-size: 0.6rem;
  color: var(--color-text-faint);
  text-transform: uppercase;
  letter-spacing: 0.08em;
}

.metric-value {
  font-size: 0.8rem;
  color: var(--color-text-secondary);
  font-weight: 500;
  font-variant-numeric: tabular-nums;
}

.species-list {
  font-size: 0.75rem;
  line-height: 1.3;
}
</style>
