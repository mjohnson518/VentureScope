import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Building2, FileText, TrendingUp, Clock } from 'lucide-react'

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
      description: 'Companies in pipeline',
    },
    {
      title: 'Assessments',
      value: stats.totalAssessments,
      icon: FileText,
      description: 'All time',
    },
    {
      title: 'Avg. Score',
      value: stats.avgScore ? stats.avgScore.toFixed(1) : '-',
      icon: TrendingUp,
      description: 'Across all deals',
    },
    {
      title: 'This Month',
      value: stats.assessmentsThisMonth,
      icon: Clock,
      description: 'Assessments generated',
    },
  ]

  return (
    <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
      {cards.map((card) => (
        <Card key={card.title}>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">{card.title}</CardTitle>
            <card.icon className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{card.value}</div>
            <p className="text-xs text-muted-foreground">{card.description}</p>
          </CardContent>
        </Card>
      ))}
    </div>
  )
}
