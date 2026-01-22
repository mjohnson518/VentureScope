import { Metadata } from 'next'
import { notFound } from 'next/navigation'
import Link from 'next/link'
import { CheckCircle2 } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { createAdminClient } from '@/lib/supabase/admin'

interface ThankYouPageProps {
  params: Promise<{ slug: string }>
}

export const metadata: Metadata = {
  title: 'Submission Received - VentureScope',
}

export default async function ThankYouPage({ params }: ThankYouPageProps) {
  const { slug } = await params
  const supabase = createAdminClient()

  const { data: org, error } = await supabase
    .from('organizations')
    .select('name')
    .eq('slug', slug)
    .single()

  if (error || !org) {
    notFound()
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-background via-background to-muted/30 flex items-center justify-center">
      <div className="container max-w-lg mx-auto px-4 py-16 text-center">
        <div className="mb-6">
          <CheckCircle2 className="h-16 w-16 text-green-500 mx-auto" />
        </div>
        <h1 className="text-3xl font-bold mb-4">Thank You!</h1>
        <p className="text-muted-foreground mb-8">
          Your submission has been received. The team at {org.name} will review your
          application and reach out if there&apos;s a fit.
        </p>
        <Button asChild variant="outline">
          <Link href={`/intake/${slug}`}>Submit Another Company</Link>
        </Button>
      </div>
    </div>
  )
}
