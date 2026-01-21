import { Metadata } from 'next'
import { redirect } from 'next/navigation'
import { auth } from '@/lib/auth/config'
import { TeamList } from '@/components/team'

export const metadata: Metadata = {
  title: 'Team - VentureScope',
  description: 'Manage your team members',
}

export default async function TeamPage() {
  const session = await auth()

  if (!session?.user?.id || !session.user.orgId) {
    redirect('/login')
  }

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold tracking-tight">Team</h1>
        <p className="text-muted-foreground">
          Manage your team members and permissions
        </p>
      </div>

      <TeamList
        currentUserId={session.user.id}
        currentUserRole={session.user.orgRole || 'member'}
      />
    </div>
  )
}
