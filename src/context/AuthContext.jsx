import { createContext, useEffect, useState } from 'react'
import { subscribeToAuth, getUserProfile } from '../services/authService'
import { ROLES } from '../config/constants'

// eslint-disable-next-line react-refresh/only-export-components
export const AuthContext = createContext(null)

export function AuthProvider({ children }) {
  const [user, setUser] = useState(null)
  const [profile, setProfile] = useState(null)
  const [loading, setLoading] = useState(true)

  useEffect(
    () =>
      subscribeToAuth(async (firebaseUser) => {
        setUser(firebaseUser)
        setProfile(firebaseUser ? await getUserProfile(firebaseUser.uid) : null)
        setLoading(false)
      }),
    [],
  )

  const value = { user, profile, loading, isAdmin: profile?.role === ROLES.ADMIN }
  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>
}
