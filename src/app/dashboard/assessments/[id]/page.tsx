import { Metadata } from 'next'
import { notFound } from 'next/navigation'
import Link from 'next/link'
import {
  ArrowLeft,
  Building2,
  Clock,
  Calendar,
  Loader2,
  AlertCircle,
  CheckCircle,
  TrendingUp,
  TrendingDown,
  HelpCircle,
  AlertTriangle,
} from 'lucide-react'
import { formatDistanceToNow, format } from 'date-fns'
import { auth } from '@/lib/auth/config'
import { createAdminClient } from '@/lib/supabase/admin'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/components/ui/card'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { OverallScoreCard, ScoresGrid } from '@/components/assessments'

interface AssessmentPageProps {
  params: Promise<{ id: string }>
}

const recommendationConfig: Record<string, { label: string; color: string; bgColor: string }> = {
  strong_conviction: { label: 'Strong Conviction', color: 'text-green-700', bgColor: 'bg-green-100' },
  proceed: { label: 'Proceed', color: 'text-blue-700', bgColor: 'bg-blue-100' },
  conditional: { label: 'Conditional', color: 'text-yellow-700', bgColor: 'bg-yellow-100' },
  pass: { label: 'Pass', color: 'text-red-700', bgColor: 'bg-red-100' },
}

export async function generateMetadata({ params }: AssessmentPageProps): Promise<Metadata> {
  const { id } = await params
  const session = await auth()
  if (!session?.user?.orgId) {
    return { title: 'Assessment - VentureScope' }
  }

  const supabase = createAdminClient()
  const { data: assessment } = await supabase
    .from('assessments')
    .select('type, companies!inner(name, org_id)')
    .eq('id', id)
    .eq('companies.org_id', session.user.orgId)
    .single()

  if (!assessment) {
    return { title: 'Assessment - VentureScope' }
  }

  const company = assessment.companies as unknown as { name: string; org_id: string }
  return {
    title: `${assessment.type === 'full' ? 'Full Assessment' : 'Screening'} - ${company.name} - VentureScope`,
  }
}

