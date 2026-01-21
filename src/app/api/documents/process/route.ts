import { NextRequest, NextResponse } from 'next/server'
import { auth } from '@/lib/auth/config'
import { createAdminClient } from '@/lib/supabase/admin'
import { adminDownloadFile } from '@/lib/storage'

// Document processing will be expanded in Sprint 2 Task 9
// For now, this handles the basic processing flow

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
    const { documentId } = body

    if (!documentId) {
      return NextResponse.json(
        { error: 'Document ID required' },
        { status: 400 }
      )
    }

    const supabase = createAdminClient()

    // Verify access to document
    const { data: document, error: fetchError } = await supabase
      .from('documents')
      .select(`
        id,
        file_url,
        file_type,
        file_name,
        companies!inner(org_id)
      `)
      .eq('id', documentId)
      .eq('companies.org_id', session.user.orgId)
      .single()

    if (fetchError || !document) {
      return NextResponse.json(
        { error: 'Document not found' },
        { status: 404 }
      )
    }

    // Start async processing (non-blocking)
    processDocument(documentId, document.file_url, document.file_type, document.file_name)
      .catch((error) => {
        console.error('Background document processing error:', error)
      })

    return NextResponse.json({
      success: true,
      message: 'Document processing started',
      documentId,
    })
  } catch (error) {
    console.error('Document process error:', error)
    return NextResponse.json(
      { error: 'Failed to start document processing' },
      { status: 500 }
    )
  }
}

async function processDocument(
  documentId: string,
  filePath: string,
  fileType: string,
  fileName: string
) {
  const supabase = createAdminClient()

  try {
    // Download the file
    const fileBlob = await adminDownloadFile(filePath)

    // Extract text based on file type
    let extractedText = ''
    let classification = null

    // Basic text extraction (will be enhanced with proper parsers in Task 9)
    if (fileType === 'text/plain' || fileType === 'text/csv') {
      extractedText = await fileBlob.text()
    } else if (fileType === 'application/pdf') {
      // PDF processing will be implemented in Task 9
      extractedText = `[PDF document: ${fileName} - Processing will be enhanced with pdf-parse]`
    } else if (
      fileType === 'application/vnd.openxmlformats-officedocument.wordprocessingml.document' ||
      fileType === 'application/msword'
    ) {
      // Word processing will be implemented in Task 9
      extractedText = `[Word document: ${fileName} - Processing will be enhanced with mammoth]`
    } else if (
      fileType === 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet' ||
      fileType === 'application/vnd.ms-excel'
    ) {
      // Excel processing will be implemented in Task 9
      extractedText = `[Excel document: ${fileName} - Processing will be enhanced with xlsx]`
    } else if (
      fileType === 'application/vnd.openxmlformats-officedocument.presentationml.presentation' ||
      fileType === 'application/vnd.ms-powerpoint'
    ) {
      // PowerPoint processing will be implemented in Task 9
      extractedText = `[PowerPoint document: ${fileName} - Processing will be enhanced]`
    } else if (fileType.startsWith('image/')) {
      // Image processing will use OCR in later tasks
      extractedText = `[Image: ${fileName} - OCR processing will be added]`
    } else if (fileType.startsWith('video/')) {
      // Video processing will be added later
      extractedText = `[Video: ${fileName} - Transcription will be added]`
    }

    // Basic classification based on file name and type (will be enhanced with AI)
    classification = classifyDocument(fileName, fileType)

    // Update document with extracted text and classification
    const { error: updateError } = await supabase
      .from('documents')
      .update({
        extracted_text: extractedText,
        classification,
        processed_at: new Date().toISOString(),
        metadata: {
          processed_version: '1.0',
          extraction_method: 'basic',
        },
      })
      .eq('id', documentId)

    if (updateError) {
      throw updateError
    }
  } catch (error) {
    console.error(`Error processing document ${documentId}:`, error)

    // Update document with error status
    await supabase
      .from('documents')
      .update({
        error_message: error instanceof Error ? error.message : 'Processing failed',
        metadata: {
          processing_error: true,
          error_timestamp: new Date().toISOString(),
        },
      })
      .eq('id', documentId)
  }
}

function classifyDocument(
  fileName: string,
  fileType: string
): 'pitch_deck' | 'financials' | 'cap_table' | 'legal' | 'product_demo' | 'founder_video' | 'customer_reference' | 'other' {
  const lowerName = fileName.toLowerCase()

  // Check for pitch deck
  if (
    lowerName.includes('pitch') ||
    lowerName.includes('deck') ||
    lowerName.includes('presentation') ||
    lowerName.includes('investor')
  ) {
    return 'pitch_deck'
  }

  // Check for financials
  if (
    lowerName.includes('financial') ||
    lowerName.includes('revenue') ||
    lowerName.includes('p&l') ||
    lowerName.includes('profit') ||
    lowerName.includes('budget') ||
    lowerName.includes('forecast')
  ) {
    return 'financials'
  }

  // Check for cap table
  if (
    lowerName.includes('cap') ||
    lowerName.includes('equity') ||
    lowerName.includes('shares') ||
    lowerName.includes('ownership')
  ) {
    return 'cap_table'
  }

  // Check for legal documents
  if (
    lowerName.includes('legal') ||
    lowerName.includes('contract') ||
    lowerName.includes('agreement') ||
    lowerName.includes('term') ||
    lowerName.includes('nda') ||
    lowerName.includes('incorporation')
  ) {
    return 'legal'
  }

  // Check for product demo
  if (
    lowerName.includes('demo') ||
    lowerName.includes('product') ||
    lowerName.includes('walkthrough')
  ) {
    return 'product_demo'
  }

  // Check for videos
  if (fileType.startsWith('video/')) {
    if (lowerName.includes('founder') || lowerName.includes('intro')) {
      return 'founder_video'
    }
    return 'product_demo'
  }

  // Check for customer references
  if (
    lowerName.includes('customer') ||
    lowerName.includes('reference') ||
    lowerName.includes('testimonial') ||
    lowerName.includes('case study')
  ) {
    return 'customer_reference'
  }

  return 'other'
}
