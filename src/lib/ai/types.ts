// Assessment dimension scores
export interface DimensionScore {
  score: number // 0-100
  reasoning: string
  strengths: string[]
  concerns: string[]
}

// Full assessment scores structure
export interface AssessmentScores {
  market: DimensionScore
  team: DimensionScore
  product: DimensionScore
  traction: DimensionScore
  financials: DimensionScore
  competitive: DimensionScore
}

// Screening assessment (quick review)
export interface ScreeningAssessmentContent {
  summary: string
  keyHighlights: string[]
  redFlags: string[]
  quickTake: string
  recommendedNextSteps: string[]
}

// Full assessment content
export interface FullAssessmentContent {
  executiveSummary: string
  companyOverview: {
    description: string
    stage: string
    sector: string
    businessModel: string
  }
  marketAnalysis: {
    marketSize: string
    marketTrends: string[]
    targetCustomer: string
    marketPosition: string
  }
  teamAnalysis: {
    founderBackground: string
    teamStrengths: string[]
    teamGaps: string[]
    advisors: string
  }
  productAnalysis: {
    productDescription: string
    valueProposition: string
    productStage: string
    technicalMoat: string
    roadmap: string[]
  }
  tractionAnalysis: {
    currentMetrics: Record<string, string>
    growthTrajectory: string
    customerFeedback: string
    partnerships: string[]
  }
  financialAnalysis: {
    revenueModel: string
    unitEconomics: string
    burnRate: string
    runway: string
    fundingHistory: string
    useOfFunds: string[]
  }
  competitiveAnalysis: {
    competitors: Array<{
      name: string
      comparison: string
    }>
    differentiators: string[]
    defensibility: string
  }
  riskAssessment: {
    keyRisks: Array<{
      risk: string
      severity: 'low' | 'medium' | 'high'
      mitigation: string
    }>
  }
  investmentThesis: {
    bullCase: string[]
    bearCase: string[]
    keyQuestions: string[]
  }
  conclusion: string
}

// Recommendation types
export type Recommendation = 'strong_conviction' | 'proceed' | 'conditional' | 'pass'

export interface RecommendationReasoning {
  recommendation: Recommendation
  confidence: number // 0-100
  primaryReasons: string[]
  contingencies?: string[]
}

// Document context for assessment
export interface DocumentContext {
  fileName: string
  classification: string
  extractedText: string
}

// Company context for assessment
export interface CompanyContext {
  name: string
  stage: string | null
  sector: string | null
  raiseAmount: number | null
  valuation: number | null
  description: string | null
  website: string | null
}

// Assessment request
export interface AssessmentRequest {
  type: 'screening' | 'full'
  company: CompanyContext
  documents: DocumentContext[]
}

// Assessment response
export interface AssessmentResponse {
  content: ScreeningAssessmentContent | FullAssessmentContent
  scores: AssessmentScores
  recommendation: RecommendationReasoning
  overallScore: number
  processingTimeMs: number
  tokensUsed: number
}
