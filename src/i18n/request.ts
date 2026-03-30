import { cookies } from 'next/headers'
import { getRequestConfig } from 'next-intl/server'
import { LOCALES, DEFAULT_LOCALE, type Locale } from './config'

export default getRequestConfig(async () => {
  const cookieStore = await cookies()
  const cookieValue = cookieStore.get('NEXT_LOCALE')?.value
  const locale: Locale = (LOCALES as readonly string[]).includes(cookieValue ?? '')
    ? (cookieValue as Locale)
    : DEFAULT_LOCALE

  return {
    locale,
    messages: (await import(`../../messages/${locale}.json`)).default,
  }
})
