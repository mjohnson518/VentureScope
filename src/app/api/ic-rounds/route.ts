import { NextRequest, NextResponse } from 'next/server'
import { z } from 'zod'
import { auth } from '@/lib/auth/config'
import { createAdminClient } from '@/lib/supabase/admin'

const createRoundSchema = z.object({
  assessment_id: z.string().uuid(),
  title: z.string().max(255).optional(),
  deadline: z.string().datetime(),
  quorum_percentage: z.number().min(1).max(100).default(50),
  participant_ids: z.array(z.string().uuid()).min(1),
})

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
    const assessmentId = searchParams.get('assessmentId')
    const status = searchParams.get('status')

    const supabase = createAdminClient()

    let query = supabase
      .from('ic_voting_rounds')
      .select(`
        *,
        assessment:assessments(
          id,
          company:companies(id, name)
        ),
        participants:ic_round_participants(
          user_id,
          user:users(id, name, email, avatar_url)
        ),
        votes:ic_votes(
          id,
          user_id,
          vote,
          created_at
        ),
        created_by_user:users!ic_voting_rounds_created_by_fkey(
          id,
          name,
          email
        )
      `)
      .eq('org_id', session.user.orgId)
      .order('created_at', { ascending: false })

    if (assessmentId) {
      query = query.eq('assessment_id', assessmentId)
    }

    if (status && status !== 'all') {
      query = query.eq('status', status)
    }

    const { data: rounds, error } = await query

    if (error) {
      console.error('Error fetching IC rounds:', error)
      return NextResponse.json(
        { error: 'Failed to fetch voting rounds' },
        { status: 500 }
      )
    }

    // Process rounds to include vote count and user's vote status
    const processedRounds = rounds?.map((round) => {
      const totalParticipants = round.participants?.length || 0
      const votesSubmitted = round.votes?.length || 0
      const userHasVoted = round.votes?.some((v: { user_id: string }) => v.user_id === session.user.id)
      const isParticipant = round.participants?.some(
        (p: { user_id: string }) => p.user_id === session.user.id
      )

      // Only show vote details if revealed or round is closed
      const isRevealed = round.revealed_at || round.status === 'closed'

      return {
        ...round,
        total_participants: totalParticipants,
        votes_submitted: votesSubmitted,
        user_has_voted: userHasVoted,
        is_participant: isParticipant,
        is_revealed: isRevealed,
        votes: isRevealed ? round.votes : round.votes?.map((v: { user_id: string; vote: string }) => ({
          user_id: v.user_id,
          vote: v.user_id === session.user.id ? v.vote : null,
        })),
      }
    })

    return NextResponse.json(processedRounds)
  } catch (error) {
    console.error('IC rounds fetch error:', error)
    return NextResponse.json(
      { error: 'Failed to fetch voting rounds' },
      { status: 500 }
    )
  }
}

export async function POST(request: NextRequest) {
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
        { error: 'Only admins can create voting rounds' },
        { status: 403 }
      )
    }

    const body = await request.json()
    const validation = createRoundSchema.safeParse(body)

    if (!validation.success) {
      return NextResponse.json(
        { error: 'Invalid request data', details: validation.error.flatten() },
        { status: 400 }
      )
    }

    const data = validation.data
    const supabase = createAdminClient()

    // Verify assessment belongs to org
    const { data: assessment, error: assessmentError } = await supabase
      .from('assessments')
      .select('id, company:companies(org_id)')
      .eq('id', data.assessment_id)
      .single()

    if (assessmentError || !assessment) {
      return NextResponse.json(
        { error: 'Assessment not found' },
        { status: 404 }
      )
    }

    const company = assessment.company as unknown as { org_id: string } | null
    if (company?.org_id !== session.user.orgId) {
      return NextResponse.json(
        { error: 'Assessment not found' },
        { status: 404 }
      )
    }

    // Verify all participants are org members
    const { data: orgMembers, error: membersError } = await supabase
      .from('org_memberships')
      .select('user_id')
      .eq('org_id', session.user.orgId)
      .in('user_id', data.participant_ids)

    if (membersError) {
      return NextResponse.json(
        { error: 'Failed to verify participants' },
        { status: 500 }
      )
    }

    const validMemberIds = new Set(orgMembers?.map((m) => m.user_id) || [])
    const invalidParticipants = data.participant_ids.filter((id) => !validMemberIds.has(id))

    if (invalidParticipants.length > 0) {
      return NextResponse.json(
        { error: 'Some participants are not organization members' },
        { status: 400 }
      )
    }

    // Create the voting round
    const { data: round, error: roundError } = await supabase
      .from('ic_voting_rounds')
      .insert({
        assessment_id: data.assessment_id,
        org_id: session.user.orgId,
        created_by: session.user.id,
        title: data.title || null,
        deadline: data.deadline,
        quorum_percentage: data.quorum_percentage,
        status: 'open',
      })
      .select()
      .single()

    if (roundError || !round) {
      console.error('Error creating voting round:', roundError)
      return NextResponse.json(
        { error: 'Failed to create voting round' },
        { status: 500 }
      )
    }

    // Add participants
    const participantRecords = data.participant_ids.map((userId) => ({
      round_id: round.id,
      user_id: userId,
    }))

    const { error: participantsError } = await supabase
      .from('ic_round_participants')
      .insert(participantRecords)

    if (participantsError) {
      console.error('Error adding participants:', participantsError)
      // Clean up the round
      await supabase.from('ic_voting_rounds').delete().eq('id', round.id)
      return NextResponse.json(
        { error: 'Failed to add participants' },
        { status: 500 }
      )
    }

    return NextResponse.json(round, { status: 201 })
  } catch (error) {
    console.error('Create IC round error:', error)
    return NextResponse.json(
      { error: 'Failed to create voting round' },
      { status: 500 }
    )
  }
}
