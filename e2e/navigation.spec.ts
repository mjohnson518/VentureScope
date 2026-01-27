import { test, expect } from './fixtures/base'

test.describe('Navigation', () => {
  test.beforeEach(async ({ landingPage }) => {
    await landingPage.goto()
  })

  test('logo links to homepage', async ({ page }) => {
    const logo = page.getByRole('link', { name: 'VentureScope' }).first()
    await expect(logo).toHaveAttribute('href', '/')
  })

  test('Features nav link exists on desktop', async ({ page }) => {
    const viewport = page.viewportSize()
    test.skip(!viewport || viewport.width < 768, 'Nav links hidden on mobile')
    await expect(page.getByRole('link', { name: 'Features' })).toBeVisible()
  })

  test('Pricing nav link exists on desktop', async ({ page }) => {
    const viewport = page.viewportSize()
    test.skip(!viewport || viewport.width < 768, 'Nav links hidden on mobile')
    await expect(page.getByRole('link', { name: 'Pricing' })).toBeVisible()
  })

  test('Sign In link exists', async ({ page }) => {
    await expect(page.getByRole('link', { name: 'Sign In' })).toBeVisible()
  })

  test('Get Started button exists on desktop', async ({ page }) => {
    const viewport = page.viewportSize()
    test.skip(!viewport || viewport.width < 768, 'Get Started hidden on mobile')
    const getStarted = page.getByRole('banner').getByRole('link', { name: 'Get Started' })
    await expect(getStarted).toBeVisible()
    await expect(getStarted).toHaveAttribute('href', '/signup')
  })

  test('Sign In navigates to login page', async ({ page }) => {
    const signIn = page.getByRole('link', { name: 'Sign In' }).first()
    await signIn.click()
    await expect(page).toHaveURL(/\/login/)
  })

  test('Features link scrolls to features section', async ({ page }) => {
    const viewport = page.viewportSize()
    test.skip(!viewport || viewport.width < 768, 'Nav links hidden on mobile')
    const featuresLink = page.getByRole('link', { name: 'Features' })
    await expect(featuresLink).toHaveAttribute('href', '#features')
  })

  test('Pricing link scrolls to pricing section', async ({ page }) => {
    const viewport = page.viewportSize()
    test.skip(!viewport || viewport.width < 768, 'Nav links hidden on mobile')
    const pricingLink = page.getByRole('link', { name: 'Pricing' })
    await expect(pricingLink).toHaveAttribute('href', '#pricing')
  })

  test('footer Privacy link navigates correctly', async ({ page }) => {
    const footer = page.getByRole('contentinfo')
    const privacyLink = footer.getByRole('link', { name: 'Privacy' })
    await expect(privacyLink).toHaveAttribute('href', '/privacy')
  })

  test('footer Terms link navigates correctly', async ({ page }) => {
    const footer = page.getByRole('contentinfo')
    const termsLink = footer.getByRole('link', { name: 'Terms' })
    await expect(termsLink).toHaveAttribute('href', '/terms')
  })

  test('footer Contact link is mailto', async ({ page }) => {
    const footer = page.getByRole('contentinfo')
    const contactLink = footer.getByRole('link', { name: 'Contact' })
    await expect(contactLink).toHaveAttribute('href', /mailto:/)
  })
})
