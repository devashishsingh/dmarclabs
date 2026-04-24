'use client';

import { useState } from 'react';
import { Copy, Check, ChevronUp, ChevronDown } from 'lucide-react';
import type { IPRecord } from '@/lib/api';
import { threatBadgeClass, passRateClass, copyToClipboard } from '@/lib/utils';

interface ResultsTableProps {
  records: IPRecord[];
}

type SortKey = 'emailVolume' | 'ip' | 'dmarc' | 'spf' | 'dkim' | 'threat';
type SortDir = 'asc' | 'desc';

const THREAT_ORDER: Record<string, number> = { SUSPICIOUS: 0, UNKNOWN: 1, NEUTRAL: 2, TRUSTED: 3 };

function sortRecords(records: IPRecord[], key: SortKey, dir: SortDir): IPRecord[] {
  return [...records].sort((a, b) => {
    let cmp = 0;
    switch (key) {
      case 'emailVolume': cmp = a.emailVolume - b.emailVolume; break;
      case 'ip': cmp = a.ip.localeCompare(b.ip); break;
      case 'dmarc': cmp = parseFloat(a.dmarc.passRate) - parseFloat(b.dmarc.passRate); break;
      case 'spf': cmp = parseFloat(a.spf.passRate) - parseFloat(b.spf.passRate); break;
      case 'dkim': cmp = parseFloat(a.dkim.passRate) - parseFloat(b.dkim.passRate); break;
      case 'threat': cmp = (THREAT_ORDER[a.whois.threatLevel] ?? 1) - (THREAT_ORDER[b.whois.threatLevel] ?? 1); break;
    }
    return dir === 'asc' ? cmp : -cmp;
  });
}

function CopyButton({ text }: { text: string }) {
  const [copied, setCopied] = useState(false);
  const handleCopy = async () => {
    const ok = await copyToClipboard(text);
    if (ok) { setCopied(true); setTimeout(() => setCopied(false), 2000); }
  };
  return (
    <button onClick={handleCopy} aria-label={`Copy ${text}`}
      className="ml-1.5 opacity-0 group-hover:opacity-100 transition-opacity p-1 rounded hover:bg-border text-text-muted hover:text-text-primary">
      {copied ? <Check className="h-3 w-3 text-success" /> : <Copy className="h-3 w-3" />}
    </button>
  );
}

function SortIcon({ active, dir }: { active: boolean; dir: SortDir }) {
  if (!active) return <ChevronUp className="h-3 w-3 opacity-25" />;
  return dir === 'asc' ? <ChevronUp className="h-3 w-3 text-accent" /> : <ChevronDown className="h-3 w-3 text-accent" />;
}

function PassCell({ value }: { value: number }) {
  return <td className="px-2 py-2 text-right text-xs font-mono text-success">{value.toLocaleString()}</td>;
}

function FailCell({ value }: { value: number }) {
  return <td className="px-2 py-2 text-right text-xs font-mono"
    style={{ color: value > 0 ? '#ef233c' : 'var(--color-text-muted)' }}>
    {value.toLocaleString()}
  </td>;
}

function RateCell({ rate, sortable, active, dir, onSort }: {
  rate: string; sortable?: boolean; active?: boolean; dir?: SortDir; onSort?: () => void;
}) {
  const cls = passRateClass(rate);
  if (!sortable) return <td className={`px-2 py-2 text-right text-xs font-mono font-semibold ${cls}`}>{rate}</td>;
  return (
    <td className={`px-2 py-2 text-right text-xs font-mono font-semibold ${cls} cursor-pointer select-none hover:opacity-80`}
      onClick={onSort}>
      <span className="inline-flex items-center gap-0.5 justify-end">
        {rate}
        <SortIcon active={!!active} dir={dir!} />
      </span>
    </td>
  );
}

const groupHeader = 'px-2 py-1.5 text-center text-[9px] font-bold uppercase tracking-widest text-text-muted border-b border-white/5';
const subHeader = 'px-2 py-1.5 text-right text-[9px] font-semibold uppercase tracking-wider text-text-muted cursor-pointer select-none hover:text-text-primary transition-colors whitespace-nowrap';
const subHeaderLeft = 'px-2 py-1.5 text-left text-[9px] font-semibold uppercase tracking-wider text-text-muted cursor-pointer select-none hover:text-text-primary transition-colors whitespace-nowrap';

