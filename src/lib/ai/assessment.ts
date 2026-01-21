import { getAnthropicClient, MODELS, TOKEN_LIMITS } from './client'
import { buildScreeningPrompt, buildFullAssessmentPrompt } from './prompts'
import {
  AssessmentRequest,
  AssessmentResponse,
  AssessmentScores,
  ScreeningAssessmentContent,
  FullAssessmentContent,
  RecommendationReasoning,
} from './types'

// Calculate overall score from dimension scores
function calculateOverallScore(scores: AssessmentScores): number {
  const weights = {
    market: 0.2,
    team: 0.25,
    product: 0.2,
    traction: 0.15,
    financials: 0.1,
    competitive: 0.1,
  }

  let weightedSum = 0
  let totalWeight = 0

  for (const [dimension, weight] of Object.entries(weights)) {
    const score = scores[dimension as keyof AssessmentScores]?.score
    if (typeof score === 'number') {
      weightedSum += score * weight
      totalWeight += weight
    }
  }

  return totalWeight > 0 ? Math.round(weightedSum / totalWeight) : 0
}

// Parse JSON from Claude's response, handling potential formatting issues
function parseAssessmentResponse(text: string): unknown {
  // Try direct parse first
  try {
    return JSON.parse(text)
  } catch {
    // Try to extract JSON from markdown code blocks
    const jsonMatch = text.match(/```(?:json)?\s*([\s\S]*?)```/)
    if (jsonMatch) {
      return JSON.parse(jsonMatch[1].trim())
    }

    // Try to find JSON object in the text
    const objectMatch = text.match(/\{[\s\S]*\}/)
    if (objectMatch) {
      return JSON.parse(objectMatch[0])
    }

    throw new Error('Could not parse JSON response from Claude')
  }
}

export async function generateScreeningAssessment(
  request: AssessmentRequest
): Promise<AssessmentResponse> {
  const startTime = Date.now()
  const client = await getAnthropicClient()

  const prompt = buildScreeningPrompt(request.company, request.documents)

  const response = await client.messages.create({
    model: MODELS.ASSESSMENT,
    max_tokens: TOKEN_LIMITS.SCREENING_ASSESSMENT,
    messages: [
      {
        role: 'user',
        content: prompt,
      },
    ],
  })

  const textContent = response.content.find((c: { type: string }) => c.type === 'text') as { type: string; text: string } | undefined
  if (!textContent || textContent.type !== 'text') {
    throw new Error('No text response from Claude')
  }

  const parsed = parseAssessmentResponse(textContent.text) as {
    summary: string
    keyHighlights: string[]
    redFlags: string[]
    quickTake: string
    recommendedNextSteps: string[]
    scores: AssessmentScores
    recommendation: RecommendationReasoning
  }

  const content: ScreeningAssessmentContent = {
    summary: parsed.summary,
    keyHighlights: parsed.keyHighlights,
    redFlags: parsed.redFlags,
    quickTake: parsed.quickTake,
    recommendedNextSteps: parsed.recommendedNextSteps,
  }

  const overallScore = calculateOverallScore(parsed.scores)
  const processingTimeMs = Date.now() - startTime

  return {
    content,
    scores: parsed.scores,
    recommendation: parsed.recommendation,
    overallScore,
    processingTimeMs,
    tokensUsed: response.usage.input_tokens + response.usage.output_tokens,
  }
}

export async function generateFullAssessment(
  request: AssessmentRequest
): Promise<AssessmentResponse> {
  const startTime = Date.now()
  const client = await getAnthropicClient()

  const prompt = buildFullAssessmentPrompt(request.company, request.documents)

  const response = await client.messages.create({
    model: MODELS.ASSESSMENT,
    max_tokens: TOKEN_LIMITS.FULL_ASSESSMENT,
    messages: [
      {
        role: 'user',
        content: prompt,
      },
    ],
  })

  const textContent = response.content.find((c: { type: string }) => c.type === 'text') as { type: string; text: string } | undefined
  if (!textContent || textContent.type !== 'text') {
    throw new Error('No text response from Claude')
  }

  const parsed = parseAssessmentResponse(textContent.text) as {
    content: FullAssessmentContent
    scores: AssessmentScores
    recommendation: RecommendationReasoning
  }

  const overallScore = calculateOverallScore(parsed.scores)
  const processingTimeMs = Date.now() - startTime

  return {
    content: parsed.content,
    scores: parsed.scores,
    recommendation: parsed.recommendation,
    overallScore,
    processingTimeMs,
    tokensUsed: response.usage.input_tokens + response.usage.output_tokens,
  }
}

export async function generateAssessment(
  request: AssessmentRequest
): Promise<AssessmentResponse> {
  if (request.type === 'screening') {
    return generateScreeningAssessment(request)
  }
  return generateFullAssessment(request)
}

// AI-powered document classification
export async function classifyDocumentWithAI(
  fileName: string,
  content: string
): Promise<string> {
  const client = await getAnthropicClient()

  const response = await client.messages.create({
    model: MODELS.CLASSIFICATION,
    max_tokens: TOKEN_LIMITS.CLASSIFICATION,
    messages: [
      {
        role: 'user',
        content: `Classify this document into one of the following categories based on its content:

- pitch_deck: Investor presentations, pitch decks, company overviews
- financials: Financial statements, projections, P&L, balance sheets
- cap_table: Capitalization tables, equity breakdowns, ownership structures
- legal: Contracts, term sheets, agreements, incorporation docs
- product_demo: Product documentation, demos, technical specs
- founder_video: Founder introductions, team videos
- customer_reference: Customer testimonials, case studies, references
- other: Anything that doesn't fit above categories

Document: ${fileName}

Content preview:
${content.slice(0, 2000)}

Respond with ONLY the classification label (e.g., "pitch_deck"), nothing else.`,
      },
    ],
  })

  const textContent = response.content.find((c: { type: string }) => c.type === 'text') as { type: string; text: string } | undefined
  if (!textContent || textContent.type !== 'text') {
    return 'other'
  }

  const classification = textContent.text.trim().toLowerCase()
  const validClassifications = [
    'pitch_deck',
    'financials',
    'cap_table',
    'legal',
    'product_demo',
    'founder_video',
    'customer_reference',
    'other',
  ]

  return validClassifications.includes(classification) ? classification : 'other'
}
