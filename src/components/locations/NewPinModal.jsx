import { useState } from 'react'
import Modal from '../common/Modal'
import Button from '../common/Button'
import MapContainer from '../map/MapContainer'
import MapPicker from '../map/MapPicker'
import ImageCompressor from './ImageCompressor'
import { createLocation } from '../../services/locationService'
import { useAuth } from '../../hooks/useAuth'
import { formatCoords } from '../../utils/formatters'

export default function NewPinModal({ open, onClose, initialPosition, onCreated }) {
  const { user } = useAuth()
  const [name, setName] = useState('')
  const [description, setDescription] = useState('')
  const [point, setPoint] = useState(initialPosition ?? null)
  const [imageFile, setImageFile] = useState(null)
  const [saving, setSaving] = useState(false)
  const [error, setError] = useState(null)

  async function handleSubmit(e) {
    e.preventDefault()
    if (!point) return setError('Tap the map to place the pin.')
    setSaving(true)
    setError(null)
    try {
      await createLocation({ name, description, ...point, imageFile }, user)
      onCreated?.()
      onClose()
    } catch (err) {
      setError(err.message)
    } finally {
      setSaving(false)
    }
  }

  return (
    <Modal open={open} title="New pin" onClose={onClose}>
      <form className="form" onSubmit={handleSubmit}>
        <label>
          Name
          <input value={name} onChange={(e) => setName(e.target.value)} required />
        </label>
        <label>
          Description
          <textarea value={description} onChange={(e) => setDescription(e.target.value)} rows={3} />
        </label>
        <MapContainer
          className="map map-small"
          center={point ? [point.lat, point.lng] : initialPosition ? [initialPosition.lat, initialPosition.lng] : undefined}
        >
          <MapPicker value={point} onChange={setPoint} />
        </MapContainer>
        <small className="muted">{point ? formatCoords(point.lat, point.lng) : 'Tap the map to place the pin'}</small>
        <ImageCompressor onChange={setImageFile} />
        {error && <p className="error">{error}</p>}
        <Button type="submit" loading={saving}>Save pin</Button>
      </form>
    </Modal>
  )
}
