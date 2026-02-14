<script setup lang="ts">
/**
 * OgImageDefault — Default OG image template for all pages.
 *
 * Renders a 1200×630 branded card with the page title, description,
 * and Austin-Texas.net branding. Used automatically by nuxt-og-image
 * unless a page specifies a different component.
 *
 * Props are passed via defineOgImage() or automatically from page meta.
 */
withDefaults(defineProps<{
  title?: string
  description?: string
  siteName?: string
}>(), {
  title: 'Austin Texas',
  description: 'Your guide to Austin, Texas — pollen counts, local food, live music, neighborhoods, and more.',
  siteName: 'austin-texas.net',
})
</script>

<template>
  <div
    :style="{
      width: '1200px',
      height: '630px',
      display: 'flex',
      flexDirection: 'column',
      justifyContent: 'space-between',
      padding: '60px 64px',
      background: 'linear-gradient(145deg, #0a1004 0%, #1a2f0a 40%, #2d4a1a 100%)',
      fontFamily: 'Inter, sans-serif',
      color: '#ffffff',
      position: 'relative',
      overflow: 'hidden',
    }"
  >
    <!-- Background accent circles -->
    <div
      :style="{
        position: 'absolute',
        top: '-120px',
        right: '-80px',
        width: '400px',
        height: '400px',
        borderRadius: '50%',
        background: 'radial-gradient(circle, rgba(132, 204, 22, 0.15) 0%, transparent 70%)',
      }"
    />
    <div
      :style="{
        position: 'absolute',
        bottom: '-100px',
        left: '-60px',
        width: '300px',
        height: '300px',
        borderRadius: '50%',
        background: 'radial-gradient(circle, rgba(132, 204, 22, 0.1) 0%, transparent 70%)',
      }"
    />

    <!-- Top: Site name badge -->
    <div :style="{ display: 'flex', alignItems: 'center', gap: '12px', position: 'relative' }">
      <div
        :style="{
          display: 'flex',
          alignItems: 'center',
          gap: '10px',
          padding: '8px 20px',
          background: 'rgba(132, 204, 22, 0.15)',
          borderRadius: '999px',
          border: '1px solid rgba(132, 204, 22, 0.3)',
        }"
      >
        <div
          :style="{
            width: '10px',
            height: '10px',
            borderRadius: '50%',
            background: '#84cc16',
          }"
        />
        <span
          :style="{
            fontSize: '18px',
            fontWeight: 700,
            fontFamily: 'Outfit, sans-serif',
            letterSpacing: '0.5px',
            color: '#84cc16',
          }"
        >
          {{ siteName }}
        </span>
      </div>
    </div>

    <!-- Center: Title + Description -->
    <div :style="{ display: 'flex', flexDirection: 'column', gap: '20px', position: 'relative', flex: '1', justifyContent: 'center' }">
      <h1
        :style="{
          fontSize: title.length > 40 ? '48px' : '56px',
          fontWeight: 900,
          fontFamily: 'Outfit, sans-serif',
          lineHeight: 1.1,
          margin: 0,
          color: '#ffffff',
          maxWidth: '900px',
        }"
      >
        {{ title }}
      </h1>
      <p
        v-if="description"
        :style="{
          fontSize: '22px',
          fontWeight: 400,
          lineHeight: 1.5,
          margin: 0,
          color: 'rgba(255, 255, 255, 0.7)',
          maxWidth: '800px',
          display: '-webkit-box',
          overflow: 'hidden',
        }"
      >
        {{ description }}
      </p>
    </div>

    <!-- Bottom: Decorative bar -->
    <div :style="{ display: 'flex', alignItems: 'center', gap: '16px', position: 'relative' }">
      <div
        :style="{
          height: '4px',
          width: '80px',
          background: 'linear-gradient(90deg, #84cc16, #65a30d)',
          borderRadius: '2px',
        }"
      />
      <span
        :style="{
          fontSize: '15px',
          fontWeight: 500,
          color: 'rgba(255, 255, 255, 0.45)',
          letterSpacing: '1px',
          textTransform: 'uppercase',
        }"
      >
        Your Guide to Austin, Texas
      </span>
    </div>
  </div>
</template>
