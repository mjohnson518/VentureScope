import Link from 'next/link'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { ArrowRight, FileText, ChevronRight } from 'lucide-react'
import { EmptyState } from '@/components/shared/empty-state'
import { cn } from '@/lib/utils'

interface Assessment {
  id: string
  companyName: string
  type: 'screening' | 'full'
  recommendation: 'strong_conviction' | 'proceed' | 'conditional' | 'pass' | null
  overallScore: number | null
  createdAt: string
}

interface RecentAssessmentsProps {
  assessments: Assessment[]
}

const recommendationConfig = {
  strong_conviction: { label: 'Strong Conviction', className: 'bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border-emerald-500/20' },
  proceed: { label: 'Proceed', className: 'bg-blue-500/10 text-blue-600 dark:text-blue-400 border-blue-500/20' },
  conditional: { label: 'Conditional', className: 'bg-amber-500/10 text-amber-600 dark:text-amber-400 border-amber-500/20' },
  pass: { label: 'Pass', className: 'bg-red-500/10 text-red-600 dark:text-red-400 border-red-500/20' },
}

function getScoreColor(score: number): string {
  if (score >= 80) return 'score-excellent'
  if (score >= 70) return 'score-good'
  if (score >= 50) return 'score-average'
  return 'score-poor'
}

export function RecentAssessments({ assessments }: RecentAssessmentsProps) {
  if (assessments.length === 0) {
    return (
      <Card className="border-border/50 bg-card/80 backdrop-blur-sm">
        <CardHeader>
          <CardTitle className="font-display">Recent Assessments</CardTitle>
        </CardHeader>
        <CardContent>
          <EmptyState
            icon={FileText}
            title="No assessments yet"
            description="Generate your first investment memo to see it here"
            action={{
              label: 'New Assessment',
              href: '/dashboard/assessments/new',
            }}
          />
        </CardContent>
      </Card>
    )
  }

  return (
    <Card className="border-border/50 bg-card/80 backdrop-blur-sm">
      <CardHeader className="flex flex-row items-center justify-between">
        <CardTitle className="font-display">Recent Assessments</CardTitle>
        <Button variant="ghost" size="sm" className="gap-1 text-muted-foreground hover:text-foreground" asChild>
          <Link href="/dashboard/assessments">
            View all
            <ArrowRight className="h-4 w-4" />
          </Link>
        </Button>
      </CardHeader>
      <CardContent>
        <div className="space-y-3 stagger-children">
          {assessments.map((assessment, index) => (
            <Link
              key={assessment.id}
              href={`/dashboard/assessments/${assessment.id}`}
              className="group flex items-center justify-between rounded-xl border border-border/50 p-4 hover:border-border hover:bg-muted/30 transition-all duration-200"
              style={{ animationDelay: `${index * 50}ms` }}
            >
              <div className="space-y-1.5">
                <p className="font-medium group-hover:text-primary transition-colors">
                  {assessment.companyName}
                </p>
                <div className="flex items-center gap-2 text-sm text-muted-foreground">
                  <Badge variant="outline" className="text-xs font-normal">
                    {assessment.type === 'full' ? 'Full Memo' : 'Screening'}
                  </Badge>
                  <span className="text-muted-foreground/60">•</span>
                  <span>
                    {new Date(assessment.createdAt).toLocaleDateString()}
                  </span>
                </div>
              </div>
              <div className="flex items-center gap-4">
                {assessment.overallScore !== null && (
                  <div className="text-right">
                    <p className={cn(
                      'font-display text-2xl font-bold',
                      getScoreColor(assessment.overallScore)
                    )}>
                      {assessment.overallScore.toFixed(0)}
                    </p>
                    <p className="text-[10px] uppercase tracking-wider text-muted-foreground">Score</p>
                  </div>
                )}
                {assessment.recommendation && (
                  <Badge
                    variant="outline"
                    className={cn(
                      'font-medium',
                      recommendationConfig[assessment.recommendation].className
                    )}
                  >
                    {recommendationConfig[assessment.recommendation].label}
                  </Badge>
                )}
                <ChevronRight className="h-5 w-5 text-muted-foreground/50 opacity-0 -translate-x-2 transition-all duration-200 group-hover:opacity-100 group-hover:translate-x-0" />
              </div>
            </Link>
          ))}
        </div>
      </CardContent>
    </Card>
  )
}
