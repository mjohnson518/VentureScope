import Link from 'next/link'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import {
  FileText,
  MessageSquare,
  BarChart3,
  Users,
  Zap,
  Shield,
  ArrowRight,
  Check,
} from 'lucide-react'

const features = [
  {
    icon: FileText,
    title: 'Document Analysis',
    description:
      'Upload pitch decks, financials, and cap tables. Our AI extracts and analyzes key information automatically.',
  },
  {
    icon: BarChart3,
    title: 'Investment Memos',
    description:
      'Generate comprehensive screening and full investment memos with scoring across 9 key dimensions.',
  },
  {
    icon: MessageSquare,
    title: 'Deal Room Chat',
    description:
      'Ask questions about any deal. Our AI provides instant answers with citations from your documents.',
  },
  {
    icon: Users,
    title: 'Team Collaboration',
    description:
      'Share assessments with your investment committee. Add comments and collaborate in real-time.',
  },
  {
    icon: Zap,
    title: 'Lightning Fast',
    description:
      'Transform 40-80 hours of manual due diligence into a 5-minute AI-powered analysis.',
  },
  {
    icon: Shield,
    title: 'Enterprise Security',
    description:
      'Bank-grade encryption, SOC 2 compliant, and your data is never used to train AI models.',
  },
]

const stats = [
  { value: '40hrs', label: 'Saved per deal' },
  { value: '500+', label: 'Assessments generated' },
  { value: '98%', label: 'Accuracy rate' },
  { value: '50+', label: 'VC firms using' },
]

