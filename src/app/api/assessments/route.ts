import { NextRequest, NextResponse } from 'next/server'
import { auth } from '@/lib/auth/config'
import { createAdminClient } from '@/lib/supabase/admin'
import { generateAssessment, AssessmentRequest, DocumentContext, CompanyContext } from '@/lib/ai'

export async function POST(request: NextRequest) {
  try {
    const session = await auth()
    if (!session?.user?.id || !session.user.orgId) {
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 401 }
      )
    }

    const body = await request.json()
    const { companyId, type = 'screening' } = body

    if (!companyId) {
      return NextResponse.json(
        { error: 'Company ID is required' },
        { status: 400 }
      )
    }

    if (!['screening', 'full'].includes(type)) {
      return NextResponse.json(
        { error: 'Invalid assessment type' },
        { status: 400 }
      )
    }

    const supabase = createAdminClient()

    // Verify company access and get company data
    const { data: company, error: companyError } = await supabase
      .from('companies')
      .select('*')
      .eq('id', companyId)
      .eq('org_id', session.user.orgId)
      .single()

    if (companyError || !company) {
      return NextResponse.json(
        { error: 'Company not found' },
        { status: 404 }
      )
    }

    // Get processed documents for this company
    const { data: documents, error: docsError } = await supabase
      .from('documents')
      .select('*')
      .eq('company_id', companyId)
      .not('processed_at', 'is', null)
      .not('extracted_text', 'is', null)

    if (docsError) {
      return NextResponse.json(
        { error: 'Failed to fetch documents' },
        { status: 500 }
      )
    }

    if (!documents || documents.length === 0) {
      return NextResponse.json(
        { error: 'No processed documents available for assessment' },
        { status: 400 }
      )
    }

    // Create assessment record with pending status
    const { data: assessment, error: assessmentError } = await supabase
      .from('assessments')
      .insert({
        company_id: companyId,
        created_by: session.user.id,
        type,
        status: 'processing',
      })
      .select()
      .single()

    if (assessmentError || !assessment) {
      return NextResponse.json(
        { error: 'Failed to create assessment' },
        { status: 500 }
      )
    }

    // Start assessment generation in background
    generateAssessmentAsync(
      assessment.id,
      {
        type,
        company: {
          name: company.name,
          stage: company.stage,
          sector: company.sector,
          raiseAmount: company.raise_amount,
          valuation: company.valuation,
          description: company.description,
          website: company.website,
        },
        documents: documents.map((doc) => ({
          fileName: doc.file_name,
          classification: doc.classification || 'other',
          extractedText: doc.extracted_text || '',
        })),
      },
      session.user.orgId
    ).catch((error) => {
      console.error('Assessment generation error:', error)
    })

    return NextResponse.json({
      id: assessment.id,
      status: 'processing',
      message: 'Assessment generation started',
    })
  } catch (error) {
    console.error('Assessment creation error:', error)
    return NextResponse.json(
      { error: 'Failed to create assessment' },
      { status: 500 }
    )
  }
}

async function generateAssessmentAsync(
  assessmentId: string,
  request: AssessmentRequest,
  orgId: string
) {
  const supabase = createAdminClient()

  try {
    // Generate assessment using Claude
    const result = await generateAssessment(request)

    // Update assessment with results
    await supabase
      .from('assessments')
      .update({
        status: 'completed',
        content: result.content,
        scores: result.scores,
        recommendation: result.recommendation.recommendation,
        overall_score: result.overallScore,
        processing_time_ms: result.processingTimeMs,
        completed_at: new Date().toISOString(),
      })
      .eq('id', assessmentId)

    // Record usage
    await supabase.from('usage_records').insert({
      org_id: orgId,
      assessment_type: request.type,
      assessment_id: assessmentId,
      tokens_used: result.tokensUsed,
    })

    // Update org's monthly usage counter
    const { data: org } = await supabase
      .from('organizations')
      .select('assessments_used_this_month')
      .eq('id', orgId)
      .single()

    if (org) {
      await supabase
        .from('organizations')
        .update({
          assessments_used_this_month: (org.assessments_used_this_month || 0) + 1,
        })
        .eq('id', orgId)
    }
  } catch (error) {
    console.error(`Assessment ${assessmentId} failed:`, error)

    // Update assessment with error status
    await supabase
      .from('assessments')
      .update({
        status: 'failed',
        error_message: error instanceof Error ? error.message : 'Assessment generation failed',
      })
      .eq('id', assessmentId)
  }
}

export async function GET(request: NextRequest) {
  try {
    const session = await auth()
    if (!session?.user?.id || !session.user.orgId) {
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 401 }
      )
    }

    const { searchParams } = new URL(request.url)
    const companyId = searchParams.get('companyId')
    const status = searchParams.get('status')

    const supabase = createAdminClient()

    let query = supabase
      .from('assessments')
      .select(`
        id,
        company_id,
        type,
        status,
        recommendation,
        overall_score,
        processing_time_ms,
        created_at,
        completed_at,
        companies!inner(id, name, org_id)
      `)
      .eq('companies.org_id', session.user.orgId)
      .order('created_at', { ascending: false })

    if (companyId) {
      query = query.eq('company_id', companyId)
    }

    if (status) {
      query = query.eq('status', status)
    }

    const { data: assessments, error } = await query

    if (error) {
      return NextResponse.json(
        { error: 'Failed to fetch assessments' },
        { status: 500 }
      )
    }

    return NextResponse.json(assessments)
  } catch (error) {
    console.error('Assessments fetch error:', error)
    return NextResponse.json(
      { error: 'Failed to fetch assessments' },
      { status: 500 }
    )
  }
}
