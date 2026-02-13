<script setup lang="ts">
/**
 * Homepage — Austin, Texas — Live Local Intelligence
 * Composes editorial components matching the newspaper-style mockup.
 */
usePageSeo({
  title: 'Austin, Texas — Live Local Intelligence',
  description: 'Real-time pollen, water temps, events, and where to go in Austin, Texas.',
})

useSchemaOrg([
  defineWebPage({
    name: 'Austin, Texas — Live Local Intelligence',
    description: 'Real-time pollen, water temps, events, and where to go in Austin, Texas.',
  }),
])
</script>

<template>
  <div>
    <HomeHero />
    <HomeLiveStrip />
    <HomeExploreGrid />
    <HomeQuickChips />
    <HomeSectionLinks />
  </div>
</template>
