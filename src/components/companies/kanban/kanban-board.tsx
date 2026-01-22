'use client'

import { useState, useCallback, useMemo } from 'react'
import { useRouter } from 'next/navigation'
import {
  DndContext,
  DragOverlay,
  closestCorners,
  PointerSensor,
  useSensor,
  useSensors,
  type DragStartEvent,
  type DragEndEvent,
  type DragOverEvent,
} from '@dnd-kit/core'
import { arrayMove } from '@dnd-kit/sortable'
import { toast } from 'sonner'

import { KanbanColumn } from './kanban-column'
import { CompanyCard } from '../company-card'
import type { Company } from '../company-list'
import type { CompanyStatus } from '@/types/database'

interface KanbanBoardProps {
  initialCompanies: Company[]
  onDeleteCompany?: (id: string) => void
}

const STATUSES: CompanyStatus[] = ['active', 'watching', 'invested', 'passed']

export function KanbanBoard({ initialCompanies, onDeleteCompany }: KanbanBoardProps) {
  const router = useRouter()
  const [companies, setCompanies] = useState<Company[]>(initialCompanies)
  const [activeCompany, setActiveCompany] = useState<Company | null>(null)

  const sensors = useSensors(
    useSensor(PointerSensor, {
      activationConstraint: {
        distance: 8,
      },
    })
  )

  const companiesByStatus = useMemo(() => {
    const grouped: Record<CompanyStatus, Company[]> = {
      active: [],
      watching: [],
      invested: [],
      passed: [],
    }
    companies.forEach((company) => {
      const status = company.status as CompanyStatus
      if (grouped[status]) {
        grouped[status].push(company)
      }
    })
    // Sort by pipeline_position within each status
    Object.keys(grouped).forEach((status) => {
      grouped[status as CompanyStatus].sort((a, b) => {
        const posA = (a as Company & { pipeline_position?: number }).pipeline_position ?? 0
        const posB = (b as Company & { pipeline_position?: number }).pipeline_position ?? 0
        return posA - posB
      })
    })
    return grouped
  }, [companies])

  const findCompanyColumn = useCallback(
    (companyId: string): CompanyStatus | null => {
      const company = companies.find((c) => c.id === companyId)
      return company ? (company.status as CompanyStatus) : null
    },
    [companies]
  )

  const handleDragStart = useCallback(
    (event: DragStartEvent) => {
      const { active } = event
      const company = companies.find((c) => c.id === active.id)
      if (company) {
        setActiveCompany(company)
      }
    },
    [companies]
  )

  const handleDragOver = useCallback(
    (event: DragOverEvent) => {
      const { active, over } = event
      if (!over) return

      const activeId = active.id as string
      const overId = over.id as string

      const activeColumn = findCompanyColumn(activeId)
      const overColumn = STATUSES.includes(overId as CompanyStatus)
        ? (overId as CompanyStatus)
        : findCompanyColumn(overId)

      if (!activeColumn || !overColumn || activeColumn === overColumn) return

      setCompanies((prev) => {
        return prev.map((company) =>
          company.id === activeId
            ? { ...company, status: overColumn }
            : company
        )
      })
    },
    [findCompanyColumn]
  )

  const handleDragEnd = useCallback(
    async (event: DragEndEvent) => {
      const { active, over } = event
      setActiveCompany(null)

      if (!over) return

      const activeId = active.id as string
      const overId = over.id as string

      const company = companies.find((c) => c.id === activeId)
      if (!company) return

      const overColumn = STATUSES.includes(overId as CompanyStatus)
        ? (overId as CompanyStatus)
        : findCompanyColumn(overId)

      if (!overColumn) return

      // If dropping on another company, reorder within the column
      if (!STATUSES.includes(overId as CompanyStatus)) {
        const columnCompanies = companiesByStatus[overColumn]
        const oldIndex = columnCompanies.findIndex((c) => c.id === activeId)
        const newIndex = columnCompanies.findIndex((c) => c.id === overId)

        if (oldIndex !== -1 && newIndex !== -1 && oldIndex !== newIndex) {
          const reordered = arrayMove(columnCompanies, oldIndex, newIndex)
          setCompanies((prev) => {
            const other = prev.filter((c) => c.status !== overColumn)
            return [...other, ...reordered]
          })
        }
      }

      // Persist the change to the server
      const originalStatus = initialCompanies.find((c) => c.id === activeId)?.status
      if (company.status !== originalStatus || originalStatus !== overColumn) {
        try {
          const response = await fetch(`/api/companies/${activeId}`, {
            method: 'PATCH',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ status: overColumn }),
          })

          if (!response.ok) {
            throw new Error('Failed to update company status')
          }

          toast.success(`Moved to ${overColumn}`)
          router.refresh()
        } catch (error) {
          console.error('Error updating company status:', error)
          toast.error('Failed to update company status')
          // Rollback on error
          setCompanies(initialCompanies)
        }
      }
    },
    [companies, companiesByStatus, findCompanyColumn, initialCompanies, router]
  )

  const handleDelete = useCallback(
    (id: string) => {
      setCompanies((prev) => prev.filter((c) => c.id !== id))
      onDeleteCompany?.(id)
    },
    [onDeleteCompany]
  )

  return (
    <DndContext
      sensors={sensors}
      collisionDetection={closestCorners}
      onDragStart={handleDragStart}
      onDragOver={handleDragOver}
      onDragEnd={handleDragEnd}
    >
      <div className="flex gap-4 overflow-x-auto pb-4 snap-x snap-mandatory md:snap-none">
        {STATUSES.map((status) => (
          <KanbanColumn
            key={status}
            status={status}
            companies={companiesByStatus[status]}
            onDelete={handleDelete}
          />
        ))}
      </div>
      <DragOverlay>
        {activeCompany ? (
          <div className="rotate-3 scale-105">
            <CompanyCard company={activeCompany} showStatus={false} compact />
          </div>
        ) : null}
      </DragOverlay>
    </DndContext>
  )
}
