export default function AuthLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <div className="min-h-screen flex">
      {/* Left side - Branding */}
      <div className="hidden lg:flex lg:w-1/2 bg-primary text-primary-foreground flex-col justify-between p-12">
        <div>
          <h1 className="text-2xl font-bold">VentureScope</h1>
        </div>
        <div className="space-y-6">
          <blockquote className="text-xl font-medium leading-relaxed">
            "VentureScope transformed our due diligence process. What used to take
            our team 40+ hours now takes minutes, with better insights than ever before."
          </blockquote>
          <div>
            <p className="font-semibold">Sarah Chen</p>
            <p className="text-primary-foreground/80">Partner, Horizon Ventures</p>
          </div>
        </div>
        <div className="flex gap-8 text-sm text-primary-foreground/80">
          <div>
            <p className="text-3xl font-bold text-primary-foreground">500+</p>
            <p>Assessments Generated</p>
          </div>
          <div>
            <p className="text-3xl font-bold text-primary-foreground">40hrs</p>
            <p>Saved Per Deal</p>
          </div>
          <div>
            <p className="text-3xl font-bold text-primary-foreground">98%</p>
            <p>Accuracy Rate</p>
          </div>
        </div>
      </div>

      {/* Right side - Auth form */}
      <div className="flex-1 flex items-center justify-center p-8">
        <div className="w-full max-w-md">
          {children}
        </div>
      </div>
    </div>
  )
}
