import { MapContainer as LeafletMap, TileLayer } from 'react-leaflet'
import { MAP_DEFAULTS } from '../../config/constants'

// App-wide map shell. Children are react-leaflet layers (markers, pickers, etc.).
export default function MapContainer({ center = MAP_DEFAULTS.center, zoom = MAP_DEFAULTS.zoom, className = 'map', children }) {
  return (
    <LeafletMap center={center} zoom={zoom} className={className} scrollWheelZoom>
      <TileLayer url={MAP_DEFAULTS.tileUrl} attribution={MAP_DEFAULTS.attribution} />
      {children}
    </LeafletMap>
  )
}
