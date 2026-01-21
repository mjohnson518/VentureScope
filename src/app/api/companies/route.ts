import { NextRequest, NextResponse } from 'next/server'
import { auth } from '@/lib/auth/config'
import { createAdminClient } from '@/lib/supabase/admin'

export async function POST(request: NextRequest) {
  try {
    const session = await auth()
    if (!session?.user?.id || !session.user.orgId) {
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 401 }
      )
    }

    const body = await request.json()
    const { name, stage, sector, raiseAmount, valuation, website, description } = body

    if (!name || typeof name !== 'string' || name.trim().length === 0) {
      return NextResponse.json(
        { error: 'Company name is required' },
        { status: 400 }
      )
    }

    const supabase = createAdminClient()

    const { data: company, error } = await supabase
      .from('companies')
      .insert({
        org_id: session.user.orgId,
        name: name.trim(),
        stage: stage || null,
        sector: sector || null,
        raise_amount: raiseAmount ? Number(raiseAmount) : null,
        valuation: valuation ? Number(valuation) : null,
        website: website || null,
        description: description || null,
        status: 'active',
        created_by: session.user.id,
      })
      .select()
      .single()

    if (error) {
      console.error('Error creating company:', error)
      return NextResponse.json(
        { error: 'Failed to create company' },
        { status: 500 }
      )
    }

    return NextResponse.json(company)
  } catch (error) {
    console.error('Company creation error:', error)
    return NextResponse.json(
      { error: 'Failed to create company' },
      { status: 500 }
    )
  }
}

export async function GET(request: NextRequest) {
  try {
    const session = await auth()
    if (!session?.user?.id || !session.user.orgId) {
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 401 }
      )
    }

    const { searchParams } = new URL(request.url)
    const status = searchParams.get('status')
    const search = searchParams.get('search')

    const supabase = createAdminClient()

    let query = supabase
      .from('companies')
      .select(`
        id,
        name,
        stage,
        sector,
        raise_amount,
        valuation,
        status,
        website,
        description,
        created_at,
        updated_at,
        documents(count),
        assessments(count)
      `)
      .eq('org_id', session.user.orgId)
      .order('created_at', { ascending: false })

    if (status && status !== 'all') {
      query = query.eq('status', status)
    }

    if (search) {
      query = query.or(`name.ilike.%${search}%,sector.ilike.%${search}%`)
    }

    const { data: companies, error } = await query

    if (error) {
      console.error('Error fetching companies:', error)
      return NextResponse.json(
        { error: 'Failed to fetch companies' },
        { status: 500 }
      )
    }

    // Transform the response to include counts
    const companiesWithCounts = companies?.map((company) => ({
      ...company,
      documentCount: (company.documents as { count: number }[])?.[0]?.count || 0,
      assessmentCount: (company.assessments as { count: number }[])?.[0]?.count || 0,
      documents: undefined,
      assessments: undefined,
    }))

    return NextResponse.json(companiesWithCounts)
  } catch (error) {
    console.error('Companies fetch error:', error)
    return NextResponse.json(
      { error: 'Failed to fetch companies' },
      { status: 500 }
    )
  }
}
