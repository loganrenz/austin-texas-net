<script setup lang="ts">
useSeoMeta({
  title: 'What is Cedar Fever? — Austin Cedar Pollen Tracker',
  description: 'Understand mountain cedar allergies in Austin, TX. Learn about Ashe Juniper pollen, why Austin is a hotspot, the seasonal timeline, and severity levels in grains/m³.',
})

const severityScale = [
  { level: 'Low', range: '0 – 50', color: '#22C55E', description: 'Minimal pollen. Most people unaffected.' },
  { level: 'Medium', range: '50 – 500', color: '#EAB308', description: 'Moderate. Sensitive individuals may notice symptoms.' },
  { level: 'High', range: '500 – 1,500', color: '#F97316', description: 'High levels. Allergy sufferers should limit outdoor time.' },
  { level: 'Very High', range: '1,500 – 5,000', color: '#EF4444', description: 'Very high. Stay indoors if possible. Keep windows closed.' },
  { level: 'Severe', range: '5,000+', color: '#A855F7', description: 'Extreme levels. Avoid outdoor activity.' },
]

const timeline = [
  { period: 'October – November', detail: 'Early cedar pollen release begins. Counts usually under 100 grains/m³.' },
  { period: 'December', detail: 'Season accelerates. Cold fronts trigger pollen bursts. Counts can spike to 1,000+.' },
  { period: 'January', detail: 'Peak season. Counts regularly exceed 2,000–8,000+ grains/m³ in Austin.' },
  { period: 'February', detail: 'Gradually declining but still significant. Late cold fronts cause final spikes.' },
  { period: 'March', detail: 'Cedar season ends. Oak pollen begins its peak.' },
]

const facts = [
  { icon: 'i-lucide-map-pin', title: 'Geographic Position', text: 'Austin sits at the eastern edge of the Hill Country, directly in the pollen drift path from millions of juniper trees.' },
  { icon: 'i-lucide-wind', title: 'Cold Front Triggers', text: 'Winter cold fronts cause male juniper trees to release massive clouds of pollen simultaneously, creating sudden spikes.' },
  { icon: 'i-lucide-users', title: 'Population Growth', text: 'Many Austin transplants develop cedar allergies after 1–3 years of exposure. The immune system becomes sensitized over time.' },
  { icon: 'i-lucide-droplets', title: 'Drought Resistance', text: 'Ashe Juniper thrives in Texas drought conditions. While other vegetation declines, juniper populations continue expanding.' },
]
</script>

<template>
  <div>
    <div class="page-header">
      <h1 class="page-title">What is Cedar Fever?</h1>
      <p class="page-subtitle">
        Understanding mountain cedar allergies in Central Texas
      </p>
    </div>

    <!-- Cedar tree hero image -->
    <div class="cedar-banner">
      <img src="/images/cedar-tree-pollen.png" alt="Ashe Juniper (mountain cedar) tree releasing pollen in the Texas Hill Country" class="cedar-banner-img" />
      <div class="cedar-banner-overlay" />
      <div class="cedar-banner-caption">
        Ashe Juniper releasing pollen in the Texas Hill Country
      </div>
    </div>

    <!-- Overview -->
    <section class="content-card">
      <h2 class="card-heading">About Mountain Cedar</h2>
      <div class="card-body">
        <p>
          "Cedar fever" is the colloquial name for the allergic reaction caused by <strong>Ashe Juniper (Juniperus ashei)</strong>
          pollen. Despite the name, it's not caused by true cedar — it's a juniper species native to the Texas Hill Country.
        </p>
        <p>
          Central Texas is one of the worst places in the world for cedar allergies. Austin sits directly downwind of the
          Hill Country, where millions of Ashe Juniper trees release enormous quantities of pollen during winter months.
        </p>
        <p>
          Pollen counts in Austin regularly surge past <strong>5,000 grains/m³</strong> during peak periods, with some
          days exceeding <strong>8,000–10,000 grains/m³</strong>. For context, most allergy sufferers begin experiencing
          symptoms at just 50 grains/m³.
        </p>
      </div>
    </section>

    <!-- Why Austin -->
    <section class="content-card">
      <h2 class="card-heading">Why Austin Is a Hotspot</h2>
      <div class="facts-grid">
        <div v-for="fact in facts" :key="fact.title" class="fact-item">
          <div class="fact-icon">
            <UIcon :name="fact.icon" class="size-5" />
          </div>
          <div>
            <h3 class="fact-title">{{ fact.title }}</h3>
            <p class="fact-text">{{ fact.text }}</p>
          </div>
        </div>
      </div>
    </section>

    <!-- Seasonal Timeline -->
    <section class="content-card">
      <h2 class="card-heading">Seasonal Timeline</h2>
      <div class="timeline">
        <div v-for="(item, i) in timeline" :key="i" class="timeline-item">
          <div class="timeline-marker" />
          <div class="timeline-content">
            <h3 class="timeline-period">{{ item.period }}</h3>
            <p class="timeline-detail">{{ item.detail }}</p>
          </div>
        </div>
      </div>
    </section>

    <!-- Severity Scale -->
    <section class="content-card">
      <h2 class="card-heading">Severity Scale Guide</h2>
      <p class="card-subheading">Pollen counts measured in grains per cubic meter (grains/m³)</p>
      <div class="severity-table">
        <div v-for="s in severityScale" :key="s.level" class="severity-row">
          <div class="severity-color" :style="{ backgroundColor: s.color }" />
          <div class="severity-level" :style="{ color: s.color }">{{ s.level }}</div>
          <div class="severity-range">{{ s.range }} gr/m³</div>
          <div class="severity-desc">{{ s.description }}</div>
        </div>
      </div>
    </section>
  </div>
