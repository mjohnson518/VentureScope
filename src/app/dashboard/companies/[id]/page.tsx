import { Metadata } from 'next'
import { notFound } from 'next/navigation'
import Link from 'next/link'
import {
  ArrowLeft,
  Edit,
  ExternalLink,
  FileText,
  ClipboardCheck,
  Upload,
  Plus,
  Building2,
  Globe,
  DollarSign,
  TrendingUp,
} from 'lucide-react'
import { formatDistanceToNow } from 'date-fns'
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
import { DocumentUploader } from '@/components/documents'
import { CreateAssessmentButton } from '@/components/assessments'

interface CompanyPageProps {
  params: Promise<{ id: string }>
}

const stageLabels: Record<string, string> = {
  pre_seed: 'Pre-Seed',
  seed: 'Seed',
  series_a: 'Series A',
  series_b: 'Series B',
  series_c: 'Series C',
  growth: 'Growth',
}

const statusColors: Record<string, string> = {
  active: 'bg-blue-500',
  watching: 'bg-yellow-500',
  passed: 'bg-gray-500',
  invested: 'bg-green-500',
}

function formatCurrency(value: number): string {
  if (value >= 1_000_000_000) {
    return `$${(value / 1_000_000_000).toFixed(1)}B`
  }
  if (value >= 1_000_000) {
    return `$${(value / 1_000_000).toFixed(1)}M`
  }
  if (value >= 1_000) {
    return `$${(value / 1_000).toFixed(0)}K`
  }
  return `$${value}`
}

export async function generateMetadata({ params }: CompanyPageProps): Promise<Metadata> {
  const { id } = await params
  const session = await auth()
  if (!session?.user?.orgId) {
    return { title: 'Company - VentureScope' }
  }

  const supabase = createAdminClient()
  const { data: company } = await supabase
    .from('companies')
    .select('name')
    .eq('id', id)
    .eq('org_id', session.user.orgId)
    .single()

  return {
    title: company ? `${company.name} - VentureScope` : 'Company - VentureScope',
  }
}

