# Quickstart: Multi-Language Support (006)

**Branch**: `006-multi-language`  
**Spec**: [spec.md](./spec.md)

This guide covers how to run the app with multi-language support, add new translation keys, and test language switching.

---

## Prerequisites

- Node.js 20+, npm
- Dev server running: `npm run dev` → `http://localhost:3000`
- Supabase environment variables set in `.env.local` (no changes needed for this feature)

---

## 1. Install next-intl

```bash
npm install next-intl
```

---

## 2. Project Structure After Implementation

```text
messages/
├── vi.json            ← Default locale (Vietnamese)
└── en.json            ← English locale

src/i18n/
├── config.ts          ← Locale constants (LOCALES, DEFAULT_LOCALE)
├── request.ts         ← Server: reads NEXT_LOCALE cookie, loads messages
└── routing.ts         ← defineRouting({ localePrefix: 'never' })

src/app/
├── layout.tsx         ← Async; wraps with NextIntlClientProvider
└── actions/
    └── locale.ts      ← Server Action: setLocale(locale)

src/components/
└── LanguageSwitcher.tsx  ← Language toggle in Sidebar
```

---

## 3. Verify Language Switching

### 3.1 Default (Vietnamese)

1. Open `http://localhost:3000` in a fresh browser profile (no stored cookies).
2. All visible text should be in Vietnamese.
3. Open DevTools → Application → Cookies: no `NEXT_LOCALE` cookie should be set.

### 3.2 Switch to English

1. Click the language switcher in the sidebar (bottom).
2. Select "English".
3. All text on the current page should switch to English immediately (no page reload, no URL change).
4. Check Cookies: `NEXT_LOCALE=en` should now be set.

### 3.3 Persistence test

1. After switching to English, close the browser tab and reopen `http://localhost:3000`.
2. The app should open in English (cookie persists across sessions).

### 3.4 Fallback test

1. In DevTools → Application → Cookies, manually set `NEXT_LOCALE=fr` (invalid value).
2. Reload the page.
3. The app should display in Vietnamese (default fallback).

---

## 4. Adding a New Translation Key

1. Add the key to **`messages/vi.json`** first (Vietnamese is the source of truth).
2. Add the same key to **`messages/en.json`** with the English value.
3. In the component, call `useTranslations('namespace')`:

```tsx
import { useTranslations } from 'next-intl'

export default function MyComponent() {
  const t = useTranslations('recipes')
  return <h1>{t('title')}</h1>
}
```

4. For keys with ICU parameters:
```tsx
// messages/vi.json: "mealPlanner.subtitle": "{filled} / {total} ô đã điền"
t('subtitle', { filled: 3, total: 21 })
// → "3 / 21 ô đã điền"
```

---

## 5. Server Components

In a Server Component (or Server Action), use `getTranslations`:

```ts
import { getTranslations } from 'next-intl/server'

export default async function Page() {
  const t = await getTranslations('dashboard')
  return <h1>{t('title')}</h1>
}
```

---

## 6. Running Tests

Unit tests for locale utility functions:
```bash
npm test -- --testPathPattern=locale
```

Full test suite (must pass before merge):
```bash
npm test && npm run lint && npm run type-check
```

E2E smoke test (requires running dev server):
```bash
npm run test:e2e
```

---

## 7. Inspecting the Active Locale

```bash
# Check which locale the server is resolving for a request:
# Add a temporary log in src/i18n/request.ts
console.log('[i18n] resolved locale:', locale)
# Then restart dev server and reload the page
```

Or in the browser console:
```js
document.cookie  // look for NEXT_LOCALE=...
```

---

## 8. Common Errors

| Error | Likely cause | Fix |
|-------|-------------|-----|
| `Missing message: "..."` | Key in code but not in `vi.json` | Add key to both JSON files |
| Hydration mismatch | `layout.tsx` not made `async` with `getLocale()` | Ensure layout wraps with `NextIntlClientProvider` and uses `await getLocale()` |
| Language switch has no effect | `router.refresh()` not called after `setLocale()` | Check `LanguageSwitcher.tsx` calls `router.refresh()` inside `startTransition` |
| App always shows Vietnamese after switch | Cookie not being set | Check `locale.ts` server action; confirm `cookies().set(...)` receives correct args |
| TypeScript error on `t('key')` | Namespace mismatch | Ensure namespace string in `useTranslations('...')` matches top-level key in JSON |
