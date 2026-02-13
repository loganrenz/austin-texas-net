<script setup lang="ts">
/**
 * HomeHero — full-bleed editorial hero with text overlaid on a soft Austin panorama.
 * The image spans edge-to-edge outside the content container with a white fade overlay.
 */
</script>

<template>
  <section class="pt-12 sm:pt-16 pb-0">
    <!-- Text content -->
    <div class="text-center mb-8">
      <h1 class="text-4xl sm:text-5xl lg:text-6xl font-extrabold tracking-tight font-display leading-tight mb-4">
        Austin, Texas — Live Local Intelligence
      </h1>
      <p class="text-lg text-muted max-w-xl mx-auto leading-relaxed">
        Real-time pollen, water temps, events, and where to go.
      </p>
    </div>

    <!-- Full-bleed hero image with fade edges -->
    <div class="relative -mx-4 sm:-mx-6 overflow-hidden">
      <img
        src="/images/austin-hero.png"
        alt="Aerial view of Lake Travis and Austin Hill Country at golden hour"
        class="w-full h-48 sm:h-64 lg:h-80 object-cover opacity-85"
        loading="eager"
      >
      <!-- Top fade: white gradient fading into the image -->
      <div class="absolute inset-x-0 top-0 h-16 bg-gradient-to-b from-[var(--ui-bg)] to-transparent" />
      <!-- Bottom fade: image fading into white background -->
      <div class="absolute inset-x-0 bottom-0 h-20 bg-gradient-to-t from-[var(--ui-bg)] to-transparent" />
    </div>
  </section>
</template>
