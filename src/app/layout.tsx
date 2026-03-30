import type { Metadata } from 'next'
import { Inter } from 'next/font/google'
import './globals.css'
import AppProviders from '@/src/components/providers/AppProviders'
import { AuthProvider } from '@/src/context/AuthContext'
import AuthGuard from '@/src/components/AuthGuard'
import { NextIntlClientProvider } from 'next-intl'
import { getLocale, getMessages, getTranslations } from 'next-intl/server'

const inter = Inter({ subsets: ['latin'] })

export const metadata: Metadata = {
  title: 'Recipe Planner',
  description: 'Plan your weekly meals and generate grocery lists',
}

export default async function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  const locale = await getLocale()
  const messages = await getMessages()
  const t = await getTranslations('common')

  return (
    <html lang={locale}>
      <body className={inter.className}>
        {/* Skip to main content for keyboard users */}
        <a
          href="#main-content"
          className="sr-only focus:not-sr-only focus:absolute focus:z-50 focus:top-2 focus:left-2 rounded-lg bg-brand-500 px-4 py-2 text-sm font-semibold text-white focus:outline-none"
        >
          {t('skipToContent')}
        </a>
        <NextIntlClientProvider locale={locale} messages={messages}>
          <AuthProvider>
            <AuthGuard>
              <AppProviders>{children}</AppProviders>
            </AuthGuard>
          </AuthProvider>
        </NextIntlClientProvider>
      </body>
    </html>
  )
}
