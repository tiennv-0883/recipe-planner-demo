# Feature Specification: Multi-Language Support

**Feature Branch**: `006-multi-language`  
**Created**: 2026-03-31  
**Status**: Draft  
**Input**: User description: "Add multi-language support (Vietnamese default, English secondary). Translate all UI text to Vietnamese. Add language switcher."

## User Scenarios & Testing *(mandatory)*

### User Story 1 - Vietnamese Default Experience (Priority: P1)

A first-time visitor opens the Recipe Planner app without any stored language preference. Every piece of UI text — navigation labels, button text, form labels, error messages, empty states, and page headings — is displayed in Vietnamese immediately, without any action required from the user.

**Why this priority**: Vietnamese is the default locale. Without this story there is no baseline product for the target audience. All subsequent stories depend on the translation infrastructure this establishes.

**Independent Test**: Open the app in a fresh browser profile (no stored preferences). Verify every visible UI string on the Login page, Navigation bar, Recipes list, Meal Planner, Grocery List, and Dashboard is in Vietnamese.

**Acceptance Scenarios**:

1. **Given** a user has no stored language preference, **When** they open the app for the first time, **Then** all UI text is displayed in Vietnamese.
2. **Given** the app is displaying Vietnamese, **When** the user navigates to any page (Login, Signup, Recipes, Meal Planner, Grocery List, Dashboard), **Then** all page headings, labels, buttons, and messages appear in Vietnamese.
3. **Given** the app is displaying Vietnamese, **When** a form validation error occurs, **Then** the error message is shown in Vietnamese.

---

### User Story 2 - Switch Language to English (Priority: P2)

A Vietnamese-speaking user encounters a colleague who prefers English. They click a language switcher visible in the navigation bar, select "English", and the entire app's UI immediately re-renders in English — no page reload or URL change occurs.

**Why this priority**: This is the core interactive feature. Without it, the app is locked to one language with no way to change it.

**Independent Test**: With the app in Vietnamese, click the language switcher in the navigation bar and select English. Verify all visible UI text on the current page switches to English instantly, and the URL remains unchanged.

**Acceptance Scenarios**:

1. **Given** the app is in Vietnamese, **When** the user clicks the language switcher and selects English, **Then** all UI text on the current page switches to English without a page reload.
2. **Given** the user has switched to English, **When** they navigate to a different page, **Then** that page also displays in English.
3. **Given** the app is in English, **When** the user clicks the language switcher and selects Vietnamese, **Then** all UI text reverts to Vietnamese.
4. **Given** the user switches language, **Then** the URL does not change (no `/vi/` or `/en/` prefix or suffix is added).

---

### User Story 3 - Persistent Language Preference (Priority: P3)

A user switches the app to English, closes the browser, and returns the next day. The app remembers their preference and opens in English again, without requiring them to switch again.

**Why this priority**: Without persistence, users must switch language on every visit, which is poor UX. This delivers lasting value for users who prefer the non-default language.

**Independent Test**: Switch to English, close and reopen the browser (or a new tab), navigate to the app. Verify the app opens in English without the user taking any action.

**Acceptance Scenarios**:

1. **Given** a user has selected English and closed the browser, **When** they return to the app in a new session, **Then** the app displays in English.
2. **Given** a user has never changed the language, **When** they return to the app in a new session, **Then** the app still displays in Vietnamese (default).
3. **Given** a user switches back to Vietnamese after previously selecting English, **When** they return in a new session, **Then** the app displays in Vietnamese.

---

### Edge Cases

- What happens when a translation key exists in Vietnamese but is missing in English? The system falls back to the Vietnamese string rather than showing a raw key or blank text.
- What happens if the stored language preference is an unrecognized value (e.g., corrupted storage)? The system defaults to Vietnamese.
- What happens in a private/incognito browsing session where storage may be restricted? The app defaults to Vietnamese for the session; no error is shown to the user.
- What happens to user-generated content (recipe names, ingredient lists) when the language is switched? User-generated content is not translated — only application UI strings change.

## Requirements *(mandatory)*

### Functional Requirements

- **FR-001**: System MUST display all UI text in Vietnamese by default for any user without a stored language preference.
- **FR-002**: System MUST provide a language switcher component in the navigation bar that is visible and accessible on every page.
- **FR-003**: The language switcher MUST offer exactly two options: Vietnamese (Tiếng Việt) and English (English).
- **FR-004**: Users MUST be able to switch between Vietnamese and English without a full page reload and without any change to the URL.
- **FR-005**: System MUST persist the user's selected language across browser sessions (close and reopen).
- **FR-006**: All hardcoded UI strings on all pages and components MUST be replaced with translation keys backed by Vietnamese and English message bundles.
- **FR-007**: Every page and component in scope — Login, Signup, Recipes list, Recipe detail, Create/Edit recipe form, Meal Planner, Grocery List, Dashboard, and Navigation bar — MUST have complete translations in both Vietnamese and English.
- **FR-008**: System MUST fall back to the Vietnamese string when a translation key is missing in the English message bundle.
- **FR-009**: System MUST NOT introduce URL-based locale prefixes (e.g., `/vi/`, `/en/`); locale MUST be stored client-side only.
- **FR-010**: User-generated content (recipe titles, ingredient names, descriptions entered by users) is explicitly out of scope for translation.

### Key Entities

- **Locale**: Represents a supported language option. Contains a locale code (`vi` or `en`) and a display label ("Tiếng Việt" or "English"). The default locale is `vi`.
- **Message Bundle**: A structured set of translation key-value pairs for a single locale, covering all UI text across every page and component. One bundle exists per supported locale.
- **Language Preference**: The user's actively selected locale, stored client-side and persisted across sessions. Falls back to the default locale (`vi`) when absent or unrecognized.

## Success Criteria *(mandatory)*

### Measurable Outcomes

- **SC-001**: 100% of application UI strings on all in-scope pages appear in Vietnamese when no language preference is stored.
- **SC-002**: Users can switch between Vietnamese and English in 2 clicks or fewer (open switcher → select language).
- **SC-003**: Language switches take effect instantly — all visible text on the current page updates without a page reload.
- **SC-004**: Language preference is retained across 100% of return-visit test scenarios after closing and reopening the browser.
- **SC-005**: Zero translation keys or raw/blank strings are visible to users in either language during normal app use.
- **SC-006**: The URL remains identical before and after a language switch on the same page.
- **SC-007**: All in-scope pages pass a visual audit confirming zero English-only strings when Vietnamese is active.

## Assumptions

- User-generated content (recipe names, ingredient names, notes) is NOT translated — only application UI chrome.
- The two supported languages are fixed at Vietnamese and English for this feature; adding further languages is out of scope.
- No right-to-left (RTL) language support is required.
- The language switcher displays both options as text labels (not flag icons), though icons may be added in a future iteration.
- If a user's browser or OS locale is not used for automatic language detection — only the explicitly stored preference (or default) determines the active locale.
- Server-side rendering of translated content is expected to match client-side rendering; hydration mismatches should not be visible to users.
