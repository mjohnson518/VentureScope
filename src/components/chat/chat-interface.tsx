'use client'

import { memo, useCallback, useEffect, useRef, useState } from 'react'
import { formatDistanceToNow } from 'date-fns'
import { MessageSquare, Plus, Loader2 } from 'lucide-react'
import { toast } from 'sonner'

import { Button } from '@/components/ui/button'
import { ScrollArea } from '@/components/ui/scroll-area'
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/components/ui/card'
import { ChatMessage } from './chat-message'
import { ChatInput } from './chat-input'

interface Message {
  id: string
  role: 'user' | 'assistant'
  content: string
  citations: Array<{ source: string; text: string }>
  created_at: string
}

interface Thread {
  id: string
  title: string
  created_at: string
  updated_at: string
  messageCount: number
}

interface ChatInterfaceProps {
  companyId: string
  companyName: string
}

export function ChatInterface({ companyId, companyName }: ChatInterfaceProps) {
  const [threads, setThreads] = useState<Thread[]>([])
  const [currentThreadId, setCurrentThreadId] = useState<string | null>(null)
  const [messages, setMessages] = useState<Message[]>([])
  const [isLoading, setIsLoading] = useState(false)
  const [isSending, setIsSending] = useState(false)
  const scrollRef = useRef<HTMLDivElement>(null)

  // Define callbacks first (before useEffects that use them)
  const fetchThreads = useCallback(async () => {
    try {
      const response = await fetch(`/api/chat?companyId=${companyId}`)
      if (!response.ok) throw new Error('Failed to fetch threads')
      const data = await response.json()
      setThreads(data)

      // Auto-select first thread if exists
      if (data.length > 0) {
        setCurrentThreadId((prev) => prev || data[0].id)
      }
    } catch (error) {
      console.error('Error fetching threads:', error)
    }
  }, [companyId])

  const fetchMessages = useCallback(async (threadId: string) => {
    setIsLoading(true)
    try {
      const response = await fetch(`/api/chat/${threadId}/messages`)
      if (!response.ok) throw new Error('Failed to fetch messages')
      const data = await response.json()
      setMessages(data)
    } catch (error) {
      console.error('Error fetching messages:', error)
      toast.error('Failed to load messages')
    } finally {
      setIsLoading(false)
    }
  }, [])

  const createThread = useCallback(async () => {
    try {
      const response = await fetch('/api/chat', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ companyId }),
      })
      if (!response.ok) throw new Error('Failed to create thread')
      const thread = await response.json()
      setThreads((prev) => [thread, ...prev])
      setCurrentThreadId(thread.id)
      setMessages([])
    } catch (error) {
      console.error('Error creating thread:', error)
      toast.error('Failed to create chat')
    }
  }, [companyId])

  const sendMessageToThread = useCallback(async (threadId: string, content: string) => {
    setIsSending(true)

    // Optimistically add user message
    const tempId = `temp-${Date.now()}`
    const tempUserMessage: Message = {
      id: tempId,
      role: 'user',
      content,
      citations: [],
      created_at: new Date().toISOString(),
    }
    setMessages((prev) => [...prev, tempUserMessage])

    try {
      const response = await fetch(`/api/chat/${threadId}/messages`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ content }),
      })

      if (!response.ok) throw new Error('Failed to send message')

      const data = await response.json()

      // Replace temp message and add AI response
      setMessages((prev) => [
        ...prev.filter((m) => m.id !== tempId),
        data.userMessage,
        data.assistantMessage,
      ])

      // Update thread in list
      setThreads((prev) =>
        prev.map((t) =>
          t.id === threadId
            ? { ...t, updated_at: new Date().toISOString(), messageCount: t.messageCount + 2 }
            : t
        )
      )
    } catch (error) {
      console.error('Error sending message:', error)
      toast.error('Failed to send message')
      // Remove optimistic message
      setMessages((prev) => prev.filter((m) => m.id !== tempId))
    } finally {
      setIsSending(false)
    }
  }, [])

  const sendMessage = useCallback(async (content: string) => {
    if (!currentThreadId) {
      // Create a thread first if none exists
      try {
        const response = await fetch('/api/chat', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ companyId }),
        })
        if (!response.ok) throw new Error('Failed to create thread')
        const thread = await response.json()
        setThreads((prev) => [thread, ...prev])
        setCurrentThreadId(thread.id)

        // Now send the message to the new thread
        await sendMessageToThread(thread.id, content)
      } catch (error) {
        console.error('Error creating thread:', error)
        toast.error('Failed to start chat')
      }
      return
    }

    await sendMessageToThread(currentThreadId, content)
  }, [companyId, currentThreadId, sendMessageToThread])

  // useEffect hooks (after all useCallback declarations)
  useEffect(() => {
    fetchThreads()
  }, [fetchThreads])

  useEffect(() => {
    if (currentThreadId) {
      fetchMessages(currentThreadId)
    } else {
      setMessages([])
    }
  }, [currentThreadId, fetchMessages])

  useEffect(() => {
    if (scrollRef.current) {
      scrollRef.current.scrollTop = scrollRef.current.scrollHeight
    }
  }, [messages])

  return (
    <Card className="h-[600px] flex flex-col">
      <CardHeader className="pb-3 border-b">
        <div className="flex items-center justify-between">
          <div>
            <CardTitle className="flex items-center gap-2">
              <MessageSquare className="h-5 w-5" />
              Ask AI about {companyName}
            </CardTitle>
            <CardDescription>
              Get answers based on uploaded documents and assessments
            </CardDescription>
          </div>
          <Button variant="outline" size="sm" onClick={createThread}>
            <Plus className="h-4 w-4 mr-1" />
            New Chat
          </Button>
        </div>

        {threads.length > 1 && (
          <div className="flex gap-2 mt-3 overflow-x-auto pb-1">
            {threads.slice(0, 5).map((thread) => (
              <Button
                key={thread.id}
                variant={currentThreadId === thread.id ? 'default' : 'outline'}
                size="sm"
                className="shrink-0"
                onClick={() => setCurrentThreadId(thread.id)}
              >
                {thread.title?.slice(0, 20) || 'Chat'}
                {thread.title && thread.title.length > 20 && '...'}
              </Button>
            ))}
          </div>
        )}
      </CardHeader>

      <CardContent className="flex-1 flex flex-col p-0 overflow-hidden">
        <ScrollArea className="flex-1 p-4" ref={scrollRef}>
          {isLoading ? (
            <div className="flex items-center justify-center h-full">
              <Loader2 className="h-6 w-6 animate-spin text-muted-foreground" />
            </div>
          ) : messages.length === 0 ? (
            <div className="flex flex-col items-center justify-center h-full text-center p-4">
              <MessageSquare className="h-12 w-12 text-muted-foreground/50 mb-4" />
              <p className="text-muted-foreground mb-2">No messages yet</p>
              <p className="text-sm text-muted-foreground">
                Ask questions about {companyName} based on the uploaded documents
              </p>
              <div className="flex flex-wrap gap-2 mt-4 justify-center">
                <SuggestionChip
                  text="Summarize the pitch deck"
                  onClick={() => sendMessage('Can you summarize the main points from the pitch deck?')}
                  disabled={isSending}
                />
                <SuggestionChip
                  text="Key risks?"
                  onClick={() => sendMessage('What are the key risks for this investment?')}
                  disabled={isSending}
                />
                <SuggestionChip
                  text="Team background"
                  onClick={() => sendMessage('What is the background of the founding team?')}
                  disabled={isSending}
                />
              </div>
            </div>
          ) : (
            <div className="space-y-4">
              {messages.map((message) => (
                <ChatMessage
                  key={message.id}
                  role={message.role}
                  content={message.content}
                  citations={message.citations}
                  timestamp={formatDistanceToNow(new Date(message.created_at), { addSuffix: true })}
                />
              ))}
              {isSending && (
                <div className="flex items-center gap-2 text-muted-foreground p-4">
                  <Loader2 className="h-4 w-4 animate-spin" />
                  <span className="text-sm">AI is thinking...</span>
                </div>
              )}
            </div>
          )}
        </ScrollArea>

        <div className="p-4 border-t">
          <ChatInput
            onSend={sendMessage}
            isLoading={isSending}
            placeholder={`Ask about ${companyName}...`}
          />
        </div>
      </CardContent>
    </Card>
  )
}

const SuggestionChip = memo(function SuggestionChip({
  text,
  onClick,
  disabled,
}: {
  text: string
  onClick: () => void
  disabled?: boolean
}) {
  return (
    <button
      onClick={onClick}
      disabled={disabled}
      className="px-3 py-1.5 text-sm bg-muted hover:bg-muted/80 rounded-full transition-colors disabled:opacity-50"
    >
      {text}
    </button>
  )
})
