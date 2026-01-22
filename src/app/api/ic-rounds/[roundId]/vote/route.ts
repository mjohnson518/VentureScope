import { NextRequest, NextResponse } from 'next/server'
import { z } from 'zod'
import { auth } from '@/lib/auth/config'
import { createAdminClient } from '@/lib/supabase/admin'

interface RouteParams {
  params: Promise<{ roundId: string }>
}

const voteSchema = z.object({
  vote: z.enum(['strong_yes', 'yes', 'neutral', 'no', 'strong_no']),
  comment: z.string().max(2000).optional(),
})

export async function POST(request: NextRequest, { params }: RouteParams) {
  try {
    const session = await auth()
    if (!session?.user?.id || !session.user.orgId) {
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 401 }
      )
    }

    const { roundId } = await params
    const body = await request.json()
    const validation = voteSchema.safeParse(body)

    if (!validation.success) {
      return NextResponse.json(
        { error: 'Invalid vote data', details: validation.error.flatten() },
        { status: 400 }
      )
    }

    const data = validation.data
    const supabase = createAdminClient()

    // Verify round exists, is open, and user is a participant
    const { data: round, error: roundError } = await supabase
      .from('ic_voting_rounds')
      .select(`
        id,
        status,
        deadline,
        org_id,
        participants:ic_round_participants(user_id)
      `)
      .eq('id', roundId)
      .single()

    if (roundError || !round) {
      return NextResponse.json(
        { error: 'Voting round not found' },
        { status: 404 }
      )
    }

    if (round.org_id !== session.user.orgId) {
      return NextResponse.json(
        { error: 'Voting round not found' },
        { status: 404 }
      )
    }

    if (round.status !== 'open') {
      return NextResponse.json(
        { error: 'Voting round is not open' },
        { status: 400 }
      )
    }

    // Check if deadline has passed
    if (new Date(round.deadline) < new Date()) {
      return NextResponse.json(
        { error: 'Voting deadline has passed' },
        { status: 400 }
      )
    }

    // Check if user is a participant
    const isParticipant = round.participants?.some(
      (p: { user_id: string }) => p.user_id === session.user.id
    )

    if (!isParticipant) {
      return NextResponse.json(
        { error: 'You are not a participant in this voting round' },
        { status: 403 }
      )
    }

    // Check if user has already voted
    const { data: existingVote } = await supabase
      .from('ic_votes')
      .select('id')
      .eq('round_id', roundId)
      .eq('user_id', session.user.id)
      .single()

    if (existingVote) {
      // Update existing vote
      const { data: vote, error: updateError } = await supabase
        .from('ic_votes')
        .update({
          vote: data.vote,
          comment: data.comment || null,
        })
        .eq('id', existingVote.id)
        .select()
        .single()

      if (updateError) {
        console.error('Error updating vote:', updateError)
        return NextResponse.json(
          { error: 'Failed to update vote' },
          { status: 500 }
        )
      }

      return NextResponse.json(vote)
    }

    // Create new vote
    const { data: vote, error: voteError } = await supabase
      .from('ic_votes')
      .insert({
        round_id: roundId,
        user_id: session.user.id,
        vote: data.vote,
        comment: data.comment || null,
      })
      .select()
      .single()

    if (voteError) {
      console.error('Error creating vote:', voteError)
      return NextResponse.json(
        { error: 'Failed to submit vote' },
        { status: 500 }
      )
    }

    return NextResponse.json(vote, { status: 201 })
  } catch (error) {
    console.error('Vote submission error:', error)
    return NextResponse.json(
      { error: 'Failed to submit vote' },
      { status: 500 }
    )
  }
}
