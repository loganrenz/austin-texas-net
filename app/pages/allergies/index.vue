<script setup lang="ts">
const { getCategoryBySlug } = useSiteData()
const category = getCategoryBySlug('allergies')!

usePageSeo({
  title: 'Austin Allergies — Cedar & Oak Pollen Tracking',
  description: 'Live pollen counts and allergy tracking for Austin, Texas. Cedar fever season updates, oak pollen forecasts, and severity levels in grains/m³.',
})

useSchemaOrg([
  defineWebPage({
    name: 'Austin Allergies — Cedar & Oak Pollen Tracking',
    description: 'Live pollen counts and allergy tracking for Austin, Texas. Cedar fever season updates, oak pollen forecasts, and severity levels.',
  }),
])

// Live pollen data for the "live now" module
const { data: pollenData } = await useFetch('/api/pollen/current', {
  server: false,
  lazy: true,
})

const cedarLevel = computed(() => (pollenData.value as any)?.current?.level ?? null)
const cedarCount = computed(() => (pollenData.value as any)?.current?.count ?? null)
const lastUpdated = computed(() => (pollenData.value as any)?.current?.date ?? null)

function severityColor(level: string | null): string {
  const map: Record<string, string> = {
    'Low': '#22C55E',
    'Medium': '#EAB308',
    'High': '#F97316',
    'Very High': '#EF4444',
    'Severe': '#A855F7',
  }
  return level ? (map[level] || '#9CA3AF') : '#9CA3AF'
}

const overview = `
<h2>Austin's Allergy Problem</h2>
<p>Austin consistently ranks among the <strong>worst cities in America for allergies</strong>. The combination of geography, climate, and vegetation creates a near-continuous pollen assault from December through May, with cedar and oak as the primary culprits. Hundreds of thousands of Central Texans suffer from seasonal allergies, and newcomers often develop symptoms within their first 1-3 years of exposure.</p>

<h2>Cedar Fever Season</h2>
<p><strong>Mountain cedar</strong> (Ashe Juniper) is Austin's most notorious allergen. Despite its name, cedar fever rarely causes actual fever — but it can produce intense symptoms: sneezing, nasal congestion, itchy eyes, sore throat, and profound fatigue. Cedar season runs from <strong>mid-December through mid-February</strong>, with peak counts in January when cold fronts trigger massive pollen releases.</p>

<p>Pollen counts during peak cedar season routinely exceed <strong>5,000 grains/m³</strong> in Austin, with some days topping 8,000-10,000. For context, most allergy sufferers begin noticing symptoms at just 50 grains/m³. Austin sits at the eastern edge of the Hill Country, directly in the drift path of millions of juniper trees — a geographic perfect storm for allergy sufferers.</p>

<h2>Oak Pollen Season</h2>
<p>Just as cedar season winds down in February, <strong>oak pollen</strong> ramps up. Live oak and red oak trees produce significant pollen from <strong>late February through April</strong>, creating a one-two punch that keeps Austin allergy sufferers reaching for antihistamines well into spring. Oak pollen is heavy and visible — you'll see it coating cars, sidewalks, and windowsills in a fine yellow-green dust.</p>

<h2>Year-Round Tracking</h2>
<p>Our allergy tools provide <strong>real-time pollen counts</strong> sourced from local monitoring stations and the Google Pollen API. We track cedar, oak, grass, and mold spore levels so you can make informed decisions about outdoor activities, medication timing, and window management.</p>
`

const faqItems = [
  { question: 'When is cedar season in Austin?', answer: 'Cedar (Mountain Juniper) pollen season runs from mid-December through mid-February, with peak counts typically occurring in January. Cold fronts trigger the heaviest pollen releases.' },
  { question: 'Why are allergies so bad in Austin?', answer: 'Austin sits at the eastern edge of the Hill Country, directly in the pollen drift path from millions of Ashe Juniper and oak trees. The mild climate supports year-round allergen production, and population growth means more people are exposed each year.' },
  { question: 'When is oak pollen season in Austin?', answer: 'Oak pollen season in Austin typically runs from late February through April, overlapping with the tail end of cedar season. Live oak and red oak are the primary producers.' },
  { question: 'What is a high pollen count?', answer: 'For cedar pollen, counts above 500 grains/m³ are considered high, above 1,500 is very high, and above 5,000 is severe. Most allergy sufferers begin experiencing symptoms at just 50 grains/m³.' },
]
</script>

