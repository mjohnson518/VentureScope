import { Metadata } from 'next'
import { ClipboardCheck } from 'lucide-react'
import { AssessmentList } from '@/components/assessments'

export const metadata: Metadata = {
  title: 'Assessments - VentureScope',
  description: 'View all your investment assessments',
}

export default function AssessmentsPage() {
  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold tracking-tight">Assessments</h1>
        <p className="text-muted-foreground">
          View and manage your investment memos
        </p>
      </div>

      <AssessmentList />
    </div>
  )
}
