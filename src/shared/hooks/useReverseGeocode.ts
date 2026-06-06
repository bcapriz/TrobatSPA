import { useQuery } from '@tanstack/react-query'

const MAPS_API_KEY = (import.meta.env.VITE_GOOGLE_MAPS_API_KEY as string | undefined) ?? ''

interface GeocodeResponse {
  results: { formatted_address: string }[]
  status: string
}

export function useReverseGeocode(lat: number, lng: number) {
  return useQuery({
    queryKey: ['geocode', lat.toFixed(4), lng.toFixed(4)],
    queryFn: async (): Promise<string | null> => {
      const url =
        `https://maps.googleapis.com/maps/api/geocode/json` +
        `?latlng=${lat},${lng}&key=${MAPS_API_KEY}&language=es`
      const res = await fetch(url)
      const data = (await res.json()) as GeocodeResponse
      if (data.status === 'OK' && data.results.length > 0) {
        return data.results[0].formatted_address ?? null
      }
      return null
    },
    enabled: !!MAPS_API_KEY && !isNaN(lat) && !isNaN(lng),
    staleTime: Infinity,
    gcTime: 1000 * 60 * 60,
  })
}
