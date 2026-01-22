import { NextRequest, NextResponse } from 'next/server'
import { z } from 'zod'
import { createAdminClient } from '@/lib/supabase/admin'

interface RouteParams {
  params: Promise<{ slug: string }>
}

const submissionSchema = z.object({
  company_name: z.string().min(1).max(100),
  founder_name: z.string().min(1).max(100),
  founder_email: z.string().email(),
  website: z.string().url().nullable().optional(),
  pitch_deck_url: z.string().url().nullable().optional(),
  stage: z.string().nullable().optional(),
  sector: z.string().nullable().optional(),
  raise_amount: z.number().nullable().optional(),
  description: z.string().max(2000).nullable().optional(),
  referral_source: z.string().max(200).nullable().optional(),
})

const RATE_LIMIT_MAX = 5
const RATE_LIMIT_WINDOW_HOURS = 1

export async function POST(request: NextRequest, { params }: RouteParams) {
  try {
    const { slug } = await params
    const supabase = createAdminClient()

    // Get org by slug
    const { data: org, error: orgError } = await supabase
      .from('organizations')
      .select('id, intake_enabled')
      .eq('slug', slug)
      .single()

    if (orgError || !org) {
      return NextResponse.json(
        { error: 'Organization not found' },
        { status: 404 }
      )
    }

    if (!org.intake_enabled) {
      return NextResponse.json(
        { error: 'Intake form is disabled for this organization' },
        { status: 403 }
      )
    }

    // Get client IP for rate limiting
    const forwardedFor = request.headers.get('x-forwarded-for')
    const ip = forwardedFor?.split(',')[0]?.trim() || 'unknown'

    // Check rate limit
    const windowStart = new Date()
    windowStart.setHours(windowStart.getHours() - RATE_LIMIT_WINDOW_HOURS)

    const { count: recentSubmissions } = await supabase
      .from('intake_rate_limits')
      .select('*', { count: 'exact', head: true })
      .eq('org_id', org.id)
      .eq('ip_address', ip)
      .gte('created_at', windowStart.toISOString())

    if (recentSubmissions && recentSubmissions >= RATE_LIMIT_MAX) {
      return NextResponse.json(
        { error: 'Rate limit exceeded. Please try again later.' },
        { status: 429 }
      )
    }

    // Parse and validate request body
    const body = await request.json()
    const validation = submissionSchema.safeParse(body)

    if (!validation.success) {
      return NextResponse.json(
        { error: 'Invalid submission data', details: validation.error.flatten() },
        { status: 400 }
      )
    }

    const data = validation.data

    // Record rate limit entry
    await supabase.from('intake_rate_limits').insert({
      org_id: org.id,
      ip_address: ip,
    })

    // Create submission
    const { data: submission, error: submitError } = await supabase
      .from('deal_submissions')
      .insert({
        org_id: org.id,
        company_name: data.company_name,
        founder_name: data.founder_name,
        founder_email: data.founder_email,
        website: data.website || null,
        pitch_deck_url: data.pitch_deck_url || null,
        stage: data.stage || null,
        sector: data.sector || null,
        raise_amount: data.raise_amount || null,
        description: data.description || null,
        referral_source: data.referral_source || null,
        ip_address: ip,
        status: 'pending',
      })
      .select()
      .single()

    if (submitError) {
      console.error('Error creating submission:', submitError)
      return NextResponse.json(
        { error: 'Failed to create submission' },
        { status: 500 }
      )
    }

    return NextResponse.json({
      success: true,
      id: submission.id
    }, { status: 201 })
  } catch (error) {
    console.error('Intake submission error:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}
