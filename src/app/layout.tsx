import type { Metadata } from 'next'
import { Inter } from 'next/font/google'
import './globals.css'
import AppProviders from '@/src/components/providers/AppProviders'
import { AuthProvider } from '@/src/context/AuthContext'

const inter = Inter({ subsets: ['latin'] })

export const metadata: Metadata = {
  title: 'Recipe Planner',
  description: 'Plan your weekly meals and generate grocery lists',
}

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="en">
      <body className={inter.className}>
        {/* Skip to main content for keyboard users */}
        <a
          href="#main-content"
          className="sr-only focus:not-sr-only focus:absolute focus:z-50 focus:top-2 focus:left-2 rounded-lg bg-brand-500 px-4 py-2 text-sm font-semibold text-white focus:outline-none"
        >
          Skip to main content
        </a>
        <AuthProvider>
          <AppProviders>{children}</AppProviders>
        </AuthProvider>
      </body>
    </html>
  )
}