export default async function AssessmentPage({ params }: AssessmentPageProps) {
  const { id } = await params
  const session = await auth()

  if (!session?.user?.id || !session.user.orgId) {
    notFound()
  }

  const supabase = createAdminClient()
  const { data: assessment, error } = await supabase
    .from('assessments')
    .select(`
      *,
      companies!inner(id, name, stage, sector, org_id)
    `)
    .eq('id', id)
    .eq('companies.org_id', session.user.orgId)
    .single()

  if (error || !assessment) {
    notFound()
  }

  const company = assessment.companies as { id: string; name: string; stage: string; sector: string }

  // Handle processing state
  if (assessment.status === 'processing') {
    return (
      <div className="space-y-6">
        <div className="flex items-center gap-4">
          <Button variant="ghost" size="icon" asChild>
            <Link href={`/dashboard/companies/${company.id}`}>
              <ArrowLeft className="h-4 w-4" />
            </Link>
          </Button>
          <div>
            <h1 className="text-2xl font-bold tracking-tight">
              {assessment.type === 'full' ? 'Full Assessment' : 'Screening Assessment'}
            </h1>
            <p className="text-muted-foreground flex items-center gap-2">
              <Link href={`/dashboard/companies/${company.id}`} className="hover:underline">
                {company.name}
              </Link>
            </p>
          </div>
        </div>

        <Card className="max-w-lg mx-auto">
          <CardContent className="pt-6 text-center">
            <Loader2 className="h-12 w-12 animate-spin mx-auto text-primary mb-4" />
            <h2 className="text-lg font-semibold mb-2">Generating Assessment</h2>
            <p className="text-muted-foreground mb-4">
              Claude is analyzing the documents and generating your investment memo.
              This typically takes 30-60 seconds.
            </p>
            <Button variant="outline" onClick={() => window.location.reload()}>
              Refresh Status
            </Button>
          </CardContent>
        </Card>
      </div>
    )
  }

  // Handle failed state
  if (assessment.status === 'failed') {
    return (
      <div className="space-y-6">
        <div className="flex items-center gap-4">
          <Button variant="ghost" size="icon" asChild>
            <Link href={`/dashboard/companies/${company.id}`}>
              <ArrowLeft className="h-4 w-4" />
            </Link>
          </Button>
          <div>
            <h1 className="text-2xl font-bold tracking-tight">Assessment Failed</h1>
            <p className="text-muted-foreground">{company.name}</p>
          </div>
        </div>

        <Card className="border-destructive max-w-lg mx-auto">
          <CardContent className="pt-6 text-center">
            <AlertCircle className="h-12 w-12 mx-auto text-destructive mb-4" />
            <h2 className="text-lg font-semibold mb-2">Assessment Generation Failed</h2>
            <p className="text-muted-foreground mb-4">
              {assessment.error_message || 'An unexpected error occurred while generating the assessment.'}
            </p>
            <Button asChild>
              <Link href={`/dashboard/companies/${company.id}`}>
                Return to Company
              </Link>
            </Button>
          </CardContent>
        </Card>
      </div>
    )
  }

  // Completed assessment
  const content = assessment.content as Record<string, unknown>
  const scores = assessment.scores as {
    market: { score: number; reasoning: string; strengths: string[]; concerns: string[] }
    team: { score: number; reasoning: string; strengths: string[]; concerns: string[] }
    product: { score: number; reasoning: string; strengths: string[]; concerns: string[] }
    traction: { score: number; reasoning: string; strengths: string[]; concerns: string[] }
    financials: { score: number; reasoning: string; strengths: string[]; concerns: string[] }
    competitive: { score: number; reasoning: string; strengths: string[]; concerns: string[] }
  }

  const isScreening = assessment.type === 'screening'
  const recConfig = recommendationConfig[assessment.recommendation] || recommendationConfig.pass

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-start justify-between">
        <div className="flex items-start gap-4">
          <Button variant="ghost" size="icon" asChild>
            <Link href={`/dashboard/companies/${company.id}`}>
              <ArrowLeft className="h-4 w-4" />
            </Link>
          </Button>
          <div>
            <div className="flex items-center gap-3">
              <h1 className="text-2xl font-bold tracking-tight">
                {isScreening ? 'Screening Assessment' : 'Full Assessment'}
              </h1>
              <Badge variant="default" className="bg-green-500">
                <CheckCircle className="mr-1 h-3 w-3" />
                Completed
              </Badge>
            </div>
            <p className="text-muted-foreground flex items-center gap-2 mt-1">
              <Link
                href={`/dashboard/companies/${company.id}`}
                className="flex items-center gap-1 hover:underline"
              >
                <Building2 className="h-3 w-3" />
                {company.name}
              </Link>
              <span>·</span>
              <span className="flex items-center gap-1">
                <Calendar className="h-3 w-3" />
                {format(new Date(assessment.created_at), 'MMM d, yyyy')}
              </span>
              {assessment.processing_time_ms && (
                <>
                  <span>·</span>
                  <span className="flex items-center gap-1">
                    <Clock className="h-3 w-3" />
                    {(assessment.processing_time_ms / 1000).toFixed(1)}s
                  </span>
                </>
              )}
            </p>
          </div>
        </div>
      </div>

      {/* Overall Score and Recommendation */}
      <div className="grid gap-6 md:grid-cols-4">
        <OverallScoreCard
          score={assessment.overall_score || 0}
          recommendation={assessment.recommendation}
        />

        <Card className="md:col-span-3">
          <CardHeader>
            <CardTitle>Executive Summary</CardTitle>
          </CardHeader>
          <CardContent>
            {isScreening ? (
              <div className="space-y-4">
                <p className="text-muted-foreground">
                  {(content as { summary?: string }).summary}
                </p>
                <p className="font-medium">
                  {(content as { quickTake?: string }).quickTake}
                </p>
              </div>
            ) : (
              <p className="text-muted-foreground whitespace-pre-line">
                {(content as { executiveSummary?: string }).executiveSummary}
              </p>
            )}
          </CardContent>
        </Card>
      </div>

      {/* Scores Grid */}
      <Card>
        <CardHeader>
          <CardTitle>Dimension Scores</CardTitle>
          <CardDescription>
            Detailed scoring across key investment dimensions
          </CardDescription>
        </CardHeader>
        <CardContent>
          <ScoresGrid scores={scores} />
        </CardContent>
      </Card>

      {/* Content Tabs */}
      {isScreening ? (
        <div className="grid gap-6 md:grid-cols-2">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2 text-green-600">
                <TrendingUp className="h-5 w-5" />
                Key Highlights
              </CardTitle>
            </CardHeader>
            <CardContent>
              <ul className="space-y-2">
                {((content as { keyHighlights?: string[] }).keyHighlights || []).map((item, i) => (
                  <li key={i} className="flex items-start gap-2 text-sm">
                    <CheckCircle className="h-4 w-4 text-green-500 mt-0.5 shrink-0" />
                    {item}
                  </li>
                ))}
              </ul>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2 text-red-600">
                <AlertTriangle className="h-5 w-5" />
                Red Flags
              </CardTitle>
            </CardHeader>
            <CardContent>
              <ul className="space-y-2">
                {((content as { redFlags?: string[] }).redFlags || []).length > 0 ? (
                  ((content as { redFlags?: string[] }).redFlags || []).map((item, i) => (
                    <li key={i} className="flex items-start gap-2 text-sm">
                      <AlertCircle className="h-4 w-4 text-red-500 mt-0.5 shrink-0" />
                      {item}
                    </li>
                  ))
                ) : (
                  <p className="text-sm text-muted-foreground">No major red flags identified</p>
                )}
              </ul>
            </CardContent>
          </Card>

          <Card className="md:col-span-2">
            <CardHeader>
              <CardTitle>Recommended Next Steps</CardTitle>
            </CardHeader>
            <CardContent>
              <ul className="space-y-2">
                {((content as { recommendedNextSteps?: string[] }).recommendedNextSteps || []).map((item, i) => (
                  <li key={i} className="flex items-start gap-2 text-sm">
                    <span className="font-medium text-primary">{i + 1}.</span>
                    {item}
                  </li>
                ))}
              </ul>
            </CardContent>
          </Card>
        </div>
      ) : (
        <Tabs defaultValue="analysis" className="space-y-4">
          <TabsList>
            <TabsTrigger value="analysis">Analysis</TabsTrigger>
            <TabsTrigger value="thesis">Investment Thesis</TabsTrigger>
            <TabsTrigger value="risks">Risks</TabsTrigger>
          </TabsList>

          <TabsContent value="analysis" className="space-y-4">
            {/* Company Overview */}
            <Card>
              <CardHeader>
                <CardTitle>Company Overview</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                {Object.entries((content as { companyOverview?: Record<string, string> }).companyOverview || {}).map(([key, value]) => (
                  <div key={key}>
                    <h4 className="font-medium capitalize mb-1">{key.replace(/([A-Z])/g, ' $1').trim()}</h4>
                    <p className="text-sm text-muted-foreground">{value as string}</p>
                  </div>
                ))}
              </CardContent>
            </Card>

            {/* Market Analysis */}
            <Card>
              <CardHeader>
                <CardTitle>Market Analysis</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                {Object.entries((content as { marketAnalysis?: Record<string, unknown> }).marketAnalysis || {}).map(([key, value]) => (
                  <div key={key}>
                    <h4 className="font-medium capitalize mb-1">{key.replace(/([A-Z])/g, ' $1').trim()}</h4>
                    {Array.isArray(value) ? (
                      <ul className="text-sm text-muted-foreground space-y-1">
                        {(value as string[]).map((item, i) => (
                          <li key={i}>• {item}</li>
                        ))}
                      </ul>
                    ) : (
                      <p className="text-sm text-muted-foreground">{value as string}</p>
                    )}
                  </div>
                ))}
              </CardContent>
            </Card>

            {/* Team Analysis */}
            <Card>
              <CardHeader>
                <CardTitle>Team Analysis</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                {Object.entries((content as { teamAnalysis?: Record<string, unknown> }).teamAnalysis || {}).map(([key, value]) => (
                  <div key={key}>
                    <h4 className="font-medium capitalize mb-1">{key.replace(/([A-Z])/g, ' $1').trim()}</h4>
                    {Array.isArray(value) ? (
                      <ul className="text-sm text-muted-foreground space-y-1">
                        {(value as string[]).map((item, i) => (
                          <li key={i}>• {item}</li>
                        ))}
                      </ul>
                    ) : (
                      <p className="text-sm text-muted-foreground">{value as string}</p>
                    )}
                  </div>
                ))}
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="thesis" className="space-y-4">
            <div className="grid gap-6 md:grid-cols-2">
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2 text-green-600">
                    <TrendingUp className="h-5 w-5" />
                    Bull Case
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <ul className="space-y-2">
                    {((content as { investmentThesis?: { bullCase?: string[] } }).investmentThesis?.bullCase || []).map((item, i) => (
                      <li key={i} className="flex items-start gap-2 text-sm">
                        <CheckCircle className="h-4 w-4 text-green-500 mt-0.5 shrink-0" />
                        {item}
                      </li>
                    ))}
                  </ul>
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2 text-red-600">
                    <TrendingDown className="h-5 w-5" />
                    Bear Case
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <ul className="space-y-2">
                    {((content as { investmentThesis?: { bearCase?: string[] } }).investmentThesis?.bearCase || []).map((item, i) => (
                      <li key={i} className="flex items-start gap-2 text-sm">
                        <AlertCircle className="h-4 w-4 text-red-500 mt-0.5 shrink-0" />
                        {item}
                      </li>
                    ))}
                  </ul>
                </CardContent>
              </Card>
            </div>

            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <HelpCircle className="h-5 w-5" />
                  Key Questions
                </CardTitle>
                <CardDescription>
                  Questions to explore in further diligence
                </CardDescription>
              </CardHeader>
              <CardContent>
                <ul className="space-y-2">
                  {((content as { investmentThesis?: { keyQuestions?: string[] } }).investmentThesis?.keyQuestions || []).map((item, i) => (
                    <li key={i} className="flex items-start gap-2 text-sm">
                      <span className="font-medium text-primary">{i + 1}.</span>
                      {item}
                    </li>
                  ))}
                </ul>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="risks" className="space-y-4">
            <Card>
              <CardHeader>
                <CardTitle>Risk Assessment</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {((content as { riskAssessment?: { keyRisks?: Array<{ risk: string; severity: string; mitigation: string }> } }).riskAssessment?.keyRisks || []).map((item, i) => (
                    <div key={i} className="border rounded-lg p-4">
                      <div className="flex items-center gap-2 mb-2">
                        <Badge
                          variant={
                            item.severity === 'high'
                              ? 'destructive'
                              : item.severity === 'medium'
                                ? 'secondary'
                                : 'outline'
                          }
                        >
                          {item.severity}
                        </Badge>
                        <span className="font-medium">{item.risk}</span>
                      </div>
                      <p className="text-sm text-muted-foreground">
                        <span className="font-medium">Mitigation:</span> {item.mitigation}
                      </p>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Conclusion</CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-muted-foreground whitespace-pre-line">
                  {(content as { conclusion?: string }).conclusion}
                </p>
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      )}

      {/* Footer */}
      <p className="text-xs text-muted-foreground">
        Generated {formatDistanceToNow(new Date(assessment.completed_at || assessment.created_at), { addSuffix: true })}
      </p>
    </div>
  )
}
