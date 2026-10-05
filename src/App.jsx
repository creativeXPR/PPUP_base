import { BrowserRouter, Navigate, Outlet, Route, Routes, useLocation } from 'react-router-dom'
import { AuthProvider } from './context/AuthContext'
import { LocationProvider } from './context/LocationContext'
import { useAuth } from './hooks/useAuth'
import Header from './components/layout/Header'
import Loader from './components/common/Loader'
import DashboardPage from './pages/DashboardPage'
import MapViewPage from './pages/MapViewPage'
import ReportIssuePage from './pages/ReportIssuePage'
import AdminPanelPage from './pages/AdminPanelPage'
import LoginPage from './pages/LoginPage'
import NotFoundPage from './pages/NotFoundPage'

function RequireAuth() {
  const { user, loading } = useAuth()
  const location = useLocation()
  if (loading) return <Loader fullScreen />
  if (!user) return <Navigate to="/login" replace state={{ from: location.pathname + location.search }} />
  return (
    <LocationProvider>
      <Outlet />
    </LocationProvider>
  )
}

function RequireAdmin() {
  const { isAdmin } = useAuth()
  return isAdmin ? <Outlet /> : <Navigate to="/" replace />
}

export default function App() {
  return (
    <AuthProvider>
      <BrowserRouter>
        <Header />
        <Routes>
          <Route path="/login" element={<LoginPage />} />
          <Route element={<RequireAuth />}>
            <Route path="/" element={<DashboardPage />} />
            <Route path="/map" element={<MapViewPage />} />
            <Route path="/report" element={<ReportIssuePage />} />
            <Route element={<RequireAdmin />}>
              <Route path="/admin" element={<AdminPanelPage />} />
            </Route>
          </Route>
          <Route path="*" element={<NotFoundPage />} />
        </Routes>
      </BrowserRouter>
    </AuthProvider>
  )
}
