import { NextRequest, NextResponse } from 'next/server'
import { auth } from '@/lib/auth/config'
import { createAdminClient } from '@/lib/supabase/admin'

// GET /api/user/notifications - Get notification settings
export async function GET() {
  try {
    const session = await auth()
    if (!session?.user?.id) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const supabase = createAdminClient()

    const { data: settings } = await supabase
      .from('user_settings')
      .select('*')
      .eq('user_id', session.user.id)
      .single()

    // Return defaults if no settings exist
    const defaultSettings = {
      emailAssessments: true,
      emailComments: true,
      emailSharing: true,
      emailDigest: false,
    }

    if (!settings) {
      return NextResponse.json(defaultSettings)
    }

    return NextResponse.json({
      emailAssessments: settings.email_assessments ?? true,
      emailComments: settings.email_comments ?? true,
      emailSharing: settings.email_sharing ?? true,
      emailDigest: settings.email_digest ?? false,
    })
  } catch (error) {
    console.error('Notification settings fetch error:', error)
    return NextResponse.json({ error: 'Failed to fetch settings' }, { status: 500 })
  }
}

// PATCH /api/user/notifications - Update notification settings
export async function PATCH(request: NextRequest) {
  try {
    const session = await auth()
    if (!session?.user?.id) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const body = await request.json()
    const { emailAssessments, emailComments, emailSharing, emailDigest } = body

    const supabase = createAdminClient()

    // Upsert settings
    const { error } = await supabase
      .from('user_settings')
      .upsert({
        user_id: session.user.id,
        email_assessments: emailAssessments,
        email_comments: emailComments,
        email_sharing: emailSharing,
        email_digest: emailDigest,
        updated_at: new Date().toISOString(),
      }, {
        onConflict: 'user_id',
      })

    if (error) {
      console.error('Settings update error:', error)
      return NextResponse.json({ error: 'Failed to update settings' }, { status: 500 })
    }

    return NextResponse.json({ success: true })
  } catch (error) {
    console.error('Notification settings update error:', error)
    return NextResponse.json({ error: 'Failed to update settings' }, { status: 500 })
  }
}
