import { auth } from './config'
import { redirect } from 'next/navigation'

export async function getSession() {
  return await auth()
}

export async function getCurrentUser() {
  const session = await getSession()
  return session?.user
}

export async function requireAuth() {
  const session = await getSession()

  if (!session?.user) {
    redirect('/login')
  }

  return session
}

export async function requireOrgMembership() {
  const session = await requireAuth()

  if (!session.user.orgId) {
    redirect('/onboarding')
  }

  return session
}

export async function requireOrgAdmin() {
  const session = await requireOrgMembership()

  if (!['owner', 'admin'].includes(session.user.orgRole || '')) {
    redirect('/dashboard')
  }

  return session
}

export async function requireOrgOwner() {
  const session = await requireOrgMembership()

  if (session.user.orgRole !== 'owner') {
    redirect('/dashboard')
  }

  return session
}
