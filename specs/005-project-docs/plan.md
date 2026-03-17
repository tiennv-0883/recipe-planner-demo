# Implementation Plan: Project Documentation with Screenshots

**Branch**: `005-project-docs` | **Date**: 2026-03-17 | **Spec**: [spec.md](./spec.md)  
**Input**: Feature specification from `specs/005-project-docs/spec.md`

## Summary

Capture 7 full-page screenshots of the Recipe Planner app (login, recipes list, recipe detail, create recipe, meal planner, multi-recipe slot, grocery list) using Playwright MCP in VS Code Agent mode. Save all screenshots to `docs/screenshots/` as PNG files at 1280×800 viewport. Update `README.md` in-place to add a Screenshots gallery section, an Environment Variables section, and update the Features list to mention multi-recipe meal slots (spec 004).

**Technical approach**: Playwright MCP tools (`mcp_playwright_browser_*`) navigate the running dev server, capture screenshots, and save them to the workspace. README is updated programmatically by the Copilot agent using file editing tools.

## Technical Context

**Language/Version**: TypeScript 5 (strict) / Node.js 20+ / Next.js 15.2.2  
**Primary Dependencies**: `@playwright/mcp@latest` (VS Code MCP, `.vscode/mcp.json`), `@playwright/test ^1.51.1` (existing devDep), Next.js 15 dev server (target)  
**Storage**: File system only — `docs/screenshots/*.png`, `README.md`  
**Testing**: No unit tests applicable — documentation feature; verified by file existence + size checks and manual visual inspection  
**Target Platform**: macOS developer machine; dev server at `http://localhost:3000`  
**Project Type**: Documentation tooling on top of existing Next.js 15 web application  
**Performance Goals**: N/A — one-time documentation generation task  
**Constraints**: Dev server must be running; multi-recipe slot requires pre-seeded data (≥2 recipes in one slot); VS Code must be in Agent mode for MCP tools  
**Scale/Scope**: 7 screenshots, 2 README sections added/updated, ~150 lines of markdown

## Constitution Check

*GATE: Must pass before Phase 0 research. Re-check after Phase 1 design.*

| Principle | Gate | Status | Notes |
|---|---|---|---|
| **I — Module Cohesion** | No module boundary violations | ✅ PASS | Documentation only — zero changes to Recipe Manager, Meal Planner, or Grocery List code |
| **II — Recipe as Source of Truth** | No data model changes | ✅ PASS | No schema or data changes |
| **III — TDD** | Business logic must have tests first | ✅ N/A | No business logic introduced; screenshot capture and file output are not testable via unit tests |
| **IV — YAGNI** | Every feature traceable to user story | ✅ PASS | 3 prioritized user stories defined in spec.md; no speculative features |
| **V — Data Versioning** | Schema changes require migration | ✅ N/A | No schema changes |

**Constitution Check post-design (Phase 1 re-check):**
- data-model.md confirms no new entities or schema changes
- contracts/screenshots.md defines a stable naming convention that prevents future drift
- No complexity violations; no Complexity Tracking table required

## Project Structure

### Documentation (this feature)

```text
specs/005-project-docs/
├── plan.md           ← This file
├── research.md       ← Phase 0 output (all unknowns resolved)
├── data-model.md     ← Phase 1 output (filesystem artifacts)
├── quickstart.md     ← Phase 1 output (capture + update steps)
├── contracts/
│   └── screenshots.md  ← Phase 1 output (filename + README contracts)
└── tasks.md          ← Phase 2 output (/speckit.tasks — not created here)
```

### Source Code (repository root)

```text
docs/
└── screenshots/         ← NEW: 7 PNG screenshots (created by implementation tasks)
    ├── 01-login.png
    ├── 02-recipes-list.png
    ├── 03-recipe-detail.png
    ├── 04-recipe-create.png
    ├── 05-meal-planner.png
    ├── 06-multi-recipe-slot.png
    └── 07-grocery-list.png

README.md                ← UPDATED: Screenshots + Environment Variables sections added
```

No changes to `src/`, `supabase/`, or `tests/` — this feature is purely documentation.

**Structure Decision**: Existing Next.js monorepo structure is unchanged. New `docs/screenshots/` directory sits at the repo root alongside `src/`, `supabase/`, and `specs/`. README.md is edited in-place.

## Phases

### Phase 0: Research ✅

All NEEDS CLARIFICATION items resolved in [research.md](./research.md).

| Research Item | Decision |
|---|---|
| R-001: Playwright MCP mechanism | Use `mcp_playwright_browser_*` tools in VS Code Agent mode |
| R-002: Route structure | 7 URLs derived from `src/app/` directory; routes 05+06 are same URL, different data state |
| R-003: Authentication strategy | Manual pre-auth via login form; Playwright context preserves cookies across navigations |
| R-004: Screenshot save path | Agent saves to `docs/screenshots/` using workspace file tools |
| R-005: GitHub relative image paths | `./docs/screenshots/NN-name.png` relative to repo root |
| R-006: Existing README status | README exists; update in-place, preserve structure, add 2 sections |

### Phase 1: Design Artifacts ✅

All Phase 1 artifacts generated:

| Artifact | Status | Path |
|---|---|---|
| data-model.md | ✅ Complete | [data-model.md](./data-model.md) |
| contracts/screenshots.md | ✅ Complete | [contracts/screenshots.md](./contracts/screenshots.md) |
| quickstart.md | ✅ Complete | [quickstart.md](./quickstart.md) |
| Agent context update | ✅ Complete | [.github/agents/copilot-instructions.md](../../.github/agents/copilot-instructions.md) |

### Phase 2: Tasks

*Handled by `/speckit.tasks` — produces tasks.md with T145+*

**Expected task grouping**:
- **Phase 22 — Setup**: Create `docs/screenshots/` directory
- **Phase 23 — Screenshot Capture**: 7 individual screenshot tasks (T146–T152)
- **Phase 24 — README Update**: Sections: Features update, Screenshots section, Environment Variables section
- **Phase 25 — Validation**: Verify file sizes, README renders correctly

