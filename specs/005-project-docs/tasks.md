# Tasks: Project Documentation with Screenshots

**Input**: Design documents from `specs/005-project-docs/`  
**Branch**: `005-project-docs`  
**Spec**: [spec.md](./spec.md) | **Plan**: [plan.md](./plan.md) | **Data Model**: [data-model.md](./data-model.md) | **Contracts**: [contracts/screenshots.md](./contracts/screenshots.md) | **Research**: [research.md](./research.md)  
**Start Task ID**: T145 (continuing from spec 003 last task T127 → spec 004 last task T144)

## Format: `[ID] [P?] [Story] Description`

- **[P]**: Can run in parallel (different files, no dependencies on in-progress tasks)
- **[US1]–[US3]**: Which user story this task primarily serves
- File paths are from project root
- **No unit tests requested** — documentation-only feature; acceptance verified by file existence + visual inspection

---

## Phase 29: Setup

**Purpose**: Create the `docs/screenshots/` output directory. This satisfies FR-005 and US3's acceptance criterion (directory auto-created when absent). No user story label — this unblocks all screenshot capture tasks.

- [X] T145 Create `docs/screenshots/` directory at project root (required before any screenshot capture; satisfies FR-005)

**Checkpoint**: `ls docs/screenshots/` shows an empty directory. All Phase 30 tasks can now begin.

---

## Phase 30: User Story 1 — Capture Application Screenshots (Priority: P1) 🎯 MVP

**Goal**: Capture all 7 app pages as full-page PNG screenshots at 1280×800 viewport using Playwright MCP browser automation, saving them to `docs/screenshots/` with the names defined in `contracts/screenshots.md`.

**Independent Test**: Run `ls -lh docs/screenshots/` after completing this phase. Verify 7 PNG files exist, each greater than 10 KB (SC-001).

**⚠️ Pre-condition**: Dev server must be running at `http://localhost:3000`. VS Code must be in **Agent mode** for Playwright MCP tools to be available.

- [X] T146 [US1] Set Playwright browser viewport to 1280×800, navigate to `http://localhost:3000/login`, wait for the login form to render, take screenshot and save as `docs/screenshots/01-login.png`
- [X] T147 [US1] Fill login form email field and password field with existing account credentials using Playwright MCP, click the submit button, and wait for redirect to the authenticated dashboard (establishes browser session for all subsequent screensshots)
- [X] T148 [US1] Navigate to `http://localhost:3000/recipes`, wait for recipe cards to load, take screenshot and save as `docs/screenshots/02-recipes-list.png`
- [X] T149 [US1] Click the first recipe card to navigate to its detail page (`/recipes/:id`), wait for the full recipe (title, ingredients, steps) to render, take screenshot and save as `docs/screenshots/03-recipe-detail.png`
- [X] T150 [US1] Navigate to `http://localhost:3000/recipes/new`, wait for the create-recipe form to render with its input fields visible, take screenshot and save as `docs/screenshots/04-recipe-create.png`
- [X] T151 [US1] Navigate to `http://localhost:3000/meal-planner`, wait for the weekly grid to fully render with at least one recipe shown in a slot, take screenshot and save as `docs/screenshots/05-meal-planner.png`
- [X] T152 [US1] While on the meal planner page, use the "Add recipe" button on any slot that already has one recipe to add a second recipe to that same slot (demonstrating the spec 004 multi-recipe feature), wait for the slot to show 2 recipe names, take screenshot and save as `docs/screenshots/06-multi-recipe-slot.png`
- [X] T153 [US1] Navigate to `http://localhost:3000/grocery-list`, wait for the grocery list items to load, take screenshot and save as `docs/screenshots/07-grocery-list.png`

**Checkpoint**: `ls -lh docs/screenshots/` shows 7 PNG files, each > 10 KB. Screenshots 05 and 06 visually differ (06 shows 2 recipes in one cell, satisfying SC-005).

---

## Phase 31: User Story 2 — Update README with Full Project Documentation (Priority: P1)

**Goal**: Update `README.md` in-place to add a Screenshots gallery, an Environment Variables section, update the Features list with multi-recipe slots, and update the Tech Stack table to reflect Playwright. All image references use relative paths that resolve on GitHub.

**Independent Test**: Open `README.md` in VS Code Markdown preview (or push branch to GitHub). Verify: (1) 7 screenshots render inline, (2) Environment Variables table is present, (3) Features list mentions multi-recipe slots. Follow setup instructions to confirm they are accurate (SC-003).

- [X] T154 [P] [US2] Update the `## Features` section in `README.md` — add bullet "**Multi-Recipe Meal Slots** — Assign up to 3 recipes per meal slot for flexible weekly planning" under the Meal Planner bullet (satisfies FR-006)
- [X] T155 [P] [US2] Update the `## Tech Stack` table in `README.md` — add row `| Testing | Playwright (MCP + E2E) |` (satisfies FR-010)
- [X] T156 [P] [US2] Add a new `## Environment Variables` section to `README.md` after the `## Local Setup` section with a markdown table listing `NEXT_PUBLIC_SUPABASE_URL`, `NEXT_PUBLIC_SUPABASE_ANON_KEY`, and `SUPABASE_SERVICE_ROLE_KEY` with their descriptions and placeholder example values — no real credentials (satisfies FR-008)
- [X] T157 [US2] Add a new `## Screenshots` section to `README.md` after the `## Features` section, embedding all 7 PNG images using relative paths `./docs/screenshots/NN-name.png` with descriptive h3 headings and alt-text captions matching the contract in `contracts/screenshots.md` (satisfies FR-009, SC-004; depends on T146–T153)

