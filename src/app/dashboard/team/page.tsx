import { Metadata } from 'next'
import Link from 'next/link'
import { Plus, Users } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'

export const metadata: Metadata = {
  title: 'Team - VentureScope',
  description: 'Manage your team members',
}

export default function TeamPage() {
  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Team</h1>
          <p className="text-muted-foreground">
            Manage your team members and permissions
          </p>
        </div>
        <Button asChild>
          <Link href="/dashboard/team/invite">
            <Plus className="mr-2 h-4 w-4" />
            Invite Member
          </Link>
        </Button>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Team Members</CardTitle>
          <CardDescription>
            People who have access to your organization
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="flex items-center justify-center py-8">
            <div className="text-center">
              <Users className="mx-auto h-12 w-12 text-muted-foreground" />
              <h3 className="mt-4 text-lg font-semibold">Team management coming soon</h3>
              <p className="mt-2 text-sm text-muted-foreground">
                This feature will be available in the next sprint.
              </p>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