export default function HomePage() {
  return (
    <div className="flex min-h-screen flex-col">
      {/* Navigation */}
      <header className="sticky top-0 z-50 w-full border-b bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
        <div className="container flex h-16 items-center justify-between">
          <Link href="/" className="flex items-center space-x-2">
            <span className="text-xl font-bold font-display tracking-tight">VentureScope</span>
          </Link>
          <nav className="hidden md:flex items-center space-x-6 text-sm font-medium">
            <Link href="#features" className="text-muted-foreground hover:text-foreground">
              Features
            </Link>
            <Link href="#pricing" className="text-muted-foreground hover:text-foreground">
              Pricing
            </Link>
            <Link href="/login" className="text-muted-foreground hover:text-foreground">
              Sign In
            </Link>
            <Button asChild>
              <Link href="/signup">Get Started</Link>
            </Button>
          </nav>
          <div className="md:hidden">
            <Button asChild variant="outline" size="sm">
              <Link href="/login">Sign In</Link>
            </Button>
          </div>
        </div>
      </header>

      <main className="flex-1">
        {/* Hero Section */}
        <section className="relative py-20 md:py-28 lg:py-32">
          <div className="absolute inset-0 bg-dot-pattern opacity-40" />
          <div className="container relative space-y-8">
            <div className="flex flex-col items-center text-center space-y-4">
              <Badge variant="secondary" className="px-4 py-1">
                Trusted by 50+ VC firms
              </Badge>
              <h1 className="heading-hero text-4xl md:text-6xl lg:text-7xl font-bold max-w-4xl">
                AI-Powered Due Diligence for{' '}
                <span className="text-primary">Venture Capital</span>
              </h1>
              <p className="text-xl text-muted-foreground max-w-2xl leading-relaxed">
                Transform 40-80 hours of manual due diligence into a 5-minute AI-powered
                analysis. Generate investment memos, analyze documents, and make better
                decisions faster.
              </p>
              <div className="flex flex-col sm:flex-row gap-4 pt-4">
                <Button asChild size="lg" className="btn-gradient shadow-lg shadow-primary/25 hover:shadow-xl hover:shadow-primary/30 transition-shadow">
                  <Link href="/signup">
                    Start Free Trial
                    <ArrowRight className="ml-2 h-4 w-4" />
                  </Link>
                </Button>
                <Button asChild variant="outline" size="lg">
                  <Link href="#features">See How It Works</Link>
                </Button>
              </div>
            </div>

            {/* Stats */}
            <div className="grid grid-cols-2 md:grid-cols-4 gap-8 pt-12 border-t border-border/50">
              {stats.map((stat) => (
                <div key={stat.label} className="text-center">
                  <p className="text-3xl md:text-4xl font-bold font-display tracking-tight">{stat.value}</p>
                  <p className="text-overline text-muted-foreground mt-1">{stat.label}</p>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* Features Section */}
        <section id="features" className="py-20 md:py-28 lg:py-32">
          <div className="container space-y-12">
            <div className="text-center space-y-4">
              <h2 className="heading-section text-3xl md:text-4xl font-bold">
                Everything you need for deal evaluation
              </h2>
              <p className="text-xl text-muted-foreground max-w-2xl mx-auto leading-relaxed">
                From document upload to investment decision, VentureScope streamlines your
                entire due diligence workflow.
              </p>
            </div>

            <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8">
              {features.map((feature) => (
                <div
                  key={feature.title}
                  className="group relative bg-card/80 backdrop-blur-sm border rounded-xl p-6 space-y-4 transition-all duration-300 hover:-translate-y-1 hover:shadow-lg"
                >
                  <div className="absolute inset-0 rounded-xl bg-gradient-to-br from-primary/5 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
                  <div className="relative">
                    <div className="h-12 w-12 rounded-lg bg-primary/10 flex items-center justify-center transition-transform duration-300 group-hover:scale-110">
                      <feature.icon className="h-6 w-6 text-primary" />
                    </div>
                    <h3 className="heading-card text-xl font-semibold mt-4">{feature.title}</h3>
                    <p className="text-muted-foreground leading-relaxed mt-2">{feature.description}</p>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* How It Works */}
        <section className="relative border-y border-border/50 bg-muted/50 py-20 md:py-28 lg:py-32">
          <div className="absolute inset-0 bg-mesh" />
          <div className="container relative space-y-12">
            <div className="text-center space-y-4">
              <h2 className="heading-section text-3xl md:text-4xl font-bold">How It Works</h2>
              <p className="text-xl text-muted-foreground max-w-2xl mx-auto leading-relaxed">
                Three simple steps to transform your due diligence process
              </p>
            </div>

            <div className="grid md:grid-cols-3 gap-8">
              <div className="text-center space-y-4">
                <div className="h-16 w-16 rounded-full bg-gradient-primary text-primary-foreground flex items-center justify-center text-2xl font-bold font-display mx-auto shadow-lg shadow-primary/20">
                  1
                </div>
                <h3 className="heading-card text-xl font-semibold">Upload Documents</h3>
                <p className="text-muted-foreground leading-relaxed">
                  Drop your pitch deck, financials, cap table, and other deal room
                  documents. We support PDF, Excel, PowerPoint, and more.
                </p>
              </div>
              <div className="text-center space-y-4">
                <div className="h-16 w-16 rounded-full bg-gradient-primary text-primary-foreground flex items-center justify-center text-2xl font-bold font-display mx-auto shadow-lg shadow-primary/20">
                  2
                </div>
                <h3 className="heading-card text-xl font-semibold">Generate Analysis</h3>
                <p className="text-muted-foreground leading-relaxed">
                  Our AI reads and analyzes all documents, generating a comprehensive
                  investment memo with scores across 9 dimensions.
                </p>
              </div>
              <div className="text-center space-y-4">
                <div className="h-16 w-16 rounded-full bg-gradient-primary text-primary-foreground flex items-center justify-center text-2xl font-bold font-display mx-auto shadow-lg shadow-primary/20">
                  3
                </div>
                <h3 className="heading-card text-xl font-semibold">Make Decisions</h3>
                <p className="text-muted-foreground leading-relaxed">
                  Review the memo, ask follow-up questions, share with your team, and
                  make informed investment decisions faster.
                </p>
              </div>
            </div>
          </div>
        </section>

        {/* Pricing Preview */}
        <section id="pricing" className="py-20 md:py-28 lg:py-32">
          <div className="container space-y-12">
            <div className="text-center space-y-4">
              <h2 className="heading-section text-3xl md:text-4xl font-bold">Simple, Transparent Pricing</h2>
              <p className="text-xl text-muted-foreground max-w-2xl mx-auto leading-relaxed">
                Start free, upgrade when you need more. No hidden fees.
              </p>
            </div>

            <div className="grid md:grid-cols-3 gap-8 max-w-5xl mx-auto">
              {/* Free */}
              <div className="bg-card/80 backdrop-blur-sm border rounded-xl p-8 space-y-6 transition-all duration-300 hover:-translate-y-1 hover:shadow-lg">
                <div>
                  <h3 className="heading-card text-xl font-semibold">Free</h3>
                  <p className="text-muted-foreground">For trying it out</p>
                </div>
                <div>
                  <span className="text-4xl font-bold font-display tracking-tight">$0</span>
                  <span className="text-muted-foreground">/month</span>
                </div>
                <ul className="space-y-3">
                  <li className="flex items-center gap-2">
                    <Check className="h-4 w-4 text-primary" />
                    <span>2 Screening Memos/month</span>
                  </li>
                  <li className="flex items-center gap-2">
                    <Check className="h-4 w-4 text-primary" />
                    <span>30-day history</span>
                  </li>
                  <li className="flex items-center gap-2">
                    <Check className="h-4 w-4 text-primary" />
                    <span>Basic export</span>
                  </li>
                </ul>
                <Button asChild variant="outline" className="w-full">
                  <Link href="/signup">Get Started</Link>
                </Button>
              </div>

              {/* Angel */}
              <div className="relative border-2 border-primary rounded-xl p-8 space-y-6 shadow-xl shadow-primary/10 overflow-hidden">
                <div className="absolute top-0 left-0 right-0 h-1 bg-gradient-primary" />
                <Badge className="absolute -top-3 left-1/2 -translate-x-1/2 z-10">
                  Most Popular
                </Badge>
                <div>
                  <h3 className="heading-card text-xl font-semibold">Angel</h3>
                  <p className="text-muted-foreground">For individual investors</p>
                </div>
                <div>
                  <span className="text-4xl font-bold font-display tracking-tight">$149</span>
                  <span className="text-muted-foreground">/month</span>
                </div>
                <ul className="space-y-3">
                  <li className="flex items-center gap-2">
                    <Check className="h-4 w-4 text-primary" />
                    <span>10 Full Memos/month</span>
                  </li>
                  <li className="flex items-center gap-2">
                    <Check className="h-4 w-4 text-primary" />
                    <span>Unlimited history</span>
                  </li>
                  <li className="flex items-center gap-2">
                    <Check className="h-4 w-4 text-primary" />
                    <span>AI Chat</span>
                  </li>
                  <li className="flex items-center gap-2">
                    <Check className="h-4 w-4 text-primary" />
                    <span>PDF/DOCX export</span>
                  </li>
                </ul>
                <Button asChild className="w-full">
                  <Link href="/signup">Start Free Trial</Link>
                </Button>
              </div>

              {/* Pro */}
              <div className="bg-card/80 backdrop-blur-sm border rounded-xl p-8 space-y-6 transition-all duration-300 hover:-translate-y-1 hover:shadow-lg">
                <div>
                  <h3 className="heading-card text-xl font-semibold">Pro</h3>
                  <p className="text-muted-foreground">For VC teams</p>
                </div>
                <div>
                  <span className="text-4xl font-bold font-display tracking-tight">$499</span>
                  <span className="text-muted-foreground">/month</span>
                </div>
                <ul className="space-y-3">
                  <li className="flex items-center gap-2">
                    <Check className="h-4 w-4 text-primary" />
                    <span>50 Full Memos/month</span>
                  </li>
                  <li className="flex items-center gap-2">
                    <Check className="h-4 w-4 text-primary" />
                    <span>5 team members</span>
                  </li>
                  <li className="flex items-center gap-2">
                    <Check className="h-4 w-4 text-primary" />
                    <span>Collaboration tools</span>
                  </li>
                  <li className="flex items-center gap-2">
                    <Check className="h-4 w-4 text-primary" />
                    <span>API access</span>
                  </li>
                </ul>
                <Button asChild variant="outline" className="w-full">
                  <Link href="/signup">Start Free Trial</Link>
                </Button>
              </div>
            </div>
          </div>
        </section>

        {/* CTA Section */}
        <section className="relative bg-gradient-to-br from-primary via-primary to-primary/80 text-primary-foreground py-20 md:py-28 lg:py-32 overflow-hidden">
          <div className="absolute inset-0 bg-dot-pattern opacity-20" />
          <div className="container relative text-center space-y-8">
            <h2 className="heading-section text-3xl md:text-4xl font-bold">
              Ready to transform your due diligence?
            </h2>
            <p className="text-xl opacity-90 max-w-2xl mx-auto leading-relaxed">
              Join 50+ VC firms already using VentureScope to make better investment
              decisions faster.
            </p>
            <Button asChild size="lg" variant="secondary">
              <Link href="/signup">
                Start Your Free Trial
                <ArrowRight className="ml-2 h-4 w-4" />
              </Link>
            </Button>
          </div>
        </section>
      </main>

      {/* Footer */}
      <footer className="border-t py-12 md:py-16">
        <div className="container flex flex-col md:flex-row justify-between items-center gap-4">
          <div className="flex items-center space-x-2">
            <span className="font-bold font-display tracking-tight">VentureScope</span>
            <span className="text-muted-foreground">
              &copy; {new Date().getFullYear()}
            </span>
          </div>
          <nav className="flex gap-6 text-sm text-muted-foreground">
            <Link href="/privacy" className="hover:text-foreground">
              Privacy
            </Link>
            <Link href="/terms" className="hover:text-foreground">
              Terms
            </Link>
            <Link href="mailto:support@venturescope.ai" className="hover:text-foreground">
              Contact
            </Link>
          </nav>
        </div>
      </footer>
    </div>
  )
}
