<script setup lang="ts">
usePageSeo({
  title: 'Cedar Allergy Tips & Treatment',
  description:
    'Expert tips for managing cedar fever in Austin, TX. Prevention strategies, medication guide, home remedies, and when to see a doctor.',
})

useSchemaOrg([
  defineArticle({
    headline: 'Cedar Allergy Tips & Treatment — Austin, TX',
    description: 'Evidence-based strategies for managing cedar fever in Austin.',
    datePublished: '2025-12-01',
    dateModified: '2026-02-01',
  }),
])

const sections = [
  {
    title: 'Prevention Strategies',
    icon: 'i-lucide-shield',
    items: [
      {
        heading: 'Monitor Daily Counts',
        text: 'Check pollen counts each morning before planning outdoor activities. Counts above 500 grains/m³ warrant extra precautions.',
      },
      {
        heading: 'Keep Windows Closed',
        text: 'During high pollen days, keep all windows and doors sealed. Cedar pollen particles are tiny (20–30 microns) and easily infiltrate homes.',
      },
      {
        heading: 'HEPA Air Purifier',
        text: 'Run a HEPA filter in your bedroom and main living areas. True HEPA filters (H13 or higher) capture 99.97% of particles ≥ 0.3 microns.',
      },
      {
        heading: 'Change HVAC Filters',
        text: 'Replace your HVAC filter with a MERV 13+ rated filter during cedar season (Dec–Feb). Change it monthly during peak periods.',
      },
      {
        heading: 'Shower After Outdoors',
        text: 'Pollen clings to hair, skin, and clothing. Shower and change clothes immediately after outdoor exposure.',
      },
      {
        heading: 'Limit Peak Hours',
        text: 'Cedar pollen counts tend to be highest in the morning (6–10 AM) and after cold fronts pass. Plan outdoor activities accordingly.',
      },
    ],
  },
  {
    title: 'Medication Guide',
    icon: 'i-lucide-pill',
    items: [
      {
        heading: 'Antihistamines',
        text: 'Second-generation antihistamines (cetirizine, loratadine, fexofenadine) are first-line treatment. Start taking them 1–2 weeks before cedar season begins for best results.',
      },
      {
        heading: 'Nasal Corticosteroids',
        text: 'Fluticasone (Flonase) and triamcinolone (Nasacort) nasal sprays reduce inflammation. Use daily — they take 3–5 days to reach full effectiveness.',
      },
      {
        heading: 'Nasal Saline Rinse',
        text: 'NeilMed or neti pot rinses flush pollen from nasal passages. Use after outdoor exposure. Always use distilled or sterile water.',
      },
      {
        heading: 'Eye Drops',
        text: 'Ketotifen (Zaditor) or olopatadine antihistamine drops relieve itchy, watery eyes. Apply before going outdoors on high count days.',
      },
      {
        heading: 'Decongestants',
        text: 'Pseudoephedrine provides short-term relief. Avoid nasal decongestant sprays (oxymetazoline) for more than 3 consecutive days to prevent rebound congestion.',
      },
    ],
  },
  {
    title: 'Home Remedies',
    icon: 'i-lucide-home',
    items: [
      {
        heading: 'Local Honey',
        text: 'While scientific evidence is limited, some Austinites swear by local raw honey. The theory: trace pollen exposure may help build tolerance. Take 1 tablespoon daily.',
      },
      {
        heading: 'Steam Inhalation',
        text: 'Breathing steam with a few drops of eucalyptus oil can relieve sinus congestion. Cup your face over a bowl of hot water with a towel draped over your head.',
      },
      {
        heading: 'Quercetin Supplement',
        text: 'This natural flavonoid found in onions and apples may stabilize mast cells and reduce histamine release. Typical dose: 500–1000mg daily.',
      },
      {
        heading: 'Spicy Foods',
        text: 'Capsaicin in hot peppers can temporarily open nasal passages. Hot soups and teas also help thin mucus.',
      },
    ],
  },
  {
    title: 'When to See a Doctor',
    icon: 'i-lucide-alert-circle',
    items: [
      {
        heading: 'Persistent Symptoms',
        text: 'If over-the-counter medications are not providing relief after 2 weeks of consistent use, consult an allergist.',
      },
      {
        heading: 'Sinus Infections',
        text: 'Watch for thick, discolored nasal discharge, facial pain/pressure, or fever — these suggest a secondary sinus infection requiring medical treatment.',
      },
      {
        heading: 'Asthma Symptoms',
        text: 'Cedar pollen can trigger asthma attacks. Seek immediate care for wheezing, chest tightness, shortness of breath, or persistent coughing.',
      },
      {
        heading: 'Immunotherapy',
        text: 'For severe, recurring cedar allergies, ask your allergist about allergy shots (subcutaneous immunotherapy) or sublingual tablets. Treatment typically takes 3–5 years but provides long-term relief.',
      },
    ],
  },
]
</script>

<template>
  <div>
    <div class="mb-8">
      <h1 class="text-[1.75rem] font-bold tracking-tight mb-1.5">Cedar Allergy Tips & Treatment</h1>
      <p class="text-[0.85rem] text-muted">
        Evidence-based strategies for managing cedar fever in Austin
      </p>
    </div>

    <section
      v-for="section in sections"
      :key="section.title"
      class="bg-elevated border border-default rounded-2xl py-7 px-6 max-sm:py-5 max-sm:px-4 mb-4"
    >
      <div class="flex items-center gap-2 mb-5 text-muted">
        <UIcon :name="section.icon" class="size-4" />
        <h2 class="text-[0.85rem] font-semibold text-muted uppercase tracking-[0.06em]">
          {{ section.title }}
        </h2>
      </div>
      <div class="flex flex-col gap-4">
        <div
          v-for="item in section.items"
          :key="item.heading"
          class="flex gap-3.5 py-3.5 px-4 bg-elevated rounded-xl border border-default transition-colors duration-200 hover:border-(--color-border-hover)"
        >
          <div class="w-1 min-h-full bg-primary rounded-sm opacity-50" />
          <div>
            <h3 class="text-[0.8rem] font-semibold text-default mb-1">{{ item.heading }}</h3>
            <p class="text-xs text-muted leading-relaxed">{{ item.text }}</p>
          </div>
        </div>
      </div>
    </section>

    <section class="flex gap-3.5 p-5 bg-warning/5 border border-warning/12 rounded-[14px]">
      <div
        class="size-8 min-w-8 bg-warning/12 rounded-lg flex items-center justify-center text-warning"
      >
        <UIcon name="i-lucide-info" class="size-4" />
      </div>
      <div>
        <h3 class="text-[0.8rem] font-semibold text-warning mb-1">Medical Disclaimer</h3>
        <p class="text-[0.72rem] text-muted leading-relaxed">
          This information is for educational purposes only and is not a substitute for professional
          medical advice. Always consult with a qualified healthcare provider before starting any
          new medication or treatment.
        </p>
      </div>
    </section>
  </div>
</template>
