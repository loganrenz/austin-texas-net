<script setup lang="ts">
/**
 * HomeHero — editorial hero with H1, subhead, and panoramic Austin photo banner.
 */
</script>

<template>
  <section class="text-center pt-12 sm:pt-16 pb-6 sm:pb-8">
    <h1 class="text-4xl sm:text-5xl lg:text-6xl font-extrabold tracking-tight font-display leading-tight mb-4">
      Austin, Texas — Live Local Intelligence
    </h1>
    <p class="text-lg text-muted max-w-xl mx-auto leading-relaxed mb-8">
      Real-time pollen, water temps, events, and where to go.
    </p>
    <div class="w-full overflow-hidden rounded-2xl">
      <img
        src="/images/austin-hero.png"
        alt="Austin, Texas — Lake Travis and rolling hills at golden hour"
        class="w-full h-40 sm:h-56 lg:h-72 object-cover"
        loading="eager"
      >
    </div>
  </section>
</template>
