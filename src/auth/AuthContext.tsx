import { createContext, use, useCallback, useEffect, useMemo, useState, type ReactNode } from 'react'
import * as api from '../api/client'
import { clearToken, getToken, setToken, setUnauthorizedHandler } from '../api/client'

interface AuthContextValue {
  isAuthenticated: boolean
  username: string | null
  authError: string | null
  login: (username: string, password: string) => Promise<void>
  logout: () => void
  clearAuthError: () => void
}

const AuthContext = createContext<AuthContextValue | null>(null)

export function AuthProvider({ children }: { children: ReactNode }) {
  const [isAuthenticated, setIsAuthenticated] = useState(() => getToken() !== null)
  const [username, setUsername] = useState<string | null>(null)
  const [authError, setAuthError] = useState<string | null>(null)

  const logout = useCallback(() => {
    clearToken()
    setIsAuthenticated(false)
    setUsername(null)
  }, [])

  useEffect(() => {
    setUnauthorizedHandler(logout)
  }, [logout])

  useEffect(() => {
    if (!isAuthenticated) return
    api.me().then(
      (u) => setUsername(u.username),
      () => logout(),
    )
  }, [isAuthenticated, logout])

  const login = useCallback(async (u: string, password: string) => {
    setAuthError(null)
    try {
      const token = await api.login(u, password)
      setToken(token)
      setUsername(u)
      setIsAuthenticated(true)
    } catch {
      setAuthError('Invalid username or password')
      throw new Error('login failed')
    }
  }, [])

  const clearAuthError = useCallback(() => setAuthError(null), [])

  const value = useMemo(
    () => ({ isAuthenticated, username, authError, login, logout, clearAuthError }),
    [isAuthenticated, username, authError, login, logout, clearAuthError],
  )

  return <AuthContext value={value}>{children}</AuthContext>
}

export function useAuth(): AuthContextValue {
  const ctx = use(AuthContext)
  if (!ctx) throw new Error('useAuth must be used within AuthProvider')
  return ctx
}
