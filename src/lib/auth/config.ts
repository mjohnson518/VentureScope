import NextAuth from 'next-auth'
import Google from 'next-auth/providers/google'
import GitHub from 'next-auth/providers/github'
import Resend from 'next-auth/providers/resend'
import { SupabaseAdapter } from '@auth/supabase-adapter'
import { createAdminClient } from '@/lib/supabase/admin'

// Only create adapter if env vars are present (not during build)
const adapter = process.env.NEXT_PUBLIC_SUPABASE_URL && process.env.SUPABASE_SERVICE_ROLE_KEY
  ? SupabaseAdapter({
      url: process.env.NEXT_PUBLIC_SUPABASE_URL,
      secret: process.env.SUPABASE_SERVICE_ROLE_KEY,
    })
  : undefined

export const { handlers, signIn, signOut, auth } = NextAuth({
  adapter,
  providers: [
    Google({
      clientId: process.env.GOOGLE_CLIENT_ID!,
      clientSecret: process.env.GOOGLE_CLIENT_SECRET!,
    }),
    GitHub({
      clientId: process.env.GITHUB_CLIENT_ID!,
      clientSecret: process.env.GITHUB_CLIENT_SECRET!,
    }),
    Resend({
      apiKey: process.env.RESEND_API_KEY!,
      from: 'VentureScope <noreply@venturescope.ai>',
    }),
  ],
  pages: {
    signIn: '/login',
    error: '/login',
  },
  callbacks: {
    async session({ session, user }) {
      // Add user ID to session
      session.user.id = user.id

      // Fetch user's active organization membership
      try {
        const supabase = createAdminClient()
        const { data: membership } = await supabase
          .from('org_memberships')
          .select('org_id, role, organizations(id, name, slug, plan_tier)')
          .eq('user_id', user.id)
          .not('accepted_at', 'is', null)
          .order('accepted_at', { ascending: false })
          .limit(1)
          .single()

        if (membership) {
          session.user.orgId = membership.org_id
          session.user.orgRole = membership.role as 'owner' | 'admin' | 'member'
          // Handle the joined organization data
          const orgData = membership.organizations as unknown as {
            id: string
            name: string
            slug: string
            plan_tier: string
          } | null
          if (orgData) {
            session.user.organization = {
              id: orgData.id,
              name: orgData.name,
              slug: orgData.slug,
              plan_tier: orgData.plan_tier as 'free' | 'angel' | 'pro' | 'enterprise'
            }
          }
        }

        // Fetch user role from users table
        const { data: userData } = await supabase
          .from('users')
          .select('role')
          .eq('id', user.id)
          .single()

        if (userData) {
          session.user.role = userData.role as 'angel' | 'analyst' | 'partner' | 'family_office'
        }
      } catch (error) {
        console.error('Error fetching user organization:', error)
      }

      return session
    },
    async jwt({ token, user }) {
      if (user) {
        token.id = user.id
      }
      return token
    },
  },
  events: {
    async createUser({ user }) {
      // User and organization are created via Supabase triggers
      // This event can be used for additional setup like sending welcome emails
      console.log('New user created:', user.email)
    },
  },
  session: {
    strategy: 'database',
  },
  trustHost: true,
})
