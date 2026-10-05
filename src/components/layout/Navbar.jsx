import { NavLink } from 'react-router-dom'
import { useAuth } from '../../hooks/useAuth'

export default function Navbar() {
  const { user, isAdmin } = useAuth()
  if (!user) return null

  return (
    <nav className="navbar">
      <NavLink to="/" end>Dashboard</NavLink>
      <NavLink to="/map">Map</NavLink>
      <NavLink to="/report">Report</NavLink>
      {isAdmin && <NavLink to="/admin">Admin</NavLink>}
    </nav>
  )
}
