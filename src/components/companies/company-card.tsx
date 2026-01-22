'use client'

import Link from 'next/link'
import { formatDistanceToNow } from 'date-fns'
import {
  FileText,
  ClipboardCheck,
  ExternalLink,
  MoreHorizontal,
  Trash2,
  Edit,
  Eye,
} from 'lucide-react'

import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/components/ui/card'
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu'
import type { Company } from './company-list'

export const stageLabels: Record<string, string> = {
  pre_seed: 'Pre-Seed',
  seed: 'Seed',
  series_a: 'Series A',
  series_b: 'Series B',
  series_c: 'Series C',
  growth: 'Growth',
}

export const statusColors: Record<string, string> = {
  active: 'bg-blue-500',
  watching: 'bg-yellow-500',
  passed: 'bg-gray-500',
  invested: 'bg-green-500',
}

export function formatCurrency(value: number): string {
  if (value >= 1_000_000_000) {
    return `$${(value / 1_000_000_000).toFixed(1)}B`
  }
  if (value >= 1_000_000) {
    return `$${(value / 1_000_000).toFixed(1)}M`
  }
  if (value >= 1_000) {
    return `$${(value / 1_000).toFixed(0)}K`
  }
  return `$${value}`
}

interface CompanyCardProps {
  company: Company
  onDelete?: (id: string) => void
  showStatus?: boolean
  compact?: boolean
  style?: React.CSSProperties
  className?: string
}

export function CompanyCard({
  company,
  onDelete,
  showStatus = true,
  compact = false,
  style,
  className = '',
}: CompanyCardProps) {
  return (
    <Card
      className={`group border-border/50 bg-card/80 backdrop-blur-sm hover-lift ${className}`}
      style={style}
    >
      <CardHeader className={compact ? 'pb-2 p-3' : 'pb-3'}>
        <div className="flex items-start justify-between">
          <div className="space-y-1 min-w-0 flex-1">
            <CardTitle className={compact ? 'text-sm font-semibold' : 'text-lg font-display'}>
              <Link
                href={`/dashboard/companies/${company.id}`}
                className="hover:text-primary transition-colors truncate block"
              >
                {company.name}
              </Link>
            </CardTitle>
            <CardDescription className="flex items-center gap-2 flex-wrap">
              {company.stage && (
                <Badge variant="secondary" className={compact ? 'text-xs py-0' : ''}>
                  {stageLabels[company.stage] || company.stage}
                </Badge>
              )}
              {company.sector && !compact && (
                <span className="text-xs">{company.sector}</span>
              )}
            </CardDescription>
          </div>
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="ghost" size="icon" className="h-8 w-8 shrink-0">
                <MoreHorizontal className="h-4 w-4" />
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end">
              <DropdownMenuItem asChild>
                <Link href={`/dashboard/companies/${company.id}`}>
                  <Eye className="mr-2 h-4 w-4" />
                  View Details
                </Link>
              </DropdownMenuItem>
              <DropdownMenuItem asChild>
                <Link href={`/dashboard/companies/${company.id}/edit`}>
                  <Edit className="mr-2 h-4 w-4" />
                  Edit
                </Link>
              </DropdownMenuItem>
              {company.website && (
                <DropdownMenuItem asChild>
                  <a
                    href={company.website}
                    target="_blank"
                    rel="noopener noreferrer"
                  >
                    <ExternalLink className="mr-2 h-4 w-4" />
                    Visit Website
                  </a>
                </DropdownMenuItem>
              )}
              {onDelete && (
                <>
                  <DropdownMenuSeparator />
                  <DropdownMenuItem
                    className="text-destructive"
                    onClick={() => onDelete(company.id)}
                  >
                    <Trash2 className="mr-2 h-4 w-4" />
                    Delete
                  </DropdownMenuItem>
                </>
              )}
            </DropdownMenuContent>
          </DropdownMenu>
        </div>
      </CardHeader>
      <CardContent className={compact ? 'p-3 pt-0' : ''}>
        {company.description && !compact && (
          <p className="text-sm text-muted-foreground line-clamp-2 mb-4">
            {company.description}
          </p>
        )}

        <div className={`flex items-center gap-4 text-sm text-muted-foreground ${compact ? '' : 'mb-4'}`}>
          {company.raise_amount && (
            <div>
              <span className="font-medium text-foreground">
                {formatCurrency(company.raise_amount)}
              </span>{' '}
              {!compact && 'raise'}
            </div>
          )}
          {company.valuation && !compact && (
            <div>
              <span className="font-medium text-foreground">
                {formatCurrency(company.valuation)}
              </span>{' '}
              val
            </div>
          )}
        </div>

        {!compact && (
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3 text-sm text-muted-foreground">
              <div className="flex items-center gap-1">
                <FileText className="h-4 w-4" />
                {company.documentCount}
              </div>
              <div className="flex items-center gap-1">
                <ClipboardCheck className="h-4 w-4" />
                {company.assessmentCount}
              </div>
            </div>
            {showStatus && (
              <div className="flex items-center gap-2">
                <div
                  className={`h-2 w-2 rounded-full ${statusColors[company.status] || 'bg-gray-500'}`}
                />
                <span className="text-xs capitalize">{company.status}</span>
              </div>
            )}
          </div>
        )}

        {compact && (
          <div className="flex items-center gap-2 text-xs text-muted-foreground mt-2">
            <div className="flex items-center gap-1">
              <FileText className="h-3 w-3" />
              {company.documentCount}
            </div>
            <div className="flex items-center gap-1">
              <ClipboardCheck className="h-3 w-3" />
              {company.assessmentCount}
            </div>
          </div>
        )}

        {!compact && (
          <p className="text-xs text-muted-foreground mt-3">
            Added {formatDistanceToNow(new Date(company.created_at), { addSuffix: true })}
          </p>
        )}
      </CardContent>
    </Card>
  )
}
