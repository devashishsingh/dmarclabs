import type { Metadata } from 'next';
import Link from 'next/link';
import './globals.css';
import Header from '@/components/Header';

export const metadata: Metadata = {
  title: 'DMARC Labs — Fast, Private, Free DMARC Analyzer',
  description:
    'Analyze DMARC aggregate XML reports instantly. Get SPF, DKIM, and IP WHOIS data with zero signup and full privacy.',
  keywords: ['DMARC', 'email security', 'SPF', 'DKIM', 'XML analyzer', 'WHOIS'],
  robots: 'index, follow',
  openGraph: {
    title: "DMARC Labs — Stop Guessing Who's Sending From Your Domain",
    description: 'Instant DMARC report analysis with WHOIS-enriched sender intelligence. No signup. No credit card. Your data deleted after analysis.',
    type: 'website',
    siteName: 'DMARC Labs',
  },
  twitter: {
    card: 'summary_large_image',
    title: 'DMARC Labs — Free DMARC Report Analyzer',
    description: 'Instant DMARC report analysis with WHOIS-enriched sender intelligence. No signup. No credit card.',
  },
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en" className="dark">
      <body>
        {/* Global background effects */}
        <div className="fixed inset-0 -z-10 pointer-events-none overflow-hidden" aria-hidden="true">
          <div className="absolute top-0 left-0 right-0 h-[600px] bg-gradient-to-b from-[#1a0505] to-transparent opacity-80" />
          <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[800px] h-[800px] bg-[#ef233c]/5 blur-[120px] rounded-full" />
          <div className="absolute inset-0 [background-image:linear-gradient(rgba(255,255,255,0.03)_1px,transparent_1px),linear-gradient(90deg,rgba(255,255,255,0.03)_1px,transparent_1px)] [background-size:40px_40px] [mask-image:radial-gradient(circle_at_center,black,transparent_80%)]" />
        </div>

        <Header />
        <main id="main-content" className="min-h-screen flex flex-col">
          {children}
        </main>
        <footer className="border-t border-white/5 py-10 px-6 bg-black/40 backdrop-blur-sm">
          <div className="max-w-layout mx-auto space-y-6">
            {/* Top row */}
            <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-6">
              {/* Brand */}
              <Link href="/" className="flex items-center gap-3 text-text-primary font-bold text-base font-display hover:text-accent transition-colors">
                <span className="w-3 h-3 bg-accent rotate-45 block flex-shrink-0" style={{ boxShadow: '0 0 8px #ef233c' }} aria-hidden="true" />
                DMARC Labs
              </Link>
              {/* Nav */}
              <nav className="flex flex-wrap gap-x-6 gap-y-2 text-xs text-text-muted" aria-label="Footer navigation">
                <Link href="/" className="hover:text-accent transition-colors">Analyzer</Link>
                <Link href="/contact" className="hover:text-accent transition-colors">Contact</Link>
                <Link href="/privacy" className="hover:text-accent transition-colors">Privacy Policy</Link>
                <a href="https://www.linkedin.com/in/devashish-singh-52a050112" target="_blank" rel="noopener noreferrer" className="hover:text-accent transition-colors inline-flex items-center gap-1.5">
                  <svg viewBox="0 0 24 24" fill="currentColor" className="w-3 h-3" aria-hidden="true"><path d="M20.447 20.452h-3.554v-5.569c0-1.328-.027-3.037-1.852-3.037-1.853 0-2.136 1.445-2.136 2.939v5.667H9.351V9h3.414v1.561h.046c.477-.9 1.637-1.85 3.37-1.85 3.601 0 4.267 2.37 4.267 5.455v6.286zM5.337 7.433a2.062 2.062 0 0 1-2.063-2.065 2.064 2.064 0 1 1 2.063 2.065zm1.782 13.019H3.555V9h3.564v11.452zM22.225 0H1.771C.792 0 0 .774 0 1.729v20.542C0 23.227.792 24 1.771 24h20.451C23.2 24 24 23.227 24 22.271V1.729C24 .774 23.2 0 22.222 0h.003z"/></svg>
                  LinkedIn
                </a>
                <Link href="/contact" className="hover:text-accent transition-colors">Contact us</Link>
              </nav>
            </div>

            {/* Bottom row */}
            <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 text-xs text-text-muted border-t border-white/5 pt-6">
              <p>
                &copy; {new Date().getFullYear()} DMARC Labs. All analysis is performed in-memory. No data is persisted.
              </p>
              <div className="flex items-center gap-4">
                <span className="flex items-center gap-2 px-3 py-1 rounded-full border border-white/5 bg-white/[0.02]">
                  <span className="h-1.5 w-1.5 rounded-full bg-success" aria-hidden="true" />
                  GDPR compliant
                </span>
                <span>Sessions auto-purge after 1 hour</span>
              </div>
            </div>
          </div>
        </footer>
      </body>
    </html>
  );
}
