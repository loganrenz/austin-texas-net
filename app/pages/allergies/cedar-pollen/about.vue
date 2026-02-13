<script setup lang="ts">
useSeoMeta({
  title: 'What is Cedar Fever? — Austin Cedar Pollen Tracker',
  description:
    'Understand mountain cedar allergies in Austin, TX. Learn about Ashe Juniper pollen, why Austin is a hotspot, the seasonal timeline, and severity levels in grains/m³.',
})

const severityScale = [
  {
    level: 'Low',
    range: '0 – 50',
    color: '#22C55E',
    description: 'Minimal pollen. Most people unaffected.',
  },
  {
    level: 'Medium',
    range: '50 – 500',
    color: '#EAB308',
    description: 'Moderate. Sensitive individuals may notice symptoms.',
  },
  {
    level: 'High',
    range: '500 – 1,500',
    color: '#F97316',
    description: 'High levels. Allergy sufferers should limit outdoor time.',
  },
  {
    level: 'Very High',
    range: '1,500 – 5,000',
    color: '#EF4444',
    description: 'Very high. Stay indoors if possible. Keep windows closed.',
  },
  {
    level: 'Severe',
    range: '5,000+',
    color: '#A855F7',
    description: 'Extreme levels. Avoid outdoor activity.',
  },
]

const timeline = [
  {
    period: 'October – November',
    detail: 'Early cedar pollen release begins. Counts usually under 100 grains/m³.',
  },
  {
    period: 'December',
    detail: 'Season accelerates. Cold fronts trigger pollen bursts. Counts can spike to 1,000+.',
  },
  {
    period: 'January',
    detail: 'Peak season. Counts regularly exceed 2,000–8,000+ grains/m³ in Austin.',
  },
  {
    period: 'February',
    detail: 'Gradually declining but still significant. Late cold fronts cause final spikes.',
  },
  { period: 'March', detail: 'Cedar season ends. Oak pollen begins its peak.' },
]

const facts = [
  {
    icon: 'i-lucide-map-pin',
    title: 'Geographic Position',
    text: 'Austin sits at the eastern edge of the Hill Country, directly in the pollen drift path from millions of juniper trees.',
  },
  {
    icon: 'i-lucide-wind',
    title: 'Cold Front Triggers',
    text: 'Winter cold fronts cause male juniper trees to release massive clouds of pollen simultaneously, creating sudden spikes.',
  },
  {
    icon: 'i-lucide-users',
    title: 'Population Growth',
    text: 'Many Austin transplants develop cedar allergies after 1–3 years of exposure. The immune system becomes sensitized over time.',
  },
  {
    icon: 'i-lucide-droplets',
    title: 'Drought Resistance',
    text: 'Ashe Juniper thrives in Texas drought conditions. While other vegetation declines, juniper populations continue expanding.',
  },
]
</script>

