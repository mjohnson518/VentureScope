import Link from 'next/link'
import { Plus, Upload, FileText, MessageSquare, ArrowRight } from 'lucide-react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { cn } from '@/lib/utils'

const actions = [
  {
    title: 'New Company',
    description: 'Add a new company to evaluate',
    icon: Plus,
    href: '/dashboard/companies/new',
    color: 'text-primary',
    bgColor: 'bg-primary/10',
    hoverBg: 'hover:bg-primary/5',
    primary: true,
  },
  {
    title: 'Upload Documents',
    description: 'Add documents to an existing company',
    icon: Upload,
    href: '/dashboard/companies',
    color: 'text-blue-600 dark:text-blue-400',
    bgColor: 'bg-blue-500/10',
    hoverBg: 'hover:bg-blue-500/5',
    primary: false,
  },
  {
    title: 'Generate Assessment',
    description: 'Create a new investment memo',
    icon: FileText,
    href: '/dashboard/assessments/new',
    color: 'text-emerald-600 dark:text-emerald-400',
    bgColor: 'bg-emerald-500/10',
    hoverBg: 'hover:bg-emerald-500/5',
    primary: false,
  },
  {
    title: 'Start Chat',
    description: 'Ask questions about a deal',
    icon: MessageSquare,
    href: '/dashboard/companies',
    color: 'text-amber-600 dark:text-amber-400',
    bgColor: 'bg-amber-500/10',
    hoverBg: 'hover:bg-amber-500/5',
    primary: false,
  },
]

export function QuickActions() {
  return (
    <Card className="border-border/50 bg-card/80 backdrop-blur-sm">
      <CardHeader>
        <CardTitle className="font-display">Quick Actions</CardTitle>
      </CardHeader>
      <CardContent>
        <div className="grid gap-3 sm:grid-cols-2 stagger-children">
          {actions.map((action, index) => (
            <Link
              key={action.title}
              href={action.href}
              className={cn(
                'group relative flex items-start gap-4 rounded-xl border p-4 transition-all duration-200',
                action.primary
                  ? 'border-primary/30 bg-primary/5 hover:border-primary/50 hover:bg-primary/10'
                  : `border-border/50 bg-card ${action.hoverBg} hover:border-border`
              )}
              style={{ animationDelay: `${index * 50}ms` }}
            >
              <div
                className={cn(
                  'flex h-10 w-10 shrink-0 items-center justify-center rounded-lg transition-transform duration-200 group-hover:scale-110',
                  action.bgColor
                )}
              >
                <action.icon className={cn('h-5 w-5', action.color)} />
              </div>
              <div className="flex-1 space-y-1">
                <div className="flex items-center justify-between">
                  <span className="font-medium">{action.title}</span>
                  <ArrowRight className="h-4 w-4 text-muted-foreground opacity-0 -translate-x-2 transition-all duration-200 group-hover:opacity-100 group-hover:translate-x-0" />
                </div>
                <p className="text-sm text-muted-foreground">
                  {action.description}
                </p>
              </div>
            </Link>
          ))}
        </div>
      </CardContent>
    </Card>
  )
}
