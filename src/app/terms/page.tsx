import type { Metadata } from 'next'
import Link from 'next/link'

export const metadata: Metadata = {
  title: 'Terms of Service - VentureScope',
  description: 'VentureScope terms of service. Read our terms and conditions for using the platform.',
}

export default function TermsPage() {
  return (
    <div className="min-h-screen bg-background">
      <header className="sticky top-0 z-50 w-full border-b bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
        <div className="container flex h-16 items-center">
          <Link href="/" className="text-xl font-bold font-display tracking-tight">
            VentureScope
          </Link>
        </div>
      </header>

      <main className="container max-w-3xl py-16 md:py-24">
        <h1 className="heading-hero text-3xl md:text-4xl font-bold mb-4">Terms of Service</h1>
        <p className="text-muted-foreground mb-12">Last updated: January 27, 2026</p>

        <div className="prose prose-neutral dark:prose-invert max-w-none space-y-8">
          <section className="space-y-4">
            <h2 className="heading-section text-2xl font-semibold">1. Acceptance of Terms</h2>
            <p className="text-foreground/90 leading-relaxed">
              By accessing or using VentureScope (&quot;the Service&quot;), operated by VentureScope
              (&quot;we,&quot; &quot;our,&quot; or &quot;us&quot;), you agree to be bound by these Terms of Service
              (&quot;Terms&quot;). If you are using the Service on behalf of an organization, you represent
              that you have authority to bind that organization to these Terms.
            </p>
            <p className="text-foreground/90 leading-relaxed">
              If you do not agree to these Terms, you may not access or use the Service.
            </p>
          </section>

          <section className="space-y-4">
            <h2 className="heading-section text-2xl font-semibold">2. Description of Service</h2>
            <p className="text-foreground/90 leading-relaxed">
              VentureScope is an AI-powered due diligence platform designed for venture capital firms,
              angel investors, and investment professionals. The Service includes document analysis,
              AI-generated investment memos, deal room chat, team collaboration tools, and related features.
            </p>
            <p className="text-foreground/90 leading-relaxed">
              The Service uses artificial intelligence to generate analyses and recommendations.
              These outputs are intended as decision-support tools and do not constitute financial advice,
              legal advice, or investment recommendations.
            </p>
          </section>

          <section className="space-y-4">
            <h2 className="heading-section text-2xl font-semibold">3. Account Registration</h2>
            <ul className="list-disc pl-6 space-y-2 text-foreground/90">
              <li>You must provide accurate, complete, and current information when creating an account.</li>
              <li>You are responsible for maintaining the security of your account credentials.</li>
              <li>You must notify us immediately of any unauthorized access to your account.</li>
              <li>You may not share accounts or credentials with unauthorized individuals.</li>
              <li>One person or organization may not maintain multiple free accounts.</li>
            </ul>
          </section>

          <section className="space-y-4">
            <h2 className="heading-section text-2xl font-semibold">4. Subscriptions &amp; Payments</h2>

            <h3 className="heading-card text-lg font-medium">4.1 Plans</h3>
            <p className="text-foreground/90 leading-relaxed">
              The Service offers Free, Angel, Pro, and Enterprise subscription tiers. Features and usage
              limits vary by plan and are described on our pricing page. We reserve the right to modify
              plan features and pricing with 30 days&apos; notice.
            </p>

            <h3 className="heading-card text-lg font-medium">4.2 Billing</h3>
            <ul className="list-disc pl-6 space-y-2 text-foreground/90">
              <li>Paid subscriptions are billed monthly in advance through Stripe.</li>
              <li>All fees are non-refundable except as required by applicable law or as explicitly stated in these Terms.</li>
              <li>We may change pricing with 30 days&apos; notice. Price changes take effect at the next billing cycle.</li>
              <li>Failed payments may result in suspension of access to paid features.</li>
            </ul>

            <h3 className="heading-card text-lg font-medium">4.3 Free Trial</h3>
            <p className="text-foreground/90 leading-relaxed">
              We may offer free trials for paid plans. At the end of the trial period, your account will
              be charged unless you cancel before the trial expires.
            </p>
          </section>

          <section className="space-y-4">
            <h2 className="heading-section text-2xl font-semibold">5. Your Data &amp; Content</h2>

            <h3 className="heading-card text-lg font-medium">5.1 Ownership</h3>
            <p className="text-foreground/90 leading-relaxed">
              You retain all ownership rights to the documents, data, and content you upload to the Service
              (&quot;Your Content&quot;). AI-generated analyses, memos, and scores created from Your Content
              are licensed to you for your use.
            </p>

            <h3 className="heading-card text-lg font-medium">5.2 License Grant</h3>
            <p className="text-foreground/90 leading-relaxed">
              By uploading content, you grant us a limited, non-exclusive license to process, analyze, and
              store Your Content solely for the purpose of providing the Service. This license terminates
              when you delete Your Content or close your account.
            </p>

            <h3 className="heading-card text-lg font-medium">5.3 Restrictions</h3>
            <p className="text-foreground/90 leading-relaxed">You agree not to upload content that:</p>
            <ul className="list-disc pl-6 space-y-2 text-foreground/90">
              <li>You do not have the right to share or process.</li>
              <li>Contains malware, viruses, or harmful code.</li>
              <li>Violates any applicable law or regulation.</li>
              <li>Infringes on the intellectual property rights of any third party.</li>
            </ul>
          </section>

          <section className="space-y-4">
            <h2 className="heading-section text-2xl font-semibold">6. Acceptable Use</h2>
            <p className="text-foreground/90 leading-relaxed">You agree not to:</p>
            <ul className="list-disc pl-6 space-y-2 text-foreground/90">
              <li>Use the Service for any unlawful purpose or in violation of any applicable regulations.</li>
              <li>Attempt to gain unauthorized access to the Service, other accounts, or our systems.</li>
              <li>Reverse engineer, decompile, or disassemble any part of the Service.</li>
              <li>Use automated tools (bots, scrapers) to access the Service without our written consent.</li>
              <li>Resell, sublicense, or redistribute the Service or its outputs without authorization.</li>
              <li>Interfere with or disrupt the Service or servers connected to the Service.</li>
              <li>Circumvent usage limits, rate limits, or access controls.</li>
            </ul>
          </section>

          <section className="space-y-4">
            <h2 className="heading-section text-2xl font-semibold">7. AI-Generated Content Disclaimer</h2>
            <p className="text-foreground/90 leading-relaxed">
              The Service uses artificial intelligence to analyze documents and generate investment memos,
              scores, and recommendations. You acknowledge and agree that:
            </p>
            <ul className="list-disc pl-6 space-y-2 text-foreground/90">
              <li><strong>AI outputs are not financial, legal, or investment advice.</strong> They are analytical tools intended to support, not replace, professional judgment.</li>
              <li>AI-generated analyses may contain inaccuracies, omissions, or errors. You are responsible for independently verifying all AI outputs before making investment decisions.</li>
              <li>Past performance metrics, scores, or analyses generated by the Service do not guarantee future results.</li>
              <li>We do not guarantee the accuracy, completeness, or reliability of any AI-generated content.</li>
            </ul>
          </section>

          <section className="space-y-4">
            <h2 className="heading-section text-2xl font-semibold">8. Intellectual Property</h2>
            <p className="text-foreground/90 leading-relaxed">
              The Service, including its design, features, code, documentation, and branding, is owned by
              VentureScope and protected by intellectual property laws. These Terms do not grant you any
              right to use our trademarks, logos, or branding without prior written consent.
            </p>
          </section>

          <section className="space-y-4">
            <h2 className="heading-section text-2xl font-semibold">9. Limitation of Liability</h2>
            <p className="text-foreground/90 leading-relaxed">
              TO THE MAXIMUM EXTENT PERMITTED BY LAW, VENTURESCOPE SHALL NOT BE LIABLE FOR ANY INDIRECT,
              INCIDENTAL, SPECIAL, CONSEQUENTIAL, OR PUNITIVE DAMAGES, INCLUDING LOSS OF PROFITS, DATA,
              OR BUSINESS OPPORTUNITIES, ARISING OUT OF OR RELATED TO YOUR USE OF THE SERVICE.
            </p>
            <p className="text-foreground/90 leading-relaxed">
              OUR TOTAL LIABILITY FOR ALL CLAIMS RELATED TO THE SERVICE SHALL NOT EXCEED THE AMOUNT YOU
              PAID TO US IN THE TWELVE (12) MONTHS PRECEDING THE CLAIM.
            </p>
            <p className="text-foreground/90 leading-relaxed">
              YOU EXPRESSLY ACKNOWLEDGE THAT INVESTMENT DECISIONS MADE USING THE SERVICE ARE YOUR
              RESPONSIBILITY. WE ARE NOT LIABLE FOR ANY INVESTMENT LOSSES OR OUTCOMES RESULTING FROM
              RELIANCE ON AI-GENERATED ANALYSES.
            </p>
          </section>

          <section className="space-y-4">
            <h2 className="heading-section text-2xl font-semibold">10. Indemnification</h2>
            <p className="text-foreground/90 leading-relaxed">
              You agree to indemnify and hold harmless VentureScope and its officers, directors, employees,
              and agents from any claims, liabilities, damages, losses, and expenses arising from your use
              of the Service, your violation of these Terms, or your violation of any third-party rights.
            </p>
          </section>

          <section className="space-y-4">
            <h2 className="heading-section text-2xl font-semibold">11. Termination</h2>
            <ul className="list-disc pl-6 space-y-2 text-foreground/90">
              <li>You may cancel your account at any time through your account settings or by contacting us.</li>
              <li>We may suspend or terminate your access if you violate these Terms, with notice where practicable.</li>
              <li>Upon termination, your right to use the Service ceases immediately. You may request export of Your Content within 30 days of termination.</li>
              <li>Sections regarding limitation of liability, indemnification, and governing law survive termination.</li>
            </ul>
          </section>

          <section className="space-y-4">
            <h2 className="heading-section text-2xl font-semibold">12. Governing Law</h2>
            <p className="text-foreground/90 leading-relaxed">
              These Terms are governed by the laws of the State of Delaware, without regard to conflict
              of law principles. Any disputes arising under these Terms shall be resolved in the state or
              federal courts located in Delaware.
            </p>
          </section>

          <section className="space-y-4">
            <h2 className="heading-section text-2xl font-semibold">13. Changes to Terms</h2>
            <p className="text-foreground/90 leading-relaxed">
              We reserve the right to modify these Terms at any time. Material changes will be communicated
              with at least 30 days&apos; notice via email or prominent notice on the Service. Continued use
              of the Service after changes take effect constitutes acceptance of the revised Terms.
            </p>
          </section>

          <section className="space-y-4">
            <h2 className="heading-section text-2xl font-semibold">14. Contact</h2>
            <p className="text-foreground/90 leading-relaxed">
              For questions about these Terms, contact us at:{' '}
              <a href="mailto:legal@venturescope.ai" className="text-primary hover:underline">
                legal@venturescope.ai
              </a>
            </p>
          </section>
        </div>

        <div className="mt-16 pt-8 border-t text-sm text-muted-foreground">
          <Link href="/" className="hover:text-foreground">
            &larr; Back to home
          </Link>
        </div>
      </main>
    </div>
  )
}
