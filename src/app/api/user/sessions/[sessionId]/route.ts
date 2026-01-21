import { NextRequest, NextResponse } from 'next/server'
import { auth } from '@/lib/auth/config'
import { createAdminClient } from '@/lib/supabase/admin'

interface RouteParams {
  params: Promise<{ sessionId: string }>
}

// DELETE /api/user/sessions/[sessionId] - Revoke specific session
export async function DELETE(request: NextRequest, { params }: RouteParams) {
  try {
    const session = await auth()
    if (!session?.user?.id) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const { sessionId } = await params
    const supabase = createAdminClient()

    // Verify the session belongs to this user
    const { data: targetSession } = await supabase
      .from('sessions')
      .select('id, userId')
      .eq('id', sessionId)
      .single()

    if (!targetSession || targetSession.userId !== session.user.id) {
      return NextResponse.json({ error: 'Session not found' }, { status: 404 })
    }

    // Delete the session
    const { error } = await supabase
      .from('sessions')
      .delete()
      .eq('id', sessionId)

    if (error) {
      console.error('Session delete error:', error)
      return NextResponse.json({ error: 'Failed to revoke session' }, { status: 500 })
    }

    return NextResponse.json({ success: true })
  } catch (error) {
    console.error('Session delete error:', error)
    return NextResponse.json({ error: 'Failed to revoke session' }, { status: 500 })
  }
}
