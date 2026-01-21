'use client'

import { useState, useEffect } from 'react'
import { Share2, Loader2, X, Copy, Check, UserPlus } from 'lucide-react'
import { toast } from 'sonner'

import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar'
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
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import { Badge } from '@/components/ui/badge'

interface Share {
  id: string
  permission: 'view' | 'comment' | 'edit'
  created_at: string
  shared_with_user_id: string
  users: {
    id: string
    email: string
    name: string | null
    avatar_url: string | null
  }
}

interface ShareDialogProps {
  assessmentId: string
  assessmentTitle?: string
}

export function ShareDialog({ assessmentId, assessmentTitle }: ShareDialogProps) {
  const [open, setOpen] = useState(false)
  const [shares, setShares] = useState<Share[]>([])
  const [isLoading, setIsLoading] = useState(false)
  const [email, setEmail] = useState('')
  const [permission, setPermission] = useState<'view' | 'comment' | 'edit'>('view')
  const [isSharing, setIsSharing] = useState(false)
  const [copied, setCopied] = useState(false)

  useEffect(() => {
    if (open) {
      fetchShares()
    }
  }, [open, assessmentId])

  const fetchShares = async () => {
    setIsLoading(true)
    try {
      const response = await fetch(`/api/assessments/${assessmentId}/share`)
      if (!response.ok) throw new Error('Failed to fetch shares')
      const data = await response.json()
      setShares(data)
    } catch (error) {
      console.error('Error fetching shares:', error)
    } finally {
      setIsLoading(false)
    }
  }

  const handleShare = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!email.trim()) return

    setIsSharing(true)
    try {
      const response = await fetch(`/api/assessments/${assessmentId}/share`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email: email.trim(), permission }),
      })

      if (!response.ok) {
        const error = await response.json()
        throw new Error(error.error || 'Failed to share')
      }

      toast.success('Assessment shared')
      setEmail('')
      fetchShares()
    } catch (error) {
      toast.error(error instanceof Error ? error.message : 'Failed to share')
    } finally {
      setIsSharing(false)
    }
  }

  const handleRemoveShare = async (shareId: string) => {
    try {
      const response = await fetch(
        `/api/assessments/${assessmentId}/share?shareId=${shareId}`,
        { method: 'DELETE' }
      )

      if (!response.ok) throw new Error('Failed to remove share')

      setShares((prev) => prev.filter((s) => s.id !== shareId))
      toast.success('Share removed')
    } catch (error) {
      toast.error('Failed to remove share')
    }
  }

  const copyLink = () => {
    const url = `${window.location.origin}/dashboard/assessments/${assessmentId}`
    navigator.clipboard.writeText(url)
    setCopied(true)
    setTimeout(() => setCopied(false), 2000)
    toast.success('Link copied')
  }

  const getInitials = (name: string | null, email: string) => {
    if (name) {
      return name
        .split(' ')
        .map((n) => n[0])
        .join('')
        .toUpperCase()
        .slice(0, 2)
    }
    return email.slice(0, 2).toUpperCase()
  }

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button variant="outline" size="sm">
          <Share2 className="h-4 w-4 mr-2" />
          Share
        </Button>
      </DialogTrigger>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle>Share Assessment</DialogTitle>
          <DialogDescription>
            {assessmentTitle || 'Share this assessment with team members'}
          </DialogDescription>
        </DialogHeader>

        <form onSubmit={handleShare} className="space-y-4">
          <div className="flex gap-2">
            <Input
              type="email"
              placeholder="Enter email address"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className="flex-1"
            />
            <Select
              value={permission}
              onValueChange={(v) => setPermission(v as 'view' | 'comment' | 'edit')}
            >
              <SelectTrigger className="w-[110px]">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="view">View</SelectItem>
                <SelectItem value="comment">Comment</SelectItem>
                <SelectItem value="edit">Edit</SelectItem>
              </SelectContent>
            </Select>
            <Button type="submit" disabled={!email.trim() || isSharing}>
              {isSharing ? (
                <Loader2 className="h-4 w-4 animate-spin" />
              ) : (
                <UserPlus className="h-4 w-4" />
              )}
            </Button>
          </div>
        </form>

        <div className="space-y-3">
          <p className="text-sm font-medium">People with access</p>

          {isLoading ? (
            <div className="flex justify-center py-4">
              <Loader2 className="h-5 w-5 animate-spin text-muted-foreground" />
            </div>
          ) : shares.length === 0 ? (
            <p className="text-sm text-muted-foreground text-center py-4">
              No one else has access yet
            </p>
          ) : (
            <div className="space-y-2 max-h-[200px] overflow-y-auto">
              {shares.map((share) => (
                <div
                  key={share.id}
                  className="flex items-center justify-between p-2 rounded-lg hover:bg-muted/50"
                >
                  <div className="flex items-center gap-3">
                    <Avatar className="h-8 w-8">
                      <AvatarImage src={share.users.avatar_url || undefined} />
                      <AvatarFallback className="text-xs">
                        {getInitials(share.users.name, share.users.email)}
                      </AvatarFallback>
                    </Avatar>
                    <div>
                      <p className="text-sm font-medium">
                        {share.users.name || share.users.email}
                      </p>
                      {share.users.name && (
                        <p className="text-xs text-muted-foreground">
                          {share.users.email}
                        </p>
                      )}
                    </div>
                  </div>
                  <div className="flex items-center gap-2">
                    <Badge variant="secondary" className="capitalize">
                      {share.permission}
                    </Badge>
                    <Button
                      variant="ghost"
                      size="icon"
                      className="h-8 w-8"
                      onClick={() => handleRemoveShare(share.id)}
                    >
                      <X className="h-4 w-4" />
                    </Button>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

        <DialogFooter className="sm:justify-between">
          <Button variant="outline" onClick={copyLink}>
            {copied ? (
              <>
                <Check className="h-4 w-4 mr-2" />
                Copied
              </>
            ) : (
              <>
                <Copy className="h-4 w-4 mr-2" />
                Copy Link
              </>
            )}
          </Button>
          <Button variant="ghost" onClick={() => setOpen(false)}>
            Done
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}
