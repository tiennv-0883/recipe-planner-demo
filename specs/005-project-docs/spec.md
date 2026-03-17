# Feature Specification: Project Documentation with Screenshots

**Feature Branch**: `005-project-docs`  
**Created**: 2025-07-14  
**Status**: Draft  
**Input**: User description: "Generate README documentation with screenshots of all main application pages using Playwright MCP, save screenshots to docs/screenshots/, and update README.md with feature list, setup instructions, environment variables, and screenshot gallery."

## User Scenarios & Testing *(mandatory)*

### User Story 1 - Capture Application Screenshots (Priority: P1)

A developer or contributor wants to visually document all main pages of the Recipe Planner app so that the README reflects the current state of the application with real screenshots.

**Why this priority**: Screenshots are the foundation for all documentation work. Without them, the README cannot include a visual gallery, and any other documentation improvements are blocked.

**Independent Test**: Run the screenshot task against a running dev server at `http://localhost:3000`. Verify that 7 PNG files appear in `docs/screenshots/` with correct names and non-zero file sizes.

**Acceptance Scenarios**:

1. **Given** the dev server is running at `http://localhost:3000`, **When** the screenshot task executes, **Then** 7 PNG files are saved to `docs/screenshots/` with names `01-login.png`, `02-recipes-list.png`, `03-recipe-detail.png`, `04-recipe-create.png`, `05-meal-planner.png`, `06-multi-recipe-slot.png`, `07-grocery-list.png`
2. **Given** a screenshot has been taken, **When** the image is opened, **Then** it shows the full page at a consistent viewport size (1280×800) with all UI elements visible
3. **Given** a page requires authentication, **When** the screenshot task navigates to that page, **Then** the task either captures the authenticated state (after login) or the login redirect, and the screenshot is not blank

---

### User Story 2 - Update README with Full Project Documentation (Priority: P1)

A new contributor or evaluator visits the GitHub repository and wants to understand what the application does, how to set it up locally, and what it looks like — all from the README.

**Why this priority**: The README is the primary entry point for anyone discovering the project. A complete README with screenshots, feature list, and setup instructions makes the project immediately usable and presentable.

**Independent Test**: Open `README.md` in a Markdown renderer. Verify all sections are present and screenshots render inline. Follow the setup instructions from scratch to confirm they are accurate.

**Acceptance Scenarios**:

1. **Given** a user opens `README.md`, **When** they read the Features section, **Then** they see a clear list of all implemented features grouped by category (recipe management, meal planning, grocery lists)
2. **Given** a user opens `README.md`, **When** they read the Setup section, **Then** they can follow the instructions to run the app locally without additional guidance
3. **Given** a user opens `README.md`, **When** they scroll to the Screenshots section, **Then** 7 screenshots render inline with descriptive captions identifying each page
4. **Given** a user opens `README.md`, **When** they read the Environment Variables section, **Then** they see a table listing every required env var with description and example value (no real secrets)

---

### User Story 3 - Maintain Screenshots Between Updates (Priority: P2)

A developer who makes UI changes wants to refresh individual screenshots without re-capturing the entire set, so that documentation stays current as the app evolves.

**Why this priority**: Documentation drift is a common problem. Making it easy to re-run screenshot capture per page reduces the cost of keeping docs current.

**Independent Test**: Modify one page's UI, re-run the screenshot task for that single page only, and confirm the updated PNG is saved to `docs/screenshots/` while other screenshots are unchanged.

**Acceptance Scenarios**:

1. **Given** an existing screenshot exists, **When** the screenshot task runs again, **Then** the existing file is overwritten with the new capture
2. **Given** the `docs/screenshots/` directory does not exist, **When** the screenshot task runs, **Then** the directory is created automatically before saving files

---

### Edge Cases

- What happens when the dev server is not running when screenshots are attempted? The task should fail with a clear error message indicating the server is unreachable at `http://localhost:3000`.
- What happens when a page requires login and no test credentials are available? The screenshot captures the login page or redirect destination — it does not block the task.
- What happens when the `docs/screenshots/` folder already contains files from a previous run? Files are overwritten by the new capture.
- What happens if a screenshot page takes longer than expected to load? A reasonable wait timeout (e.g., 10 seconds) is applied before capture; if exceeded, the task logs a warning and skips that page.

