'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import { formatDistanceToNow } from 'date-fns'
import {
  ExternalLink,
  MoreHorizontal,
  Eye,
  Check,
  X,
  Clock,
  Loader2,
  Mail,
  Globe,
  FileText,
} from 'lucide-react'
import { toast } from 'sonner'

import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
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
import type { SubmissionStatus } from '@/types/database'

export interface Submission {
  id: string
  company_name: string
  founder_name: string
  founder_email: string
  website: string | null
  pitch_deck_url: string | null
  stage: string | null
  sector: string | null
  raise_amount: number | null
  description: string | null
  referral_source: string | null
  status: SubmissionStatus
  created_at: string
  company_id: string | null
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

interface SubmissionListProps {
  initialSubmissions: Submission[]
}

export function SubmissionList({ initialSubmissions }: SubmissionListProps) {
  const router = useRouter()
  const [submissions, setSubmissions] = useState<Submission[]>(initialSubmissions)
  const [acceptingId, setAcceptingId] = useState<string | null>(null)
  const [rejectingId, setRejectingId] = useState<string | null>(null)
  const [isLoading, setIsLoading] = useState(false)

  const handleAccept = async () => {
    if (!acceptingId) return

    setIsLoading(true)
    try {
      const response = await fetch(`/api/submissions/${acceptingId}/accept`, {
        method: 'POST',
      })

      if (!response.ok) {
        throw new Error('Failed to accept submission')
      }

      const data = await response.json()

      // Update local state
      setSubmissions((prev) =>
        prev.map((s) =>
          s.id === acceptingId
            ? { ...s, status: 'accepted' as SubmissionStatus, company_id: data.companyId }
            : s
        )
      )

      toast.success('Submission accepted and company created')
      router.refresh()
    } catch {
      toast.error('Failed to accept submission')
    } finally {
      setIsLoading(false)
      setAcceptingId(null)
    }
  }

  const handleReject = async () => {
    if (!rejectingId) return

    setIsLoading(true)
    try {
      const response = await fetch(`/api/submissions/${rejectingId}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ status: 'rejected' }),
      })

      if (!response.ok) {
        throw new Error('Failed to reject submission')
      }

      setSubmissions((prev) =>
        prev.map((s) =>
          s.id === rejectingId ? { ...s, status: 'rejected' as SubmissionStatus } : s
        )
      )

      toast.success('Submission rejected')
      router.refresh()
    } catch {
      toast.error('Failed to reject submission')
    } finally {
      setIsLoading(false)
      setRejectingId(null)
    }
  }

  const updateStatus = async (id: string, status: SubmissionStatus) => {
    try {
      const response = await fetch(`/api/submissions/${id}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ status }),
      })

      if (!response.ok) {
        throw new Error('Failed to update status')
      }

      setSubmissions((prev) =>
        prev.map((s) => (s.id === id ? { ...s, status } : s))
      )

