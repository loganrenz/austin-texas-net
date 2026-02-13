<script setup lang="ts">
usePageSeo({
  title: 'Cedar Pollen — Live Counts & Allergy Tracker',
  description: 'Real-time cedar pollen counts, forecasts, and allergy severity tracking for Austin, Texas. Stay ahead of cedar fever season.',
})

useHead({
  meta: [
    { name: 'geo.region', content: 'US-TX' },
    { name: 'geo.placename', content: 'Austin' },
    { name: 'geo.position', content: '30.2672;-97.7431' },
    { name: 'ICBM', content: '30.2672, -97.7431' },
  ],
})

useSchemaOrg([
  defineWebPage({
    name: 'Austin Cedar Pollen — Live Pollen Counts & Allergy Tracker',
    description: 'Real-time cedar pollen counts, forecasts, and allergy severity tracking for Austin, Texas.',
  }),
  {
    '@type': 'FAQPage',
    'mainEntity': [
      {
        '@type': 'Question',
        'name': 'When is cedar pollen season in Austin?',
        'acceptedAnswer': {
          '@type': 'Answer',
          'text': 'Cedar pollen season in Austin typically runs from mid-December through mid-February, with peak counts usually occurring in January.',
        },
      },
      {
        '@type': 'Question',
        'name': 'What is a high cedar pollen count?',
        'acceptedAnswer': {
          '@type': 'Answer',
          'text': 'Cedar pollen counts above 500 grains/m³ are considered high, and counts above 1,000 grains/m³ are considered very high. Counts above 5,000 grains/m³ are severe.',
        },
      },
      {
        '@type': 'Question',
        'name': 'What are cedar fever symptoms?',
        'acceptedAnswer': {
          '@type': 'Answer',
          'text': 'Cedar fever symptoms include sneezing, runny nose, nasal congestion, itchy/watery eyes, sore throat, fatigue, and mild headache. Despite its name, cedar fever rarely causes actual fever.',
        },
      },
    ],
  },
])

const colorMode = useColorMode()
const hydrated = ref(false)
onMounted(() => { hydrated.value = true })

// Fetch current pollen data
const { data: currentData } = await useFetch('/api/pollen/current', {
  server: false,
  lazy: true,
})

// Fetch history data — start with 30 days
const activeDays = ref(30)
const { data: historyResponse, pending: historyPending } = await useFetch(
  () => `/api/pollen/history?days=${activeDays.value}`,
  { server: false, lazy: true }
)

const historyData = computed(() => {
  return (historyResponse.value as any)?.readings ?? []
})

function onPeriodChange(days: number) {
  activeDays.value = days
}

// Allergen breakdown
const allergenData = computed(() => {
  return (currentData.value as any)?.allergens ?? null
})

// Forecast data from Google Pollen API
const forecastDays = computed(() => {
  return (currentData.value as any)?.forecast ?? []
})

const healthTips = computed(() => {
  const tips = (currentData.value as any)?.forecast?.[0]?.healthRecommendations ?? []
  return tips.slice(0, 5)
})

// Severity background gradient (theme-aware)
const severityGradient = computed(() => {
  if (!currentData.value || !hydrated.value) return 'none'
  const level = (currentData.value as any)?.current?.level
  const isDark = colorMode.value === 'dark'
  const alpha = isDark ? 0.08 : 0.06
  const base = isDark ? 'rgba(10,15,26,0.95)' : 'rgba(248,250,252,0.95)'
  const gradients: Record<string, string> = {
    'Low': `linear-gradient(135deg, rgba(34,197,94,${alpha}), ${base})`,
    'Medium': `linear-gradient(135deg, rgba(234,179,8,${alpha}), ${base})`,
    'High': `linear-gradient(135deg, rgba(249,115,22,${alpha}), ${base})`,
    'Very High': `linear-gradient(135deg, rgba(239,68,68,${alpha}), ${base})`,
    'Severe': `linear-gradient(135deg, rgba(168,85,247,${alpha}), ${base})`,
  }
  return gradients[level] || gradients['Low']
})

