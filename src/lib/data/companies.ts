import { cache } from 'react'
import { createAdminClient } from '@/lib/supabase/admin'

export interface Company {
  id: string
  name: string
  stage: string | null
  sector: string | null
  raise_amount: number | null
  valuation: number | null
  status: string
  website: string | null
  description: string | null
  created_at: string
  documentCount: number
  assessmentCount: number
  pipeline_position: number
}

/**
 * Get companies for an organization with caching.
 * React.cache() deduplicates calls within the same request.
 */
export const getCompanies = cache(async (
  orgId: string,
  options?: { status?: string; search?: string }
): Promise<Company[]> => {
  const supabase = createAdminClient()

  let query = supabase
    .from('companies')
    .select(`
      *,
      documents:documents(count),
      assessments:assessments(count)
    `)
    .eq('org_id', orgId)
    .order('created_at', { ascending: false })

  if (options?.status && options.status !== 'all') {
    query = query.eq('status', options.status)
  }

  if (options?.search) {
    query = query.ilike('name', `%${options.search}%`)
  }

  const { data, error } = await query

  if (error) {
    console.error('Error fetching companies:', error)
    return []
  }

  return (data || []).map((company) => ({
    id: company.id,
    name: company.name,
    stage: company.stage,
    sector: company.sector,
    raise_amount: company.raise_amount,
    valuation: company.valuation,
    status: company.status,
    website: company.website,
    description: company.description,
    created_at: company.created_at,
    documentCount: (company.documents as { count: number }[])?.[0]?.count || 0,
    assessmentCount: (company.assessments as { count: number }[])?.[0]?.count || 0,
    pipeline_position: company.pipeline_position ?? 0,
  }))
})

/**
 * Get a single company by ID with caching.
 */
export const getCompanyById = cache(async (
  companyId: string,
  orgId: string
): Promise<Company | null> => {
  const supabase = createAdminClient()

  const { data, error } = await supabase
    .from('companies')
    .select(`
      *,
      documents:documents(count),
      assessments:assessments(count)
    `)
    .eq('id', companyId)
    .eq('org_id', orgId)
    .single()

  if (error || !data) {
    console.error('Error fetching company:', error)
    return null
  }

  return {
    id: data.id,
    name: data.name,
    stage: data.stage,
    sector: data.sector,
    raise_amount: data.raise_amount,
    valuation: data.valuation,
    status: data.status,
    website: data.website,
    description: data.description,
    created_at: data.created_at,
    documentCount: (data.documents as { count: number }[])?.[0]?.count || 0,
    assessmentCount: (data.assessments as { count: number }[])?.[0]?.count || 0,
    pipeline_position: data.pipeline_position ?? 0,
  }
})
