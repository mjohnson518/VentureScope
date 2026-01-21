import { NextRequest, NextResponse } from 'next/server'
import { auth } from '@/lib/auth/config'
import { createAdminClient } from '@/lib/supabase/admin'

// GET /api/chat - List chat threads for a company
export async function GET(request: NextRequest) {
  try {
    const session = await auth()
    if (!session?.user?.id || !session.user.orgId) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const { searchParams } = new URL(request.url)
    const companyId = searchParams.get('companyId')

    if (!companyId) {
      return NextResponse.json({ error: 'Company ID required' }, { status: 400 })
    }

    const supabase = createAdminClient()

    // Verify company access
    const { data: company } = await supabase
      .from('companies')
      .select('id')
      .eq('id', companyId)
      .eq('org_id', session.user.orgId)
      .single()

    if (!company) {
      return NextResponse.json({ error: 'Company not found' }, { status: 404 })
    }

    // Get threads for this company
    const { data: threads, error } = await supabase
      .from('chat_threads')
      .select(`
        id,
        title,
        created_at,
        updated_at,
        chat_messages(count)
      `)
      .eq('company_id', companyId)
      .eq('user_id', session.user.id)
      .order('updated_at', { ascending: false })

    if (error) {
      return NextResponse.json({ error: 'Failed to fetch threads' }, { status: 500 })
    }

    const threadsWithCount = threads?.map((thread) => ({
      ...thread,
      messageCount: (thread.chat_messages as { count: number }[])?.[0]?.count || 0,
      chat_messages: undefined,
    }))

    return NextResponse.json(threadsWithCount)
  } catch (error) {
    console.error('Chat threads fetch error:', error)
    return NextResponse.json({ error: 'Failed to fetch threads' }, { status: 500 })
  }
}

// POST /api/chat - Create a new chat thread
export async function POST(request: NextRequest) {
  try {
    const session = await auth()
    if (!session?.user?.id || !session.user.orgId) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const body = await request.json()
    const { companyId, title } = body

    if (!companyId) {
      return NextResponse.json({ error: 'Company ID required' }, { status: 400 })
    }

    const supabase = createAdminClient()

    // Verify company access
    const { data: company } = await supabase
      .from('companies')
      .select('id, name')
      .eq('id', companyId)
      .eq('org_id', session.user.orgId)
      .single()

    if (!company) {
      return NextResponse.json({ error: 'Company not found' }, { status: 404 })
    }

    // Create thread
    const { data: thread, error } = await supabase
      .from('chat_threads')
      .insert({
        company_id: companyId,
        user_id: session.user.id,
        title: title || `Chat about ${company.name}`,
      })
      .select()
      .single()

    if (error) {
      return NextResponse.json({ error: 'Failed to create thread' }, { status: 500 })
    }

    return NextResponse.json(thread)
  } catch (error) {
    console.error('Chat thread creation error:', error)
    return NextResponse.json({ error: 'Failed to create thread' }, { status: 500 })
  }
}
