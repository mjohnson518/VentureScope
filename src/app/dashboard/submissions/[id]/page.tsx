import { Metadata } from 'next'
import Link from 'next/link'
import { redirect, notFound } from 'next/navigation'
import { formatDistanceToNow, format } from 'date-fns'
import {
  ArrowLeft,
  Building2,
  Calendar,
  ExternalLink,
  Globe,
  Mail,
  User,
  FileText,
  DollarSign,
  Tag,
  MessageSquare,
} from 'lucide-react'

import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/components/ui/card'
import { auth } from '@/lib/auth/config'
import { createAdminClient } from '@/lib/supabase/admin'
import type { SubmissionStatus } from '@/types/database'
import { SubmissionActions } from './submission-actions'

interface SubmissionDetailPageProps {
  params: Promise<{ id: string }>
}

export async function generateMetadata({ params }: SubmissionDetailPageProps): Promise<Metadata> {
  const { id } = await params
  const supabase = createAdminClient()

  const { data: submission } = await supabase
    .from('deal_submissions')
    .select('company_name')
    .eq('id', id)
    .single()

  return {
    title: submission ? `${submission.company_name} - Submission` : 'Submission - VentureScope',
  }
}

const statusConfig: Record<SubmissionStatus, { label: string; variant: 'default' | 'secondary' | 'outline' | 'destructive' }> = {
  pending: { label: 'Pending', variant: 'outline' },
  reviewing: { label: 'Reviewing', variant: 'secondary' },
  accepted: { label: 'Accepted', variant: 'default' },
  rejected: { label: 'Rejected', variant: 'destructive' },
}

const stageLabels: Record<string, string> = {
  pre_seed: 'Pre-Seed',
  seed: 'Seed',
  series_a: 'Series A',
  series_b: 'Series B',
  series_c: 'Series C+',
  growth: 'Growth',
}

function formatCurrency(value: number): string {
  return new Intl.NumberFormat('en-US', {
    style: 'currency',
    currency: 'USD',
    maximumFractionDigits: 0,
  }).format(value)
}

export default async function SubmissionDetailPage({ params }: SubmissionDetailPageProps) {
  const session = await auth()

  if (!session?.user?.id || !session.user.orgId) {
    redirect('/login')
  }

  const { id } = await params

  const supabase = createAdminClient()
  const { data: submission, error } = await supabase
    .from('deal_submissions')
    .select('*')
    .eq('id', id)
    .eq('org_id', session.user.orgId)
    .single()

  if (error || !submission) {
    notFound()
  }

  const config = statusConfig[submission.status as SubmissionStatus]

  return (
    <div className="space-y-6">
      <div className="flex items-center gap-4">
        <Button variant="ghost" size="icon" asChild>
          <Link href="/dashboard/submissions">
            <ArrowLeft className="h-4 w-4" />
          </Link>
        </Button>
        <div className="flex-1">
          <div className="flex items-center gap-3">
            <h1 className="font-display text-3xl font-bold tracking-tight">
              {submission.company_name}
            </h1>
            <Badge variant={config.variant}>{config.label}</Badge>
          </div>
          <p className="text-muted-foreground">
            Submitted {formatDistanceToNow(new Date(submission.created_at), { addSuffix: true })}
          </p>
        </div>
        <SubmissionActions
          submission={submission}
          isAdmin={session.user.orgRole === 'admin' || session.user.orgRole === 'owner'}
        />
      </div>

      <div className="grid gap-6 md:grid-cols-2">
        <Card>
          <CardHeader>
            <CardTitle className="text-lg">Founder Information</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="flex items-center gap-3">
              <User className="h-4 w-4 text-muted-foreground" />
              <span>{submission.founder_name}</span>
            </div>
            <div className="flex items-center gap-3">
              <Mail className="h-4 w-4 text-muted-foreground" />
              <a
                href={`mailto:${submission.founder_email}`}
                className="text-primary hover:underline"
              >
                {submission.founder_email}
              </a>
            </div>
            {submission.referral_source && (
              <div className="flex items-center gap-3">
                <MessageSquare className="h-4 w-4 text-muted-foreground" />
                <span className="text-muted-foreground">
                  Referral: {submission.referral_source}
                </span>
              </div>
            )}
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="text-lg">Company Details</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            {submission.website && (
              <div className="flex items-center gap-3">
                <Globe className="h-4 w-4 text-muted-foreground" />
                <a
                  href={submission.website}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-primary hover:underline flex items-center gap-1"
                >
                  {submission.website.replace(/^https?:\/\//, '')}
                  <ExternalLink className="h-3 w-3" />
                </a>
              </div>
            )}
            {submission.pitch_deck_url && (
              <div className="flex items-center gap-3">
                <FileText className="h-4 w-4 text-muted-foreground" />
                <a
                  href={submission.pitch_deck_url}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-primary hover:underline flex items-center gap-1"
                >
                  View Pitch Deck
                  <ExternalLink className="h-3 w-3" />
                </a>
              </div>
            )}
            {submission.stage && (
              <div className="flex items-center gap-3">
                <Building2 className="h-4 w-4 text-muted-foreground" />
                <Badge variant="secondary">
                  {stageLabels[submission.stage] || submission.stage}
                </Badge>
              </div>
            )}
            {submission.sector && (
              <div className="flex items-center gap-3">
                <Tag className="h-4 w-4 text-muted-foreground" />
                <span>{submission.sector}</span>
              </div>
            )}
            {submission.raise_amount && (
              <div className="flex items-center gap-3">
                <DollarSign className="h-4 w-4 text-muted-foreground" />
                <span className="font-medium">
                  {formatCurrency(submission.raise_amount)} raise
                </span>
              </div>
            )}
          </CardContent>
        </Card>

        {submission.description && (
          <Card className="md:col-span-2">
            <CardHeader>
              <CardTitle className="text-lg">Description</CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-muted-foreground whitespace-pre-wrap">
                {submission.description}
              </p>
            </CardContent>
          </Card>
        )}

        <Card className="md:col-span-2">
          <CardHeader>
            <CardTitle className="text-lg">Timeline</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              <div className="flex items-center gap-3 text-sm">
                <Calendar className="h-4 w-4 text-muted-foreground" />
                <span>
                  Submitted on {format(new Date(submission.created_at), 'PPP p')}
                </span>
              </div>
              {submission.reviewed_at && (
                <div className="flex items-center gap-3 text-sm">
                  <Calendar className="h-4 w-4 text-muted-foreground" />
                  <span>
                    Reviewed on {format(new Date(submission.reviewed_at), 'PPP p')}
                  </span>
                </div>
              )}
              {submission.company_id && (
                <div className="flex items-center gap-3 text-sm">
                  <Building2 className="h-4 w-4 text-green-500" />
                  <span>
                    Company created:{' '}
                    <Link
                      href={`/dashboard/companies/${submission.company_id}`}
                      className="text-primary hover:underline"
                    >
                      View Company
                    </Link>
                  </span>
                </div>
              )}
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}