export default async function CompanyPage({ params }: CompanyPageProps) {
  const { id } = await params
  const session = await auth()

  if (!session?.user?.id || !session.user.orgId) {
    notFound()
  }

  const supabase = createAdminClient()
  const { data: company, error } = await supabase
    .from('companies')
    .select(`
      *,
      documents(
        id,
        file_name,
        file_type,
        file_size,
        classification,
        processed_at,
        created_at
      ),
      assessments(
        id,
        type,
        status,
        recommendation,
        overall_score,
        created_at,
        completed_at
      )
    `)
    .eq('id', id)
    .eq('org_id', session.user.orgId)
    .single()

  if (error || !company) {
    notFound()
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-start justify-between">
        <div className="flex items-start gap-4">
          <Button variant="ghost" size="icon" asChild>
            <Link href="/dashboard/companies">
              <ArrowLeft className="h-4 w-4" />
            </Link>
          </Button>
          <div>
            <div className="flex items-center gap-3">
              <h1 className="text-3xl font-bold tracking-tight">{company.name}</h1>
              <div className="flex items-center gap-2">
                <div className={`h-2 w-2 rounded-full ${statusColors[company.status] || 'bg-gray-500'}`} />
                <span className="text-sm capitalize text-muted-foreground">
                  {company.status}
                </span>
              </div>
            </div>
            <div className="flex items-center gap-2 mt-1">
              {company.stage && (
                <Badge variant="secondary">
                  {stageLabels[company.stage] || company.stage}
                </Badge>
              )}
              {company.sector && (
                <span className="text-sm text-muted-foreground">{company.sector}</span>
              )}
            </div>
          </div>
        </div>
        <div className="flex items-center gap-2">
          {company.website && (
            <Button variant="outline" size="sm" asChild>
              <a href={company.website} target="_blank" rel="noopener noreferrer">
                <Globe className="mr-2 h-4 w-4" />
                Website
              </a>
            </Button>
          )}
          <Button variant="outline" size="sm" asChild>
            <Link href={`/dashboard/companies/${id}/edit`}>
              <Edit className="mr-2 h-4 w-4" />
              Edit
            </Link>
          </Button>
        </div>
      </div>

      {/* Overview Cards */}
      <div className="grid gap-4 md:grid-cols-4">
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">
              Raise Amount
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="flex items-center gap-2">
              <DollarSign className="h-4 w-4 text-muted-foreground" />
              <span className="text-2xl font-bold">
                {company.raise_amount ? formatCurrency(company.raise_amount) : '—'}
              </span>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">
              Valuation
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="flex items-center gap-2">
              <TrendingUp className="h-4 w-4 text-muted-foreground" />
              <span className="text-2xl font-bold">
                {company.valuation ? formatCurrency(company.valuation) : '—'}
              </span>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">
              Documents
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="flex items-center gap-2">
              <FileText className="h-4 w-4 text-muted-foreground" />
              <span className="text-2xl font-bold">
                {company.documents?.length || 0}
              </span>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">
              Assessments
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="flex items-center gap-2">
              <ClipboardCheck className="h-4 w-4 text-muted-foreground" />
              <span className="text-2xl font-bold">
                {company.assessments?.length || 0}
              </span>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Description */}
      {company.description && (
        <Card>
          <CardHeader>
            <CardTitle>About</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-muted-foreground">{company.description}</p>
          </CardContent>
        </Card>
      )}

      {/* Tabs for Documents and Assessments */}
      <Tabs defaultValue="documents">
        <TabsList>
          <TabsTrigger value="documents" className="gap-2">
            <FileText className="h-4 w-4" />
            Documents ({company.documents?.length || 0})
          </TabsTrigger>
          <TabsTrigger value="assessments" className="gap-2">
            <ClipboardCheck className="h-4 w-4" />
            Assessments ({company.assessments?.length || 0})
          </TabsTrigger>
        </TabsList>

        <TabsContent value="documents" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Upload Documents</CardTitle>
              <CardDescription>
                Upload deal room documents for analysis
              </CardDescription>
            </CardHeader>
            <CardContent>
              <DocumentUploader companyId={id} />
            </CardContent>
          </Card>

          {company.documents && company.documents.length > 0 && (
            <Card>
              <CardHeader>
                <CardTitle>Document Library</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-2">
                  {company.documents.map((doc: {
                    id: string
                    file_name: string
                    file_type: string
                    file_size: number
                    classification: string | null
                    processed_at: string | null
                    created_at: string
                  }) => (
                    <div
                      key={doc.id}
                      className="flex items-center justify-between p-3 border rounded-lg"
                    >
                      <div className="flex items-center gap-3">
                        <FileText className="h-5 w-5 text-muted-foreground" />
                        <div>
                          <p className="font-medium text-sm">{doc.file_name}</p>
                          <p className="text-xs text-muted-foreground">
                            {doc.classification && (
                              <Badge variant="outline" className="mr-2">
                                {doc.classification.replace('_', ' ')}
                              </Badge>
                            )}
                            {formatDistanceToNow(new Date(doc.created_at), { addSuffix: true })}
                          </p>
                        </div>
                      </div>
                      <Badge variant={doc.processed_at ? 'default' : 'secondary'}>
                        {doc.processed_at ? 'Processed' : 'Processing'}
                      </Badge>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          )}
        </TabsContent>

        <TabsContent value="assessments" className="space-y-4">
          <Card>
            <CardHeader className="flex flex-row items-center justify-between">
              <div>
                <CardTitle>AI Assessments</CardTitle>
                <CardDescription>
                  Generate AI-powered investment memos
                </CardDescription>
              </div>
              <CreateAssessmentButton
                companyId={id}
                companyName={company.name}
                documentCount={company.documents?.length || 0}
              />
            </CardHeader>
            <CardContent>
              {!company.documents || company.documents.length === 0 ? (
                <p className="text-sm text-muted-foreground text-center py-8">
                  Upload documents first to generate assessments
                </p>
              ) : company.assessments && company.assessments.length > 0 ? (
                <div className="space-y-2">
                  {company.assessments.map((assessment: {
                    id: string
                    type: string
                    status: string
                    recommendation: string | null
                    overall_score: number | null
                    created_at: string
                    completed_at: string | null
                  }) => (
                    <Link
                      key={assessment.id}
                      href={`/dashboard/assessments/${assessment.id}`}
                      className="flex items-center justify-between p-3 border rounded-lg hover:bg-muted/50 transition-colors"
                    >
                      <div className="flex items-center gap-3">
                        <ClipboardCheck className="h-5 w-5 text-muted-foreground" />
                        <div>
                          <p className="font-medium text-sm capitalize">
                            {assessment.type} Assessment
                          </p>
                          <p className="text-xs text-muted-foreground">
                            {formatDistanceToNow(new Date(assessment.created_at), { addSuffix: true })}
                          </p>
                        </div>
                      </div>
                      <div className="flex items-center gap-2">
                        {assessment.overall_score && (
                          <span className="font-medium">{assessment.overall_score}/100</span>
                        )}
                        <Badge
                          variant={
                            assessment.status === 'completed'
                              ? 'default'
                              : assessment.status === 'failed'
                                ? 'destructive'
                                : 'secondary'
                          }
                        >
                          {assessment.status}
                        </Badge>
                      </div>
                    </Link>
                  ))}
                </div>
              ) : (
                <p className="text-sm text-muted-foreground text-center py-8">
                  No assessments yet. Create one to analyze this company.
                </p>
              )}
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>

      {/* Metadata footer */}
      <p className="text-xs text-muted-foreground">
        Added {formatDistanceToNow(new Date(company.created_at), { addSuffix: true })}
        {company.updated_at !== company.created_at && (
          <> · Updated {formatDistanceToNow(new Date(company.updated_at), { addSuffix: true })}</>
        )}
      </p>
    </div>
  )
}
