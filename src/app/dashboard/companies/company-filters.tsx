'use client'

import { useRouter, useSearchParams } from 'next/navigation'
import { Search } from 'lucide-react'
import { Input } from '@/components/ui/input'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import { ViewToggle, type ViewMode } from '@/components/companies/view-toggle'
import { useCallback, useState, useTransition } from 'react'

const statuses = [
  { value: 'all', label: 'All Status' },
  { value: 'active', label: 'Active' },
  { value: 'watching', label: 'Watching' },
  { value: 'passed', label: 'Passed' },
  { value: 'invested', label: 'Invested' },
]

interface CompanyFiltersProps {
  currentStatus: string
  currentSearch: string
  currentView: ViewMode
}

export function CompanyFilters({ currentStatus, currentSearch, currentView }: CompanyFiltersProps) {
  const router = useRouter()
  const searchParams = useSearchParams()
  const [isPending, startTransition] = useTransition()
  const [search, setSearch] = useState(currentSearch)
  const [view, setView] = useState<ViewMode>(currentView)

  const updateFilters = useCallback(
    (key: string, value: string) => {
      const params = new URLSearchParams(searchParams.toString())
      if (value && value !== 'all') {
        params.set(key, value)
      } else {
        params.delete(key)
      }
      startTransition(() => {
        router.push(`/dashboard/companies?${params.toString()}`)
      })
    },
    [router, searchParams]
  )

  const handleSearchChange = (value: string) => {
    setSearch(value)
  }

  const handleSearchSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    updateFilters('search', search)
  }

  const handleViewChange = (newView: ViewMode) => {
    setView(newView)
    updateFilters('view', newView)
  }

  return (
    <div className="flex flex-col sm:flex-row gap-4 sm:items-center">
      <form onSubmit={handleSearchSubmit} className="relative flex-1 max-w-sm">
        <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
        <Input
          placeholder="Search companies..."
          className="pl-9"
          value={search}
          onChange={(e) => handleSearchChange(e.target.value)}
        />
      </form>

      {view !== 'kanban' && (
        <Select
          value={currentStatus}
          onValueChange={(value) => updateFilters('status', value)}
        >
          <SelectTrigger className="w-[160px]">
            <SelectValue placeholder="Filter by status" />
          </SelectTrigger>
          <SelectContent>
            {statuses.map((status) => (
              <SelectItem key={status.value} value={status.value}>
                {status.label}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      )}

      <ViewToggle view={view} onChange={handleViewChange} />
    </div>
  )
}
