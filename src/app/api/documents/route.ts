import { NextRequest, NextResponse } from 'next/server'
import { auth } from '@/lib/auth/config'
import { createAdminClient } from '@/lib/supabase/admin'
import { uploadFile } from '@/lib/storage'

export async function POST(request: NextRequest) {
  try {
    const session = await auth()
    if (!session?.user?.id || !session.user.orgId) {
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 401 }
      )
    }

    const formData = await request.formData()
    const file = formData.get('file') as File | null
    const companyId = formData.get('companyId') as string | null

    if (!file) {
      return NextResponse.json(
        { error: 'No file provided' },
        { status: 400 }
      )
    }

    if (!companyId) {
      return NextResponse.json(
        { error: 'No company ID provided' },
        { status: 400 }
      )
    }

    // Verify user has access to this company
    const supabase = createAdminClient()
    const { data: company, error: companyError } = await supabase
      .from('companies')
      .select('id, org_id')
      .eq('id', companyId)
      .eq('org_id', session.user.orgId)
      .single()

    if (companyError || !company) {
      return NextResponse.json(
        { error: 'Company not found or access denied' },
        { status: 404 }
      )
    }

    // Upload file to Supabase Storage
    const { path, url } = await uploadFile(file, session.user.orgId, companyId)

    // Create document record in database
    const { data: document, error: docError } = await supabase
      .from('documents')
      .insert({
        company_id: companyId,
        uploaded_by: session.user.id,
        file_name: file.name,
        file_type: file.type,
        file_size: file.size,
        file_url: path, // Store path, not public URL
        metadata: {
          original_name: file.name,
          upload_timestamp: new Date().toISOString(),
        },
      })
      .select()
      .single()

    if (docError) {
      console.error('Error creating document record:', docError)
      return NextResponse.json(
        { error: 'Failed to create document record' },
        { status: 500 }
      )
    }

    return NextResponse.json({
      id: document.id,
      fileName: document.file_name,
      fileType: document.file_type,
      fileSize: document.file_size,
      url,
      createdAt: document.created_at,
    })
  } catch (error) {
    console.error('Document upload error:', error)
    return NextResponse.json(
      { error: 'Failed to upload document' },
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
    const companyId = searchParams.get('companyId')

    const supabase = createAdminClient()

    let query = supabase
      .from('documents')
      .select(`
        id,
        company_id,
        file_name,
        file_type,
        file_size,
        classification,
        processed_at,
        created_at,
        companies!inner(org_id)
      `)
      .eq('companies.org_id', session.user.orgId)
      .order('created_at', { ascending: false })

    if (companyId) {
      query = query.eq('company_id', companyId)
    }

    const { data: documents, error } = await query

    if (error) {
      console.error('Error fetching documents:', error)
      return NextResponse.json(
        { error: 'Failed to fetch documents' },
        { status: 500 }
      )
    }

    return NextResponse.json(documents)
  } catch (error) {
    console.error('Documents fetch error:', error)
    return NextResponse.json(
      { error: 'Failed to fetch documents' },
      { status: 500 }
    )
  }
}
