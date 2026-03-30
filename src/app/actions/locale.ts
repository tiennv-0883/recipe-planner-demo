'use server'

import { cookies } from 'next/headers'
import { type Locale, LOCALES } from '@/src/i18n/config'

export async function setLocale(locale: Locale) {
  if (!(LOCALES as readonly string[]).includes(locale)) return
  const cookieStore = await cookies()
  cookieStore.set('NEXT_LOCALE', locale, {
    path: '/',
    maxAge: 31_536_000,
    sameSite: 'lax',
    secure: process.env.NODE_ENV === 'production',
  })
}
