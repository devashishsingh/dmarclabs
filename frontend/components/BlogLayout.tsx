'use client';

import Link from 'next/link';
import { ArrowLeft, Calendar, Clock } from 'lucide-react';

interface BlogLayoutProps {
  title: string;
  date: string;
  readingTime: string;
  tags: string[];
  children: React.ReactNode;
}

function formatDate(iso: string) {
  return new Date(iso).toLocaleDateString('en-US', { year: 'numeric', month: 'long', day: 'numeric' });
}

export default function BlogLayout({ title, date, readingTime, tags, children }: BlogLayoutProps) {
  return (
    <div className="flex-1 w-full max-w-[720px] mx-auto px-6 pt-32 pb-24">
      {/* Back */}
      <Link
        href="/blog"
        className="inline-flex items-center gap-1.5 text-xs text-text-muted hover:text-accent transition-colors mb-10 group"
      >
        <ArrowLeft className="h-3.5 w-3.5 group-hover:-translate-x-0.5 transition-transform" aria-hidden="true" />
        All articles
      </Link>

      {/* Meta */}
      <div className="flex flex-wrap items-center gap-3 mb-4 text-[11px] text-text-muted">
        <span className="inline-flex items-center gap-1.5">
          <Calendar className="h-3 w-3" aria-hidden="true" />
          {formatDate(date)}
        </span>
        <span className="inline-flex items-center gap-1.5">
          <Clock className="h-3 w-3" aria-hidden="true" />
          {readingTime}
        </span>
      </div>

      {/* Tags */}
      <div className="flex flex-wrap gap-2 mb-8">
        {tags.map((tag) => (
          <span
            key={tag}
            className="text-[10px] font-semibold uppercase tracking-widest text-text-muted border border-white/8 rounded-full px-2.5 py-0.5 bg-white/[0.02]"
          >
            {tag}
          </span>
        ))}
      </div>

      {/* Article body */}
      <article className="prose-dmarc">
        {children}
      </article>

      {/* Footer CTA */}
      <div className="mt-16 rounded-2xl border border-accent/20 bg-accent/5 p-6 sm:p-8 text-center space-y-3">
        <p className="text-text-primary font-semibold font-display text-lg">Ready to analyse your DMARC reports?</p>
        <p className="text-text-muted text-sm">Free, no signup, results in seconds. Your data is deleted after analysis.</p>
        <Link
          href="/"
          className="inline-flex items-center gap-2 px-6 py-2.5 rounded-xl bg-accent text-white text-sm font-medium hover:bg-accent/90 transition-colors mt-1"
        >
          Open DMARC Analyzer →
        </Link>
      </div>

      {/* Back link */}
      <div className="mt-10 pt-6 border-t border-white/8">
        <Link
          href="/blog"
          className="inline-flex items-center gap-1.5 text-xs text-text-muted hover:text-accent transition-colors group"
        >
          <ArrowLeft className="h-3.5 w-3.5 group-hover:-translate-x-0.5 transition-transform" aria-hidden="true" />
          Back to all articles
        </Link>
      </div>
    </div>
  );
}
