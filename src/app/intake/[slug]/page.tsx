import { Metadata } from 'next'
import { notFound } from 'next/navigation'
import { IntakeForm } from '@/components/intake/intake-form'
import { createAdminClient } from '@/lib/supabase/admin'

interface IntakePageProps {
  params: Promise<{ slug: string }>
}

export async function generateMetadata({ params }: IntakePageProps): Promise<Metadata> {
  const { slug } = await params
  const supabase = createAdminClient()

  const { data: org } = await supabase
    .from('organizations')
    .select('name')
    .eq('slug', slug)
    .eq('intake_enabled', true)
    .single()

  if (!org) {
    return { title: 'Not Found' }
  }

  return {
    title: `Submit to ${org.name} - VentureScope`,
    description: `Submit your startup to ${org.name} for investment consideration`,
  }
}

export default async function IntakePage({ params }: IntakePageProps) {
  const { slug } = await params
  const supabase = createAdminClient()

  const { data: org, error } = await supabase
    .from('organizations')
    .select('id, name, slug, intake_enabled, intake_custom_message')
    .eq('slug', slug)
    .single()

  if (error || !org || !org.intake_enabled) {
    notFound()
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-background via-background to-muted/30">
      <div className="container max-w-4xl mx-auto px-4 py-16">
        <IntakeForm
          orgSlug={org.slug}
          orgName={org.name}
          customMessage={org.intake_custom_message}
        />
      </div>
    </div>
  )
}