## Requirements *(mandatory)*

### Functional Requirements

- **FR-001**: The dev server MUST be running at `http://localhost:3000` before screenshots can be captured
- **FR-002**: The system MUST capture exactly 7 screenshots: login page, recipes list, recipe detail, create recipe form, meal planner grid, meal planner with multi-recipe slot showing multiple recipes in one cell, and grocery list
- **FR-003**: All screenshots MUST be saved to `docs/screenshots/` as PNG files with names `01-login.png`, `02-recipes-list.png`, `03-recipe-detail.png`, `04-recipe-create.png`, `05-meal-planner.png`, `06-multi-recipe-slot.png`, `07-grocery-list.png`
- **FR-004**: Screenshots MUST be captured at a consistent viewport of 1280×800 pixels
- **FR-005**: The `docs/screenshots/` directory MUST be created automatically if it does not exist
- **FR-006**: `README.md` MUST include a **Features** section listing all implemented capabilities: recipe CRUD with image upload, weekly meal planning with multi-recipe slots (up to 3 per slot), grocery list generation, and Supabase-backed authentication
- **FR-007**: `README.md` MUST include a **Getting Started** section with step-by-step local setup instructions: clone, install dependencies, configure environment variables, run database migrations, start dev server
- **FR-008**: `README.md` MUST include an **Environment Variables** section with a table of all required variables (`NEXT_PUBLIC_SUPABASE_URL`, `NEXT_PUBLIC_SUPABASE_ANON_KEY`) with descriptions and placeholder example values
- **FR-009**: `README.md` MUST include a **Screenshots** section that embeds all 7 PNG images using relative paths (`docs/screenshots/`) with descriptive captions
- **FR-010**: `README.md` MUST include a **Tech Stack** section listing the major technologies used (Next.js, TypeScript, Supabase, Tailwind CSS, Playwright)
- **FR-011**: The multi-recipe slot screenshot MUST visually show at least 2 recipes assigned to a single meal slot (demonstrating the spec 004 feature)

## Success Criteria *(mandatory)*

### Measurable Outcomes

- **SC-001**: All 7 PNG screenshot files exist in `docs/screenshots/` with file sizes greater than 10 KB each (confirming non-blank captures)
- **SC-002**: `README.md` contains all 5 required sections: Features, Tech Stack, Getting Started, Environment Variables, Screenshots
- **SC-003**: A new contributor can set up the project locally in under 10 minutes by following only the README instructions
- **SC-004**: All 7 screenshots render correctly inline when README.md is viewed on GitHub (relative image paths resolve correctly)
- **SC-005**: The multi-recipe slot screenshot visually differentiates from the single-recipe meal planner screenshot, demonstrating the multi-recipe capability

## Assumptions

- The dev server is accessible at `http://localhost:3000` during screenshot capture
- Screenshots are captured in a browser context that does not require real user login — either public pages are accessible, or the login page itself is captured as the entry point
- The meal planner multi-recipe slot screenshot may require seed/fixture data to show 2+ recipes in one slot; this data setup is part of the capture task
- `README.md` exists at the project root and will be updated in-place (not replaced entirely)
- No CI/CD automation for screenshot refresh is required at this stage — this is a one-time documentation generation task
- **[Entity 2]**: [What it represents, relationships to other entities]

## Success Criteria *(mandatory)*

<!--
  ACTION REQUIRED: Define measurable success criteria.
  These must be technology-agnostic and measurable.
-->

### Measurable Outcomes

- **SC-001**: [Measurable metric, e.g., "Users can complete account creation in under 2 minutes"]
- **SC-002**: [Measurable metric, e.g., "System handles 1000 concurrent users without degradation"]
- **SC-003**: [User satisfaction metric, e.g., "90% of users successfully complete primary task on first attempt"]
- **SC-004**: [Business metric, e.g., "Reduce support tickets related to [X] by 50%"]
