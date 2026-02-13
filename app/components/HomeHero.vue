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
  <!-- Full-bleed hero section — no UContainer, spans viewport -->
  <section class="relative">
    <!-- Responsive hero image -->
    <img
      src="/images/austin-hero.png"
      srcset="/images/austin-hero.png 1200w, /images/austin-hero.png 800w, /images/austin-hero.png 480w"
      sizes="100vw"
      alt="Aerial view of Lake Travis and Austin Hill Country at golden hour"
      fetchpriority="high"
      decoding="async"
      class="w-full h-[320px] md:h-[460px] object-cover object-top"
    >

    <!-- Subtle gradient overlay for legibility -->
    <div class="absolute inset-0 bg-gradient-to-b from-black/20 via-black/5 to-transparent" />
  </section>

  <!-- Overlaid typography — negative margin pulls it up into the hero image -->
  <div class="-mt-28 md:-mt-36 relative z-10 pb-2">
    <UContainer>
      <h1 class="text-3xl sm:text-4xl md:text-5xl font-extrabold tracking-tight font-display text-white drop-shadow-lg leading-tight">
        Austin, Texas — Live Local Intelligence
      </h1>
      <p class="mt-2 text-base md:text-lg text-white/90 drop-shadow-sm max-w-2xl leading-relaxed">
        Real-time pollen, water temps, events, and where to go.
      </p>
    </UContainer>
  </div>
</template>
