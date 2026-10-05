import { createContext, useCallback, useEffect, useState } from 'react'
import { getNearbyLocations } from '../services/locationService'
import { useGeolocation } from '../hooks/useGeolocation'
import { MAP_DEFAULTS, NEARBY_RADIUS_M } from '../config/constants'

// eslint-disable-next-line react-refresh/only-export-components
export const LocationContext = createContext(null)

export function LocationProvider({ children }) {
  const geo = useGeolocation()
  const [selected, setSelected] = useState(null)
  const [version, setVersion] = useState(0)
  const [result, setResult] = useState({ key: null, locations: [], error: null })

  // Rounded to ~100 m so small GPS jitter doesn't trigger a refetch.
  const lat = geo.position ? +geo.position.lat.toFixed(3) : MAP_DEFAULTS.center[0]
  const lng = geo.position ? +geo.position.lng.toFixed(3) : MAP_DEFAULTS.center[1]
  const key = `${lat},${lng}#${version}`

  useEffect(() => {
    if (geo.loading) return
    let cancelled = false
    getNearbyLocations(lat, lng, NEARBY_RADIUS_M).then(
      (locations) => !cancelled && setResult({ key, locations, error: null }),
      (error) => !cancelled && setResult({ key, locations: [], error }),
    )
    return () => {
      cancelled = true
    }
  }, [geo.loading, lat, lng, key])

  const refresh = useCallback(() => setVersion((v) => v + 1), [])

  const value = {
    origin: { lat, lng },
    geoError: geo.error,
    locations: result.locations,
    selected,
    setSelected,
    loading: geo.loading || result.key !== key,
    error: result.error,
    refresh,
  }
  return <LocationContext.Provider value={value}>{children}</LocationContext.Provider>
}
