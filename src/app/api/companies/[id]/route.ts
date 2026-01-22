import { NextRequest, NextResponse } from 'next/server'
import { auth } from '@/lib/auth/config'
import { createAdminClient } from '@/lib/supabase/admin'

interface RouteParams {
  params: Promise<{ id: string }>
}

export async function GET(request: NextRequest, { params }: RouteParams) {
  try {
    const session = await auth()
    if (!session?.user?.id || !session.user.orgId) {
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 401 }
      )
    }

    const { id } = await params

    const supabase = createAdminClient()
    const { data: company, error } = await supabase
      .from('companies')
      .select(`
        *,
        documents(
          id,
          file_name,
          file_type,
          file_size,
          classification,
          processed_at,
          created_at
        ),
        assessments(
          id,
          type,
          status,
          recommendation,
          overall_score,
          created_at,
          completed_at
        )
      `)
      .eq('id', id)
      .eq('org_id', session.user.orgId)
      .single()

    if (error || !company) {
      return NextResponse.json(
        { error: 'Company not found' },
        { status: 404 }
      )
    }

    return NextResponse.json(company)
  } catch (error) {
    console.error('Company fetch error:', error)
    return NextResponse.json(
      { error: 'Failed to fetch company' },
      { status: 500 }
    )
  }
}

export async function PATCH(request: NextRequest, { params }: RouteParams) {
  try {
    const session = await auth()
    if (!session?.user?.id || !session.user.orgId) {
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 401 }
      )
    }

    const { id } = await params
    const body = await request.json()

    const allowedFields = [
      'name',
      'stage',
      'sector',
      'raise_amount',
      'valuation',
      'status',
      'website',
      'description',
      'pipeline_position',
    ]

    // Filter only allowed fields
    const updates: Record<string, unknown> = {}
    for (const field of allowedFields) {
      if (field in body) {
        updates[field] = body[field]
      }
    }

    if (Object.keys(updates).length === 0) {
      return NextResponse.json(
        { error: 'No valid fields to update' },
        { status: 400 }
      )
    }

    updates.updated_at = new Date().toISOString()

    const supabase = createAdminClient()

    // Verify company belongs to user's org
    const { data: existing } = await supabase
      .from('companies')
      .select('id')
      .eq('id', id)
      .eq('org_id', session.user.orgId)
      .single()

    if (!existing) {
      return NextResponse.json(
        { error: 'Company not found' },
        { status: 404 }
      )
    }

    const { data: company, error } = await supabase
      .from('companies')
      .update(updates)
      .eq('id', id)
      .select()
      .single()

    if (error) {
      console.error('Error updating company:', error)
      return NextResponse.json(
        { error: 'Failed to update company' },
        { status: 500 }
      )
    }

    return NextResponse.json(company)
  } catch (error) {
    console.error('Company update error:', error)
    return NextResponse.json(
      { error: 'Failed to update company' },
      { status: 500 }
    )
  }
}

export async function DELETE(request: NextRequest, { params }: RouteParams) {
  try {
    const session = await auth()
    if (!session?.user?.id || !session.user.orgId) {
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 401 }
      )
    }

    const { id } = await params

    const supabase = createAdminClient()

    // Verify company belongs to user's org
    const { data: existing } = await supabase
      .from('companies')
      .select('id')
      .eq('id', id)
      .eq('org_id', session.user.orgId)
      .single()

    if (!existing) {
      return NextResponse.json(
        { error: 'Company not found' },
        { status: 404 }
      )
    }

    // Delete company (cascade will handle documents and assessments)
    const { error } = await supabase
      .from('companies')
      .delete()
      .eq('id', id)

    if (error) {
      console.error('Error deleting company:', error)
      return NextResponse.json(
        { error: 'Failed to delete company' },
        { status: 500 }
      )
    }

    return NextResponse.json({ success: true })
  } catch (error) {
    console.error('Company delete error:', error)
    return NextResponse.json(
      { error: 'Failed to delete company' },
      { status: 500 }
    )
  }
}
