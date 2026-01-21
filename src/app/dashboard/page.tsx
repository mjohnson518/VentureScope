import { Metadata } from 'next'
import { QuickActions } from '@/components/dashboard/quick-actions'
import { RecentAssessments } from '@/components/dashboard/recent-assessments'
import { StatsCards } from '@/components/dashboard/stats-cards'
import { auth } from '@/lib/auth/config'

export const metadata: Metadata = {
  title: 'Dashboard - VentureScope',
  description: 'Your VentureScope dashboard',
}

// This would normally fetch from database
async function getDashboardData() {
  // Placeholder data - will be replaced with real data fetching
  return {
    stats: {
      totalCompanies: 0,
      totalAssessments: 0,
      avgScore: null,
      assessmentsThisMonth: 0,
    },
    recentAssessments: [] as Array<{
      id: string
      companyName: string
      type: 'screening' | 'full'
      recommendation: 'strong_conviction' | 'proceed' | 'conditional' | 'pass' | null
      overallScore: number | null
      createdAt: string
    }>,
  }
}

export default async function DashboardPage() {
  const session = await auth()
  const data = await getDashboardData()

  const greeting = getGreeting()
  const firstName = session?.user?.name?.split(' ')[0] || 'there'

  return (
    <div className="space-y-6">
      {/* Welcome Header */}
      <div>
        <h1 className="text-3xl font-bold tracking-tight">
          {greeting}, {firstName}
        </h1>
        <p className="text-muted-foreground">
          Here&apos;s what&apos;s happening with your deal pipeline
        </p>
      </div>

      {/* Stats */}
      <StatsCards stats={data.stats} />

      {/* Main Content Grid */}
      <div className="grid gap-6 lg:grid-cols-2">
        <QuickActions />
        <RecentAssessments assessments={data.recentAssessments} />
      </div>
    </div>
  )
}

function getGreeting(): string {
  const hour = new Date().getHours()
  if (hour < 12) return 'Good morning'
  if (hour < 18) return 'Good afternoon'
  return 'Good evening'
}
