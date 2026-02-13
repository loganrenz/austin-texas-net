<script setup lang="ts">
usePageSeo({
  title: 'Cedar Pollen — Live Counts & Allergy Tracker',
  description:
    'Real-time cedar pollen counts, forecasts, and allergy severity tracking for Austin, Texas. Stay ahead of cedar fever season.',
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
    description:
      'Real-time cedar pollen counts, forecasts, and allergy severity tracking for Austin, Texas.',
  }),
  {
    '@type': 'FAQPage',
    mainEntity: [
      {
        '@type': 'Question',
        name: 'When is cedar pollen season in Austin?',
        acceptedAnswer: {
          '@type': 'Answer',
          text: 'Cedar pollen season in Austin typically runs from mid-December through mid-February, with peak counts usually occurring in January.',
        },
      },
      {
        '@type': 'Question',
        name: 'What is a high cedar pollen count?',
        acceptedAnswer: {
          '@type': 'Answer',
          text: 'Cedar pollen counts above 500 grains/m³ are considered high, and counts above 1,000 grains/m³ are considered very high. Counts above 5,000 grains/m³ are severe.',
        },
      },
      {
        '@type': 'Question',
        name: 'What are cedar fever symptoms?',
        acceptedAnswer: {
          '@type': 'Answer',
          text: 'Cedar fever symptoms include sneezing, runny nose, nasal congestion, itchy/watery eyes, sore throat, fatigue, and mild headache. Despite its name, cedar fever rarely causes actual fever.',
        },
      },
    ],
  },
])

const colorMode = useColorMode()
const hydrated = ref(false)
onMounted(() => {
  hydrated.value = true
})

interface PollenForecastDay {
  date: string
  cedar: { upi: number | null; category: string | null; approxCount: number | null }
  tree: { upi: number | null; category: string | null }
  activeSpecies: string[]
  healthRecommendations: string[]
  inSeason: boolean
}

interface PollenCurrentResponse {
  current: {
    date: string
    count: number
    level: string
    source: string
    description: string
  } | null
  trend?: string
  season?: { peakCount: number; avgCount: number; highDays: number }
  allergens?: {
    cedar: number
    elm: number
    mold: number
    levels: { cedar: string; elm: string; mold: string }
  } | null
  forecast?: PollenForecastDay[]
  message?: string
}

// Fetch current pollen data
const { data: currentData } = await useFetch<PollenCurrentResponse>('/api/pollen/current', {
  server: false,
  lazy: true,
})

// Fetch history data — start with 30 days
const activeDays = ref(30)
const { data: historyResponse, pending: historyPending } = await useFetch(
  () => `/api/pollen/history?days=${activeDays.value}`,
  { server: false, lazy: true },
)

const historyData = computed(() => {
  return (historyResponse.value as { readings?: { date: string; count: number }[] })?.readings ?? []
})

function onPeriodChange(days: number) {
  activeDays.value = days
}

// Allergen breakdown
const allergenData = computed(() => {
  return currentData.value?.allergens ?? null
})

// Forecast data from Google Pollen API
const forecastDays = computed(() => {
  return currentData.value?.forecast ?? []
})

const healthTips = computed(() => {
  const tips = currentData.value?.forecast?.[0]?.healthRecommendations ?? []
  return tips.slice(0, 5)
})

// Severity background gradient (theme-aware)
const severityGradient = computed(() => {
  if (!currentData.value || !hydrated.value) return 'none'
  const level = currentData.value?.current?.level ?? 'Low'
  const isDark = colorMode.value === 'dark'
  const alpha = isDark ? 0.08 : 0.06
  const base = isDark ? 'rgba(10,15,26,0.95)' : 'rgba(248,250,252,0.95)'
  const gradients: Record<string, string> = {
    Low: `linear-gradient(135deg, rgba(34,197,94,${alpha}), ${base})`,
    Medium: `linear-gradient(135deg, rgba(234,179,8,${alpha}), ${base})`,
    High: `linear-gradient(135deg, rgba(249,115,22,${alpha}), ${base})`,
    'Very High': `linear-gradient(135deg, rgba(239,68,68,${alpha}), ${base})`,
    Severe: `linear-gradient(135deg, rgba(168,85,247,${alpha}), ${base})`,
  }
  return gradients[level] || gradients['Low']
})

const lastUpdatedFormatted = computed(() => {
  if (!currentData.value?.current?.date) return ''
  return currentData.value.current.date
})

function formatDayName(dateStr: string): string {
  const d = new Date(dateStr + 'T12:00:00')
  return d.toLocaleDateString('en-US', { weekday: 'short' })
}

