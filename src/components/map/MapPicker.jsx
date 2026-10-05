import { Marker, useMapEvents } from 'react-leaflet'

// Click the map to choose a point. Render inside <MapContainer>.
export default function MapPicker({ value, onChange }) {
  useMapEvents({
    click: (e) => onChange({ lat: e.latlng.lat, lng: e.latlng.lng }),
  })

  return value ? <Marker position={[value.lat, value.lng]} /> : null
}
