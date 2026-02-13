<script setup lang="ts">
/**
 * LiveStrip — horizontal row of 3 editorial live metric blocks.
 * Uses the three live composables to fetch data.
 */
const { value: pollen, updatedAt: pollenUpdated } = useLivePollen()
const { value: water, updatedAt: waterUpdated } = useLiveWaterTemps()
const { value: events, updatedAt: eventsUpdated } = useWeekendEvents()
</script>

<template>
  <section class="mb-10">
    <div class="grid grid-cols-1 md:grid-cols-3 gap-4">
      <!-- Cedar Pollen -->
      <LiveMetric
        title="Cedar Pollen Today"
        :value="pollen?.count ?? null"
        unit="HIGH"
        :updated-at="pollenUpdated"
        gradient="bg-linear-to-br from-emerald-700 via-emerald-600 to-teal-500"
        :details="['Green · Low /', 'Orange: Med / Red · Red / Dark: Very High']"
        to="/allergies/cedar-pollen/"
      />

      <!-- Water Temp -->
      <LiveMetric
        title="Lake Travis Water Temp"
        :value="water ? `${water.primary.tempF}°` : null"
        live-label="LIVE"
        :updated-at="waterUpdated"
        gradient="bg-linear-to-br from-sky-600 via-cyan-500 to-teal-400"
        :details="['Depth: Surface · Barton Springs : 70°']"
        subtitle="Lighting Trails"
      />

      <!-- Austin Events -->
      <LiveMetric
        title="Austin Events"
        :value="events?.count ?? null"
        unit="EVENTS"
        live-label="LIVE"
        :updated-at="eventsUpdated"
        gradient="bg-linear-to-br from-amber-600 via-orange-500 to-red-500"
        :details="events?.events.map((e: { name: string }) => `${e.name}`) ?? []"
      />
    </div>
  </section>
</template>
