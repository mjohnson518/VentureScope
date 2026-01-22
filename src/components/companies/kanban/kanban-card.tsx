'use client'

import { useSortable } from '@dnd-kit/sortable'
import { CSS } from '@dnd-kit/utilities'
import { GripVertical } from 'lucide-react'
import { CompanyCard } from '../company-card'
import type { Company } from '../company-list'

interface KanbanCardProps {
  company: Company
  onDelete?: (id: string) => void
}

export function KanbanCard({ company, onDelete }: KanbanCardProps) {
  const {
    attributes,
    listeners,
    setNodeRef,
    transform,
    transition,
    isDragging,
  } = useSortable({
    id: company.id,
    data: {
      type: 'company',
      company,
    },
  })

  const style = {
    transform: CSS.Transform.toString(transform),
    transition,
    opacity: isDragging ? 0.5 : 1,
  }

  return (
    <div ref={setNodeRef} style={style} className="relative group/card">
      <div
        {...attributes}
        {...listeners}
        className="absolute left-1 top-1/2 -translate-y-1/2 opacity-0 group-hover/card:opacity-100 cursor-grab active:cursor-grabbing z-10 p-1 rounded hover:bg-muted transition-opacity"
      >
        <GripVertical className="h-4 w-4 text-muted-foreground" />
      </div>
      <CompanyCard
        company={company}
        onDelete={onDelete}
        showStatus={false}
        compact
        className="pl-6"
      />
    </div>
  )
}
