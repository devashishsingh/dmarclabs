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
  ArrowLeft,
} from 'lucide-react';
import FileUpload from '@/components/FileUpload';
import ResultsTable from '@/components/ResultsTable';
import RequestAccessForm from '@/components/RequestAccessForm';
import ProgressBar from '@/components/ProgressBar';
import AnalysisTimeline from '@/components/AnalysisTimeline';
import type { AnalysisStep } from '@/components/AnalysisTimeline';
import Feedback from '@/components/Feedback';
import Dashboard from '@/components/Dashboard';
import DashboardPrompt from '@/components/DashboardPrompt';
import { ToastContainer } from '@/components/Toast';
import { useToast } from '@/lib/useToast';
import { useHeaderVisibility } from '@/lib/headerVisibility';
import { uploadFile, analyzeSession, purgeSession } from '@/lib/api';
import type { AnalyzeResponse } from '@/lib/api';
import { formatBytes, resultsToCSV, downloadCSV } from '@/lib/utils';

type AppState = 'idle' | 'uploading' | 'analyzing' | 'results' | 'error';

const SESSION_TTL_MS = 30 * 60 * 1000; // 30 minutes
const WARN_BEFORE_MS = 5 * 60 * 1000;  // warn 5 min before expiry

function formatCountdown(ms: number): string {
  const total = Math.max(0, Math.floor(ms / 1000));
  const m = Math.floor(total / 60).toString().padStart(2, '0');
  const s = (total % 60).toString().padStart(2, '0');
  return `${m}:${s}`;
}

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
  const [showDashboard, setShowDashboard] = useState(false);
  const [showDashboardPrompt, setShowDashboardPrompt] = useState(false);
  const [isClearing, setIsClearing] = useState(false);
  const [sessionExpiresAt, setSessionExpiresAt] = useState<number | null>(null);
  const [countdown, setCountdown] = useState<number | null>(null);
  const { toasts, dismiss, success: toastSuccess, warning: toastWarning, purge: toastPurge } = useToast();
  const { hideHeader, showHeader } = useHeaderVisibility();
  const purgeTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const warnTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  // Auto-purge timers: start when analysis completes, clear on manual reset/purge
  const startPurgeTimers = useCallback(() => {
    if (warnTimerRef.current) clearTimeout(warnTimerRef.current);
    if (purgeTimerRef.current) clearTimeout(purgeTimerRef.current);

    const expiresAt = Date.now() + SESSION_TTL_MS;
    setSessionExpiresAt(expiresAt);
    setCountdown(SESSION_TTL_MS);

    warnTimerRef.current = setTimeout(() => {
      toastWarning(
        'Session expiring soon',
        'Your analysis data will be auto-purged in 5 minutes. Download your CSV now if needed.',
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
      setSessionExpiresAt(null);
      setCountdown(null);
      setAppState('idle');
      showHeader();
    }, SESSION_TTL_MS);
  }, [toastWarning, toastPurge, showHeader]);

  const clearPurgeTimers = useCallback(() => {
    if (warnTimerRef.current) clearTimeout(warnTimerRef.current);
    if (purgeTimerRef.current) clearTimeout(purgeTimerRef.current);
    setSessionExpiresAt(null);
    setCountdown(null);
  }, []);

  useEffect(() => () => clearPurgeTimers(), [clearPurgeTimers]);

  // Live countdown ticker
  useEffect(() => {
    if (sessionExpiresAt === null) return;
    const tick = setInterval(() => {
      const remaining = sessionExpiresAt - Date.now();
      setCountdown(remaining > 0 ? remaining : 0);
    }, 1000);
    return () => clearInterval(tick);
  }, [sessionExpiresAt]);

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
      hideHeader();
      setStatusMessage('');
      setRetryCount(0);
      toastSuccess('Analysis complete', `Found ${result.summary.totalIPs} sending IPs across ${result.summary.totalEmails.toLocaleString()} emails.`, 6000);
      startPurgeTimers();
      // Show dashboard prompt after a short delay
      setTimeout(() => setShowDashboardPrompt(true), 2200);
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
    if (!sessionId || isClearing) return;
    setIsClearing(true);
    clearPurgeTimers();
    try {
      await purgeSession(sessionId);
    } catch {
      // Non-critical
    } finally {
      toastPurge('Session cleared', 'Your data has been deleted from our servers.', 5000);
      setSessionId(null);
      setAnalysisData(null);
      setSessionExpiresAt(null);
      setCountdown(null);
      setAppState('idle');
      setErrorMessage(null);
      setIsClearing(false);
      showHeader();
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
    setSessionExpiresAt(null);
    setCountdown(null);
    setAppState('idle');
    setErrorMessage(null);
    setUploadProgress(0);
    setStatusMessage('');
    setShowDashboard(false);
    setShowDashboardPrompt(false);
    showHeader();
    scrollToUpload();
  };

  return (
    <div className="flex-1 w-full max-w-layout mx-auto px-4 sm:px-6 pt-24 sm:pt-32 pb-16 space-y-8 sm:space-y-10">
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
          <h1 className="text-4xl sm:text-5xl md:text-6xl font-semibold text-text-primary tracking-tight leading-[1.1] font-display">
            Parse &amp; analyze your DMARC RUA reports{' '}
            <span className="text-accent">bulk upload, no account, instant download.</span>
          </h1>
          <p className="text-text-muted text-base sm:text-lg max-w-xl leading-relaxed">
            Stop drowning in XML reports and WHOIS lookups.
            DMARC Labs gives you verified sender intelligence in seconds — no signup, no credit card.
          </p>
          <p className="text-text-secondary text-sm sm:text-base max-w-xl leading-relaxed italic">
            DMARC is a one-time setup. Stop paying monthly for something you check twice a year.
          </p>
          <div className="flex flex-wrap items-center gap-4 pt-2">
            <a
              href="#upload"
              className="inline-flex items-center justify-center gap-2 px-6 py-3 rounded-lg bg-accent text-white text-base font-semibold hover:bg-accent-hover transition-colors min-h-[48px] shadow-lg shadow-accent/20"
            >
              Start analyzing — it&apos;s free
            </a>
            <span className="font-mono text-[12px] text-text-muted tracking-tight">
              1,600+ reports analyzed
            </span>
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
              Need to analyze files &gt;100 MB? Request access
            </button>
          </div>

          {/* Reassurance badges directly below the upload zone */}
          <div className="flex flex-wrap justify-center gap-2 px-4 pb-4">
            <span className="inline-flex items-center gap-1.5 rounded-full px-3 py-1 text-[11px] font-medium border border-success/30 bg-success/10 text-success">
              <span className="h-1.5 w-1.5 rounded-full bg-success" aria-hidden="true" />
              No login required
            </span>
            <span className="inline-flex items-center gap-1.5 rounded-full px-3 py-1 text-[11px] font-medium border border-sky-400/30 bg-sky-400/10 text-sky-300">
              <span className="h-1.5 w-1.5 rounded-full bg-sky-400" aria-hidden="true" />
              Files never stored
            </span>
            <span className="inline-flex items-center gap-1.5 rounded-full px-3 py-1 text-[11px] font-medium border border-warning/30 bg-warning/10 text-warning">
              <span className="h-1.5 w-1.5 rounded-full bg-warning" aria-hidden="true" />
              Up to 100MB supported
            </span>
            <span className="inline-flex items-center gap-1.5 rounded-full px-3 py-1 text-[11px] font-medium border border-white/15 bg-white/5 text-text-secondary">
              <span className="h-1.5 w-1.5 rounded-full bg-text-muted" aria-hidden="true" />
              .gz and .zip accepted
            </span>
          </div>
        </div>
      )}

      {/* How It Works — shown only on idle, below upload */}
      {appState === 'idle' && <HowItWorks />}

      {/* What you'll get — sample report preview */}
      {appState === 'idle' && <WhatYoullGet />}

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
          {/* Back to analyzer */}
          <div className="flex">
            <a
              href="/#upload"
              onClick={(e) => {
                e.preventDefault();
                handleReset();
                if (typeof window !== 'undefined') {
                  window.location.hash = 'upload';
                }
              }}
              className="inline-flex items-center gap-2 px-3 py-2 rounded-md border border-white/10 bg-white/[0.02] text-sm text-text-muted hover:text-text-primary hover:border-white/20 transition-colors min-h-[40px]"
              aria-label="Analyze another report"
            >
              <ArrowLeft className="h-4 w-4" aria-hidden="true" />
              Analyze another report
            </a>
          </div>

          {/* Top action bar — Dashboard only */}
          {(() => {
            const isWarning = countdown !== null && countdown <= WARN_BEFORE_MS;
            const timerLabel = countdown !== null ? formatCountdown(countdown) : null;
            return (
              <div className="flex flex-wrap items-center gap-3">
                <button
                  onClick={() => setShowDashboard(true)}
                  className="flex items-center gap-2 px-4 py-2 rounded-md bg-accent text-white text-sm font-medium hover:bg-red-500 transition-colors min-h-[40px]"
                  aria-label="Open dashboard view"
                >
                  <BarChart2 className="h-4 w-4" aria-hidden="true" />
                  Dashboard
                </button>
                {timerLabel && (
                  <div className="ml-auto flex items-center gap-1.5">
                    <Clock className="h-3.5 w-3.5 flex-shrink-0" style={{ color: isWarning ? '#ef233c' : '#6b7280' }} aria-hidden="true" />
                    <span
                      className={[
                        'font-mono text-xs font-semibold tabular-nums',
                        isWarning ? 'text-[#ef233c] animate-pulse' : 'text-text-muted',
                      ].join(' ')}
                      title="Session auto-expires"
                    >
                      {timerLabel}
                    </span>
                    {isWarning && (
                      <span className="text-[10px] text-[#ef233c]/80 font-medium">· expires soon</span>
                    )}
                  </div>
                )}
              </div>
            );
          })()}

          {/* Summary cards */}
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
            <SummaryCard label="Total Emails" value={analysisData.summary.totalEmails.toLocaleString()} />
            <SummaryCard label="DMARC Pass Rate" value={analysisData.summary.dmarcPassRate} highlight />
            <SummaryCard label="Unique IPs" value={String(analysisData.summary.totalIPs)} />
            <SummaryCard label="Processing Time" value={analysisData.summary.processingTime} />
          </div>

          {/* Results table */}
          <ResultsTable records={analysisData.results} />

          {/* Bottom action bar */}
          <div className="flex flex-wrap items-center gap-3 pt-2">
            <button
              onClick={handlePurge}
              disabled={isClearing}
              className="flex items-center gap-2 px-4 py-2 rounded-md border border-error/50 text-error text-sm hover:bg-error/10 transition-colors min-h-[44px] disabled:opacity-60 disabled:cursor-not-allowed"
              aria-label="Clear session data"
            >
              {isClearing ? (
                <>
                  <svg className="h-4 w-4 animate-spin" viewBox="0 0 24 24" fill="none" aria-hidden="true">
                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8v4a4 4 0 00-4 4H4z" />
                  </svg>
                  Clearing...
                </>
              ) : (
                <>
                  <Trash2 className="h-4 w-4" aria-hidden="true" />
                  Clear Session
                </>
              )}
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

          {/* Subtle support line — appears on every generated report */}
          <p className="text-center text-xs text-text-muted pt-2">
            Found this useful?{' '}
            <a
              href="https://ko-fi.com/dmarclabs"
              target="_blank"
              rel="noopener noreferrer"
              className="text-accent hover:text-accent-hover underline underline-offset-4 decoration-dotted transition-colors"
            >
              <svg viewBox="0 0 24 24" fill="currentColor" aria-hidden="true" className="inline h-3.5 w-3.5 mr-1 -mt-0.5"><path d="M2 21h18v-2H2v2zM20 8h-2V5H4v9c0 2.21 1.79 4 4 4h6c2.21 0 4-1.79 4-4v-3h2c1.11 0 2-.89 2-2V10c0-1.11-.89-2-2-2zm0 3h-2v-1h2v1z" /></svg>
              Buy me a coffee
            </a>
          </p>
        </div>
      )}

      {/* Dashboard full-screen overlay */}
      {showDashboard && analysisData && (
        <Dashboard records={analysisData.results} onClose={() => setShowDashboard(false)} />
      )}

      {/* Dashboard prompt after results */}
      {showDashboardPrompt && !showDashboard && (
        <DashboardPrompt
          onAccept={() => { setShowDashboardPrompt(false); setShowDashboard(true); }}
          onDismiss={() => setShowDashboardPrompt(false)}
        />
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
    body: 'Drag and drop any DMARC aggregate (rua) XML report — or a .gz / .zip archive. Files up to 100 MB are supported, processed client-side before upload.',
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
    <section className="space-y-6 pt-4 border-t border-white/5" aria-labelledby="how-it-works-heading">
      {/* Heading */}
      <div className="space-y-1">
        <h2 id="how-it-works-heading" className="text-xl sm:text-2xl font-semibold font-display text-text-primary tracking-tight">
          How it works
        </h2>
        <p className="text-text-muted text-sm max-w-xl leading-relaxed">
          Upload your DMARC XML report and get instant, human-readable sender intelligence — no account, no data stored, zero cost.
        </p>
      </div>

      {/* 3-step cards */}
      <div className="grid sm:grid-cols-3 gap-3 sm:gap-4">
        {HOW_IT_WORKS.map(({ step, icon: Icon, title, body }) => (
          <div
            key={step}
            className="rounded-2xl border border-white/10 bg-card p-5 sm:p-6 space-y-4 hover:border-accent/20 transition-colors group"
          >
            <div className="flex items-start justify-between">
              <div className="w-9 h-9 sm:w-10 sm:h-10 rounded-full bg-accent/10 flex items-center justify-center text-accent group-hover:bg-accent/20 transition-colors">
                <Icon className="h-4 w-4 sm:h-5 sm:w-5" aria-hidden="true" />
              </div>
              <span className="font-mono text-[11px] text-text-muted border border-white/5 rounded-full px-2 py-0.5">{step}</span>
            </div>
            <div className="space-y-1.5">
              <h3 className="font-semibold font-display text-text-primary text-sm sm:text-base">{title}</h3>
              <p className="text-text-muted text-xs sm:text-sm leading-relaxed">{body}</p>
            </div>
          </div>
        ))}
      </div>

      {/* Trust signals */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-2 sm:gap-3">
        {[
          { icon: Lock, label: 'Zero persistence', desc: 'Files are never written to disk' },
          { icon: ShieldCheck, label: 'GDPR compliant', desc: 'In-memory only, no cookies' },
          { icon: Clock, label: 'Auto-purge', desc: 'Sessions deleted after 1 hour' },
          { icon: Zap, label: 'Sub-5s analysis', desc: 'Parallel WHOIS enrichment' },
        ].map(({ icon: Icon, label, desc }) => (
          <div key={label} className="flex items-start gap-2.5 sm:gap-3 rounded-xl border border-white/5 bg-white/[0.02] px-3 sm:px-4 py-3">
            <Icon className="h-4 w-4 text-accent mt-0.5 flex-shrink-0" aria-hidden="true" />
            <div>
              <p className="text-xs font-semibold text-text-primary">{label}</p>
              <p className="text-[11px] text-text-muted mt-0.5 leading-relaxed">{desc}</p>
            </div>
          </div>
        ))}
      </div>
    </section>
  );
}

const SAMPLE_ROWS: Array<{
  ip: string;
  org: string;
  country: string;
  volume: string;
  spf: 'pass' | 'fail';
  dkim: 'pass' | 'fail';
  dmarc: 'pass' | 'fail';
}> = [
  { ip: '209.85.220.41',  org: 'Google LLC',          country: 'US', volume: '12,840', spf: 'pass', dkim: 'pass', dmarc: 'pass' },
  { ip: '40.107.92.84',   org: 'Microsoft Corporation', country: 'US', volume: '4,217',  spf: 'pass', dkim: 'pass', dmarc: 'pass' },
  { ip: '198.61.254.18',  org: 'SendGrid, Inc.',      country: 'US', volume: '1,956',  spf: 'pass', dkim: 'fail', dmarc: 'pass' },
  { ip: '185.176.27.214', org: 'Unknown',              country: 'RU', volume: '47',     spf: 'fail', dkim: 'fail', dmarc: 'fail' },
  { ip: '52.96.182.211',  org: 'Mailchimp',            country: 'US', volume: '923',    spf: 'pass', dkim: 'pass', dmarc: 'pass' },
];

function ResultPill({ status }: { status: 'pass' | 'fail' }) {
  const isPass = status === 'pass';
  return (
    <span
      className={[
        'inline-flex items-center gap-1 rounded-full px-2 py-0.5 text-[10px] font-mono font-semibold uppercase tracking-wide',
        isPass
          ? 'bg-success/10 text-success border border-success/30'
          : 'bg-error/10 text-error border border-error/30',
      ].join(' ')}
    >
      <span className={['h-1 w-1 rounded-full', isPass ? 'bg-success' : 'bg-error'].join(' ')} aria-hidden="true" />
      {status}
    </span>
  );
}

function WhatYoullGet() {
  return (
    <section className="space-y-6 pt-4 border-t border-white/5" aria-labelledby="what-youll-get-heading">
      <div className="space-y-1">
        <h2 id="what-youll-get-heading" className="text-xl sm:text-2xl font-semibold font-display text-text-primary tracking-tight">
          What you&apos;ll get
        </h2>
        <p className="text-text-muted text-sm max-w-xl leading-relaxed">
          Full per-IP breakdown with SPF, DKIM, and DMARC results.
        </p>
      </div>

      <div className="relative rounded-2xl border border-white/10 bg-card overflow-hidden shadow-2xl">
        {/* Sample report preview */}
        <div aria-hidden="true" className="select-none">
          <div className="border-b border-white/10 px-4 sm:px-6 py-4 flex flex-wrap items-center gap-3">
            <span className="text-xs font-mono text-text-muted">SAMPLE REPORT &middot; example.com</span>
            <span className="ml-auto inline-flex items-center gap-1.5 rounded-full px-2.5 py-1 text-[11px] font-medium border border-success/30 bg-success/10 text-success">
              <span className="h-1.5 w-1.5 rounded-full bg-success" />
              94.2% DMARC pass rate
            </span>
          </div>

          <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 sm:gap-4 px-4 sm:px-6 py-4 border-b border-white/10">
            {[
              { label: 'Total Emails', value: '19,983' },
              { label: 'DMARC Pass Rate', value: '94.2%', highlight: true },
              { label: 'Unique IPs', value: '47' },
              { label: 'Processing Time', value: '3.1s' },
            ].map((c) => (
              <div key={c.label} className={['rounded-xl border bg-card p-3 space-y-1', c.highlight ? 'border-accent/30' : 'border-white/10'].join(' ')}>
                <p className="text-[11px] text-text-muted">{c.label}</p>
                <p className={['text-lg sm:text-xl font-bold font-mono tracking-tight', c.highlight ? 'text-accent' : 'text-text-primary'].join(' ')}>
                  {c.value}
                </p>
              </div>
            ))}
          </div>

          <div className="overflow-x-auto">
            <table className="w-full text-xs sm:text-sm">
              <thead>
                <tr className="text-left text-text-muted border-b border-white/10 bg-white/[0.02]">
                  <th className="px-4 sm:px-6 py-2.5 font-medium">Source IP</th>
                  <th className="px-4 py-2.5 font-medium">Organisation</th>
                  <th className="px-4 py-2.5 font-medium">Country</th>
                  <th className="px-4 py-2.5 font-medium text-right">Volume</th>
                  <th className="px-4 py-2.5 font-medium">SPF</th>
                  <th className="px-4 py-2.5 font-medium">DKIM</th>
                  <th className="px-4 sm:px-6 py-2.5 font-medium">DMARC</th>
                </tr>
              </thead>
              <tbody>
                {SAMPLE_ROWS.map((r) => (
                  <tr key={r.ip} className="border-b border-white/5 last:border-b-0">
                    <td className="px-4 sm:px-6 py-2.5 font-mono text-text-primary">{r.ip}</td>
                    <td className="px-4 py-2.5 text-text-secondary">{r.org}</td>
                    <td className="px-4 py-2.5 font-mono text-text-muted">{r.country}</td>
                    <td className="px-4 py-2.5 font-mono text-right text-text-primary">{r.volume}</td>
                    <td className="px-4 py-2.5"><ResultPill status={r.spf} /></td>
                    <td className="px-4 py-2.5"><ResultPill status={r.dkim} /></td>
                    <td className="px-4 sm:px-6 py-2.5"><ResultPill status={r.dmarc} /></td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>

        {/* Dim overlay */}
        <div className="pointer-events-none absolute inset-0 bg-gradient-to-b from-transparent via-black/30 to-black/70" aria-hidden="true" />
        <div className="pointer-events-none absolute inset-0 backdrop-blur-[1.5px]" aria-hidden="true" />

        {/* Caption pinned at bottom */}
        <div className="absolute inset-x-0 bottom-0 px-4 sm:px-6 py-3 text-center">
          <p className="text-xs sm:text-sm text-text-secondary font-medium">
            Full per-IP breakdown with SPF, DKIM, and DMARC results.
          </p>
        </div>
      </div>
    </section>
  );
}
