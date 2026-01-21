import { CompanyContext, DocumentContext } from './types'

export function buildScreeningPrompt(
  company: CompanyContext,
  documents: DocumentContext[]
): string {
  const documentSections = documents
    .map(
      (doc) => `
### ${doc.fileName} (${doc.classification})
${doc.extractedText}
`
    )
    .join('\n---\n')

  return `You are an experienced venture capital analyst conducting a screening assessment of a startup investment opportunity. Your task is to provide a quick but thorough initial analysis.

## Company Information
- **Name:** ${company.name}
- **Stage:** ${company.stage || 'Not specified'}
- **Sector:** ${company.sector || 'Not specified'}
- **Raise Amount:** ${company.raiseAmount ? `$${company.raiseAmount.toLocaleString()}` : 'Not specified'}
- **Valuation:** ${company.valuation ? `$${company.valuation.toLocaleString()}` : 'Not specified'}
- **Description:** ${company.description || 'Not provided'}
- **Website:** ${company.website || 'Not provided'}

## Available Documents
${documentSections}

## Your Task
Analyze the provided materials and generate a screening assessment. Be direct, specific, and evidence-based. Reference specific data points from the documents.

Respond with a JSON object in this exact format:
{
  "summary": "A 2-3 sentence executive summary of the opportunity",
  "keyHighlights": ["3-5 most compelling positive aspects"],
  "redFlags": ["Any concerning issues or missing information"],
  "quickTake": "Your overall impression in 1-2 sentences",
  "recommendedNextSteps": ["What should be done next if proceeding"],
  "scores": {
    "market": {
      "score": <0-100>,
      "reasoning": "Brief explanation",
      "strengths": ["Key strengths"],
      "concerns": ["Key concerns"]
    },
    "team": {
      "score": <0-100>,
      "reasoning": "Brief explanation",
      "strengths": ["Key strengths"],
      "concerns": ["Key concerns"]
    },
    "product": {
      "score": <0-100>,
      "reasoning": "Brief explanation",
      "strengths": ["Key strengths"],
      "concerns": ["Key concerns"]
    },
    "traction": {
      "score": <0-100>,
      "reasoning": "Brief explanation",
      "strengths": ["Key strengths"],
      "concerns": ["Key concerns"]
    },
    "financials": {
      "score": <0-100>,
      "reasoning": "Brief explanation",
      "strengths": ["Key strengths"],
      "concerns": ["Key concerns"]
    },
    "competitive": {
      "score": <0-100>,
      "reasoning": "Brief explanation",
      "strengths": ["Key strengths"],
      "concerns": ["Key concerns"]
    }
  },
  "recommendation": {
    "recommendation": "strong_conviction" | "proceed" | "conditional" | "pass",
    "confidence": <0-100>,
    "primaryReasons": ["Top 3 reasons for this recommendation"]
  }
}

Guidelines for scoring:
- 80-100: Exceptional, best-in-class
- 60-79: Strong, above average
- 40-59: Average, some concerns
- 20-39: Below average, significant concerns
- 0-19: Poor, major red flags

Guidelines for recommendation:
- strong_conviction: Exceptional opportunity, move quickly
- proceed: Good opportunity, worth pursuing
- conditional: Promising but needs more diligence on specific areas
- pass: Does not meet investment criteria

Respond ONLY with the JSON object, no additional text.`
}

