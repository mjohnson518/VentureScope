'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { Check, X, Clock, Loader2 } from 'lucide-react'
import { toast } from 'sonner'

import { Button } from '@/components/ui/button'
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
import type { DealSubmission } from '@/types/database'

interface SubmissionActionsProps {
  submission: DealSubmission
  isAdmin: boolean
}

export function SubmissionActions({ submission, isAdmin }: SubmissionActionsProps) {
  const router = useRouter()
  const [isLoading, setIsLoading] = useState(false)
  const [showAcceptDialog, setShowAcceptDialog] = useState(false)
  const [showRejectDialog, setShowRejectDialog] = useState(false)

  const handleAccept = async () => {
    setIsLoading(true)
    try {
      const response = await fetch(`/api/submissions/${submission.id}/accept`, {
        method: 'POST',
      })

      if (!response.ok) {
        const data = await response.json()
        throw new Error(data.error || 'Failed to accept submission')
      }

      const data = await response.json()
      toast.success('Submission accepted and company created')
      router.push(`/dashboard/companies/${data.companyId}`)
    } catch (error) {
      toast.error(error instanceof Error ? error.message : 'Failed to accept submission')
    } finally {
      setIsLoading(false)
      setShowAcceptDialog(false)
    }
  }

  const handleReject = async () => {
    setIsLoading(true)
    try {
      const response = await fetch(`/api/submissions/${submission.id}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ status: 'rejected' }),
      })

      if (!response.ok) {
        throw new Error('Failed to reject submission')
      }

      toast.success('Submission rejected')
      router.refresh()
    } catch {
      toast.error('Failed to reject submission')
    } finally {
      setIsLoading(false)
      setShowRejectDialog(false)
    }
  }

  const handleMarkReviewing = async () => {
    setIsLoading(true)
    try {
      const response = await fetch(`/api/submissions/${submission.id}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ status: 'reviewing' }),
      })

      if (!response.ok) {
        throw new Error('Failed to update status')
      }

      toast.success('Status updated')
      router.refresh()
    } catch {
      toast.error('Failed to update status')
    } finally {
      setIsLoading(false)
    }
  }

  if (!isAdmin) {
    return null
  }

  return (
    <>
      <div className="flex items-center gap-2">
        {submission.status === 'pending' && (
          <Button
            variant="outline"
            size="sm"
            onClick={handleMarkReviewing}
            disabled={isLoading}
          >
            <Clock className="mr-2 h-4 w-4" />
            Mark Reviewing
          </Button>
        )}
        {submission.status !== 'accepted' && (
          <Button
            size="sm"
            onClick={() => setShowAcceptDialog(true)}
            disabled={isLoading}
          >
            <Check className="mr-2 h-4 w-4" />
            Accept
          </Button>
        )}
        {submission.status !== 'rejected' && (
          <Button
            variant="destructive"
            size="sm"
            onClick={() => setShowRejectDialog(true)}
            disabled={isLoading}
          >
            <X className="mr-2 h-4 w-4" />
            Reject
          </Button>
        )}
      </div>

      <AlertDialog open={showAcceptDialog} onOpenChange={setShowAcceptDialog}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Accept Submission</AlertDialogTitle>
            <AlertDialogDescription>
              This will create a new company from this submission with the name
              &quot;{submission.company_name}&quot;. The founder will not be automatically
              notified.
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

      <AlertDialog open={showRejectDialog} onOpenChange={setShowRejectDialog}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Reject Submission</AlertDialogTitle>
            <AlertDialogDescription>
              Are you sure you want to reject this submission? This action can be
              undone by changing the status later.
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
