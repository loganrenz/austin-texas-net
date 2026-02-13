<script setup lang="ts">
const { getCategoryBySlug } = useSiteData()
const category = getCategoryBySlug('allergies')!

usePageSeo({
  title: 'Austin Allergies — Cedar & Oak Pollen Tracking',
  description:
    'Live pollen counts and allergy tracking for Austin, Texas. Cedar fever season updates, oak pollen forecasts, and severity levels in grains/m³.',
})

useSchemaOrg([
  defineWebPage({
    name: 'Austin Allergies — Cedar & Oak Pollen Tracking',
    description:
      'Live pollen counts and allergy tracking for Austin, Texas. Cedar fever season updates, oak pollen forecasts, and severity levels.',
  }),
])

interface PollenCurrentResponse {
  current: {
    date: string
    count: number
    level: string
    source: string
    description: string
  } | null
}

// Live pollen data for the "live now" module
const { data: pollenData } = await useFetch<PollenCurrentResponse>('/api/pollen/current', {
  server: false,
  lazy: true,
})

const cedarLevel = computed(() => pollenData.value?.current?.level ?? null)
const cedarCount = computed(() => pollenData.value?.current?.count ?? null)
const lastUpdated = computed(() => pollenData.value?.current?.date ?? null)

function severityColor(level: string | null): string {
  const map: Record<string, string> = {
    Low: '#22C55E',
    Medium: '#EAB308',
    High: '#F97316',
    'Very High': '#EF4444',
    Severe: '#A855F7',
  }
  return level ? map[level] || '#9CA3AF' : '#9CA3AF'
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
  {
    question: 'When is cedar season in Austin?',
    answer:
      'Cedar (Mountain Juniper) pollen season runs from mid-December through mid-February, with peak counts typically occurring in January. Cold fronts trigger the heaviest pollen releases.',
  },
  {
    question: 'Why are allergies so bad in Austin?',
    answer:
      'Austin sits at the eastern edge of the Hill Country, directly in the pollen drift path from millions of Ashe Juniper and oak trees. The mild climate supports year-round allergen production, and population growth means more people are exposed each year.',
  },
  {
    question: 'When is oak pollen season in Austin?',
    answer:
      'Oak pollen season in Austin typically runs from late February through April, overlapping with the tail end of cedar season. Live oak and red oak are the primary producers.',
  },
  {
    question: 'What is a high pollen count?',
    answer:
      'For cedar pollen, counts above 500 grains/m³ are considered high, above 1,500 is very high, and above 5,000 is severe. Most allergy sufferers begin experiencing symptoms at just 50 grains/m³.',
  },
]
</script>

<template>
  <CategoryPage :category="category" :overview="overview" :faq-items="faqItems">
    <!-- Live Now module (item 4) -->
    <template #live-now>
      <section class="mb-6">
        <h2
          class="text-xs font-bold uppercase tracking-widest text-muted mb-3 flex items-center gap-2"
        >
          <span class="animate-pulse-dot size-[7px] bg-success rounded-full" />
          Live Now
        </h2>
        <NuxtLink
          to="/allergies/cedar-pollen/"
          class="group flex items-center gap-4 bg-elevated border border-default rounded-2xl p-5 no-underline text-inherit transition-all hover:border-(--color-border-hover) hover:shadow-[0_4px_20px_rgba(0,0,0,0.04)] max-sm:flex-col max-sm:items-start"
        >
          <div
            class="size-12 rounded-xl flex items-center justify-center shrink-0"
            :style="{ background: severityColor(cedarLevel) }"
          >
            <UIcon name="i-lucide-flower-2" class="size-6 text-white" />
          </div>
          <div class="flex-1 min-w-0">
            <div class="text-[0.9rem] font-bold mb-0.5">Cedar Pollen Tracker</div>
            <ClientOnly>
              <div
                v-if="cedarLevel"
                class="text-[0.85rem] font-semibold"
                :style="{ color: severityColor(cedarLevel) }"
              >
                {{ cedarLevel }} — {{ cedarCount?.toLocaleString() }} gr/m³
              </div>
              <div v-else class="text-[0.85rem] text-muted font-medium">
                Loading current levels…
              </div>
              <template #fallback>
                <div class="text-[0.85rem] text-muted font-medium">—</div>
              </template>
            </ClientOnly>
            <div v-if="lastUpdated" class="text-[0.65rem] text-dimmed mt-0.5">
              Updated {{ lastUpdated }}
            </div>
          </div>
          <div
            class="text-xs font-semibold text-muted flex items-center whitespace-nowrap shrink-0 max-sm:mt-2 group-hover:text-primary transition-colors"
          >
            Open tracker
            <UIcon
              name="i-lucide-arrow-right"
              class="size-3.5 ml-1 group-hover:translate-x-0.5 transition-transform"
            />
          </div>
        </NuxtLink>
      </section>
    </template>
  </CategoryPage>
</template>
