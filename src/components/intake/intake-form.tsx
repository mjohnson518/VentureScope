'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import * as z from 'zod'
import { Loader2 } from 'lucide-react'

import { Button } from '@/components/ui/button'
import {
  Form,
  FormControl,
  FormDescription,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from '@/components/ui/form'
import { Input } from '@/components/ui/input'
import { Textarea } from '@/components/ui/textarea'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'

const intakeFormSchema = z.object({
  company_name: z.string().min(1, 'Company name is required').max(100),
  founder_name: z.string().min(1, 'Your name is required').max(100),
  founder_email: z.string().email('Please enter a valid email'),
  website: z.string().url('Please enter a valid URL').optional().or(z.literal('')),
  pitch_deck_url: z.string().url('Please enter a valid URL').optional().or(z.literal('')),
  stage: z.string().optional(),
  sector: z.string().optional(),
  raise_amount: z.string().optional(),
  description: z.string().max(2000).optional(),
  referral_source: z.string().max(200).optional(),
  // Honeypot field for bot detection
  website_url: z.string().max(0).optional(),
})

type IntakeFormValues = z.infer<typeof intakeFormSchema>

const stages = [
  { value: 'pre_seed', label: 'Pre-Seed' },
  { value: 'seed', label: 'Seed' },
  { value: 'series_a', label: 'Series A' },
  { value: 'series_b', label: 'Series B' },
  { value: 'series_c', label: 'Series C+' },
  { value: 'growth', label: 'Growth' },
]

const sectors = [
  'AI / Machine Learning',
  'B2B SaaS',
  'Consumer',
  'Fintech',
  'Healthcare',
  'Climate / Clean Tech',
  'Enterprise',
  'Marketplace',
  'Developer Tools',
  'Crypto / Web3',
  'E-commerce',
  'EdTech',
  'Other',
]

interface IntakeFormProps {
  orgSlug: string
  orgName: string
  customMessage?: string | null
}

export function IntakeForm({ orgSlug, orgName, customMessage }: IntakeFormProps) {
  const router = useRouter()
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const form = useForm<IntakeFormValues>({
    resolver: zodResolver(intakeFormSchema),
    defaultValues: {
      company_name: '',
      founder_name: '',
      founder_email: '',
      website: '',
      pitch_deck_url: '',
      stage: '',
      sector: '',
      raise_amount: '',
      description: '',
      referral_source: '',
      website_url: '', // Honeypot
    },
  })

  async function onSubmit(data: IntakeFormValues) {
    // Check honeypot
    if (data.website_url) {
      // Bot detected, fake success
      router.push(`/intake/${orgSlug}/thank-you`)
      return
    }

    setIsSubmitting(true)
    setError(null)

    try {
      const response = await fetch(`/api/intake/${orgSlug}`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          company_name: data.company_name,
          founder_name: data.founder_name,
          founder_email: data.founder_email,
          website: data.website || null,
          pitch_deck_url: data.pitch_deck_url || null,
          stage: data.stage || null,
          sector: data.sector || null,
          raise_amount: data.raise_amount ? parseFloat(data.raise_amount.replace(/[^0-9.]/g, '')) : null,
          description: data.description || null,
          referral_source: data.referral_source || null,
        }),
      })

      if (!response.ok) {
        const result = await response.json()
        if (response.status === 429) {
          setError('Too many submissions. Please try again later.')
        } else {
          setError(result.error || 'Failed to submit. Please try again.')
        }
        return
      }

      router.push(`/intake/${orgSlug}/thank-you`)
    } catch {
      setError('Something went wrong. Please try again.')
    } finally {
      setIsSubmitting(false)
    }
  }

  return (
    <div className="max-w-2xl mx-auto">
      <div className="mb-8 text-center">
        <h1 className="text-3xl font-bold mb-2">Submit Your Company</h1>
        <p className="text-muted-foreground">
          {customMessage || `Share your company with ${orgName}`}
        </p>
      </div>

      {error && (
        <div className="mb-6 p-4 bg-destructive/10 border border-destructive/30 rounded-lg text-destructive text-sm">
          {error}
        </div>
      )}

      <Form {...form}>
        <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
          {/* Honeypot field - hidden from users */}
          <div className="hidden" aria-hidden="true">
            <FormField
              control={form.control}
              name="website_url"
              render={({ field }) => (
                <FormItem>
                  <FormControl>
                    <Input {...field} tabIndex={-1} autoComplete="off" />
                  </FormControl>
                </FormItem>
              )}
            />
          </div>

          <div className="grid gap-6 sm:grid-cols-2">
            <FormField
              control={form.control}
              name="company_name"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Company Name *</FormLabel>
                  <FormControl>
                    <Input placeholder="Acme Inc." {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="founder_name"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Your Name *</FormLabel>
                  <FormControl>
                    <Input placeholder="Jane Doe" {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
          </div>

          <FormField
            control={form.control}
            name="founder_email"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Email *</FormLabel>
                <FormControl>
                  <Input type="email" placeholder="jane@acme.com" {...field} />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />

          <div className="grid gap-6 sm:grid-cols-2">
            <FormField
              control={form.control}
              name="website"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Website</FormLabel>
                  <FormControl>
                    <Input placeholder="https://acme.com" {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="pitch_deck_url"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Pitch Deck URL</FormLabel>
                  <FormControl>
                    <Input placeholder="https://docsend.com/..." {...field} />
                  </FormControl>
                  <FormDescription>Link to your pitch deck</FormDescription>
                  <FormMessage />
                </FormItem>
              )}
            />
          </div>

          <div className="grid gap-6 sm:grid-cols-2">
            <FormField
              control={form.control}
              name="stage"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Stage</FormLabel>
                  <Select onValueChange={field.onChange} value={field.value}>
                    <FormControl>
                      <SelectTrigger>
                        <SelectValue placeholder="Select stage" />
                      </SelectTrigger>
                    </FormControl>
                    <SelectContent>
                      {stages.map((stage) => (
                        <SelectItem key={stage.value} value={stage.value}>
                          {stage.label}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="sector"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Sector</FormLabel>
                  <Select onValueChange={field.onChange} value={field.value}>
                    <FormControl>
                      <SelectTrigger>
                        <SelectValue placeholder="Select sector" />
                      </SelectTrigger>
                    </FormControl>
                    <SelectContent>
                      {sectors.map((sector) => (
                        <SelectItem key={sector} value={sector}>
                          {sector}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                  <FormMessage />
                </FormItem>
              )}
            />
          </div>

          <FormField
            control={form.control}
            name="raise_amount"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Raise Amount</FormLabel>
                <FormControl>
                  <Input placeholder="$1,000,000" {...field} />
                </FormControl>
                <FormDescription>How much are you raising?</FormDescription>
                <FormMessage />
              </FormItem>
            )}
          />

          <FormField
            control={form.control}
            name="description"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Company Description</FormLabel>
                <FormControl>
                  <Textarea
                    placeholder="Tell us about your company..."
                    className="min-h-[120px]"
                    {...field}
                  />
                </FormControl>
                <FormDescription>Brief overview of what you do</FormDescription>
                <FormMessage />
              </FormItem>
            )}
          />

          <FormField
            control={form.control}
            name="referral_source"
            render={({ field }) => (
              <FormItem>
                <FormLabel>How did you hear about us?</FormLabel>
                <FormControl>
                  <Input placeholder="Referral, event, etc." {...field} />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />

          <Button type="submit" className="w-full" disabled={isSubmitting}>
            {isSubmitting ? (
              <>
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                Submitting...
              </>
            ) : (
              'Submit Application'
            )}
          </Button>
        </form>
      </Form>
    </div>
  )
}
