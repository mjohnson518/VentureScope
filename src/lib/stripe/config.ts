import Stripe from 'stripe'

// Server-side Stripe client
export const stripe = new Stripe(process.env.STRIPE_SECRET_KEY!, {
  apiVersion: '2025-12-15.clover',
  typescript: true,
})

// Plan configurations
export const PLANS = {
  free: {
    name: 'Free',
    description: 'For individuals getting started',
    price: 0,
    priceId: null,
    assessmentsPerMonth: 3,
    features: [
      '3 assessments per month',
      '5 companies',
      'Basic document processing',
      'Email support',
    ],
  },
  angel: {
    name: 'Angel',
    description: 'For angel investors',
    price: 49,
    priceId: process.env.STRIPE_ANGEL_PRICE_ID,
    assessmentsPerMonth: 20,
    features: [
      '20 assessments per month',
      '25 companies',
      'Full document processing',
      'AI chat assistant',
      'Priority support',
    ],
  },
  pro: {
    name: 'Pro',
    description: 'For VC analysts and partners',
    price: 149,
    priceId: process.env.STRIPE_PRO_PRICE_ID,
    assessmentsPerMonth: 100,
    features: [
      '100 assessments per month',
      'Unlimited companies',
      'Full document processing',
      'AI chat assistant',
      'Team collaboration',
      'Custom branding',
      'Priority support',
    ],
  },
  enterprise: {
    name: 'Enterprise',
    description: 'For VC firms and family offices',
    price: null, // Custom pricing
    priceId: process.env.STRIPE_ENTERPRISE_PRICE_ID,
    assessmentsPerMonth: -1, // Unlimited
    features: [
      'Unlimited assessments',
      'Unlimited companies',
      'Full document processing',
      'AI chat assistant',
      'Team collaboration',
      'Custom branding',
      'API access',
      'Dedicated support',
      'Custom integrations',
    ],
  },
} as const

export type PlanTier = keyof typeof PLANS

export function getPlanLimits(tier: PlanTier) {
  return PLANS[tier]
}

export function canCreateAssessment(
  tier: PlanTier,
  usedThisMonth: number
): boolean {
  const limit = PLANS[tier].assessmentsPerMonth
  if (limit === -1) return true // Unlimited
  return usedThisMonth < limit
}
