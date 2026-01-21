'use client'

import { useEffect, useState } from 'react'
import Link from 'next/link'
import { formatDistanceToNow } from 'date-fns'
import {
  ClipboardCheck,
  MoreHorizontal,
  Trash2,
  Eye,
  Loader2,
  Building2,
  Clock,
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

interface Assessment {
  id: string
  company_id: string
  type: 'screening' | 'full'
  status: 'pending' | 'processing' | 'completed' | 'failed'
  recommendation: string | null
  overall_score: number | null
  processing_time_ms: number | null
  created_at: string
  completed_at: string | null
  companies: {
    id: string
    name: string
  }
}

const recommendationConfig: Record<string, { label: string; variant: 'default' | 'secondary' | 'destructive' | 'outline' }> = {
  strong_conviction: { label: 'Strong Conviction', variant: 'default' },
  proceed: { label: 'Proceed', variant: 'secondary' },
  conditional: { label: 'Conditional', variant: 'outline' },
  pass: { label: 'Pass', variant: 'destructive' },
}

const statusConfig: Record<string, { label: string; variant: 'default' | 'secondary' | 'destructive' | 'outline' }> = {
  pending: { label: 'Pending', variant: 'outline' },
  processing: { label: 'Processing', variant: 'secondary' },
  completed: { label: 'Completed', variant: 'default' },
  failed: { label: 'Failed', variant: 'destructive' },
}

interface AssessmentListProps {
  companyId?: string
}

export function AssessmentList({ companyId }: AssessmentListProps) {
  const [assessments, setAssessments] = useState<Assessment[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [deleteId, setDeleteId] = useState<string | null>(null)
  const [isDeleting, setIsDeleting] = useState(false)

  const fetchAssessments = async () => {
    setIsLoading(true)
    try {
      const url = companyId
        ? `/api/assessments?companyId=${companyId}`
        : '/api/assessments'
      const response = await fetch(url)
      if (!response.ok) throw new Error('Failed to fetch assessments')

      const data = await response.json()
      setAssessments(data)
    } catch (error) {
      console.error('Error fetching assessments:', error)
      toast.error('Failed to load assessments')
    } finally {
      setIsLoading(false)
    }
  }

  useEffect(() => {
    fetchAssessments()

    // Poll for processing assessments
    const interval = setInterval(() => {
      const hasProcessing = assessments.some((a) => a.status === 'processing')
      if (hasProcessing) {
        fetchAssessments()
      }
    }, 5000)

    return () => clearInterval(interval)
  }, [companyId])

  const handleDelete = async () => {
    if (!deleteId) return

    setIsDeleting(true)
    try {
      const response = await fetch(`/api/assessments/${deleteId}`, {
        method: 'DELETE',
      })

      if (!response.ok) throw new Error('Failed to delete assessment')

      setAssessments((prev) => prev.filter((a) => a.id !== deleteId))
      toast.success('Assessment deleted')
    } catch (error) {
      console.error('Error deleting assessment:', error)
      toast.error('Failed to delete assessment')
    } finally {
      setIsDeleting(false)
      setDeleteId(null)
    }
  }

  if (isLoading) {
    return (
      <div className="flex items-center justify-center py-12">
        <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
      </div>
    )
  }

  if (assessments.length === 0) {
    return (
      <div className="text-center py-12 text-muted-foreground">
        <ClipboardCheck className="h-12 w-12 mx-auto mb-4 opacity-50" />
        <p>No assessments yet</p>
      </div>
    )
  }

  return (
    <>
      <div className="space-y-4">
        {assessments.map((assessment) => (
          <Card key={assessment.id} className="hover:shadow-md transition-shadow">
            <CardHeader className="pb-2">
              <div className="flex items-start justify-between">
                <div>
                  <CardTitle className="text-lg flex items-center gap-2">
                    <Link
                      href={`/dashboard/assessments/${assessment.id}`}
                      className="hover:underline"
                    >
                      {assessment.type === 'full' ? 'Full Assessment' : 'Screening'}
                    </Link>
                    <Badge variant={statusConfig[assessment.status]?.variant || 'outline'}>
                      {assessment.status === 'processing' && (
                        <Loader2 className="mr-1 h-3 w-3 animate-spin" />
                      )}
                      {statusConfig[assessment.status]?.label || assessment.status}
                    </Badge>
                  </CardTitle>
                  <CardDescription className="flex items-center gap-2 mt-1">
                    <Link
                      href={`/dashboard/companies/${assessment.company_id}`}
                      className="flex items-center gap-1 hover:underline"
                    >
                      <Building2 className="h-3 w-3" />
                      {assessment.companies.name}
                    </Link>
                  </CardDescription>
                </div>
                <DropdownMenu>
                  <DropdownMenuTrigger asChild>
                    <Button variant="ghost" size="icon" className="h-8 w-8">
                      <MoreHorizontal className="h-4 w-4" />
                    </Button>
                  </DropdownMenuTrigger>
                  <DropdownMenuContent align="end">
                    <DropdownMenuItem asChild>
                      <Link href={`/dashboard/assessments/${assessment.id}`}>
                        <Eye className="mr-2 h-4 w-4" />
                        View Details
                      </Link>
                    </DropdownMenuItem>
                    <DropdownMenuSeparator />
                    <DropdownMenuItem
                      className="text-destructive"
                      onClick={() => setDeleteId(assessment.id)}
                    >
                      <Trash2 className="mr-2 h-4 w-4" />
                      Delete
                    </DropdownMenuItem>
                  </DropdownMenuContent>
                </DropdownMenu>
              </div>
            </CardHeader>
            <CardContent>
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-4">
                  {assessment.status === 'completed' && assessment.overall_score !== null && (
                    <div className="text-center">
                      <span className="text-2xl font-bold">{assessment.overall_score}</span>
                      <p className="text-xs text-muted-foreground">Score</p>
                    </div>
                  )}
                  {assessment.status === 'completed' && assessment.recommendation && (
                    <Badge
                      variant={recommendationConfig[assessment.recommendation]?.variant || 'outline'}
                    >
                      {recommendationConfig[assessment.recommendation]?.label || assessment.recommendation}
                    </Badge>
                  )}
                </div>
                <div className="flex items-center gap-2 text-xs text-muted-foreground">
                  <Clock className="h-3 w-3" />
                  {formatDistanceToNow(new Date(assessment.created_at), { addSuffix: true })}
                  {assessment.processing_time_ms && (
                    <span>· {(assessment.processing_time_ms / 1000).toFixed(1)}s</span>
                  )}
                </div>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      <AlertDialog open={!!deleteId} onOpenChange={() => setDeleteId(null)}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Delete Assessment</AlertDialogTitle>
            <AlertDialogDescription>
              Are you sure you want to delete this assessment? This action cannot
              be undone.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction
              onClick={handleDelete}
              className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
              disabled={isDeleting}
            >
              {isDeleting && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
              Delete
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </>
  )
}
