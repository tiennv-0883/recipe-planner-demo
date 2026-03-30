# Data Model: Multi-Language Support (006)

**Phase**: 1 — Design  
**Branch**: `006-multi-language`

No database schema changes. This feature is purely client-side + message bundle files.

---

## Entities

### 1. Locale

Represents a supported language option.

| Field | Type | Values | Notes |
|-------|------|--------|-------|
| `code` | `'vi' \| 'en'` | `vi`, `en` | Stored in `NEXT_LOCALE` cookie |
| `label` | `string` | "Tiếng Việt", "English" | Defined in `nav.language.*` translation keys |
| `isDefault` | `boolean` | `true` for `vi` | Fallback when cookie absent/invalid |

### 2. Message Bundle

A structured JSON file containing all UI translation key-value pairs for one locale.

| Field | Type | Notes |
|-------|------|-------|
| `locale` | `'vi' \| 'en'` | Filename: `messages/{locale}.json` |
| `keys` | nested object | 8 top-level namespace keys (see schema below) |

### 3. Language Preference

The user's stored locale choice. Lives in an HTTP cookie.

| Field | Type | Notes |
|-------|------|-------|
| `cookieName` | `'NEXT_LOCALE'` | Standard next-intl cookie name |
| `value` | `'vi' \| 'en'` | Set by `setLocale()` Server Action |
| `path` | `'/'` | App-wide |
| `maxAge` | `31_536_000` | 1 year in seconds |
| `sameSite` | `'lax'` | CSRF-safe; allows cross-site top-level navigation |
| `secure` | `boolean` | `true` in production, `false` in development |

**Validation rule**: If the cookie value is not in `['vi', 'en']`, the system treats it as absent and falls back to `'vi'`.

---

## Message Bundle JSON Schema

Root structure for both `messages/vi.json` and `messages/en.json`:

```jsonc
{
  "auth": {
    "layout": {
      "tagline": string
    },
    "login": {
      "title": string,
      "emailLabel": string,
      "passwordLabel": string,
      "submit": string,
      "submitting": string,
      "noAccount": string,
      "signUp": string,
      "placeholder": { "email": string },
      "error": { "required": string, "failed": string }
    },
    "signup": {
      "title": string,
      "passwordHint": string,
      "submit": string,
      "submitting": string,
      "hasAccount": string,
      "signIn": string,
      "error": {
        "emailRequired": string,
        "emailInvalid": string,
        "passwordTooShort": string,
        "failed": string
      }
    }
  },
  "nav": {
    "dashboard": string,
    "recipes": string,
    "mealPlanner": string,
    "groceryList": string,
    "signOut": string,
    "brand": string,
    "language": { "vi": string, "en": string }
  },
  "dashboard": {
    "title": string,
    "subtitle": string,
    "stats": {
      "totalRecipes": string,
      "mealsPlanned": string,
      "groceryItemsLeft": string
    },
    "weekAtAGlance": {
      "title": string,
      "manage": string,
      "mealsPlanned": string,   // "{count} meals planned" — ICU param
      "slotsEmpty": string,     // "{count} slots empty"
      "noMeals": string,
      "emptyWeek": string,
      "planMeals": string
    },
    "recentRecipes": {
      "title": string,
      "viewAll": string,
      "empty": string
    }
  },
  "recipes": {
    "title": string,
    "inYourCollection": string,
    "found": string,
    "newRecipe": string,
    "empty": { "noFilters": string, "withFilters": string },
    "search": { "placeholder": string, "ariaLabel": string },
    "filter": { "clear": string, "ariaLabel": string },
    "detail": {
      "notFound": string,
      "notFoundSub": string,
      "backToRecipes": string,
      "edit": string,
      "delete": string,
      "ingredients": string,
      "instructions": string,
      "servings": string,   // "{n} servings" — ICU param
      "min": string         // "{n} min"
    },
    "form": {
      "titleLabel": string,
      "titlePlaceholder": string,
      "cookTimeLabel": string,
      "servingsLabel": string,
      "tagsLabel": string,
      "ingredientsLabel": string,
      "stepsLabel": string,
      "photoLabel": string,
      "photoHint": string,
      "namePlaceholder": string,
      "qtyPlaceholder": string,
      "unitPlaceholder": string,
      "addIngredient": string,
      "addStep": string,
      "clickToUpload": string,
      "saving": string,
      "cancel": string,
      "errors": {
        "titleRequired": string,
        "cookTimeInvalid": string,
        "servingsInvalid": string,
        "tagsRequired": string,
        "ingredientsRequired": string,
        "stepsRequired": string
      }
    },
    "picker": {
      "chooseRecipe": string,
      "noFound": string,
      "servings": string,   // "{n} servings"
      "searchAriaLabel": string,
      "closeAriaLabel": string
    }
  },
  "mealPlanner": {
    "title": string,
    "subtitle": string,       // "{filled} of {total} slots filled"
    "clearWeek": string,
    "clearConfirm": string,
    "empty": { "title": string, "subtitle": string },
    "days": {
      "mon": string, "tue": string, "wed": string, "thu": string,
      "fri": string, "sat": string, "sun": string
    },
    "meals": { "breakfast": string, "lunch": string, "dinner": string },
    "weekNav": { "thisWeek": string }
  },
  "groceryList": {
    "title": string,
    "remaining": string,           // "{n} items remaining"
    "remainingOne": string,        // "1 item remaining"
    "generate": string,
    "regenerate": string,
    "planMealsFirst": string,
    "empty": {
      "noMeals": { "title": string, "subtitle": string, "goToPlanner": string },
      "noItems": string
    },
    "addManual": {
      "trigger": string,
      "title": string,
      "itemName": string,
      "qty": string,
      "unit": string,
      "add": string,
      "cancel": string
    }
  },
  "categories": {
    "vegetables_fruits": string,
    "meat_fish": string,
    "dairy_eggs": string,
    "grains_bread": string,
    "spices_seasonings": string,
    "other": string
  },
  "notFound": {
    "title": string,
    "description": string,
    "goHome": string,
    "browseRecipes": string
  },
  "common": {
    "skipToContent": string
  }
}
```

