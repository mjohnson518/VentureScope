'use client'

import { useState, useEffect, useCallback } from 'react'
import { useRouter } from 'next/navigation'
import { formatDistanceToNow, format, isPast } from 'date-fns'
import {
  Vote,
  Clock,
  Eye,
  MoreHorizontal,
  Trash2,
  XCircle,
  Loader2,
} from 'lucide-react'
import { toast } from 'sonner'

import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/components/ui/card'
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu'
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from '@/components/ui/alert-dialog'
import { EmptyState } from '@/components/shared/empty-state'
import { CreateRoundDialog } from './create-round-dialog'
import { VoteInput } from './vote-input'
import { VotingProgress } from './voting-progress'
import { ResultsDisplay } from './results-display'
import type { ICVote, ICRoundStatus } from '@/types/database'

interface TeamMember {
  id: string
  name: string | null
  email: string
}

interface VotingRound {
  id: string
  title: string | null
  status: ICRoundStatus
  deadline: string
  quorum_percentage: number
  revealed_at: string | null
  created_at: string
  total_participants: number
  votes_submitted: number
  user_has_voted: boolean
  is_participant: boolean
  is_revealed: boolean
  votes?: Array<{
    user_id: string
    vote: ICVote | null
    comment?: string | null
  }>
  created_by_user?: {
    name: string | null
    email: string
  }
}

interface ICVotingSectionProps {
  assessmentId: string
  teamMembers: TeamMember[]
  isAdmin: boolean
  currentUserId: string
}

const statusConfig: Record<ICRoundStatus, { label: string; variant: 'default' | 'secondary' | 'outline' }> = {
  open: { label: 'Open', variant: 'default' },
  closed: { label: 'Closed', variant: 'secondary' },
  cancelled: { label: 'Cancelled', variant: 'outline' },
}

