'use client'

import { useEffect, useState } from 'react'
import { Loader2, TrendingUp, Zap, CreditCard } from 'lucide-react'
import { toast } from 'sonner'

import { Button } from '@/components/ui/button'
import { Progress } from '@/components/ui/progress'
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'

interface UsageData {
  plan: {
    tier: string
    name: string
    features: string[]
  }
  usage: {
    assessmentsUsed: number
    assessmentsLimit: number
    percentUsed: number
    isUnlimited: boolean
    byType: {
      screening: number
      full: number
    }
    totalTokens: number
  }
  billing: {
    cycleStart: string
    hasPaymentMethod: boolean
    hasActiveSubscription: boolean
  }
}

export function UsageDisplay() {
  const [data, setData] = useState<UsageData | null>(null)
  const [isLoading, setIsLoading] = useState(true)
  const [isManaging, setIsManaging] = useState(false)

  useEffect(() => {
    fetchUsage()
  }, [])

  const fetchUsage = async () => {
    try {
      const response = await fetch('/api/billing/usage')
      if (!response.ok) throw new Error('Failed to fetch usage')
      const usageData = await response.json()
      setData(usageData)
    } catch (error) {
      console.error('Error fetching usage:', error)
    } finally {
      setIsLoading(false)
    }
  }

  const handleManageBilling = async () => {
    setIsManaging(true)
    try {
      const response = await fetch('/api/billing/portal', {
        method: 'POST',
      })

      if (!response.ok) {
        const error = await response.json()
        throw new Error(error.error || 'Failed to open billing portal')
      }

      const { url } = await response.json()
      window.location.href = url
    } catch (error) {
      toast.error(error instanceof Error ? error.message : 'Failed to open billing portal')
    } finally {
      setIsManaging(false)
    }
  }

  if (isLoading) {
    return (
      <Card>
        <CardContent className="flex items-center justify-center py-8">
          <Loader2 className="h-6 w-6 animate-spin text-muted-foreground" />
        </CardContent>
      </Card>
    )
  }

  if (!data) {
    return (
      <Card>
        <CardContent className="py-8 text-center text-muted-foreground">
          Failed to load usage data
        </CardContent>
      </Card>
    )
  }

  const getProgressColor = (percent: number) => {
    if (percent >= 90) return 'bg-red-500'
    if (percent >= 70) return 'bg-yellow-500'
    return 'bg-primary'
  }

  return (
    <div className="space-y-6">
      {/* Current Plan */}
      <Card>
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
          <div>
            <CardTitle className="text-lg">Current Plan</CardTitle>
            <CardDescription>Your subscription details</CardDescription>
          </div>
          <Badge variant="secondary" className="text-lg px-3 py-1">
            {data.plan.name}
          </Badge>
        </CardHeader>
        <CardContent>
          <div className="flex items-center justify-between">
            <div className="space-y-1">
              {data.billing.hasActiveSubscription ? (
                <p className="text-sm text-muted-foreground">
                  Billing cycle started{' '}
                  {data.billing.cycleStart
                    ? new Date(data.billing.cycleStart).toLocaleDateString()
                    : 'N/A'}
                </p>
              ) : (
                <p className="text-sm text-muted-foreground">
                  Free plan - no billing
                </p>
              )}
            </div>
            {data.billing.hasActiveSubscription && (
              <Button
                variant="outline"
                size="sm"
                onClick={handleManageBilling}
                disabled={isManaging}
              >
                {isManaging ? (
                  <Loader2 className="h-4 w-4 animate-spin" />
                ) : (
                  <>
                    <CreditCard className="h-4 w-4 mr-2" />
                    Manage Billing
                  </>
                )}
              </Button>
            )}
          </div>
        </CardContent>
      </Card>

      {/* Usage Stats */}
      <div className="grid gap-4 md:grid-cols-3">
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium flex items-center gap-2">
              <Zap className="h-4 w-4 text-yellow-500" />
              Assessments Used
            </CardTitle>
          </CardHeader>
          <CardContent>
            {data.usage.isUnlimited ? (
              <div>
                <span className="text-3xl font-bold">{data.usage.assessmentsUsed}</span>
                <span className="text-muted-foreground ml-2">unlimited</span>
              </div>
            ) : (
              <div className="space-y-2">
                <div className="flex items-baseline gap-2">
                  <span className="text-3xl font-bold">{data.usage.assessmentsUsed}</span>
                  <span className="text-muted-foreground">/ {data.usage.assessmentsLimit}</span>
                </div>
                <Progress
                  value={data.usage.percentUsed}
                  className={`h-2 ${getProgressColor(data.usage.percentUsed)}`}
                />
                <p className="text-xs text-muted-foreground">
                  {data.usage.assessmentsLimit - data.usage.assessmentsUsed} remaining this month
                </p>
              </div>
            )}
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium flex items-center gap-2">
              <TrendingUp className="h-4 w-4 text-green-500" />
              By Type
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-2">
              <div className="flex justify-between text-sm">
                <span>Screening</span>
                <span className="font-medium">{data.usage.byType.screening}</span>
              </div>
              <div className="flex justify-between text-sm">
                <span>Full Assessment</span>
                <span className="font-medium">{data.usage.byType.full}</span>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium">API Tokens</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold">
              {(data.usage.totalTokens / 1000).toFixed(1)}K
            </div>
            <p className="text-xs text-muted-foreground">tokens used this cycle</p>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}
