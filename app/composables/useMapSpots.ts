import type { MapSpot } from '~/types/mapSpot'

export function useMapSpots() {
  const fetchCategorySpots = async (category: string) => {
    return await $fetch<{ spots: MapSpot[] }>(`/api/map-spots?category=${category}`)
  }

  return {
    fetchCategorySpots,
  }
}