---

## Key Counts by Namespace

| Namespace | Leaf Keys | ICU Params |
|-----------|-----------|------------|
| `auth` | 18 | 0 |
| `nav` | 8 | 0 |
| `dashboard` | 12 | 2 (`mealsPlanned`, `slotsEmpty`) |
| `recipes` | 33 | 2 (`detail.servings`, `detail.min`, `picker.servings`) |
| `mealPlanner` | 17 | 1 (`subtitle`) |
| `groceryList` | 13 | 1 (`remaining`) |
| `categories` | 6 | 0 |
| `notFound` | 4 | 0 |
| `common` | 1 | 0 |
| **Total** | **112** | **6** |

---

## New Source Files (no schema migration needed)

```text
messages/
├── vi.json       ← NEW: Default locale (112 keys)
└── en.json       ← NEW: English locale (112 keys, same structure)

src/i18n/
├── config.ts     ← NEW: locale constants
├── request.ts    ← NEW: getRequestConfig (reads NEXT_LOCALE cookie)
└── routing.ts    ← NEW: defineRouting({ localePrefix: 'never' })

src/app/actions/
└── locale.ts     ← NEW: setLocale() Server Action

src/components/
└── LanguageSwitcher.tsx  ← NEW: client component
```

## Modified Source Files

```text
next.config.ts             ← Add createNextIntlPlugin wrapper
src/app/layout.tsx         ← Make async, add NextIntlClientProvider
src/components/layout/Sidebar.tsx  ← Add LanguageSwitcher, use t() for nav labels
```

Plus all 24 component/page files listed in research.md R-002.

---

## Migration Notes

**No database migrations required.** This is a frontend-only change:
- `messages/*.json` are static files bundled at build time.
- The `NEXT_LOCALE` cookie is set and read entirely client/server-side.
- `src/data/categories.ts` retains its `FOOD_CATEGORY_LABELS` constant for runtime use but its English values are superseded by the `categories` namespace at render time.
