'use client'

import { Users, Check } from 'lucide-react'
import { Progress } from '@/components/ui/progress'

interface VotingProgressProps {
  votesSubmitted: number
  totalParticipants: number
  quorumPercentage: number
}

export function VotingProgress({
  votesSubmitted,
  totalParticipants,
  quorumPercentage,
}: VotingProgressProps) {
  const percentVoted = totalParticipants > 0
    ? Math.round((votesSubmitted / totalParticipants) * 100)
    : 0

  const quorumRequired = Math.ceil(totalParticipants * (quorumPercentage / 100))
  const quorumMet = votesSubmitted >= quorumRequired

  return (
    <div className="space-y-2">
      <div className="flex items-center justify-between text-sm">
        <div className="flex items-center gap-2 text-muted-foreground">
          <Users className="h-4 w-4" />
          <span>
            {votesSubmitted} of {totalParticipants} voted
          </span>
        </div>
        <span className="font-medium">{percentVoted}%</span>
      </div>
      <Progress value={percentVoted} className="h-2" />
      <div className="flex items-center gap-2 text-xs text-muted-foreground">
        {quorumMet ? (
          <>
            <Check className="h-3 w-3 text-green-500" />
            <span className="text-green-600 dark:text-green-400">
              Quorum reached ({quorumPercentage}% required)
            </span>
          </>
        ) : (
          <span>
            {quorumRequired - votesSubmitted} more vote{quorumRequired - votesSubmitted !== 1 ? 's' : ''} needed for quorum ({quorumPercentage}%)
          </span>
        )}
      </div>
    </div>
  )
}
