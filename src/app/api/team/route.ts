import { NextRequest, NextResponse } from 'next/server'
import { auth } from '@/lib/auth/config'
import { createAdminClient } from '@/lib/supabase/admin'

// GET /api/team - Get team members
export async function GET(request: NextRequest) {
  try {
    const session = await auth()
    if (!session?.user?.id || !session.user.orgId) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const supabase = createAdminClient()

    const { data: members, error } = await supabase
      .from('org_memberships')
      .select(`
        id,
        role,
        invited_at,
        accepted_at,
        users(id, email, name, avatar_url, role)
      `)
      .eq('org_id', session.user.orgId)
      .order('accepted_at', { ascending: false })

    if (error) {
      return NextResponse.json({ error: 'Failed to fetch team' }, { status: 500 })
    }

    const transformedMembers = members?.map((m) => ({
      id: m.id,
      orgRole: m.role,
      invitedAt: m.invited_at,
      acceptedAt: m.accepted_at,
      user: Array.isArray(m.users) ? m.users[0] : m.users,
    }))

    return NextResponse.json(transformedMembers)
  } catch (error) {
    console.error('Team fetch error:', error)
    return NextResponse.json({ error: 'Failed to fetch team' }, { status: 500 })
  }
}

// POST /api/team - Invite a team member
export async function POST(request: NextRequest) {
  try {
    const session = await auth()
    if (!session?.user?.id || !session.user.orgId) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    // Check if user is owner or admin
    if (session.user.orgRole !== 'owner' && session.user.orgRole !== 'admin') {
      return NextResponse.json({ error: 'Only owners and admins can invite members' }, { status: 403 })
    }

    const body = await request.json()
    const { email, role = 'member' } = body

    if (!email) {
      return NextResponse.json({ error: 'Email is required' }, { status: 400 })
    }

    if (!['admin', 'member'].includes(role)) {
      return NextResponse.json({ error: 'Invalid role' }, { status: 400 })
    }

    const supabase = createAdminClient()

    // Find user by email
    const { data: user } = await supabase
      .from('users')
      .select('id, email, name')
      .eq('email', email.toLowerCase())
      .single()

    if (!user) {
      return NextResponse.json(
        { error: 'User not found. They must create an account first.' },
        { status: 404 }
      )
    }

    // Check if already a member
    const { data: existingMember } = await supabase
      .from('org_memberships')
      .select('id')
      .eq('org_id', session.user.orgId)
      .eq('user_id', user.id)
      .single()

    if (existingMember) {
      return NextResponse.json(
        { error: 'User is already a team member' },
        { status: 400 }
      )
    }

    // Create membership (auto-accepted for now)
    const { data: membership, error } = await supabase
      .from('org_memberships')
      .insert({
        org_id: session.user.orgId,
        user_id: user.id,
        role,
        accepted_at: new Date().toISOString(),
      })
      .select()
      .single()

    if (error) {
      return NextResponse.json({ error: 'Failed to add member' }, { status: 500 })
    }

    return NextResponse.json({
      id: membership.id,
      orgRole: membership.role,
      user,
    })
  } catch (error) {
    console.error('Team invite error:', error)
    return NextResponse.json({ error: 'Failed to invite member' }, { status: 500 })
  }
}
