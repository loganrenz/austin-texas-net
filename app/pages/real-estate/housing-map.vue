<!-- eslint-disable atx/no-fetch-in-component -- SSR page data fetching -->
<script setup lang="ts">
/**
 * /real-estate/housing-map/ — Austin Housing Map
 * Composite map combining home price pins and development permit pins.
 */

interface MapItem {
  id: string
  name: string
  lat: number
  lng: number
  type: 'price' | 'permit'
  displayValue: string
  detail: string
}

const ZIP_COORDS: Record<string, { lat: number; lng: number }> = {
  '78701': { lat: 30.2700, lng: -97.7431 }, '78702': { lat: 30.2621, lng: -97.7208 },
  '78703': { lat: 30.2937, lng: -97.7636 }, '78704': { lat: 30.2420, lng: -97.7638 },
  '78705': { lat: 30.2906, lng: -97.7417 }, '78723': { lat: 30.3078, lng: -97.6905 },
  '78731': { lat: 30.3474, lng: -97.7644 }, '78741': { lat: 30.2290, lng: -97.7199 },
  '78745': { lat: 30.2060, lng: -97.7940 }, '78746': { lat: 30.3100, lng: -97.8050 },
  '78749': { lat: 30.2300, lng: -97.8530 }, '78751': { lat: 30.3128, lng: -97.7234 },
  '78752': { lat: 30.3300, lng: -97.7100 }, '78753': { lat: 30.3730, lng: -97.6770 },
  '78757': { lat: 30.3530, lng: -97.7360 }, '78758': { lat: 30.3870, lng: -97.7130 },
  '78759': { lat: 30.3990, lng: -97.7590 }, '78613': { lat: 30.5070, lng: -97.8210 },
  '78660': { lat: 30.4390, lng: -97.6200 }, '78664': { lat: 30.5360, lng: -97.6620 },
}

const { getCategoryBySlug, categories } = useSiteData()
const category = getCategoryBySlug('real-estate')!
const siblings = category.subApps.filter(a => a.slug !== 'housing-map' && a.status === 'live')
const crossLinks = categories.filter(c => c.slug !== 'real-estate').slice(0, 4)
const { items: breadcrumbs } = useBreadcrumbs()

usePageSeo({
  title: 'Austin Housing Map — Home Prices & New Developments',
  description: 'Interactive map of Austin housing: median home prices by zip code and new construction permits. See where Austin is growing.',
})

useSchemaOrg([defineWebPage({
  name: 'Austin Housing Map',
  description: 'Composite housing map showing home values and development permits across Austin.',
})])

const { data: priceData } = await useFetch<{ prices: Array<{ zipCode: string; medianValue: number; period: string }> }>('/api/real-estate/home-prices?latest=true')
const { data: permitData } = await useFetch<{ permits: Array<{ id: string; lat: number; lng: number; name: string; displayValue: string; issueDate: string }> }>('/api/real-estate/developments?limit=100')

const activeLayer = ref<'all' | 'prices' | 'permits'>('all')

const items = computed<MapItem[]>(() => {
  const result: MapItem[] = []

  if (activeLayer.value === 'all' || activeLayer.value === 'prices') {
    for (const p of (priceData.value?.prices || [])) {
      const coords = ZIP_COORDS[p.zipCode]
      if (!coords) continue
      result.push({
        id: `price-${p.zipCode}`,
        name: `Zip ${p.zipCode}`,
        lat: coords.lat,
        lng: coords.lng,
        type: 'price',
        displayValue: `$${Math.round(p.medianValue / 1000)}K`,
        detail: p.period,
      })
    }
  }

  if (activeLayer.value === 'all' || activeLayer.value === 'permits') {
    for (const p of (permitData.value?.permits || [])) {
      if (!p.lat || !p.lng) continue
      result.push({
        id: `permit-${p.id}`,
        name: p.name,
        lat: p.lat,
        lng: p.lng,
        type: 'permit',
        displayValue: p.displayValue,
        detail: p.issueDate,
      })
    }
  }

  return result
})

const selectedId = ref<string | null>(null)
const selectedItem = computed(() => items.value.find(i => i.id === selectedId.value) ?? null)

function createPinElement(spot: MapItem, isSelected: boolean): { element: HTMLElement } {
  const isPricePin = spot.type === 'price'
  /* eslint-disable atx/no-inline-hex -- MapKit pin gradient */
  const fillColor = isPricePin ? '#3b82f6' : '#22c55e'
  /* eslint-enable atx/no-inline-hex */

  const el = document.createElement('div')
  if (isPricePin) {
    el.innerHTML = `<div style="display:flex;flex-direction:column;align-items:center;gap:2px;width:max-content;${isSelected ? 'z-index:100;' : 'z-index:1;'}">
      <div style="padding:4px 10px;border-radius:20px;background:linear-gradient(145deg,${fillColor},color-mix(in srgb,${fillColor} 60%,#000));color:white;font-size:11px;font-weight:800;font-family:var(--font-display);box-shadow:0 2px 6px ${fillColor}66${isSelected ? `;transform:scale(1.15)` : ''}">${spot.displayValue}</div>
      <span style="font-size:9px;font-weight:700;color:#1e293b;text-shadow:0 0 4px white,0 0 4px white;white-space:nowrap;">${spot.name}</span>
    </div>`
  } else {
    el.innerHTML = `<div style="width:20px;height:20px;border-radius:50%;background:linear-gradient(145deg,${fillColor},color-mix(in srgb,${fillColor} 60%,#000));border:2px solid white;box-shadow:0 2px 6px ${fillColor}66${isSelected ? `;transform:scale(1.3)` : ''};display:flex;align-items:center;justify-content:center;">
      <svg width="10" height="10" viewBox="0 0 24 24" fill="none" stroke="white" stroke-width="2.5"><path d="M3 21h18"/><path d="M5 21V7l8-4 8 4v14"/></svg>
    </div>`
  }
  return { element: el }
}
</script>

