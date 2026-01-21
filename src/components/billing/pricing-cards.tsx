'use client'

import { useState } from 'react'
import { Check, Loader2, Sparkles } from 'lucide-react'
import { toast } from 'sonner'

import { Button } from '@/components/ui/button'
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { cn } from '@/lib/utils'

const plans = [
  {
    id: 'free',
    name: 'Free',
    description: 'For individuals getting started',
    price: 0,
    features: [
      '3 assessments per month',
      '5 companies',
      'Basic document processing',
      'Email support',
    ],
  },
  {
    id: 'angel',
    name: 'Angel',
    description: 'For angel investors',
    price: 49,
    popular: true,
    features: [
      '20 assessments per month',
      '25 companies',
      'Full document processing',
      'AI chat assistant',
      'Priority support',
    ],
  },
  {
    id: 'pro',
    name: 'Pro',
    description: 'For VC analysts and partners',
    price: 149,
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
  {
    id: 'enterprise',
    name: 'Enterprise',
    description: 'For VC firms and family offices',
    price: null,
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
]

interface PricingCardsProps {
  currentPlan?: string
}

export function PricingCards({ currentPlan = 'free' }: PricingCardsProps) {
  const [loadingPlan, setLoadingPlan] = useState<string | null>(null)

  const handleUpgrade = async (planId: string) => {
    if (planId === 'enterprise') {
      window.location.href = 'mailto:sales@venturescope.ai?subject=Enterprise Plan Inquiry'
      return
    }

    if (planId === 'free') {
      toast.error('You are already on the free plan')
      return
    }

    setLoadingPlan(planId)
    try {
      const response = await fetch('/api/billing/checkout', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ planId }),
      })

      if (!response.ok) {
        const error = await response.json()
        throw new Error(error.error || 'Failed to start checkout')
      }

      const { url } = await response.json()
      window.location.href = url
    } catch (error) {
      toast.error(error instanceof Error ? error.message : 'Failed to start checkout')
    } finally {
      setLoadingPlan(null)
    }
  }

  return (
    <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-4">
      {plans.map((plan) => {
        const isCurrent = plan.id === currentPlan
        const isDowngrade =
          plans.findIndex((p) => p.id === currentPlan) >
          plans.findIndex((p) => p.id === plan.id)

        return (
          <Card
            key={plan.id}
            className={cn(
              'relative',
              plan.popular && 'border-primary shadow-lg'
            )}
          >
            {plan.popular && (
              <Badge className="absolute -top-3 left-1/2 -translate-x-1/2">
                <Sparkles className="h-3 w-3 mr-1" />
                Most Popular
              </Badge>
            )}

            <CardHeader>
              <CardTitle>{plan.name}</CardTitle>
              <CardDescription>{plan.description}</CardDescription>
            </CardHeader>

            <CardContent>
              <div className="mb-6">
                {plan.price !== null ? (
                  <div className="flex items-baseline gap-1">
                    <span className="text-4xl font-bold">${plan.price}</span>
                    <span className="text-muted-foreground">/month</span>
                  </div>
                ) : (
                  <div className="text-4xl font-bold">Custom</div>
                )}
              </div>

              <ul className="space-y-2">
                {plan.features.map((feature) => (
                  <li key={feature} className="flex items-start gap-2 text-sm">
                    <Check className="h-4 w-4 text-green-500 mt-0.5 shrink-0" />
                    {feature}
                  </li>
                ))}
              </ul>
            </CardContent>

            <CardFooter>
              {isCurrent ? (
                <Button className="w-full" variant="outline" disabled>
                  Current Plan
                </Button>
              ) : isDowngrade ? (
                <Button
                  className="w-full"
                  variant="outline"
                  onClick={() => handleUpgrade(plan.id)}
                  disabled={loadingPlan !== null}
                >
                  Downgrade
                </Button>
              ) : (
                <Button
                  className="w-full"
                  onClick={() => handleUpgrade(plan.id)}
                  disabled={loadingPlan !== null}
                >
                  {loadingPlan === plan.id ? (
                    <Loader2 className="h-4 w-4 animate-spin" />
                  ) : plan.price === null ? (
                    'Contact Sales'
                  ) : (
                    'Upgrade'
                  )}
                </Button>
              )}
            </CardFooter>
          </Card>
        )
      })}
    </div>
  )
}
