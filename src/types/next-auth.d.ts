import 'next-auth'
import { DefaultSession } from 'next-auth'

declare module 'next-auth' {
  interface Session {
    user: {
      id: string
      orgId?: string
      orgRole?: 'owner' | 'admin' | 'member'
      role?: 'angel' | 'analyst' | 'partner' | 'family_office'
      organization?: {
        id: string
        name: string
        slug: string
        plan_tier: 'free' | 'angel' | 'pro' | 'enterprise'
      }
    } & DefaultSession['user']
  }

  interface User {
    orgId?: string
    orgRole?: string
    role?: string
  }
}

declare module 'next-auth/jwt' {
  interface JWT {
    id: string
    orgId?: string
    orgRole?: string
  }
}