      toast.success('Status updated')
    } catch {
      toast.error('Failed to update status')
    }
  }

  return (
    <>
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
        {submissions.map((submission) => {
          const config = statusConfig[submission.status]
          return (
            <Card key={submission.id} className="group border-border/50 bg-card/80 backdrop-blur-sm">
              <CardHeader className="pb-3">
                <div className="flex items-start justify-between">
                  <div className="space-y-1 min-w-0 flex-1">
                    <CardTitle className="text-lg font-display truncate">
                      {submission.company_name}
                    </CardTitle>
                    <CardDescription className="flex items-center gap-2 flex-wrap">
                      <span className="text-sm">{submission.founder_name}</span>
                      {submission.stage && (
                        <Badge variant="secondary" className="text-xs">
                          {stageLabels[submission.stage] || submission.stage}
                        </Badge>
                      )}
                    </CardDescription>
                  </div>
                  <DropdownMenu>
                    <DropdownMenuTrigger asChild>
                      <Button variant="ghost" size="icon" className="h-8 w-8 shrink-0">
                        <MoreHorizontal className="h-4 w-4" />
                      </Button>
                    </DropdownMenuTrigger>
                    <DropdownMenuContent align="end">
                      <DropdownMenuItem asChild>
                        <Link href={`/dashboard/submissions/${submission.id}`}>
                          <Eye className="mr-2 h-4 w-4" />
                          View Details
                        </Link>
                      </DropdownMenuItem>
                      {submission.company_id && (
                        <DropdownMenuItem asChild>
                          <Link href={`/dashboard/companies/${submission.company_id}`}>
                            <Eye className="mr-2 h-4 w-4" />
                            View Company
                          </Link>
                        </DropdownMenuItem>
                      )}
                      <DropdownMenuSeparator />
                      {submission.status === 'pending' && (
                        <DropdownMenuItem onClick={() => updateStatus(submission.id, 'reviewing')}>
                          <Clock className="mr-2 h-4 w-4" />
                          Mark Reviewing
                        </DropdownMenuItem>
                      )}
                      {submission.status !== 'accepted' && (
                        <DropdownMenuItem onClick={() => setAcceptingId(submission.id)}>
                          <Check className="mr-2 h-4 w-4" />
                          Accept
                        </DropdownMenuItem>
                      )}
                      {submission.status !== 'rejected' && (
                        <DropdownMenuItem
                          className="text-destructive"
                          onClick={() => setRejectingId(submission.id)}
                        >
                          <X className="mr-2 h-4 w-4" />
                          Reject
                        </DropdownMenuItem>
                      )}
                    </DropdownMenuContent>
                  </DropdownMenu>
                </div>
              </CardHeader>
              <CardContent>
                <div className="space-y-3">
                  <div className="flex items-center gap-2 text-sm text-muted-foreground">
                    <Mail className="h-4 w-4" />
                    <a
                      href={`mailto:${submission.founder_email}`}
                      className="hover:text-foreground truncate"
                    >
                      {submission.founder_email}
                    </a>
                  </div>

                  {submission.website && (
                    <div className="flex items-center gap-2 text-sm text-muted-foreground">
                      <Globe className="h-4 w-4" />
                      <a
                        href={submission.website}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="hover:text-foreground truncate flex items-center gap-1"
                      >
                        {submission.website.replace(/^https?:\/\//, '')}
                        <ExternalLink className="h-3 w-3" />
                      </a>
                    </div>
                  )}

                  {submission.pitch_deck_url && (
                    <div className="flex items-center gap-2 text-sm text-muted-foreground">
                      <FileText className="h-4 w-4" />
                      <a
                        href={submission.pitch_deck_url}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="hover:text-foreground flex items-center gap-1"
                      >
                        Pitch Deck
                        <ExternalLink className="h-3 w-3" />
                      </a>
                    </div>
                  )}

                  <div className="flex items-center justify-between pt-2">
                    <div className="flex items-center gap-2">
                      <Badge variant={config.variant}>{config.label}</Badge>
                      {submission.raise_amount && (
                        <span className="text-sm font-medium">
                          {formatCurrency(submission.raise_amount)}
                        </span>
                      )}
                    </div>
                  </div>

                  <p className="text-xs text-muted-foreground">
                    Submitted {formatDistanceToNow(new Date(submission.created_at), { addSuffix: true })}
                  </p>
                </div>
              </CardContent>
            </Card>
          )
        })}
      </div>

      {/* Accept Dialog */}
      <AlertDialog open={!!acceptingId} onOpenChange={() => setAcceptingId(null)}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Accept Submission</AlertDialogTitle>
            <AlertDialogDescription>
              This will create a new company from this submission and mark it as accepted.
              The founder will not be automatically notified.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction onClick={handleAccept} disabled={isLoading}>
              {isLoading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
              Accept & Create Company
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>

      {/* Reject Dialog */}
      <AlertDialog open={!!rejectingId} onOpenChange={() => setRejectingId(null)}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Reject Submission</AlertDialogTitle>
            <AlertDialogDescription>
              Are you sure you want to reject this submission? This action can be undone
              by changing the status later.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction
              onClick={handleReject}
              className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
              disabled={isLoading}
            >
              {isLoading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
              Reject
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </>
  )
}
