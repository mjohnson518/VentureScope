import { NextRequest, NextResponse } from 'next/server'
import { auth } from '@/lib/auth/config'
import { createAdminClient } from '@/lib/supabase/admin'

interface RouteParams {
  params: Promise<{ id: string }>
}

// GET /api/assessments/[id]/share - Get shares for an assessment
export async function GET(request: NextRequest, { params }: RouteParams) {
  try {
    const session = await auth()
    if (!session?.user?.id || !session.user.orgId) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const { id } = await params
    const supabase = createAdminClient()

    // Verify assessment access
    const { data: assessment } = await supabase
      .from('assessments')
      .select('id, companies!inner(org_id)')
      .eq('id', id)
      .eq('companies.org_id', session.user.orgId)
      .single()

    if (!assessment) {
      return NextResponse.json({ error: 'Assessment not found' }, { status: 404 })
    }

    // Get shares
    const { data: shares, error } = await supabase
      .from('assessment_shares')
      .select(`
        id,
        permission,
        created_at,
        shared_with_user_id,
        users!assessment_shares_shared_with_user_id_fkey(id, email, name, avatar_url)
      `)
      .eq('assessment_id', id)

    if (error) {
      return NextResponse.json({ error: 'Failed to fetch shares' }, { status: 500 })
    }

    return NextResponse.json(shares)
  } catch (error) {
    console.error('Shares fetch error:', error)
    return NextResponse.json({ error: 'Failed to fetch shares' }, { status: 500 })
  }
}

// POST /api/assessments/[id]/share - Share an assessment
export async function POST(request: NextRequest, { params }: RouteParams) {
  try {
    const session = await auth()
    if (!session?.user?.id || !session.user.orgId) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const { id } = await params
    const body = await request.json()
    const { email, permission = 'view' } = body

    if (!email) {
      return NextResponse.json({ error: 'Email is required' }, { status: 400 })
    }

    if (!['view', 'comment', 'edit'].includes(permission)) {
      return NextResponse.json({ error: 'Invalid permission level' }, { status: 400 })
    }

    const supabase = createAdminClient()

    // Verify assessment access
    const { data: assessment } = await supabase
      .from('assessments')
      .select('id, companies!inner(org_id, name)')
      .eq('id', id)
      .eq('companies.org_id', session.user.orgId)
      .single()

    if (!assessment) {
      return NextResponse.json({ error: 'Assessment not found' }, { status: 404 })
    }

    // Find user by email
    const { data: targetUser } = await supabase
      .from('users')
      .select('id, email, name')
      .eq('email', email.toLowerCase())
      .single()

    if (!targetUser) {
      return NextResponse.json(
        { error: 'User not found. They must have an account first.' },
        { status: 404 }
      )
    }

    // Check if already shared
    const { data: existingShare } = await supabase
      .from('assessment_shares')
      .select('id')
      .eq('assessment_id', id)
      .eq('shared_with_user_id', targetUser.id)
      .single()

    if (existingShare) {
      // Update existing share
      const { data: updatedShare, error: updateError } = await supabase
        .from('assessment_shares')
        .update({ permission })
        .eq('id', existingShare.id)
        .select()
        .single()

      if (updateError) {
        return NextResponse.json({ error: 'Failed to update share' }, { status: 500 })
      }

      return NextResponse.json(updatedShare)
    }

    // Create new share
    const { data: share, error: shareError } = await supabase
      .from('assessment_shares')
      .insert({
        assessment_id: id,
        shared_with_user_id: targetUser.id,
        shared_by: session.user.id,
        permission,
      })
      .select()
      .single()

    if (shareError) {
      return NextResponse.json({ error: 'Failed to create share' }, { status: 500 })
    }

    return NextResponse.json({
      ...share,
      user: targetUser,
    })
  } catch (error) {
    console.error('Share creation error:', error)
    return NextResponse.json({ error: 'Failed to share assessment' }, { status: 500 })
  }
}

// DELETE /api/assessments/[id]/share - Remove a share
export async function DELETE(request: NextRequest, { params }: RouteParams) {
  try {
    const session = await auth()
    if (!session?.user?.id || !session.user.orgId) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const { id } = await params
    const { searchParams } = new URL(request.url)
    const shareId = searchParams.get('shareId')

    if (!shareId) {
      return NextResponse.json({ error: 'Share ID required' }, { status: 400 })
    }

    const supabase = createAdminClient()

    // Verify assessment access
    const { data: assessment } = await supabase
      .from('assessments')
      .select('id, companies!inner(org_id)')
      .eq('id', id)
      .eq('companies.org_id', session.user.orgId)
      .single()

    if (!assessment) {
      return NextResponse.json({ error: 'Assessment not found' }, { status: 404 })
    }

    // Delete share
    const { error: deleteError } = await supabase
      .from('assessment_shares')
      .delete()
      .eq('id', shareId)
      .eq('assessment_id', id)

    if (deleteError) {
      return NextResponse.json({ error: 'Failed to remove share' }, { status: 500 })
    }

    return NextResponse.json({ success: true })
  } catch (error) {
    console.error('Share delete error:', error)
    return NextResponse.json({ error: 'Failed to remove share' }, { status: 500 })
  }
}
