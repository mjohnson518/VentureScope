import type { Metadata } from 'next'
import Link from 'next/link'

export const metadata: Metadata = {
  title: 'Privacy Policy - VentureScope',
  description: 'VentureScope privacy policy. Learn how we collect, use, and protect your data.',
}

export default function PrivacyPage() {
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
        <h1 className="heading-hero text-3xl md:text-4xl font-bold mb-4">Privacy Policy</h1>
        <p className="text-muted-foreground mb-12">Last updated: January 27, 2026</p>

        <div className="prose prose-neutral dark:prose-invert max-w-none space-y-8">
          <section className="space-y-4">
            <h2 className="heading-section text-2xl font-semibold">1. Introduction</h2>
            <p className="text-foreground/90 leading-relaxed">
              VentureScope (&quot;we,&quot; &quot;our,&quot; or &quot;us&quot;) is committed to protecting your privacy. This
              Privacy Policy explains how we collect, use, disclose, and safeguard your information
              when you use our AI-powered due diligence platform, including our website, applications,
              and related services (collectively, the &quot;Service&quot;).
            </p>
            <p className="text-foreground/90 leading-relaxed">
              By accessing or using the Service, you agree to this Privacy Policy. If you do not agree
              with the terms of this policy, please do not access the Service.
            </p>
          </section>

          <section className="space-y-4">
            <h2 className="heading-section text-2xl font-semibold">2. Information We Collect</h2>

            <h3 className="heading-card text-lg font-medium">2.1 Information You Provide</h3>
            <ul className="list-disc pl-6 space-y-2 text-foreground/90">
              <li><strong>Account Information:</strong> Name, email address, and organization details when you create an account.</li>
              <li><strong>Payment Information:</strong> Billing details processed securely through Stripe. We do not store your full credit card number.</li>
              <li><strong>Uploaded Documents:</strong> Pitch decks, financial documents, cap tables, and other files you upload for analysis.</li>
              <li><strong>Communications:</strong> Messages you send through the platform, including AI chat interactions and assessment comments.</li>
            </ul>

            <h3 className="heading-card text-lg font-medium">2.2 Information Collected Automatically</h3>
            <ul className="list-disc pl-6 space-y-2 text-foreground/90">
              <li><strong>Usage Data:</strong> Pages visited, features used, assessment generation frequency, and interaction patterns.</li>
              <li><strong>Device Information:</strong> Browser type, operating system, device identifiers, and IP address.</li>
              <li><strong>Cookies:</strong> Session cookies for authentication and preferences. See Section 7 for details.</li>
            </ul>
          </section>

          <section className="space-y-4">
            <h2 className="heading-section text-2xl font-semibold">3. How We Use Your Information</h2>
            <p className="text-foreground/90 leading-relaxed">We use the information we collect to:</p>
            <ul className="list-disc pl-6 space-y-2 text-foreground/90">
              <li>Provide, maintain, and improve the Service, including generating AI-powered investment memos and analyses.</li>
              <li>Process transactions and send related information, including purchase confirmations and invoices.</li>
              <li>Send administrative information, such as updates, security alerts, and support messages.</li>
              <li>Respond to your comments, questions, and customer service requests.</li>
              <li>Monitor and analyze usage trends to improve user experience.</li>
              <li>Detect, prevent, and address technical issues and security threats.</li>
            </ul>
          </section>

          <section className="space-y-4">
            <h2 className="heading-section text-2xl font-semibold">4. AI Processing &amp; Your Data</h2>
            <p className="text-foreground/90 leading-relaxed">
              VentureScope uses third-party AI models to analyze your uploaded documents and generate
              investment memos. Important details about this processing:
            </p>
            <ul className="list-disc pl-6 space-y-2 text-foreground/90">
              <li><strong>Your data is never used to train AI models.</strong> Documents you upload are processed for analysis only and are not used to train or improve any AI system.</li>
              <li>AI processing occurs through secure API connections with enterprise-grade encryption in transit.</li>
              <li>We use commercially reasonable measures to ensure AI providers do not retain your data beyond the processing session.</li>
              <li>Generated analyses, memos, and scores are stored in your account and accessible only to you and your authorized team members.</li>
            </ul>
          </section>

          <section className="space-y-4">
            <h2 className="heading-section text-2xl font-semibold">5. Data Sharing &amp; Disclosure</h2>
            <p className="text-foreground/90 leading-relaxed">
              We do not sell your personal information. We may share your information in the following situations:
            </p>
            <ul className="list-disc pl-6 space-y-2 text-foreground/90">
              <li><strong>Service Providers:</strong> Third-party vendors who perform services on our behalf (hosting, payment processing, AI processing, email delivery).</li>
              <li><strong>Team Members:</strong> Within your organization, as configured by your team settings and sharing preferences.</li>
              <li><strong>Legal Requirements:</strong> When required by law, regulation, legal process, or governmental request.</li>
              <li><strong>Business Transfers:</strong> In connection with a merger, acquisition, or sale of assets, with notice to affected users.</li>
              <li><strong>With Your Consent:</strong> When you explicitly authorize sharing, such as sharing assessments with external parties.</li>
            </ul>
          </section>

          <section className="space-y-4">
            <h2 className="heading-section text-2xl font-semibold">6. Data Security</h2>
            <p className="text-foreground/90 leading-relaxed">
              We implement appropriate technical and organizational measures to protect your information, including:
            </p>
            <ul className="list-disc pl-6 space-y-2 text-foreground/90">
              <li>Encryption in transit (TLS 1.2+) and at rest for all stored data.</li>
              <li>Row-level security policies ensuring data isolation between organizations.</li>
              <li>Regular security assessments and vulnerability scanning.</li>
              <li>Access controls and authentication requirements for all team members.</li>
            </ul>
            <p className="text-foreground/90 leading-relaxed">
              While we strive to protect your information, no method of electronic transmission or storage
              is 100% secure. We cannot guarantee absolute security.
            </p>
          </section>

          <section className="space-y-4">
            <h2 className="heading-section text-2xl font-semibold">7. Cookies &amp; Tracking</h2>
            <p className="text-foreground/90 leading-relaxed">
              We use essential cookies required for authentication and platform functionality. We do not
              use third-party advertising cookies or cross-site tracking technologies. You can configure
              your browser to refuse cookies, but some features of the Service may not function properly.
            </p>
          </section>

          <section className="space-y-4">
            <h2 className="heading-section text-2xl font-semibold">8. Data Retention</h2>
            <p className="text-foreground/90 leading-relaxed">
              We retain your information for as long as your account is active or as needed to provide
              the Service. Uploaded documents and generated analyses are retained according to your
              subscription plan. You may request deletion of your data at any time by contacting us.
              We will delete or anonymize your information within 30 days of a verified deletion request,
              unless retention is required by law.
            </p>
          </section>

          <section className="space-y-4">
            <h2 className="heading-section text-2xl font-semibold">9. Your Rights</h2>
            <p className="text-foreground/90 leading-relaxed">Depending on your location, you may have the right to:</p>
            <ul className="list-disc pl-6 space-y-2 text-foreground/90">
              <li>Access the personal information we hold about you.</li>
              <li>Request correction of inaccurate or incomplete information.</li>
              <li>Request deletion of your personal information.</li>
              <li>Object to or restrict processing of your information.</li>
              <li>Data portability &mdash; receive your data in a structured, machine-readable format.</li>
              <li>Withdraw consent where processing is based on consent.</li>
            </ul>
            <p className="text-foreground/90 leading-relaxed">
              To exercise these rights, contact us at{' '}
              <a href="mailto:privacy@venturescope.ai" className="text-primary hover:underline">
                privacy@venturescope.ai
              </a>.
            </p>
          </section>

          <section className="space-y-4">
            <h2 className="heading-section text-2xl font-semibold">10. Children&apos;s Privacy</h2>
            <p className="text-foreground/90 leading-relaxed">
              The Service is not intended for individuals under the age of 18. We do not knowingly
              collect personal information from children. If we learn that we have collected information
              from a child under 18, we will take steps to delete such information promptly.
            </p>
          </section>

          <section className="space-y-4">
            <h2 className="heading-section text-2xl font-semibold">11. Changes to This Policy</h2>
            <p className="text-foreground/90 leading-relaxed">
              We may update this Privacy Policy from time to time. We will notify you of material changes
              by posting the updated policy on this page with a revised &quot;Last updated&quot; date and, where
              appropriate, by email notification.
            </p>
          </section>

          <section className="space-y-4">
            <h2 className="heading-section text-2xl font-semibold">12. Contact Us</h2>
            <p className="text-foreground/90 leading-relaxed">
              If you have questions about this Privacy Policy, please contact us at:{' '}
              <a href="mailto:privacy@venturescope.ai" className="text-primary hover:underline">
                privacy@venturescope.ai
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
