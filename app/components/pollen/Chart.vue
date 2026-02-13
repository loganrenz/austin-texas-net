<script setup lang="ts">
import { Line } from 'vue-chartjs'
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  Title,
  Tooltip,
  Filler,
} from 'chart.js'

ChartJS.register(CategoryScale, LinearScale, PointElement, LineElement, Title, Tooltip, Filler)

/**
 * PollenChart — Pollen trend chart supporting 7d to 2yr ranges.
 * For ranges >90d, data is expected to be pre-aggregated (weekly).
 */

const props = withDefaults(defineProps<{
  data: Array<{ date: string; count: number; level?: string; peak?: number }>
  embedded?: boolean
  loading?: boolean
}>(), {
  embedded: false,
  loading: false,
})

const emit = defineEmits<{
  (e: 'period-change', days: number): void
}>()

const colorMode = useColorMode()

const activePeriod = ref(30)
const periods = [
  { days: 7, label: '7d' },
  { days: 14, label: '14d' },
  { days: 30, label: '30d' },
  { days: 90, label: '90d' },
  { days: 365, label: '1yr' },
  { days: 730, label: '2yr' },
]

function switchPeriod(days: number) {
  activePeriod.value = days
  emit('period-change', days)
}

function getSeverityColor(count: number): string {
  if (count < 50) return '#22C55E'
  if (count < 500) return '#EAB308'
  if (count < 1500) return '#F97316'
  if (count < 5000) return '#EF4444'
  return '#A855F7'
}

const isDark = computed(() => colorMode.value === 'dark')

const chartData = computed(() => {
  const dataSlice = activePeriod.value <= 30
    ? props.data.slice(-activePeriod.value)
    : props.data

  const isWeekly = activePeriod.value > 90

  const labels = dataSlice.map(d => {
    const parts = d.date.split('-')
    if (isWeekly) {
      // Show month/day for weekly data
      return `${parts[1]}/${parts[2]}`
    }
    return `${parts[1]}/${parts[2]}`
  })

  const values = dataSlice.map(d => d.count)
  const pointColors = values.map(v => getSeverityColor(v))

  return {
    labels,
    datasets: [{
      label: isWeekly ? 'Avg Pollen Count' : 'Pollen Count',
      data: values,
      borderColor: '#10B981',
      borderWidth: 2,
      pointRadius: dataSlice.length > 60 ? 0 : dataSlice.length > 30 ? 2 : 4,
      pointHoverRadius: 6,
      pointBackgroundColor: pointColors,
      pointBorderColor: 'transparent',
      fill: true,
      backgroundColor: (ctx: any) => {
        const chart = ctx.chart
        const { ctx: canvasCtx, chartArea } = chart
        if (!chartArea) return 'rgba(16,185,129,0.1)'
        const gradient = canvasCtx.createLinearGradient(0, chartArea.top, 0, chartArea.bottom)
        gradient.addColorStop(0, 'rgba(16,185,129,0.25)')
        gradient.addColorStop(0.5, 'rgba(16,185,129,0.08)')
        gradient.addColorStop(1, 'rgba(16,185,129,0)')
        return gradient
      },
      tension: 0.3,
    }],
  }
})

