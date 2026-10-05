import { useContext, useState } from 'react'
import { Link } from 'react-router-dom'
import { Plus } from 'lucide-react'
import Button from '../components/common/Button'
import Sidebar from '../components/layout/Sidebar'
import MapContainer from '../components/map/MapContainer'
import LocationMarker from '../components/map/LocationMarker'
import LocationList from '../components/locations/LocationList'
import NewPinModal from '../components/locations/NewPinModal'
import { LocationContext } from '../context/LocationContext'

export default function MapViewPage() {
  const { locations, origin, selected, setSelected, refresh } = useContext(LocationContext)
  const [showNewPin, setShowNewPin] = useState(false)
  const center = selected ? [selected.lat, selected.lng] : [origin.lat, origin.lng]

  return (
    <main className="page page-map">
      <Sidebar title="Nearby">
        <Button onClick={() => setShowNewPin(true)}>
          <Plus size={16} /> New pin
        </Button>
        {selected && (
          <Link className="btn btn-ghost" to={`/report?location=${selected.id}`}>
            Report an issue with {selected.name}
          </Link>
        )}
        <LocationList locations={locations} selectedId={selected?.id} onSelect={setSelected} />
      </Sidebar>

      {/* key forces a recenter when the selection changes */}
      <MapContainer key={center.join(',')} center={center}>
        {locations.map((loc) => (
          <LocationMarker key={loc.id} location={loc} onSelect={setSelected} />
        ))}
      </MapContainer>

      {showNewPin && (
        <NewPinModal open initialPosition={origin} onClose={() => setShowNewPin(false)} onCreated={refresh} />
      )}
    </main>
  )
}
