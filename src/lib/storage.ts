/**
 * localStorage helpers with `rp:` namespace prefix.
 * All operations are wrapped in try/catch so they degrade gracefully in
 * environments where localStorage is unavailable (SSR, private browsing).
 */

const NS = 'rp:'

export function storageKey(key: string): string {
  return `${NS}${key}`
}

export function getItem<T>(key: string): T | null {
  if (typeof window === 'undefined') return null
  try {
    const raw = localStorage.getItem(storageKey(key))
    if (raw === null) return null
    return JSON.parse(raw) as T
  } catch {
    return null
  }
}

export function setItem<T>(key: string, value: T): void {
  if (typeof window === 'undefined') return
  try {
    localStorage.setItem(storageKey(key), JSON.stringify(value))
  } catch {
    // Storage quota exceeded or other error — fail silently
  }
}

export function removeItem(key: string): void {
  if (typeof window === 'undefined') return
  try {
    localStorage.removeItem(storageKey(key))
  } catch {
    // fail silently
  }
}

export function clearNamespace(): void {
  if (typeof window === 'undefined') return
  try {
    const keys: string[] = []
    for (let i = 0; i < localStorage.length; i++) {
      const k = localStorage.key(i)
      if (k && k.startsWith(NS)) keys.push(k)
    }
    keys.forEach((k) => localStorage.removeItem(k))
  } catch {
    // fail silently
  }
}
