import { Metadata } from 'next'
import Link from 'next/link'
import { redirect } from 'next/navigation'
import { Inbox, Link2 } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { EmptyState } from '@/components/shared/empty-state'
import { SubmissionList } from '@/components/intake/submission-list'
import { auth } from '@/lib/auth/config'
import { createAdminClient } from '@/lib/supabase/admin'

export const metadata: Metadata = {
  title: 'Submissions - VentureScope',
  description: 'Review deal submissions from founders',
}

interface SubmissionsPageProps {
  searchParams: Promise<{ status?: string }>
}

export default async function SubmissionsPage({ searchParams }: SubmissionsPageProps) {
  const session = await auth()

  if (!session?.user?.id || !session.user.orgId) {
    redirect('/login')
  }

  const params = await searchParams
  const statusFilter = params.status || 'all'

  const supabase = createAdminClient()

  // Get org info for intake link
  const { data: org } = await supabase
    .from('organizations')
    .select('slug, intake_enabled')
    .eq('id', session.user.orgId)
    .single()

  // Get submissions
  let query = supabase
    .from('deal_submissions')
    .select('*')
    .eq('org_id', session.user.orgId)
    .order('created_at', { ascending: false })

  if (statusFilter && statusFilter !== 'all') {
    query = query.eq('status', statusFilter)
  }

  const { data: submissions, error } = await query

  if (error) {
    console.error('Error fetching submissions:', error)
  }

  const intakeUrl = org?.slug ? `/intake/${org.slug}` : null

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="font-display text-3xl font-bold tracking-tight">Submissions</h1>
          <p className="text-muted-foreground">
            Review deal submissions from founders
          </p>
        </div>
        {intakeUrl && org?.intake_enabled && (
          <Button asChild variant="outline">
            <Link href={intakeUrl} target="_blank">
              <Link2 className="mr-2 h-4 w-4" />
              Intake Form
            </Link>
          </Button>
        )}
      </div>

      <SubmissionFilters currentStatus={statusFilter} />

      {!submissions || submissions.length === 0 ? (
        <EmptyState
          icon={Inbox}
          title="No submissions yet"
          description={
            intakeUrl && org?.intake_enabled
              ? 'Share your intake form link to start receiving submissions'
              : 'Enable intake forms in settings to start receiving submissions'
          }
          action={
            intakeUrl && org?.intake_enabled
              ? {
                  label: 'Copy Intake Link',
                  href: intakeUrl,
                }
              : undefined
          }
        />
      ) : (
        <SubmissionList initialSubmissions={submissions} />
      )}
    </div>
  )
}

function SubmissionFilters({ currentStatus }: { currentStatus: string }) {
  const statuses = [
    { value: 'all', label: 'All' },
    { value: 'pending', label: 'Pending' },
    { value: 'reviewing', label: 'Reviewing' },
    { value: 'accepted', label: 'Accepted' },
    { value: 'rejected', label: 'Rejected' },
  ]

  return (
    <div className="flex gap-2">
      {statuses.map((status) => (
        <Button
          key={status.value}
          variant={currentStatus === status.value ? 'secondary' : 'ghost'}
          size="sm"
          asChild
        >
          <Link
            href={
              status.value === 'all'
                ? '/dashboard/submissions'
                : `/dashboard/submissions?status=${status.value}`
            }
          >
            {status.label}
          </Link>
        </Button>
      ))}
    </div>
  )
}
