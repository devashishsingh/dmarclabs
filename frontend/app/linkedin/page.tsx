import type { Metadata } from 'next';
import Link from 'next/link';

export const metadata: Metadata = {
  title: 'LinkedIn — DMARC Labs',
  description: 'Connect with the DMARC Labs team on LinkedIn.',
  robots: 'noindex',
};

export default function LinkedInPage() {
  return (
    <div className="w-full max-w-2xl mx-auto px-6 pt-36 pb-20 text-center space-y-8">
      <div className="space-y-3">
        <div
          className="w-16 h-16 rounded-2xl flex items-center justify-center mx-auto"
          style={{ background: '#0A66C2' }}
          aria-hidden="true"
        >
          {/* LinkedIn icon */}
          <svg viewBox="0 0 24 24" fill="white" className="w-8 h-8" aria-hidden="true">
            <path d="M20.447 20.452h-3.554v-5.569c0-1.328-.027-3.037-1.852-3.037-1.853 0-2.136 1.445-2.136 2.939v5.667H9.351V9h3.414v1.561h.046c.477-.9 1.637-1.85 3.37-1.85 3.601 0 4.267 2.37 4.267 5.455v6.286zM5.337 7.433a2.062 2.062 0 0 1-2.063-2.065 2.064 2.064 0 1 1 2.063 2.065zm1.782 13.019H3.555V9h3.564v11.452zM22.225 0H1.771C.792 0 0 .774 0 1.729v20.542C0 23.227.792 24 1.771 24h20.451C23.2 24 24 23.227 24 22.271V1.729C24 .774 23.2 0 22.222 0h.003z"/>
          </svg>
        </div>
        <h1 className="text-3xl font-bold font-display text-text-primary tracking-tight">
          LinkedIn
        </h1>
        <p className="text-text-muted text-base max-w-md mx-auto leading-relaxed">
          This page is coming soon. Follow DMARC Labs on LinkedIn for product updates, security insights, and DMARC tips.
        </p>
      </div>

      <div className="rounded-2xl border border-white/10 bg-card p-8 space-y-5">
        <p className="text-sm text-text-secondary leading-relaxed">
          In the meantime, you can reach us directly through the contact form.
        </p>
        <Link
          href="/contact"
          className="inline-flex items-center gap-2 px-6 py-3 rounded-full bg-accent text-white text-sm font-semibold hover:bg-accent-hover transition-all active:scale-95"
          style={{ boxShadow: '0 0 20px rgba(239,35,60,0.25)' }}
        >
          Contact us
        </Link>
        <p className="text-xs text-text-muted">
          <Link href="/" className="hover:text-accent transition-colors underline underline-offset-4">
            Back to analyzer
          </Link>
        </p>
      </div>
    </div>
  );
}
