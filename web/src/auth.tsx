import { createContext, useCallback, useContext, useEffect, useState } from 'react'
import type { ReactNode } from 'react'
import { api, tokenStore } from './api'
import type { User } from './types'

interface AuthState {
  user: User | null
  loading: boolean
  login: (email: string, password: string) => Promise<void>
  register: (name: string, email: string, password: string) => Promise<void>
  logout: () => Promise<void>
  setUser: (user: User) => void
}

const AuthContext = createContext<AuthState | null>(null)

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUserState] = useState<User | null>(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    if (!tokenStore.get()) {
      setLoading(false)
      return
    }
    api
      .me()
      .then(setUserState)
      .catch(() => tokenStore.clear())
      .finally(() => setLoading(false))
  }, [])

  const login = useCallback(async (email: string, password: string) => {
    const { token, user } = await api.login(email, password)
    tokenStore.set(token)
    setUserState(user)
  }, [])

  const register = useCallback(async (name: string, email: string, password: string) => {
    const { token, user } = await api.register(name, email, password)
    tokenStore.set(token)
    setUserState(user)
  }, [])

  const logout = useCallback(async () => {
    setUserState(null)
  }, [])

  return (
    <AuthContext.Provider value={{ user, loading, login, register, logout, setUser: setUserState }}>
      {children}
    </AuthContext.Provider>
  )
}

export function useAuth() {
  const ctx = useContext(AuthContext)
  if (!ctx) throw new Error('useAuth must be used inside AuthProvider')
  return ctx
}
