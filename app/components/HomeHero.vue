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
  <div>
    <!-- Full-bleed hero section — no UContainer, spans viewport -->
    <section class="relative overflow-hidden">
      <!-- Responsive hero image -->
      <img
        src="/images/austin-hero.png"
        srcset="
          /images/austin-hero.png 1200w,
          /images/austin-hero.png  800w,
          /images/austin-hero.png  480w
        "
        sizes="100vw"
        alt="Aerial view of Lake Travis and Austin Hill Country at golden hour"
        fetchpriority="high"
        decoding="async"
        class="w-full h-[340px] md:h-[480px] object-cover object-center"
      />

      <!-- Top vignette for header legibility -->
      <div class="absolute inset-0 bg-gradient-to-b from-black/30 via-transparent to-transparent" />

      <!-- Bottom fade into page background -->
      <div
        class="absolute inset-x-0 bottom-0 h-40 bg-gradient-to-t from-[var(--ui-bg)] via-[var(--ui-bg)]/60 to-transparent"
      />

      <!-- Overlaid typography — positioned in the lower third -->
      <div class="absolute inset-x-0 bottom-6 md:bottom-10 z-10">
        <UContainer>
          <h1
            class="text-3xl sm:text-4xl md:text-5xl font-extrabold tracking-tight font-display text-white drop-shadow-lg leading-tight"
          >
            Austin, Texas — Live Local Intelligence
          </h1>
          <p
            class="mt-2 text-base md:text-lg text-white/80 drop-shadow-sm max-w-2xl leading-relaxed"
          >
            Real-time pollen, water temps, events, and where to go.
          </p>
        </UContainer>
      </div>
    </section>
  </div>
</template>