export function buildFullAssessmentPrompt(
  company: CompanyContext,
  documents: DocumentContext[]
): string {
  const documentSections = documents
    .map(
      (doc) => `
### ${doc.fileName} (${doc.classification})
${doc.extractedText}
`
    )
    .join('\n---\n')

  return `You are a senior venture capital partner conducting a comprehensive due diligence assessment of a startup investment opportunity. Your analysis will be used by investment committee members to make funding decisions.

## Company Information
- **Name:** ${company.name}
- **Stage:** ${company.stage || 'Not specified'}
- **Sector:** ${company.sector || 'Not specified'}
- **Raise Amount:** ${company.raiseAmount ? `$${company.raiseAmount.toLocaleString()}` : 'Not specified'}
- **Valuation:** ${company.valuation ? `$${company.valuation.toLocaleString()}` : 'Not specified'}
- **Description:** ${company.description || 'Not provided'}
- **Website:** ${company.website || 'Not provided'}

## Available Documents
${documentSections}

## Your Task
Generate a comprehensive investment memo based on the provided materials. Be thorough, analytical, and evidence-based. Reference specific data points and metrics from the documents. Note any gaps in information that would typically be expected.

Respond with a JSON object in this exact format:
{
  "content": {
    "executiveSummary": "3-4 paragraph comprehensive summary of the investment opportunity",
    "companyOverview": {
      "description": "Detailed company description",
      "stage": "Current company stage with context",
      "sector": "Sector and subsector analysis",
      "businessModel": "How the company makes money"
    },
    "marketAnalysis": {
      "marketSize": "TAM/SAM/SOM analysis with numbers if available",
      "marketTrends": ["Key trends affecting this market"],
      "targetCustomer": "ICP and customer segment analysis",
      "marketPosition": "Where company sits in the market"
    },
    "teamAnalysis": {
      "founderBackground": "Founder backgrounds and relevant experience",
      "teamStrengths": ["What the team does well"],
      "teamGaps": ["Missing capabilities or roles"],
      "advisors": "Advisory board and notable backers"
    },
    "productAnalysis": {
      "productDescription": "What the product does",
      "valueProposition": "Core value prop and differentiation",
      "productStage": "Current development stage",
      "technicalMoat": "Technical advantages or IP",
      "roadmap": ["Upcoming product milestones"]
    },
    "tractionAnalysis": {
      "currentMetrics": {"metric_name": "value"},
      "growthTrajectory": "Growth rate and trajectory analysis",
      "customerFeedback": "Customer satisfaction and retention data",
      "partnerships": ["Notable partnerships or customers"]
    },
    "financialAnalysis": {
      "revenueModel": "How revenue is generated",
      "unitEconomics": "CAC, LTV, margins analysis",
      "burnRate": "Monthly burn and efficiency",
      "runway": "Current runway",
      "fundingHistory": "Previous funding rounds",
      "useOfFunds": ["How the raise will be deployed"]
    },
    "competitiveAnalysis": {
      "competitors": [
        {"name": "Competitor name", "comparison": "How they compare"}
      ],
      "differentiators": ["Key competitive advantages"],
      "defensibility": "Moat and barriers to entry"
    },
    "riskAssessment": {
      "keyRisks": [
        {"risk": "Risk description", "severity": "low|medium|high", "mitigation": "How to mitigate"}
      ]
    },
    "investmentThesis": {
      "bullCase": ["Reasons this could be a great investment"],
      "bearCase": ["Reasons for concern"],
      "keyQuestions": ["Questions for founders/further diligence"]
    },
    "conclusion": "Final assessment and recommendation rationale"
  },
  "scores": {
    "market": {
      "score": <0-100>,
      "reasoning": "Detailed explanation with evidence",
      "strengths": ["Specific strengths with data points"],
      "concerns": ["Specific concerns with evidence"]
    },
    "team": {
      "score": <0-100>,
      "reasoning": "Detailed explanation with evidence",
      "strengths": ["Specific strengths"],
      "concerns": ["Specific concerns"]
    },
    "product": {
      "score": <0-100>,
      "reasoning": "Detailed explanation with evidence",
      "strengths": ["Specific strengths"],
      "concerns": ["Specific concerns"]
    },
    "traction": {
      "score": <0-100>,
      "reasoning": "Detailed explanation with evidence",
      "strengths": ["Specific strengths with metrics"],
      "concerns": ["Specific concerns"]
    },
    "financials": {
      "score": <0-100>,
      "reasoning": "Detailed explanation with evidence",
      "strengths": ["Specific strengths"],
      "concerns": ["Specific concerns"]
    },
    "competitive": {
      "score": <0-100>,
      "reasoning": "Detailed explanation with evidence",
      "strengths": ["Specific strengths"],
      "concerns": ["Specific concerns"]
    }
  },
  "recommendation": {
    "recommendation": "strong_conviction" | "proceed" | "conditional" | "pass",
    "confidence": <0-100>,
    "primaryReasons": ["Top 3-5 reasons for this recommendation"],
    "contingencies": ["If conditional, what needs to be true"]
  }
}

Guidelines for scoring:
- 80-100: Exceptional, best-in-class for stage
- 60-79: Strong, above average
- 40-59: Average, some concerns
- 20-39: Below average, significant concerns
- 0-19: Poor, major red flags or missing critical information

Guidelines for recommendation:
- strong_conviction: Exceptional opportunity across multiple dimensions, move quickly
- proceed: Solid opportunity that meets investment criteria, proceed to terms
- conditional: Promising but specific concerns need resolution before proceeding
- pass: Does not meet investment criteria, document reasons for future reference

Be specific and reference actual data from the documents. If information is missing, note it explicitly and adjust scores accordingly.

Respond ONLY with the JSON object, no additional text.`
}

export function buildClassificationPrompt(
  fileName: string,
  content: string
): string {
  return `Classify this document into one of the following categories based on its content:

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

Respond with ONLY the classification label (e.g., "pitch_deck"), nothing else.`
}
