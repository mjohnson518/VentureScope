import { Metadata } from 'next'
import Link from 'next/link'
import { Plus, Building2 } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { EmptyState } from '@/components/shared/empty-state'
import { CompanyList } from '@/components/companies'
import { CompanyFilters } from './company-filters'

export const metadata: Metadata = {
  title: 'Companies - VentureScope',
  description: 'Manage your pipeline companies',
}

interface CompaniesPageProps {
  searchParams: Promise<{ status?: string; search?: string }>
}

export default async function CompaniesPage({ searchParams }: CompaniesPageProps) {
  const params = await searchParams
  const status = params.status || 'all'
  const search = params.search || ''

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Companies</h1>
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

      <CompanyList status={status} search={search} />

      {/* Empty state is shown when list returns empty */}
      <div className="hidden first:block">
        <EmptyState
          icon={Building2}
          title="No companies yet"
          description="Add your first company to start building your pipeline"
          action={{
            label: 'Add Company',
            href: '/dashboard/companies/new',
          }}
        />
      </div>
    </div>
  )
}
