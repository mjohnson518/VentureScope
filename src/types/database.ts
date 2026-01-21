export type UserRole = 'angel' | 'analyst' | 'partner' | 'family_office'
export type OrgRole = 'owner' | 'admin' | 'member'
export type PlanTier = 'free' | 'angel' | 'pro' | 'enterprise'
export type CompanyStage = 'pre_seed' | 'seed' | 'series_a' | 'series_b' | 'series_c' | 'growth'
export type CompanyStatus = 'active' | 'passed' | 'invested' | 'watching'
export type DocumentClassification =
  | 'pitch_deck'
  | 'financials'
  | 'cap_table'
  | 'legal'
  | 'product_demo'
  | 'founder_video'
  | 'customer_reference'
  | 'other'
export type AssessmentType = 'screening' | 'full'
export type AssessmentStatus = 'pending' | 'processing' | 'completed' | 'failed'
export type Recommendation = 'strong_conviction' | 'proceed' | 'conditional' | 'pass'
export type ChatRole = 'user' | 'assistant'
export type SharePermission = 'view' | 'comment' | 'edit'

export interface User {
  id: string
  email: string
  name: string | null
  avatar_url: string | null
  role: UserRole
  created_at: string
  updated_at: string
}

export interface Organization {
  id: string
  name: string
  slug: string
  plan_tier: PlanTier
  stripe_customer_id: string | null
  stripe_subscription_id: string | null
  assessments_used_this_month: number
  billing_cycle_start: string
  created_at: string
}

export interface OrgMembership {
  id: string
  user_id: string
  org_id: string
  role: OrgRole
  invited_at: string
  accepted_at: string | null
}

export interface Company {
  id: string
  org_id: string
  name: string
  stage: CompanyStage | null
  sector: string | null
  raise_amount: number | null
  valuation: number | null
  status: CompanyStatus
  website: string | null
  description: string | null
  created_by: string
  created_at: string
  updated_at: string
}

export interface Document {
  id: string
  company_id: string
  uploaded_by: string
  file_name: string
  file_type: string
  file_size: number | null
  file_url: string
  classification: DocumentClassification | null
  extracted_text: string | null
  metadata: Record<string, unknown>
  processed_at: string | null
  created_at: string
}

export interface Assessment {
  id: string
  company_id: string
  created_by: string
  type: AssessmentType
  status: AssessmentStatus
  content: Record<string, unknown> | null
  scores: Record<string, unknown> | null
  recommendation: Recommendation | null
  overall_score: number | null
  processing_time_ms: number | null
  error_message: string | null
  created_at: string
  completed_at: string | null
}

export interface ChatThread {
  id: string
  company_id: string
  user_id: string
  title: string | null
  created_at: string
  updated_at: string
}

export interface ChatMessage {
  id: string
  thread_id: string
  role: ChatRole
  content: string
  citations: Array<{ source: string; text: string }>
  created_at: string
}

export interface AssessmentShare {
  id: string
  assessment_id: string
  shared_with_user_id: string
  permission: SharePermission
  shared_by: string
  created_at: string
}

export interface AssessmentComment {
  id: string
  assessment_id: string
  user_id: string
  content: string
  parent_id: string | null
  created_at: string
  updated_at: string
}

export interface UsageRecord {
  id: string
  org_id: string
  assessment_type: AssessmentType
  assessment_id: string | null
  tokens_used: number | null
  created_at: string
}