const lastUpdatedFormatted = computed(() => {
  if (!(currentData.value as any)?.current?.date) return ''
  return (currentData.value as any).current.date
})

function formatDayName(dateStr: string): string {
  const d = new Date(dateStr + 'T12:00:00')
  return d.toLocaleDateString('en-US', { weekday: 'short' })
}

function severityColor(level: string): string {
  const map: Record<string, string> = {
    'Low': '#22C55E',
    'Medium': '#EAB308',
    'High': '#F97316',
    'Very High': '#EF4444',
    'Severe': '#A855F7',
  }
  return map[level] || '#9CA3AF'
}
</script>

<template>
  <div>
    <!-- Breadcrumb + Sub-nav -->
    <div class="flex items-center justify-between mb-6">
      <div class="flex items-center gap-2 text-sm text-muted">
        <NuxtLink to="/" class="hover:text-primary transition-colors">Home</NuxtLink>
        <UIcon name="i-lucide-chevron-right" class="size-3" />
        <NuxtLink to="/allergies/" class="hover:text-primary transition-colors">Allergies</NuxtLink>
        <UIcon name="i-lucide-chevron-right" class="size-3" />
        <span class="text-default font-medium">Cedar Pollen</span>
      </div>
      <div class="flex items-center gap-1">
        <NuxtLink
          to="/allergies/cedar-pollen/about"
          class="px-3 py-1.5 text-xs font-medium text-muted rounded-lg hover:text-default hover:bg-elevated transition-colors"
        >
          About Cedar Fever
        </NuxtLink>
        <NuxtLink
          to="/allergies/cedar-pollen/tips"
          class="px-3 py-1.5 text-xs font-medium text-muted rounded-lg hover:text-default hover:bg-elevated transition-colors"
        >
          Tips
        </NuxtLink>
      </div>
    </div>

    <!-- Combined Hero + Chart -->
    <section class="hero" :style="hydrated ? { background: severityGradient } : undefined">
      <div class="hero-top">
        <div class="hero-live">
          <span class="live-dot" />
          <span class="live-text">Live Data</span>
        </div>
        <ClientOnly>
          <span v-if="lastUpdatedFormatted" class="meta-item">Updated {{ lastUpdatedFormatted }}</span>
        </ClientOnly>
      </div>

      <div v-if="currentData" class="hero-body">
        <!-- Left: Ring + Description -->
        <div class="hero-left">
          <PollenSeverityRing :count="(currentData as any).current.count" :size="200" />
          <p class="hero-description">{{ (currentData as any).current.description }}</p>
        </div>

        <!-- Right: Chart integrated inline -->
        <div class="hero-chart">
          <PollenChart
            :data="historyData"
            :loading="historyPending"
            @period-change="onPeriodChange"
          />
        </div>
      </div>
      <div v-else class="hero-loading">
        <UIcon name="i-lucide-loader-2" class="size-6 animate-spin text-muted" />
        <p class="text-muted text-sm">Loading pollen data...</p>
      </div>
    </section>

    <!-- Stats Row -->
    <section v-if="currentData" class="stats-grid">
      <PollenStatCard
        label="Current (Cedar)"
        :value="(currentData as any).current?.count ?? 0"
        suffix="gr/m³"
        :color="severityColor((currentData as any).current?.level ?? 'Low')"
      />
      <PollenStatCard
        label="Season Peak"
        :value="(currentData as any).season?.peakCount ?? 0"
        suffix="gr/m³"
        color="#F97316"
      />
      <PollenStatCard
        label="30-Day Average"
        :value="(currentData as any).season?.avgCount ?? 0"
        suffix="gr/m³"
        color="#10B981"
      />
      <PollenStatCard
        label="High Days This Season"
        :value="(currentData as any).season?.highDays ?? 0"
        suffix="days"
        color="#EF4444"
      />
    </section>

    <!-- Allergen Breakdown -->
    <section v-if="allergenData" class="allergen-section">
      <h2 class="section-title">Allergen Breakdown</h2>
      <p class="section-subtitle">Current grains/m³ by type</p>
      <div class="allergen-grid">
        <div class="allergen-card">
          <div class="allergen-bar" style="background: #EF4444" />
          <div class="allergen-name">Cedar</div>
          <div class="allergen-count" style="color: #EF4444">{{ allergenData.cedar?.toLocaleString() ?? '—' }}</div>
          <div class="allergen-unit">grains/m³</div>
        </div>
        <div class="allergen-card">
          <div class="allergen-bar" style="background: #60A5FA" />
          <div class="allergen-name">Elm</div>
          <div class="allergen-count" style="color: #60A5FA">{{ allergenData.elm?.toLocaleString() ?? '—' }}</div>
          <div class="allergen-unit">grains/m³</div>
        </div>
        <div class="allergen-card">
          <div class="allergen-bar" style="background: #A855F7" />
          <div class="allergen-name">Mold</div>
          <div class="allergen-count" style="color: #A855F7">{{ allergenData.mold?.toLocaleString() ?? '—' }}</div>
          <div class="allergen-unit">grains/m³</div>
        </div>
      </div>
    </section>

    <!-- 5-Day Forecast -->
    <section v-if="forecastDays.length > 0" class="forecast-section">
      <h2 class="section-title">5-Day Forecast</h2>
      <p class="section-subtitle">Projected pollen levels based on recent trends</p>
      <div class="forecast-grid">
        <PollenForecastCard
          v-for="day in forecastDays"
          :key="day.date"
          :day-name="formatDayName(day.date)"
          :date="day.date"
          :level="day.cedar?.category || 'N/A'"
          :count="day.cedar?.approxCount ?? 0"
          :tree-upi="day.tree?.upi ?? 0"
          :tree-category="day.tree?.category || 'N/A'"
          :active-species="day.activeSpecies ?? []"
          :in-season="day.inSeason ?? false"
        />
      </div>
    </section>

    <!-- Quick Tips -->
    <section v-if="healthTips.length > 0" class="tips-section">
      <h2 class="section-title">Quick Protection Tips</h2>
      <div class="tips-grid">
        <div v-for="(tip, i) in healthTips" :key="i" class="tip-card">
          <div class="tip-icon-wrap">
            <UIcon name="i-lucide-shield-check" class="size-5" />
          </div>
          <p class="tip-text">{{ tip }}</p>
        </div>
      </div>
    </section>

    <!-- Data source attribution -->
    <ClientOnly>
      <div class="data-source">
        Data from KXAN &amp; Google Pollen API
      </div>
    </ClientOnly>
  </div>
