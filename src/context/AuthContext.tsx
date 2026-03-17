'use client'

import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useState,
} from 'react'

interface AuthUser {
  id: string
  email: string | undefined
  seeded: boolean
}

interface AuthContextValue {
  user: AuthUser | null
  /** true while the initial /api/auth/me check is in flight */
  loading: boolean
  login: (email: string, password: string) => Promise<void>
  logout: () => Promise<void>
  signup: (email: string, password: string) => Promise<void>
  /** Call after seeding is complete to update the seeded flag */
  markSeeded: () => void
}

const AuthContext = createContext<AuthContextValue | null>(null)

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<AuthUser | null>(null)
  const [loading, setLoading] = useState(true)

  // On mount: check whether a session already exists
  useEffect(() => {
    async function checkSession() {
      try {
        const res = await fetch('/api/auth/me')
        if (res.ok) {
          const data = await res.json()
          setUser(data.user)
        }
      } finally {
        setLoading(false)
      }
    }
    checkSession()
  }, [])

  const login = useCallback(async (email: string, password: string) => {
    const res = await fetch('/api/auth/login', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ email, password }),
    })
    const data = await res.json()
    if (!res.ok) throw new Error(data.error ?? 'Login failed')
    setUser(data.user)

    // Trigger seed if this is the first login
    if (data.user?.seeded === false) {
      try {
        await fetch('/api/recipes/seed', { method: 'POST' })
        setUser((prev) => prev ? { ...prev, seeded: true } : prev)
      } catch {
        // Non-fatal — seed can be retried
      }
    }
  }, [])

  const logout = useCallback(async () => {
    await fetch('/api/auth/logout', { method: 'POST' })
    setUser(null)
  }, [])

  const signup = useCallback(async (email: string, password: string) => {
    const res = await fetch('/api/auth/signup', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ email, password }),
    })
    const data = await res.json()
    if (!res.ok) throw new Error(data.error ?? 'Sign up failed')
    // After signup, immediately sign in to establish a session
    await login(email, password)
  }, [login])

  const markSeeded = useCallback(() => {
    setUser((prev) => prev ? { ...prev, seeded: true } : prev)
  }, [])

  const value = useMemo(
    () => ({ user, loading, login, logout, signup, markSeeded }),
    [user, loading, login, logout, signup, markSeeded],
  )

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>
}

export function useAuth(): AuthContextValue {
  const ctx = useContext(AuthContext)
  if (!ctx) throw new Error('useAuth must be used within AuthProvider')
  return ctx
}
