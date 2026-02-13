import type { WaterTempData, WaterTempLocation } from '~/types/live'
import type { LiveStatus } from '~/types/live'

interface WaterTempApiResponse {
  primary: WaterTempLocation
  secondary: WaterTempLocation[]
  lightingTrails: boolean
  updatedAt: string
}

/**
 * useLiveWaterTemps — fetches current water temperature data from /api/live/water-temps.
 */
export function useLiveWaterTemps() {
  const { data, status: fetchStatus } = useFetch<WaterTempApiResponse>('/api/live/water-temps', {
    server: false,
    lazy: true,
  })

  const value = computed<WaterTempData | null>(() => {
    if (!data.value) return null
    return {
      primary: data.value.primary,
      secondary: data.value.secondary,
    }
  })

  const updatedAt = computed(() => data.value?.updatedAt ?? null)

  const status = computed<LiveStatus>(() => {
    if (fetchStatus.value === 'pending') return 'pending'
    if (fetchStatus.value === 'error') return 'error'
    if (fetchStatus.value === 'success') return 'success'
    return 'idle'
  })

  return { value, updatedAt, status }
}