</template>

<style scoped>
/* Hero */
.hero {
  border-radius: 20px;
  padding: 32px;
  margin-bottom: 24px;
  border: 1px solid var(--color-border);
  overflow: hidden;
}

.hero-top {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 24px;
}

.hero-live {
  display: flex;
  align-items: center;
  gap: 8px;
}

.live-dot {
  width: 8px;
  height: 8px;
  background: #22C55E;
  border-radius: 50%;
  animation: pulse-dot 2s infinite;
}

@keyframes pulse-dot {
  0%, 100% { opacity: 1; box-shadow: 0 0 0 0 rgba(34,197,94,0.4); }
  50% { opacity: 0.8; box-shadow: 0 0 0 6px rgba(34,197,94,0); }
}

.live-text {
  font-size: 0.7rem;
  font-weight: 600;
  color: #22C55E;
  text-transform: uppercase;
  letter-spacing: 0.08em;
}

.meta-item {
  font-size: 0.65rem;
  color: var(--color-text-muted);
}

/* Hero body — ring left, chart right */
.hero-body {
  display: grid;
  grid-template-columns: auto 1fr;
  gap: 40px;
  align-items: center;
  min-height: 260px;
}

.hero-left {
  display: flex;
  flex-direction: column;
  align-items: center;
  text-align: center;
  gap: 12px;
  flex-shrink: 0;
  min-width: 220px;
}

