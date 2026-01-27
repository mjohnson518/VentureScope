import { test as base, type Page } from '@playwright/test'

export class LandingPage {
  constructor(private page: Page) {}

  async goto() {
    await this.page.goto('/')
  }

  get hero() {
    return this.page.getByRole('heading', { level: 1 })
  }

  get heroCta() {
    return this.page.getByRole('link', { name: 'Start Free Trial' }).first()
  }

  get seeHowItWorks() {
    return this.page.getByRole('link', { name: 'See How It Works' })
  }

  get nav() {
    return this.page.getByRole('banner')
  }

  get featuresSection() {
    return this.page.locator('#features')
  }

  get pricingSection() {
    return this.page.locator('#pricing')
  }

  get statsRow() {
    return this.page.getByText('Saved per deal').locator('..')
  }

  get footer() {
    return this.page.getByRole('contentinfo')
  }

  featureCard(title: string) {
    return this.page.getByRole('heading', { name: title }).locator('..')
  }

  stat(label: string) {
    return this.page.getByText(label)
  }

  howItWorksStep(title: string) {
    return this.page.getByRole('heading', { name: title })
  }
}

export class AuthPage {
  constructor(private page: Page) {}

  async gotoLogin() {
    await this.page.goto('/login')
  }

  async gotoSignup() {
    await this.page.goto('/signup')
  }

  get brandingPanel() {
    return this.page.locator('.lg\\:w-1\\/2').first()
  }

  get formPanel() {
    return this.page.locator('.flex-1').last()
  }

  get googleButton() {
    return this.page.getByRole('button', { name: /google/i })
  }

  get githubButton() {
    return this.page.getByRole('button', { name: /github/i })
  }

  get emailInput() {
    return this.page.getByLabel(/email/i)
  }

  get passwordInput() {
    return this.page.getByLabel(/password/i)
  }

  get submitButton() {
    return this.page.getByRole('button', { name: /sign in|sign up|continue/i })
  }

  get switchLink() {
    return this.page.getByRole('link', { name: /sign up|sign in|create.*account|already.*account/i })
  }
}

export const test = base.extend<{
  landingPage: LandingPage
  authPage: AuthPage
}>({
  landingPage: async ({ page }, use) => {
    await use(new LandingPage(page))
  },
  authPage: async ({ page }, use) => {
    await use(new AuthPage(page))
  },
})

export { expect } from '@playwright/test'
