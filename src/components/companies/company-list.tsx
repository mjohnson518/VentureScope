'use client'

import { useState, useCallback } from 'react'
import { useRouter } from 'next/navigation'
import { Loader2 } from 'lucide-react'

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
import { CompanyCard } from './company-card'
import { KanbanBoard } from './kanban'
import type { ViewMode } from './view-toggle'

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
  pipeline_position?: number
}

interface CompanyListProps {
  initialCompanies: Company[]
  status?: string
  search?: string
  view?: ViewMode
}

export function CompanyList({ initialCompanies, status, search, view = 'grid' }: CompanyListProps) {
  const router = useRouter()
  const [companies, setCompanies] = useState<Company[]>(initialCompanies)
  const [deleteId, setDeleteId] = useState<string | null>(null)
  const [isDeleting, setIsDeleting] = useState(false)

  // Refresh data from server after mutations
  const refreshData = useCallback(() => {
    router.refresh()
  }, [router])

  const handleDelete = async (id?: string) => {
    const targetId = id || deleteId
    if (!targetId) return

    if (!id) {
      // If called from dialog, proceed with delete
      setIsDeleting(true)
    }

    try {
      const response = await fetch(`/api/companies/${targetId}`, {
        method: 'DELETE',
      })

      if (!response.ok) throw new Error('Failed to delete company')

      // Optimistic update
      setCompanies((prev) => prev.filter((c) => c.id !== targetId))
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

  const handleDeleteClick = (id: string) => {
    setDeleteId(id)
  }

  // Show Kanban view when explicitly selected (status filter disabled in kanban mode)
  if (view === 'kanban') {
    return (
      <>
        <KanbanBoard
          initialCompanies={companies}
          onDeleteCompany={(id) => handleDelete(id)}
        />
        <DeleteDialog
          open={!!deleteId}
          onOpenChange={() => setDeleteId(null)}
          onConfirm={() => handleDelete()}
          isDeleting={isDeleting}
        />
      </>
    )
  }

  return (
    <>
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3 stagger-children">
        {companies.map((company, index) => (
          <CompanyCard
            key={company.id}
            company={company}
            onDelete={handleDeleteClick}
            style={{ animationDelay: `${index * 50}ms` }}
          />
        ))}
      </div>

      <DeleteDialog
        open={!!deleteId}
        onOpenChange={() => setDeleteId(null)}
        onConfirm={() => handleDelete()}
        isDeleting={isDeleting}
      />
    </>
  )
}

interface DeleteDialogProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  onConfirm: () => void
  isDeleting: boolean
}

function DeleteDialog({ open, onOpenChange, onConfirm, isDeleting }: DeleteDialogProps) {
  return (
    <AlertDialog open={open} onOpenChange={onOpenChange}>
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
            onClick={onConfirm}
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
  )
}