function severityColor(level: string): string {
  const map: Record<string, string> = {
    Low: '#22C55E',
    Medium: '#EAB308',
    High: '#F97316',
    'Very High': '#EF4444',
    Severe: '#A855F7',
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
        <span class="text-default font-medium">Cedar Pollen</span>
      </div>
      <div class="flex items-center gap-1">
        <NuxtLink
          to="/pollen/about"
          class="px-3 py-1.5 text-xs font-medium text-muted rounded-lg hover:text-default hover:bg-elevated transition-colors"
        >
          About Cedar Fever
        </NuxtLink>
        <NuxtLink
          to="/pollen/tips"
          class="px-3 py-1.5 text-xs font-medium text-muted rounded-lg hover:text-default hover:bg-elevated transition-colors"
        >
          Tips
        </NuxtLink>
      </div>
    </div>

    <!-- Combined Hero + Chart -->
    <section
      class="rounded-[20px] max-sm:rounded-2xl p-8 max-sm:py-6 max-sm:px-4 mb-6 border border-default overflow-hidden"
      :style="hydrated ? { background: severityGradient } : undefined"
    >
      <div class="flex justify-between items-center mb-6">
        <div class="flex items-center gap-2">
          <span class="size-2 bg-success rounded-full animate-pulse-dot" />
          <span class="text-[0.7rem] font-semibold text-success uppercase tracking-wider"
            >Live Data</span
          >
        </div>
        <ClientOnly>
          <span v-if="lastUpdatedFormatted" class="text-[0.65rem] text-muted"
            >Updated {{ lastUpdatedFormatted }}</span
          >
        </ClientOnly>
      </div>

      <div
        v-if="currentData"
        class="grid grid-cols-[auto_1fr] max-lg:grid-cols-1 gap-10 max-lg:gap-6 items-center min-h-[260px]"
      >
        <!-- Left: Ring + Description -->
        <div
          class="flex flex-col items-center text-center gap-3 shrink-0 min-w-[220px] max-lg:min-w-0"
        >
          <PollenSeverityRing :count="(currentData as any).current.count" :size="200" />
          <p class="text-[0.85rem] text-muted leading-relaxed max-w-[240px]">
            {{ (currentData as any).current.description }}
          </p>
        </div>

        <!-- Right: Chart integrated inline -->
        <div class="min-w-0 flex-1">
          <PollenChart
            :data="historyData"
            :loading="historyPending"
            @period-change="onPeriodChange"
          />
        </div>
      </div>
      <div v-else class="text-center py-[60px] flex flex-col items-center gap-3">
        <UIcon name="i-lucide-loader-2" class="size-6 animate-spin text-muted" />
        <p class="text-muted text-sm">Loading pollen data...</p>
      </div>
    </section>

    <!-- Stats Row -->
    <section
      v-if="currentData"
      class="grid grid-cols-4 max-lg:grid-cols-2 max-sm:grid-cols-2 gap-3 mb-6"
    >
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
    <section v-if="allergenData" class="mb-6">
      <h2 class="text-[0.85rem] font-semibold text-muted uppercase tracking-[0.06em] mb-1">
        Allergen Breakdown
      </h2>
      <p class="text-[0.7rem] text-muted mb-4">Current grains/m³ by type</p>
      <div class="grid grid-cols-3 max-sm:grid-cols-1 gap-3">
        <div class="bg-elevated border border-default rounded-xl py-4.5 px-4">
          <div class="w-1 h-4 rounded-sm mb-2.5 opacity-70 bg-error" />
          <div class="text-[0.7rem] text-muted uppercase tracking-[0.06em] mb-1">Cedar</div>
          <div class="text-2xl font-bold tabular-nums text-error">
            {{ allergenData.cedar?.toLocaleString() ?? '—' }}
          </div>
          <div class="text-[0.6rem] text-dimmed uppercase tracking-[0.06em]">grains/m³</div>
        </div>
        <div class="bg-elevated border border-default rounded-xl py-4.5 px-4">
          <div class="w-1 h-4 rounded-sm mb-2.5 opacity-70 bg-info" />
          <div class="text-[0.7rem] text-muted uppercase tracking-[0.06em] mb-1">Elm</div>
          <div class="text-2xl font-bold tabular-nums text-info">
            {{ allergenData.elm?.toLocaleString() ?? '—' }}
          </div>
          <div class="text-[0.6rem] text-dimmed uppercase tracking-[0.06em]">grains/m³</div>
        </div>
        <div class="bg-elevated border border-default rounded-xl py-4.5 px-4">
          <div class="w-1 h-4 rounded-sm mb-2.5 opacity-70 bg-primary" />
          <div class="text-[0.7rem] text-muted uppercase tracking-[0.06em] mb-1">Mold</div>
          <div class="text-2xl font-bold tabular-nums text-primary">
            {{ allergenData.mold?.toLocaleString() ?? '—' }}
          </div>
          <div class="text-[0.6rem] text-dimmed uppercase tracking-[0.06em]">grains/m³</div>
        </div>
      </div>
    </section>

    <!-- 5-Day Forecast -->
    <section v-if="forecastDays.length > 0" class="mb-6">
      <h2 class="text-[0.85rem] font-semibold text-muted uppercase tracking-[0.06em] mb-1">
        5-Day Forecast
      </h2>
      <p class="text-[0.7rem] text-muted mb-4">Projected pollen levels based on recent trends</p>
      <div class="grid grid-cols-5 max-lg:grid-cols-3 max-sm:grid-cols-2 gap-3">
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
    <section v-if="healthTips.length > 0" class="mb-6">
      <h2 class="text-[0.85rem] font-semibold text-muted uppercase tracking-[0.06em] mb-1">
        Quick Protection Tips
      </h2>
      <div class="grid grid-cols-4 max-lg:grid-cols-2 max-sm:grid-cols-1 gap-3 mt-4">
        <div
          v-for="(tip, i) in healthTips"
          :key="i"
          class="bg-elevated border border-default rounded-xl py-5 px-4 transition-colors duration-200 hover:border-[var(--color-border-hover)]"
        >
          <div
            class="size-9 bg-primary/10 rounded-[10px] flex items-center justify-center text-primary mb-3"
          >
            <UIcon name="i-lucide-shield-check" class="size-5" />
          </div>
          <p class="text-xs text-muted leading-normal">{{ tip }}</p>
        </div>
      </div>
    </section>

    <!-- Data source attribution -->
    <ClientOnly>
      <div class="text-center text-[0.65rem] text-dimmed pt-2">
        Data from KXAN &amp; Google Pollen API
      </div>
    </ClientOnly>
  </div>
</template>
