import { test, expect } from './fixtures/base'

test.describe('Pricing Section', () => {
  test.beforeEach(async ({ landingPage }) => {
    await landingPage.goto()
  })

  test('displays pricing heading', async ({ page }) => {
    await expect(
      page.getByRole('heading', { name: 'Simple, Transparent Pricing' })
    ).toBeVisible()
  })

  test('displays 3 pricing tiers', async ({ page }) => {
    await expect(page.getByRole('heading', { name: 'Free', exact: true })).toBeVisible()
    await expect(page.getByRole('heading', { name: 'Angel', exact: true })).toBeVisible()
    await expect(page.getByRole('heading', { name: 'Pro', exact: true })).toBeVisible()
  })

  test('displays prices for all tiers', async ({ page }) => {
    await expect(page.getByText('$0')).toBeVisible()
    await expect(page.getByText('$149')).toBeVisible()
    await expect(page.getByText('$499')).toBeVisible()
  })

  test('displays Most Popular badge on Angel tier', async ({ page }) => {
    await expect(page.getByText('Most Popular')).toBeVisible()
  })

  test('Free tier shows features list', async ({ page }) => {
    await expect(page.getByText('2 Screening Memos/month')).toBeVisible()
    await expect(page.getByText('30-day history')).toBeVisible()
    await expect(page.getByText('Basic export')).toBeVisible()
  })

  test('Angel tier shows features list', async ({ page }) => {
    await expect(page.getByText('10 Full Memos/month')).toBeVisible()
    await expect(page.getByText('Unlimited history')).toBeVisible()
    await expect(page.getByText('AI Chat')).toBeVisible()
    await expect(page.getByText('PDF/DOCX export')).toBeVisible()
  })

  test('Pro tier shows features list', async ({ page }) => {
    await expect(page.getByText('50 Full Memos/month')).toBeVisible()
    await expect(page.getByText('5 team members')).toBeVisible()
    await expect(page.getByText('Collaboration tools')).toBeVisible()
    await expect(page.getByText('API access')).toBeVisible()
  })

  test('all pricing CTAs link to signup', async ({ page }) => {
    const pricingSection = page.locator('#pricing')
    const ctaLinks = pricingSection.getByRole('link', { name: /get started|start free trial/i })
    const count = await ctaLinks.count()
    expect(count).toBeGreaterThanOrEqual(3)
    for (let i = 0; i < count; i++) {
      await expect(ctaLinks.nth(i)).toHaveAttribute('href', '/signup')
    }
  })
})
