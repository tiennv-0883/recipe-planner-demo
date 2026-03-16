'use client'

import { useRouter } from 'next/navigation'
import { useAuth } from '@/src/context/AuthContext'

export default function LogoutButton() {
  const { logout } = useAuth()
  const router = useRouter()

  async function handleLogout() {
    await logout()
    router.push('/login')
  }

  return (
    <button
      onClick={handleLogout}
      className="w-full rounded-lg px-3 py-2 text-left text-sm font-medium text-gray-700 transition-colors hover:bg-gray-100 dark:text-gray-300 dark:hover:bg-gray-700"
    >
      Sign out
    </button>
  )
}
