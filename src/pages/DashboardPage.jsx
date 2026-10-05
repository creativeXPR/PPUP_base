import { useContext, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { Plus } from 'lucide-react'
import Button from '../components/common/Button'
import Loader from '../components/common/Loader'
import LocationList from '../components/locations/LocationList'
import NewPinModal from '../components/locations/NewPinModal'
import { LocationContext } from '../context/LocationContext'
import { useAuth } from '../hooks/useAuth'
import { NEARBY_RADIUS_M } from '../config/constants'
import { formatDistance } from '../utils/formatters'

export default function DashboardPage() {
  const { profile } = useAuth()
  const { locations, origin, loading, error, geoError, setSelected, refresh } = useContext(LocationContext)
  const [showNewPin, setShowNewPin] = useState(false)
  const navigate = useNavigate()

  function openOnMap(loc) {
    setSelected(loc)
    navigate('/map')
  }

  return (
    <main className="page">
      <div className="page-head">
        <div>
          <h1>Hi{profile?.displayName ? `, ${profile.displayName.split(' ')[0]}` : ''}</h1>
          <p className="muted">
            {locations.length} pins within {formatDistance(NEARBY_RADIUS_M)}
            {geoError && ' (location unavailable — showing default area)'}
          </p>
        </div>
        <Button onClick={() => setShowNewPin(true)}>
          <Plus size={16} /> New pin
        </Button>
      </div>

      {error && <p className="error">{error.message}</p>}
      {loading ? <Loader /> : <LocationList locations={locations} onSelect={openOnMap} />}

      {showNewPin && (
        <NewPinModal open initialPosition={origin} onClose={() => setShowNewPin(false)} onCreated={refresh} />
      )}
    </main>
  )
}
