<!--
SYNC IMPACT REPORT
==================
Version change: (template) → 1.0.0
Modified principles: N/A (initial ratification)
Added sections:
  - Core Principles (5 principles)
  - Technology & Architecture Constraints
  - Development Workflow
  - Governance
Removed sections: All placeholder tokens replaced.
Templates requiring updates:
  - .specify/templates/plan-template.md  ✅ — Constitution Check gates align with principles below
  - .specify/templates/spec-template.md  ✅ — User Story format aligns with module boundaries
  - .specify/templates/tasks-template.md ✅ — Phase structure aligns with module pipeline
  - .specify/templates/constitution-template.md ✅ — Source template; no changes needed
Follow-up TODOs: None; all fields resolved.
-->

# Recipe Planner Constitution

## Core Principles

### I. Module Cohesion & Bounded Ownership

The system consists of three bounded modules that MUST remain independently operable:

- **Recipe Manager** — sole owner of recipe data (title, ingredients, steps, metadata).
  MUST expose a stable internal API consumed by the other two modules.
- **Meal Planner** — reads recipes via the Recipe Manager API; owns meal-slot assignments
  per day/week. MUST NOT directly mutate recipe data.
- **Grocery List Generator** — derives shopping lists exclusively from Meal Planner output.
  MUST NOT query recipe data directly; all ingredient data flows through Meal Planner.

Each module MUST be independently testable and demonstrable as a standalone slice of
functionality. Cross-module communication is permitted only through defined service
interfaces — never through shared mutable state or direct database cross-queries.

**Rationale**: Clear ownership prevents cascading breakage; enables parallel development
and isolated testing of each core concern.

### II. Recipe as Single Source of Truth

Recipes are the authoritative data origin for all ingredient information in the system.

- Every ingredient quantity, unit, and name used by Meal Planner or Grocery List Generator
  MUST originate from Recipe Manager data — never from ad-hoc user input that bypasses it.
- When a recipe is updated (e.g., ingredient quantity change), any dependent meal plans
  MUST reflect the change or flag affected plans for user review.
- Duplicate ingredient entries (e.g., "tomato" vs "Tomato") MUST be normalized at
  ingestion time.

**Rationale**: A single source of truth eliminates inconsistency between what a recipe
says and what lands on the grocery list.

### III. Test-First Development (NON-NEGOTIABLE)

TDD is MANDATORY for all business logic across the three modules.

- Tests MUST be written and approved before implementation begins.
- Red → Green → Refactor cycle MUST be followed strictly.
- Unit tests MUST cover: recipe CRUD operations, meal-slot assignment logic, grocery
  aggregation and deduplication.
- Integration tests MUST cover: Recipe Manager → Meal Planner data flow, and the
  Meal Planner → Grocery List generation pipeline end-to-end.
- No feature MUST be merged without passing tests that verify its acceptance scenarios.

**Rationale**: The module pipeline (Recipe → Meal → Grocery) creates compounding
correctness requirements; defects introduced early multiply downstream.

### IV. User-Centric Simplicity (YAGNI)

Every feature MUST be traceable to a concrete user story before implementation begins.

- UI decisions MUST minimize steps for the primary user flows: adding a recipe,
  building a weekly meal plan, and exporting/viewing a grocery list.
- No feature MUST be added speculatively; complexity requires justification via an
  accepted user story.
- Default states MUST be sensible: new meal plans start empty, grocery lists auto-generate
  from the active plan, recipes come with suggested serving sizes.
- Automation (e.g., generating a grocery list from a meal plan) MUST be triggered by
  explicit user action, not silently on background change.

**Rationale**: Recipe planning tools fail when cognitive load exceeds the effort of
using pen and paper; simplicity is a feature.

### V. Data Integrity, Versioning & Migration Safety

All persistent data schemas MUST be versioned and migration-safe.

- Schema changes MUST include a migration script; destructive migrations (column removal,
  type change) MUST be preceded by a deprecation period and data backfill.
- Recipe, MealPlan, and GroceryList entities MUST carry `created_at` and `updated_at`
  audit timestamps.
- API contracts between modules MUST follow semantic versioning: breaking changes
  increment MAJOR, additive changes increment MINOR.
- Soft-delete MUST be used for recipes and meal plans to prevent accidental data loss;
  hard-delete requires explicit user confirmation.

**Rationale**: Users invest time building recipe libraries and meal schedules; data loss
or silent schema breakage destroys trust.

## Technology & Architecture Constraints

- **Project type**: Web application with frontend + backend separation.
- **Architecture**: Monorepo with `backend/` and `frontend/` top-level directories.
- **Backend**: RESTful API; JSON is the canonical data-exchange format.
- **Frontend**: Reactive single-page application; reads/writes via backend API only —
  no direct database access from the frontend is permitted.
- **Storage**: Relational database (PostgreSQL preferred); ORM-managed schema migrations.
- **Authentication**: Session or JWT-based; all write endpoints MUST require authentication.
- **Performance baseline**: Grocery list generation from a 7-day meal plan MUST complete
  in ≤ 500 ms server-side at p95.
- **Offline capability**: The grocery list view SHOULD be renderable from local cache
  when the device is offline (progressive enhancement, not a hard requirement for v1).
- Third-party integrations (e.g., nutrition APIs, store price lookups) are OUT OF SCOPE
  for v1 and MUST NOT be added without a constitution amendment.

## Development Workflow

- All work MUST be tied to a spec (`specs/###-feature-name/spec.md`) before a plan
  or task list is created.
- Feature branches follow the naming convention `###-feature-name` and MUST target `main`.
- Pull Requests MUST:
  1. Reference the spec and user story they implement.
  2. Pass all CI checks (lint + unit + integration tests).
  3. Include a Constitution Check section confirming compliance with applicable principles.
  4. Receive at least one peer review approval before merge.
- The Constitution Check in every plan MUST explicitly gate against:
  - **Principle I** — module boundaries respected?
  - **Principle II** — recipe data flows only through Recipe Manager?
  - **Principle III** — tests written before implementation?
  - **Principle V** — schema change includes a migration script?
- Releases follow `MAJOR.MINOR.PATCH` semver. Release notes MUST list user stories
  delivered, schema migrations applied, and any breaking API changes.

## Governance

This Constitution supersedes all other project practices and informal conventions.
Amendments MUST follow this procedure:

1. Open a PR modifying `.specify/memory/constitution.md` with a written rationale.
2. Increment `CONSTITUTION_VERSION` per the semantic versioning rules defined above.
3. Update `LAST_AMENDED_DATE` to the date of merge.
4. All dependent templates (plan, spec, tasks) MUST be reviewed and updated in the
   same PR if principles change.
5. The PR MUST be approved by the project lead before merge.

All PRs and code reviews MUST verify compliance with Core Principles I–V.
Complexity beyond what a user story demands MUST be justified in writing before
implementation begins.

**Version**: 1.0.0 | **Ratified**: 2026-03-11 | **Last Amended**: 2026-03-11