const chartOptions = computed(() => {
  const dark = isDark.value
  const dataSlice = activePeriod.value <= 30
    ? props.data.slice(-activePeriod.value)
    : props.data
  const maxVal = Math.max(...dataSlice.map(d => d.count), 1000)
  const yMax = Math.ceil(maxVal / 1000) * 1000 + 1000

  return {
    responsive: true,
    maintainAspectRatio: false,
    interaction: {
      mode: 'index' as const,
      intersect: false,
    },
    plugins: {
      legend: { display: false },
      tooltip: {
        backgroundColor: dark ? 'rgba(15,23,42,0.95)' : 'rgba(255,255,255,0.95)',
        titleColor: dark ? 'rgba(255,255,255,0.6)' : 'rgba(0,0,0,0.5)',
        bodyColor: dark ? '#ffffff' : '#1a1a2e',
        borderColor: dark ? 'rgba(255,255,255,0.1)' : 'rgba(0,0,0,0.1)',
        borderWidth: 1,
        padding: 12,
        cornerRadius: 10,
        displayColors: false,
        titleFont: { size: 11, weight: '400' as const },
        bodyFont: { size: 13, weight: '600' as const },
        callbacks: {
          label: (ctx: any) => {
            const val = ctx.raw
            let level = 'Low'
            if (val >= 5000) level = 'Severe'
            else if (val >= 1500) level = 'Very High'
            else if (val >= 500) level = 'High'
            else if (val >= 50) level = 'Medium'
            const suffix = activePeriod.value > 90 ? ' (weekly avg)' : ''
            return `${val.toLocaleString()} grains/m³ — ${level}${suffix}`
          }
        }
      },
    },
    scales: {
      x: {
        grid: {
          color: dark ? 'rgba(255,255,255,0.03)' : 'rgba(0,0,0,0.06)',
        },
        ticks: {
          color: dark ? 'rgba(255,255,255,0.3)' : 'rgba(0,0,0,0.4)',
          font: { size: 10 },
          maxRotation: 0,
          maxTicksLimit: activePeriod.value > 365 ? 12 : activePeriod.value > 90 ? 8 : 10,
        },
        border: { display: false },
      },
      y: {
        min: 0,
        max: yMax,
        grid: {
          color: dark ? 'rgba(255,255,255,0.03)' : 'rgba(0,0,0,0.06)',
        },
        ticks: {
          color: dark ? 'rgba(255,255,255,0.3)' : 'rgba(0,0,0,0.4)',
          font: { size: 10 },
          stepSize: yMax > 5000 ? 2000 : 1000,
          callback: (value: any) => {
            if (value >= 1000) return `${value / 1000}k`
            return value
          },
        },
        border: { display: false },
      },
    },
  }
})
</script>

<template>
  <div class="chart-container" :class="{ embedded }">
    <div class="chart-header">
      <h3 class="chart-title">Pollen Trend</h3>
      <div class="period-selector">
        <button
          v-for="p in periods"
          :key="p.days"
          class="period-btn"
          :class="{ active: activePeriod === p.days }"
          @click="switchPeriod(p.days)"
        >
          {{ p.label }}
        </button>
      </div>
    </div>

    <!-- Loading state -->
    <div v-if="loading" class="chart-loading">
      <div class="loading-spinner" />
      <p class="loading-text">Loading pollen data...</p>
    </div>

    <div v-else class="chart-wrapper" :class="{ 'chart-wrapper--embedded': embedded }">
      <Line v-if="data.length > 0" :data="chartData" :options="(chartOptions as any)" />
      <div v-else class="chart-empty">
        <p>No pollen data available for this period</p>
      </div>
    </div>

    <!-- Aggregation notice -->
    <p v-if="activePeriod > 90 && !loading && data.length > 0" class="agg-notice">
      Showing weekly averages for {{ activePeriod > 365 ? '2-year' : '1-year' }} view
    </p>
  </div>
</template>

<style scoped>
.chart-container {
  background: var(--color-surface);
  border: 1px solid var(--color-border);
  border-radius: 16px;
  padding: 20px;
}

.chart-container.embedded {
  background: transparent;
  border: none;
  border-radius: 0;
  padding: 0;
}

.chart-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 16px;
}

.chart-title {
  font-size: 0.85rem;
  font-weight: 600;
  color: var(--color-text-secondary);
  text-transform: uppercase;
  letter-spacing: 0.06em;
}

.period-selector {
  display: flex;
  gap: 2px;
  background: var(--color-surface-hover);
  border-radius: 8px;
  padding: 3px;
}

.period-btn {
  padding: 4px 10px;
  border: none;
  background: transparent;
  color: var(--color-text-muted);
  font-size: 0.7rem;
  font-weight: 600;
  border-radius: 6px;
  cursor: pointer;
  transition: all 0.2s ease;
}

.period-btn:hover {
  color: var(--color-text-secondary);
}

.period-btn.active {
  background: rgba(16,185,129,0.15);
  color: #10B981;
}

.chart-wrapper {
  height: 280px;
}

.chart-wrapper--embedded {
  height: 220px;
}

.chart-loading {
  height: 280px;
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  gap: 12px;
}

.loading-spinner {
  width: 32px;
  height: 32px;
  border: 3px solid rgba(16,185,129,0.15);
  border-top-color: #10B981;
  border-radius: 50%;
  animation: spin 0.8s linear infinite;
}

@keyframes spin {
  to { transform: rotate(360deg); }
}

.loading-text {
  font-size: 0.8rem;
  color: var(--color-text-muted);
}

.chart-empty {
  height: 100%;
  display: flex;
  align-items: center;
  justify-content: center;
  color: var(--color-text-muted);
  font-size: 0.85rem;
}

.agg-notice {
  margin-top: 8px;
  font-size: 0.7rem;
  color: var(--color-text-muted);
  text-align: center;
  opacity: 0.7;
}
</style>
