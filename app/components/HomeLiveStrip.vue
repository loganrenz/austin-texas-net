<script setup lang="ts">
/**
 * HomeLiveStrip — editorial live data cards with gradient backgrounds,
 * sparkline SVG decorations, LIVE dots, and "Updated X min ago" timestamps.
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
  <section class="mb-10">
    <div class="grid grid-cols-1 md:grid-cols-3 gap-4">
      <!-- Cedar Pollen -->
      <div class="relative overflow-hidden rounded-2xl border border-default">
        <div class="relative px-5 pt-5 pb-14 bg-linear-to-br from-emerald-700 via-emerald-600 to-teal-500">
          <div class="flex items-center justify-between mb-2">
            <span class="text-sm font-semibold text-white/90">Cedar Pollen <span class="font-bold">Today</span></span>
          </div>
          <div class="flex items-baseline gap-2">
            <ClientOnly>
              <span v-if="pollen?.count" class="text-5xl font-extrabold text-white tracking-tight font-display">
                {{ pollen.count }}
              </span>
              <span v-else class="text-5xl font-extrabold text-white/50 tracking-tight font-display">—</span>
              <template #fallback>
                <span class="text-5xl font-extrabold text-white/50 tracking-tight font-display">—</span>
              </template>
            </ClientOnly>
            <span class="text-sm font-bold uppercase tracking-wider text-white/70">HIGH</span>
          </div>
          <!-- Sparkline decoration -->
          <svg class="absolute bottom-0 left-0 w-full h-14 opacity-30" viewBox="0 0 400 60" preserveAspectRatio="none">
            <path d="M0,50 Q40,30 80,45 T160,35 T240,42 T320,28 T400,38 V60 H0 Z" fill="white" />
          </svg>
        </div>
        <div class="bg-default px-5 py-3 space-y-1.5">
          <ClientOnly>
            <span class="text-[11px] text-muted">{{ minutesAgo(pollenUpdated) }}</span>
          </ClientOnly>
          <!-- Color legend dots -->
          <div class="flex items-center gap-1 mt-1">
            <span class="size-2 rounded-full bg-emerald-500" />
            <span class="size-2 rounded-full bg-emerald-500" />
            <span class="size-2 rounded-full bg-emerald-400" />
            <span class="size-2 rounded-full bg-teal-400" />
            <span class="size-2 rounded-full bg-amber-400" />
            <span class="size-2 rounded-full bg-orange-400" />
            <span class="size-2 rounded-full bg-red-500" />
          </div>
          <p class="text-[10px] text-muted leading-snug">
            Green · Low / Orange: Med / Red · Red / Dark: Very High
          </p>
          <ClientOnly>
            <p class="text-[10px] text-muted">{{ minutesAgo(pollenUpdated) }}</p>
          </ClientOnly>
        </div>
      </div>

      <!-- Water Temp -->
      <div class="relative overflow-hidden rounded-2xl border border-default">
        <div class="relative px-5 pt-5 pb-14 bg-linear-to-br from-sky-600 via-cyan-500 to-teal-400">
          <div class="flex items-center justify-between mb-2">
            <span class="text-sm font-semibold text-white/90">Lake Travis <span class="font-bold">Water Temp</span></span>
            <span class="relative flex size-2">
              <span class="absolute inline-flex size-full animate-ping rounded-full bg-red-400 opacity-75" />
              <span class="relative inline-flex size-2 rounded-full bg-red-500" />
            </span>
          </div>
          <div class="flex items-baseline gap-1">
            <ClientOnly>
              <span v-if="water" class="text-5xl font-extrabold text-white tracking-tight font-display">
                {{ water.primary.tempF }}°
              </span>
              <span v-else class="text-5xl font-extrabold text-white/50 tracking-tight font-display">—</span>
              <template #fallback>
                <span class="text-5xl font-extrabold text-white/50 tracking-tight font-display">—</span>
              </template>
            </ClientOnly>
          </div>
          <!-- Wave sparkline -->
          <svg class="absolute bottom-0 left-0 w-full h-14 opacity-25" viewBox="0 0 400 60" preserveAspectRatio="none">
            <path d="M0,45 C50,30 100,50 150,35 S250,45 300,32 S380,42 400,38 V60 H0 Z" fill="white" />
          </svg>
        </div>
        <div class="bg-default px-5 py-3 space-y-1.5">
          <ClientOnly>
            <span class="text-[11px] text-muted">{{ minutesAgo(waterUpdated) }}</span>
          </ClientOnly>
          <p class="text-xs text-muted">Lighting Trails</p>
          <div class="flex items-center gap-2 text-[10px] text-muted">
            <span>Depth: Surface</span>
            <span class="size-2 rounded-full bg-amber-500 inline-block" />
            <span>Barton Springs : 70°</span>
          </div>
          <ClientOnly>
            <p class="text-[10px] text-muted">{{ minutesAgo(waterUpdated) }}</p>
          </ClientOnly>
        </div>
      </div>

      <!-- Austin Events -->
      <div class="relative overflow-hidden rounded-2xl border border-default">
        <div class="relative px-5 pt-5 pb-14 bg-linear-to-br from-amber-600 via-orange-500 to-red-500">
          <div class="flex items-center justify-between mb-2">
            <span class="text-sm font-semibold text-white/90"><span class="font-bold">Austin Events</span></span>
            <div class="flex items-center gap-1.5">
              <span class="text-[10px] font-semibold uppercase tracking-widest text-white/80">LIVE</span>
              <span class="relative flex size-2">
                <span class="absolute inline-flex size-full animate-ping rounded-full bg-emerald-400 opacity-75" />
                <span class="relative inline-flex size-2 rounded-full bg-emerald-500" />
              </span>
            </div>
          </div>
          <div class="flex items-baseline gap-2">
            <ClientOnly>
              <span v-if="events?.count" class="text-5xl font-extrabold text-white tracking-tight font-display">
                {{ events.count }}
              </span>
              <span v-else class="text-5xl font-extrabold text-white/50 tracking-tight font-display">—</span>
              <template #fallback>
                <span class="text-5xl font-extrabold text-white/50 tracking-tight font-display">—</span>
              </template>
            </ClientOnly>
            <span class="text-sm font-bold uppercase tracking-wider text-white/70">EVENTS</span>
          </div>
          <!-- Bar chart sparkline -->
          <svg class="absolute bottom-0 left-0 w-full h-14 opacity-25" viewBox="0 0 400 60" preserveAspectRatio="none">
            <rect x="20" y="25" width="30" height="35" rx="3" fill="white" />
            <rect x="65" y="15" width="30" height="45" rx="3" fill="white" />
            <rect x="110" y="30" width="30" height="30" rx="3" fill="white" />
            <rect x="155" y="10" width="30" height="50" rx="3" fill="white" />
            <rect x="200" y="20" width="30" height="40" rx="3" fill="white" />
            <rect x="245" y="35" width="30" height="25" rx="3" fill="white" />
            <rect x="290" y="18" width="30" height="42" rx="3" fill="white" />
            <rect x="335" y="28" width="30" height="32" rx="3" fill="white" />
          </svg>
        </div>
        <div class="bg-default px-5 py-3 space-y-1.5">
          <ClientOnly>
            <span class="text-[11px] text-muted">{{ minutesAgo(eventsUpdated) }}</span>
          </ClientOnly>
          <ClientOnly>
            <ul v-if="events?.events.length" class="space-y-0.5">
              <li
                v-for="ev in events.events.slice(0, 2)"
                :key="ev.name"
                class="text-[10px] text-muted truncate"
              >
                {{ ev.name }}
              </li>
            </ul>
          </ClientOnly>
          <ClientOnly>
            <p class="text-[10px] text-muted">{{ minutesAgo(eventsUpdated) }}</p>
          </ClientOnly>
        </div>
      </div>
    </div>
  </section>
</template>
