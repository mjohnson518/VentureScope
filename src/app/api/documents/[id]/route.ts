import { NextRequest, NextResponse } from 'next/server'
import { auth } from '@/lib/auth/config'
import { createAdminClient } from '@/lib/supabase/admin'
import { getSignedUrl, deleteFile } from '@/lib/storage'

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
    const { data: document, error } = await supabase
      .from('documents')
      .select(`
        id,
        company_id,
        uploaded_by,
        file_name,
        file_type,
        file_size,
        file_url,
        classification,
        extracted_text,
        metadata,
        processed_at,
        error_message,
        created_at,
        companies!inner(org_id, name)
      `)
      .eq('id', id)
      .eq('companies.org_id', session.user.orgId)
      .single()

    if (error || !document) {
      return NextResponse.json(
        { error: 'Document not found' },
        { status: 404 }
      )
    }

    // Generate signed URL for file access
    let signedUrl = null
    if (document.file_url) {
      try {
        signedUrl = await getSignedUrl(document.file_url)
      } catch (err) {
        console.error('Error generating signed URL:', err)
      }
    }

    return NextResponse.json({
      ...document,
      signedUrl,
    })
  } catch (error) {
    console.error('Document fetch error:', error)
    return NextResponse.json(
      { error: 'Failed to fetch document' },
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

    // First fetch the document to verify access and get file path
    const { data: document, error: fetchError } = await supabase
      .from('documents')
      .select(`
        id,
        file_url,
        companies!inner(org_id)
      `)
      .eq('id', id)
      .eq('companies.org_id', session.user.orgId)
      .single()

    if (fetchError || !document) {
      return NextResponse.json(
        { error: 'Document not found' },
        { status: 404 }
      )
    }

    // Delete file from storage
    if (document.file_url) {
      try {
        await deleteFile(document.file_url)
      } catch (err) {
        console.error('Error deleting file from storage:', err)
        // Continue with database deletion even if storage delete fails
      }
    }

    // Delete document record from database
    const { error: deleteError } = await supabase
      .from('documents')
      .delete()
      .eq('id', id)

    if (deleteError) {
      console.error('Error deleting document:', deleteError)
      return NextResponse.json(
        { error: 'Failed to delete document' },
        { status: 500 }
      )
    }

    return NextResponse.json({ success: true })
  } catch (error) {
    console.error('Document delete error:', error)
    return NextResponse.json(
      { error: 'Failed to delete document' },
      { status: 500 }
    )
  }
}
