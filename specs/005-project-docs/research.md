# Research: Project Documentation with Screenshots

**Branch**: `005-project-docs` | **Phase**: 0 | **Date**: 2026-03-17

## R-001: Playwright MCP Screenshot Mechanism

**Question**: How does `@playwright/mcp@latest` capture screenshots inside VS Code Agent mode?

**Decision**: Use the built-in `mcp_playwright_browser_*` tools available to the Copilot agent when Playwright MCP is loaded. The workflow is:
1. `mcp_playwright_browser_navigate` — navigate to a URL
2. `mcp_playwright_browser_wait_for` — wait for a selector or network idle
3. `mcp_playwright_browser_take_screenshot` — capture as PNG and save to a path

**Rationale**: `@playwright/mcp` exposes Playwright browser automation directly as MCP tools callable from within the agent. This is the canonical approach — no additional Playwright test script or Node.js runner is needed.

**Alternatives considered**:
- Writing a standalone `playwright.config.ts` screenshot script: rejected — requires spawning a separate process and re-implementing navigation logic already available via MCP tools
- Using puppeteer: rejected — Playwright is already a devDependency (`@playwright/test: ^1.51.1`) and Playwright MCP is configured

**Constraint**: VS Code must be in **Agent mode** (not Ask/Chat mode) for MCP tools to be invoked. Dev server must be running at `http://localhost:3000`.

---

## R-002: Application Route Structure

**Question**: What are the exact URLs and selectors for each of the 7 screenshot targets?

**Decision**: Derived from `src/app/` directory analysis:

| # | File | Path | URL | Auth Required |
|---|------|------|-----|---------------|
| 01 | `(auth)/login/` | `/login` | `http://localhost:3000/login` | No (public) |
| 02 | `recipes/page.tsx` | `/recipes` | `http://localhost:3000/recipes` | Yes |
| 03 | `recipes/[id]/` | `/recipes/:id` | `http://localhost:3000/recipes/:id` | Yes |
| 04 | `recipes/new/` | `/recipes/new` | `http://localhost:3000/recipes/new` | Yes |
| 05 | `meal-planner/` | `/meal-planner` | `http://localhost:3000/meal-planner` | Yes |
| 06 | `meal-planner/` | `/meal-planner` | `http://localhost:3000/meal-planner` | Yes (with multi-recipe data) |
| 07 | `grocery-list/` | `/grocery-list` | `http://localhost:3000/grocery-list` | Yes |

**Rationale**: Screenshots 05 and 06 are the same route — differ only in data state. Screenshot 05 shows a single recipe in a slot; screenshot 06 shows 2+ recipes in one slot (post spec 004 demo).

**Implication for implementation**: Multi-recipe slot screenshot (06) requires that the implementer manually add 2+ recipes to a meal slot BEFORE triggering that screenshot, OR use the API to seed it, OR crop/annotate an existing screenshot. The simplest approach is manual setup by the implementer.

---

## R-003: Authentication Strategy for Screenshots

**Question**: How should the agent handle authentication when navigating to protected pages?

**Decision**: **Manual pre-authentication strategy**. The implementer logs into the app in the same browser context before the agent begins capturing protected-page screenshots.

**Workflow**:
1. Screenshot 01 (`/login`): captured as-is — no auth needed
2. Implementer manually logs in via the login page in the Playwright browser context
3. Screenshots 02–07: captured in authenticated session (cookies persist in the Playwright browser context during the agent session)

**Rationale**:
- Playwright MCP shares a persistent browser context within a VS Code agent session — cookies set during one `mcp_playwright_browser_navigate` call are available in subsequent calls
- Embedding real credentials in task files is a security anti-pattern (violates OWASP A02 Cryptographic Failures)
- The agent should use `mcp_playwright_browser_fill_form` + `mcp_playwright_browser_click` to submit the login form with test credentials provided at runtime

**Alternatives considered**:
- Hardcoding test credentials in tasks.md: rejected — security risk
- Using Supabase service role to bypass auth: rejected — over-engineered for a screenshot task
- Skipping auth pages and only documenting the login page: rejected — spec requires screenshots of all 7 pages

---

## R-004: Screenshot File Output Path

**Question**: Does Playwright MCP's `mcp_playwright_browser_take_screenshot` support saving to a custom file path?

**Decision**: `mcp_playwright_browser_take_screenshot` returns image data in the response. The agent saves it to `docs/screenshots/` using the `create_file` tool (or file system MCP tools). The `docs/screenshots/` directory must be created first.

**Rationale**: MCP screenshot tools typically return base64-encoded image data or a temporary file path. The explicit file save step (using workspace file tools) ensures screenshots end up in the correct repository location with the correct filename.

**Fallback**: If `mcp_playwright_browser_take_screenshot` returns a file path directly, copy that file to `docs/screenshots/` with the correct name.

---

## R-005: README Relative Image Paths for GitHub

**Question**: What relative path format do GitHub and local Markdown renderers use for inline images?

**Decision**: Use `./docs/screenshots/NN-page-name.png` relative to the repo root (where `README.md` lives). GitHub automatically resolves these from the repository root.

**Rationale**: GitHub renders images in README files relative to the file location. Since `README.md` is at the repo root and screenshots are in `docs/screenshots/`, `./docs/screenshots/filename.png` is correct and portable.

**Format in README**:
```markdown
![Login page](./docs/screenshots/01-login.png)
```

---

## R-006: Existing README Status

**Question**: What already exists in `README.md` that should be preserved vs. updated?

**Decision**: The existing README has a solid foundation. Update it in-place:
- **Keep**: Features section (update with multi-recipe info), Tech Stack table, Local Setup section (extend with env var table), Project Structure, Running Tests
- **Update**: Features list — add "Multi-recipe meal slots (up to 3 per slot)" bullet
- **Add**: Environment Variables section with full table, Screenshots section after Features
- **Remove**: The Vercel deployment section stub (leave as-is, it references another quickstart)

**Existing README sections**:
```
# Recipe Planner
## Features
## Tech Stack
## Local Setup (### Prerequisites, ### 1-5 steps)
## Project Structure
## Running Tests
## Deployment (Vercel)
```

All NEEDS CLARIFICATION items from the spec are now resolved. Research complete.
