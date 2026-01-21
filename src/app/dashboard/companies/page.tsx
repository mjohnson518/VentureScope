import { Metadata } from 'next'
import Link from 'next/link'
import { Plus, Building2 } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { EmptyState } from '@/components/shared/empty-state'

export const metadata: Metadata = {
  title: 'Companies - VentureScope',
  description: 'Manage your pipeline companies',
}

export default function CompaniesPage() {
  // Placeholder - will fetch companies from database
  const companies: unknown[] = []

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

      {companies.length === 0 ? (
        <EmptyState
          icon={Building2}
          title="No companies yet"
          description="Add your first company to start building your pipeline"
          action={{
            label: 'Add Company',
            href: '/dashboard/companies/new',
          }}
        />
      ) : (
        <div>
          {/* Company list will go here */}
        </div>
      )}
    </div>
  )
}
