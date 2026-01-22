'use client'

import { useState, useEffect } from 'react'
import Link from 'next/link'
import { formatDistanceToNow } from 'date-fns'
import { Vote, Clock, ArrowRight, Loader2 } from 'lucide-react'

import { Badge } from '@/components/ui/badge'
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/components/ui/card'
import { Button } from '@/components/ui/button'

interface PendingVote {
  id: string
  title: string | null
  deadline: string
  assessment: {
    id: string
    company: {
      name: string
    }
  }
  votes_submitted: number
  total_participants: number
  user_has_voted: boolean
}

export function PendingVotes() {
  const [votes, setVotes] = useState<PendingVote[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    async function fetchPendingVotes() {
      try {
        const response = await fetch('/api/ic-rounds?status=open')
        if (response.ok) {
          const data = await response.json()
          // Filter to only show rounds where user is a participant and hasn't voted
          const pendingVotes = data.filter(
            (round: { is_participant: boolean; user_has_voted: boolean }) =>
              round.is_participant && !round.user_has_voted
          )
          setVotes(pendingVotes.slice(0, 3)) // Show max 3
        }
      } catch (error) {
        console.error('Error fetching pending votes:', error)
      } finally {
        setLoading(false)
      }
    }

    fetchPendingVotes()
  }, [])

  if (loading) {
    return (
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Vote className="h-5 w-5" />
            Pending Votes
          </CardTitle>
        </CardHeader>
        <CardContent className="flex items-center justify-center py-8">
          <Loader2 className="h-6 w-6 animate-spin text-muted-foreground" />
        </CardContent>
      </Card>
    )
  }

  if (votes.length === 0) {
    return (
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Vote className="h-5 w-5" />
            Pending Votes
          </CardTitle>
          <CardDescription>IC voting rounds awaiting your input</CardDescription>
        </CardHeader>
        <CardContent>
          <p className="text-sm text-muted-foreground text-center py-4">
            No pending votes
          </p>
        </CardContent>
      </Card>
    )
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Vote className="h-5 w-5" />
          Pending Votes
          <Badge variant="destructive" className="ml-auto">
            {votes.length}
          </Badge>
        </CardTitle>
        <CardDescription>IC voting rounds awaiting your input</CardDescription>
      </CardHeader>
      <CardContent className="space-y-3">
        {votes.map((vote) => (
          <Link
            key={vote.id}
            href={`/dashboard/assessments/${vote.assessment.id}?tab=ic-voting`}
            className="block group"
          >
            <div className="flex items-center justify-between p-3 rounded-lg border bg-card hover:bg-accent transition-colors">
              <div className="min-w-0 flex-1">
                <p className="font-medium truncate group-hover:text-primary transition-colors">
                  {vote.assessment.company.name}
                </p>
                <div className="flex items-center gap-2 text-xs text-muted-foreground mt-1">
                  <Clock className="h-3 w-3" />
                  <span>
                    Due {formatDistanceToNow(new Date(vote.deadline), { addSuffix: true })}
                  </span>
                  <span>·</span>
                  <span>{vote.votes_submitted}/{vote.total_participants} voted</span>
                </div>
              </div>
              <ArrowRight className="h-4 w-4 text-muted-foreground group-hover:text-primary transition-colors" />
            </div>
          </Link>
        ))}
        {votes.length > 0 && (
          <Button variant="ghost" size="sm" className="w-full" asChild>
            <Link href="/dashboard/assessments">View All Assessments</Link>
          </Button>
        )}
      </CardContent>
    </Card>
  )
}
