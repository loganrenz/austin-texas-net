<!-- eslint-disable atx/no-fetch-in-component -- Admin tool page -->
<script setup lang="ts">
definePageMeta({ title: 'Apple Maps API Tester', middleware: 'auth' })

const { ensureLoaded } = useAuth()
await ensureLoaded()



/* eslint-disable @typescript-eslint/no-explicit-any */

// ─── Form State ───────────────────────────────────────────────
const endpoint = ref('search')
const query = ref('Hyde Park')
const lat = ref(30.2672)
const lng = ref(-97.7431)
const limit = ref(10)
const resultTypeFilter = ref('')
const includeAddressCategories = ref('')

const endpointOptions = [
  { label: 'Search (POIs)', value: 'search', description: 'General place search via /v1/search' },
  { label: 'Geocode (Address → Coords)', value: 'geocode', description: 'Address to coordinates via /v1/geocode' },
  { label: 'Reverse Geocode (Coords → Address)', value: 'reverseGeocode', description: 'Coordinates to address via /v1/reverseGeocode' },
  { label: 'Neighborhood (SubLocality)', value: 'neighborhood', description: '/v1/search with resultTypeFilter=Address & SubLocality' },
  { label: 'Search (Address Results)', value: 'searchAddress', description: '/v1/search with resultTypeFilter=Address (all categories)' },
]

const presets = [
  { label: 'Hyde Park', query: 'Hyde Park', endpoint: 'neighborhood' },
  { label: 'Zilker', query: 'Zilker', endpoint: 'neighborhood' },
  { label: 'Downtown', query: 'Downtown', endpoint: 'neighborhood' },
  { label: 'East César Chávez', query: 'East César Chávez', endpoint: 'neighborhood' },
  { label: 'Mueller', query: 'Mueller', endpoint: 'neighborhood' },
  { label: 'Tarrytown', query: 'Tarrytown', endpoint: 'neighborhood' },
  { label: 'Barton Hills', query: 'Barton Hills', endpoint: 'neighborhood' },
  { label: 'Geocode: Hyde Park', query: 'Hyde Park, Austin, TX', endpoint: 'geocode' },
  { label: 'Rev: Zilker Park', query: '', endpoint: 'reverseGeocode', lat: 30.2669, lng: -97.7729 },
  { label: 'Rev: Hyde Park', query: '', endpoint: 'reverseGeocode', lat: 30.3070, lng: -97.7268 },
  { label: 'Rev: Downtown', query: '', endpoint: 'reverseGeocode', lat: 30.2672, lng: -97.7431 },
  { label: 'Rev: East Austin', query: '', endpoint: 'reverseGeocode', lat: 30.2612, lng: -97.7195 },
  { label: 'Rev: South Lamar', query: '', endpoint: 'reverseGeocode', lat: 30.2430, lng: -97.7735 },
  { label: 'POI: tacos', query: 'breakfast tacos', endpoint: 'search' },
]

// ─── Results ──────────────────────────────────────────────────
interface TestResult {
  endpoint: string
  requestUrl: string
  status: number
  elapsed: string
  resultCount: number
  neighborhoodFields: any[]
  rawResponse: any
}

const result = ref<TestResult | null>(null)
const loading = ref(false)
const error = ref<string | null>(null)
const showRaw = ref(false)
const history = ref<Array<{ endpoint: string; query: string; resultCount: number; elapsed: string }>>([])

async function runTest() {
  loading.value = true
  error.value = null
  result.value = null

  try {
    const body: any = { endpoint: endpoint.value }
    if (query.value) body.query = query.value
    if (lat.value) body.lat = Number(lat.value)
    if (lng.value) body.lng = Number(lng.value)
    if (limit.value) body.limit = Number(limit.value)
    if (resultTypeFilter.value) body.resultTypeFilter = resultTypeFilter.value
    if (includeAddressCategories.value) body.includeAddressCategories = includeAddressCategories.value

    const data = await $fetch<TestResult>('/api/admin/apple-maps-test', {
      method: 'POST',
      body,
    })

    result.value = data
    history.value.unshift({
      endpoint: data.endpoint,
      query: query.value || `${lat.value},${lng.value}`,
      resultCount: data.resultCount,
      elapsed: data.elapsed,
    })
    if (history.value.length > 20) history.value.pop()
  } catch (err: any) {
    error.value = err?.data?.message || err?.message || 'Unknown error'
  } finally {
    loading.value = false
  }
}

function applyPreset(p: typeof presets[number]) {
  endpoint.value = p.endpoint
  query.value = p.query
  if ('lat' in p) lat.value = p.lat!
  if ('lng' in p) lng.value = p.lng!
  runTest()
}

