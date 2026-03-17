'use client'

import { useEffect } from 'react'
import { useRouter, usePathname } from 'next/navigation'
import { useAuth } from '@/src/context/AuthContext'

/** Routes that can be accessed without authentication. */
const PUBLIC_PATHS = ['/login', '/signup']

/**
 * Client-side authentication guard.
 *
 * Complements the server-side middleware redirect by also handling
 * client-side navigation (router.push / Link) where middleware may
 * not re-run.
 *
 * Rules:
 *  - Not logged in  + protected route → redirect to /login
 *  - Already logged in + auth route   → redirect to /
 *  - Shows a loading spinner while the initial session check is in flight
 */
export default function AuthGuard({ children }: { children: React.ReactNode }) {
  const { user, loading } = useAuth()
  const router = useRouter()
  const pathname = usePathname()

  const isPublic = PUBLIC_PATHS.some((p) => pathname.startsWith(p))

  useEffect(() => {
    if (loading) return

    if (!user && !isPublic) {
      router.replace('/login')
    } else if (user && isPublic) {
      router.replace('/')
    }
  }, [user, loading, isPublic, router])

  // Show a spinner while the session is being verified
  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <div className="animate-spin rounded-full h-10 w-10 border-b-2 border-brand-500" />
      </div>
    )
  }

  // Render nothing while the redirect is in progress
  if (!user && !isPublic) return null
  if (user && isPublic) return null

  return <>{children}</>
}
