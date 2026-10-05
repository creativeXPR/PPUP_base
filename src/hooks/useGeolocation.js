import { useEffect, useState } from 'react'

const supported = typeof navigator !== 'undefined' && 'geolocation' in navigator

export function useGeolocation() {
  const [position, setPosition] = useState(null)
  const [error, setError] = useState(supported ? null : new Error('Geolocation is not supported'))

  useEffect(() => {
    if (!supported) return
    const id = navigator.geolocation.watchPosition(
      ({ coords }) =>
        setPosition({ lat: coords.latitude, lng: coords.longitude, accuracy: coords.accuracy }),
      setError,
      { enableHighAccuracy: true, timeout: 10000 },
    )
    return () => navigator.geolocation.clearWatch(id)
  }, [])

  return { position, error, loading: !position && !error }
}
