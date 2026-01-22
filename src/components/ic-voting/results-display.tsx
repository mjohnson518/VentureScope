'use client'

import { ThumbsUp, ThumbsDown, Minus, MessageSquare } from 'lucide-react'
import { Badge } from '@/components/ui/badge'
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/components/ui/card'
import type { ICVote } from '@/types/database'

interface VoteDistribution {
  vote: ICVote
  label: string
  count: number
  percentage: number
}

interface Comment {
  user: string
  vote: string
  comment: string
}

interface Voter {
  name: string
  vote: string
}

interface ResultsDisplayProps {
  voteDistribution: VoteDistribution[]
  averageScore: number
  consensus: 'positive' | 'negative' | 'neutral' | 'mixed'
  comments?: Comment[]
  voters?: Voter[]
  quorumMet: boolean
}

const voteIcons: Record<ICVote, React.ReactNode> = {
  strong_yes: <ThumbsUp className="h-4 w-4 fill-current text-green-600" />,
  yes: <ThumbsUp className="h-4 w-4 text-green-500" />,
  neutral: <Minus className="h-4 w-4 text-gray-500" />,
  no: <ThumbsDown className="h-4 w-4 text-red-500" />,
  strong_no: <ThumbsDown className="h-4 w-4 fill-current text-red-600" />,
}

const voteColors: Record<ICVote, string> = {
  strong_yes: 'bg-green-500',
  yes: 'bg-green-300',
  neutral: 'bg-gray-300',
  no: 'bg-red-300',
  strong_no: 'bg-red-500',
}

const consensusConfig: Record<string, { label: string; variant: 'default' | 'secondary' | 'outline' | 'destructive' }> = {
  positive: { label: 'Positive Consensus', variant: 'default' },
  negative: { label: 'Negative Consensus', variant: 'destructive' },
  neutral: { label: 'Neutral', variant: 'secondary' },
  mixed: { label: 'Mixed Results', variant: 'outline' },
}

export function ResultsDisplay({
  voteDistribution,
  averageScore,
  consensus,
  comments = [],
  voters = [],
  quorumMet,
}: ResultsDisplayProps) {
  const consensusInfo = consensusConfig[consensus]
  const totalVotes = voteDistribution.reduce((sum, v) => sum + v.count, 0)

  return (
    <div className="space-y-6">
      {/* Summary */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          <Badge variant={consensusInfo.variant}>{consensusInfo.label}</Badge>
          {!quorumMet && (
            <Badge variant="outline" className="text-yellow-600 border-yellow-600">
              Quorum Not Met
            </Badge>
          )}
        </div>
        <div className="text-sm text-muted-foreground">
          Avg Score: <span className="font-semibold">{averageScore.toFixed(2)}</span>
        </div>
      </div>

      {/* Vote Distribution Bar */}
      <div className="space-y-2">
        <div className="flex h-8 rounded-lg overflow-hidden">
          {voteDistribution.map((item) => (
            item.count > 0 && (
              <div
                key={item.vote}
                className={`${voteColors[item.vote]} flex items-center justify-center`}
                style={{ width: `${item.percentage}%` }}
                title={`${item.label}: ${item.count} vote${item.count !== 1 ? 's' : ''} (${item.percentage}%)`}
              >
                {item.percentage >= 15 && (
                  <span className="text-xs font-medium text-white">
                    {item.count}
                  </span>
                )}
              </div>
            )
          ))}
        </div>
        <div className="flex flex-wrap gap-3 justify-center">
          {voteDistribution.map((item) => (
            <div key={item.vote} className="flex items-center gap-1 text-sm">
              {voteIcons[item.vote]}
              <span className="text-muted-foreground">
                {item.label}: {item.count}
              </span>
            </div>
          ))}
        </div>
      </div>

      {/* Voters List */}
      {voters.length > 0 && (
        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="text-sm font-medium">Votes ({totalVotes})</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="flex flex-wrap gap-2">
              {voters.map((voter, idx) => (
                <Badge key={idx} variant="secondary" className="font-normal">
                  {voter.name}: {voter.vote}
                </Badge>
              ))}
            </div>
          </CardContent>
        </Card>
      )}

      {/* Comments */}
      {comments.length > 0 && (
        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="text-sm font-medium flex items-center gap-2">
              <MessageSquare className="h-4 w-4" />
              Comments ({comments.length})
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            {comments.map((comment, idx) => (
              <div key={idx} className="space-y-1">
                <div className="flex items-center gap-2">
                  <span className="font-medium text-sm">{comment.user}</span>
                  <Badge variant="outline" className="text-xs">
                    {comment.vote}
                  </Badge>
                </div>
                <p className="text-sm text-muted-foreground">{comment.comment}</p>
              </div>
            ))}
          </CardContent>
        </Card>
      )}
    </div>
  )
}
