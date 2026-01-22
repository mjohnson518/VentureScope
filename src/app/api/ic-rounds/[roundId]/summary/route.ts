import { NextRequest, NextResponse } from 'next/server'
import { auth } from '@/lib/auth/config'
import { createAdminClient } from '@/lib/supabase/admin'
import type { ICVote } from '@/types/database'

interface RouteParams {
  params: Promise<{ roundId: string }>
}

const VOTE_VALUES: Record<ICVote, number> = {
  strong_yes: 2,
  yes: 1,
  neutral: 0,
  no: -1,
  strong_no: -2,
}

const VOTE_LABELS: Record<ICVote, string> = {
  strong_yes: 'Strong Yes',
  yes: 'Yes',
  neutral: 'Neutral',
  no: 'No',
  strong_no: 'Strong No',
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

    // Get round with votes
    const { data: round, error } = await supabase
      .from('ic_voting_rounds')
      .select(`
        *,
        assessment:assessments(
          id,
          type,
          recommendation,
          overall_score,
          company:companies(id, name, stage, sector, raise_amount)
        ),
        participants:ic_round_participants(
          user_id,
          user:users(id, name, email)
        ),
        votes:ic_votes(
          id,
          user_id,
          vote,
          comment,
          user:users(id, name)
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

    // Only show full summary if revealed
    const isRevealed = round.revealed_at || round.status === 'closed'

    if (!isRevealed) {
      return NextResponse.json({
        round_id: round.id,
        title: round.title,
        status: round.status,
        deadline: round.deadline,
        is_revealed: false,
        total_participants: round.participants?.length || 0,
        votes_submitted: round.votes?.length || 0,
        quorum_met: (round.votes?.length || 0) >= Math.ceil(
          (round.participants?.length || 0) * (round.quorum_percentage / 100)
        ),
        message: 'Votes have not been revealed yet',
      })
    }

    // Calculate vote distribution
    const voteDistribution: Record<ICVote, number> = {
      strong_yes: 0,
      yes: 0,
      neutral: 0,
      no: 0,
      strong_no: 0,
    }

    let totalScore = 0
    const comments: Array<{ user: string; vote: string; comment: string }> = []

    round.votes?.forEach((v: { vote: ICVote; comment: string | null; user: { name: string } | null }) => {
      if (v.vote) {
        voteDistribution[v.vote]++
        totalScore += VOTE_VALUES[v.vote]
        if (v.comment) {
          comments.push({
            user: v.user?.name || 'Unknown',
            vote: VOTE_LABELS[v.vote],
            comment: v.comment,
          })
        }
      }
    })

    const totalVotes = round.votes?.length || 0
    const averageScore = totalVotes > 0 ? totalScore / totalVotes : 0

    // Determine consensus
    let consensus = 'mixed'
    const positiveVotes = voteDistribution.strong_yes + voteDistribution.yes
    const negativeVotes = voteDistribution.strong_no + voteDistribution.no

    if (totalVotes > 0) {
      const positiveRatio = positiveVotes / totalVotes
      const negativeRatio = negativeVotes / totalVotes

      if (positiveRatio >= 0.7) {
        consensus = 'positive'
      } else if (negativeRatio >= 0.7) {
        consensus = 'negative'
      } else if (voteDistribution.neutral / totalVotes >= 0.5) {
        consensus = 'neutral'
      }
    }

    return NextResponse.json({
      round_id: round.id,
      title: round.title,
      status: round.status,
      deadline: round.deadline,
      revealed_at: round.revealed_at,
      is_revealed: true,
      assessment: round.assessment,
      total_participants: round.participants?.length || 0,
      votes_submitted: totalVotes,
      quorum_percentage: round.quorum_percentage,
      quorum_met: totalVotes >= Math.ceil(
        (round.participants?.length || 0) * (round.quorum_percentage / 100)
      ),
      vote_distribution: Object.entries(voteDistribution).map(([vote, count]) => ({
        vote,
        label: VOTE_LABELS[vote as ICVote],
        count,
        percentage: totalVotes > 0 ? Math.round((count / totalVotes) * 100) : 0,
      })),
      average_score: Math.round(averageScore * 100) / 100,
      consensus,
      comments,
      voters: round.votes?.map((v: { user: { id: string; name: string } | null; vote: ICVote }) => ({
        name: v.user?.name || 'Unknown',
        vote: VOTE_LABELS[v.vote],
      })),
    })
  } catch (error) {
    console.error('IC round summary error:', error)
    return NextResponse.json(
      { error: 'Failed to fetch voting summary' },
      { status: 500 }
    )
  }
}
