import { Metadata } from 'next'
import Link from 'next/link'
import { redirect } from 'next/navigation'
import { Plus, Building2 } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { EmptyState } from '@/components/shared/empty-state'
import { CompanyList } from '@/components/companies'
import { CompanyFilters } from './company-filters'
import { auth } from '@/lib/auth/config'
import { getCompanies } from '@/lib/data'

export const metadata: Metadata = {
  title: 'Companies - VentureScope',
  description: 'Manage your pipeline companies',
}

interface CompaniesPageProps {
  searchParams: Promise<{ status?: string; search?: string }>
}

export default async function CompaniesPage({ searchParams }: CompaniesPageProps) {
  const session = await auth()

  if (!session?.user?.id || !session.user.orgId) {
    redirect('/login')
  }

  const params = await searchParams
  const status = params.status || 'all'
  const search = params.search || ''

  // Server-side data fetching with React.cache - no waterfall
  const companies = await getCompanies(session.user.orgId, { status, search })

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="font-display text-3xl font-bold tracking-tight">Companies</h1>
          <p className="text-muted-foreground">
            Manage your pipeline and investment targets
          </p>
        </div>
        <Button asChild>
          <Link href="/dashboard/companies/new">
            <Plus className="mr-2 h-4 w-4" />
            Add Company
          </Link>
        </Button>
      </div>

      <CompanyFilters currentStatus={status} currentSearch={search} />

      {companies.length === 0 ? (
        <EmptyState
          icon={Building2}
          title="No companies yet"
          description={search ? 'No companies match your search' : 'Add your first company to start building your pipeline'}
          action={!search ? {
            label: 'Add Company',
            href: '/dashboard/companies/new',
          } : undefined}
        />
      ) : (
        <CompanyList initialCompanies={companies} status={status} search={search} />
      )}
    </div>
  )
}
