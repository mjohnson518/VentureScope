import { NextRequest, NextResponse } from 'next/server'
import { auth } from '@/lib/auth/config'
import { createAdminClient } from '@/lib/supabase/admin'
import { getAnthropicClient, MODELS } from '@/lib/ai'

interface RouteParams {
  params: Promise<{ threadId: string }>
}

// GET /api/chat/[threadId]/messages - Get messages for a thread
export async function GET(request: NextRequest, { params }: RouteParams) {
  try {
    const session = await auth()
    if (!session?.user?.id || !session.user.orgId) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const { threadId } = await params
    const supabase = createAdminClient()

    // Verify thread access
    const { data: thread } = await supabase
      .from('chat_threads')
      .select('id, company_id, companies!inner(org_id)')
      .eq('id', threadId)
      .eq('user_id', session.user.id)
      .single()

    if (!thread) {
      return NextResponse.json({ error: 'Thread not found' }, { status: 404 })
    }

    // Get messages
    const { data: messages, error } = await supabase
      .from('chat_messages')
      .select('*')
      .eq('thread_id', threadId)
      .order('created_at', { ascending: true })

    if (error) {
      return NextResponse.json({ error: 'Failed to fetch messages' }, { status: 500 })
    }

    return NextResponse.json(messages)
  } catch (error) {
    console.error('Messages fetch error:', error)
    return NextResponse.json({ error: 'Failed to fetch messages' }, { status: 500 })
  }
}

// POST /api/chat/[threadId]/messages - Send a message and get AI response
export async function POST(request: NextRequest, { params }: RouteParams) {
  try {
    const session = await auth()
    if (!session?.user?.id || !session.user.orgId) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const { threadId } = await params
    const body = await request.json()
    const { content } = body

    if (!content || typeof content !== 'string') {
      return NextResponse.json({ error: 'Message content required' }, { status: 400 })
    }

    const supabase = createAdminClient()

    // Verify thread access and get company info
    const { data: thread } = await supabase
      .from('chat_threads')
      .select(`
        id,
        company_id,
        companies!inner(
          id,
          name,
          org_id,
          description,
          stage,
          sector
        )
      `)
      .eq('id', threadId)
      .eq('user_id', session.user.id)
      .single()

    if (!thread) {
      return NextResponse.json({ error: 'Thread not found' }, { status: 404 })
    }

    const company = thread.companies as unknown as {
      id: string
      name: string
      org_id: string
      description: string | null
      stage: string | null
      sector: string | null
    }

    // Save user message
    const { data: userMessage, error: userMsgError } = await supabase
      .from('chat_messages')
      .insert({
        thread_id: threadId,
        role: 'user',
        content,
        citations: [],
      })
      .select()
      .single()

    if (userMsgError) {
      return NextResponse.json({ error: 'Failed to save message' }, { status: 500 })
    }

    // Get conversation history
    const { data: history } = await supabase
      .from('chat_messages')
      .select('role, content')
      .eq('thread_id', threadId)
      .order('created_at', { ascending: true })
      .limit(20)

    // Get company documents for context
    const { data: documents } = await supabase
      .from('documents')
      .select('id, file_name, classification, extracted_text')
      .eq('company_id', company.id)
      .not('extracted_text', 'is', null)
      .limit(10)

    // Get latest assessment if available
    const { data: assessment } = await supabase
      .from('assessments')
      .select('content, scores, recommendation, overall_score')
      .eq('company_id', company.id)
      .eq('status', 'completed')
      .order('created_at', { ascending: false })
      .limit(1)
      .single()

    // Build context for Claude
    const documentContext = documents?.map((doc) => ({
      id: doc.id,
      name: doc.file_name,
      type: doc.classification || 'document',
      content: doc.extracted_text?.slice(0, 3000) || '',
    })) || []

    // Generate AI response
    const { response: aiResponse, citations } = await generateChatResponse(
      content,
      history || [],
      {
        name: company.name,
        description: company.description,
        stage: company.stage,
        sector: company.sector,
      },
      documentContext,
      assessment
    )

    // Save AI response
    const { data: assistantMessage, error: assistantMsgError } = await supabase
      .from('chat_messages')
      .insert({
        thread_id: threadId,
        role: 'assistant',
        content: aiResponse,
        citations,
      })
      .select()
      .single()

    if (assistantMsgError) {
      return NextResponse.json({ error: 'Failed to save AI response' }, { status: 500 })
    }

    // Update thread timestamp
    await supabase
      .from('chat_threads')
      .update({ updated_at: new Date().toISOString() })
      .eq('id', threadId)

    return NextResponse.json({
      userMessage,
      assistantMessage,
    })
  } catch (error) {
    console.error('Chat message error:', error)
    return NextResponse.json({ error: 'Failed to process message' }, { status: 500 })
  }
}

