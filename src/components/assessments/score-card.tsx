'use client'

import { cn } from '@/lib/utils'
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/components/ui/card'
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from '@/components/ui/tooltip'
import { Badge } from '@/components/ui/badge'
import { Info } from 'lucide-react'

interface DimensionScore {
  score: number
  reasoning: string
  strengths: string[]
  concerns: string[]
}

interface ScoreCardProps {
  dimension: string
  label: string
  data: DimensionScore
  icon?: React.ReactNode
}

function getScoreColor(score: number): string {
  if (score >= 80) return 'text-green-500'
  if (score >= 60) return 'text-blue-500'
  if (score >= 40) return 'text-yellow-500'
  if (score >= 20) return 'text-orange-500'
  return 'text-red-500'
}

function getScoreBgColor(score: number): string {
  if (score >= 80) return 'bg-green-500'
  if (score >= 60) return 'bg-blue-500'
  if (score >= 40) return 'bg-yellow-500'
  if (score >= 20) return 'bg-orange-500'
  return 'bg-red-500'
}

function getScoreLabel(score: number): string {
  if (score >= 80) return 'Exceptional'
  if (score >= 60) return 'Strong'
  if (score >= 40) return 'Average'
  if (score >= 20) return 'Below Average'
  return 'Poor'
}

export function ScoreCard({ dimension, label, data, icon }: ScoreCardProps) {
  return (
    <Card>
      <CardHeader className="pb-2">
        <div className="flex items-center justify-between">
          <CardTitle className="text-sm font-medium flex items-center gap-2">
            {icon}
            {label}
          </CardTitle>
          <TooltipProvider>
            <Tooltip>
              <TooltipTrigger>
                <Info className="h-4 w-4 text-muted-foreground" />
              </TooltipTrigger>
              <TooltipContent side="left" className="max-w-sm">
                <p className="text-sm">{data.reasoning}</p>
              </TooltipContent>
            </Tooltip>
          </TooltipProvider>
        </div>
      </CardHeader>
      <CardContent>
        <div className="flex items-center gap-4 mb-3">
          <span className={cn('text-3xl font-bold', getScoreColor(data.score))}>
            {data.score}
          </span>
          <div className="flex-1">
            <div className="h-2 bg-muted rounded-full overflow-hidden">
              <div
                className={cn('h-full rounded-full transition-all', getScoreBgColor(data.score))}
                style={{ width: `${data.score}%` }}
              />
            </div>
          </div>
          <Badge variant="secondary" className="text-xs">
            {getScoreLabel(data.score)}
          </Badge>
        </div>

        {data.strengths.length > 0 && (
          <div className="mb-2">
            <p className="text-xs font-medium text-green-600 mb-1">Strengths</p>
            <ul className="text-xs text-muted-foreground space-y-0.5">
              {data.strengths.slice(0, 2).map((strength, i) => (
                <li key={i} className="flex items-start gap-1">
                  <span className="text-green-500">+</span>
                  {strength}
                </li>
              ))}
            </ul>
          </div>
        )}

        {data.concerns.length > 0 && (
          <div>
            <p className="text-xs font-medium text-orange-600 mb-1">Concerns</p>
            <ul className="text-xs text-muted-foreground space-y-0.5">
              {data.concerns.slice(0, 2).map((concern, i) => (
                <li key={i} className="flex items-start gap-1">
                  <span className="text-orange-500">-</span>
                  {concern}
                </li>
              ))}
            </ul>
          </div>
        )}
      </CardContent>
    </Card>
  )
}

interface OverallScoreProps {
  score: number
  recommendation: string
  confidence?: number
}

export function OverallScoreCard({ score, recommendation, confidence }: OverallScoreProps) {
  const recommendationConfig: Record<string, { label: string; color: string; bgColor: string }> = {
    strong_conviction: { label: 'Strong Conviction', color: 'text-green-700', bgColor: 'bg-green-100' },
    proceed: { label: 'Proceed', color: 'text-blue-700', bgColor: 'bg-blue-100' },
    conditional: { label: 'Conditional', color: 'text-yellow-700', bgColor: 'bg-yellow-100' },
    pass: { label: 'Pass', color: 'text-red-700', bgColor: 'bg-red-100' },
  }

  const config = recommendationConfig[recommendation] || recommendationConfig.pass

  return (
    <Card className="border-2">
      <CardHeader>
        <CardTitle className="text-center">Overall Assessment</CardTitle>
      </CardHeader>
      <CardContent className="text-center">
        <div className="relative w-32 h-32 mx-auto mb-4">
          <svg className="w-full h-full transform -rotate-90">
            <circle
              cx="64"
              cy="64"
              r="56"
              fill="none"
              stroke="currentColor"
              strokeWidth="8"
              className="text-muted"
            />
            <circle
              cx="64"
              cy="64"
              r="56"
              fill="none"
              stroke="currentColor"
              strokeWidth="8"
              strokeLinecap="round"
              className={getScoreColor(score)}
              strokeDasharray={`${score * 3.52} 352`}
            />
          </svg>
          <div className="absolute inset-0 flex items-center justify-center">
            <span className={cn('text-4xl font-bold', getScoreColor(score))}>
              {score}
            </span>
          </div>
        </div>

        <Badge className={cn('text-sm px-3 py-1', config.bgColor, config.color)}>
          {config.label}
        </Badge>

        {confidence !== undefined && (
          <p className="text-xs text-muted-foreground mt-2">
            {confidence}% confidence
          </p>
        )}
      </CardContent>
    </Card>
  )
}

interface ScoresGridProps {
  scores: {
    market: DimensionScore
    team: DimensionScore
    product: DimensionScore
    traction: DimensionScore
    financials: DimensionScore
    competitive: DimensionScore
  }
}

export function ScoresGrid({ scores }: ScoresGridProps) {
  const dimensions = [
    { key: 'market', label: 'Market Opportunity' },
    { key: 'team', label: 'Team & Leadership' },
    { key: 'product', label: 'Product & Tech' },
    { key: 'traction', label: 'Traction & Growth' },
    { key: 'financials', label: 'Financials' },
    { key: 'competitive', label: 'Competitive Position' },
  ]

  return (
    <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
      {dimensions.map(({ key, label }) => (
        <ScoreCard
          key={key}
          dimension={key}
          label={label}
          data={scores[key as keyof typeof scores]}
        />
      ))}
    </div>
  )
}