<template>
  <div>
    <div class="mb-6">
      <h1 class="text-[1.75rem] font-bold tracking-tight mb-1.5">What is Cedar Fever?</h1>
      <p class="text-[0.85rem] text-muted">
        Understanding mountain cedar allergies in Central Texas
      </p>
    </div>

    <!-- Cedar tree hero image -->
    <div class="relative rounded-2xl overflow-hidden mb-6 max-h-[280px]">
      <img
        src="/images/cedar-tree-pollen.png"
        alt="Ashe Juniper (mountain cedar) tree releasing pollen in the Texas Hill Country"
        class="w-full h-full object-cover block"
      />
      <div
        class="absolute inset-0 bg-[linear-gradient(to_top,var(--color-bg)_0%,transparent_60%)]"
      />
      <div class="absolute bottom-4 left-5 text-[0.7rem] text-muted italic">
        Ashe Juniper releasing pollen in the Texas Hill Country
      </div>
    </div>

    <!-- Overview -->
    <section
      class="bg-elevated border border-default rounded-2xl py-7 px-6 max-sm:py-5 max-sm:px-4 mb-4"
    >
      <h2 class="text-[0.85rem] font-semibold text-muted uppercase tracking-[0.06em] mb-4">
        About Mountain Cedar
      </h2>
      <div>
        <p class="text-[0.85rem] leading-relaxed text-muted mb-3 last:mb-0">
          "Cedar fever" is the colloquial name for the allergic reaction caused by
          <strong class="text-default">Ashe Juniper (Juniperus ashei)</strong>
          pollen. Despite the name, it's not caused by true cedar — it's a juniper species native to
          the Texas Hill Country.
        </p>
        <p class="text-[0.85rem] leading-relaxed text-muted mb-3 last:mb-0">
          Central Texas is one of the worst places in the world for cedar allergies. Austin sits
          directly downwind of the Hill Country, where millions of Ashe Juniper trees release
          enormous quantities of pollen during winter months.
        </p>
        <p class="text-[0.85rem] leading-relaxed text-muted mb-3 last:mb-0">
          Pollen counts in Austin regularly surge past
          <strong class="text-default">5,000 grains/m³</strong> during peak periods, with some days
          exceeding <strong class="text-default">8,000–10,000 grains/m³</strong>. For context, most
          allergy sufferers begin experiencing symptoms at just 50 grains/m³.
        </p>
      </div>
    </section>

    <!-- Why Austin -->
    <section
      class="bg-elevated border border-default rounded-2xl py-7 px-6 max-sm:py-5 max-sm:px-4 mb-4"
    >
      <h2 class="text-[0.85rem] font-semibold text-muted uppercase tracking-[0.06em] mb-4">
        Why Austin Is a Hotspot
      </h2>
      <div class="grid grid-cols-1 md:grid-cols-2 gap-3.5">
        <div
          v-for="fact in facts"
          :key="fact.title"
          class="flex gap-3.5 p-4 bg-elevated rounded-xl border border-default"
        >
          <div
            class="size-9 min-w-9 bg-primary/10 rounded-[10px] flex items-center justify-center text-primary"
          >
            <UIcon :name="fact.icon" class="size-5" />
          </div>
          <div>
            <h3 class="text-[0.8rem] font-semibold mb-1 text-default">
              {{ fact.title }}
            </h3>
            <p class="text-xs text-muted leading-normal">
              {{ fact.text }}
            </p>
          </div>
        </div>
      </div>
    </section>

    <!-- Seasonal Timeline -->
    <section
      class="bg-elevated border border-default rounded-2xl py-7 px-6 max-sm:py-5 max-sm:px-4 mb-4"
    >
      <h2 class="text-[0.85rem] font-semibold text-muted uppercase tracking-[0.06em] mb-4">
        Seasonal Timeline
      </h2>
      <div
        class="relative pl-6 before:content-[''] before:absolute before:left-[6px] before:top-2 before:bottom-2 before:w-px before:bg-(--color-border)"
      >
        <div v-for="(item, i) in timeline" :key="i" class="relative pb-5 last:pb-0">
          <div
            class="absolute -left-[21px] top-1.5 size-[9px] rounded-full bg-primary border-2 border-(--color-bg)"
          />
          <div>
            <h3 class="text-[0.8rem] font-semibold text-default mb-1">
              {{ item.period }}
            </h3>
            <p class="text-xs text-muted leading-normal">
              {{ item.detail }}
            </p>
          </div>
        </div>
      </div>
    </section>

    <!-- Severity Scale -->
    <section
      class="bg-elevated border border-default rounded-2xl py-7 px-6 max-sm:py-5 max-sm:px-4 mb-4"
    >
      <h2 class="text-[0.85rem] font-semibold text-muted uppercase tracking-[0.06em] mb-4">
        Severity Scale Guide
      </h2>
      <p class="text-[0.7rem] text-muted -mt-3 mb-4">
        Pollen counts measured in grains per cubic meter (grains/m³)
      </p>
      <div class="flex flex-col gap-2">
        <div
          v-for="s in severityScale"
          :key="s.level"
          class="grid grid-cols-[4px_100px_120px_1fr] max-md:grid-cols-[4px_80px_90px_1fr] max-sm:grid-cols-[4px_1fr] gap-3.5 max-md:gap-2.5 items-center py-3 px-4 bg-elevated rounded-[10px]"
        >
          <div class="w-1 h-6 rounded-sm" :style="{ backgroundColor: s.color }" />
          <div class="text-[0.8rem] font-semibold" :style="{ color: s.color }">
            {{ s.level }}
          </div>
          <div class="text-xs text-muted tabular-nums max-sm:col-start-2">{{ s.range }} gr/m³</div>
          <div class="text-xs text-muted max-sm:col-start-2">
            {{ s.description }}
          </div>
        </div>
      </div>
    </section>
  </div>
</template>
