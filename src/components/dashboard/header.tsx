'use client'

import { useSession } from 'next-auth/react'
import { Bell, Search, Moon, Sun, Command } from 'lucide-react'
import { useTheme } from 'next-themes'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar'
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu'
import { SignOutButton } from '@/components/auth/sign-out-button'
import Link from 'next/link'

export function Header() {
  const { data: session } = useSession()
  const { theme, setTheme } = useTheme()

  const userInitials = session?.user?.name
    ?.split(' ')
    .map((n) => n[0])
    .join('')
    .toUpperCase() || session?.user?.email?.[0]?.toUpperCase() || 'U'

  return (
    <header className="sticky top-0 z-40 flex h-16 items-center gap-4 border-b border-border/50 bg-background/80 backdrop-blur-xl px-6">
      {/* Search */}
      <div className="flex-1 max-w-md">
        <div className="relative group">
          <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground transition-colors group-focus-within:text-primary" />
          <Input
            placeholder="Search companies, assessments..."
            className="pl-9 pr-12 bg-muted/30 border-border/50 focus:border-primary/50 focus:bg-background transition-all"
          />
          <kbd className="absolute right-3 top-1/2 -translate-y-1/2 pointer-events-none hidden sm:inline-flex h-5 select-none items-center gap-1 rounded border border-border/50 bg-muted/50 px-1.5 font-mono text-[10px] font-medium text-muted-foreground">
            <Command className="h-3 w-3" />K
          </kbd>
        </div>
      </div>

      <div className="flex items-center gap-1">
        {/* Theme Toggle */}
        <Button
          variant="ghost"
          size="icon"
          className="h-9 w-9 rounded-xl hover:bg-muted/50 transition-colors"
          onClick={() => setTheme(theme === 'dark' ? 'light' : 'dark')}
        >
          <Sun className="h-[18px] w-[18px] rotate-0 scale-100 transition-all dark:-rotate-90 dark:scale-0" />
          <Moon className="absolute h-[18px] w-[18px] rotate-90 scale-0 transition-all dark:rotate-0 dark:scale-100" />
          <span className="sr-only">Toggle theme</span>
        </Button>

        {/* Notifications */}
        <Button variant="ghost" size="icon" className="relative h-9 w-9 rounded-xl hover:bg-muted/50 transition-colors">
          <Bell className="h-[18px] w-[18px]" />
          <span className="absolute right-2 top-2 h-2 w-2 rounded-full bg-primary ring-2 ring-background animate-pulse" />
          <span className="sr-only">Notifications</span>
        </Button>

        {/* User Menu */}
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button variant="ghost" className="relative h-9 w-9 rounded-full ml-1 ring-offset-background transition-all hover:ring-2 hover:ring-primary/20 hover:ring-offset-2">
              <Avatar className="h-9 w-9 border-2 border-border/50">
                <AvatarImage
                  src={session?.user?.image || undefined}
                  alt={session?.user?.name || 'User'}
                />
                <AvatarFallback className="bg-gradient-primary text-white font-medium">
                  {userInitials}
                </AvatarFallback>
              </Avatar>
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent className="w-56 p-2" align="end" forceMount>
            <DropdownMenuLabel className="font-normal px-2 py-1.5">
              <div className="flex flex-col space-y-1">
                <p className="text-sm font-medium leading-none">
                  {session?.user?.name || 'User'}
                </p>
                <p className="text-xs leading-none text-muted-foreground">
                  {session?.user?.email}
                </p>
              </div>
            </DropdownMenuLabel>
            <DropdownMenuSeparator className="my-1" />
            {session?.user?.organization && (
              <>
                <DropdownMenuLabel className="text-xs text-muted-foreground px-2">
                  {session.user.organization.name}
                </DropdownMenuLabel>
                <DropdownMenuSeparator className="my-1" />
              </>
            )}
            <DropdownMenuItem asChild className="rounded-lg cursor-pointer">
              <Link href="/dashboard/settings">Settings</Link>
            </DropdownMenuItem>
            <DropdownMenuItem asChild className="rounded-lg cursor-pointer">
              <Link href="/dashboard/settings/billing">Billing</Link>
            </DropdownMenuItem>
            <DropdownMenuSeparator className="my-1" />
            <DropdownMenuItem asChild className="rounded-lg">
              <SignOutButton
                variant="ghost"
                showIcon={false}
                className="w-full justify-start px-2 py-1.5 h-auto font-normal"
              />
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      </div>
    </header>
  )
}
