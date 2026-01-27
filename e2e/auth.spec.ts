import { test, expect } from './fixtures/base'

test.describe('Auth Pages', () => {
  test.describe('Login Page', () => {
    test.beforeEach(async ({ authPage }) => {
      await authPage.gotoLogin()
    })

    test('displays login heading', async ({ page }) => {
      await expect(
        page.getByRole('heading', { name: /sign in|log in|welcome back/i })
      ).toBeVisible()
    })

    test('displays OAuth buttons', async ({ authPage }) => {
      await expect(authPage.googleButton).toBeVisible()
      await expect(authPage.githubButton).toBeVisible()
    })

    test('displays email input', async ({ authPage }) => {
      await expect(authPage.emailInput).toBeVisible()
    })

    test('displays link to signup', async ({ authPage }) => {
      await expect(authPage.switchLink).toBeVisible()
    })

    test('branding panel visible on desktop', async ({ authPage, page }) => {
      const viewport = page.viewportSize()
      test.skip(!viewport || viewport.width < 1024, 'Branding panel only on desktop')
      await expect(authPage.brandingPanel).toBeVisible()
    })

    test('branding panel shows testimonial on desktop', async ({ page }) => {
      const viewport = page.viewportSize()
      test.skip(!viewport || viewport.width < 1024, 'Branding panel only on desktop')
      await expect(page.getByText('Sarah Chen')).toBeVisible()
    })

    test('branding panel hidden on mobile', async ({ authPage, page }) => {
      const viewport = page.viewportSize()
      test.skip(!viewport || viewport.width >= 1024, 'Test only for mobile viewports')
      await expect(authPage.brandingPanel).toBeHidden()
    })
  })

  test.describe('Signup Page', () => {
    test.beforeEach(async ({ authPage }) => {
      await authPage.gotoSignup()
    })

    test('displays signup heading', async ({ page }) => {
      await expect(
        page.getByRole('heading', { name: /sign up|create.*account|get started/i })
      ).toBeVisible()
    })

    test('displays OAuth buttons', async ({ authPage }) => {
      await expect(authPage.googleButton).toBeVisible()
      await expect(authPage.githubButton).toBeVisible()
    })

    test('displays email input', async ({ authPage }) => {
      await expect(authPage.emailInput).toBeVisible()
    })

    test('displays link to login', async ({ authPage }) => {
      await expect(authPage.switchLink).toBeVisible()
    })
  })
})
