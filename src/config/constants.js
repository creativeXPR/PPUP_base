export const COLLECTIONS = {
  USERS: 'users',
  LOCATIONS: 'locations',
  REPORTS: 'reports',
}

export const ROLES = {
  USER: 'user',
  ADMIN: 'admin',
}

export const REPORT_STATUS = {
  OPEN: 'open',
  IN_REVIEW: 'in_review',
  RESOLVED: 'resolved',
  REJECTED: 'rejected',
}

export const REPORT_TYPES = ['Damaged', 'Closed', 'Wrong location', 'Unsafe', 'Other']

export const MAP_DEFAULTS = {
  center: [6.5244, 3.3792], // Lagos
  zoom: 13,
  tileUrl: 'https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png',
  attribution: '&copy; OpenStreetMap contributors',
}

export const NEARBY_RADIUS_M = 5000

export const IMAGE_MAX_DIMENSION = 1280
export const IMAGE_QUALITY = 0.75
