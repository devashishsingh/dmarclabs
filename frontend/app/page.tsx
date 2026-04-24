'use client';

import { useState, useCallback, useEffect, useRef } from 'react';
import {
  Download,
  Trash2,
  RefreshCw,
  Lock,
  BarChart2,
  Zap,
  ShieldCheck,
  Clock,
  Globe,
  FileSearch,
} from 'lucide-react';
import FileUpload from '@/components/FileUpload';
import ResultsTable from '@/components/ResultsTable';
import RequestAccessForm from '@/components/RequestAccessForm';
import ProgressBar from '@/components/ProgressBar';
import AnalysisTimeline from '@/components/AnalysisTimeline';
import type { AnalysisStep } from '@/components/AnalysisTimeline';
import Feedback from '@/components/Feedback';
import { ToastContainer } from '@/components/Toast';
import { useToast } from '@/lib/useToast';
import { uploadFile, analyzeSession, purgeSession } from '@/lib/api';
import type { AnalyzeResponse } from '@/lib/api';
import { formatBytes, resultsToCSV, downloadCSV } from '@/lib/utils';

type AppState = 'idle' | 'uploading' | 'analyzing' | 'results' | 'error';

const SESSION_TTL_MS = 60 * 60 * 1000; // 1 hour
const WARN_BEFORE_MS = 10 * 60 * 1000; // warn 10 min before expiry

