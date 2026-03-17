import { test, expect } from '@playwright/test'

/**
 * Smoke test — verifies all four main pages load and key UI elements render.
 * Run: npx playwright test tests/e2e/smoke.spec.ts
 */

test.describe('Smoke: core pages load', () => {
  test('Dashboard page renders stats and week summary', async ({ page }) => {
    await page.goto('/')
    await expect(page).toHaveTitle(/Recipe Planner/)
    await expect(page.getByRole('heading', { name: /Dashboard/i })).toBeVisible()
    // Stats section visible
    await expect(page.getByText('Total Recipes')).toBeVisible()
    await expect(page.getByText('Meals Planned')).toBeVisible()
    await expect(page.getByText('Grocery Items Left')).toBeVisible()
  })

  test('Recipes page renders recipe grid and search', async ({ page }) => {
    await page.goto('/recipes')
    await expect(page.getByRole('heading', { name: /Recipes/i })).toBeVisible()
    // Search input is visible
    await expect(page.getByRole('searchbox', { name: /Search recipes/i })).toBeVisible()
    // Tag filter buttons visible
    await expect(page.getByRole('button', { name: /Breakfast/i })).toBeVisible()
    // At least one recipe card from seed data loads
    await expect(page.locator('[aria-label^="Recipe"]').first()).toBeVisible({ timeout: 5000 })
  })

  test('Meal Planner page renders weekly grid', async ({ page }) => {
    await page.goto('/meal-planner')
    await expect(page.getByRole('heading', { name: /Meal Planner/i })).toBeVisible()
    // Week navigator visible
    await expect(page.getByRole('button', { name: /previous week/i })).toBeVisible()
    await expect(page.getByRole('button', { name: /next week/i })).toBeVisible()
    // Meal rows visible in the grid
    await expect(page.getByRole('cell', { name: /Add breakfast/i }).first()).toBeVisible()
  })

  test('Grocery List page renders with generate button', async ({ page }) => {
    await page.goto('/grocery-list')
    await expect(page.getByRole('heading', { name: /Grocery List/i })).toBeVisible()
    // Generate button
    await expect(page.getByRole('button', { name: /Generate from meal plan/i }).or(
      page.getByRole('button', { name: /Re-generate list/i }),
    )).toBeVisible()
  })
})

test.describe('Smoke: navigation between pages', () => {
  test('clicking Recipes in sidebar navigates to /recipes', async ({ page }) => {
    await page.goto('/')
    await page.getByRole('link', { name: /^Recipes$/i }).click()
    await expect(page).toHaveURL(/\/recipes/)
    await expect(page.getByRole('heading', { name: /Recipes/i })).toBeVisible()
  })

  test('clicking Meal Planner in sidebar navigates to /meal-planner', async ({ page }) => {
    await page.goto('/')
    await page.getByRole('link', { name: /Meal Planner/i }).click()
    await expect(page).toHaveURL(/\/meal-planner/)
  })

  test('clicking Grocery List in sidebar navigates to /grocery-list', async ({ page }) => {
    await page.goto('/')
    await page.getByRole('link', { name: /Grocery List/i }).click()
    await expect(page).toHaveURL(/\/grocery-list/)
  })
})

test.describe('Smoke: Recipe CRUD', () => {
  test('navigating to a recipe detail page renders recipe info', async ({ page }) => {
    await page.goto('/recipes')
    // Click first recipe card
    const firstCard = page.locator('a[href^="/recipes/"]').first()
    await expect(firstCard).toBeVisible({ timeout: 5000 })
    await firstCard.click()
    await expect(page).toHaveURL(/\/recipes\/[^/]+$/)
    // Recipe detail headings exist
    await expect(page.getByRole('heading', { level: 1 }).first()).toBeVisible()
  })

  test('New Recipe button links to /recipes/new', async ({ page }) => {
    await page.goto('/recipes')
    await page.getByRole('link', { name: /New recipe/i }).click()
    await expect(page).toHaveURL(/\/recipes\/new/)
    await expect(page.getByRole('heading', { name: /New Recipe/i })).toBeVisible()
  })
})
