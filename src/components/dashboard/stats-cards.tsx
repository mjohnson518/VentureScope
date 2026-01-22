import { Card, CardContent } from '@/components/ui/card'
import { Building2, FileText, TrendingUp, Clock, ArrowUpRight } from 'lucide-react'
import { cn } from '@/lib/utils'

interface StatsCardsProps {
  stats: {
    totalCompanies: number
    totalAssessments: number
    avgScore: number | null
    assessmentsThisMonth: number
  }
}

export function StatsCards({ stats }: StatsCardsProps) {
  const cards = [
    {
      title: 'Total Companies',
      value: stats.totalCompanies,
      icon: Building2,
      description: 'In your pipeline',
      color: 'text-primary',
      bgColor: 'bg-primary/10',
      trend: null,
    },
    {
      title: 'Assessments',
      value: stats.totalAssessments,
      icon: FileText,
      description: 'All time completed',
      color: 'text-emerald-600 dark:text-emerald-400',
      bgColor: 'bg-emerald-500/10',
      trend: null,
    },
    {
      title: 'Avg. Score',
      value: stats.avgScore ? stats.avgScore.toFixed(0) : '-',
      icon: TrendingUp,
      description: 'Across all deals',
      color: 'text-blue-600 dark:text-blue-400',
      bgColor: 'bg-blue-500/10',
      trend: stats.avgScore ? (stats.avgScore >= 70 ? 'up' : null) : null,
    },
    {
      title: 'This Month',
      value: stats.assessmentsThisMonth,
      icon: Clock,
      description: 'Assessments generated',
      color: 'text-amber-600 dark:text-amber-400',
      bgColor: 'bg-amber-500/10',
      trend: null,
    },
  ]

  return (
    <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4 stagger-children">
      {cards.map((card, index) => (
        <Card
          key={card.title}
          className="group relative overflow-hidden border-border/50 bg-card/80 backdrop-blur-sm hover-lift"
          style={{ animationDelay: `${index * 50}ms` }}
        >
          {/* Subtle gradient overlay */}
          <div className="absolute inset-0 bg-gradient-to-br from-transparent via-transparent to-primary/5 opacity-0 transition-opacity duration-300 group-hover:opacity-100" />

          <CardContent className="relative p-6">
            <div className="flex items-start justify-between">
              <div className="space-y-1">
                <p className="text-sm font-medium text-muted-foreground">
                  {card.title}
                </p>
                <div className="flex items-baseline gap-2">
                  <span className="font-display text-3xl font-bold tracking-tight">
                    {card.value}
                  </span>
                  {card.trend === 'up' && (
                    <span className="flex items-center text-xs font-medium text-emerald-600 dark:text-emerald-400">
                      <ArrowUpRight className="h-3 w-3" />
                      Good
                    </span>
                  )}
                </div>
                <p className="text-xs text-muted-foreground/80">
                  {card.description}
                </p>
              </div>
              <div
                className={cn(
                  'flex h-12 w-12 items-center justify-center rounded-xl transition-transform duration-300 group-hover:scale-110',
                  card.bgColor
                )}
              >
                <card.icon className={cn('h-6 w-6', card.color)} />
              </div>
            </div>
          </CardContent>
        </Card>
      ))}
    </div>
  )
}
