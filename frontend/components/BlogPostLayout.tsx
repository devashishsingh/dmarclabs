import Link from 'next/link';
import { ChevronLeft, Clock, Calendar } from 'lucide-react';
import type { ReactNode } from 'react';

interface BlogPostLayoutProps {
  title: string;
  description: string;
  date: string;
  readTime: string;
  tags: string[];
  children: ReactNode;
  jsonLd?: object | object[];
}

export default function BlogPostLayout({
  title,
  description,
  date,
  readTime,
  tags,
  children,
  jsonLd,
}: BlogPostLayoutProps) {
  const formattedDate = new Date(date).toLocaleDateString('en-US', {
    year: 'numeric',
    month: 'long',
    day: 'numeric',
  });

  return (
    <div className="max-w-[760px] mx-auto px-6 pt-32 pb-24">
      {/* Back link */}
      <Link
        href="/blog"
        className="inline-flex items-center gap-1.5 text-text-muted hover:text-accent text-sm transition-colors mb-12 group"
      >
        <ChevronLeft className="w-4 h-4 group-hover:-translate-x-0.5 transition-transform" />
        All articles
      </Link>

      {/* Article header */}
      <header className="mb-10">
        {/* Tags */}
        <div className="flex flex-wrap gap-2 mb-5">
          {tags.map((tag) => (
            <span
              key={tag}
              className="text-[11px] font-medium uppercase tracking-widest text-accent/80 border border-accent/20 bg-accent/5 px-2.5 py-1 rounded-full"
            >
              {tag}
            </span>
          ))}
        </div>

        {/* Title */}
        <h1 className="text-3xl md:text-[2.35rem] font-semibold font-display text-text-primary tracking-tight leading-[1.15] mb-5">
          {title}
        </h1>

        {/* Description */}
        <p className="text-text-secondary text-[16px] leading-relaxed mb-6 border-b border-white/[0.08] pb-6">
          {description}
        </p>

        {/* Meta row */}
        <div className="flex flex-wrap gap-x-5 gap-y-2 text-text-muted text-[13px]">
          <span className="flex items-center gap-1.5">
            <Calendar className="w-3.5 h-3.5" aria-hidden="true" />
            {formattedDate}
          </span>
          <span className="flex items-center gap-1.5">
            <Clock className="w-3.5 h-3.5" aria-hidden="true" />
            {readTime}
          </span>
        </div>
      </header>

      {/* Content */}
      <article>{children}</article>

      {/* CTA */}
      <div className="mt-16 p-6 border border-accent/20 rounded-xl bg-accent/5">
        <p className="text-text-primary font-semibold font-display text-lg mb-2">
          Ready to analyze your DMARC reports?
        </p>
        <p className="text-text-muted text-sm mb-4">
          DMARC Labs processes large XML files entirely in your browser — no upload, no
          signup, no data retention. Supports files up to 200MB+.
        </p>
        <Link
          href="/#upload"
          className="inline-flex items-center gap-2 bg-accent hover:bg-accent-hover text-white text-sm font-semibold px-4 py-2.5 rounded-lg transition-colors"
        >
          Analyze for Free
        </Link>
      </div>

      {/* JSON-LD */}
      {jsonLd && (
        Array.isArray(jsonLd) ? (
          jsonLd.map((schema, i) => (
            <script
              key={i}
              type="application/ld+json"
              dangerouslySetInnerHTML={{ __html: JSON.stringify(schema) }}
            />
          ))
        ) : (
          <script
            type="application/ld+json"
            dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
          />
        )
      )}
    </div>
  );
}
