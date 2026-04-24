import type { MDXComponents } from 'mdx/types';
import Link from 'next/link';

export function useMDXComponents(components: MDXComponents): MDXComponents {
  return {
    h1: ({ children }) => (
      <h1 className="text-4xl md:text-5xl font-semibold font-display text-text-primary tracking-tight leading-[1.1] mt-10 mb-6">
        {children}
      </h1>
    ),
    h2: ({ children }) => (
      <h2 className="text-2xl font-semibold font-display text-text-primary tracking-tight mt-12 mb-4 pb-2 border-b border-white/8">
        {children}
      </h2>
    ),
    h3: ({ children }) => (
      <h3 className="text-lg font-semibold font-display text-text-primary mt-8 mb-3">
        {children}
      </h3>
    ),
    p: ({ children }) => (
      <p className="text-text-muted leading-relaxed mb-5 text-[15px]">{children}</p>
    ),
    a: ({ href, children }) => {
      const isInternal = href?.startsWith('/');
      if (isInternal) {
        return (
          <Link href={href!} className="text-accent hover:text-accent/80 underline underline-offset-4 decoration-accent/40 hover:decoration-accent transition-colors">
            {children}
          </Link>
        );
      }
      return (
        <a href={href} target="_blank" rel="noopener noreferrer" className="text-accent hover:text-accent/80 underline underline-offset-4 decoration-accent/40 hover:decoration-accent transition-colors">
          {children}
        </a>
      );
    },
    ul: ({ children }) => (
      <ul className="list-none space-y-2 mb-6 pl-0">{children}</ul>
    ),
    ol: ({ children }) => (
      <ol className="list-decimal list-inside space-y-2 mb-6 text-text-muted text-[15px]">{children}</ol>
    ),
    li: ({ children }) => (
      <li className="flex items-start gap-2.5 text-text-muted text-[15px] leading-relaxed">
        <span className="mt-[7px] h-1.5 w-1.5 rounded-full bg-accent flex-shrink-0" aria-hidden="true" />
        <span>{children}</span>
      </li>
    ),
    blockquote: ({ children }) => (
      <blockquote className="border-l-2 border-accent/50 pl-4 py-1 my-6 bg-accent/5 rounded-r-lg">
        <div className="text-text-secondary text-[15px] italic leading-relaxed">{children}</div>
      </blockquote>
    ),
    code: ({ children }) => (
      <code className="font-mono text-[13px] bg-white/5 border border-white/10 rounded px-1.5 py-0.5 text-accent">
        {children}
      </code>
    ),
    pre: ({ children }) => (
      <pre className="font-mono text-[13px] bg-[#0d0d0d] border border-white/10 rounded-xl p-4 overflow-x-auto my-6 text-text-secondary leading-relaxed">
        {children}
      </pre>
    ),
    strong: ({ children }) => (
      <strong className="font-semibold text-text-primary">{children}</strong>
    ),
    hr: () => (
      <hr className="border-none border-t border-white/8 my-10" />
    ),
    table: ({ children }) => (
      <div className="overflow-x-auto my-6 rounded-lg border border-white/8">
        <table className="w-full text-[13px] border-collapse">{children}</table>
      </div>
    ),
    thead: ({ children }) => (
      <thead className="bg-white/[0.03] text-text-muted uppercase text-[10px] tracking-widest font-semibold">
        {children}
      </thead>
    ),
    th: ({ children }) => (
      <th className="px-4 py-2.5 text-left border-b border-white/8">{children}</th>
    ),
    td: ({ children }) => (
      <td className="px-4 py-2.5 border-b border-white/5 text-text-muted">{children}</td>
    ),
    ...components,
  };
}
