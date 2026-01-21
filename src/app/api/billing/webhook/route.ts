import { NextRequest, NextResponse } from 'next/server'
import { headers } from 'next/headers'
import Stripe from 'stripe'
import { stripe } from '@/lib/stripe'
import { createAdminClient } from '@/lib/supabase/admin'

export async function POST(request: NextRequest) {
  const body = await request.text()
  const headersList = await headers()
  const signature = headersList.get('stripe-signature')

  if (!signature) {
    return NextResponse.json({ error: 'Missing signature' }, { status: 400 })
  }

  let event: Stripe.Event

  try {
    event = stripe.webhooks.constructEvent(
      body,
      signature,
      process.env.STRIPE_WEBHOOK_SECRET!
    )
  } catch (err) {
    console.error('Webhook signature verification failed:', err)
    return NextResponse.json({ error: 'Invalid signature' }, { status: 400 })
  }

  const supabase = createAdminClient()

  try {
    switch (event.type) {
      case 'checkout.session.completed': {
        const session = event.data.object as Stripe.Checkout.Session
        const orgId = session.metadata?.orgId
        const planId = session.metadata?.planId

        if (orgId && planId) {
          await supabase
            .from('organizations')
            .update({
              plan_tier: planId,
              stripe_subscription_id: session.subscription as string,
            })
            .eq('id', orgId)

          console.log(`Upgraded org ${orgId} to ${planId}`)
        }
        break
      }

      case 'customer.subscription.updated': {
        const subscription = event.data.object as Stripe.Subscription
        const customerId = subscription.customer as string

        // Find org by customer ID
        const { data: org } = await supabase
          .from('organizations')
          .select('id')
          .eq('stripe_customer_id', customerId)
          .single()

        if (org) {
          // Get the plan from the subscription
          const priceId = subscription.items.data[0]?.price.id

          // Map price ID to plan tier
          let planTier = 'free'
          if (priceId === process.env.STRIPE_ANGEL_PRICE_ID) planTier = 'angel'
          if (priceId === process.env.STRIPE_PRO_PRICE_ID) planTier = 'pro'
          if (priceId === process.env.STRIPE_ENTERPRISE_PRICE_ID) planTier = 'enterprise'

          await supabase
            .from('organizations')
            .update({
              plan_tier: planTier,
              stripe_subscription_id: subscription.id,
            })
            .eq('id', org.id)

          console.log(`Updated org ${org.id} subscription to ${planTier}`)
        }
        break
      }

      case 'customer.subscription.deleted': {
        const subscription = event.data.object as Stripe.Subscription
        const customerId = subscription.customer as string

        // Find org by customer ID
        const { data: org } = await supabase
          .from('organizations')
          .select('id')
          .eq('stripe_customer_id', customerId)
          .single()

        if (org) {
          await supabase
            .from('organizations')
            .update({
              plan_tier: 'free',
              stripe_subscription_id: null,
            })
            .eq('id', org.id)

          console.log(`Downgraded org ${org.id} to free`)
        }
        break
      }

      case 'invoice.payment_succeeded': {
        const invoice = event.data.object as Stripe.Invoice
        const customerId = invoice.customer as string

        // Reset monthly usage on successful payment
        const { data: org } = await supabase
          .from('organizations')
          .select('id')
          .eq('stripe_customer_id', customerId)
          .single()

        if (org) {
          await supabase
            .from('organizations')
            .update({
              assessments_used_this_month: 0,
              billing_cycle_start: new Date().toISOString(),
            })
            .eq('id', org.id)

          console.log(`Reset usage for org ${org.id}`)
        }
        break
      }

      case 'invoice.payment_failed': {
        const invoice = event.data.object as Stripe.Invoice
        console.error('Payment failed for invoice:', invoice.id)
        // Could send notification email here
        break
      }

      default:
        console.log(`Unhandled event type: ${event.type}`)
    }

    return NextResponse.json({ received: true })
  } catch (error) {
    console.error('Webhook handler error:', error)
    return NextResponse.json(
      { error: 'Webhook handler failed' },
      { status: 500 }
    )
  }
}