**Checkpoint**: `README.md` contains all 5 required sections: Features, Screenshots, Tech Stack, Local Setup (Getting Started), Environment Variables (SC-002). Markdown preview shows all 7 images rendering inline without broken links.

---

## Phase 32: User Story 3 — Screenshot Freshness (Priority: P2)

**Goal**: Confirm that the directory auto-creation and overwrite behaviors required by US3 work as specified. No new code is needed — behavior is inherent in the setup task (T145) and Playwright MCP file saves. This phase validates and documents that behavior.

**Independent Test**: Delete `docs/screenshots/01-login.png`, re-run T146, confirm the file is recreated. Delete the entire `docs/screenshots/` directory, re-run T145 + T146, confirm the directory and file are both recreated.

- [X] T158 [US3] Verify US3 acceptance criteria: (1) re-run T146 to confirm `docs/screenshots/01-login.png` is **overwritten** (file modification time updates); (2) confirm `docs/screenshots/` was created by T145 before any screenshot was taken — note the auto-create pattern in `quickstart.md` under "Re-capture a Single Screenshot" for future contributors

**Checkpoint**: US3 acceptance criteria ① and ② both confirmed. Quickstart already documents re-capture steps.

---

## Phase 33: Polish & Validation

**Purpose**: Verify all success criteria are met before marking spec 005 complete.

- [X] T159 [P] Run `ls -lh docs/screenshots/` and confirm all 7 PNG files are present with sizes > 10 KB each (SC-001)
- [X] T160 [P] Open `README.md` in VS Code Markdown preview and confirm all 5 sections exist with correct content and all 7 screenshots render inline (SC-002, SC-004); verify no real credentials appear in the Env Vars table
- [X] T161 Run `git diff --name-only` and confirm only expected files are modified or new: `docs/screenshots/*.png` (7 files), `README.md` (1 file) — no accidental changes to `src/`, `supabase/`, or `tests/`

**Checkpoint**: All success criteria SC-001 through SC-005 confirmed. Spec 005 complete.

---

## Dependencies & Execution Order

### Phase Dependencies

- **Phase 29 (Setup)**: No dependencies — run first
- **Phase 30 (US1 Screenshots)**: Depends on Phase 29 (needs `docs/screenshots/` directory)
- **Phase 31 (US2 README)**: T154, T155, T156 [P] can run **after Phase 29** (no dependency on screenshots); T157 must run **after Phase 30** (screenshots must exist for inline image verification)
- **Phase 32 (US3 Validation)**: Depends on Phase 30 completion
- **Phase 33 (Polish)**: Depends on Phase 31 + 32 completion

### User Story Dependencies

- **US1 (P1)**: Starts after Phase 29. Sequential (single Playwright browser context). Blocks US2 T157 and US3 Phase 32.
- **US2 (P1)**: T154–T156 independent of US1. T157 depends on US1 (screenshots must exist).
- **US3 (P2)**: Depends on US1 — validates overwrite behavior of the screenshots captured in Phase 30.

### Within Phase 30 (Screenshot Sequence)

Screenshots must be captured **sequentially** — Playwright MCP uses a single persistent browser context; all 8 tasks share the same session (T147 authenticates once for T148–T153):

```
T146 (login page, no auth)
  → T147 (authenticate)
    → T148 (recipes list)
    → T149 (recipe detail)
    → T150 (create recipe form)
    → T151 (meal planner - single slot)
    → T152 (meal planner - multi-recipe slot, add 2nd recipe first)
    → T153 (grocery list)
```

### Parallel Opportunities Within Phase 31

T154, T155, T156 are edits to **different sections of the same file** — they can be executed as a single multi-replace operation:

```bash
# Execute T154 + T155 + T156 as one multi_replace_string_in_file call:
Task T154: Update ## Features (add multi-recipe bullet)
Task T155: Update ## Tech Stack (add Playwright row)
Task T156: Add ## Environment Variables section
```

Then T157 (add ## Screenshots section) runs after Phase 30 completes.

---

## Implementation Strategy

### MVP First (User Story 1 Only)

1. Complete Phase 29: Setup
2. Complete Phase 30: Capture 7 screenshots
3. **STOP and VALIDATE**: Check `ls -lh docs/screenshots/` — 7 PNGs exist and are >10 KB
4. Proceed to US2 (README update) only after US1 is validated

### Incremental Delivery

1. Phase 29 (Setup) → Phase 30 (US1) → **US1 validated** (7 screenshots)
2. Phase 31 T154–T156 (README text sections) → Phase 31 T157 (Screenshots section) → **US2 validated**
3. Phase 32 (US3 validation) → Phase 33 (Polish) → **Spec 005 complete**

### Pre-conditions Checklist

Before starting Phase 30, confirm:

- [ ] `npm run dev` is running and `http://localhost:3000` is accessible
- [ ] At least one user account exists in Supabase (register one if not)
- [ ] At least 3 recipes exist in the database (auto-seeded on first login)
- [ ] At least one recipe is assigned to a meal slot in the current or upcoming week
- [ ] VS Code is in **Agent mode** (not Ask/Chat) so Playwright MCP tools are available

---

## Notes

- **No unit tests** generated — spec is documentation-only; no business logic added
- **[P] within Phase 31**: T154, T155, T156 touch different sections of README.md and can be applied as one multi-replace call
- **Security**: Do NOT hardcode credentials anywhere in tasks, README, or screenshot filenames. T147 uses credentials provided interactively at runtime.
- **Screenshot 06 vs 05**: Both use the same URL. T152 requires adding a second recipe to the meal slot interactively; the Playwright browser context from T151 is still active and can be used to click "Add recipe" in the UI.
- **File size check (SC-001)**: Any screenshot < 10 KB is likely blank or failed; re-run that specific task.
