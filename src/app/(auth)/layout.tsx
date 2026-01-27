export default function AuthLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <div className="min-h-screen flex">
      {/* Left side - Branding */}
      <div className="hidden lg:flex lg:w-1/2 bg-gradient-to-br from-primary via-primary to-primary/80 text-primary-foreground flex-col justify-between p-12 relative overflow-hidden">
        <div className="absolute inset-0 bg-dot-pattern opacity-15" />
        <div className="relative">
          <h1 className="text-2xl font-bold font-display tracking-tight">VentureScope</h1>
        </div>
        <div className="relative space-y-6">
          <blockquote className="text-xl font-medium leading-relaxed">
            &ldquo;VentureScope transformed our due diligence process. What used to take
            our team 40+ hours now takes minutes, with better insights than ever before.&rdquo;
          </blockquote>
          <div>
            <p className="font-semibold">Sarah Chen</p>
            <p className="text-primary-foreground/80">Partner, Horizon Ventures</p>
          </div>
        </div>
        <div className="relative flex gap-8 text-sm text-primary-foreground/80">
          <div>
            <p className="text-3xl font-bold font-display tracking-tight text-primary-foreground">500+</p>
            <p className="text-overline">Assessments Generated</p>
          </div>
          <div>
            <p className="text-3xl font-bold font-display tracking-tight text-primary-foreground">40hrs</p>
            <p className="text-overline">Saved Per Deal</p>
          </div>
          <div>
            <p className="text-3xl font-bold font-display tracking-tight text-primary-foreground">98%</p>
            <p className="text-overline">Accuracy Rate</p>
          </div>
        </div>
      </div>

      {/* Right side - Auth form */}
      <div className="flex-1 flex items-center justify-center p-8 bg-mesh">
        <div className="w-full max-w-md">
          {children}
        </div>
      </div>
    </div>
  )
}
