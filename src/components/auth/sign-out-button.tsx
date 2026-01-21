'use client'

import { signOut } from 'next-auth/react'
import { Button } from '@/components/ui/button'
import { LogOut } from 'lucide-react'

interface SignOutButtonProps {
  variant?: 'default' | 'ghost' | 'outline'
  showIcon?: boolean
  className?: string
}

export function SignOutButton({
  variant = 'ghost',
  showIcon = true,
  className,
}: SignOutButtonProps) {
  return (
    <Button
      variant={variant}
      onClick={() => signOut({ callbackUrl: '/' })}
      className={className}
    >
      {showIcon && <LogOut className="mr-2 h-4 w-4" />}
      Sign out
    </Button>
  )
}
