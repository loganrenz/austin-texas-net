<script setup lang="ts">
usePageSeo({
  title: 'Cedar Allergy Tips & Treatment',
  description: 'Expert tips for managing cedar fever in Austin, TX. Prevention strategies, medication guide, home remedies, and when to see a doctor.',
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
      { heading: 'Monitor Daily Counts', text: 'Check pollen counts each morning before planning outdoor activities. Counts above 500 grains/m³ warrant extra precautions.' },
      { heading: 'Keep Windows Closed', text: 'During high pollen days, keep all windows and doors sealed. Cedar pollen particles are tiny (20–30 microns) and easily infiltrate homes.' },
      { heading: 'HEPA Air Purifier', text: 'Run a HEPA filter in your bedroom and main living areas. True HEPA filters (H13 or higher) capture 99.97% of particles ≥ 0.3 microns.' },
      { heading: 'Change HVAC Filters', text: 'Replace your HVAC filter with a MERV 13+ rated filter during cedar season (Dec–Feb). Change it monthly during peak periods.' },
      { heading: 'Shower After Outdoors', text: 'Pollen clings to hair, skin, and clothing. Shower and change clothes immediately after outdoor exposure.' },
      { heading: 'Limit Peak Hours', text: 'Cedar pollen counts tend to be highest in the morning (6–10 AM) and after cold fronts pass. Plan outdoor activities accordingly.' },
    ]
  },
  {
    title: 'Medication Guide',
    icon: 'i-lucide-pill',
    items: [
      { heading: 'Antihistamines', text: 'Second-generation antihistamines (cetirizine, loratadine, fexofenadine) are first-line treatment. Start taking them 1–2 weeks before cedar season begins for best results.' },
      { heading: 'Nasal Corticosteroids', text: 'Fluticasone (Flonase) and triamcinolone (Nasacort) nasal sprays reduce inflammation. Use daily — they take 3–5 days to reach full effectiveness.' },
      { heading: 'Nasal Saline Rinse', text: 'NeilMed or neti pot rinses flush pollen from nasal passages. Use after outdoor exposure. Always use distilled or sterile water.' },
      { heading: 'Eye Drops', text: 'Ketotifen (Zaditor) or olopatadine antihistamine drops relieve itchy, watery eyes. Apply before going outdoors on high count days.' },
      { heading: 'Decongestants', text: 'Pseudoephedrine provides short-term relief. Avoid nasal decongestant sprays (oxymetazoline) for more than 3 consecutive days to prevent rebound congestion.' },
    ]
  },
  {
    title: 'Home Remedies',
    icon: 'i-lucide-home',
    items: [
      { heading: 'Local Honey', text: 'While scientific evidence is limited, some Austinites swear by local raw honey. The theory: trace pollen exposure may help build tolerance. Take 1 tablespoon daily.' },
      { heading: 'Steam Inhalation', text: 'Breathing steam with a few drops of eucalyptus oil can relieve sinus congestion. Cup your face over a bowl of hot water with a towel draped over your head.' },
      { heading: 'Quercetin Supplement', text: 'This natural flavonoid found in onions and apples may stabilize mast cells and reduce histamine release. Typical dose: 500–1000mg daily.' },
      { heading: 'Spicy Foods', text: 'Capsaicin in hot peppers can temporarily open nasal passages. Hot soups and teas also help thin mucus.' },
    ]
  },
  {
    title: 'When to See a Doctor',
    icon: 'i-lucide-alert-circle',
    items: [
      { heading: 'Persistent Symptoms', text: 'If over-the-counter medications are not providing relief after 2 weeks of consistent use, consult an allergist.' },
      { heading: 'Sinus Infections', text: 'Watch for thick, discolored nasal discharge, facial pain/pressure, or fever — these suggest a secondary sinus infection requiring medical treatment.' },
      { heading: 'Asthma Symptoms', text: 'Cedar pollen can trigger asthma attacks. Seek immediate care for wheezing, chest tightness, shortness of breath, or persistent coughing.' },
      { heading: 'Immunotherapy', text: 'For severe, recurring cedar allergies, ask your allergist about allergy shots (subcutaneous immunotherapy) or sublingual tablets. Treatment typically takes 3–5 years but provides long-term relief.' },
    ]
  }
]
</script>

