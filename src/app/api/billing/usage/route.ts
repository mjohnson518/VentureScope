import { NextRequest, NextResponse } from 'next/server'
import { auth } from '@/lib/auth/config'
import { createAdminClient } from '@/lib/supabase/admin'
import { PLANS, PlanTier } from '@/lib/stripe'

export async function GET(request: NextRequest) {
  try {
    const session = await auth()
    if (!session?.user?.id || !session.user.orgId) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const supabase = createAdminClient()

    // Get organization with usage data
    const { data: org, error } = await supabase
      .from('organizations')
      .select(`
        id,
        name,
        plan_tier,
        assessments_used_this_month,
        billing_cycle_start,
        stripe_customer_id,
        stripe_subscription_id
      `)
      .eq('id', session.user.orgId)
      .single()

    if (error || !org) {
      return NextResponse.json({ error: 'Organization not found' }, { status: 404 })
    }

    const planTier = (org.plan_tier || 'free') as PlanTier
    const plan = PLANS[planTier]
    const used = org.assessments_used_this_month || 0
    const limit = plan.assessmentsPerMonth

    // Calculate usage records for the current billing period
    const { data: usageRecords } = await supabase
      .from('usage_records')
      .select('assessment_type, tokens_used, created_at')
      .eq('org_id', session.user.orgId)
      .gte('created_at', org.billing_cycle_start || new Date(Date.now() - 30 * 24 * 60 * 60 * 1000).toISOString())
      .order('created_at', { ascending: false })

    // Aggregate usage by type
    const usageByType = (usageRecords || []).reduce(
      (acc, record) => {
        const type = record.assessment_type as 'screening' | 'full'
        acc[type] = (acc[type] || 0) + 1
        acc.totalTokens = (acc.totalTokens || 0) + (record.tokens_used || 0)
        return acc
      },
      {} as Record<string, number>
    )

    return NextResponse.json({
      plan: {
        tier: planTier,
        name: plan.name,
        features: plan.features,
      },
      usage: {
        assessmentsUsed: used,
        assessmentsLimit: limit,
        percentUsed: limit === -1 ? 0 : Math.round((used / limit) * 100),
        isUnlimited: limit === -1,
        byType: {
          screening: usageByType.screening || 0,
          full: usageByType.full || 0,
        },
        totalTokens: usageByType.totalTokens || 0,
      },
      billing: {
        cycleStart: org.billing_cycle_start,
        hasPaymentMethod: !!org.stripe_customer_id,
        hasActiveSubscription: !!org.stripe_subscription_id,
      },
    })
  } catch (error) {
    console.error('Usage fetch error:', error)
    return NextResponse.json(
      { error: 'Failed to fetch usage' },
      { status: 500 }
    )
  }
}
