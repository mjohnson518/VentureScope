'use client'

import { useState } from 'react'
import { Loader2 } from 'lucide-react'
import { toast } from 'sonner'

import { Button } from '@/components/ui/button'
import { Label } from '@/components/ui/label'
import { Switch } from '@/components/ui/switch'

interface NotificationSettingsProps {
  settings: {
    emailAssessments: boolean
    emailComments: boolean
    emailSharing: boolean
    emailDigest: boolean
  }
}

export function NotificationSettings({ settings }: NotificationSettingsProps) {
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [formData, setFormData] = useState(settings)

  const handleToggle = (key: keyof typeof formData) => {
    setFormData((prev) => ({ ...prev, [key]: !prev[key] }))
  }

  const handleSubmit = async () => {
    setIsSubmitting(true)
    try {
      const response = await fetch('/api/user/notifications', {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(formData),
      })

      if (!response.ok) {
        const error = await response.json()
        throw new Error(error.error || 'Failed to update settings')
      }

      toast.success('Notification settings updated')
    } catch (error) {
      toast.error(error instanceof Error ? error.message : 'Failed to update settings')
    } finally {
      setIsSubmitting(false)
    }
  }

  return (
    <div className="space-y-6">
      <div className="space-y-4">
        <div className="flex items-center justify-between">
          <div className="space-y-0.5">
            <Label htmlFor="emailAssessments">Assessment Completion</Label>
            <p className="text-sm text-muted-foreground">
              Receive email when an assessment is completed
            </p>
          </div>
          <Switch
            id="emailAssessments"
            checked={formData.emailAssessments}
            onCheckedChange={() => handleToggle('emailAssessments')}
          />
        </div>

        <div className="flex items-center justify-between">
          <div className="space-y-0.5">
            <Label htmlFor="emailComments">New Comments</Label>
            <p className="text-sm text-muted-foreground">
              Receive email when someone comments on your assessments
            </p>
          </div>
          <Switch
            id="emailComments"
            checked={formData.emailComments}
            onCheckedChange={() => handleToggle('emailComments')}
          />
        </div>

        <div className="flex items-center justify-between">
          <div className="space-y-0.5">
            <Label htmlFor="emailSharing">Shared Assessments</Label>
            <p className="text-sm text-muted-foreground">
              Receive email when an assessment is shared with you
            </p>
          </div>
          <Switch
            id="emailSharing"
            checked={formData.emailSharing}
            onCheckedChange={() => handleToggle('emailSharing')}
          />
        </div>

        <div className="flex items-center justify-between">
          <div className="space-y-0.5">
            <Label htmlFor="emailDigest">Weekly Digest</Label>
            <p className="text-sm text-muted-foreground">
              Receive a weekly summary of activity in your organization
            </p>
          </div>
          <Switch
            id="emailDigest"
            checked={formData.emailDigest}
            onCheckedChange={() => handleToggle('emailDigest')}
          />
        </div>
      </div>

      <Button onClick={handleSubmit} disabled={isSubmitting}>
        {isSubmitting && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
        Save Preferences
      </Button>
    </div>
  )
}