export default function ResultsTable({ records }: ResultsTableProps) {
  const [sortKey, setSortKey] = useState<SortKey>('emailVolume');
  const [sortDir, setSortDir] = useState<SortDir>('desc');

  const handleSort = (key: SortKey) => {
    if (sortKey === key) setSortDir((d) => (d === 'asc' ? 'desc' : 'asc'));
    else { setSortKey(key); setSortDir('desc'); }
  };

  const sorted = sortRecords(records, sortKey, sortDir);

  return (
    <div className="w-full space-y-3">
      {/* Threat level legend */}
      <div className="flex flex-wrap items-center gap-x-5 gap-y-2 px-1">
        <span className="text-[10px] font-semibold uppercase tracking-widest text-text-muted">Threat key:</span>
        <span className="flex items-center gap-1.5 text-[11px] text-text-secondary">
          <span className="inline-flex items-center px-1.5 py-0.5 rounded-full text-[10px] font-semibold tracking-wide bg-success/20 text-success border border-success/30">TRUSTED</span>
          Well-known legitimate sender (Google, Microsoft, your ESP)
        </span>
        <span className="flex items-center gap-1.5 text-[11px] text-text-secondary">
          <span className="inline-flex items-center px-1.5 py-0.5 rounded-full text-[10px] font-semibold tracking-wide bg-accent/20 text-accent border border-accent/30">NEUTRAL</span>
          Registered IP — not flagged, but not specifically verified
        </span>
        <span className="flex items-center gap-1.5 text-[11px] text-text-secondary">
          <span className="inline-flex items-center px-1.5 py-0.5 rounded-full text-[10px] font-semibold tracking-wide bg-error/20 text-error border border-error/30">SUSPICIOUS</span>
          Associated with flagged ASNs, open proxies, or known bad actors
        </span>
        <span className="flex items-center gap-1.5 text-[11px] text-text-secondary">
          <span className="inline-flex items-center px-1.5 py-0.5 rounded-full text-[10px] font-semibold tracking-wide bg-slate-700 text-slate-400 border border-slate-600">UNKNOWN</span>
          WHOIS lookup returned no usable owner information
        </span>
      </div>

      <div className="overflow-x-auto rounded-lg border border-border">
      <table className="w-full border-collapse text-xs" aria-label="DMARC analysis results">
        <thead className="bg-card sticky top-0 z-10">
          {/* Group headers */}
          <tr className="border-b border-border/50">
            <th className={`${groupHeader} text-left`} colSpan={2}>Sender</th>
            <th className={`${groupHeader} border-l border-white/5`} colSpan={3}>
              <span className="text-accent">DMARC</span> Compliance
            </th>
            <th className={`${groupHeader} border-l border-white/5`} colSpan={4}>SPF</th>
            <th className={`${groupHeader} border-l border-white/5`} colSpan={4}>DKIM</th>
            <th className={`${groupHeader} text-left border-l border-white/5`} colSpan={3}>Sender Intelligence</th>
          </tr>
          {/* Sub-headers */}
          <tr className="border-b border-border">
            {/* Sender */}
            <th className={subHeaderLeft} onClick={() => handleSort('ip')}>
              <span className="inline-flex items-center gap-0.5">IP Address <SortIcon active={sortKey === 'ip'} dir={sortDir} /></span>
            </th>
            <th className={subHeader} onClick={() => handleSort('emailVolume')}>
              <span className="inline-flex items-center gap-0.5 justify-end">Volume <SortIcon active={sortKey === 'emailVolume'} dir={sortDir} /></span>
            </th>
            {/* DMARC */}
            <th className={`${subHeader} border-l border-white/5`}>Pass</th>
            <th className={subHeader}>Fail</th>
            <th className={subHeader} onClick={() => handleSort('dmarc')}>
              <span className="inline-flex items-center gap-0.5 justify-end">Rate <SortIcon active={sortKey === 'dmarc'} dir={sortDir} /></span>
            </th>
            {/* SPF */}
            <th className={`${subHeader} border-l border-white/5`}>Pass</th>
            <th className={subHeader}>Fail</th>
            <th className={subHeader} onClick={() => handleSort('spf')}>
              <span className="inline-flex items-center gap-0.5 justify-end">Rate <SortIcon active={sortKey === 'spf'} dir={sortDir} /></span>
            </th>
            <th className={`${subHeader} text-[9px] text-accent/80`} title="SPF alignment: policy_evaluated.spf — domain in From: header must match SPF envelope domain">Aligned</th>
            {/* DKIM */}
            <th className={`${subHeader} border-l border-white/5`}>Pass</th>
            <th className={subHeader}>Fail</th>
            <th className={subHeader} onClick={() => handleSort('dkim')}>
              <span className="inline-flex items-center gap-0.5 justify-end">Rate <SortIcon active={sortKey === 'dkim'} dir={sortDir} /></span>
            </th>
            <th className={`${subHeader} text-[9px] text-accent/80`} title="DKIM alignment: policy_evaluated.dkim — DKIM d= domain must match From: header domain">Aligned</th>
            {/* Sender Intelligence */}
            <th className={`${subHeaderLeft} border-l border-white/5`}>Owner</th>
            <th className={subHeaderLeft}>Country</th>
            <th className={subHeader} onClick={() => handleSort('threat')}>
              <span className="inline-flex items-center gap-0.5 justify-end">Threat <SortIcon active={sortKey === 'threat'} dir={sortDir} /></span>
            </th>
          </tr>
        </thead>
        <tbody>
          {sorted.map((record, i) => (
            <tr key={record.ip}
              className={[
                'group border-t border-border/50 transition-colors',
                i % 2 === 0 ? 'bg-background' : 'bg-card/30',
                'hover:bg-accent/5',
              ].join(' ')}>
              {/* IP */}
              <td className="px-2 py-2 font-mono text-xs text-text-primary max-w-[120px]">
                <span className="flex items-center min-w-0">
                  <span className="truncate" title={record.ip}>{record.ip}</span>
                  <CopyButton text={record.ip} />
                </span>
              </td>
              {/* Volume */}
              <td className="px-2 py-2 text-right font-mono text-xs text-text-primary font-medium">
                {record.emailVolume.toLocaleString()}
              </td>
              {/* DMARC */}
              <PassCell value={record.dmarc.pass} />
              <FailCell value={record.dmarc.fail} />
              <RateCell rate={record.dmarc.passRate} sortable active={sortKey === 'dmarc'} dir={sortDir} onSort={() => handleSort('dmarc')} />
              {/* SPF */}
              <PassCell value={record.spf.pass} />
              <FailCell value={record.spf.fail} />
              <RateCell rate={record.spf.passRate} sortable active={sortKey === 'spf'} dir={sortDir} onSort={() => handleSort('spf')} />
              <RateCell rate={record.spf.alignedRate ?? '—'} />
              {/* DKIM */}
              <PassCell value={record.dkim.pass} />
              <FailCell value={record.dkim.fail} />
              <RateCell rate={record.dkim.passRate} sortable active={sortKey === 'dkim'} dir={sortDir} onSort={() => handleSort('dkim')} />
              <RateCell rate={record.dkim.alignedRate ?? '—'} />
              {/* Sender Intelligence */}
              <td className="px-2 py-2 text-xs text-text-muted max-w-[130px] truncate border-l border-white/5"
                title={record.whois.owner}>
                {record.whois.owner}
              </td>
              <td className="px-2 py-2 text-xs text-text-muted whitespace-nowrap">
                {record.whois.country}
              </td>
              <td className="px-2 py-2 text-right">
                <span className={[
                  'inline-flex items-center px-1.5 py-0.5 rounded-full text-[10px] font-semibold tracking-wide',
                  threatBadgeClass(record.whois.threatLevel),
                ].join(' ')}>
                  {record.whois.threatLevel}
                </span>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
    </div>
  );
}
