import { test, expect } from './fixtures/base'

test.describe('Auth Redirects', () => {
  test('unauthenticated user redirected from /dashboard to /login', async ({ page }) => {
    await page.goto('/dashboard')
    await expect(page).toHaveURL(/\/login/)
  })

  test('redirect includes original path as param', async ({ page }) => {
    await page.goto('/dashboard')
    await expect(page).toHaveURL(/redirect=%2Fdashboard/)
  })

  test('unauthenticated user redirected from /companies to /login', async ({ page }) => {
    await page.goto('/companies')
    await expect(page).toHaveURL(/\/login/)
  })

  test('unauthenticated user redirected from /assessments to /login', async ({ page }) => {
    await page.goto('/assessments')
    await expect(page).toHaveURL(/\/login/)
  })

  test('unauthenticated user redirected from /settings to /login', async ({ page }) => {
    await page.goto('/settings')
    await expect(page).toHaveURL(/\/login/)
  })

  test('unauthenticated user redirected from /team to /login', async ({ page }) => {
    await page.goto('/team')
    await expect(page).toHaveURL(/\/login/)
  })

  test('login page is accessible without auth', async ({ page }) => {
    await page.goto('/login')
    await expect(page).toHaveURL(/\/login/)
    await expect(page).not.toHaveURL(/redirect=/)
  })

  test('signup page is accessible without auth', async ({ page }) => {
    await page.goto('/signup')
    await expect(page).toHaveURL(/\/signup/)
  })

  test('landing page is accessible without auth', async ({ page }) => {
    await page.goto('/')
    await expect(page).not.toHaveURL(/\/login/)
  })
})
