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
      case 'emailVolume':
        cmp = a.emailVolume - b.emailVolume;
        break;
      case 'ip':
        cmp = a.ip.localeCompare(b.ip);
        break;
      case 'dmarc':
        cmp = parseFloat(a.dmarc.passRate) - parseFloat(b.dmarc.passRate);
        break;
      case 'spf':
        cmp = parseFloat(a.spf.passRate) - parseFloat(b.spf.passRate);
        break;
      case 'dkim':
        cmp = parseFloat(a.dkim.passRate) - parseFloat(b.dkim.passRate);
        break;
      case 'threat':
        cmp = (THREAT_ORDER[a.whois.threatLevel] ?? 1) - (THREAT_ORDER[b.whois.threatLevel] ?? 1);
        break;
    }
    return dir === 'asc' ? cmp : -cmp;
  });
}

function CopyButton({ text }: { text: string }) {
  const [copied, setCopied] = useState(false);

  const handleCopy = async () => {
    const ok = await copyToClipboard(text);
    if (ok) {
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    }
  };

  return (
    <button
      onClick={handleCopy}
      aria-label={`Copy ${text}`}
      className="ml-2 opacity-0 group-hover:opacity-100 transition-opacity p-1 rounded hover:bg-border text-text-muted hover:text-text-primary"
    >
      {copied ? <Check className="h-3.5 w-3.5 text-success" /> : <Copy className="h-3.5 w-3.5" />}
    </button>
  );
}

function SortIcon({ active, dir }: { active: boolean; dir: SortDir }) {
  if (!active) return <ChevronUp className="h-3.5 w-3.5 opacity-30" />;
  return dir === 'asc' ? (
    <ChevronUp className="h-3.5 w-3.5 text-accent" />
  ) : (
    <ChevronDown className="h-3.5 w-3.5 text-accent" />
  );
}

export default function ResultsTable({ records }: ResultsTableProps) {
  const [sortKey, setSortKey] = useState<SortKey>('emailVolume');
  const [sortDir, setSortDir] = useState<SortDir>('desc');

  const handleSort = (key: SortKey) => {
    if (sortKey === key) {
      setSortDir((d) => (d === 'asc' ? 'desc' : 'asc'));
    } else {
      setSortKey(key);
      setSortDir('desc');
    }
  };

  const sorted = sortRecords(records, sortKey, sortDir);

  const thClass =
    'px-4 py-3 text-left text-xs font-semibold text-text-muted uppercase tracking-wider whitespace-nowrap cursor-pointer select-none hover:text-text-primary transition-colors';

  return (
    <div className="w-full overflow-x-auto rounded-lg border border-border">
      <table className="w-full border-collapse min-w-[900px]" aria-label="DMARC analysis results">
        <thead className="bg-card sticky top-0 z-10">
          <tr>
            <th className={thClass} onClick={() => handleSort('ip')}>
              <span className="flex items-center gap-1">
                IP Address
                <SortIcon active={sortKey === 'ip'} dir={sortDir} />
              </span>
            </th>
            <th className={thClass} onClick={() => handleSort('emailVolume')}>
              <span className="flex items-center gap-1">
                Volume
                <SortIcon active={sortKey === 'emailVolume'} dir={sortDir} />
              </span>
            </th>
            <th className={thClass} onClick={() => handleSort('dmarc')}>
              <span className="flex items-center gap-1">
                DMARC
                <SortIcon active={sortKey === 'dmarc'} dir={sortDir} />
              </span>
            </th>
            <th className={thClass} onClick={() => handleSort('spf')}>
              <span className="flex items-center gap-1">
                SPF
                <SortIcon active={sortKey === 'spf'} dir={sortDir} />
              </span>
            </th>
            <th className={thClass} onClick={() => handleSort('dkim')}>
              <span className="flex items-center gap-1">
                DKIM
                <SortIcon active={sortKey === 'dkim'} dir={sortDir} />
              </span>
            </th>
            <th className={thClass}>WHOIS Owner</th>
            <th className={thClass}>Country</th>
            <th className={thClass} onClick={() => handleSort('threat')}>
              <span className="flex items-center gap-1">
                Threat
                <SortIcon active={sortKey === 'threat'} dir={sortDir} />
              </span>
            </th>
          </tr>
        </thead>
        <tbody>
          {sorted.map((record, i) => (
            <tr
              key={record.ip}
              className={[
                'group border-t border-border transition-colors',
                i % 2 === 0 ? 'bg-background' : 'bg-card/50',
                'hover:bg-accent/5',
              ].join(' ')}
            >
              <td className="px-4 py-3 font-mono text-sm text-text-primary whitespace-nowrap">
                <span className="flex items-center">
                  {record.ip}
                  <CopyButton text={record.ip} />
                </span>
              </td>
              <td className="px-4 py-3 text-sm text-text-primary text-right font-mono">
                {record.emailVolume.toLocaleString()}
              </td>
              <td className="px-4 py-3 text-sm whitespace-nowrap">
                <span className={passRateClass(record.dmarc.passRate)}>
                  {record.dmarc.passRate}
                </span>
                {record.dmarc.fail > 0 && (
                  <span className="ml-2 text-xs text-error">
                    {record.dmarc.fail.toLocaleString()} fail
                  </span>
                )}
              </td>
              <td className="px-4 py-3 text-sm whitespace-nowrap">
                <span className={passRateClass(record.spf.passRate)}>{record.spf.passRate}</span>
                {record.spf.fail > 0 && (
                  <span className="ml-2 text-xs text-error">
                    {record.spf.fail.toLocaleString()} fail
                  </span>
                )}
              </td>
              <td className="px-4 py-3 text-sm whitespace-nowrap">
                <span className={passRateClass(record.dkim.passRate)}>{record.dkim.passRate}</span>
                {record.dkim.fail > 0 && (
                  <span className="ml-2 text-xs text-error">
                    {record.dkim.fail.toLocaleString()} fail
                  </span>
                )}
              </td>
              <td className="px-4 py-3 text-sm text-text-muted max-w-[200px] truncate">
                {record.whois.owner}
              </td>
              <td className="px-4 py-3 text-sm text-text-muted font-mono">
                {record.whois.country}
              </td>
              <td className="px-4 py-3">
                <span
                  className={[
                    'inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium',
                    threatBadgeClass(record.whois.threatLevel),
                  ].join(' ')}
                >
                  {record.whois.threatLevel}
                </span>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}
