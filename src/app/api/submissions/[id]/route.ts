import { NextRequest, NextResponse } from 'next/server'
import { auth } from '@/lib/auth/config'
import { createAdminClient } from '@/lib/supabase/admin'

interface RouteParams {
  params: Promise<{ id: string }>
}

export async function GET(request: NextRequest, { params }: RouteParams) {
  try {
    const session = await auth()
    if (!session?.user?.id || !session.user.orgId) {
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 401 }
      )
    }

    const { id } = await params

    const supabase = createAdminClient()
    const { data: submission, error } = await supabase
      .from('deal_submissions')
      .select('*')
      .eq('id', id)
      .eq('org_id', session.user.orgId)
      .single()

    if (error || !submission) {
      return NextResponse.json(
        { error: 'Submission not found' },
        { status: 404 }
      )
    }

    return NextResponse.json(submission)
  } catch (error) {
    console.error('Submission fetch error:', error)
    return NextResponse.json(
      { error: 'Failed to fetch submission' },
      { status: 500 }
    )
  }
}

export async function PATCH(request: NextRequest, { params }: RouteParams) {
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
        { error: 'Only admins can update submissions' },
        { status: 403 }
      )
    }

    const { id } = await params
    const body = await request.json()

    const allowedFields = ['status', 'notes']
    const updates: Record<string, unknown> = {}

    for (const field of allowedFields) {
      if (field in body) {
        updates[field] = body[field]
      }
    }

    if (Object.keys(updates).length === 0) {
      return NextResponse.json(
        { error: 'No valid fields to update' },
        { status: 400 }
      )
    }

    // Add reviewed metadata
    if (updates.status) {
      updates.reviewed_at = new Date().toISOString()
      updates.reviewed_by = session.user.id
    }

    const supabase = createAdminClient()

    // Verify submission belongs to user's org
    const { data: existing } = await supabase
      .from('deal_submissions')
      .select('id')
      .eq('id', id)
      .eq('org_id', session.user.orgId)
      .single()

    if (!existing) {
      return NextResponse.json(
        { error: 'Submission not found' },
        { status: 404 }
      )
    }

    const { data: submission, error } = await supabase
      .from('deal_submissions')
      .update(updates)
      .eq('id', id)
      .select()
      .single()

    if (error) {
      console.error('Error updating submission:', error)
      return NextResponse.json(
        { error: 'Failed to update submission' },
        { status: 500 }
      )
    }

    return NextResponse.json(submission)
  } catch (error) {
    console.error('Submission update error:', error)
    return NextResponse.json(
      { error: 'Failed to update submission' },
      { status: 500 }
    )
  }
}
