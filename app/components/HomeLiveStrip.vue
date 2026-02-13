<script setup lang="ts">
/**
 * HomeLiveStrip — three live data cards using UCard + UBadge.
 * Uniform padding, radii, and badge styling. Fast-scanning hierarchy.
 * Preserves existing data wiring from composables.
 */
const { value: pollen, updatedAt: pollenUpdated } = useLivePollen()
const { value: water, updatedAt: waterUpdated } = useLiveWaterTemps()
const { value: events, updatedAt: eventsUpdated } = useWeekendEvents()

function minutesAgo(iso: string | null): string {
  if (!iso) return ''
  const diff = Math.round((Date.now() - new Date(iso).getTime()) / 60_000)
  if (diff < 1) return 'Updated just now'
  return `Updated ${diff} min ago`
}
</script>

<template>
  <section class="pt-6 pb-2">
    <UContainer>
      <div class="grid grid-cols-1 md:grid-cols-3 gap-4">
        <!-- Cedar Pollen -->
        <UCard class="flex flex-col">
          <template #header>
            <div class="flex items-center justify-between">
              <span class="text-sm font-semibold text-default"> Cedar Pollen Today </span>
              <UBadge color="warning" variant="subtle" size="xs">
                <span class="flex items-center gap-1">
                  <UIcon name="i-lucide-flower-2" class="size-3" />
                  Pollen
                </span>
              </UBadge>
            </div>
          </template>

          <div class="flex-1">
            <div class="flex items-baseline gap-2">
              <ClientOnly>
                <span
                  v-if="pollen?.count"
                  class="text-4xl font-extrabold tracking-tight font-display text-default"
                >
                  {{ pollen.count }}
                </span>
                <span v-else class="text-4xl font-extrabold tracking-tight font-display text-muted"
                  >—</span
                >
                <template #fallback>
                  <span class="text-4xl font-extrabold tracking-tight font-display text-muted"
                    >—</span
                  >
                </template>
              </ClientOnly>
              <span class="text-xs font-medium text-muted">grains/m³</span>
            </div>

            <p class="text-xs text-muted mt-2">Central Texas cedar count</p>
          </div>

          <template #footer>
            <ClientOnly>
              <span class="text-[11px] text-muted">{{ minutesAgo(pollenUpdated) }}</span>
            </ClientOnly>
          </template>
        </UCard>

        <!-- Water Temp -->
        <UCard class="flex flex-col">
          <template #header>
            <div class="flex items-center justify-between">
              <span class="text-sm font-semibold text-default"> Lake Travis Water Temp </span>
              <UBadge color="info" variant="subtle" size="xs">
                <span class="flex items-center gap-1">
                  <span class="relative flex size-1.5">
                    <span
                      class="absolute inline-flex size-full animate-ping rounded-full bg-info opacity-75"
                    />
                    <span class="relative inline-flex size-1.5 rounded-full bg-info" />
                  </span>
                  Live
                </span>
              </UBadge>
            </div>
          </template>

          <div class="flex-1">
            <div class="flex items-baseline gap-1">
              <ClientOnly>
                <span
                  v-if="water"
                  class="text-4xl font-extrabold tracking-tight font-display text-default"
                >
                  {{ water.primary.tempF }}°
                </span>
                <span v-else class="text-4xl font-extrabold tracking-tight font-display text-muted"
                  >—</span
                >
                <template #fallback>
                  <span class="text-4xl font-extrabold tracking-tight font-display text-muted"
                    >—</span
                  >
                </template>
              </ClientOnly>
            </div>

            <div class="flex items-center gap-2 mt-2 text-xs text-muted">
              <span>Surface</span>
              <span class="text-muted/40">·</span>
              <span>Barton Springs: 70°</span>
            </div>
          </div>

          <template #footer>
            <ClientOnly>
              <span class="text-[11px] text-muted">{{ minutesAgo(waterUpdated) }}</span>
            </ClientOnly>
          </template>
        </UCard>

        <!-- Austin Events -->
        <UCard class="flex flex-col">
          <template #header>
            <div class="flex items-center justify-between">
              <span class="text-sm font-semibold text-default"> Austin Events </span>
              <UBadge color="success" variant="subtle" size="xs">
                <span class="flex items-center gap-1">
                  <span class="relative flex size-1.5">
                    <span
                      class="absolute inline-flex size-full animate-ping rounded-full bg-success opacity-75"
                    />
                    <span class="relative inline-flex size-1.5 rounded-full bg-success" />
                  </span>
                  Live
                </span>
              </UBadge>
            </div>
          </template>

          <div class="flex-1">
            <div class="flex items-baseline gap-2">
              <ClientOnly>
                <span
                  v-if="events?.count"
                  class="text-4xl font-extrabold tracking-tight font-display text-default"
                >
                  {{ events.count }}
                </span>
                <span v-else class="text-4xl font-extrabold tracking-tight font-display text-muted"
                  >—</span
                >
                <template #fallback>
                  <span class="text-4xl font-extrabold tracking-tight font-display text-muted"
                    >—</span
                  >
                </template>
              </ClientOnly>
              <span class="text-xs font-medium text-muted">this week</span>
            </div>

            <ClientOnly>
              <ul v-if="events?.events.length" class="space-y-0.5 mt-2">
                <li
                  v-for="ev in events.events.slice(0, 2)"
                  :key="ev.name"
                  class="text-xs text-muted truncate"
                >
                  {{ ev.name }}
                </li>
              </ul>
              <p v-else class="text-xs text-muted mt-2">Loading events…</p>
            </ClientOnly>
          </div>

          <template #footer>
            <ClientOnly>
              <span class="text-[11px] text-muted">{{ minutesAgo(eventsUpdated) }}</span>
            </ClientOnly>
          </template>
        </UCard>
      </div>
    </UContainer>
  </section>
</template>
