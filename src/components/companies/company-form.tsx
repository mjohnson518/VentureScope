'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import * as z from 'zod'
import { Loader2 } from 'lucide-react'
import { toast } from 'sonner'

import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Textarea } from '@/components/ui/textarea'
import {
  Form,
  FormControl,
  FormDescription,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from '@/components/ui/form'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'

const companyFormSchema = z.object({
  name: z.string().min(1, 'Company name is required').max(100),
  stage: z.enum(['pre_seed', 'seed', 'series_a', 'series_b', 'series_c', 'growth']).optional(),
  sector: z.string().max(100).optional(),
  raiseAmount: z.string().optional(),
  valuation: z.string().optional(),
  website: z.string().url('Please enter a valid URL').optional().or(z.literal('')),
  description: z.string().max(2000).optional(),
})

type CompanyFormValues = z.infer<typeof companyFormSchema>

const stages = [
  { value: 'pre_seed', label: 'Pre-Seed' },
  { value: 'seed', label: 'Seed' },
  { value: 'series_a', label: 'Series A' },
  { value: 'series_b', label: 'Series B' },
  { value: 'series_c', label: 'Series C' },
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

interface CompanyFormProps {
  initialData?: Partial<CompanyFormValues>
  companyId?: string
  mode?: 'create' | 'edit'
}

export function CompanyForm({ initialData, companyId, mode = 'create' }: CompanyFormProps) {
  const router = useRouter()
  const [isSubmitting, setIsSubmitting] = useState(false)

  const form = useForm<CompanyFormValues>({
    resolver: zodResolver(companyFormSchema),
    defaultValues: {
      name: initialData?.name || '',
      stage: initialData?.stage,
      sector: initialData?.sector || '',
      raiseAmount: initialData?.raiseAmount || '',
      valuation: initialData?.valuation || '',
      website: initialData?.website || '',
      description: initialData?.description || '',
    },
  })

  async function onSubmit(data: CompanyFormValues) {
    setIsSubmitting(true)

    try {
      const url = mode === 'edit' ? `/api/companies/${companyId}` : '/api/companies'
      const method = mode === 'edit' ? 'PATCH' : 'POST'

      const response = await fetch(url, {
        method,
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          ...data,
          raiseAmount: data.raiseAmount ? parseFloat(data.raiseAmount) : null,
          valuation: data.valuation ? parseFloat(data.valuation) : null,
          website: data.website || null,
        }),
      })

      if (!response.ok) {
        throw new Error('Failed to save company')
      }

      const company = await response.json()

      toast.success(mode === 'edit' ? 'Company updated' : 'Company created')
      router.push(`/dashboard/companies/${company.id}`)
      router.refresh()
    } catch (error) {
      console.error('Error saving company:', error)
      toast.error('Failed to save company')
    } finally {
      setIsSubmitting(false)
    }
  }

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
        <FormField
          control={form.control}
          name="name"
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

        <div className="grid gap-4 sm:grid-cols-2">
          <FormField
            control={form.control}
            name="stage"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Stage</FormLabel>
                <Select onValueChange={field.onChange} defaultValue={field.value}>
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
                <Select onValueChange={field.onChange} defaultValue={field.value}>
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

        <div className="grid gap-4 sm:grid-cols-2">
          <FormField
            control={form.control}
            name="raiseAmount"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Raise Amount ($)</FormLabel>
                <FormControl>
                  <Input
                    type="number"
                    placeholder="5000000"
                    {...field}
                  />
                </FormControl>
                <FormDescription>Target raise in USD</FormDescription>
                <FormMessage />
              </FormItem>
            )}
          />

          <FormField
            control={form.control}
            name="valuation"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Valuation ($)</FormLabel>
                <FormControl>
                  <Input
                    type="number"
                    placeholder="20000000"
                    {...field}
                  />
                </FormControl>
                <FormDescription>Pre-money valuation in USD</FormDescription>
                <FormMessage />
              </FormItem>
            )}
          />
        </div>

        <FormField
          control={form.control}
          name="website"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Website</FormLabel>
              <FormControl>
                <Input placeholder="https://example.com" {...field} />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />

        <FormField
          control={form.control}
          name="description"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Description</FormLabel>
              <FormControl>
                <Textarea
                  placeholder="Brief description of the company and what they do..."
                  className="min-h-[100px]"
                  {...field}
                />
              </FormControl>
              <FormDescription>
                Short overview of the company (max 2000 characters)
              </FormDescription>
              <FormMessage />
            </FormItem>
          )}
        />

        <div className="flex gap-4">
          <Button type="submit" disabled={isSubmitting}>
            {isSubmitting && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
            {mode === 'edit' ? 'Save Changes' : 'Create Company'}
          </Button>
          <Button
            type="button"
            variant="outline"
            onClick={() => router.back()}
          >
            Cancel
          </Button>
        </div>
      </form>
    </Form>
  )
}
