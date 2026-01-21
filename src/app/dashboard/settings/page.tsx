import { Metadata } from 'next'
import { redirect } from 'next/navigation'
import { auth } from '@/lib/auth/config'
import { createAdminClient } from '@/lib/supabase/admin'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { ProfileForm, NotificationSettings, SecuritySettings } from '@/components/settings'

export const metadata: Metadata = {
  title: 'Settings - VentureScope',
  description: 'Manage your account settings',
}

async function getUserProfile(userId: string) {
  const supabase = createAdminClient()

  const { data: user } = await supabase
    .from('users')
    .select('id, email, name, avatar_url, role')
    .eq('id', userId)
    .single()

  return user
}

async function getNotificationSettings(userId: string) {
  const supabase = createAdminClient()

  const { data: settings } = await supabase
    .from('user_settings')
    .select('*')
    .eq('user_id', userId)
    .single()

  return {
    emailAssessments: settings?.email_assessments ?? true,
    emailComments: settings?.email_comments ?? true,
    emailSharing: settings?.email_sharing ?? true,
    emailDigest: settings?.email_digest ?? false,
  }
}

async function getActiveSessions(userId: string, currentSessionToken: string | undefined) {
  const supabase = createAdminClient()

  const { data: sessions } = await supabase
    .from('sessions')
    .select('id, sessionToken, expires')
    .eq('userId', userId)
    .gte('expires', new Date().toISOString())
    .order('expires', { ascending: false })

  if (!sessions) return []

  return sessions.map((s) => ({
    id: s.id,
    device: 'Desktop',
    browser: 'Browser',
    lastActive: s.expires,
    isCurrent: s.sessionToken === currentSessionToken,
  }))
}

export default async function SettingsPage() {
  const session = await auth()

  if (!session?.user?.id) {
    redirect('/login')
  }

  const [user, notificationSettings, sessions] = await Promise.all([
    getUserProfile(session.user.id),
    getNotificationSettings(session.user.id),
    getActiveSessions(session.user.id, undefined), // Session token handled client-side
  ])

  if (!user) {
    redirect('/login')
  }

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold tracking-tight">Settings</h1>
        <p className="text-muted-foreground">
          Manage your account and preferences
        </p>
      </div>

      <Tabs defaultValue="profile" className="space-y-4">
        <TabsList>
          <TabsTrigger value="profile">Profile</TabsTrigger>
          <TabsTrigger value="notifications">Notifications</TabsTrigger>
          <TabsTrigger value="security">Security</TabsTrigger>
        </TabsList>

        <TabsContent value="profile" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Profile</CardTitle>
              <CardDescription>
                Manage your public profile information
              </CardDescription>
            </CardHeader>
            <CardContent>
              <ProfileForm user={user} />
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="notifications" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Notifications</CardTitle>
              <CardDescription>
                Configure how you receive notifications
              </CardDescription>
            </CardHeader>
            <CardContent>
              <NotificationSettings settings={notificationSettings} />
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="security" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Security</CardTitle>
              <CardDescription>
                Manage your security preferences
              </CardDescription>
            </CardHeader>
            <CardContent>
              <SecuritySettings sessions={sessions} lastPasswordChange={null} />
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  )
}
