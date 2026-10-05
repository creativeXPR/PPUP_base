import { geohashForLocation, geohashQueryBounds, distanceBetween } from 'geofire-common'

export const toGeohash = (lat, lng) => geohashForLocation([lat, lng])

export const queryBoundsFor = (lat, lng, radiusM) => geohashQueryBounds([lat, lng], radiusM)

// distanceBetween returns km
export const distanceMeters = (a, b) => distanceBetween(a, b) * 1000
