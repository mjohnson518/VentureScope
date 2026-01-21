import { Metadata } from 'next'
import { redirect } from 'next/navigation'
import { auth } from '@/lib/auth/config'
import { PricingCards, UsageDisplay } from '@/components/billing'

export const metadata: Metadata = {
  title: 'Billing - VentureScope',
  description: 'Manage your subscription and billing',
}

export default async function BillingPage() {
  const session = await auth()

  if (!session?.user?.id || !session.user.orgId) {
    redirect('/login')
  }

  const currentPlan = (session.user.organization?.plan_tier || 'free') as 'free' | 'angel' | 'pro' | 'enterprise'

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold tracking-tight">Billing</h1>
        <p className="text-muted-foreground">
          Manage your subscription and usage
        </p>
      </div>

      {/* Usage Display */}
      <UsageDisplay />

      {/* Pricing Plans */}
      <div>
        <h2 className="text-xl font-semibold mb-4">Available Plans</h2>
        <PricingCards currentPlan={currentPlan} />
      </div>
    </div>
  )
}
