import Link from 'next/link'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { ArrowRight, FileText } from 'lucide-react'
import { EmptyState } from '@/components/shared/empty-state'

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
  strong_conviction: { label: 'Strong Conviction', variant: 'default' as const },
  proceed: { label: 'Proceed', variant: 'secondary' as const },
  conditional: { label: 'Conditional', variant: 'outline' as const },
  pass: { label: 'Pass', variant: 'destructive' as const },
}

export function RecentAssessments({ assessments }: RecentAssessmentsProps) {
  if (assessments.length === 0) {
    return (
      <Card>
        <CardHeader>
          <CardTitle>Recent Assessments</CardTitle>
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
    <Card>
      <CardHeader className="flex flex-row items-center justify-between">
        <CardTitle>Recent Assessments</CardTitle>
        <Button variant="ghost" size="sm" asChild>
          <Link href="/dashboard/assessments">
            View all
            <ArrowRight className="ml-1 h-4 w-4" />
          </Link>
        </Button>
      </CardHeader>
      <CardContent>
        <div className="space-y-4">
          {assessments.map((assessment) => (
            <Link
              key={assessment.id}
              href={`/dashboard/assessments/${assessment.id}`}
              className="flex items-center justify-between rounded-lg border p-4 hover:bg-muted/50 transition-colors"
            >
              <div className="space-y-1">
                <p className="font-medium">{assessment.companyName}</p>
                <div className="flex items-center gap-2 text-sm text-muted-foreground">
                  <Badge variant="outline" className="text-xs">
                    {assessment.type === 'full' ? 'Full Memo' : 'Screening'}
                  </Badge>
                  <span>
                    {new Date(assessment.createdAt).toLocaleDateString()}
                  </span>
                </div>
              </div>
              <div className="flex items-center gap-3">
                {assessment.overallScore && (
                  <div className="text-right">
                    <p className="text-2xl font-bold">
                      {assessment.overallScore.toFixed(1)}
                    </p>
                    <p className="text-xs text-muted-foreground">Score</p>
                  </div>
                )}
                {assessment.recommendation && (
                  <Badge
                    variant={recommendationConfig[assessment.recommendation].variant}
                  >
                    {recommendationConfig[assessment.recommendation].label}
                  </Badge>
                )}
              </div>
            </Link>
          ))}
        </div>
      </CardContent>
    </Card>
  )
}
