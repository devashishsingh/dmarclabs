import type { Metadata } from 'next';
import Link from 'next/link';
import { ArrowRight, Clock, Calendar } from 'lucide-react';

export const metadata: Metadata = {
  title: 'DMARC Blog — Guides, Tutorials & Best Practices | DMARC Labs',
  description:
    'In-depth guides on DMARC, SPF, DKIM, email security, and deliverability. Learn how to analyze DMARC reports, fix authentication failures, and protect your domain.',
  keywords: ['DMARC', 'SPF', 'DKIM', 'email security', 'deliverability', 'blog'],
  robots: 'index, follow',
  alternates: { canonical: 'https://www.dmarclabsds1.xyz/blog' },
  openGraph: {
    title: 'DMARC Blog — Guides, Tutorials & Best Practices',
    description:
      'In-depth guides on DMARC, SPF, DKIM, email security, and deliverability.',
    url: 'https://www.dmarclabsds1.xyz/blog',
    siteName: 'DMARC Labs',
    type: 'website',
  },
};

const posts = [
  {
    slug: 'analyze-large-dmarc-xml-reports-securely',
    title: 'How to Analyze Large DMARC XML Reports (100MB+) Securely',
    description:
      'Learn how to parse large DMARC XML files without upload limits, understand SPF/DKIM alignment, enrich IP data, and protect your email sender reputation — completely free and privacy-first.',
    date: '2025-07-01',
    readTime: '18 min read',
    tags: ['DMARC', 'XML', 'Privacy'],
    featured: true,
  },
  {
    slug: 'large-dmarc-xml-analyzer',
    title: 'The Best Free Tool for Analyzing Large DMARC XML Files',
    description:
      "Most DMARC tools cap file sizes at 10MB or require paid plans for larger reports. Here's how to handle massive XML files and why a browser-native parser changes everything.",
    date: '2025-07-02',
    readTime: '8 min read',
    tags: ['DMARC', 'Tools'],
    featured: false,
  },
  {
    slug: 'dmarc-report-privacy-security',
    title: 'DMARC Report Privacy: Why Uploading to SaaS Tools Is Risky',
    description:
      "Your DMARC aggregate reports contain sensitive IP addresses, sending infrastructure data, and volume breakdowns. Here's why processing them locally matters.",
    date: '2025-07-03',
    readTime: '7 min read',
    tags: ['Privacy', 'Security'],
    featured: false,
  },
  {
    slug: 'why-dmarc-tools-fail-large-files',
    title: 'Why Most DMARC Tools Fail with Large XML Files (And How to Fix It)',
    description:
      'Understanding the technical reasons DMARC parsers hit walls at 10–20MB — and what browser-native streaming can do that server-side processing cannot.',
    date: '2025-07-04',
    readTime: '9 min read',
    tags: ['Technical', 'Performance'],
    featured: false,
  },
  {
    slug: 'how-to-read-dmarc-xml-report',
    title: 'How to Read a DMARC XML Report: A Field Guide for Email Admins',
    description:
      'DMARC aggregate XML reports are dense and technical. This guide walks through every field — from policy_published to auth_results — with real examples.',
    date: '2025-07-05',
    readTime: '12 min read',
    tags: ['Tutorial', 'XML'],
    featured: false,
  },
  {
    slug: 'ip-enrichment-email-security-dmarc',
    title: 'IP Enrichment in DMARC Analysis: Why WHOIS Data Changes Everything',
    description:
      'Raw IP addresses in DMARC reports tell you almost nothing. Learn how WHOIS enrichment reveals the sending services behind every authentication result.',
    date: '2025-07-06',
    readTime: '10 min read',
    tags: ['IP Intelligence', 'WHOIS'],
    featured: false,
  },
  {
    slug: 'dmarc-xml-report-fields-explained',
    title: 'DMARC XML Report Fields Explained — Complete Field Reference',
    description:
      'A plain-English reference for every field in a DMARC aggregate XML report: report_metadata, policy_published, source_ip, disposition, dkim, spf, count, and auth_results.',
    date: '2025-07-07',
    readTime: '10 min read',
    tags: ['Reference', 'XML'],
    featured: false,
  },
  {
    slug: 'dmarc-report-for-gmail',
    title: 'How to Read Your Google DMARC Report — Gmail Aggregate Report Guide',
    description:
      'Google sends DMARC aggregate reports daily to every domain. Learn what the report contains, how to open the XML, and what your pass rate means for deliverability.',
    date: '2025-07-08',
    readTime: '9 min read',
    tags: ['Gmail', 'Google'],
    featured: false,
  },
  {
    slug: 'dmarc-fail-but-dkim-pass',
    title: 'DMARC Failing But DKIM Passes — 5 Root Causes and How to Fix Them',
    description:
      'Email failing DMARC even though DKIM passes? The five most common causes — alignment mismatch, forwarding, subdomain policy, wrong selector — and how to diagnose each one.',
    date: '2025-07-09',
    readTime: '11 min read',
    tags: ['DKIM', 'Troubleshooting'],
    featured: false,
  },
  {
    slug: 'dmarc-rua-vs-ruf',
    title: 'DMARC rua vs ruf: Aggregate vs Forensic Reports Explained',
    description:
      'What is the difference between DMARC rua and ruf? Learn what aggregate and forensic reports contain, their privacy implications, and whether you should configure ruf.',
    date: '2025-07-10',
    readTime: '8 min read',
    tags: ['Reports', 'Privacy'],
    featured: false,
  },
  {
    slug: 'dmarc-policy-none-quarantine-reject',
    title: 'DMARC p=none vs p=quarantine vs p=reject — When to Use Each Policy',
    description:
      'A practical decision guide for moving through DMARC policy levels safely — with readiness criteria, pct rollout timeline, rollback steps, and real-world timelines.',
    date: '2025-07-11',
    readTime: '12 min read',
    tags: ['Policy', 'Email Security'],
    featured: false,
  },
];

