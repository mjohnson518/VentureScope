import Link from 'next/link'
import { Metadata } from 'next'
import { OAuthButtons } from '@/components/auth/oauth-buttons'
import { EmailLoginForm } from '@/components/auth/email-login-form'
import { Separator } from '@/components/ui/separator'
import { Check } from 'lucide-react'

export const metadata: Metadata = {
  title: 'Sign Up - VentureScope',
  description: 'Create your VentureScope account',
}

const features = [
  'AI-powered due diligence memos',
  'Document analysis & extraction',
  'Interactive deal room chat',
  'Team collaboration tools',
]

export default function SignupPage() {
  return (
    <div className="space-y-6">
      <div className="space-y-2 text-center">
        <h1 className="text-2xl font-bold tracking-tight">Create an account</h1>
        <p className="text-muted-foreground">
          Start your free trial today
        </p>
      </div>

      <div className="bg-muted/50 rounded-lg p-4 space-y-2">
        {features.map((feature) => (
          <div key={feature} className="flex items-center gap-2 text-sm">
            <Check className="h-4 w-4 text-primary" />
            <span>{feature}</span>
          </div>
        ))}
      </div>

      <OAuthButtons callbackUrl="/dashboard" />

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

      <EmailLoginForm callbackUrl="/dashboard" />

      <p className="text-center text-sm text-muted-foreground">
        Already have an account?{' '}
        <Link
          href="/login"
          className="font-medium text-primary underline-offset-4 hover:underline"
        >
          Sign in
        </Link>
      </p>

      <p className="text-center text-xs text-muted-foreground">
        By creating an account, you agree to our{' '}
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
