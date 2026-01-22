import { NextRequest, NextResponse } from 'next/server'
import { auth } from '@/lib/auth/config'
import { createAdminClient } from '@/lib/supabase/admin'

interface RouteParams {
  params: Promise<{ id: string }>
}

export async function POST(request: NextRequest, { params }: RouteParams) {
  try {
    const session = await auth()
    if (!session?.user?.id || !session.user.orgId) {
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 401 }
      )
    }

    // Check if user is admin or owner
    const orgRole = session.user.orgRole
    if (orgRole !== 'admin' && orgRole !== 'owner') {
      return NextResponse.json(
        { error: 'Only admins can accept submissions' },
        { status: 403 }
      )
    }

    const { id } = await params

    const supabase = createAdminClient()

    // Get the submission
    const { data: submission, error: fetchError } = await supabase
      .from('deal_submissions')
      .select('*')
      .eq('id', id)
      .eq('org_id', session.user.orgId)
      .single()

    if (fetchError || !submission) {
      return NextResponse.json(
        { error: 'Submission not found' },
        { status: 404 }
      )
    }

    if (submission.status === 'accepted' && submission.company_id) {
      return NextResponse.json(
        { error: 'Submission already accepted', companyId: submission.company_id },
        { status: 400 }
      )
    }

    // Create a new company from the submission
    const { data: company, error: companyError } = await supabase
      .from('companies')
      .insert({
        org_id: session.user.orgId,
        name: submission.company_name,
        stage: submission.stage || null,
        sector: submission.sector || null,
        raise_amount: submission.raise_amount || null,
        website: submission.website || null,
        description: submission.description || null,
        status: 'active',
        created_by: session.user.id,
        pipeline_position: 0,
      })
      .select()
      .single()

    if (companyError || !company) {
      console.error('Error creating company:', companyError)
      return NextResponse.json(
        { error: 'Failed to create company' },
        { status: 500 }
      )
    }

    // Update the submission to mark it as accepted
    const { error: updateError } = await supabase
      .from('deal_submissions')
      .update({
        status: 'accepted',
        company_id: company.id,
        reviewed_at: new Date().toISOString(),
        reviewed_by: session.user.id,
      })
      .eq('id', id)

    if (updateError) {
      console.error('Error updating submission:', updateError)
      // Company was created but submission wasn't updated - not a critical failure
    }

    return NextResponse.json({
      success: true,
      companyId: company.id,
      message: 'Submission accepted and company created',
    })
  } catch (error) {
    console.error('Accept submission error:', error)
    return NextResponse.json(
      { error: 'Failed to accept submission' },
      { status: 500 }
    )
  }
}
