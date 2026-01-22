import { NextRequest, NextResponse } from 'next/server'
import { auth } from '@/lib/auth/config'
import { createAdminClient } from '@/lib/supabase/admin'

interface RouteParams {
  params: Promise<{ roundId: string }>
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

    const { roundId } = await params
    const supabase = createAdminClient()

    const { data: round, error } = await supabase
      .from('ic_voting_rounds')
      .select(`
        *,
        assessment:assessments(
          id,
          type,
          status,
          recommendation,
          overall_score,
          company:companies(id, name, stage, sector)
        ),
        participants:ic_round_participants(
          user_id,
          user:users(id, name, email, avatar_url)
        ),
        votes:ic_votes(
          id,
          user_id,
          vote,
          comment,
          created_at,
          user:users(id, name, email, avatar_url)
        ),
        created_by_user:users!ic_voting_rounds_created_by_fkey(
          id,
          name,
          email
        )
      `)
      .eq('id', roundId)
      .eq('org_id', session.user.orgId)
      .single()

    if (error || !round) {
      return NextResponse.json(
        { error: 'Voting round not found' },
        { status: 404 }
      )
    }

    // Check if votes should be revealed
    const isRevealed = round.revealed_at || round.status === 'closed'
    const isParticipant = round.participants?.some(
      (p: { user_id: string }) => p.user_id === session.user.id
    )

    // Process votes based on reveal status
    const processedVotes = round.votes?.map((v: { user_id: string; vote: string; comment: string | null; user: unknown }) => {
      if (isRevealed) {
        return v
      }
      // Before reveal, only show user's own vote
      return {
        ...v,
        vote: v.user_id === session.user.id ? v.vote : null,
        comment: v.user_id === session.user.id ? v.comment : null,
        user: v.user_id === session.user.id ? v.user : null,
      }
    })

    return NextResponse.json({
      ...round,
      votes: processedVotes,
      is_revealed: isRevealed,
      is_participant: isParticipant,
      user_has_voted: round.votes?.some((v: { user_id: string }) => v.user_id === session.user.id),
      total_participants: round.participants?.length || 0,
      votes_submitted: round.votes?.length || 0,
    })
  } catch (error) {
    console.error('IC round fetch error:', error)
    return NextResponse.json(
      { error: 'Failed to fetch voting round' },
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

    const orgRole = session.user.orgRole
    if (orgRole !== 'admin' && orgRole !== 'owner') {
      return NextResponse.json(
        { error: 'Only admins can update voting rounds' },
        { status: 403 }
      )
    }

    const { roundId } = await params
    const body = await request.json()
    const supabase = createAdminClient()

    // Verify round exists and belongs to org
    const { data: existing } = await supabase
      .from('ic_voting_rounds')
      .select('id, status')
      .eq('id', roundId)
      .eq('org_id', session.user.orgId)
      .single()

    if (!existing) {
      return NextResponse.json(
        { error: 'Voting round not found' },
        { status: 404 }
      )
    }

    const allowedFields = ['title', 'status', 'deadline', 'quorum_percentage']
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

    const { data: round, error } = await supabase
      .from('ic_voting_rounds')
      .update(updates)
      .eq('id', roundId)
      .select()
      .single()

    if (error) {
      console.error('Error updating voting round:', error)
      return NextResponse.json(
        { error: 'Failed to update voting round' },
        { status: 500 }
      )
    }

    return NextResponse.json(round)
  } catch (error) {
    console.error('IC round update error:', error)
    return NextResponse.json(
      { error: 'Failed to update voting round' },
      { status: 500 }
    )
  }
}

export async function DELETE(request: NextRequest, { params }: RouteParams) {
  try {
    const session = await auth()
    if (!session?.user?.id || !session.user.orgId) {
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 401 }
      )
    }

    const orgRole = session.user.orgRole
    if (orgRole !== 'admin' && orgRole !== 'owner') {
      return NextResponse.json(
        { error: 'Only admins can delete voting rounds' },
        { status: 403 }
      )
    }

    const { roundId } = await params
    const supabase = createAdminClient()

    // Verify round exists and belongs to org
    const { data: existing } = await supabase
      .from('ic_voting_rounds')
      .select('id')
      .eq('id', roundId)
      .eq('org_id', session.user.orgId)
      .single()

    if (!existing) {
      return NextResponse.json(
        { error: 'Voting round not found' },
        { status: 404 }
      )
    }

    const { error } = await supabase
      .from('ic_voting_rounds')
      .delete()
      .eq('id', roundId)

    if (error) {
      console.error('Error deleting voting round:', error)
      return NextResponse.json(
        { error: 'Failed to delete voting round' },
        { status: 500 }
      )
    }

    return NextResponse.json({ success: true })
  } catch (error) {
    console.error('IC round delete error:', error)
    return NextResponse.json(
      { error: 'Failed to delete voting round' },
      { status: 500 }
    )
  }
}