function formatDate(date: string) {
  return new Date(date).toLocaleDateString('en-US', {
    year: 'numeric',
    month: 'long',
    day: 'numeric',
  });
}

export default function BlogPage() {
  const featured = posts.find((p) => p.featured);
  const rest = posts.filter((p) => !p.featured);

  return (
    <div className="max-w-layout mx-auto px-4 sm:px-6 pt-28 sm:pt-32 pb-16 sm:pb-24">
      {/* Page header */}
      <div className="max-w-2xl mb-10 sm:mb-16">
        <div className="flex items-center gap-2 mb-5">
          <span
            className="w-2 h-2 bg-accent rotate-45 flex-shrink-0"
            style={{ boxShadow: '0 0 6px #ef233c' }}
            aria-hidden="true"
          />
          <span className="text-accent text-xs uppercase tracking-widest font-semibold">
            Blog
          </span>
        </div>
        <h1 className="text-3xl sm:text-4xl md:text-5xl font-semibold font-display text-text-primary tracking-tight leading-[1.15] sm:leading-[1.1] mb-5">
          DMARC Guides &amp; Tutorials
        </h1>
        <p className="text-text-muted text-[16px] leading-relaxed">
          In-depth articles on DMARC, SPF, DKIM, email authentication, and deliverability.
          Everything you need to stop email spoofing and fix authentication failures.
        </p>
      </div>

      {/* Featured post */}
      {featured && (
        <Link
          href={`/blog/${featured.slug}`}
          className="block group mb-10 sm:mb-12 p-5 sm:p-8 rounded-2xl border border-white/[0.08] bg-white/[0.02] hover:border-accent/30 hover:bg-accent/[0.03] transition-all duration-300"
        >
          <div className="flex flex-wrap gap-2 mb-4">
            <span className="text-[10px] font-semibold uppercase tracking-widest text-accent bg-accent/10 border border-accent/20 px-2.5 py-1 rounded-full">
              Featured
            </span>
            {featured.tags.map((tag) => (
              <span
                key={tag}
                className="text-[10px] font-medium uppercase tracking-widest text-text-muted border border-white/[0.08] px-2.5 py-1 rounded-full"
              >
                {tag}
              </span>
            ))}
          </div>
          <h2 className="text-xl sm:text-2xl md:text-3xl font-semibold font-display text-text-primary tracking-tight leading-[1.25] sm:leading-[1.2] mb-4 group-hover:text-accent transition-colors break-words">
            {featured.title}
          </h2>
          <p className="text-text-muted text-[15px] leading-relaxed mb-6 max-w-2xl">
            {featured.description}
          </p>
          <div className="flex flex-wrap items-center justify-between gap-3">
            <div className="flex flex-wrap gap-x-5 gap-y-2 text-text-muted text-[13px]">
              <span className="flex items-center gap-1.5">
                <Calendar className="w-3.5 h-3.5" aria-hidden="true" />
                {formatDate(featured.date)}
              </span>
              <span className="flex items-center gap-1.5">
                <Clock className="w-3.5 h-3.5" aria-hidden="true" />
                {featured.readTime}
              </span>
            </div>
            <span className="flex items-center gap-1.5 text-accent text-sm font-medium group-hover:gap-2.5 transition-all">
              Read article
              <ArrowRight className="w-4 h-4" aria-hidden="true" />
            </span>
          </div>
        </Link>
      )}

      {/* Grid of remaining posts */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 sm:gap-6">
        {rest.map((post) => (
          <Link
            key={post.slug}
            href={`/blog/${post.slug}`}
            className="group flex flex-col p-5 sm:p-6 rounded-xl border border-white/[0.08] bg-white/[0.01] hover:border-accent/25 hover:bg-accent/[0.02] transition-all duration-200"
          >
            <div className="flex flex-wrap gap-2 mb-3">
              {post.tags.map((tag) => (
                <span
                  key={tag}
                  className="text-[10px] font-medium uppercase tracking-widest text-accent/70 border border-accent/15 bg-accent/5 px-2 py-0.5 rounded-full"
                >
                  {tag}
                </span>
              ))}
            </div>
            <h2 className="text-base sm:text-lg font-semibold font-display text-text-primary tracking-tight leading-[1.3] mb-3 group-hover:text-accent transition-colors flex-1 break-words">
              {post.title}
            </h2>
            <p className="text-text-muted text-[14px] leading-relaxed mb-5 line-clamp-2">
              {post.description}
            </p>
            <div className="flex items-center justify-between mt-auto">
              <div className="flex gap-4 text-text-muted text-[12px]">
                <span className="flex items-center gap-1">
                  <Calendar className="w-3 h-3" aria-hidden="true" />
                  {formatDate(post.date)}
                </span>
                <span className="flex items-center gap-1">
                  <Clock className="w-3 h-3" aria-hidden="true" />
                  {post.readTime}
                </span>
              </div>
              <ArrowRight
                className="w-4 h-4 text-text-muted group-hover:text-accent group-hover:translate-x-0.5 transition-all"
                aria-hidden="true"
              />
            </div>
          </Link>
        ))}
      </div>

      {/* Divider + back to analyzer */}
      <div className="mt-20 pt-10 border-t border-white/[0.06] text-center">
        <p className="text-text-muted text-sm mb-4">
          Have a DMARC report you need to parse right now?
        </p>
        <Link
          href="/#upload"
          className="inline-flex items-center gap-2 bg-accent hover:bg-accent-hover text-white text-sm font-semibold px-5 py-2.5 rounded-lg transition-colors"
        >
          Try the Free Analyzer
          <ArrowRight className="w-4 h-4" aria-hidden="true" />
        </Link>
      </div>
    </div>
  );
}
