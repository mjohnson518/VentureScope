import { cache } from 'react'
import { createAdminClient } from '@/lib/supabase/admin'

export interface Assessment {
  id: string
  companyId: string
  companyName: string
  type: 'screening' | 'full'
  status: 'pending' | 'processing' | 'completed' | 'failed'
  recommendation: 'strong_conviction' | 'proceed' | 'conditional' | 'pass' | null
  overallScore: number | null
  createdAt: string
  updatedAt: string
}

export interface AssessmentDetail extends Assessment {
  summary: string | null
  sections: Record<string, unknown> | null
  rawOutput: string | null
}

/**
 * Get assessments for an organization with caching.
 */
export const getAssessments = cache(async (
  orgId: string,
  options?: { companyId?: string; status?: string; limit?: number }
): Promise<Assessment[]> => {
  const supabase = createAdminClient()

  let query = supabase
    .from('assessments')
    .select(`
      id,
      type,
      status,
      recommendation,
      overall_score,
      created_at,
      updated_at,
      companies!inner(id, name, org_id)
    `)
    .eq('companies.org_id', orgId)
    .order('created_at', { ascending: false })

  if (options?.companyId) {
    query = query.eq('company_id', options.companyId)
  }

  if (options?.status) {
    query = query.eq('status', options.status)
  }

  if (options?.limit) {
    query = query.limit(options.limit)
  }

  const { data, error } = await query

  if (error) {
    console.error('Error fetching assessments:', error)
    return []
  }

  return (data || []).map((assessment) => {
    const company = assessment.companies as unknown as { id: string; name: string }
    return {
      id: assessment.id,
      companyId: company.id,
      companyName: company.name,
      type: assessment.type as 'screening' | 'full',
      status: assessment.status as Assessment['status'],
      recommendation: assessment.recommendation as Assessment['recommendation'],
      overallScore: assessment.overall_score,
      createdAt: assessment.created_at,
      updatedAt: assessment.updated_at,
    }
  })
})

/**
 * Get a single assessment by ID with caching.
 */
export const getAssessmentById = cache(async (
  assessmentId: string,
  orgId: string
): Promise<AssessmentDetail | null> => {
  const supabase = createAdminClient()

  const { data, error } = await supabase
    .from('assessments')
    .select(`
      *,
      companies!inner(id, name, org_id)
    `)
    .eq('id', assessmentId)
    .eq('companies.org_id', orgId)
    .single()

  if (error || !data) {
    console.error('Error fetching assessment:', error)
    return null
  }

  const company = data.companies as unknown as { id: string; name: string }
  return {
    id: data.id,
    companyId: company.id,
    companyName: company.name,
    type: data.type as 'screening' | 'full',
    status: data.status as Assessment['status'],
    recommendation: data.recommendation as Assessment['recommendation'],
    overallScore: data.overall_score,
    summary: data.summary,
    sections: data.sections,
    rawOutput: data.raw_output,
    createdAt: data.created_at,
    updatedAt: data.updated_at,
  }
})

/**
 * Get dashboard stats with caching.
 */
export const getDashboardStats = cache(async (orgId: string) => {
  const supabase = createAdminClient()

  const startOfMonth = new Date()
  startOfMonth.setDate(1)
  startOfMonth.setHours(0, 0, 0, 0)

  const [companiesRes, assessmentsRes, recentRes, monthlyRes] = await Promise.all([
    supabase
      .from('companies')
      .select('id', { count: 'exact', head: true })
      .eq('org_id', orgId),

    supabase
      .from('assessments')
      .select('id, overall_score, companies!inner(org_id)', { count: 'exact' })
      .eq('companies.org_id', orgId)
      .eq('status', 'completed'),

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

    supabase
      .from('assessments')
      .select('id, companies!inner(org_id)', { count: 'exact', head: true })
      .eq('companies.org_id', orgId)
      .gte('created_at', startOfMonth.toISOString()),
  ])

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

  return {
    stats: {
      totalCompanies: companiesRes.count || 0,
      totalAssessments: assessmentsRes.count || 0,
      avgScore,
      assessmentsThisMonth: monthlyRes.count || 0,
    },
    recentAssessments: (recentRes.data || []).map((a) => {
      const company = a.companies as unknown as { id: string; name: string }
      return {
        id: a.id,
        companyName: company.name,
        type: a.type as 'screening' | 'full',
        recommendation: a.recommendation as Assessment['recommendation'],
        overallScore: a.overall_score,
        createdAt: a.created_at,
      }
    }),
  }
})
