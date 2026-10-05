import { Link } from 'react-router-dom'
import { MapPin, LogOut } from 'lucide-react'
import { useAuth } from '../../hooks/useAuth'
import { logout } from '../../services/authService'
import Navbar from './Navbar'

export default function Header() {
  const { user } = useAuth()

  return (
    <header className="header">
      <Link to="/" className="brand">
        <MapPin size={20} /> ppup
      </Link>
      <Navbar />
      {user && (
        <div className="header-user">
          {user.photoURL && <img src={user.photoURL} alt="" className="avatar" />}
          <button className="icon-btn" onClick={logout} aria-label="Sign out">
            <LogOut size={18} />
          </button>
        </div>
      )}
    </header>
  )
}
