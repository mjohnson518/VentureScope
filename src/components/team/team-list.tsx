'use client'

import { useEffect, useState } from 'react'
import { formatDistanceToNow } from 'date-fns'
import {
  Users,
  MoreHorizontal,
  Trash2,
  Shield,
  Crown,
  UserPlus,
  Loader2,
} from 'lucide-react'
import { toast } from 'sonner'

import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar'
import { Badge } from '@/components/ui/badge'
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
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'

interface Member {
  id: string
  orgRole: 'owner' | 'admin' | 'member'
  invitedAt: string
  acceptedAt: string | null
  user: {
    id: string
    email: string
    name: string | null
    avatar_url: string | null
    role: string
  }
}

interface TeamListProps {
  currentUserId: string
  currentUserRole: 'owner' | 'admin' | 'member'
}

const roleConfig = {
  owner: { label: 'Owner', icon: Crown, color: 'text-yellow-600' },
  admin: { label: 'Admin', icon: Shield, color: 'text-blue-600' },
  member: { label: 'Member', icon: Users, color: 'text-gray-600' },
}

export function TeamList({ currentUserId, currentUserRole }: TeamListProps) {
  const [members, setMembers] = useState<Member[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [inviteEmail, setInviteEmail] = useState('')
  const [inviteRole, setInviteRole] = useState<'admin' | 'member'>('member')
  const [isInviting, setIsInviting] = useState(false)
  const [removeMemberId, setRemoveMemberId] = useState<string | null>(null)
  const [isRemoving, setIsRemoving] = useState(false)

  const canManageTeam = currentUserRole === 'owner' || currentUserRole === 'admin'
  const canChangeRoles = currentUserRole === 'owner'

  useEffect(() => {
    fetchMembers()
  }, [])

  const fetchMembers = async () => {
    setIsLoading(true)
    try {
      const response = await fetch('/api/team')
      if (!response.ok) throw new Error('Failed to fetch team')
      const data = await response.json()
      setMembers(data)
    } catch (error) {
      console.error('Error fetching team:', error)
      toast.error('Failed to load team members')
    } finally {
      setIsLoading(false)
    }
  }

  const handleInvite = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!inviteEmail.trim()) return

    setIsInviting(true)
    try {
      const response = await fetch('/api/team', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email: inviteEmail.trim(), role: inviteRole }),
      })

      if (!response.ok) {
        const error = await response.json()
        throw new Error(error.error || 'Failed to invite member')
      }

      const member = await response.json()
      setMembers((prev) => [...prev, member])
      setInviteEmail('')
      toast.success('Member added')
    } catch (error) {
      toast.error(error instanceof Error ? error.message : 'Failed to invite member')
    } finally {
      setIsInviting(false)
    }
  }

  const handleRemove = async () => {
    if (!removeMemberId) return

    setIsRemoving(true)
    try {
      const response = await fetch(`/api/team/${removeMemberId}`, {
        method: 'DELETE',
      })

      if (!response.ok) {
        const error = await response.json()
        throw new Error(error.error || 'Failed to remove member')
      }

      setMembers((prev) => prev.filter((m) => m.id !== removeMemberId))
      toast.success('Member removed')
    } catch (error) {
      toast.error(error instanceof Error ? error.message : 'Failed to remove member')
    } finally {
      setIsRemoving(false)
      setRemoveMemberId(null)
    }
  }

  const handleRoleChange = async (memberId: string, newRole: 'admin' | 'member') => {
    try {
      const response = await fetch(`/api/team/${memberId}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ role: newRole }),
      })

      if (!response.ok) {
        const error = await response.json()
        throw new Error(error.error || 'Failed to update role')
      }

      setMembers((prev) =>
        prev.map((m) => (m.id === memberId ? { ...m, orgRole: newRole } : m))
      )
      toast.success('Role updated')
    } catch (error) {
      toast.error(error instanceof Error ? error.message : 'Failed to update role')
    }
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

  if (isLoading) {
    return (
      <Card>
        <CardContent className="flex items-center justify-center py-8">
          <Loader2 className="h-6 w-6 animate-spin text-muted-foreground" />
        </CardContent>
      </Card>
    )
  }

  return (
    <>
      {canManageTeam && (
        <Card className="mb-6">
          <CardHeader>
            <CardTitle className="text-lg flex items-center gap-2">
              <UserPlus className="h-5 w-5" />
              Invite Team Member
            </CardTitle>
            <CardDescription>Add someone to your organization</CardDescription>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleInvite} className="flex gap-2">
              <Input
                type="email"
                placeholder="Enter email address"
                value={inviteEmail}
                onChange={(e) => setInviteEmail(e.target.value)}
                className="flex-1"
              />
              <Select
                value={inviteRole}
                onValueChange={(v) => setInviteRole(v as 'admin' | 'member')}
              >
                <SelectTrigger className="w-[120px]">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="member">Member</SelectItem>
                  <SelectItem value="admin">Admin</SelectItem>
                </SelectContent>
              </Select>
              <Button type="submit" disabled={!inviteEmail.trim() || isInviting}>
                {isInviting ? (
                  <Loader2 className="h-4 w-4 animate-spin" />
                ) : (
                  'Invite'
                )}
              </Button>
            </form>
          </CardContent>
        </Card>
      )}

      <Card>
        <CardHeader>
          <CardTitle>Team Members</CardTitle>
          <CardDescription>
            {members.length} member{members.length !== 1 ? 's' : ''} in your organization
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {members.map((member) => {
              const RoleIcon = roleConfig[member.orgRole].icon
              const isCurrentUser = member.user.id === currentUserId

              return (
                <div
                  key={member.id}
                  className="flex items-center justify-between py-3 border-b last:border-0"
                >
                  <div className="flex items-center gap-3">
                    <Avatar className="h-10 w-10">
                      <AvatarImage src={member.user.avatar_url || undefined} />
                      <AvatarFallback>
                        {getInitials(member.user.name, member.user.email)}
                      </AvatarFallback>
                    </Avatar>
                    <div>
                      <div className="flex items-center gap-2">
                        <span className="font-medium">
                          {member.user.name || member.user.email}
                        </span>
                        {isCurrentUser && (
                          <Badge variant="outline" className="text-xs">
                            You
                          </Badge>
                        )}
                      </div>
                      {member.user.name && (
                        <p className="text-sm text-muted-foreground">
                          {member.user.email}
                        </p>
                      )}
                      <p className="text-xs text-muted-foreground">
                        Joined {formatDistanceToNow(new Date(member.acceptedAt || member.invitedAt), { addSuffix: true })}
                      </p>
                    </div>
                  </div>

                  <div className="flex items-center gap-2">
                    <Badge
                      variant="secondary"
                      className={`gap-1 ${roleConfig[member.orgRole].color}`}
                    >
                      <RoleIcon className="h-3 w-3" />
                      {roleConfig[member.orgRole].label}
                    </Badge>

                    {canManageTeam && !isCurrentUser && member.orgRole !== 'owner' && (
                      <DropdownMenu>
                        <DropdownMenuTrigger asChild>
                          <Button variant="ghost" size="icon" className="h-8 w-8">
                            <MoreHorizontal className="h-4 w-4" />
                          </Button>
                        </DropdownMenuTrigger>
                        <DropdownMenuContent align="end">
                          {canChangeRoles && (
                            <>
                              <DropdownMenuItem
                                onClick={() =>
                                  handleRoleChange(
                                    member.id,
                                    member.orgRole === 'admin' ? 'member' : 'admin'
                                  )
                                }
                              >
                                <Shield className="mr-2 h-4 w-4" />
                                Make {member.orgRole === 'admin' ? 'Member' : 'Admin'}
                              </DropdownMenuItem>
                              <DropdownMenuSeparator />
                            </>
                          )}
                          <DropdownMenuItem
                            className="text-destructive"
                            onClick={() => setRemoveMemberId(member.id)}
                          >
                            <Trash2 className="mr-2 h-4 w-4" />
                            Remove
                          </DropdownMenuItem>
                        </DropdownMenuContent>
                      </DropdownMenu>
                    )}
                  </div>
                </div>
              )
            })}
          </div>
        </CardContent>
      </Card>

      <AlertDialog open={!!removeMemberId} onOpenChange={() => setRemoveMemberId(null)}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Remove Team Member</AlertDialogTitle>
            <AlertDialogDescription>
              Are you sure you want to remove this member? They will lose access to
              all organization resources.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction
              onClick={handleRemove}
              className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
              disabled={isRemoving}
            >
              {isRemoving && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
              Remove
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </>
  )
}