<template>
  <CategoryPage
    :category="category"
    :overview="overview"
    :faq-items="faqItems"
  >
    <!-- Live Now module (item 4) -->
    <template #live-now>
      <section class="live-now">
        <h2 class="live-label">
          <span class="live-dot" />
          Live Now
        </h2>
        <NuxtLink to="/allergies/cedar-pollen/" class="live-card group">
          <div class="live-icon" :style="{ background: severityColor(cedarLevel) }">
            <UIcon name="i-lucide-flower-2" class="size-6 text-white" />
          </div>
          <div class="live-body">
            <div class="live-title">Cedar Pollen Tracker</div>
            <ClientOnly>
              <div v-if="cedarLevel" class="live-value" :style="{ color: severityColor(cedarLevel) }">
                {{ cedarLevel }} — {{ cedarCount?.toLocaleString() }} gr/m³
              </div>
              <div v-else class="live-value live-loading">Loading current levels…</div>
              <template #fallback>
                <div class="live-value live-loading">—</div>
              </template>
            </ClientOnly>
            <div v-if="lastUpdated" class="live-updated">Updated {{ lastUpdated }}</div>
          </div>
          <div class="live-cta group-hover:text-primary transition-colors">
            Open tracker
            <UIcon name="i-lucide-arrow-right" class="size-3.5 ml-1 group-hover:translate-x-0.5 transition-transform" />
          </div>
        </NuxtLink>
      </section>
    </template>
  </CategoryPage>
</template>

<style scoped>
.live-now {
  margin-bottom: 24px;
}

.live-label {
  font-size: 0.75rem;
  font-weight: 700;
  text-transform: uppercase;
  letter-spacing: 0.08em;
  color: var(--color-text-muted);
  margin-bottom: 12px;
  display: flex;
  align-items: center;
  gap: 8px;
}

.live-dot {
  width: 7px;
  height: 7px;
  background: #22C55E;
  border-radius: 50%;
  animation: pulse-dot 2s infinite;
}

@keyframes pulse-dot {
  0%, 100% { opacity: 1; box-shadow: 0 0 0 0 rgba(34,197,94,0.4); }
  50% { opacity: 0.8; box-shadow: 0 0 0 5px rgba(34,197,94,0); }
}

.live-card {
  display: flex;
  align-items: center;
  gap: 16px;
  background: var(--color-surface);
  border: 1px solid var(--color-border);
  border-radius: 16px;
  padding: 20px;
  text-decoration: none;
  color: inherit;
  transition: all 0.2s ease;
}

.live-card:hover {
  border-color: var(--color-border-hover);
  box-shadow: 0 4px 20px rgba(0,0,0,0.04);
}

.live-icon {
  width: 48px;
  height: 48px;
  border-radius: 14px;
  display: flex;
  align-items: center;
  justify-content: center;
  flex-shrink: 0;
}

.live-body {
  flex: 1;
  min-width: 0;
}

.live-title {
  font-size: 0.9rem;
  font-weight: 700;
  margin-bottom: 2px;
}

.live-value {
  font-size: 0.85rem;
  font-weight: 600;
}

.live-loading {
  color: var(--color-text-muted);
  font-weight: 500;
}

.live-updated {
  font-size: 0.65rem;
  color: var(--color-text-faint);
  margin-top: 2px;
}

.live-cta {
  font-size: 0.75rem;
  font-weight: 600;
  color: var(--color-text-muted);
  display: flex;
  align-items: center;
  white-space: nowrap;
  flex-shrink: 0;
}

@media (max-width: 640px) {
  .live-card { flex-direction: column; align-items: flex-start; }
  .live-cta { margin-top: 8px; }
}
</style>
