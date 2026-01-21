import { NextRequest, NextResponse } from 'next/server'
import { auth } from '@/lib/auth/config'
import { createAdminClient } from '@/lib/supabase/admin'

interface RouteParams {
  params: Promise<{ memberId: string }>
}

// PATCH /api/team/[memberId] - Update member role
export async function PATCH(request: NextRequest, { params }: RouteParams) {
  try {
    const session = await auth()
    if (!session?.user?.id || !session.user.orgId) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    // Only owners can change roles
    if (session.user.orgRole !== 'owner') {
      return NextResponse.json({ error: 'Only owners can change roles' }, { status: 403 })
    }

    const { memberId } = await params
    const body = await request.json()
    const { role } = body

    if (!role || !['admin', 'member'].includes(role)) {
      return NextResponse.json({ error: 'Invalid role' }, { status: 400 })
    }

    const supabase = createAdminClient()

    // Verify membership belongs to this org
    const { data: membership } = await supabase
      .from('org_memberships')
      .select('id, user_id, role')
      .eq('id', memberId)
      .eq('org_id', session.user.orgId)
      .single()

    if (!membership) {
      return NextResponse.json({ error: 'Member not found' }, { status: 404 })
    }

    // Can't change owner role
    if (membership.role === 'owner') {
      return NextResponse.json({ error: 'Cannot change owner role' }, { status: 400 })
    }

    // Update role
    const { error } = await supabase
      .from('org_memberships')
      .update({ role })
      .eq('id', memberId)

    if (error) {
      return NextResponse.json({ error: 'Failed to update role' }, { status: 500 })
    }

    return NextResponse.json({ success: true, role })
  } catch (error) {
    console.error('Member update error:', error)
    return NextResponse.json({ error: 'Failed to update member' }, { status: 500 })
  }
}

// DELETE /api/team/[memberId] - Remove member
export async function DELETE(request: NextRequest, { params }: RouteParams) {
  try {
    const session = await auth()
    if (!session?.user?.id || !session.user.orgId) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    // Only owners and admins can remove members
    if (session.user.orgRole !== 'owner' && session.user.orgRole !== 'admin') {
      return NextResponse.json({ error: 'Insufficient permissions' }, { status: 403 })
    }

    const { memberId } = await params
    const supabase = createAdminClient()

    // Verify membership belongs to this org
    const { data: membership } = await supabase
      .from('org_memberships')
      .select('id, user_id, role')
      .eq('id', memberId)
      .eq('org_id', session.user.orgId)
      .single()

    if (!membership) {
      return NextResponse.json({ error: 'Member not found' }, { status: 404 })
    }

    // Can't remove owner
    if (membership.role === 'owner') {
      return NextResponse.json({ error: 'Cannot remove the owner' }, { status: 400 })
    }

    // Admins can only remove members, not other admins
    if (session.user.orgRole === 'admin' && membership.role === 'admin') {
      return NextResponse.json({ error: 'Admins cannot remove other admins' }, { status: 403 })
    }

    // Delete membership
    const { error } = await supabase
      .from('org_memberships')
      .delete()
      .eq('id', memberId)

    if (error) {
      return NextResponse.json({ error: 'Failed to remove member' }, { status: 500 })
    }

    return NextResponse.json({ success: true })
  } catch (error) {
    console.error('Member delete error:', error)
    return NextResponse.json({ error: 'Failed to remove member' }, { status: 500 })
  }
}
