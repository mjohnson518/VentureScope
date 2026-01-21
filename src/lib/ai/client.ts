import Anthropic from '@anthropic-ai/sdk'

// Singleton client instance
let client: Anthropic | null = null

export function getAnthropicClient(): Anthropic {
  if (!client) {
    const apiKey = process.env.ANTHROPIC_API_KEY
    if (!apiKey) {
      throw new Error('ANTHROPIC_API_KEY environment variable is not set')
    }
    client = new Anthropic({ apiKey })
  }
  return client
}

// Model configurations
export const MODELS = {
  // Use Claude 3.5 Sonnet for assessment generation (good balance of speed and quality)
  ASSESSMENT: 'claude-sonnet-4-20250514',
  // Use Claude 3 Haiku for quick classification tasks
  CLASSIFICATION: 'claude-3-5-haiku-20241022',
} as const

// Token limits
export const TOKEN_LIMITS = {
  SCREENING_ASSESSMENT: 4000,
  FULL_ASSESSMENT: 8000,
  CLASSIFICATION: 500,
} as const
