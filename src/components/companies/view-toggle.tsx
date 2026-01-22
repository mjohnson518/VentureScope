'use client'

import { LayoutGrid, Columns3 } from 'lucide-react'
import { Button } from '@/components/ui/button'

export type ViewMode = 'grid' | 'kanban'

interface ViewToggleProps {
  view: ViewMode
  onChange: (view: ViewMode) => void
}

export function ViewToggle({ view, onChange }: ViewToggleProps) {
  return (
    <div className="flex items-center border rounded-md">
      <Button
        variant={view === 'grid' ? 'secondary' : 'ghost'}
        size="sm"
        className="rounded-r-none"
        onClick={() => onChange('grid')}
        title="Grid view"
      >
        <LayoutGrid className="h-4 w-4" />
      </Button>
      <Button
        variant={view === 'kanban' ? 'secondary' : 'ghost'}
        size="sm"
        className="rounded-l-none"
        onClick={() => onChange('kanban')}
        title="Kanban view"
      >
        <Columns3 className="h-4 w-4" />
      </Button>
    </div>
  )
}
