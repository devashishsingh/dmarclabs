import type { Metadata } from 'next';
import Link from 'next/link';
import { ArrowRight, Calendar, Clock } from 'lucide-react';

export const metadata: Metadata = {
  title: 'Blog — DMARC Labs',
  description: 'Guides, explainers, and best practices for DMARC, SPF, DKIM, and email deliverability.',
  robots: 'index, follow',
  alternates: {
    canonical: 'https://www.dmarclabsds1.xyz/blog',
  },
  openGraph: {
    title: 'Blog — DMARC Labs',
    description: 'Guides, explainers, and best practices for DMARC, SPF, DKIM, and email deliverability.',
    type: 'website',
    siteName: 'DMARC Labs',
    url: 'https://www.dmarclabsds1.xyz/blog',
  },
};

const posts = [
  {
    slug: 'understanding-dmarc-reports',
    title: 'Understanding DMARC Reports: What They Tell You and How to Act on Them',
    excerpt:
      'DMARC aggregate reports are XML files packed with sender intelligence. Learn what each field means, how to spot spoofing attempts, and how DMARC Labs turns raw XML into clear insights — in seconds.',
    date: '2026-04-24',
    readingTime: '8 min read',
    tags: ['DMARC', 'SPF', 'DKIM', 'Email Security', 'Guide'],
  },
];

function formatDate(iso: string) {
  return new Date(iso).toLocaleDateString('en-US', { year: 'numeric', month: 'long', day: 'numeric' });
}

export default function BlogPage() {
  return (
    <div className="flex-1 w-full max-w-layout mx-auto px-6 pt-32 pb-24 space-y-12">
      {/* Header */}
      <div className="space-y-4">
        <span className="inline-flex items-center gap-2 border border-accent/25 bg-accent/5 rounded-full px-4 py-1.5 text-[12px] text-text-secondary font-medium backdrop-blur-sm">
          <span className="h-1.5 w-1.5 rounded-full bg-accent animate-pulse flex-shrink-0" aria-hidden="true" />
          Email Security Knowledge Base
        </span>
        <h1 className="text-5xl md:text-6xl font-semibold text-text-primary tracking-tight leading-[1.1] font-display">
          Blog
        </h1>
        <p className="text-text-muted text-lg max-w-xl leading-relaxed">
          Practical guides on DMARC, SPF, DKIM, and email deliverability — written for engineers and IT teams who need straight answers.
        </p>
      </div>

      {/* Post list */}
      <div className="grid gap-6">
        {posts.map((post) => (
          <Link
            key={post.slug}
            href={`/blog/${post.slug}`}
            className="group block rounded-2xl border border-white/10 bg-card p-6 sm:p-8 hover:border-accent/30 hover:bg-accent/[0.03] transition-all duration-200"
          >
            <div className="flex flex-wrap items-center gap-3 mb-3 text-[11px] text-text-muted">
              <span className="inline-flex items-center gap-1.5">
                <Calendar className="h-3 w-3" aria-hidden="true" />
                {formatDate(post.date)}
              </span>
              <span className="inline-flex items-center gap-1.5">
                <Clock className="h-3 w-3" aria-hidden="true" />
                {post.readingTime}
              </span>
            </div>
            <h2 className="text-xl font-semibold font-display text-text-primary group-hover:text-accent transition-colors leading-snug mb-3">
              {post.title}
            </h2>
            <p className="text-text-muted text-[14px] leading-relaxed mb-4">{post.excerpt}</p>
            <div className="flex flex-wrap items-center justify-between gap-4">
              <div className="flex flex-wrap gap-2">
                {post.tags.map((tag) => (
                  <span
                    key={tag}
                    className="text-[10px] font-semibold uppercase tracking-widest text-text-muted border border-white/8 rounded-full px-2.5 py-0.5 bg-white/[0.02]"
                  >
                    {tag}
                  </span>
                ))}
              </div>
              <span className="inline-flex items-center gap-1 text-xs text-accent font-medium group-hover:gap-2 transition-all">
                Read article <ArrowRight className="h-3.5 w-3.5" aria-hidden="true" />
              </span>
            </div>
          </Link>
        ))}
      </div>
    </div>
  );
}
