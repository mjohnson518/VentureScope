import { NextRequest, NextResponse } from 'next/server'
import { auth } from '@/lib/auth/config'
import { createAdminClient } from '@/lib/supabase/admin'

interface RouteParams {
  params: Promise<{ roundId: string }>
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

    const orgRole = session.user.orgRole
    if (orgRole !== 'admin' && orgRole !== 'owner') {
      return NextResponse.json(
        { error: 'Only admins can reveal votes' },
        { status: 403 }
      )
    }

    const { roundId } = await params
    const supabase = createAdminClient()

    // Verify round exists and belongs to org
    const { data: round, error: roundError } = await supabase
      .from('ic_voting_rounds')
      .select('id, status, revealed_at, org_id')
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

    if (round.revealed_at) {
      return NextResponse.json(
        { error: 'Votes have already been revealed' },
        { status: 400 }
      )
    }

    // Update round to mark as revealed and closed
    const { data: updatedRound, error: updateError } = await supabase
      .from('ic_voting_rounds')
      .update({
        revealed_at: new Date().toISOString(),
        status: 'closed',
      })
      .eq('id', roundId)
      .select()
      .single()

    if (updateError) {
      console.error('Error revealing votes:', updateError)
      return NextResponse.json(
        { error: 'Failed to reveal votes' },
        { status: 500 }
      )
    }

    return NextResponse.json(updatedRound)
  } catch (error) {
    console.error('Reveal votes error:', error)
    return NextResponse.json(
      { error: 'Failed to reveal votes' },
      { status: 500 }
    )
  }
}