const selectedEndpointInfo = computed(() =>
  endpointOptions.find(e => e.value === endpoint.value),
)
</script>

<template>
  <div class="max-w-[1200px] mx-auto py-8 px-4 flex flex-col gap-6">
    <!-- Header -->
    <div class="flex justify-between items-center flex-wrap gap-4">
      <div class="flex items-center gap-3">
        <UIcon name="i-lucide-map-pin" class="size-7 text-primary" />
        <h1 class="text-2xl font-bold">Apple Maps API Tester</h1>
      </div>
      <UButton variant="outline" color="neutral" to="/admin" icon="i-lucide-arrow-left">
        Admin
      </UButton>
    </div>

    <!-- Quick Presets -->
    <UCard>
      <template #header>
        <span class="font-semibold text-sm">Quick Presets</span>
      </template>
      <div class="flex flex-wrap gap-2">
        <UButton
          v-for="p in presets"
          :key="p.label"
          size="xs"
          variant="soft"
          color="primary"
          @click="applyPreset(p)"
        >
          {{ p.label }}
        </UButton>
      </div>
    </UCard>

    <!-- Request Builder -->
    <UCard>
      <template #header>
        <div class="flex flex-col gap-1">
          <span class="font-semibold">Request Builder</span>
          <span v-if="selectedEndpointInfo" class="text-xs text-dimmed">
            {{ selectedEndpointInfo.description }}
          </span>
        </div>
      </template>

      <div class="flex flex-col gap-4">
        <div class="grid grid-cols-[repeat(auto-fit,minmax(200px,1fr))] gap-3">
          <USelect
            v-model="endpoint"
            :items="endpointOptions"
            value-key="value"
            label="Endpoint"
          />
          <UInput
            v-model="query"
            placeholder="Search query or address"
            icon="i-lucide-search"
            label="Query"
          />
          <UInput
            v-model.number="limit"
            type="number"
            placeholder="10"
            icon="i-lucide-hash"
            label="Limit"
          />
        </div>

        <div class="grid grid-cols-[repeat(auto-fit,minmax(200px,1fr))] gap-3">
          <UInput
            v-model.number="lat"
            type="number"
            step="0.0001"
            placeholder="30.2672"
            icon="i-lucide-navigation"
            label="Latitude"
          />
          <UInput
            v-model.number="lng"
            type="number"
            step="0.0001"
            placeholder="-97.7431"
            icon="i-lucide-navigation"
            label="Longitude"
          />
        </div>

        <div class="grid grid-cols-[repeat(auto-fit,minmax(200px,1fr))] gap-3">
          <UInput
            v-model="resultTypeFilter"
            placeholder="e.g. Poi, Address"
            icon="i-lucide-filter"
            label="resultTypeFilter (override)"
          />
          <UInput
            v-model="includeAddressCategories"
            placeholder="e.g. SubLocality, PostalCode"
            icon="i-lucide-tag"
            label="includeAddressCategories (override)"
          />
        </div>

        <UButton
          color="primary"
          icon="i-lucide-send"
          :loading="loading"
          class="self-start"
          @click="runTest"
        >
          Send Request
        </UButton>
      </div>
    </UCard>

    <!-- Error -->
    <UCard v-if="error" class="border-error/25">
      <div class="flex items-center gap-3 text-error">
        <UIcon name="i-lucide-alert-circle" class="size-5" />
        <span class="text-sm font-medium">{{ error }}</span>
      </div>
    </UCard>

    <!-- Results -->
    <template v-if="result">
      <!-- Response Meta -->
      <UCard>
        <template #header>
          <div class="flex justify-between items-center">
            <span class="font-semibold">Response</span>
            <div class="flex gap-2 items-center">
              <UBadge variant="subtle" :color="result.status === 200 ? 'success' : 'error'" size="xs">
                {{ result.status }}
              </UBadge>
              <UBadge variant="subtle" color="neutral" size="xs">
                {{ result.elapsed }}
              </UBadge>
              <UBadge variant="subtle" color="primary" size="xs">
                {{ result.resultCount }} results
              </UBadge>
            </div>
          </div>
        </template>
        <div class="text-xs font-mono text-dimmed break-all">
          {{ result.requestUrl }}
        </div>
      </UCard>

      <!-- Neighborhood Fields (extracted) -->
      <UCard>
        <template #header>
          <span class="font-semibold">Neighborhood-Relevant Fields</span>
        </template>

        <div v-if="result.neighborhoodFields.length" class="flex flex-col gap-4">
          <div
            v-for="(item, i) in result.neighborhoodFields"
            :key="i"
            class="border border-default rounded-lg p-4 flex flex-col gap-2"
          >
            <div class="flex items-center gap-2">
              <UBadge variant="solid" color="primary" size="xs">{{ i + 1 }}</UBadge>
              <span class="font-semibold text-sm">{{ item.name }}</span>
            </div>

            <div class="grid grid-cols-[repeat(auto-fit,minmax(200px,1fr))] gap-2 text-xs">
              <div v-if="item.dependentLocalities?.length" class="field-row col-span-full">
                <span class="field-label">dependentLocalities</span>
                <div class="flex gap-1 flex-wrap">
                  <UBadge
                    v-for="dl in item.dependentLocalities"
                    :key="dl"
                    variant="subtle"
                    color="success"
                    size="xs"
                  >
                    {{ dl }}
                  </UBadge>
                </div>
              </div>
              <div v-else class="field-row col-span-full">
                <span class="field-label">dependentLocalities</span>
                <span class="text-dimmed">— (none)</span>
              </div>
              <div class="field-row">
                <span class="field-label">subLocality</span>
                <span :class="item.subLocality ? 'text-success font-semibold' : 'text-dimmed'">
                  {{ item.subLocality || '—' }}
                </span>
              </div>
              <div class="field-row">
                <span class="field-label">locality</span>
                <span>{{ item.locality || '—' }}</span>
              </div>
              <div class="field-row">
                <span class="field-label">adminArea</span>
                <span>{{ item.administrativeArea || '—' }}</span>
              </div>
              <div class="field-row">
                <span class="field-label">postCode</span>
                <span>{{ item.postCode || '—' }}</span>
              </div>
              <div class="field-row">
                <span class="field-label">coordinate</span>
                <span v-if="item.coordinate" class="font-mono">
                  {{ item.coordinate.latitude?.toFixed(4) }}, {{ item.coordinate.longitude?.toFixed(4) }}
                </span>
                <span v-else class="text-dimmed">—</span>
              </div>
              <div class="field-row">
                <span class="field-label">poiCategory</span>
                <span>{{ Array.isArray(item.poiCategory) ? item.poiCategory.join(', ') : item.poiCategory || '—' }}</span>
              </div>
              <div v-if="item.displayRegion" class="field-row col-span-full">
                <span class="field-label">displayRegion</span>
                <span class="font-mono text-[10px]">{{ JSON.stringify(item.displayRegion) }}</span>
              </div>
            </div>
          </div>
        </div>
        <div v-else class="text-center py-4 text-dimmed text-sm">
          No results returned
        </div>
      </UCard>

      <!-- Raw JSON toggle -->
      <UCard>
        <template #header>
          <div class="flex justify-between items-center">
            <span class="font-semibold">Raw JSON Response</span>
            <UButton size="xs" variant="soft" color="neutral" @click="showRaw = !showRaw">
              {{ showRaw ? 'Hide' : 'Show' }}
            </UButton>
          </div>
        </template>
        <pre
          v-if="showRaw"
          class="bg-default border border-default rounded-lg p-4 text-[0.7rem] max-h-[500px] overflow-auto whitespace-pre-wrap font-mono leading-relaxed"
        >{{ JSON.stringify(result.rawResponse, null, 2) }}</pre>
      </UCard>
    </template>

    <!-- History -->
    <UCard v-if="history.length">
      <template #header>
        <span class="font-semibold text-sm">Request History ({{ history.length }})</span>
      </template>
      <div class="flex flex-col">
        <div
          v-for="(h, i) in history"
          :key="i"
          class="flex items-center gap-3 py-2 border-b border-default last:border-b-0 text-sm"
        >
          <UBadge variant="subtle" color="neutral" size="xs" class="min-w-[100px] justify-center">
            {{ h.endpoint }}
          </UBadge>
          <span class="flex-1 font-medium truncate">{{ h.query }}</span>
          <span class="tabular-nums text-dimmed text-xs">{{ h.resultCount }} results</span>
          <span class="tabular-nums text-dimmed text-xs">{{ h.elapsed }}</span>
        </div>
      </div>
    </UCard>
  </div>
</template>

<style>
.field-row {
  display: flex;
  align-items: baseline;
  gap: 0.5rem;
  padding: 0.25rem 0;
}
.field-label {
  color: var(--ui-text-dimmed);
  font-weight: 600;
  min-width: 6rem;
  font-family: ui-monospace, SFMono-Regular, monospace;
  font-size: 0.7rem;
}
</style>
