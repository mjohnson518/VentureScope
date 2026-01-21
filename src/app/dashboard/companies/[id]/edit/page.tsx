import { Metadata } from 'next'
import { notFound } from 'next/navigation'
import Link from 'next/link'
import { ArrowLeft } from 'lucide-react'
import { auth } from '@/lib/auth/config'
import { createAdminClient } from '@/lib/supabase/admin'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { CompanyForm } from '@/components/companies'

interface EditCompanyPageProps {
  params: Promise<{ id: string }>
}

export async function generateMetadata({ params }: EditCompanyPageProps): Promise<Metadata> {
  const { id } = await params
  const session = await auth()
  if (!session?.user?.orgId) {
    return { title: 'Edit Company - VentureScope' }
  }

  const supabase = createAdminClient()
  const { data: company } = await supabase
    .from('companies')
    .select('name')
    .eq('id', id)
    .eq('org_id', session.user.orgId)
    .single()

  return {
    title: company ? `Edit ${company.name} - VentureScope` : 'Edit Company - VentureScope',
  }
}

export default async function EditCompanyPage({ params }: EditCompanyPageProps) {
  const { id } = await params
  const session = await auth()

  if (!session?.user?.id || !session.user.orgId) {
    notFound()
  }

  const supabase = createAdminClient()
  const { data: company, error } = await supabase
    .from('companies')
    .select('*')
    .eq('id', id)
    .eq('org_id', session.user.orgId)
    .single()

  if (error || !company) {
    notFound()
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center gap-4">
        <Button variant="ghost" size="icon" asChild>
          <Link href={`/dashboard/companies/${id}`}>
            <ArrowLeft className="h-4 w-4" />
          </Link>
        </Button>
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Edit Company</h1>
          <p className="text-muted-foreground">
            Update {company.name}&apos;s details
          </p>
        </div>
      </div>

      <Card className="max-w-2xl">
        <CardHeader>
          <CardTitle>Company Details</CardTitle>
          <CardDescription>
            Modify the company information
          </CardDescription>
        </CardHeader>
        <CardContent>
          <CompanyForm
            mode="edit"
            companyId={id}
            initialData={{
              name: company.name,
              stage: company.stage,
              sector: company.sector || '',
              raiseAmount: company.raise_amount?.toString() || '',
              valuation: company.valuation?.toString() || '',
              website: company.website || '',
              description: company.description || '',
            }}
          />
        </CardContent>
      </Card>
    </div>
  )
}
