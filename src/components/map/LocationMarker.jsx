import L from 'leaflet'
import { Marker, Popup } from 'react-leaflet'
import markerIcon from 'leaflet/dist/images/marker-icon.png'
import markerIcon2x from 'leaflet/dist/images/marker-icon-2x.png'
import markerShadow from 'leaflet/dist/images/marker-shadow.png'

// Leaflet's default icon paths break under Vite bundling; point them at the bundled assets.
delete L.Icon.Default.prototype._getIconUrl
L.Icon.Default.mergeOptions({ iconUrl: markerIcon, iconRetinaUrl: markerIcon2x, shadowUrl: markerShadow })

export default function LocationMarker({ location, onSelect }) {
  return (
    <Marker position={[location.lat, location.lng]} eventHandlers={{ click: () => onSelect?.(location) }}>
      <Popup>
        <strong>{location.name}</strong>
        {location.description && <p>{location.description}</p>}
      </Popup>
    </Marker>
  )
}
