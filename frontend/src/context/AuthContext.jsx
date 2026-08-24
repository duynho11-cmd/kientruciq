import { createContext, useCallback, useContext, useEffect, useState } from 'react'
import api, { getApiError } from '../services/api'

const AuthContext = createContext(null)

export function AuthProvider({ children }) {
  const [user, setUser] = useState(null)
  const [isLoading, setIsLoading] = useState(true)

  useEffect(() => {
    let active = true

    api.get('/auth/me')
      .then(({ data }) => {
        if (active) setUser(data.user)
      })
      .catch(() => {
        if (active) setUser(null)
      })
      .finally(() => {
        if (active) setIsLoading(false)
      })

    return () => { active = false }
  }, [])

  const login = useCallback(async (email, password, remember = false) => {
    try {
      const { data } = await api.post('/auth/login', { email, password, remember })
      setUser(data.user)
      return data.user
    } catch (error) {
      throw new Error(getApiError(error, 'Email hoặc mật khẩu không đúng.'))
    }
  }, [])

  const logout = useCallback(async () => {
    try {
      await api.post('/auth/logout')
    } finally {
      setUser(null)
    }
  }, [])

  return (
    <AuthContext.Provider value={{
      user,
      login,
      logout,
      isLoading,
      isAuthenticated: user?.role === 'admin',
    }}>
      {children}
    </AuthContext.Provider>
  )
}

export function useAuth() {
  const ctx = useContext(AuthContext)
  if (!ctx) throw new Error('useAuth must be used inside AuthProvider')
  return ctx
}
