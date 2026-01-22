'use client'

import { memo } from 'react'
import { cn } from '@/lib/utils'
import { User, Bot, FileText } from 'lucide-react'
import { Badge } from '@/components/ui/badge'
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from '@/components/ui/tooltip'

interface Citation {
  source: string
  text: string
}

interface ChatMessageProps {
  role: 'user' | 'assistant'
  content: string
  citations?: Citation[]
  timestamp?: string
}

export const ChatMessage = memo(function ChatMessage({ role, content, citations, timestamp }: ChatMessageProps) {
  const isUser = role === 'user'

  return (
    <div
      className={cn(
        'flex gap-3 p-4 rounded-lg',
        isUser ? 'bg-muted/50' : 'bg-background'
      )}
    >
      <div
        className={cn(
          'h-8 w-8 rounded-full flex items-center justify-center shrink-0',
          isUser ? 'bg-primary text-primary-foreground' : 'bg-purple-100 text-purple-600'
        )}
      >
        {isUser ? <User className="h-4 w-4" /> : <Bot className="h-4 w-4" />}
      </div>

      <div className="flex-1 space-y-2 overflow-hidden">
        <div className="flex items-center gap-2">
          <span className="font-medium text-sm">
            {isUser ? 'You' : 'AI Assistant'}
          </span>
          {timestamp && (
            <span className="text-xs text-muted-foreground">{timestamp}</span>
          )}
        </div>

        <div className="prose prose-sm dark:prose-invert max-w-none">
          <p className="whitespace-pre-wrap">{content}</p>
        </div>

        {citations && citations.length > 0 && (
          <div className="flex flex-wrap gap-2 pt-2 border-t mt-3">
            <span className="text-xs text-muted-foreground">Sources:</span>
            {citations.map((citation, index) => (
              <TooltipProvider key={index}>
                <Tooltip>
                  <TooltipTrigger asChild>
                    <Badge
                      variant="secondary"
                      className="cursor-help text-xs gap-1"
                    >
                      <FileText className="h-3 w-3" />
                      {citation.source}
                    </Badge>
                  </TooltipTrigger>
                  <TooltipContent side="top" className="max-w-sm">
                    <p className="text-xs">&quot;{citation.text}&quot;</p>
                  </TooltipContent>
                </Tooltip>
              </TooltipProvider>
            ))}
          </div>
        )}
      </div>
    </div>
  )
})