<template>
  <div>
    <div class="page-header">
      <h1 class="page-title">Cedar Allergy Tips & Treatment</h1>
      <p class="page-subtitle">Evidence-based strategies for managing cedar fever in Austin</p>
    </div>

    <section v-for="section in sections" :key="section.title" class="tips-section">
      <div class="section-header">
        <UIcon :name="section.icon" class="size-4" />
        <h2 class="section-heading">{{ section.title }}</h2>
      </div>
      <div class="tips-list">
        <div v-for="item in section.items" :key="item.heading" class="tip-item">
          <div class="tip-marker" />
          <div class="tip-body">
            <h3 class="tip-heading">{{ item.heading }}</h3>
            <p class="tip-text">{{ item.text }}</p>
          </div>
        </div>
      </div>
    </section>

    <section class="disclaimer-card">
      <div class="disclaimer-icon">
        <UIcon name="i-lucide-info" class="size-4" />
      </div>
      <div>
        <h3 class="disclaimer-title">Medical Disclaimer</h3>
        <p class="disclaimer-text">
          This information is for educational purposes only and is not a substitute for professional medical advice.
          Always consult with a qualified healthcare provider before starting any new medication or treatment.
        </p>
      </div>
    </section>
  </div>
</template>

<style scoped>
.page-header {
  margin-bottom: 32px;
}

.page-title {
  font-size: 1.75rem;
  font-weight: 700;
  letter-spacing: -0.02em;
  margin-bottom: 6px;
}

.page-subtitle {
  font-size: 0.85rem;
  color: var(--color-text-muted);
}

.tips-section {
  background: var(--color-surface);
  border: 1px solid var(--color-border);
  border-radius: 16px;
  padding: 28px 24px;
  margin-bottom: 16px;
}

.section-header {
  display: flex;
  align-items: center;
  gap: 8px;
  margin-bottom: 20px;
  color: var(--color-text-secondary);
}

.section-heading {
  font-size: 0.85rem;
  font-weight: 600;
  color: var(--color-text-secondary);
  text-transform: uppercase;
  letter-spacing: 0.06em;
}

.tips-list {
  display: flex;
  flex-direction: column;
  gap: 16px;
}

.tip-item {
  display: flex;
  gap: 14px;
  padding: 14px 16px;
  background: var(--color-surface);
  border-radius: 12px;
  border: 1px solid var(--color-border);
  transition: border-color 0.2s ease;
}

.tip-item:hover {
  border-color: var(--color-border-hover);
}

.tip-marker {
  width: 4px;
  min-height: 100%;
  background: var(--color-primary);
  border-radius: 2px;
  opacity: 0.5;
}

.tip-heading {
  font-size: 0.8rem;
  font-weight: 600;
  color: var(--color-text);
  margin-bottom: 4px;
}

.tip-text {
  font-size: 0.75rem;
  color: var(--color-text-muted);
  line-height: 1.6;
}

/* Disclaimer */
.disclaimer-card {
  display: flex;
  gap: 14px;
  padding: 20px;
  background: rgba(234,179,8,0.05);
  border: 1px solid rgba(234,179,8,0.12);
  border-radius: 14px;
}

.disclaimer-icon {
  width: 32px;
  height: 32px;
  min-width: 32px;
  background: rgba(234,179,8,0.12);
  border-radius: 8px;
  display: flex;
  align-items: center;
  justify-content: center;
  color: #EAB308;
}

.disclaimer-title {
  font-size: 0.8rem;
  font-weight: 600;
  color: #EAB308;
  margin-bottom: 4px;
}

.disclaimer-text {
  font-size: 0.72rem;
  color: var(--color-text-muted);
  line-height: 1.6;
}

@media (max-width: 640px) {
  .tips-section { padding: 20px 16px; }
}
</style>
