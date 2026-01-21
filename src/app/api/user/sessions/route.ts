import { NextResponse } from 'next/server'
import { auth } from '@/lib/auth/config'
import { createAdminClient } from '@/lib/supabase/admin'
import { cookies, headers } from 'next/headers'

// GET /api/user/sessions - Get active sessions
export async function GET() {
  try {
    const session = await auth()
    if (!session?.user?.id) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const supabase = createAdminClient()
    const headersList = await headers()
    const cookieStore = await cookies()

    // Get current session token for identification
    const currentSessionToken = cookieStore.get('authjs.session-token')?.value ||
                               cookieStore.get('__Secure-authjs.session-token')?.value

    const { data: sessions, error } = await supabase
      .from('sessions')
      .select('id, sessionToken, expires')
      .eq('userId', session.user.id)
      .gte('expires', new Date().toISOString())
      .order('expires', { ascending: false })

    if (error) {
      console.error('Sessions fetch error:', error)
      return NextResponse.json({ error: 'Failed to fetch sessions' }, { status: 500 })
    }

    // Parse user agent for current request
    const userAgent = headersList.get('user-agent') || ''

    // Transform sessions with device info
    const transformedSessions = sessions.map((s) => ({
      id: s.id,
      device: parseDevice(userAgent),
      browser: parseBrowser(userAgent),
      lastActive: s.expires,
      isCurrent: s.sessionToken === currentSessionToken,
    }))

    return NextResponse.json(transformedSessions)
  } catch (error) {
    console.error('Sessions fetch error:', error)
    return NextResponse.json({ error: 'Failed to fetch sessions' }, { status: 500 })
  }
}

// DELETE /api/user/sessions - Revoke all other sessions
export async function DELETE() {
  try {
    const session = await auth()
    if (!session?.user?.id) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const cookieStore = await cookies()
    const currentSessionToken = cookieStore.get('authjs.session-token')?.value ||
                               cookieStore.get('__Secure-authjs.session-token')?.value

    if (!currentSessionToken) {
      return NextResponse.json({ error: 'Current session not found' }, { status: 400 })
    }

    const supabase = createAdminClient()

    // Delete all sessions except current
    const { error } = await supabase
      .from('sessions')
      .delete()
      .eq('userId', session.user.id)
      .neq('sessionToken', currentSessionToken)

    if (error) {
      console.error('Sessions delete error:', error)
      return NextResponse.json({ error: 'Failed to revoke sessions' }, { status: 500 })
    }

    return NextResponse.json({ success: true })
  } catch (error) {
    console.error('Sessions delete error:', error)
    return NextResponse.json({ error: 'Failed to revoke sessions' }, { status: 500 })
  }
}

function parseDevice(userAgent: string): string {
  if (/Mobile|Android|iPhone|iPad/.test(userAgent)) {
    if (/iPad/.test(userAgent)) return 'iPad'
    if (/iPhone/.test(userAgent)) return 'iPhone'
    if (/Android/.test(userAgent)) return 'Android'
    return 'Mobile'
  }
  if (/Mac/.test(userAgent)) return 'Mac'
  if (/Windows/.test(userAgent)) return 'Windows'
  if (/Linux/.test(userAgent)) return 'Linux'
  return 'Unknown Device'
}

function parseBrowser(userAgent: string): string {
  if (/Chrome/.test(userAgent) && !/Edge|Edg/.test(userAgent)) return 'Chrome'
  if (/Safari/.test(userAgent) && !/Chrome/.test(userAgent)) return 'Safari'
  if (/Firefox/.test(userAgent)) return 'Firefox'
  if (/Edge|Edg/.test(userAgent)) return 'Edge'
  return 'Unknown Browser'
}
