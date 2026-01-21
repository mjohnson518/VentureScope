import Link from 'next/link'
import { Plus, Upload, FileText, MessageSquare } from 'lucide-react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'

const actions = [
  {
    title: 'New Company',
    description: 'Add a new company to evaluate',
    icon: Plus,
    href: '/dashboard/companies/new',
    variant: 'default' as const,
  },
  {
    title: 'Upload Documents',
    description: 'Add documents to an existing company',
    icon: Upload,
    href: '/dashboard/companies',
    variant: 'outline' as const,
  },
  {
    title: 'Generate Assessment',
    description: 'Create a new investment memo',
    icon: FileText,
    href: '/dashboard/assessments/new',
    variant: 'outline' as const,
  },
  {
    title: 'Start Chat',
    description: 'Ask questions about a deal',
    icon: MessageSquare,
    href: '/dashboard/companies',
    variant: 'outline' as const,
  },
]

export function QuickActions() {
  return (
    <Card>
      <CardHeader>
        <CardTitle>Quick Actions</CardTitle>
      </CardHeader>
      <CardContent>
        <div className="grid gap-3 sm:grid-cols-2">
          {actions.map((action) => (
            <Button
              key={action.title}
              variant={action.variant}
              className="h-auto flex-col items-start gap-1 p-4"
              asChild
            >
              <Link href={action.href}>
                <div className="flex w-full items-center gap-2">
                  <action.icon className="h-4 w-4" />
                  <span className="font-medium">{action.title}</span>
                </div>
                <span className="text-xs text-muted-foreground font-normal">
                  {action.description}
                </span>
              </Link>
            </Button>
          ))}
        </div>
      </CardContent>
    </Card>
  )
}