export function ICVotingSection({
  assessmentId,
  teamMembers,
  isAdmin,
  currentUserId,
}: ICVotingSectionProps) {
  const router = useRouter()
  const [rounds, setRounds] = useState<VotingRound[]>([])
  const [loading, setLoading] = useState(true)
  const [revealingId, setRevealingId] = useState<string | null>(null)
  const [deletingId, setDeletingId] = useState<string | null>(null)
  const [actionLoading, setActionLoading] = useState(false)

  const fetchRounds = useCallback(async () => {
    try {
      const response = await fetch(`/api/ic-rounds?assessmentId=${assessmentId}`)
      if (response.ok) {
        const data = await response.json()
        setRounds(data)
      }
    } catch (error) {
      console.error('Error fetching rounds:', error)
    } finally {
      setLoading(false)
    }
  }, [assessmentId])

  useEffect(() => {
    fetchRounds()
  }, [fetchRounds])

  const handleVoteSubmit = async (roundId: string, vote: ICVote, comment?: string) => {
    try {
      const response = await fetch(`/api/ic-rounds/${roundId}/vote`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ vote, comment }),
      })

      if (!response.ok) {
        const data = await response.json()
        throw new Error(data.error || 'Failed to submit vote')
      }

      toast.success('Vote submitted')
      fetchRounds()
    } catch (error) {
      toast.error(error instanceof Error ? error.message : 'Failed to submit vote')
      throw error
    }
  }

  const handleReveal = async () => {
    if (!revealingId) return

    setActionLoading(true)
    try {
      const response = await fetch(`/api/ic-rounds/${revealingId}/reveal`, {
        method: 'POST',
      })

      if (!response.ok) {
        throw new Error('Failed to reveal votes')
      }

      toast.success('Votes revealed')
      fetchRounds()
    } catch (error) {
      toast.error(error instanceof Error ? error.message : 'Failed to reveal votes')
    } finally {
      setActionLoading(false)
      setRevealingId(null)
    }
  }

  const handleDelete = async () => {
    if (!deletingId) return

    setActionLoading(true)
    try {
      const response = await fetch(`/api/ic-rounds/${deletingId}`, {
        method: 'DELETE',
      })

      if (!response.ok) {
        throw new Error('Failed to delete voting round')
      }

      toast.success('Voting round deleted')
      fetchRounds()
    } catch (error) {
      toast.error(error instanceof Error ? error.message : 'Failed to delete')
    } finally {
      setActionLoading(false)
      setDeletingId(null)
    }
  }

  const handleCancel = async (roundId: string) => {
    try {
      const response = await fetch(`/api/ic-rounds/${roundId}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ status: 'cancelled' }),
      })

      if (!response.ok) {
        throw new Error('Failed to cancel voting round')
      }

      toast.success('Voting round cancelled')
      fetchRounds()
    } catch (error) {
      toast.error(error instanceof Error ? error.message : 'Failed to cancel')
    }
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center py-12">
        <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
      </div>
    )
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h3 className="text-lg font-semibold">IC Voting</h3>
          <p className="text-sm text-muted-foreground">
            Blind voting for investment committee decisions
          </p>
        </div>
        {isAdmin && (
          <CreateRoundDialog
            assessmentId={assessmentId}
            teamMembers={teamMembers}
          />
        )}
      </div>

      {rounds.length === 0 ? (
        <EmptyState
          icon={Vote}
          title="No voting rounds"
          description={
            isAdmin
              ? 'Create a voting round to gather IC feedback'
              : 'No voting rounds have been created yet'
          }
        />
      ) : (
        <div className="space-y-4">
          {rounds.map((round) => {
            const config = statusConfig[round.status]
            const deadlinePassed = isPast(new Date(round.deadline))
            const userVote = round.votes?.find((v) => v.user_id === currentUserId)

            return (
              <Card key={round.id}>
                <CardHeader>
                  <div className="flex items-start justify-between">
                    <div>
                      <CardTitle className="text-base">
                        {round.title || 'IC Voting Round'}
                      </CardTitle>
                      <CardDescription className="flex items-center gap-2 mt-1">
                        <Clock className="h-3 w-3" />
                        {deadlinePassed ? (
                          <span className="text-yellow-600 dark:text-yellow-400">
                            Deadline passed {formatDistanceToNow(new Date(round.deadline), { addSuffix: true })}
                          </span>
                        ) : (
                          <span>
                            Due {format(new Date(round.deadline), 'PPp')}
                          </span>
                        )}
                      </CardDescription>
                    </div>
                    <div className="flex items-center gap-2">
                      <Badge variant={config.variant}>{config.label}</Badge>
                      {isAdmin && round.status === 'open' && (
                        <DropdownMenu>
                          <DropdownMenuTrigger asChild>
                            <Button variant="ghost" size="icon" className="h-8 w-8">
                              <MoreHorizontal className="h-4 w-4" />
                            </Button>
                          </DropdownMenuTrigger>
                          <DropdownMenuContent align="end">
                            {!round.is_revealed && (
                              <DropdownMenuItem onClick={() => setRevealingId(round.id)}>
                                <Eye className="mr-2 h-4 w-4" />
                                Reveal Votes
                              </DropdownMenuItem>
                            )}
                            <DropdownMenuItem onClick={() => handleCancel(round.id)}>
                              <XCircle className="mr-2 h-4 w-4" />
                              Cancel Round
                            </DropdownMenuItem>
                            <DropdownMenuSeparator />
                            <DropdownMenuItem
                              className="text-destructive"
                              onClick={() => setDeletingId(round.id)}
                            >
                              <Trash2 className="mr-2 h-4 w-4" />
                              Delete
                            </DropdownMenuItem>
                          </DropdownMenuContent>
                        </DropdownMenu>
                      )}
                    </div>
                  </div>
                </CardHeader>
                <CardContent className="space-y-4">
                  <VotingProgress
                    votesSubmitted={round.votes_submitted}
                    totalParticipants={round.total_participants}
                    quorumPercentage={round.quorum_percentage}
                  />

                  {round.is_revealed ? (
                    <RoundResults roundId={round.id} />
                  ) : round.is_participant && round.status === 'open' ? (
                    <div className="pt-4 border-t">
                      <h4 className="text-sm font-medium mb-3">
                        {round.user_has_voted ? 'Update Your Vote' : 'Cast Your Vote'}
                      </h4>
                      <VoteInput
                        onSubmit={(vote, comment) => handleVoteSubmit(round.id, vote, comment)}
                        currentVote={userVote?.vote || null}
                        currentComment={userVote?.comment || null}
                        disabled={deadlinePassed}
                      />
                    </div>
                  ) : !round.is_participant ? (
                    <p className="text-sm text-muted-foreground text-center py-4">
                      You are not a participant in this voting round
                    </p>
                  ) : null}
                </CardContent>
              </Card>
            )
          })}
        </div>
      )}

      {/* Reveal Confirmation Dialog */}
      <AlertDialog open={!!revealingId} onOpenChange={() => setRevealingId(null)}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Reveal Votes</AlertDialogTitle>
            <AlertDialogDescription>
              This will reveal all votes to participants. This action cannot be undone.
              Are you sure you want to reveal the votes now?
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction onClick={handleReveal} disabled={actionLoading}>
              {actionLoading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
              Reveal Votes
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>

      {/* Delete Confirmation Dialog */}
      <AlertDialog open={!!deletingId} onOpenChange={() => setDeletingId(null)}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Delete Voting Round</AlertDialogTitle>
            <AlertDialogDescription>
              This will permanently delete the voting round and all associated votes.
              This action cannot be undone.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction
              onClick={handleDelete}
              className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
              disabled={actionLoading}
            >
              {actionLoading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
              Delete
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  )
}

function RoundResults({ roundId }: { roundId: string }) {
  const [summary, setSummary] = useState<{
    vote_distribution: Array<{
      vote: ICVote
      label: string
      count: number
      percentage: number
    }>
    average_score: number
    consensus: 'positive' | 'negative' | 'neutral' | 'mixed'
    comments: Array<{ user: string; vote: string; comment: string }>
    voters: Array<{ name: string; vote: string }>
    quorum_met: boolean
  } | null>(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    async function fetchSummary() {
      try {
        const response = await fetch(`/api/ic-rounds/${roundId}/summary`)
        if (response.ok) {
          const data = await response.json()
          if (data.is_revealed) {
            setSummary(data)
          }
        }
      } catch (error) {
        console.error('Error fetching summary:', error)
      } finally {
        setLoading(false)
      }
    }

    fetchSummary()
  }, [roundId])

  if (loading) {
    return (
      <div className="flex items-center justify-center py-4">
        <Loader2 className="h-5 w-5 animate-spin text-muted-foreground" />
      </div>
    )
  }

  if (!summary) {
    return null
  }

  return (
    <div className="pt-4 border-t">
      <h4 className="text-sm font-medium mb-3">Results</h4>
      <ResultsDisplay
        voteDistribution={summary.vote_distribution}
        averageScore={summary.average_score}
        consensus={summary.consensus}
        comments={summary.comments}
        voters={summary.voters}
        quorumMet={summary.quorum_met}
      />
    </div>
  )
}
