import type { Metadata } from "next";
import { Space_Grotesk, DM_Sans, JetBrains_Mono } from "next/font/google";
import { ThemeProvider } from "@/components/providers/theme-provider";
import { SessionProvider } from "@/components/providers/session-provider";
import { Toaster } from "@/components/ui/sonner";
import "./globals.css";

// Display font - Bold, modern, geometric
const spaceGrotesk = Space_Grotesk({
  variable: "--font-display",
  subsets: ["latin"],
  weight: ["500", "600", "700"],
});

// Body font - Clean, highly legible
const dmSans = DM_Sans({
  variable: "--font-sans",
  subsets: ["latin"],
  weight: ["400", "500", "600", "700"],
});

// Mono font - For code and data
const jetbrainsMono = JetBrains_Mono({
  variable: "--font-mono",
  subsets: ["latin"],
  weight: ["400", "500"],
});

const siteUrl = process.env.NEXT_PUBLIC_APP_URL || 'https://venturescope.vercel.app'

export const metadata: Metadata = {
  title: {
    default: 'VentureScope - AI-Powered VC Due Diligence',
    template: '%s | VentureScope',
  },
  description: 'Transform 40-80 hours of manual due diligence into a 5-minute AI-powered analysis. Generate investment memos, analyze documents, and make better decisions faster.',
  metadataBase: new URL(siteUrl),
  openGraph: {
    type: 'website',
    locale: 'en_US',
    url: siteUrl,
    siteName: 'VentureScope',
    title: 'VentureScope - AI-Powered VC Due Diligence',
    description: 'Transform 40-80 hours of manual due diligence into a 5-minute AI-powered analysis. Generate investment memos, analyze documents, and make better decisions faster.',
  },
  twitter: {
    card: 'summary_large_image',
    title: 'VentureScope - AI-Powered VC Due Diligence',
    description: 'Transform 40-80 hours of manual due diligence into a 5-minute AI-powered analysis.',
  },
  robots: {
    index: true,
    follow: true,
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" suppressHydrationWarning>
      <body
        className={`${spaceGrotesk.variable} ${dmSans.variable} ${jetbrainsMono.variable} font-sans antialiased`}
      >
        <SessionProvider>
          <ThemeProvider
            attribute="class"
            defaultTheme="system"
            enableSystem
            disableTransitionOnChange={false}
          >
            {children}
            <Toaster richColors position="top-right" />
          </ThemeProvider>
        </SessionProvider>
      </body>
    </html>
  );
}
