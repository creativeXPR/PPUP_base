import { useState } from 'react'
import Button from '../common/Button'
import { REPORT_TYPES } from '../../config/constants'
import { createReport } from '../../services/reportService'
import { useAuth } from '../../hooks/useAuth'

export default function ReportForm({ locations, defaultLocationId = '', onSubmitted }) {
  const { user } = useAuth()
  const [locationId, setLocationId] = useState(defaultLocationId)
  const [type, setType] = useState(REPORT_TYPES[0])
  const [description, setDescription] = useState('')
  const [saving, setSaving] = useState(false)
  const [error, setError] = useState(null)

  async function handleSubmit(e) {
    e.preventDefault()
    setSaving(true)
    setError(null)
    try {
      await createReport({ locationId, type, description }, user)
      setDescription('')
      onSubmitted?.()
    } catch (err) {
      setError(err.message)
    } finally {
      setSaving(false)
    }
  }

  return (
    <form className="form" onSubmit={handleSubmit}>
      <label>
        Location
        <select value={locationId} onChange={(e) => setLocationId(e.target.value)} required>
          <option value="" disabled>Select a pin…</option>
          {locations.map((loc) => (
            <option key={loc.id} value={loc.id}>{loc.name}</option>
          ))}
        </select>
      </label>
      <label>
        Issue type
        <select value={type} onChange={(e) => setType(e.target.value)}>
          {REPORT_TYPES.map((t) => <option key={t}>{t}</option>)}
        </select>
      </label>
      <label>
        Details
        <textarea value={description} onChange={(e) => setDescription(e.target.value)} rows={4} required />
      </label>
      {error && <p className="error">{error}</p>}
      <Button type="submit" loading={saving}>Submit report</Button>
    </form>
  )
}