export default function HomePage() {
  const [appState, setAppState] = useState<AppState>('idle');
  const [uploadProgress, setUploadProgress] = useState(0);
  const [statusMessage, setStatusMessage] = useState('');
  const [activeStep, setActiveStep] = useState<AnalysisStep>('upload');
  const [currentFile, setCurrentFile] = useState<File | null>(null);
  const [retryCount, setRetryCount] = useState(0);
  const [sessionId, setSessionId] = useState<string | null>(null);
  const [analysisData, setAnalysisData] = useState<AnalyzeResponse | null>(null);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [showAccessForm, setShowAccessForm] = useState(false);
  const [oversizeFile, setOversizeFile] = useState<File | null>(null);
  const { toasts, dismiss, success: toastSuccess, warning: toastWarning, purge: toastPurge } = useToast();
  const purgeTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const warnTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  // Auto-purge timers: start when analysis completes, clear on manual reset/purge
  const startPurgeTimers = useCallback(() => {
    if (warnTimerRef.current) clearTimeout(warnTimerRef.current);
    if (purgeTimerRef.current) clearTimeout(purgeTimerRef.current);

    warnTimerRef.current = setTimeout(() => {
      toastWarning(
        'Session expiring soon',
        'Your analysis data will be auto-purged in 10 minutes. Download your CSV now if needed.',
        0 // sticky
      );
    }, SESSION_TTL_MS - WARN_BEFORE_MS);

    purgeTimerRef.current = setTimeout(() => {
      toastPurge(
        'Session auto-purged',
        'Your DMARC data has been automatically deleted from our servers.',
        7000
      );
      setSessionId(null);
      setAnalysisData(null);
      setAppState('idle');
    }, SESSION_TTL_MS);
  }, [toastWarning, toastPurge]);

  const clearPurgeTimers = useCallback(() => {
    if (warnTimerRef.current) clearTimeout(warnTimerRef.current);
    if (purgeTimerRef.current) clearTimeout(purgeTimerRef.current);
  }, []);

  useEffect(() => () => clearPurgeTimers(), [clearPurgeTimers]);

  // Listen for logo click reset event from Header
  useEffect(() => {
    const handler = () => handleReset();
    window.addEventListener('dmarc:reset', handler);
    return () => window.removeEventListener('dmarc:reset', handler);
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const handleFileAccepted = useCallback(async (file: File) => {
    setCurrentFile(file);
    setAppState('uploading');
    setUploadProgress(0);
    setErrorMessage(null);
    setStatusMessage(`Memory processing: ${file.name}…`);
    setActiveStep('upload');

    try {
      const upload = await uploadFile(file, (percent) => {
        setUploadProgress(percent);
        setStatusMessage(`Memory processing… ${formatBytes(Math.round((file.size * percent) / 100))} / ${formatBytes(file.size)}`);
      });

      setSessionId(upload.sessionId);
      setAppState('analyzing');
      setActiveStep('parse');
      setStatusMessage('Parsing DMARC XML…');

      // Small delay to let user see the parse step before enrichment kicks in
      await new Promise((r) => setTimeout(r, 400));
      setActiveStep('enrich');

      const result = await analyzeSession(upload.sessionId);

      setActiveStep('build');
      await new Promise((r) => setTimeout(r, 300));

      setAnalysisData(result);
      setAppState('results');
      setStatusMessage('');
      setRetryCount(0);
      toastSuccess('Analysis complete', `Found ${result.summary.totalIPs} sending IPs across ${result.summary.totalEmails.toLocaleString()} emails.`, 6000);
      startPurgeTimers();
    } catch (err: unknown) {
      const axiosErr = err as { response?: { data?: { message?: string }; status?: number }; code?: string; message?: string };
      let message = 'An unexpected error occurred. Please try again.';

      if (axiosErr?.code === 'ECONNABORTED') {
        message = 'Connection was interrupted. Please check your network and try again.';
      } else if (axiosErr?.response?.status === 413) {
        message = 'File is too large for this endpoint. Use the "Request access" link below to get higher limits.';
      } else if (axiosErr?.response?.status === 422) {
        const detail = axiosErr.response?.data?.message ?? '';
        message = detail
          ? `XML syntax error: ${detail}`
          : 'The file could not be parsed. Make sure it is a valid, uncompressed DMARC XML report.';
      } else if (axiosErr?.response?.status === 429) {
        message = 'Too many requests. Please wait a moment and try again.';
      } else if (axiosErr?.response?.data?.message) {
        message = axiosErr.response.data.message;
      } else if (axiosErr?.message) {
        message = axiosErr.message;
      }

      setErrorMessage(message);
      setAppState('error');
      setStatusMessage('');
      setRetryCount((c) => c + 1);
    }
  }, [toastSuccess, startPurgeTimers]);

  const handleFileTooLarge = useCallback((file: File) => {
    setOversizeFile(file);
    setShowAccessForm(true);
  }, []);

  const scrollToUpload = () => {
    setTimeout(() => {
      document.getElementById('upload')?.scrollIntoView({ behavior: 'smooth', block: 'center' });
    }, 50);
  };

  const handlePurge = async () => {
    if (!sessionId) return;
    clearPurgeTimers();
    try {
      await purgeSession(sessionId);
    } catch {
      // Non-critical
    } finally {
      toastPurge('Data purged', 'Your session data has been deleted from our servers.', 5000);
      setSessionId(null);
      setAnalysisData(null);
      setAppState('idle');
      setErrorMessage(null);
      scrollToUpload();
    }
  };

  const handleDownloadCSV = () => {
    if (!analysisData) return;
    const csv = resultsToCSV(analysisData.results);
    const date = new Date().toISOString().split('T')[0];
    downloadCSV(csv, `dmarc-analysis-${date}.csv`);
  };

  const handleReset = () => {
    clearPurgeTimers();
    setSessionId(null);
    setAnalysisData(null);
    setAppState('idle');
    setErrorMessage(null);
    setUploadProgress(0);
    setStatusMessage('');
    scrollToUpload();
  };

  return (
    <div className="flex-1 w-full max-w-layout mx-auto px-6 pt-32 pb-16 space-y-10">
      {/* Announcement bar — idle only */}
      {appState === 'idle' && (
        <div className="flex justify-center md:justify-start">
          <span className="inline-flex items-center gap-2 border border-accent/25 bg-accent/5 rounded-full px-4 py-1.5 text-[12px] text-text-secondary font-medium backdrop-blur-sm">
            <span className="h-1.5 w-1.5 rounded-full bg-accent animate-pulse flex-shrink-0" aria-hidden="true" />
            Free &bull; No signup &bull; Your data is never stored
          </span>
        </div>
      )}

      {/* Hero */}
      {appState === 'idle' && (
        <div className="space-y-4">
          <h1 className="text-5xl md:text-6xl font-semibold text-text-primary tracking-tight leading-[1.1] font-display">
            Stop Guessing Who&apos;s Sending<br className="hidden md:block" /> From Your{' '}
            <span className="text-accent">Domain.</span>
          </h1>
          <p className="text-text-muted text-lg max-w-xl leading-relaxed">
            Stop drowning in XML reports and WHOIS lookups.
            DMARC Labs gives you verified sender intelligence in seconds — no signup, no credit card.
          </p>
          <div className="flex flex-wrap gap-3 pt-1">
            <div className="flex items-center gap-2 text-[13px] font-mono text-text-secondary border border-white/10 rounded-full px-4 py-1.5 bg-white/[0.03]">
              <span className="font-bold text-accent">&lt;5s</span> average analysis time
            </div>
            <div className="flex items-center gap-2 text-[13px] font-mono text-text-secondary border border-white/10 rounded-full px-4 py-1.5 bg-white/[0.03]">
              <span className="font-bold text-text-primary">100%</span> private
            </div>
            <div className="flex items-center gap-2 text-[13px] font-mono text-text-secondary border border-white/10 rounded-full px-4 py-1.5 bg-white/[0.03]">
              <span className="font-bold text-text-primary">Forever</span> free up to 200 MB
            </div>
          </div>
        </div>
      )}

      {/* Feature pills — shown only on idle */}
      {appState === 'idle' && (
        <div className="flex flex-wrap gap-3">
          {[
            { icon: Lock, text: 'Data deleted after analysis' },
            { icon: BarChart2, text: 'Export results as CSV' },
            { icon: Zap, text: 'Typical: <5s for 50 MB' },
          ].map(({ icon: Icon, text }) => (
            <span
              key={text}
              className="flex items-center gap-2.5 text-xs text-text-muted border border-white/10 rounded-full px-4 py-2 bg-white/[0.02] backdrop-blur-sm"
            >
              <Icon className="h-3.5 w-3.5 text-accent" aria-hidden="true" />
              {text}
            </span>
          ))}
        </div>
      )}

      {/* Demo preview — shown only on idle */}
      {appState === 'idle' && (
        <div className="rounded-2xl border border-white/10 bg-card overflow-hidden shadow-2xl">
          <div className="flex items-center justify-between px-4 py-2.5 border-b border-white/5 bg-white/[0.02]">
            <span className="text-[11px] font-semibold uppercase tracking-widest text-text-muted">Live demo</span>
            <span className="inline-flex items-center gap-1.5 text-[11px] text-text-muted">
              <span className="h-1.5 w-1.5 rounded-full bg-accent animate-pulse" aria-hidden="true" />
              Upload → Analyze → Results
            </span>
          </div>
          <div className="relative">
            {/* Red glow behind the GIF */}
            <div className="absolute inset-0 bg-gradient-to-b from-accent/5 to-transparent pointer-events-none z-10" aria-hidden="true" />
            <img
              src="/demo.gif"
              alt="DMARC Labs demo: drag and drop an XML report, watch it parse and enrich each IP with WHOIS data, then explore the results table"
              className="w-full h-auto block"
              loading="lazy"
              decoding="async"
            />
          </div>
        </div>
      )}

      {/* Upload zone */}
      {(appState === 'idle' || appState === 'error') && (
        <div id="upload" className="rounded-2xl border border-white/10 bg-card shadow-2xl overflow-hidden">
          <div className="p-2">
            <FileUpload
              onFileAccepted={handleFileAccepted}
              onFileTooLarge={handleFileTooLarge}
              disabled={false}
            />
          </div>

          {appState === 'error' && errorMessage && (
            <div className="mx-4 mb-4 space-y-3">
              <div
                role="alert"
                className="rounded-lg bg-error/10 border border-error/30 px-4 py-3 text-error text-sm"
              >
                <p className="font-semibold mb-0.5">Analysis failed</p>
                <p className="text-xs opacity-90">{errorMessage}</p>
              </div>
              {currentFile && (
                <button
                  onClick={() => handleFileAccepted(currentFile)}
                  className="w-full flex items-center justify-center gap-2 px-4 py-2.5 rounded-xl bg-accent/10 border border-accent/20 text-accent text-sm font-medium hover:bg-accent/20 transition-colors"
                >
                  <RefreshCw className="h-4 w-4" aria-hidden="true" />
                  Retry with same file {retryCount > 0 ? `(attempt ${retryCount + 1})` : ''}
                </button>
              )}
            </div>
          )}

          <div className="text-center pb-4">
            <button
              onClick={() => setShowAccessForm(true)}
              className="text-xs text-text-muted hover:text-accent transition-colors underline underline-offset-4 decoration-white/10 hover:decoration-accent/50"
            >
              Need to analyze files &gt;200 MB? Request access
            </button>
          </div>
        </div>
      )}

      {/* Upload progress */}
      {appState === 'uploading' && (
        <div className="rounded-2xl border border-white/10 bg-card p-6 sm:p-8 shadow-2xl">
          <h2 className="text-sm font-semibold font-display text-text-primary mb-5">Analysis in progress</h2>
          <AnalysisTimeline
            activeStep="upload"
            uploadPercent={uploadProgress}
            fileSizeBytes={currentFile?.size ?? 0}
            uploadLabel={statusMessage || 'Uploading report…'}
          />
        </div>
      )}

      {/* Analysis in progress */}
      {appState === 'analyzing' && (
        <div className="rounded-2xl border border-white/10 bg-card p-6 sm:p-8 shadow-2xl">
          <h2 className="text-sm font-semibold font-display text-text-primary mb-5">Analysis in progress</h2>
          <AnalysisTimeline
            activeStep={activeStep}
            uploadPercent={100}
            fileSizeBytes={currentFile?.size ?? 0}
          />
        </div>
      )}

      {/* Results */}
      {appState === 'results' && analysisData && (
        <div className="space-y-6">
          {/* Top action bar */}
          <div className="flex flex-wrap items-center gap-3">
            <button
              onClick={handleDownloadCSV}
              className="flex items-center gap-2 px-4 py-2 rounded-md bg-accent text-white text-sm font-medium hover:bg-accent-hover transition-colors min-h-[40px]"
              aria-label="Download results as CSV"
            >
              <Download className="h-4 w-4" aria-hidden="true" />
              Download CSV
            </button>
            <button
              onClick={handleReset}
              className="flex items-center gap-2 px-4 py-2 rounded-md border border-border text-text-muted hover:text-text-primary hover:border-accent/50 text-sm transition-colors min-h-[40px]"
              aria-label="Analyze a new file"
            >
              <RefreshCw className="h-4 w-4" aria-hidden="true" />
              New File
            </button>
            <button
              onClick={handlePurge}
              className="flex items-center gap-2 px-4 py-2 rounded-md border border-error/40 text-error text-sm hover:bg-error/10 transition-colors min-h-[40px]"
              aria-label="Purge session data"
            >
              <Trash2 className="h-4 w-4" aria-hidden="true" />
              Purge Data
            </button>
            <p className="text-xs text-text-muted ml-auto">
              Session expires{' '}
              {analysisData.expiresAt
                ? new Date(analysisData.expiresAt).toLocaleTimeString()
                : 'in 1 hour'}
            </p>
          </div>

          {/* Summary cards */}
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
            <SummaryCard label="Total Emails" value={analysisData.summary.totalEmails.toLocaleString()} />
            <SummaryCard label="DMARC Pass Rate" value={analysisData.summary.dmarcPassRate} highlight />
            <SummaryCard label="Unique IPs" value={String(analysisData.summary.totalIPs)} />
            <SummaryCard label="Processing Time" value={analysisData.summary.processingTime} />
          </div>

          {/* Results table */}
          <ResultsTable records={analysisData.results} />

          {/* Action bar */}
          <div className="flex flex-wrap items-center gap-3 pt-2">
            <button
              onClick={handlePurge}
              className="flex items-center gap-2 px-4 py-2 rounded-md border border-error/50 text-error text-sm hover:bg-error/10 transition-colors min-h-[44px]"
              aria-label="Purge session data"
            >
              <Trash2 className="h-4 w-4" aria-hidden="true" />
              Purge Data
            </button>

            <button
              onClick={handleDownloadCSV}
              className="flex items-center gap-2 px-4 py-2 rounded-md bg-accent text-white text-sm font-medium hover:bg-accent-hover transition-colors min-h-[44px]"
              aria-label="Download results as CSV"
            >
              <Download className="h-4 w-4" aria-hidden="true" />
              Download CSV
            </button>

            <button
              onClick={handleReset}
              className="flex items-center gap-2 px-4 py-2 rounded-md border border-border text-text-muted hover:text-text-primary hover:border-accent/50 text-sm transition-colors min-h-[44px]"
              aria-label="Analyze a new file"
            >
              <RefreshCw className="h-4 w-4" aria-hidden="true" />
              New File
            </button>

            <p className="text-xs text-text-muted ml-auto">
              Session expires{' '}
              {analysisData.expiresAt
                ? new Date(analysisData.expiresAt).toLocaleTimeString()
                : 'in 1 hour'}
            </p>
          </div>

          {/* Feedback — always shown after results */}
          <div className="rounded-xl border border-border bg-card p-6">
            <Feedback sessionId={analysisData.sessionId} />
          </div>
        </div>
      )}

      {/* Request Access Modal */}
      {showAccessForm && (
        <RequestAccessForm
          initialFileSizeMB={oversizeFile?.size}
          onClose={() => {
            setShowAccessForm(false);
            setOversizeFile(null);
          }}
        />
      )}

      {/* How it works — shown only on idle */}
      {appState === 'idle' && <ProblemSection />}
      {appState === 'idle' && <HowItWorks />}

      {/* Toast notifications */}
      <ToastContainer toasts={toasts} onDismiss={dismiss} />
    </div>
  );
}

function SummaryCard({ label, value, highlight }: { label: string; value: string; highlight?: boolean }) {
  return (
    <div className={['rounded-xl border bg-card p-4 space-y-1', highlight ? 'border-accent/30' : 'border-white/10'].join(' ')}>
      <p className="text-xs text-text-muted">{label}</p>
      <p className={['text-2xl font-bold font-mono tracking-tight', highlight ? 'text-accent' : 'text-text-primary'].join(' ')}>
        {value}
      </p>
    </div>
  );
}

const HOW_IT_WORKS = [
  {
    step: '01',
    icon: FileSearch,
    title: 'Upload your report',
    body: 'Drag and drop any DMARC aggregate (rua) XML report — or a .gz / .zip archive. Files up to 200 MB are supported, processed client-side before upload.',
  },
  {
    step: '02',
    icon: Globe,
    title: 'Instant IP enrichment',
    body: 'Every sending IP is looked up for organisation name, country, ASN, and threat classification via real-time WHOIS/GeoIP enrichment.',
  },
  {
    step: '03',
    icon: ShieldCheck,
    title: 'Review & export',
    body: 'See per-IP DMARC pass rate, SPF and DKIM alignment, volume, and risk. Export everything as CSV. Your data is auto-purged after 1 hour.',
  },
];

function HowItWorks() {
  return (
    <section className="space-y-8 pt-4 border-t border-white/5" aria-labelledby="how-it-works-heading">
      <div className="space-y-1">
        <h2 id="how-it-works-heading" className="text-2xl font-semibold font-display text-text-primary tracking-tight">
          How it works
        </h2>
        <p className="text-text-muted text-sm max-w-lg">
          No account needed. No data stored. Just actionable DMARC intelligence in seconds.
        </p>
      </div>

      <div className="grid sm:grid-cols-3 gap-4">
        {HOW_IT_WORKS.map(({ step, icon: Icon, title, body }) => (
          <div
            key={step}
            className="rounded-2xl border border-white/10 bg-card p-6 space-y-4 hover:border-accent/20 transition-colors group"
          >
            <div className="flex items-start justify-between">
              <div className="w-10 h-10 rounded-full bg-accent/10 flex items-center justify-center text-accent group-hover:bg-accent/20 transition-colors">
                <Icon className="h-5 w-5" aria-hidden="true" />
              </div>
              <span className="font-mono text-[11px] text-text-muted border border-white/5 rounded-full px-2 py-0.5">{step}</span>
            </div>
            <div className="space-y-1.5">
              <h3 className="font-semibold font-display text-text-primary text-base">{title}</h3>
              <p className="text-text-muted text-sm leading-relaxed">{body}</p>
            </div>
          </div>
        ))}
      </div>

      {/* Trust signals */}
      <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-3">
        {[
          { icon: Lock, label: 'Zero persistence', desc: 'Files are never written to disk' },
          { icon: ShieldCheck, label: 'GDPR compliant', desc: 'In-memory only, no cookies' },
          { icon: Clock, label: 'Auto-purge', desc: 'Sessions deleted after 30 min' },
          { icon: Zap, label: 'Sub-5s analysis', desc: 'Parallel WHOIS enrichment' },
        ].map(({ icon: Icon, label, desc }) => (
          <div key={label} className="flex items-start gap-3 rounded-xl border border-white/5 bg-white/[0.02] px-4 py-3">
            <Icon className="h-4 w-4 text-accent mt-0.5 flex-shrink-0" aria-hidden="true" />
            <div>
              <p className="text-xs font-semibold text-text-primary">{label}</p>
              <p className="text-[11px] text-text-muted mt-0.5">{desc}</p>
            </div>
          </div>
        ))}
      </div>
    </section>
  );
}

function ProblemSection() {
  const problems = [
    {
      title: 'XML reports are unreadable',
      body: 'DMARC aggregate reports are raw XML files. Opening one reveals hundreds of nested records, IP addresses, and authentication codes — not a human-readable format.',
    },
    {
      title: 'You have no idea who is sending email as you',
      body: 'Unknown IPs in your DMARC report could be legitimate services you forgot about, phishing actors, or spoofing attempts. Without WHOIS data, you can\'t tell.',
    },
    {
      title: 'Existing tools cost money or require a login',
      body: 'Most DMARC analysers are enterprise products. Even "free" tiers require an account, collect your data, or cap your report size.',
    },
    {
      title: 'Your email provider charges for detailed analytics',
      body: 'Detailed sender reputation and delivery analysis is often locked behind paid tiers — even though you already own the reports.',
    },
    {
      title: 'A misconfigured DMARC policy goes unnoticed for months',
      body: 'Without checking your reports regularly, a broken SPF record or rogue sending source can silently fail authentication — eroding your domain reputation.',
    },
  ];

  return (
    <section className="space-y-8">
      <div className="space-y-2">
        <p className="text-[11px] font-mono uppercase tracking-widest text-accent font-semibold">The Problem</p>
        <h2 className="text-3xl md:text-4xl font-semibold text-text-primary font-display tracking-tight leading-[1.15]">
          Your domain is being impersonated.<br className="hidden md:block" />{' '}
          <span className="text-text-secondary">Right now. Probably.</span>
        </h2>
        <p className="text-text-muted max-w-2xl text-base leading-relaxed">
          DMARC reports contain everything you need to know. But nobody reads them because nobody
          built a tool that makes it easy — until now.
        </p>
      </div>
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {problems.map(({ title, body }, i) => (
          <div
            key={title}
            className="rounded-2xl border border-white/8 bg-card p-5 space-y-2 hover:border-accent/20 transition-colors"
          >
            <div className="flex items-center gap-2.5">
              <span className="text-[11px] font-mono text-accent/60">0{i + 1}</span>
              <h3 className="text-sm font-semibold text-text-primary font-display">{title}</h3>
            </div>
            <p className="text-xs text-text-muted leading-relaxed">{body}</p>
          </div>
        ))}
        {/* Sixth card — CTA */}
        <div className="rounded-2xl border border-accent/20 bg-accent/5 p-5 space-y-3 flex flex-col justify-between">
          <div className="space-y-1.5">
            <span className="text-[11px] font-mono text-accent/60">06</span>
            <h3 className="text-sm font-semibold text-text-primary font-display">DMARC Labs solves all of this</h3>
            <p className="text-xs text-text-muted leading-relaxed">
              Drag in your report. Get instant, human-readable results with WHOIS-enriched senders — free, private, no account needed.
            </p>
          </div>
          <a
            href="#upload"
            className="inline-flex items-center gap-1.5 text-[12px] font-semibold text-accent hover:text-white transition-colors"
          >
            Upload your report <span aria-hidden="true">↑</span>
          </a>
        </div>
      </div>
    </section>
  );
}
