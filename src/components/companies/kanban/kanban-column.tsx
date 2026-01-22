'use client'

import { useDroppable } from '@dnd-kit/core'
import {
  SortableContext,
  verticalListSortingStrategy,
} from '@dnd-kit/sortable'
import { KanbanCard } from './kanban-card'
import type { Company } from '../company-list'
import type { CompanyStatus } from '@/types/database'

interface KanbanColumnProps {
  status: CompanyStatus
  companies: Company[]
  onDelete?: (id: string) => void
}

const statusConfig: Record<CompanyStatus, { label: string; color: string; bgColor: string }> = {
  active: { label: 'Active', color: 'text-blue-500', bgColor: 'bg-blue-500/10' },
  watching: { label: 'Watching', color: 'text-yellow-500', bgColor: 'bg-yellow-500/10' },
  invested: { label: 'Invested', color: 'text-green-500', bgColor: 'bg-green-500/10' },
  passed: { label: 'Passed', color: 'text-gray-500', bgColor: 'bg-gray-500/10' },
}

export function KanbanColumn({ status, companies, onDelete }: KanbanColumnProps) {
  const { setNodeRef, isOver } = useDroppable({
    id: status,
    data: {
      type: 'column',
      status,
    },
  })

  const config = statusConfig[status]
  const companyIds = companies.map((c) => c.id)

  return (
    <div className="flex flex-col min-w-[280px] max-w-[320px] flex-1">
      <div className={`flex items-center gap-2 p-3 rounded-t-lg ${config.bgColor}`}>
        <div className={`h-3 w-3 rounded-full ${config.color.replace('text-', 'bg-')}`} />
        <h3 className={`font-semibold text-sm ${config.color}`}>{config.label}</h3>
        <span className="text-xs text-muted-foreground ml-auto">
          {companies.length}
        </span>
      </div>
      <div
        ref={setNodeRef}
        className={`flex-1 min-h-[200px] p-2 space-y-2 bg-muted/30 rounded-b-lg transition-colors ${
          isOver ? 'bg-muted/50 ring-2 ring-primary/30' : ''
        }`}
      >
        <SortableContext items={companyIds} strategy={verticalListSortingStrategy}>
          {companies.map((company) => (
            <KanbanCard key={company.id} company={company} onDelete={onDelete} />
          ))}
        </SortableContext>
        {companies.length === 0 && (
          <div className="flex items-center justify-center h-24 text-sm text-muted-foreground border-2 border-dashed rounded-lg">
            Drop here
          </div>
        )}
      </div>
    </div>
  )
}
