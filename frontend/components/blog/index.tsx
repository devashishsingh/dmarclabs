import type { ReactNode } from 'react';

export const H2 = ({ children }: { children: ReactNode }) => (
  <h2 className="text-2xl font-semibold font-display text-text-primary tracking-tight mt-12 mb-4 pb-2 border-b border-white/[0.08]">
    {children}
  </h2>
);

export const H3 = ({ children }: { children: ReactNode }) => (
  <h3 className="text-lg font-semibold font-display text-text-primary mt-8 mb-3">
    {children}
  </h3>
);

export const P = ({ children }: { children: ReactNode }) => (
  <p className="text-text-muted leading-relaxed mb-5 text-[15px]">{children}</p>
);

export const Lead = ({ children }: { children: ReactNode }) => (
  <p className="text-text-secondary leading-relaxed mb-6 text-[16px]">{children}</p>
);

export const Strong = ({ children }: { children: ReactNode }) => (
  <strong className="font-semibold text-text-primary">{children}</strong>
);

export const Code = ({ children }: { children: ReactNode }) => (
  <code className="font-mono text-[13px] bg-white/5 border border-white/10 rounded px-1.5 py-0.5 text-accent">
    {children}
  </code>
);

export const Pre = ({ children }: { children: ReactNode }) => (
  <pre className="font-mono text-[13px] bg-[#0d0d0d] border border-white/10 rounded-xl p-5 overflow-x-auto my-6 text-text-secondary leading-relaxed">
    {children}
  </pre>
);

export const UL = ({ children }: { children: ReactNode }) => (
  <ul className="space-y-2.5 mb-6 pl-0">{children}</ul>
);

export const OL = ({ children }: { children: ReactNode }) => (
  <ol className="list-decimal list-inside space-y-2.5 mb-6 text-text-muted text-[15px]">{children}</ol>
);

export const LI = ({ children }: { children: ReactNode }) => (
  <li className="flex items-start gap-2.5 text-text-muted text-[15px] leading-relaxed">
    <span className="mt-[7px] h-1.5 w-1.5 rounded-full bg-accent flex-shrink-0" aria-hidden="true" />
    <span>{children}</span>
  </li>
);

export const OLI = ({ children }: { children: ReactNode }) => (
  <li className="text-text-muted text-[15px] leading-relaxed pl-1">{children}</li>
);

export const Blockquote = ({ children }: { children: ReactNode }) => (
  <blockquote className="border-l-2 border-accent/50 pl-5 py-1 my-6 bg-accent/5 rounded-r-lg">
    <div className="text-text-secondary text-[15px] italic leading-relaxed">{children}</div>
  </blockquote>
);

export const Note = ({ children }: { children: ReactNode }) => (
  <div className="my-6 p-4 bg-white/[0.03] border border-white/[0.08] rounded-xl text-text-muted text-[14px] leading-relaxed">
    <span className="font-semibold text-text-secondary uppercase text-[11px] tracking-widest block mb-1.5">Note</span>
    {children}
  </div>
);

export const Tip = ({ children }: { children: ReactNode }) => (
  <div className="my-6 p-4 bg-accent/5 border border-accent/20 rounded-xl text-text-muted text-[14px] leading-relaxed">
    <span className="font-semibold text-accent uppercase text-[11px] tracking-widest block mb-1.5">Tip</span>
    {children}
  </div>
);

export const Table = ({ children }: { children: ReactNode }) => (
  <div className="overflow-x-auto my-6 rounded-lg border border-white/[0.08]">
    <table className="w-full text-[13px] border-collapse">{children}</table>
  </div>
);

export const THead = ({ children }: { children: ReactNode }) => (
  <thead className="bg-white/[0.03] text-text-muted uppercase text-[10px] tracking-widest font-semibold">
    {children}
  </thead>
);

export const TH = ({ children }: { children: ReactNode }) => (
  <th className="px-4 py-2.5 text-left border-b border-white/[0.08]">{children}</th>
);

export const TD = ({ children }: { children: ReactNode }) => (
  <td className="px-4 py-2.5 border-b border-white/5 text-text-muted">{children}</td>
);

export const HR = () => (
  <hr className="border-none border-t border-white/[0.08] my-10" />
);
