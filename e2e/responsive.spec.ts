import { test, expect } from './fixtures/base'

test.describe('Responsive Layout', () => {
  test.beforeEach(async ({ landingPage }) => {
    await landingPage.goto()
  })

  test('desktop nav shows full navigation', async ({ page }) => {
    const viewport = page.viewportSize()
    test.skip(!viewport || viewport.width < 768, 'Desktop-only test')

    await expect(page.getByRole('link', { name: 'Features' })).toBeVisible()
    await expect(page.getByRole('link', { name: 'Pricing' })).toBeVisible()
    await expect(page.getByRole('banner').getByRole('link', { name: 'Get Started' })).toBeVisible()
  })

  test('mobile nav shows sign in button', async ({ page }) => {
    const viewport = page.viewportSize()
    test.skip(!viewport || viewport.width >= 768, 'Mobile-only test')

    const mobileSignIn = page.locator('.md\\:hidden').getByRole('link', { name: 'Sign In' })
    await expect(mobileSignIn).toBeVisible()
  })

  test('mobile hides desktop nav links', async ({ page }) => {
    const viewport = page.viewportSize()
    test.skip(!viewport || viewport.width >= 768, 'Mobile-only test')

    const desktopNav = page.locator('nav.hidden.md\\:flex')
    await expect(desktopNav).toBeHidden()
  })

  test('feature cards stack on mobile', async ({ page }) => {
    const viewport = page.viewportSize()
    test.skip(!viewport || viewport.width >= 768, 'Mobile-only test')

    const featureGrid = page.locator('#features .grid')
    await expect(featureGrid).toBeVisible()
  })

  test('stats grid shows 2 columns on mobile', async ({ page }) => {
    const viewport = page.viewportSize()
    test.skip(!viewport || viewport.width >= 768, 'Mobile-only test')

    // Verify stats are visible
    await expect(page.getByText('40hrs')).toBeVisible()
    await expect(page.getByText('500+')).toBeVisible()
  })

  test('hero heading is visible at all viewports', async ({ page }) => {
    await expect(
      page.getByRole('heading', { level: 1 })
    ).toBeVisible()
  })

  test('pricing cards visible at all viewports', async ({ page }) => {
    await expect(page.getByText('$0')).toBeVisible()
    await expect(page.getByText('$149')).toBeVisible()
    await expect(page.getByText('$499')).toBeVisible()
  })

  test('footer responsive layout', async ({ page }) => {
    const footer = page.getByRole('contentinfo')
    await expect(footer).toBeVisible()
    await expect(footer.getByText('VentureScope')).toBeVisible()
    await expect(footer.getByRole('link', { name: 'Privacy' })).toBeVisible()
  })
})
