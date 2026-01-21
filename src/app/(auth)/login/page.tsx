import Link from 'next/link'
import { Metadata } from 'next'
import { OAuthButtons } from '@/components/auth/oauth-buttons'
import { EmailLoginForm } from '@/components/auth/email-login-form'
import { Separator } from '@/components/ui/separator'

export const metadata: Metadata = {
  title: 'Sign In - VentureScope',
  description: 'Sign in to your VentureScope account',
}

interface LoginPageProps {
  searchParams: Promise<{ redirect?: string; error?: string }>
}

export default async function LoginPage({ searchParams }: LoginPageProps) {
  const params = await searchParams
  const callbackUrl = params.redirect || '/dashboard'
  const error = params.error

  return (
    <div className="space-y-6">
      <div className="space-y-2 text-center">
        <h1 className="text-2xl font-bold tracking-tight">Welcome back</h1>
        <p className="text-muted-foreground">
          Sign in to your account to continue
        </p>
      </div>

      {error && (
        <div className="bg-destructive/10 text-destructive text-sm p-3 rounded-md">
          {error === 'OAuthAccountNotLinked'
            ? 'This email is already associated with another account. Please sign in with your original provider.'
            : 'An error occurred during sign in. Please try again.'}
        </div>
      )}

      <OAuthButtons callbackUrl={callbackUrl} />

      <div className="relative">
        <div className="absolute inset-0 flex items-center">
          <Separator className="w-full" />
        </div>
        <div className="relative flex justify-center text-xs uppercase">
          <span className="bg-background px-2 text-muted-foreground">
            Or continue with email
          </span>
        </div>
      </div>

      <EmailLoginForm callbackUrl={callbackUrl} />

      <p className="text-center text-sm text-muted-foreground">
        Don&apos;t have an account?{' '}
        <Link
          href="/signup"
          className="font-medium text-primary underline-offset-4 hover:underline"
        >
          Sign up
        </Link>
      </p>

      <p className="text-center text-xs text-muted-foreground">
        By continuing, you agree to our{' '}
        <Link href="/terms" className="underline underline-offset-4 hover:text-primary">
          Terms of Service
        </Link>{' '}
        and{' '}
        <Link href="/privacy" className="underline underline-offset-4 hover:text-primary">
          Privacy Policy
        </Link>
      </p>
    </div>
  )
}