.hero-description {
  font-size: 0.85rem;
  color: var(--color-text-muted);
  line-height: 1.6;
  max-width: 240px;
}

.hero-chart {
  min-width: 0;
  flex: 1;
}

.hero-loading {
  text-align: center;
  padding: 60px 0;
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 12px;
}

/* Stats grid */
.stats-grid {
  display: grid;
  grid-template-columns: repeat(4, 1fr);
  gap: 12px;
  margin-bottom: 24px;
}

/* Allergen section */
.allergen-section {
  margin-bottom: 24px;
}

.section-title {
  font-size: 0.85rem;
  font-weight: 600;
  color: var(--color-text-secondary);
  text-transform: uppercase;
  letter-spacing: 0.06em;
  margin-bottom: 4px;
}

.section-subtitle {
  font-size: 0.7rem;
  color: var(--color-text-muted);
  margin-bottom: 16px;
}

.allergen-grid {
  display: grid;
  grid-template-columns: repeat(3, 1fr);
  gap: 12px;
}

.allergen-card {
  background: var(--color-surface);
  border: 1px solid var(--color-border);
  border-radius: var(--radius);
  padding: 18px 16px;
}

.allergen-bar {
  width: 4px;
  height: 16px;
  border-radius: 2px;
  margin-bottom: 10px;
  opacity: 0.7;
}

.allergen-name {
  font-size: 0.7rem;
  color: var(--color-text-muted);
  text-transform: uppercase;
  letter-spacing: 0.06em;
  margin-bottom: 4px;
}

.allergen-count {
  font-size: 1.5rem;
  font-weight: 700;
  font-variant-numeric: tabular-nums;
}

.allergen-unit {
  font-size: 0.6rem;
  color: var(--color-text-faint);
  text-transform: uppercase;
  letter-spacing: 0.06em;
}

/* Forecast */
.forecast-section {
  margin-bottom: 24px;
}

.forecast-grid {
  display: grid;
  grid-template-columns: repeat(5, 1fr);
  gap: 12px;
}

/* Tips */
.tips-section {
  margin-bottom: 24px;
}

.tips-grid {
  display: grid;
  grid-template-columns: repeat(4, 1fr);
  gap: 12px;
  margin-top: 16px;
}

.tip-card {
  background: var(--color-surface);
  border: 1px solid var(--color-border);
  border-radius: var(--radius);
  padding: 20px 16px;
  transition: border-color 0.2s ease;
}

.tip-card:hover {
  border-color: var(--color-border-hover);
}

.tip-icon-wrap {
  width: 36px;
  height: 36px;
  background: rgba(16,185,129,0.1);
  border-radius: 10px;
  display: flex;
  align-items: center;
  justify-content: center;
  color: var(--color-primary);
  margin-bottom: 12px;
}

.tip-text {
  font-size: 0.75rem;
  color: var(--color-text-muted);
  line-height: 1.5;
}

/* Source attribution */
.data-source {
  text-align: center;
  font-size: 0.65rem;
  color: var(--color-text-faint);
  padding: 8px 0 0;
}

/* Responsive */
@media (max-width: 1024px) {
  .hero-body {
    grid-template-columns: 1fr;
    gap: 24px;
  }
  .hero-left {
    min-width: unset;
  }
  .stats-grid { grid-template-columns: repeat(2, 1fr); }
  .forecast-grid { grid-template-columns: repeat(3, 1fr); }
  .tips-grid { grid-template-columns: repeat(2, 1fr); }
}

@media (max-width: 640px) {
  .hero { padding: 24px 16px; border-radius: 16px; }
  .stats-grid { grid-template-columns: 1fr 1fr; }
  .allergen-grid { grid-template-columns: 1fr; }
  .forecast-grid { grid-template-columns: 1fr 1fr; }
  .tips-grid { grid-template-columns: 1fr; }
}
</style>
