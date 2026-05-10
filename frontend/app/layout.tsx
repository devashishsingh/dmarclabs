import type { Metadata } from 'next';
import Link from 'next/link';
import './globals.css';
import Header from '@/components/Header';
import { HeaderVisibilityProvider } from '@/lib/headerVisibility';
import JsonLd from '@/components/JsonLd';

export const metadata: Metadata = {
  title: 'DMARC Labs — Fast, Private, Free DMARC Analyzer',
  description:
    'Analyze DMARC aggregate XML reports instantly. Get SPF, DKIM, and IP WHOIS data with zero signup and full privacy.',
  keywords: ['DMARC', 'email security', 'SPF', 'DKIM', 'XML analyzer', 'WHOIS'],
  robots: 'index, follow',
  alternates: {
    canonical: 'https://dmarclabsds1.xyz',
  },
  openGraph: {
    title: "DMARC Labs — Stop Guessing Who's Sending From Your Domain",
    description: 'Instant DMARC report analysis with WHOIS-enriched sender intelligence. No signup. No credit card. Your data deleted after analysis.',
    type: 'website',
    siteName: 'DMARC Labs',
    url: 'https://dmarclabsds1.xyz',
  },
  twitter: {
    card: 'summary_large_image',
    title: 'DMARC Labs — Free DMARC Report Analyzer',
    description: 'Instant DMARC report analysis with WHOIS-enriched sender intelligence. No signup. No credit card.',
    site: '@dmarclabs',
  },
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en" className="dark">
      <head>
        {/* Charset MUST be the first tag inside <head> for browsers to decode bytes correctly. */}
        <meta charSet="UTF-8" />
      </head>
      <body>
        <HeaderVisibilityProvider>
        {/* Global background effects */}
        <div className="fixed inset-0 -z-10 pointer-events-none overflow-hidden" aria-hidden="true">
          <div className="absolute top-0 left-0 right-0 h-[600px] bg-gradient-to-b from-[#1a0505] to-transparent opacity-80" />
          <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[800px] h-[800px] bg-[#ef233c]/5 blur-[120px] rounded-full" />
          <div className="absolute inset-0 [background-image:linear-gradient(rgba(255,255,255,0.03)_1px,transparent_1px),linear-gradient(90deg,rgba(255,255,255,0.03)_1px,transparent_1px)] [background-size:40px_40px] [mask-image:radial-gradient(circle_at_center,black,transparent_80%)]" />
        </div>

        <JsonLd
          type="website"
          name="DMARC Labs"
          url="https://dmarclabsds1.xyz"
          description="Analyze DMARC aggregate XML reports instantly. Get SPF, DKIM, and IP WHOIS data with zero signup and full privacy."
        />
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
                <Link href="/#upload" className="hover:text-accent transition-colors">Analyzer</Link>
                <Link href="/blog" className="hover:text-accent transition-colors">Blog</Link>
                <Link href="/contact" className="hover:text-accent transition-colors">Contact</Link>
                <Link href="/privacy" className="hover:text-accent transition-colors">Privacy Policy</Link>
                <a href="https://www.linkedin.com/in/devashish-singh-52a050112" target="_blank" rel="noopener noreferrer" aria-label="LinkedIn" className="hover:text-accent transition-colors inline-flex items-center">
                  <svg viewBox="0 0 24 24" fill="currentColor" className="w-4 h-4" aria-hidden="true"><path d="M20.447 20.452h-3.554v-5.569c0-1.328-.027-3.037-1.852-3.037-1.853 0-2.136 1.445-2.136 2.939v5.667H9.351V9h3.414v1.561h.046c.477-.9 1.637-1.85 3.37-1.85 3.601 0 4.267 2.37 4.267 5.455v6.286zM5.337 7.433a2.062 2.062 0 0 1-2.063-2.065 2.064 2.064 0 1 1 2.063 2.065zm1.782 13.019H3.555V9h3.564v11.452zM22.225 0H1.771C.792 0 0 .774 0 1.729v20.542C0 23.227.792 24 1.771 24h20.451C23.2 24 24 23.227 24 22.271V1.729C24 .774 23.2 0 22.222 0h.003z"/></svg>
                </a>
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

        {/* Floating WhatsApp button */}
        <a
          href="https://wa.me/601133260976"
          target="_blank"
          rel="noopener noreferrer"
          aria-label="Chat on WhatsApp"
          className="fixed bottom-6 right-6 z-50 flex items-center justify-center w-12 h-12 rounded-full bg-[#25D366] text-white shadow-lg shadow-black/40 hover:bg-[#1ebe5d] hover:scale-105 active:scale-95 transition-all duration-150"
        >
          <svg viewBox="0 0 24 24" fill="currentColor" className="w-6 h-6" aria-hidden="true">
            <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 0 1-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 0 1-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 0 1 2.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0 0 12.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 0 0 5.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 0 0-3.48-8.413Z"/>
          </svg>
        </a>
        </HeaderVisibilityProvider>
      </body>
    </html>
  );
}