<template>
  <div>
    <ClientOnly>
      <AppMapKit
        v-model:selected-id="selectedId"
        :items="items"
        :create-pin-element="createPinElement"
        :bounding-padding="0.08"
        :zoom-span="{ lat: 0.03, lng: 0.035 }"
        :annotation-size="{ width: 100, height: 46 }"
        clustering-identifier="housing-map"
      />
      <template #fallback>
        <div class="mapkit-placeholder">
          <div class="text-center">
            <UIcon name="i-lucide-map" class="size-10 text-muted mb-2" />
            <p class="text-sm text-muted">Loading map…</p>
          </div>
        </div>
      </template>
    </ClientOnly>

    <UContainer class="py-8 md:py-12">
      <UBreadcrumb v-if="breadcrumbs.length > 0 && !selectedItem" :items="breadcrumbs" class="mb-6" />

      <div v-if="!selectedItem" class="mb-8 animate-fade-up">
        <div class="flex items-center gap-3 mb-4">
          <div class="flex items-center justify-center size-12 rounded-2xl bg-primary/10">
            <UIcon name="i-lucide-map" class="size-6 text-primary" />
          </div>
          <h1 class="text-2xl sm:text-3xl lg:text-4xl font-extrabold tracking-tight font-display">
            Housing Map
          </h1>
        </div>
        <p class="text-base sm:text-lg text-muted max-w-2xl leading-relaxed">
          Combined view of Austin home values and new construction. Blue pins show median prices by zip code,
          green dots mark new development permits.
        </p>
      </div>

      <!-- Layer Filter -->
      <div v-if="!selectedItem" class="mb-6 flex gap-2 flex-wrap animate-fade-up-delay-1">
        <UButton :variant="activeLayer === 'all' ? 'solid' : 'ghost'" :color="activeLayer === 'all' ? 'primary' : 'neutral'" size="sm" icon="i-lucide-layers" @click="activeLayer = 'all'">All Layers</UButton>
        <UButton :variant="activeLayer === 'prices' ? 'solid' : 'ghost'" :color="activeLayer === 'prices' ? 'primary' : 'neutral'" size="sm" icon="i-lucide-home" @click="activeLayer = 'prices'">Home Prices</UButton>
        <UButton :variant="activeLayer === 'permits' ? 'solid' : 'ghost'" :color="activeLayer === 'permits' ? 'primary' : 'neutral'" size="sm" icon="i-lucide-construction" @click="activeLayer = 'permits'">Developments</UButton>
      </div>

      <!-- Selected Item -->
      <section v-if="selectedItem" class="mb-10 animate-fade-up">
        <UButton variant="link" color="neutral" size="xs" icon="i-lucide-arrow-left" class="text-xs font-bold uppercase tracking-widest mb-5" @click="selectedId = null">Back to Map</UButton>
        <div class="rounded-2xl border border-default bg-default px-6 py-5 shadow-sm dark:shadow-md">
          <h2 class="text-lg font-extrabold font-display mb-2">{{ selectedItem.name }}</h2>
          <p class="text-sm text-muted mb-3">{{ selectedItem.detail }}</p>
          <div class="flex gap-3">
            <div class="rounded-xl border border-primary/15 bg-primary/5 px-4 py-2">
              <span class="text-lg font-extrabold font-display">{{ selectedItem.displayValue }}</span>
            </div>
            <UBadge :color="selectedItem.type === 'price' ? 'info' : 'success'" variant="subtle" size="sm" :label="selectedItem.type === 'price' ? 'Home Value' : 'Development'" />
          </div>
        </div>
      </section>

      <!-- More / Explore -->
      <section v-if="siblings.length && !selectedItem" class="mb-8 animate-fade-up-delay-2">
        <h2 class="text-xs font-bold uppercase tracking-widest text-muted mb-4">More in Real Estate</h2>
        <div class="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
          <NuxtLink v-for="app in siblings" :key="app.slug" :to="`/real-estate/${app.slug}/`" class="group flex items-center justify-between rounded-xl border border-default bg-default p-4 transition-all duration-200 hover:border-primary/30 hover:shadow-sm">
            <div><h3 class="text-sm font-semibold mb-1">{{ app.title }}</h3><p class="text-xs text-muted line-clamp-1">{{ app.description }}</p></div>
            <UIcon name="i-lucide-chevron-right" class="size-4 text-dimmed group-hover:text-primary transition-colors" />
          </NuxtLink>
        </div>
      </section>
      <section v-if="!selectedItem" class="mb-6 animate-fade-up-delay-3">
        <h2 class="text-xs font-bold uppercase tracking-widest text-muted mb-4">Explore More</h2>
        <div class="grid grid-cols-2 sm:grid-cols-4 gap-2">
          <NuxtLink v-for="c in crossLinks" :key="c.slug" :to="`/${c.slug}/`" class="flex items-center gap-2.5 rounded-xl border border-default bg-default px-4 py-3 transition-all duration-200 hover:border-primary/30">
            <UIcon :name="c.icon" class="size-4" :class="c.color" /><span class="text-sm font-medium">{{ c.title }}</span>
          </NuxtLink>
        </div>
      </section>
    </UContainer>
  </div>
</template>
