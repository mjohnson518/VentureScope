import { Metadata } from 'next'
import { redirect } from 'next/navigation'
import { QuickActions } from '@/components/dashboard/quick-actions'
import { RecentAssessments } from '@/components/dashboard/recent-assessments'
import { StatsCards } from '@/components/dashboard/stats-cards'
import { auth } from '@/lib/auth/config'
import { getDashboardStats } from '@/lib/data'

export const metadata: Metadata = {
  title: 'Dashboard - VentureScope',
  description: 'Your VentureScope dashboard',
}

export default async function DashboardPage() {
  const session = await auth()

  if (!session?.user?.id || !session.user.orgId) {
    redirect('/login')
  }

  // Using React.cache() for deduplication across components
  const data = await getDashboardStats(session.user.orgId)

  const greeting = getGreeting()
  const firstName = session?.user?.name?.split(' ')[0] || 'there'

  return (
    <div className="space-y-8">
      {/* Welcome Header */}
      <div className="space-y-1">
        <h1 className="font-display text-3xl font-bold tracking-tight">
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