interface DocumentContext {
  id: string
  name: string
  type: string
  content: string
}

interface CompanyContext {
  name: string
  description: string | null
  stage: string | null
  sector: string | null
}

async function generateChatResponse(
  userMessage: string,
  history: Array<{ role: string; content: string }>,
  company: CompanyContext,
  documents: DocumentContext[],
  assessment: { content: unknown; scores: unknown; recommendation: string; overall_score: number } | null
): Promise<{ response: string; citations: Array<{ source: string; text: string }> }> {
  const client = getAnthropicClient()

  // Build system prompt with context
  const systemPrompt = buildChatSystemPrompt(company, documents, assessment)

  // Convert history to Claude format
  const messages = history.map((msg) => ({
    role: msg.role as 'user' | 'assistant',
    content: msg.content,
  }))

  // Add current user message
  messages.push({ role: 'user', content: userMessage })

  const response = await client.messages.create({
    model: MODELS.ASSESSMENT,
    max_tokens: 2000,
    system: systemPrompt,
    messages,
  })

  const textContent = response.content.find((c) => c.type === 'text')
  if (!textContent || textContent.type !== 'text') {
    throw new Error('No text response from Claude')
  }

  // Extract citations from response
  const { text, citations } = extractCitations(textContent.text, documents)

  return { response: text, citations }
}

function buildChatSystemPrompt(
  company: CompanyContext,
  documents: DocumentContext[],
  assessment: { content: unknown; scores: unknown; recommendation: string; overall_score: number } | null
): string {
  let prompt = `You are an AI assistant helping a venture capital investor analyze ${company.name}.

## Company Information
- Name: ${company.name}
- Stage: ${company.stage || 'Not specified'}
- Sector: ${company.sector || 'Not specified'}
- Description: ${company.description || 'Not provided'}

## Your Role
- Answer questions about the company based on available documents and assessment data
- Provide specific, evidence-based answers
- When referencing information, cite the source document using [Source: document_name]
- Be concise but thorough
- If information isn't available, say so clearly

`

  if (documents.length > 0) {
    prompt += `## Available Documents\n`
    documents.forEach((doc) => {
      prompt += `\n### ${doc.name} (${doc.type})\n${doc.content}\n`
    })
  }

  if (assessment) {
    prompt += `\n## Assessment Summary
- Overall Score: ${assessment.overall_score}/100
- Recommendation: ${assessment.recommendation}
- Key Scores: ${JSON.stringify(assessment.scores, null, 2)}
`
  }

  prompt += `\n## Guidelines
1. Always cite your sources when referencing specific information from documents
2. Be analytical and objective
3. If asked about something not in the documents, clearly state that
4. Provide actionable insights when possible
5. Keep responses focused and relevant to the question`

  return prompt
}

function extractCitations(
  text: string,
  documents: DocumentContext[]
): { text: string; citations: Array<{ source: string; text: string }> } {
  const citations: Array<{ source: string; text: string }> = []
  const citationRegex = /\[Source:\s*([^\]]+)\]/gi

  let match
  while ((match = citationRegex.exec(text)) !== null) {
    const sourceName = match[1].trim()
    const doc = documents.find(
      (d) => d.name.toLowerCase().includes(sourceName.toLowerCase()) ||
        sourceName.toLowerCase().includes(d.name.toLowerCase())
    )

    if (doc) {
      // Find the sentence containing this citation
      const citationIndex = match.index
      const textBeforeCitation = text.slice(0, citationIndex)
      const lastPeriod = Math.max(
        textBeforeCitation.lastIndexOf('.'),
        textBeforeCitation.lastIndexOf('!'),
        textBeforeCitation.lastIndexOf('?')
      )
      const sentenceStart = lastPeriod >= 0 ? lastPeriod + 1 : 0
      const sentenceEnd = citationIndex

      const citedText = text.slice(sentenceStart, sentenceEnd).trim()

      if (citedText && !citations.some((c) => c.source === doc.name)) {
        citations.push({
          source: doc.name,
          text: citedText,
        })
      }
    }
  }

  return { text, citations }
}
