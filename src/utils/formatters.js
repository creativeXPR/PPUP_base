export function formatDate(value) {
  if (!value) return '—'
  const date = value.toDate ? value.toDate() : new Date(value)
  return date.toLocaleString(undefined, { dateStyle: 'medium', timeStyle: 'short' })
}

export const formatCoords = (lat, lng) => `${lat.toFixed(5)}, ${lng.toFixed(5)}`

export function formatDistance(meters) {
  return meters < 1000 ? `${Math.round(meters)} m` : `${(meters / 1000).toFixed(1)} km`
}

export const formatStatus = (status) =>
  status ? status.replace(/_/g, ' ').replace(/^\w/, (c) => c.toUpperCase()) : ''
