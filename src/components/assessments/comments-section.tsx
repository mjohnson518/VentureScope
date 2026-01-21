'use client'

import { useState, useEffect } from 'react'
import { formatDistanceToNow } from 'date-fns'
import { MessageSquare, Reply, Trash2, Loader2, Send } from 'lucide-react'
import { toast } from 'sonner'

import { Button } from '@/components/ui/button'
import { Textarea } from '@/components/ui/textarea'
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar'
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/components/ui/card'

interface User {
  id: string
  email: string
  name: string | null
  avatar_url: string | null
}

interface Comment {
  id: string
  content: string
  parent_id: string | null
  created_at: string
  updated_at: string
  user_id: string
  users: User
  replies?: Comment[]
}

interface CommentsSectionProps {
  assessmentId: string
  currentUserId: string
}

export function CommentsSection({ assessmentId, currentUserId }: CommentsSectionProps) {
  const [comments, setComments] = useState<Comment[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [newComment, setNewComment] = useState('')
  const [isSending, setIsSending] = useState(false)
  const [replyingTo, setReplyingTo] = useState<string | null>(null)
  const [replyContent, setReplyContent] = useState('')

  useEffect(() => {
    fetchComments()
  }, [assessmentId])

  const fetchComments = async () => {
    setIsLoading(true)
    try {
      const response = await fetch(`/api/assessments/${assessmentId}/comments`)
      if (!response.ok) throw new Error('Failed to fetch comments')
      const data = await response.json()
      setComments(data)
    } catch (error) {
      console.error('Error fetching comments:', error)
    } finally {
      setIsLoading(false)
    }
  }

  const handleSubmitComment = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!newComment.trim()) return

    setIsSending(true)
    try {
      const response = await fetch(`/api/assessments/${assessmentId}/comments`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ content: newComment }),
      })

      if (!response.ok) throw new Error('Failed to post comment')

      const comment = await response.json()
      setComments((prev) => [...prev, comment])
      setNewComment('')
      toast.success('Comment added')
    } catch (error) {
      toast.error('Failed to post comment')
    } finally {
      setIsSending(false)
    }
  }

  const handleSubmitReply = async (parentId: string) => {
    if (!replyContent.trim()) return

    setIsSending(true)
    try {
      const response = await fetch(`/api/assessments/${assessmentId}/comments`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ content: replyContent, parentId }),
      })

      if (!response.ok) throw new Error('Failed to post reply')

      const reply = await response.json()

      // Add reply to parent comment
      setComments((prev) =>
        prev.map((c) =>
          c.id === parentId
            ? { ...c, replies: [...(c.replies || []), reply] }
            : c
        )
      )

      setReplyContent('')
      setReplyingTo(null)
      toast.success('Reply added')
    } catch (error) {
      toast.error('Failed to post reply')
    } finally {
      setIsSending(false)
    }
  }

  const handleDeleteComment = async (commentId: string) => {
    try {
      const response = await fetch(
        `/api/assessments/${assessmentId}/comments?commentId=${commentId}`,
        { method: 'DELETE' }
      )

      if (!response.ok) throw new Error('Failed to delete comment')

      // Remove from state
      setComments((prev) => {
        const removeComment = (comments: Comment[]): Comment[] => {
          return comments
            .filter((c) => c.id !== commentId)
            .map((c) => ({
              ...c,
              replies: c.replies ? removeComment(c.replies) : [],
            }))
        }
        return removeComment(prev)
      })

      toast.success('Comment deleted')
    } catch (error) {
      toast.error('Failed to delete comment')
    }
  }

  const getInitials = (user: User) => {
    if (user.name) {
      return user.name
        .split(' ')
        .map((n) => n[0])
        .join('')
        .toUpperCase()
        .slice(0, 2)
    }
    return user.email.slice(0, 2).toUpperCase()
  }

  const CommentItem = ({
    comment,
    depth = 0,
  }: {
    comment: Comment
    depth?: number
  }) => (
    <div className={depth > 0 ? 'ml-10 mt-3' : ''}>
      <div className="flex gap-3">
        <Avatar className="h-8 w-8">
          <AvatarImage src={comment.users.avatar_url || undefined} />
          <AvatarFallback className="text-xs">
            {getInitials(comment.users)}
          </AvatarFallback>
        </Avatar>

        <div className="flex-1 space-y-1">
          <div className="flex items-center gap-2">
            <span className="text-sm font-medium">
              {comment.users.name || comment.users.email}
            </span>
            <span className="text-xs text-muted-foreground">
              {formatDistanceToNow(new Date(comment.created_at), { addSuffix: true })}
            </span>
          </div>

          <p className="text-sm text-muted-foreground whitespace-pre-wrap">
            {comment.content}
          </p>

          <div className="flex items-center gap-2 pt-1">
            {depth === 0 && (
              <Button
                variant="ghost"
                size="sm"
                className="h-7 text-xs"
                onClick={() => {
                  setReplyingTo(replyingTo === comment.id ? null : comment.id)
                  setReplyContent('')
                }}
              >
                <Reply className="h-3 w-3 mr-1" />
                Reply
              </Button>
            )}
            {comment.user_id === currentUserId && (
              <Button
                variant="ghost"
                size="sm"
                className="h-7 text-xs text-destructive"
                onClick={() => handleDeleteComment(comment.id)}
              >
                <Trash2 className="h-3 w-3 mr-1" />
                Delete
              </Button>
            )}
          </div>

          {replyingTo === comment.id && (
            <div className="flex gap-2 mt-2">
              <Textarea
                value={replyContent}
                onChange={(e) => setReplyContent(e.target.value)}
                placeholder="Write a reply..."
                className="min-h-[60px] text-sm"
              />
              <div className="flex flex-col gap-1">
                <Button
                  size="sm"
                  onClick={() => handleSubmitReply(comment.id)}
                  disabled={!replyContent.trim() || isSending}
                >
                  {isSending ? (
                    <Loader2 className="h-4 w-4 animate-spin" />
                  ) : (
                    <Send className="h-4 w-4" />
                  )}
                </Button>
                <Button
                  size="sm"
                  variant="ghost"
                  onClick={() => setReplyingTo(null)}
                >
                  Cancel
                </Button>
              </div>
            </div>
          )}
        </div>
      </div>

      {comment.replies && comment.replies.length > 0 && (
        <div className="space-y-3">
          {comment.replies.map((reply) => (
            <CommentItem key={reply.id} comment={reply} depth={depth + 1} />
          ))}
        </div>
      )}
    </div>
  )

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <MessageSquare className="h-5 w-5" />
          Comments
        </CardTitle>
        <CardDescription>
          Discuss this assessment with your team
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-6">
        {/* New comment form */}
        <form onSubmit={handleSubmitComment} className="flex gap-2">
          <Textarea
            value={newComment}
            onChange={(e) => setNewComment(e.target.value)}
            placeholder="Add a comment..."
            className="min-h-[80px]"
          />
          <Button
            type="submit"
            disabled={!newComment.trim() || isSending}
            className="self-end"
          >
            {isSending ? (
              <Loader2 className="h-4 w-4 animate-spin" />
            ) : (
              <Send className="h-4 w-4" />
            )}
          </Button>
        </form>

        {/* Comments list */}
        {isLoading ? (
          <div className="flex justify-center py-8">
            <Loader2 className="h-6 w-6 animate-spin text-muted-foreground" />
          </div>
        ) : comments.length === 0 ? (
          <p className="text-center text-muted-foreground py-8">
            No comments yet. Be the first to comment.
          </p>
        ) : (
          <div className="space-y-6">
            {comments.map((comment) => (
              <CommentItem key={comment.id} comment={comment} />
            ))}
          </div>
        )}
      </CardContent>
    </Card>
  )
}
