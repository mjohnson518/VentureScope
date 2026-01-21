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
            <span className="text-xl font-bold">VentureScope</span>
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
        <section className="container py-24 md:py-32 space-y-8">
          <div className="flex flex-col items-center text-center space-y-4">
            <Badge variant="secondary" className="px-4 py-1">
              Trusted by 50+ VC firms
            </Badge>
            <h1 className="text-4xl md:text-6xl font-bold tracking-tight max-w-4xl">
              AI-Powered Due Diligence for{' '}
              <span className="text-primary">Venture Capital</span>
            </h1>
            <p className="text-xl text-muted-foreground max-w-2xl">
              Transform 40-80 hours of manual due diligence into a 5-minute AI-powered
              analysis. Generate investment memos, analyze documents, and make better
              decisions faster.
            </p>
            <div className="flex flex-col sm:flex-row gap-4 pt-4">
              <Button asChild size="lg">
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
          <div className="grid grid-cols-2 md:grid-cols-4 gap-8 pt-12 border-t">
            {stats.map((stat) => (
              <div key={stat.label} className="text-center">
                <p className="text-3xl md:text-4xl font-bold">{stat.value}</p>
                <p className="text-sm text-muted-foreground">{stat.label}</p>
              </div>
            ))}
          </div>
        </section>

        {/* Features Section */}
        <section id="features" className="container py-24 space-y-12">
          <div className="text-center space-y-4">
            <h2 className="text-3xl md:text-4xl font-bold">
              Everything you need for deal evaluation
            </h2>
            <p className="text-xl text-muted-foreground max-w-2xl mx-auto">
              From document upload to investment decision, VentureScope streamlines your
              entire due diligence workflow.
            </p>
          </div>

          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8">
            {features.map((feature) => (
              <div
                key={feature.title}
                className="border rounded-lg p-6 space-y-4 hover:shadow-lg transition-shadow"
              >
                <div className="h-12 w-12 rounded-lg bg-primary/10 flex items-center justify-center">
                  <feature.icon className="h-6 w-6 text-primary" />
                </div>
                <h3 className="text-xl font-semibold">{feature.title}</h3>
                <p className="text-muted-foreground">{feature.description}</p>
              </div>
            ))}
          </div>
        </section>

        {/* How It Works */}
        <section className="bg-muted/50 py-24">
          <div className="container space-y-12">
            <div className="text-center space-y-4">
              <h2 className="text-3xl md:text-4xl font-bold">How It Works</h2>
              <p className="text-xl text-muted-foreground max-w-2xl mx-auto">
                Three simple steps to transform your due diligence process
              </p>
            </div>

            <div className="grid md:grid-cols-3 gap-8">
              <div className="text-center space-y-4">
                <div className="h-16 w-16 rounded-full bg-primary text-primary-foreground flex items-center justify-center text-2xl font-bold mx-auto">
                  1
                </div>
                <h3 className="text-xl font-semibold">Upload Documents</h3>
                <p className="text-muted-foreground">
                  Drop your pitch deck, financials, cap table, and other deal room
                  documents. We support PDF, Excel, PowerPoint, and more.
                </p>
              </div>
              <div className="text-center space-y-4">
                <div className="h-16 w-16 rounded-full bg-primary text-primary-foreground flex items-center justify-center text-2xl font-bold mx-auto">
                  2
                </div>
                <h3 className="text-xl font-semibold">Generate Analysis</h3>
                <p className="text-muted-foreground">
                  Our AI reads and analyzes all documents, generating a comprehensive
                  investment memo with scores across 9 dimensions.
                </p>
              </div>
              <div className="text-center space-y-4">
                <div className="h-16 w-16 rounded-full bg-primary text-primary-foreground flex items-center justify-center text-2xl font-bold mx-auto">
                  3
                </div>
                <h3 className="text-xl font-semibold">Make Decisions</h3>
                <p className="text-muted-foreground">
                  Review the memo, ask follow-up questions, share with your team, and
                  make informed investment decisions faster.
                </p>
              </div>
            </div>
          </div>
        </section>

        {/* Pricing Preview */}
        <section id="pricing" className="container py-24 space-y-12">
          <div className="text-center space-y-4">
            <h2 className="text-3xl md:text-4xl font-bold">Simple, Transparent Pricing</h2>
            <p className="text-xl text-muted-foreground max-w-2xl mx-auto">
              Start free, upgrade when you need more. No hidden fees.
            </p>
          </div>

          <div className="grid md:grid-cols-3 gap-8 max-w-5xl mx-auto">
            {/* Free */}
            <div className="border rounded-lg p-8 space-y-6">
              <div>
                <h3 className="text-xl font-semibold">Free</h3>
                <p className="text-muted-foreground">For trying it out</p>
              </div>
              <div>
                <span className="text-4xl font-bold">$0</span>
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
            <div className="border-2 border-primary rounded-lg p-8 space-y-6 relative">
              <Badge className="absolute -top-3 left-1/2 -translate-x-1/2">
                Most Popular
              </Badge>
              <div>
                <h3 className="text-xl font-semibold">Angel</h3>
                <p className="text-muted-foreground">For individual investors</p>
              </div>
              <div>
                <span className="text-4xl font-bold">$149</span>
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
            <div className="border rounded-lg p-8 space-y-6">
              <div>
                <h3 className="text-xl font-semibold">Pro</h3>
                <p className="text-muted-foreground">For VC teams</p>
              </div>
              <div>
                <span className="text-4xl font-bold">$499</span>
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
        </section>

        {/* CTA Section */}
        <section className="bg-primary text-primary-foreground py-24">
          <div className="container text-center space-y-8">
            <h2 className="text-3xl md:text-4xl font-bold">
              Ready to transform your due diligence?
            </h2>
            <p className="text-xl opacity-90 max-w-2xl mx-auto">
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
      <footer className="border-t py-12">
        <div className="container flex flex-col md:flex-row justify-between items-center gap-4">
          <div className="flex items-center space-x-2">
            <span className="font-bold">VentureScope</span>
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
