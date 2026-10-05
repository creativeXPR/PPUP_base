import { useState } from 'react'
import { Navigate, useLocation } from 'react-router-dom'
import { MapPin } from 'lucide-react'
import Button from '../components/common/Button'
import { useAuth } from '../hooks/useAuth'
import { signInWithGoogle } from '../services/authService'

export default function LoginPage() {
  const { user } = useAuth()
  const location = useLocation()
  const [busy, setBusy] = useState(false)
  const [error, setError] = useState(null)

  if (user) return <Navigate to={location.state?.from ?? '/'} replace />

  async function handleLogin() {
    setBusy(true)
    setError(null)
    try {
      await signInWithGoogle()
    } catch (err) {
      setError(err.message)
      setBusy(false)
    }
  }

  return (
    <main className="page page-center">
      <div className="card login-card">
        <MapPin size={36} />
        <h1>ppup</h1>
        <p className="muted">Pin places, report issues, keep the map honest.</p>
        <Button onClick={handleLogin} loading={busy}>Continue with Google</Button>
        {error && <p className="error">{error}</p>}
      </div>
    </main>
  )
}