</template>

<style scoped>
.page-header {
  margin-bottom: 24px;
}

/* Cedar banner */
.cedar-banner {
  position: relative;
  border-radius: 16px;
  overflow: hidden;
  margin-bottom: 24px;
  max-height: 280px;
}

.cedar-banner-img {
  width: 100%;
  height: 100%;
  object-fit: cover;
  display: block;
}

.cedar-banner-overlay {
  position: absolute;
  inset: 0;
  background: linear-gradient(to top, var(--color-bg) 0%, transparent 60%);
}

.cedar-banner-caption {
  position: absolute;
  bottom: 16px;
  left: 20px;
  font-size: 0.7rem;
  color: var(--color-text-muted);
  font-style: italic;
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

.content-card {
  background: var(--color-surface);
  border: 1px solid var(--color-border);
  border-radius: 16px;
  padding: 28px 24px;
  margin-bottom: 16px;
}

.card-heading {
  font-size: 0.85rem;
  font-weight: 600;
  color: var(--color-text-secondary);
  text-transform: uppercase;
  letter-spacing: 0.06em;
  margin-bottom: 16px;
}

.card-subheading {
  font-size: 0.7rem;
  color: var(--color-text-muted);
  margin-top: -12px;
  margin-bottom: 16px;
}

.card-body p {
  font-size: 0.85rem;
  line-height: 1.7;
  color: var(--color-text-secondary);
  margin-bottom: 12px;
}

.card-body p:last-child {
  margin-bottom: 0;
}

.card-body strong {
  color: var(--color-text);
}

/* Facts grid */
.facts-grid {
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: 14px;
}

.fact-item {
  display: flex;
  gap: 14px;
  padding: 16px;
  background: var(--color-surface);
  border-radius: 12px;
  border: 1px solid var(--color-border);
}

.fact-icon {
  width: 36px;
  height: 36px;
  min-width: 36px;
  background: rgba(16,185,129,0.1);
  border-radius: 10px;
  display: flex;
  align-items: center;
  justify-content: center;
  color: var(--color-primary);
}

.fact-title {
  font-size: 0.8rem;
  font-weight: 600;
  margin-bottom: 4px;
  color: var(--color-text);
}

.fact-text {
  font-size: 0.75rem;
  color: var(--color-text-muted);
  line-height: 1.5;
}

/* Timeline */
.timeline {
  position: relative;
  padding-left: 24px;
}

.timeline::before {
  content: '';
  position: absolute;
  left: 6px;
  top: 8px;
  bottom: 8px;
  width: 1px;
  background: var(--color-border);
}

.timeline-item {
  position: relative;
  padding-bottom: 20px;
}

.timeline-item:last-child {
  padding-bottom: 0;
}

.timeline-marker {
  position: absolute;
  left: -21px;
  top: 6px;
  width: 9px;
  height: 9px;
  border-radius: 50%;
  background: var(--color-primary);
  border: 2px solid var(--color-bg);
}

.timeline-period {
  font-size: 0.8rem;
  font-weight: 600;
  color: var(--color-text);
  margin-bottom: 4px;
}

.timeline-detail {
  font-size: 0.75rem;
  color: var(--color-text-muted);
  line-height: 1.5;
}

/* Severity scale */
.severity-table {
  display: flex;
  flex-direction: column;
  gap: 8px;
}

.severity-row {
  display: grid;
  grid-template-columns: 4px 100px 120px 1fr;
  gap: 14px;
  align-items: center;
  padding: 12px 16px;
  background: var(--color-surface);
  border-radius: 10px;
}

.severity-color {
  width: 4px;
  height: 24px;
  border-radius: 2px;
}

.severity-level {
  font-size: 0.8rem;
  font-weight: 600;
}

.severity-range {
  font-size: 0.75rem;
  color: var(--color-text-muted);
  font-variant-numeric: tabular-nums;
}

.severity-desc {
  font-size: 0.75rem;
  color: var(--color-text-muted);
}

@media (max-width: 768px) {
  .facts-grid { grid-template-columns: 1fr; }
  .severity-row { grid-template-columns: 4px 80px 90px 1fr; gap: 10px; }
}

@media (max-width: 480px) {
  .severity-row { grid-template-columns: 4px 1fr; }
  .severity-range, .severity-desc { grid-column: 2; }
  .content-card { padding: 20px 16px; }
}
</style>
