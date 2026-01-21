'use client'

import { useState } from 'react'
import { formatDistanceToNow } from 'date-fns'
import { Laptop, Smartphone, Monitor, Loader2, LogOut } from 'lucide-react'
import { toast } from 'sonner'

import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from '@/components/ui/alert-dialog'

interface Session {
  id: string
  device: string
  browser: string
  lastActive: string
  isCurrent: boolean
}

interface SecuritySettingsProps {
  sessions: Session[]
  lastPasswordChange: string | null
}

const getDeviceIcon = (device: string) => {
  if (device.toLowerCase().includes('mobile') || device.toLowerCase().includes('phone')) {
    return Smartphone
  }
  if (device.toLowerCase().includes('tablet')) {
    return Laptop
  }
  return Monitor
}

export function SecuritySettings({ sessions, lastPasswordChange }: SecuritySettingsProps) {
  const [isRevoking, setIsRevoking] = useState(false)
  const [isRevokingAll, setIsRevokingAll] = useState(false)

  const handleRevokeSession = async (sessionId: string) => {
    setIsRevoking(true)
    try {
      const response = await fetch(`/api/user/sessions/${sessionId}`, {
        method: 'DELETE',
      })

      if (!response.ok) {
        const error = await response.json()
        throw new Error(error.error || 'Failed to revoke session')
      }

      toast.success('Session revoked')
      window.location.reload()
    } catch (error) {
      toast.error(error instanceof Error ? error.message : 'Failed to revoke session')
    } finally {
      setIsRevoking(false)
    }
  }

  const handleRevokeAllSessions = async () => {
    setIsRevokingAll(true)
    try {
      const response = await fetch('/api/user/sessions', {
        method: 'DELETE',
      })

      if (!response.ok) {
        const error = await response.json()
        throw new Error(error.error || 'Failed to revoke sessions')
      }

      toast.success('All other sessions revoked')
      window.location.reload()
    } catch (error) {
      toast.error(error instanceof Error ? error.message : 'Failed to revoke sessions')
    } finally {
      setIsRevokingAll(false)
    }
  }

  return (
    <div className="space-y-6">
      <div>
        <h3 className="text-lg font-medium">Password</h3>
        <p className="text-sm text-muted-foreground">
          {lastPasswordChange
            ? `Last changed ${formatDistanceToNow(new Date(lastPasswordChange), { addSuffix: true })}`
            : 'You signed up with a social provider'}
        </p>
        <p className="text-sm text-muted-foreground mt-2">
          Password management is handled through your authentication provider.
        </p>
      </div>

      <div className="space-y-4">
        <div className="flex items-center justify-between">
          <h3 className="text-lg font-medium">Active Sessions</h3>
          {sessions.length > 1 && (
            <AlertDialog>
              <AlertDialogTrigger asChild>
                <Button variant="outline" size="sm" disabled={isRevokingAll}>
                  {isRevokingAll && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                  Sign Out Other Sessions
                </Button>
              </AlertDialogTrigger>
              <AlertDialogContent>
                <AlertDialogHeader>
                  <AlertDialogTitle>Sign out other sessions?</AlertDialogTitle>
                  <AlertDialogDescription>
                    This will sign you out of all other devices and browsers. You will remain signed in on this device.
                  </AlertDialogDescription>
                </AlertDialogHeader>
                <AlertDialogFooter>
                  <AlertDialogCancel>Cancel</AlertDialogCancel>
                  <AlertDialogAction onClick={handleRevokeAllSessions}>
                    Sign Out All
                  </AlertDialogAction>
                </AlertDialogFooter>
              </AlertDialogContent>
            </AlertDialog>
          )}
        </div>

        <div className="space-y-3">
          {sessions.map((session) => {
            const DeviceIcon = getDeviceIcon(session.device)
            return (
              <div
                key={session.id}
                className="flex items-center justify-between py-3 border-b last:border-0"
              >
                <div className="flex items-center gap-3">
                  <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-muted">
                    <DeviceIcon className="h-5 w-5" />
                  </div>
                  <div>
                    <div className="flex items-center gap-2">
                      <span className="font-medium">{session.browser}</span>
                      {session.isCurrent && (
                        <Badge variant="secondary" className="text-xs">
                          Current
                        </Badge>
                      )}
                    </div>
                    <p className="text-sm text-muted-foreground">
                      {session.device} • Active {formatDistanceToNow(new Date(session.lastActive), { addSuffix: true })}
                    </p>
                  </div>
                </div>

                {!session.isCurrent && (
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => handleRevokeSession(session.id)}
                    disabled={isRevoking}
                  >
                    <LogOut className="h-4 w-4" />
                  </Button>
                )}
              </div>
            )
          })}
        </div>
      </div>
    </div>
  )
}
