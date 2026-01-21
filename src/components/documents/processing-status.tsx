'use client'

import { useEffect, useState } from 'react'
import { CheckCircle, Loader2, AlertCircle, FileText } from 'lucide-react'
import { cn } from '@/lib/utils'
import { Badge } from '@/components/ui/badge'

type ProcessingStep = 'uploading' | 'extracting' | 'classifying' | 'complete' | 'error'

interface ProcessingStatusProps {
  documentId: string
  fileName: string
  onComplete?: () => void
}

const steps: { key: ProcessingStep; label: string }[] = [
  { key: 'uploading', label: 'Uploading' },
  { key: 'extracting', label: 'Extracting text' },
  { key: 'classifying', label: 'Classifying' },
  { key: 'complete', label: 'Complete' },
]

export function ProcessingStatus({
  documentId,
  fileName,
  onComplete,
}: ProcessingStatusProps) {
  const [currentStep, setCurrentStep] = useState<ProcessingStep>('uploading')
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    // Poll for status updates
    const pollStatus = async () => {
      try {
        const response = await fetch(`/api/documents/${documentId}`)
        if (!response.ok) throw new Error('Failed to fetch status')

        const data = await response.json()

        if (data.processed_at) {
          setCurrentStep('complete')
          onComplete?.()
        } else if (data.error_message) {
          setCurrentStep('error')
          setError(data.error_message)
        } else if (data.extracted_text) {
          setCurrentStep('classifying')
        } else {
          setCurrentStep('extracting')
        }
      } catch (err) {
        console.error('Error polling status:', err)
      }
    }

    const interval = setInterval(pollStatus, 2000)
    pollStatus() // Initial poll

    return () => clearInterval(interval)
  }, [documentId, onComplete])

  const getStepIndex = (step: ProcessingStep) => {
    if (step === 'error') return -1
    return steps.findIndex((s) => s.key === step)
  }

  const currentIndex = getStepIndex(currentStep)

  if (error) {
    return (
      <div className="flex items-center gap-3 p-4 border rounded-lg bg-destructive/10">
        <AlertCircle className="h-5 w-5 text-destructive shrink-0" />
        <div className="flex-1 min-w-0">
          <p className="text-sm font-medium truncate">{fileName}</p>
          <p className="text-xs text-destructive">{error}</p>
        </div>
        <Badge variant="destructive">Failed</Badge>
      </div>
    )
  }

  return (
    <div className="p-4 border rounded-lg">
      <div className="flex items-center gap-3 mb-4">
        <FileText className="h-5 w-5 text-muted-foreground shrink-0" />
        <p className="text-sm font-medium truncate flex-1">{fileName}</p>
        {currentStep === 'complete' ? (
          <Badge variant="default" className="bg-green-500">Complete</Badge>
        ) : (
          <Badge variant="secondary">Processing</Badge>
        )}
      </div>

      <div className="flex items-center gap-2">
        {steps.map((step, index) => {
          const isActive = index === currentIndex
          const isComplete = index < currentIndex
          const isPending = index > currentIndex

          return (
            <div key={step.key} className="flex-1">
              <div className="flex items-center gap-2">
                <div
                  className={cn(
                    'h-6 w-6 rounded-full flex items-center justify-center text-xs',
                    isComplete && 'bg-green-500 text-white',
                    isActive && 'bg-primary text-primary-foreground',
                    isPending && 'bg-muted text-muted-foreground'
                  )}
                >
                  {isComplete ? (
                    <CheckCircle className="h-4 w-4" />
                  ) : isActive ? (
                    <Loader2 className="h-4 w-4 animate-spin" />
                  ) : (
                    index + 1
                  )}
                </div>
                {index < steps.length - 1 && (
                  <div
                    className={cn(
                      'flex-1 h-0.5',
                      isComplete ? 'bg-green-500' : 'bg-muted'
                    )}
                  />
                )}
              </div>
              <p
                className={cn(
                  'text-xs mt-1',
                  isActive ? 'text-primary font-medium' : 'text-muted-foreground'
                )}
              >
                {step.label}
              </p>
            </div>
          )
        })}
      </div>
    </div>
  )
}
