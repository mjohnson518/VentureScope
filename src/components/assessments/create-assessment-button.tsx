'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { Plus, Loader2, Sparkles, FileSearch } from 'lucide-react'
import { toast } from 'sonner'

import { Button } from '@/components/ui/button'
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@/components/ui/dialog'
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/components/ui/card'
import { cn } from '@/lib/utils'

interface CreateAssessmentButtonProps {
  companyId: string
  companyName: string
  documentCount: number
}

type AssessmentType = 'screening' | 'full'

export function CreateAssessmentButton({
  companyId,
  companyName,
  documentCount,
}: CreateAssessmentButtonProps) {
  const router = useRouter()
  const [open, setOpen] = useState(false)
  const [selectedType, setSelectedType] = useState<AssessmentType>('screening')
  const [isCreating, setIsCreating] = useState(false)

  const handleCreate = async () => {
    if (documentCount === 0) {
      toast.error('Please upload documents before creating an assessment')
      return
    }

    setIsCreating(true)
    try {
      const response = await fetch('/api/assessments', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          companyId,
          type: selectedType,
        }),
      })

      if (!response.ok) {
        const error = await response.json()
        throw new Error(error.error || 'Failed to create assessment')
      }

      const data = await response.json()
      toast.success('Assessment started')
      setOpen(false)
      router.push(`/dashboard/assessments/${data.id}`)
    } catch (error) {
      console.error('Error creating assessment:', error)
      toast.error(error instanceof Error ? error.message : 'Failed to create assessment')
    } finally {
      setIsCreating(false)
    }
  }

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button disabled={documentCount === 0}>
          <Plus className="mr-2 h-4 w-4" />
          New Assessment
        </Button>
      </DialogTrigger>
      <DialogContent className="sm:max-w-lg">
        <DialogHeader>
          <DialogTitle>Create Assessment</DialogTitle>
          <DialogDescription>
            Generate an AI-powered investment assessment for {companyName}
          </DialogDescription>
        </DialogHeader>

        <div className="grid gap-4 py-4">
          <Card
            className={cn(
              'cursor-pointer transition-all',
              selectedType === 'screening'
                ? 'border-primary ring-1 ring-primary'
                : 'hover:border-muted-foreground/50'
            )}
            onClick={() => setSelectedType('screening')}
          >
            <CardHeader className="pb-2">
              <CardTitle className="text-base flex items-center gap-2">
                <FileSearch className="h-5 w-5 text-blue-500" />
                Screening Assessment
              </CardTitle>
              <CardDescription>Quick initial evaluation</CardDescription>
            </CardHeader>
            <CardContent className="text-sm text-muted-foreground">
              <ul className="space-y-1">
                <li>• Key highlights and red flags</li>
                <li>• Quick scores across dimensions</li>
                <li>• Go/no-go recommendation</li>
              </ul>
            </CardContent>
          </Card>

          <Card
            className={cn(
              'cursor-pointer transition-all',
              selectedType === 'full'
                ? 'border-primary ring-1 ring-primary'
                : 'hover:border-muted-foreground/50'
            )}
            onClick={() => setSelectedType('full')}
          >
            <CardHeader className="pb-2">
              <CardTitle className="text-base flex items-center gap-2">
                <Sparkles className="h-5 w-5 text-purple-500" />
                Full Assessment
              </CardTitle>
              <CardDescription>Comprehensive due diligence memo</CardDescription>
            </CardHeader>
            <CardContent className="text-sm text-muted-foreground">
              <ul className="space-y-1">
                <li>• Detailed analysis across all dimensions</li>
                <li>• Investment thesis with bull/bear cases</li>
                <li>• Risk assessment and key questions</li>
              </ul>
            </CardContent>
          </Card>
        </div>

        <DialogFooter>
          <Button variant="outline" onClick={() => setOpen(false)}>
            Cancel
          </Button>
          <Button onClick={handleCreate} disabled={isCreating}>
            {isCreating ? (
              <>
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                Creating...
              </>
            ) : (
              <>
                <Sparkles className="mr-2 h-4 w-4" />
                Generate Assessment
              </>
            )}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}
