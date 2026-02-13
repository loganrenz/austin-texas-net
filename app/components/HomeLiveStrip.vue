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
  <section class="mt-6 md:mt-8">
    <UContainer>
      <div class="grid grid-cols-1 md:grid-cols-3 gap-4">
        <!-- Cedar Pollen -->
        <UCard>
          <template #header>
            <div class="flex items-center justify-between">
              <span class="text-sm font-semibold text-default">
                Cedar Pollen <span class="font-bold">Today</span>
              </span>
              <UBadge color="success" variant="subtle" size="xs">
                POLLEN
              </UBadge>
            </div>
          </template>

          <div class="flex items-baseline gap-2">
            <ClientOnly>
              <span
                v-if="pollen?.count"
                class="text-4xl font-extrabold tracking-tight font-display text-default"
              >
                {{ pollen.count }}
              </span>
              <span v-else class="text-4xl font-extrabold tracking-tight font-display text-muted">—</span>
              <template #fallback>
                <span class="text-4xl font-extrabold tracking-tight font-display text-muted">—</span>
              </template>
            </ClientOnly>
            <UBadge color="warning" variant="soft" size="xs">HIGH</UBadge>
          </div>

          <!-- Color legend dots -->
          <div class="flex items-center gap-1 mt-3">
            <span class="size-2 rounded-full bg-emerald-500" />
            <span class="size-2 rounded-full bg-emerald-500" />
            <span class="size-2 rounded-full bg-emerald-400" />
            <span class="size-2 rounded-full bg-teal-400" />
            <span class="size-2 rounded-full bg-amber-400" />
            <span class="size-2 rounded-full bg-orange-400" />
            <span class="size-2 rounded-full bg-red-500" />
          </div>

          <template #footer>
            <ClientOnly>
              <span class="text-[11px] text-muted">{{ minutesAgo(pollenUpdated) }}</span>
            </ClientOnly>
          </template>
        </UCard>

        <!-- Water Temp -->
        <UCard>
          <template #header>
            <div class="flex items-center justify-between">
              <span class="text-sm font-semibold text-default">
                Lake Travis <span class="font-bold">Water Temp</span>
              </span>
              <div class="flex items-center gap-1.5">
                <UBadge color="error" variant="subtle" size="xs">
                  <span class="flex items-center gap-1">
                    <span class="relative flex size-1.5">
                      <span class="absolute inline-flex size-full animate-ping rounded-full bg-red-400 opacity-75" />
                      <span class="relative inline-flex size-1.5 rounded-full bg-red-500" />
                    </span>
                    LIVE
                  </span>
                </UBadge>
              </div>
            </div>
          </template>

          <div class="flex items-baseline gap-1">
            <ClientOnly>
              <span
                v-if="water"
                class="text-4xl font-extrabold tracking-tight font-display text-default"
              >
                {{ water.primary.tempF }}°
              </span>
              <span v-else class="text-4xl font-extrabold tracking-tight font-display text-muted">—</span>
              <template #fallback>
                <span class="text-4xl font-extrabold tracking-tight font-display text-muted">—</span>
              </template>
            </ClientOnly>
          </div>

          <div class="flex items-center gap-2 mt-3 text-xs text-muted">
            <span>Depth: Surface</span>
            <USeparator orientation="vertical" class="h-3" />
            <span>Barton Springs: 70°</span>
          </div>

          <template #footer>
            <ClientOnly>
              <span class="text-[11px] text-muted">{{ minutesAgo(waterUpdated) }}</span>
            </ClientOnly>
          </template>
        </UCard>

        <!-- Austin Events -->
        <UCard>
          <template #header>
            <div class="flex items-center justify-between">
              <span class="text-sm font-semibold text-default">
                <span class="font-bold">Austin Events</span>
              </span>
              <div class="flex items-center gap-1.5">
                <UBadge color="success" variant="subtle" size="xs">
                  <span class="flex items-center gap-1">
                    <span class="relative flex size-1.5">
                      <span class="absolute inline-flex size-full animate-ping rounded-full bg-emerald-400 opacity-75" />
                      <span class="relative inline-flex size-1.5 rounded-full bg-emerald-500" />
                    </span>
                    LIVE
                  </span>
                </UBadge>
              </div>
            </div>
          </template>

          <div class="flex items-baseline gap-2">
            <ClientOnly>
              <span
                v-if="events?.count"
                class="text-4xl font-extrabold tracking-tight font-display text-default"
              >
                {{ events.count }}
              </span>
              <span v-else class="text-4xl font-extrabold tracking-tight font-display text-muted">—</span>
              <template #fallback>
                <span class="text-4xl font-extrabold tracking-tight font-display text-muted">—</span>
              </template>
            </ClientOnly>
            <UBadge color="info" variant="soft" size="xs">EVENTS</UBadge>
          </div>

          <ClientOnly>
            <ul v-if="events?.events.length" class="space-y-0.5 mt-3">
              <li
                v-for="ev in events.events.slice(0, 2)"
                :key="ev.name"
                class="text-xs text-muted truncate"
              >
                {{ ev.name }}
              </li>
            </ul>
          </ClientOnly>

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
