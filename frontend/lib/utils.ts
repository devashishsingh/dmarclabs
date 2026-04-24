import type { IPRecord } from './api';

/**
 * Formats bytes into a human-readable size string.
 */
export function formatBytes(bytes: number): string {
  if (bytes < 1024) return `${bytes} B`;
  if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`;
  return `${(bytes / (1024 * 1024)).toFixed(1)} MB`;
}

/**
 * Returns Tailwind color classes for a threat level badge.
 */
export function threatBadgeClass(level: string): string {
  switch (level) {
    case 'TRUSTED':
      return 'bg-success/20 text-success border border-success/30';
    case 'SUSPICIOUS':
      return 'bg-error/20 text-error border border-error/30';
    case 'NEUTRAL':
      return 'bg-accent/20 text-accent border border-accent/30';
    default:
      return 'bg-slate-700 text-slate-400 border border-slate-600';
  }
}

/**
 * Returns Tailwind color classes for a pass rate value.
 */
export function passRateClass(passRate: string): string {
  const value = parseFloat(passRate);
  if (value >= 95) return 'text-success';
  if (value >= 75) return 'text-warning';
  return 'text-error';
}

/**
 * Converts analysis results to a CSV string for download.
 */
export function resultsToCSV(records: IPRecord[]): string {
  const headers = [
    'IP Address',
    'Email Volume',
    'DMARC Pass',
    'DMARC Fail',
    'DMARC Pass Rate',
    'SPF Pass',
    'SPF Fail',
    'SPF Pass Rate',
    'SPF Aligned Rate',
    'DKIM Pass',
    'DKIM Fail',
    'DKIM Pass Rate',
    'DKIM Aligned Rate',
    'WHOIS Owner',
    'ASN',
    'Country',
    'Threat Level',
  ];

  const rows = records.map((r) => [
    r.ip,
    r.emailVolume,
    r.dmarc.pass,
    r.dmarc.fail,
    r.dmarc.passRate,
    r.spf.pass,
    r.spf.fail,
    r.spf.passRate,
    r.spf.alignedRate ?? '',
    r.dkim.pass,
    r.dkim.fail,
    r.dkim.passRate,
    r.dkim.alignedRate ?? '',
    csvEscape(r.whois.owner),
    r.whois.asn,
    r.whois.country,
    r.whois.threatLevel,
  ]);

  return [headers, ...rows].map((row) => row.join(',')).join('\n');
}

function csvEscape(value: string): string {
  if (value.includes(',') || value.includes('"') || value.includes('\n')) {
    return `"${value.replace(/"/g, '""')}"`;
  }
  return value;
}

/**
 * Triggers a CSV file download in the browser.
 */
export function downloadCSV(csvContent: string, filename: string): void {
  const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
  const url = URL.createObjectURL(blob);
  const link = document.createElement('a');
  link.href = url;
  link.download = filename;
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
  URL.revokeObjectURL(url);
}

/**
 * Copies text to clipboard with a graceful fallback.
 */
export async function copyToClipboard(text: string): Promise<boolean> {
  try {
    await navigator.clipboard.writeText(text);
    return true;
  } catch {
    // Fallback for older browsers
    const textarea = document.createElement('textarea');
    textarea.value = text;
    textarea.style.position = 'fixed';
    textarea.style.opacity = '0';
    document.body.appendChild(textarea);
    textarea.focus();
    textarea.select();
    const success = document.execCommand('copy');
    document.body.removeChild(textarea);
    return success;
  }
}

/**
 * Validates that a file is an accepted DMARC report type.
 */
export function validateDMARCFile(file: File): string | null {
  const ext = file.name.slice(file.name.lastIndexOf('.')).toLowerCase();
  if (ext !== '.xml') {
    return `Unsupported file type "${ext}". Please upload a .xml DMARC report.`;
  }
  const maxBytes = parseInt(process.env.NEXT_PUBLIC_MAX_FILE_SIZE_MB || '200', 10) * 1024 * 1024;
  if (file.size > maxBytes) {
    return `FILE_TOO_LARGE`;
  }
  return null;
}
