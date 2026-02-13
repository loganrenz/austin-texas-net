import type { WeekendEventsData, EventItem } from '~/types/live'
import type { LiveStatus } from '~/types/live'

interface EventsApiResponse {
  count: number
  events: EventItem[]
  updatedAt: string
}

/**
 * useWeekendEvents — fetches weekend event summary from /api/live/events.
 */
export function useWeekendEvents() {
  const { data, status: fetchStatus } = useFetch<EventsApiResponse>('/api/live/events', {
    server: false,
    lazy: true,
  })

  const value = computed<WeekendEventsData | null>(() => {
    if (!data.value) return null
    return {
      count: data.value.count,
      events: data.value.events,
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
