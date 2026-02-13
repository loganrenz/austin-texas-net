<script setup lang="ts">
/**
 * HomeHero — full-bleed edge-to-edge hero with responsive image,
 * subtle gradient overlay, and overlaid H1 + subhead in the lower third.
 *
 * Sits directly below <UHeader> in the normal page flow.
 * No custom CSS — Tailwind utility classes only.
 */
</script>

<template>
  <!-- eslint-disable atx/no-raw-tailwind-colors -- dark hero overlay requires specific shade-level colors for legibility -->
  <section class="relative overflow-hidden bg-neutral-900">
    <!-- Background image — decorative only, cropped tight -->
    <img
      src="/images/austin-hero.png"
      alt=""
      role="presentation"
      fetchpriority="high"
      decoding="async"
      class="absolute inset-0 w-full h-full object-cover object-center opacity-40"
    />

    <!-- Dark scrim for guaranteed legibility -->
    <div
      class="absolute inset-0 bg-linear-to-b from-neutral-900/60 via-neutral-900/40 to-neutral-900/80"
    />

    <!-- Content -->
    <div class="relative z-10 pt-10 pb-8 md:pt-14 md:pb-10">
      <UContainer>
        <h1
          class="text-2xl sm:text-3xl md:text-4xl font-extrabold tracking-tight font-display text-white leading-tight"
        >
          Austin, Texas — Live Local Intelligence
        </h1>
        <p class="mt-1.5 text-sm md:text-base text-neutral-300 max-w-xl leading-relaxed">
          Real-time pollen, water temps, events, and where to go.
        </p>
      </UContainer>
    </div>
  </section>
</template>
