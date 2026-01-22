'use client'

import { useState, useCallback } from 'react'
import { useRouter } from 'next/navigation'
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
  Loader2,
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
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from '@/components/ui/alert-dialog'
import { toast } from 'sonner'

export interface Company {
  id: string
  name: string
  stage: string | null
  sector: string | null
  raise_amount: number | null
  valuation: number | null
  status: string
  website: string | null
  description: string | null
  created_at: string
  documentCount: number
  assessmentCount: number
}

const stageLabels: Record<string, string> = {
  pre_seed: 'Pre-Seed',
  seed: 'Seed',
  series_a: 'Series A',
  series_b: 'Series B',
  series_c: 'Series C',
  growth: 'Growth',
}

const statusColors: Record<string, string> = {
  active: 'bg-blue-500',
  watching: 'bg-yellow-500',
  passed: 'bg-gray-500',
  invested: 'bg-green-500',
}

function formatCurrency(value: number): string {
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

interface CompanyListProps {
  initialCompanies: Company[]
  status?: string
  search?: string
}

export function CompanyList({ initialCompanies, status, search }: CompanyListProps) {
  const router = useRouter()
  const [companies, setCompanies] = useState<Company[]>(initialCompanies)
  const [deleteId, setDeleteId] = useState<string | null>(null)
  const [isDeleting, setIsDeleting] = useState(false)

  // Refresh data from server after mutations
  const refreshData = useCallback(() => {
    router.refresh()
  }, [router])

  const handleDelete = async () => {
    if (!deleteId) return

    setIsDeleting(true)
    try {
      const response = await fetch(`/api/companies/${deleteId}`, {
        method: 'DELETE',
      })

      if (!response.ok) throw new Error('Failed to delete company')

      // Optimistic update
      setCompanies((prev) => prev.filter((c) => c.id !== deleteId))
      toast.success('Company deleted')
      // Refresh server data in background
      refreshData()
    } catch (error) {
      console.error('Error deleting company:', error)
      toast.error('Failed to delete company')
    } finally {
      setIsDeleting(false)
      setDeleteId(null)
    }
  }

  return (
    <>
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3 stagger-children">
        {companies.map((company, index) => (
          <Card
            key={company.id}
            className="group border-border/50 bg-card/80 backdrop-blur-sm hover-lift"
            style={{ animationDelay: `${index * 50}ms` }}
          >
            <CardHeader className="pb-3">
              <div className="flex items-start justify-between">
                <div className="space-y-1">
                  <CardTitle className="text-lg font-display">
                    <Link
                      href={`/dashboard/companies/${company.id}`}
                      className="hover:text-primary transition-colors"
                    >
                      {company.name}
                    </Link>
                  </CardTitle>
                  <CardDescription className="flex items-center gap-2">
                    {company.stage && (
                      <Badge variant="secondary">
                        {stageLabels[company.stage] || company.stage}
                      </Badge>
                    )}
                    {company.sector && (
                      <span className="text-xs">{company.sector}</span>
                    )}
                  </CardDescription>
                </div>
                <DropdownMenu>
                  <DropdownMenuTrigger asChild>
                    <Button variant="ghost" size="icon" className="h-8 w-8">
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
                    <DropdownMenuSeparator />
                    <DropdownMenuItem
                      className="text-destructive"
                      onClick={() => setDeleteId(company.id)}
                    >
                      <Trash2 className="mr-2 h-4 w-4" />
                      Delete
                    </DropdownMenuItem>
                  </DropdownMenuContent>
                </DropdownMenu>
              </div>
            </CardHeader>
            <CardContent>
              {company.description && (
                <p className="text-sm text-muted-foreground line-clamp-2 mb-4">
                  {company.description}
                </p>
              )}

              <div className="flex items-center gap-4 text-sm text-muted-foreground mb-4">
                {company.raise_amount && (
                  <div>
                    <span className="font-medium text-foreground">
                      {formatCurrency(company.raise_amount)}
                    </span>{' '}
                    raise
                  </div>
                )}
                {company.valuation && (
                  <div>
                    <span className="font-medium text-foreground">
                      {formatCurrency(company.valuation)}
                    </span>{' '}
                    val
                  </div>
                )}
              </div>

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
                <div className="flex items-center gap-2">
                  <div
                    className={`h-2 w-2 rounded-full ${statusColors[company.status] || 'bg-gray-500'}`}
                  />
                  <span className="text-xs capitalize">{company.status}</span>
                </div>
              </div>

              <p className="text-xs text-muted-foreground mt-3">
                Added {formatDistanceToNow(new Date(company.created_at), { addSuffix: true })}
              </p>
            </CardContent>
          </Card>
        ))}
      </div>

      <AlertDialog open={!!deleteId} onOpenChange={() => setDeleteId(null)}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Delete Company</AlertDialogTitle>
            <AlertDialogDescription>
              Are you sure you want to delete this company? This will also delete
              all associated documents and assessments. This action cannot be
              undone.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction
              onClick={handleDelete}
              className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
              disabled={isDeleting}
            >
              {isDeleting ? (
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
              ) : null}
              Delete
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </>
  )
}
