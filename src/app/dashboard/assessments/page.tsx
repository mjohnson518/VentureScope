import { Metadata } from 'next'
import Link from 'next/link'
import { Plus, FileText } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { EmptyState } from '@/components/shared/empty-state'

export const metadata: Metadata = {
  title: 'Assessments - VentureScope',
  description: 'View all your investment assessments',
}

export default function AssessmentsPage() {
  // Placeholder - will fetch assessments from database
  const assessments: unknown[] = []

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Assessments</h1>
          <p className="text-muted-foreground">
            View and manage your investment memos
          </p>
        </div>
        <Button asChild>
          <Link href="/dashboard/assessments/new">
            <Plus className="mr-2 h-4 w-4" />
            New Assessment
          </Link>
        </Button>
      </div>

      {assessments.length === 0 ? (
        <EmptyState
          icon={FileText}
          title="No assessments yet"
          description="Generate your first investment memo to see it here"
          action={{
            label: 'New Assessment',
            href: '/dashboard/assessments/new',
          }}
        />
      ) : (
        <div>
          {/* Assessment list will go here */}
        </div>
      )}
    </div>
  )
}
