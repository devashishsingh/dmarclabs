'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { useHeaderVisibility } from '@/lib/headerVisibility';

const NAV_LINKS = [
  { href: '/#upload', label: 'Analyzer' },
  { href: '/contact', label: 'Contact' },
  { href: '/privacy', label: 'Privacy' },
  { href: 'https://www.linkedin.com/in/devashish-singh-52a050112', label: 'LinkedIn' },
];

export default function Header() {
  const pathname = usePathname();
  const { headerHidden } = useHeaderVisibility();

  const handleLogoClick = (e: React.MouseEvent) => {
    if (pathname === '/') {
      e.preventDefault();
      window.dispatchEvent(new CustomEvent('dmarc:reset'));
    }
  };

  if (headerHidden) return null;

  return (
    <header className="fixed top-0 left-0 right-0 z-50 pt-4 sm:pt-6 px-3 sm:px-4 pointer-events-none">
      <div className="max-w-fit mx-auto min-h-[52px] bg-black/70 border border-white/10 rounded-full px-4 sm:px-6 flex items-center gap-4 sm:gap-8 shadow-2xl backdrop-blur-xl pointer-events-auto">
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

        <nav className="flex items-center gap-0.5 sm:gap-1" aria-label="Site navigation">
          {NAV_LINKS.map(({ href, label }) => {
            const isExternal = href.startsWith('http');
            const cls = "text-[12px] sm:text-[13px] text-text-muted hover:text-text-primary px-2 sm:px-3 py-1 rounded-full hover:bg-white/5 transition-colors";
            return isExternal ? (
              <a key={href} href={href} target="_blank" rel="noopener noreferrer" className={cls + ' hidden sm:inline-flex'}>
                {label}
              </a>
            ) : (
              <Link key={href} href={href} className={cls + (label === 'Privacy' ? ' hidden sm:inline-flex' : '')}>
                {label}
              </Link>
            );
          })}
          <span className="text-[11px] font-medium text-text-secondary hidden sm:inline-flex items-center gap-2 px-3 py-1 rounded-full border border-white/5 bg-white/[0.03] ml-2">
            <span className="h-1.5 w-1.5 rounded-full bg-success animate-pulse inline-block" aria-hidden="true" />
            Free &amp; Private
          </span>
        </nav>
      </div>
    </header>
  );
}
