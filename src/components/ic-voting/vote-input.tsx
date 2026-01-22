'use client'

import { useState } from 'react'
import { ThumbsUp, ThumbsDown, Minus, Loader2 } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Textarea } from '@/components/ui/textarea'
import { cn } from '@/lib/utils'
import type { ICVote } from '@/types/database'

interface VoteInputProps {
  onSubmit: (vote: ICVote, comment?: string) => Promise<void>
  currentVote?: ICVote | null
  currentComment?: string | null
  disabled?: boolean
}

const voteOptions: Array<{
  value: ICVote
  label: string
  icon: React.ReactNode
  color: string
}> = [
  {
    value: 'strong_yes',
    label: 'Strong Yes',
    icon: <ThumbsUp className="h-5 w-5 fill-current" />,
    color: 'bg-green-500 hover:bg-green-600 text-white',
  },
  {
    value: 'yes',
    label: 'Yes',
    icon: <ThumbsUp className="h-5 w-5" />,
    color: 'bg-green-100 hover:bg-green-200 text-green-700 dark:bg-green-900/30 dark:text-green-400',
  },
  {
    value: 'neutral',
    label: 'Neutral',
    icon: <Minus className="h-5 w-5" />,
    color: 'bg-gray-100 hover:bg-gray-200 text-gray-700 dark:bg-gray-800 dark:text-gray-300',
  },
  {
    value: 'no',
    label: 'No',
    icon: <ThumbsDown className="h-5 w-5" />,
    color: 'bg-red-100 hover:bg-red-200 text-red-700 dark:bg-red-900/30 dark:text-red-400',
  },
  {
    value: 'strong_no',
    label: 'Strong No',
    icon: <ThumbsDown className="h-5 w-5 fill-current" />,
    color: 'bg-red-500 hover:bg-red-600 text-white',
  },
]

export function VoteInput({ onSubmit, currentVote, currentComment, disabled }: VoteInputProps) {
  const [selectedVote, setSelectedVote] = useState<ICVote | null>(currentVote || null)
  const [comment, setComment] = useState(currentComment || '')
  const [isSubmitting, setIsSubmitting] = useState(false)

  const handleSubmit = async () => {
    if (!selectedVote) return

    setIsSubmitting(true)
    try {
      await onSubmit(selectedVote, comment || undefined)
    } finally {
      setIsSubmitting(false)
    }
  }

  return (
    <div className="space-y-4">
      <div className="flex flex-wrap gap-2 justify-center">
        {voteOptions.map((option) => (
          <Button
            key={option.value}
            variant="outline"
            className={cn(
              'flex-col h-auto py-3 px-4 gap-1',
              selectedVote === option.value && option.color,
              selectedVote === option.value && 'ring-2 ring-offset-2 ring-primary'
            )}
            onClick={() => setSelectedVote(option.value)}
            disabled={disabled || isSubmitting}
          >
            {option.icon}
            <span className="text-xs">{option.label}</span>
          </Button>
        ))}
      </div>

      <Textarea
        placeholder="Add a comment (optional)..."
        value={comment}
        onChange={(e) => setComment(e.target.value)}
        className="min-h-[80px]"
        disabled={disabled || isSubmitting}
      />

      <Button
        onClick={handleSubmit}
        disabled={!selectedVote || disabled || isSubmitting}
        className="w-full"
      >
        {isSubmitting && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
        {currentVote ? 'Update Vote' : 'Submit Vote'}
      </Button>
    </div>
  )
}
