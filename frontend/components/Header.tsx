'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { useState, useEffect } from 'react';
import { Menu, X } from 'lucide-react';
import { useHeaderVisibility } from '@/lib/headerVisibility';

const NAV_LINKS = [
  { href: '/#upload', label: 'Analyzer' },
  { href: '/blog', label: 'Blog' },
  { href: '/contact', label: 'Contact' },
  { href: '/privacy', label: 'Privacy' },
];

const LinkedInIcon = () => (
  <svg viewBox="0 0 24 24" fill="currentColor" className="w-3.5 h-3.5" aria-hidden="true">
    <path d="M20.447 20.452h-3.554v-5.569c0-1.328-.027-3.037-1.852-3.037-1.853 0-2.136 1.445-2.136 2.939v5.667H9.351V9h3.414v1.561h.046c.477-.9 1.637-1.85 3.37-1.85 3.601 0 4.267 2.37 4.267 5.455v6.286zM5.337 7.433a2.062 2.062 0 0 1-2.063-2.065 2.064 2.064 0 1 1 2.063 2.065zm1.782 13.019H3.555V9h3.564v11.452zM22.225 0H1.771C.792 0 0 .774 0 1.729v20.542C0 23.227.792 24 1.771 24h20.451C23.2 24 24 23.227 24 22.271V1.729C24 .774 23.2 0 22.222 0h.003z"/>
  </svg>
);

export default function Header() {
  const pathname = usePathname();
  const { headerHidden } = useHeaderVisibility();
  const [menuOpen, setMenuOpen] = useState(false);

  // Close menu on route change
  useEffect(() => { setMenuOpen(false); }, [pathname]);

  // Lock body scroll while mobile menu is open
  useEffect(() => {
    if (menuOpen) {
      const prev = document.body.style.overflow;
      document.body.style.overflow = 'hidden';
      return () => { document.body.style.overflow = prev; };
    }
  }, [menuOpen]);

  const handleLogoClick = (e: React.MouseEvent) => {
    if (pathname === '/') {
      e.preventDefault();
      window.dispatchEvent(new CustomEvent('dmarc:reset'));
    }
    setMenuOpen(false);
  };

  if (headerHidden) return null;

  return (
    <>
      <header className="fixed top-0 left-0 right-0 z-50 pt-4 sm:pt-6 px-3 sm:px-4 pointer-events-none">
        <div className="max-w-fit mx-auto min-h-[52px] bg-black/70 border border-white/10 rounded-full px-3 sm:px-6 flex items-center gap-3 sm:gap-8 shadow-2xl backdrop-blur-xl pointer-events-auto">
          <Link
            href="/"
            onClick={handleLogoClick}
            className="flex items-center gap-2.5 text-text-primary font-bold text-base sm:text-lg font-display hover:text-accent transition-colors flex-shrink-0"
            aria-label="DMARC Labs — go to homepage"
          >
            <span
              className="w-3 h-3 sm:w-3.5 sm:h-3.5 bg-accent rotate-45 block flex-shrink-0"
              style={{ boxShadow: '0 0 12px #ef233c' }}
              aria-hidden="true"
            />
            <span>DMARC Labs</span>
          </Link>

          {/* Desktop nav (>= md / 768px) */}
          <nav className="hidden md:flex items-center gap-1" aria-label="Site navigation">
            {NAV_LINKS.map(({ href, label }) => (
              <Link
                key={href}
                href={href}
                className="text-[13px] text-text-muted hover:text-text-primary px-3 py-1 rounded-full hover:bg-white/5 transition-colors"
              >
                {label}
              </Link>
            ))}
            <a
              href="https://www.linkedin.com/in/devashish-singh-52a050112"
              target="_blank"
              rel="noopener noreferrer"
              aria-label="LinkedIn"
              className="inline-flex items-center justify-center text-text-muted hover:text-text-primary px-3 py-1 rounded-full hover:bg-white/5 transition-colors"
            >
              <LinkedInIcon />
            </a>
            <span className="text-[11px] font-medium text-text-secondary inline-flex items-center gap-2 px-3 py-1 rounded-full border border-white/5 bg-white/[0.03] ml-2">
              <span className="h-1.5 w-1.5 rounded-full bg-success animate-pulse inline-block" aria-hidden="true" />
              Free &amp; Private
            </span>
          </nav>

          {/* Mobile hamburger button */}
          <button
            type="button"
            onClick={() => setMenuOpen((o) => !o)}
            aria-label={menuOpen ? 'Close menu' : 'Open menu'}
            aria-expanded={menuOpen}
            aria-controls="mobile-nav-panel"
            className="md:hidden inline-flex items-center justify-center w-11 h-11 rounded-full text-text-primary hover:bg-white/5 transition-colors"
          >
            {menuOpen ? <X className="h-5 w-5" aria-hidden="true" /> : <Menu className="h-5 w-5" aria-hidden="true" />}
          </button>
        </div>
      </header>

      {/* Mobile menu overlay */}
      {menuOpen && (
        <div
          id="mobile-nav-panel"
          className="md:hidden fixed inset-0 z-40 bg-black/95 backdrop-blur-xl pt-24 px-6 pb-10 overflow-y-auto"
          role="dialog"
          aria-modal="true"
          aria-label="Mobile navigation"
        >
          <nav className="flex flex-col gap-2 max-w-md mx-auto">
            {NAV_LINKS.map(({ href, label }) => (
              <Link
                key={href}
                href={href}
                onClick={() => setMenuOpen(false)}
                className="flex items-center justify-between px-4 py-4 min-h-[52px] rounded-xl border border-white/10 bg-white/[0.02] text-text-primary text-base font-medium hover:border-accent/40 hover:bg-accent/5 transition-colors"
              >
                <span>{label}</span>
                <span className="text-text-muted">→</span>
              </Link>
            ))}
            <a
              href="https://www.linkedin.com/in/devashish-singh-52a050112"
              target="_blank"
              rel="noopener noreferrer"
              onClick={() => setMenuOpen(false)}
              className="flex items-center justify-between px-4 py-4 min-h-[52px] rounded-xl border border-white/10 bg-white/[0.02] text-text-primary text-base font-medium hover:border-accent/40 hover:bg-accent/5 transition-colors"
            >
              <span>LinkedIn</span>
              <LinkedInIcon />
            </a>
            <span className="mt-4 text-center text-[12px] font-medium text-text-secondary inline-flex items-center justify-center gap-2 px-3 py-2 rounded-full border border-white/5 bg-white/[0.03] mx-auto">
              <span className="h-1.5 w-1.5 rounded-full bg-success animate-pulse inline-block" aria-hidden="true" />
              Free &amp; Private — no signup
            </span>
          </nav>
        </div>
      )}
    </>
  );
}
