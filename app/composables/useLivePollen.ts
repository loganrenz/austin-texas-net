import type { PollenData } from '~/types/live'
import type { LiveStatus } from '~/types/live'

interface PollenApiResponse {
  count: number
  level: string
  type: string
  updatedAt: string
  details: Array<{ label: string; severity: string }>
}

/**
 * useLivePollen — fetches current pollen data from /api/live/pollen.
 */
export function useLivePollen() {
  const { data, status: fetchStatus } = useFetch<PollenApiResponse>('/api/live/pollen', {
    server: false,
    lazy: true,
  })

  const value = computed<PollenData | null>(() => {
    if (!data.value) return null
    return {
      count: data.value.count,
      level: data.value.level,
      type: data.value.type,
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
