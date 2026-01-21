import { Metadata } from 'next'
import { redirect } from 'next/navigation'
import { QuickActions } from '@/components/dashboard/quick-actions'
import { RecentAssessments } from '@/components/dashboard/recent-assessments'
import { StatsCards } from '@/components/dashboard/stats-cards'
import { auth } from '@/lib/auth/config'
import { createAdminClient } from '@/lib/supabase/admin'

export const metadata: Metadata = {
  title: 'Dashboard - VentureScope',
  description: 'Your VentureScope dashboard',
}

async function getDashboardData(orgId: string) {
  const supabase = createAdminClient()

  // Fetch stats
  const [companiesRes, assessmentsRes, recentRes] = await Promise.all([
    // Total companies
    supabase
      .from('companies')
      .select('id', { count: 'exact', head: true })
      .eq('org_id', orgId),

    // Total assessments (completed)
    supabase
      .from('assessments')
      .select('id, overall_score, companies!inner(org_id)', { count: 'exact' })
      .eq('companies.org_id', orgId)
      .eq('status', 'completed'),

    // Recent assessments
    supabase
      .from('assessments')
      .select(`
        id,
        type,
        recommendation,
        overall_score,
        created_at,
        companies!inner(id, name, org_id)
      `)
      .eq('companies.org_id', orgId)
      .eq('status', 'completed')
      .order('created_at', { ascending: false })
      .limit(5),
  ])

  // Calculate average score
  const completedAssessments = assessmentsRes.data || []
  const scoresWithValues = completedAssessments.filter(
    (a) => typeof a.overall_score === 'number'
  )
  const avgScore =
    scoresWithValues.length > 0
      ? Math.round(
          scoresWithValues.reduce((sum, a) => sum + (a.overall_score || 0), 0) /
            scoresWithValues.length
        )
      : null

  // Get this month's assessment count
  const startOfMonth = new Date()
  startOfMonth.setDate(1)
  startOfMonth.setHours(0, 0, 0, 0)

  const { count: assessmentsThisMonth } = await supabase
    .from('assessments')
    .select('id, companies!inner(org_id)', { count: 'exact', head: true })
    .eq('companies.org_id', orgId)
    .gte('created_at', startOfMonth.toISOString())

  return {
    stats: {
      totalCompanies: companiesRes.count || 0,
      totalAssessments: assessmentsRes.count || 0,
      avgScore,
      assessmentsThisMonth: assessmentsThisMonth || 0,
    },
    recentAssessments: (recentRes.data || []).map((a) => {
      const company = a.companies as unknown as { id: string; name: string; org_id: string }
      return {
        id: a.id,
        companyName: company.name,
        type: a.type as 'screening' | 'full',
        recommendation: a.recommendation as 'strong_conviction' | 'proceed' | 'conditional' | 'pass' | null,
        overallScore: a.overall_score,
        createdAt: a.created_at,
      }
    }),
  }
}

export default async function DashboardPage() {
  const session = await auth()

  if (!session?.user?.id || !session.user.orgId) {
    redirect('/login')
  }

  const data = await getDashboardData(session.user.orgId)

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
