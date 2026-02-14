<script setup lang="ts">
/**
 * OgImageCategory — Category-specific OG image template.
 *
 * Used for category landing pages and sub-app pages.
 * Shows a category badge with matching accent color.
 */
withDefaults(defineProps<{
  title?: string
  description?: string
  category?: string
  categoryColor?: string
  siteName?: string
}>(), {
  title: 'Austin Texas',
  description: '',
  category: '',
  categoryColor: '#84cc16',
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
    <!-- Background accent -->
    <div
      :style="{
        position: 'absolute',
        top: '-100px',
        right: '-60px',
        width: '450px',
        height: '450px',
        borderRadius: '50%',
        background: `radial-gradient(circle, ${categoryColor}22 0%, transparent 70%)`,
      }"
    />

    <!-- Top: Site name + Category badge -->
    <div :style="{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', position: 'relative' }">
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

      <!-- Category badge -->
      <div
        v-if="category"
        :style="{
          padding: '8px 24px',
          background: `${categoryColor}22`,
          borderRadius: '999px',
          border: `1px solid ${categoryColor}44`,
        }"
      >
        <span
          :style="{
            fontSize: '16px',
            fontWeight: 600,
            color: categoryColor,
            textTransform: 'uppercase',
            letterSpacing: '1.5px',
          }"
        >
          {{ category }}
        </span>
      </div>
    </div>

    <!-- Center: Title + Description -->
    <div :style="{ display: 'flex', flexDirection: 'column', gap: '20px', position: 'relative', flex: '1', justifyContent: 'center' }">
      <h1
        :style="{
          fontSize: title.length > 40 ? '46px' : '54px',
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
          fontSize: '21px',
          fontWeight: 400,
          lineHeight: 1.5,
          margin: 0,
          color: 'rgba(255, 255, 255, 0.65)',
          maxWidth: '780px',
          display: '-webkit-box',
          overflow: 'hidden',
        }"
      >
        {{ description }}
      </p>
    </div>

    <!-- Bottom: Color accent bar -->
    <div :style="{ display: 'flex', alignItems: 'center', gap: '16px', position: 'relative' }">
      <div
        :style="{
          height: '4px',
          width: '80px',
          background: `linear-gradient(90deg, ${categoryColor}, ${categoryColor}88)`,
          borderRadius: '2px',
        }"
      />
      <span
        :style="{
          fontSize: '15px',
          fontWeight: 500,
          color: 'rgba(255, 255, 255, 0.4)',
          letterSpacing: '1px',
          textTransform: 'uppercase',
        }"
      >
        Your Guide to Austin, Texas
      </span>
    </div>
  </div>
</template>
