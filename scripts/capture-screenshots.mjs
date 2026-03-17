/**
 * capture-screenshots.mjs
 * Spec 005 — T146-T153: Take screenshots of all 7 app pages using Playwright.
 *
 * Tự động tạo tài khoản mới qua /signup, chụp tất cả các trang, không cần
 * cung cấp credentials.
 *
 * Usage:
 *   node scripts/capture-screenshots.mjs
 *
 * Prerequisites:
 *   - Dev server running at http://localhost:3000
 */

import { chromium } from '@playwright/test'
import { join } from 'path'
import { mkdirSync, existsSync, statSync } from 'fs'

const SCREENSHOTS_DIR = '/Users/ngo.van.tien/Framgia/recipe-planner/docs/screenshots'
const BASE_URL = 'http://localhost:3000'
const VIEWPORT = { width: 1280, height: 800 }

// Tạo tài khoản test duy nhất tại runtime — không hardcode credentials
const timestamp = Date.now()
const testEmail = `screenshot-test-${timestamp}@example.com`
const testPassword = `ScreenshotTest-${timestamp}`

mkdirSync(SCREENSHOTS_DIR, { recursive: true })
console.log(`📂 Screenshots → ${SCREENSHOTS_DIR}`)
console.log(`🧪 Test account: ${testEmail}`)

const wait = (ms) => new Promise((r) => setTimeout(r, ms))

async function main() {
  const browser = await chromium.launch({ headless: true })
  const context = await browser.newContext({ viewport: VIEWPORT })
  const page = await context.newPage()
  page.setDefaultTimeout(30_000)

  try {
    // T146: Login page (public, no auth)
    console.log('\n📸 T146: Login page...')
    await page.goto(`${BASE_URL}/login`, { waitUntil: 'networkidle' })
    await page.screenshot({ path: join(SCREENSHOTS_DIR, '01-login.png'), fullPage: false })
    console.log('   ✓ 01-login.png')

    // T147: Signup fresh test account
    console.log('\n🔐 T147: Signing up new test account...')
    await page.goto(`${BASE_URL}/signup`, { waitUntil: 'networkidle' })
    await page.fill('#email', testEmail)
    await page.fill('#password', testPassword)
    await page.click('button[type="submit"]')
    await page.waitForURL((url) => !url.pathname.includes('/signup'), { timeout: 20_000 })
    await page.waitForLoadState('networkidle')
    console.log(`   ✓ Signed up → ${page.url()}`)

    // Wait for auto-seed (POST /api/recipes/seed triggered by AuthContext)
    console.log('   ↳ Waiting for 20 starter recipes to seed...')
    await wait(3000)

    // T148: Recipes list
    console.log('\n📸 T148: Recipes list...')
    await page.goto(`${BASE_URL}/recipes`, { waitUntil: 'networkidle' })
    await wait(500)
    await page.screenshot({ path: join(SCREENSHOTS_DIR, '02-recipes-list.png'), fullPage: false })
    console.log('   ✓ 02-recipes-list.png')

    // T149: Recipe detail
    console.log('\n📸 T149: Recipe detail...')
    const recipeHref = await page
      .locator('a[href^="/recipes/"]:not([href="/recipes/new"])')
      .first()
      .getAttribute('href')
      .catch(() => null)
    await page.goto(`${BASE_URL}${recipeHref || '/recipes'}`, { waitUntil: 'networkidle' })
    if (!recipeHref) {
      await page.locator('a[href^="/recipes/"]:not([href="/recipes/new"])').first().click()
      await page.waitForLoadState('networkidle')
    }
    await wait(400)
    await page.screenshot({ path: join(SCREENSHOTS_DIR, '03-recipe-detail.png'), fullPage: false })
    console.log('   ✓ 03-recipe-detail.png')

    // T150: Create recipe form
    console.log('\n📸 T150: Create recipe form...')
    await page.goto(`${BASE_URL}/recipes/new`, { waitUntil: 'networkidle' })
    await wait(400)
    await page.screenshot({ path: join(SCREENSHOTS_DIR, '04-recipe-create.png'), fullPage: false })
    console.log('   ✓ 04-recipe-create.png')

    // T151: Meal planner — assign first recipe to a slot
    console.log('\n📸 T151: Meal planner (assigning first recipe to slot)...')
    await page.goto(`${BASE_URL}/meal-planner`, { waitUntil: 'networkidle' })
    await wait(800)
    const emptySlot = page.locator('[role="button"][aria-label^="Add "]').first()
    if (await emptySlot.isVisible().catch(() => false)) {
      await emptySlot.click()
      await page.waitForSelector('[role="dialog"][aria-modal="true"]', { timeout: 10_000 })
      await wait(300)
      await page.locator('[role="dialog"] ul li button').first().click()
      await page.waitForSelector('[role="dialog"][aria-modal="true"]', { state: 'hidden', timeout: 10_000 })
      await wait(600)
      console.log('   ↳ Recipe 1 assigned.')
    }
    await page.screenshot({ path: join(SCREENSHOTS_DIR, '05-meal-planner.png'), fullPage: false })
    console.log('   ✓ 05-meal-planner.png')

    // T152: Multi-recipe slot — add second recipe to same slot
    console.log('\n📸 T152: Multi-recipe slot (adding second recipe)...')
    const addBtn = page.locator('button[aria-label^="Add another recipe to"]').first()
    if (await addBtn.isVisible().catch(() => false)) {
      await addBtn.click()
      await page.waitForSelector('[role="dialog"][aria-modal="true"]', { timeout: 10_000 })
      await wait(300)
      await page.locator('[role="dialog"] ul li button').first().click()
      await page.waitForSelector('[role="dialog"][aria-modal="true"]', { state: 'hidden', timeout: 10_000 })
      await wait(600)
      console.log('   ↳ Recipe 2 added.')
    } else {
      console.log('   ⚠️  "+ Add" not visible — capturing current state.')
    }
    await page.screenshot({ path: join(SCREENSHOTS_DIR, '06-multi-recipe-slot.png'), fullPage: false })
    console.log('   ✓ 06-multi-recipe-slot.png')

    // T153: Grocery list
    console.log('\n📸 T153: Grocery list...')
    await page.goto(`${BASE_URL}/grocery-list`, { waitUntil: 'networkidle' })
    await wait(800)
    await page.screenshot({ path: join(SCREENSHOTS_DIR, '07-grocery-list.png'), fullPage: false })
    console.log('   ✓ 07-grocery-list.png')

  } finally {
    await browser.close()
  }

  // SC-001: verify all 7 files > 10 KB
  console.log('\n✅ Validation (SC-001):')
  const files = [
    '01-login.png', '02-recipes-list.png', '03-recipe-detail.png',
    '04-recipe-create.png', '05-meal-planner.png', '06-multi-recipe-slot.png',
    '07-grocery-list.png',
  ]
  let ok = true
  for (const f of files) {
    const p = join(SCREENSHOTS_DIR, f)
    if (existsSync(p)) {
      const sz = statSync(p).size
      const pass = sz > 10_240
      console.log(`   ${pass ? '✓' : '⚠️ <10KB'}  ${f}  (${(sz / 1024).toFixed(1)} KB)`)
      if (!pass) ok = false
    } else {
      console.log(`   ✗  MISSING: ${f}`)
      ok = false
    }
  }
  if (!ok) { console.error('\n❌ Some screenshots failed.'); process.exit(1) }
  console.log('\n🎉 All 7 screenshots ready. Run /speckit.implement T154-T160 to update README.')
}

main().catch((err) => { console.error('\n❌', err.message); process.exit(1) })