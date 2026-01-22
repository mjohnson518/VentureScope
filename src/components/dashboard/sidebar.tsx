'use client'

import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { cn } from '@/lib/utils'
import {
  LayoutDashboard,
  Building2,
  FileText,
  Users,
  Settings,
  CreditCard,
  HelpCircle,
  ChevronLeft,
  ChevronRight,
  Sparkles,
} from 'lucide-react'
import { Button } from '@/components/ui/button'
import { useState } from 'react'
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from '@/components/ui/tooltip'

const mainNavItems = [
  {
    title: 'Dashboard',
    href: '/dashboard',
    icon: LayoutDashboard,
  },
  {
    title: 'Companies',
    href: '/dashboard/companies',
    icon: Building2,
  },
  {
    title: 'Assessments',
    href: '/dashboard/assessments',
    icon: FileText,
  },
  {
    title: 'Team',
    href: '/dashboard/team',
    icon: Users,
  },
]

const bottomNavItems = [
  {
    title: 'Settings',
    href: '/dashboard/settings',
    icon: Settings,
  },
  {
    title: 'Billing',
    href: '/dashboard/billing',
    icon: CreditCard,
  },
  {
    title: 'Help',
    href: '/help',
    icon: HelpCircle,
  },
]

export function Sidebar() {
  const pathname = usePathname()
  const [collapsed, setCollapsed] = useState(false)

  return (
    <TooltipProvider delayDuration={0}>
      <aside
        className={cn(
          'flex h-screen flex-col border-r border-sidebar-border/50 bg-sidebar/95 backdrop-blur-xl transition-all duration-300 ease-out',
          collapsed ? 'w-[72px]' : 'w-64'
        )}
      >
        {/* Logo */}
        <div className="flex h-16 items-center justify-between border-b border-sidebar-border/50 px-4">
          {!collapsed && (
            <Link href="/dashboard" className="flex items-center gap-2 group">
              <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-gradient-primary">
                <Sparkles className="h-4 w-4 text-white" />
              </div>
              <span className="font-display text-lg font-semibold tracking-tight group-hover:text-primary transition-colors">
                VentureScope
              </span>
            </Link>
          )}
          {collapsed && (
            <Link href="/dashboard" className="mx-auto">
              <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-gradient-primary hover:scale-105 transition-transform">
                <Sparkles className="h-4 w-4 text-white" />
              </div>
            </Link>
          )}
          <Button
            variant="ghost"
            size="icon"
            className={cn(
              'h-8 w-8 text-muted-foreground hover:text-foreground hover:bg-sidebar-accent',
              collapsed && 'hidden'
            )}
            onClick={() => setCollapsed(!collapsed)}
          >
            <ChevronLeft className="h-4 w-4" />
          </Button>
        </div>

        {/* Expand button when collapsed */}
        {collapsed && (
          <div className="flex justify-center py-2">
            <Button
              variant="ghost"
              size="icon"
              className="h-8 w-8 text-muted-foreground hover:text-foreground hover:bg-sidebar-accent"
              onClick={() => setCollapsed(!collapsed)}
            >
              <ChevronRight className="h-4 w-4" />
            </Button>
          </div>
        )}

        {/* Main Navigation */}
        <nav className="flex-1 space-y-1 p-3">
          {mainNavItems.map((item) => {
            const isActive =
              pathname === item.href || pathname.startsWith(`${item.href}/`)

            const linkContent = (
              <Link
                href={item.href}
                className={cn(
                  'group flex items-center gap-3 rounded-xl px-3 py-2.5 text-sm font-medium transition-all duration-200',
                  isActive
                    ? 'bg-sidebar-accent text-sidebar-accent-foreground shadow-sm'
                    : 'text-sidebar-foreground/80 hover:bg-sidebar-accent/50 hover:text-sidebar-accent-foreground',
                  collapsed && 'justify-center px-2'
                )}
              >
                <item.icon
                  className={cn(
                    'h-5 w-5 shrink-0 transition-transform duration-200',
                    isActive && 'text-primary',
                    !collapsed && 'group-hover:scale-110'
                  )}
                />
                {!collapsed && <span>{item.title}</span>}
              </Link>
            )

            if (collapsed) {
              return (
                <Tooltip key={item.href}>
                  <TooltipTrigger asChild>{linkContent}</TooltipTrigger>
                  <TooltipContent side="right" className="font-medium">
                    {item.title}
                  </TooltipContent>
                </Tooltip>
              )
            }

            return <div key={item.href}>{linkContent}</div>
          })}
        </nav>

        {/* Bottom Navigation */}
        <nav className="border-t border-sidebar-border/50 p-3 space-y-1">
          {bottomNavItems.map((item) => {
            const isActive = pathname === item.href

            const linkContent = (
              <Link
                href={item.href}
                className={cn(
                  'group flex items-center gap-3 rounded-xl px-3 py-2.5 text-sm font-medium transition-all duration-200',
                  isActive
                    ? 'bg-sidebar-accent text-sidebar-accent-foreground'
                    : 'text-sidebar-foreground/70 hover:bg-sidebar-accent/50 hover:text-sidebar-accent-foreground',
                  collapsed && 'justify-center px-2'
                )}
              >
                <item.icon
                  className={cn(
                    'h-5 w-5 shrink-0 transition-transform duration-200',
                    !collapsed && 'group-hover:scale-110'
                  )}
                />
                {!collapsed && <span>{item.title}</span>}
              </Link>
            )

            if (collapsed) {
              return (
                <Tooltip key={item.href}>
                  <TooltipTrigger asChild>{linkContent}</TooltipTrigger>
                  <TooltipContent side="right" className="font-medium">
                    {item.title}
                  </TooltipContent>
                </Tooltip>
              )
            }

            return <div key={item.href}>{linkContent}</div>
          })}
        </nav>
      </aside>
    </TooltipProvider>
  )
}
