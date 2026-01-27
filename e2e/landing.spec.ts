import { test, expect } from './fixtures/base'

test.describe('Landing Page', () => {
  test.beforeEach(async ({ landingPage }) => {
    await landingPage.goto()
  })

  test.describe('Hero Section', () => {
    test('displays hero heading', async ({ landingPage }) => {
      await expect(landingPage.hero).toBeVisible()
      await expect(landingPage.hero).toContainText('AI-Powered Due Diligence')
    })

    test('displays hero subtitle', async ({ page }) => {
      await expect(
        page.getByText('Transform 40-80 hours of manual due diligence').first()
      ).toBeVisible()
    })

    test('displays trusted badge', async ({ page }) => {
      await expect(page.getByText('Trusted by 50+ VC firms')).toBeVisible()
    })

    test('hero CTA links to signup', async ({ landingPage }) => {
      await expect(landingPage.heroCta).toHaveAttribute('href', '/signup')
    })

    test('See How It Works links to features', async ({ landingPage }) => {
      await expect(landingPage.seeHowItWorks).toHaveAttribute('href', '#features')
    })
  })

  test.describe('Stats Section', () => {
    test('displays all stats', async ({ landingPage }) => {
      await expect(landingPage.stat('Saved per deal')).toBeVisible()
      await expect(landingPage.stat('Assessments generated')).toBeVisible()
      await expect(landingPage.stat('Accuracy rate')).toBeVisible()
      await expect(landingPage.stat('VC firms using')).toBeVisible()
    })

    test('displays stat values', async ({ page }) => {
      await expect(page.getByText('40hrs')).toBeVisible()
      await expect(page.getByText('500+', { exact: true })).toBeVisible()
      await expect(page.getByText('98%', { exact: true })).toBeVisible()
      await expect(page.getByText('50+', { exact: true })).toBeVisible()
    })
  })

  test.describe('Features Section', () => {
    test('displays section heading', async ({ page }) => {
      await expect(
        page.getByRole('heading', { name: 'Everything you need for deal evaluation' })
      ).toBeVisible()
    })

    test('displays all 6 feature cards', async ({ landingPage }) => {
      const features = [
        'Document Analysis',
        'Investment Memos',
        'Deal Room Chat',
        'Team Collaboration',
        'Lightning Fast',
        'Enterprise Security',
      ]
      for (const feature of features) {
        await expect(landingPage.featureCard(feature)).toBeVisible()
      }
    })
  })

  test.describe('How It Works Section', () => {
    test('displays section heading', async ({ landingPage }) => {
      await expect(landingPage.howItWorksStep('Upload Documents')).toBeVisible()
      await expect(landingPage.howItWorksStep('Generate Analysis')).toBeVisible()
      await expect(landingPage.howItWorksStep('Make Decisions')).toBeVisible()
    })

    test('displays step descriptions', async ({ page }) => {
      await expect(page.getByText('Drop your pitch deck')).toBeVisible()
      await expect(page.getByText('Our AI reads and analyzes')).toBeVisible()
      await expect(page.getByText('Review the memo')).toBeVisible()
    })
  })

  test.describe('CTA Section', () => {
    test('displays CTA heading', async ({ page }) => {
      await expect(
        page.getByRole('heading', { name: 'Ready to transform your due diligence?' })
      ).toBeVisible()
    })

    test('CTA button links to signup', async ({ page }) => {
      const ctaButton = page
        .getByRole('link', { name: 'Start Your Free Trial' })
      await expect(ctaButton).toBeVisible()
      await expect(ctaButton).toHaveAttribute('href', '/signup')
    })
  })

  test.describe('Footer', () => {
    test('displays brand name and copyright', async ({ page }) => {
      const footer = page.getByRole('contentinfo')
      await expect(footer.getByText('VentureScope')).toBeVisible()
    })

    test('displays footer links', async ({ page }) => {
      const footer = page.getByRole('contentinfo')
      await expect(footer.getByRole('link', { name: 'Privacy' })).toBeVisible()
      await expect(footer.getByRole('link', { name: 'Terms' })).toBeVisible()
      await expect(footer.getByRole('link', { name: 'Contact' })).toBeVisible()
    })
  })
})
