'use client';

import { useEffect, useRef, useState } from 'react';
import { CheckCircle2, Loader2, AlertCircle, Upload, FileSearch, Globe, Sparkles } from 'lucide-react';

export type AnalysisStep = 'upload' | 'parse' | 'enrich' | 'build';
export type StepStatus = 'waiting' | 'active' | 'done' | 'error';

interface StepState {
  id: AnalysisStep;
  label: string;
  description: string;
  icon: React.ReactNode;
  /** estimated seconds this step takes based on file size */
  estimateSec: number;
}

interface AnalysisTimelineProps {
  /** Current active step */
  activeStep: AnalysisStep;
  /** true once the overall process errors */
  hasError?: boolean;
  /** Error message to show under the failed step */
  errorMessage?: string;
  /** Upload byte progress 0–100 */
  uploadPercent: number;
  /** File size in bytes — used to show time estimates */
  fileSizeBytes: number;
  /** Label e.g. "Uploading report.xml…" */
  uploadLabel?: string;
}

/** Asymptotic fake progress: smoothly approaches 95% without reaching it */
function useFakeProgress(active: boolean, estimateSec: number) {
  const [fake, setFake] = useState(0);
  const startRef = useRef<number | null>(null);
  const rafRef = useRef<number | null>(null);

  useEffect(() => {
    if (!active) {
      if (rafRef.current) cancelAnimationFrame(rafRef.current);
      startRef.current = null;
      setFake(0);
      return;
    }

    const tick = (now: number) => {
      if (!startRef.current) startRef.current = now;
      const elapsed = (now - startRef.current) / 1000;
      // Asymptotic curve: p = 95 * (1 - e^(-k*t))  where k = 2.5/estimateSec
      const k = 2.5 / Math.max(estimateSec, 1);
      const p = 95 * (1 - Math.exp(-k * elapsed));
      setFake(Math.min(95, p));
      rafRef.current = requestAnimationFrame(tick);
    };

    rafRef.current = requestAnimationFrame(tick);
    return () => {
      if (rafRef.current) cancelAnimationFrame(rafRef.current);
    };
  }, [active, estimateSec]);

  return fake;
}

function useElapsedTime(active: boolean) {
  const [elapsed, setElapsed] = useState(0);
  const startRef = useRef<number | null>(null);

  useEffect(() => {
    if (!active) {
      startRef.current = null;
      setElapsed(0);
      return;
    }
    startRef.current = Date.now();
    const interval = setInterval(() => {
      if (startRef.current) setElapsed(Math.floor((Date.now() - startRef.current) / 1000));
    }, 1000);
    return () => clearInterval(interval);
  }, [active]);

  return elapsed;
}

function formatSec(s: number): string {
  if (s < 60) return `${s}s`;
  return `${Math.floor(s / 60)}m ${s % 60}s`;
}

function StepRow({
  step,
  status,
  uploadPercent,
  estimateSec,
  errorMessage,
}: {
  step: StepState;
  status: StepStatus;
  uploadPercent: number;
  estimateSec: number;
  errorMessage?: string;
}) {
  const isUpload = step.id === 'upload';
  const fakeProgress = useFakeProgress(status === 'active' && !isUpload, estimateSec);
  const elapsed = useElapsedTime(status === 'active');
  const progress = isUpload ? uploadPercent : status === 'done' ? 100 : fakeProgress;
  const remaining = status === 'active' && !isUpload
    ? Math.max(0, Math.round(estimateSec - elapsed))
    : null;

  const iconEl = () => {
    if (status === 'done') return <CheckCircle2 className="h-4 w-4 text-success" />;
    if (status === 'error') return <AlertCircle className="h-4 w-4 text-error" />;
    if (status === 'active') return <Loader2 className="h-4 w-4 text-accent animate-spin" />;
    return <span className="h-4 w-4 flex items-center justify-center text-text-muted opacity-40">{step.icon}</span>;
  };

  return (
    <div className={['space-y-2 transition-opacity duration-300', status === 'waiting' ? 'opacity-40' : 'opacity-100'].join(' ')}>
      <div className="flex items-center justify-between gap-4">
        <div className="flex items-center gap-3 min-w-0">
          <span className="flex-shrink-0 w-7 h-7 rounded-full flex items-center justify-center"
            style={{
              background: status === 'active' ? 'rgba(239,35,60,0.1)' : status === 'done' ? 'rgba(16,185,129,0.1)' : status === 'error' ? 'rgba(239,68,68,0.1)' : 'rgba(255,255,255,0.04)'
            }}>
            {iconEl()}
          </span>
          <div className="min-w-0">
            <p className={['text-sm font-medium leading-tight', status === 'active' ? 'text-text-primary' : status === 'done' ? 'text-text-secondary' : 'text-text-muted'].join(' ')}>
              {step.label}
            </p>
            {status === 'active' && (
              <p className="text-[11px] text-text-muted mt-0.5">{step.description}</p>
            )}
          </div>
        </div>
        <div className="flex-shrink-0 text-right">
          {status === 'active' && (
            <div className="space-y-0.5">
              <p className="text-xs font-mono text-accent">{Math.round(progress)}%</p>
              {remaining !== null && (
                <p className="text-[10px] text-text-muted">
                  {remaining > 0 ? `~${formatSec(remaining)} left` : 'almost done…'}
                </p>
              )}
              {isUpload && (
                <p className="text-[10px] text-text-muted">{formatSec(elapsed)} elapsed</p>
              )}
            </div>
          )}
          {status === 'done' && (
            <p className="text-[10px] text-success font-mono">done</p>
          )}
        </div>
      </div>

      {/* Progress bar — only show for active or done */}
      {(status === 'active' || status === 'done') && (
        <div className="ml-10 h-1.5 bg-white/5 rounded-full overflow-hidden">
          <div
            className={['h-full rounded-full transition-all duration-500', status === 'done' ? 'bg-success' : 'bg-accent'].join(' ')}
            style={{ width: `${progress}%` }}
          />
        </div>
      )}

      {status === 'error' && errorMessage && (
        <div className="ml-10 rounded-lg bg-error/10 border border-error/20 px-3 py-2 text-xs text-error leading-relaxed">
          {errorMessage}
        </div>
      )}
    </div>
  );
}

/**
 * Estimate analysis time in seconds based on file size.
 * parse: ~0.05s/MB, enrich: 2s base + 0.15s/unique IP (we estimate 1 IP per 20kB), build: 0.5s
 */
function buildStepEstimates(fileSizeBytes: number) {
  const mb = fileSizeBytes / 1_000_000;
  const parseSec = Math.max(1, Math.round(0.05 * mb + 0.5));
  const estimatedIPs = Math.max(5, Math.round(fileSizeBytes / 20_000));
  const enrichSec = Math.max(2, Math.round(2 + estimatedIPs * 0.1));
  const buildSec = 1;
  return { parseSec, enrichSec, buildSec };
}

export default function AnalysisTimeline({
  activeStep,
  hasError = false,
  errorMessage,
  uploadPercent,
  fileSizeBytes,
  uploadLabel,
}: AnalysisTimelineProps) {
  const { parseSec, enrichSec, buildSec } = buildStepEstimates(fileSizeBytes);

  const STEPS: StepState[] = [
    {
      id: 'upload',
      label: uploadLabel ?? 'Memory processing',
      description: 'Processing file data in memory — nothing is written to disk…',
      icon: <Upload className="h-4 w-4" />,
      estimateSec: 0,
    },
    {
      id: 'parse',
      label: 'Parsing DMARC XML',
      description: 'Extracting per-IP authentication records…',
      icon: <FileSearch className="h-4 w-4" />,
      estimateSec: parseSec,
    },
    {
      id: 'enrich',
      label: 'Enriching IPs with WHOIS',
      description: 'Looking up owner, ASN, country, and threat level for each sending IP…',
      icon: <Globe className="h-4 w-4" />,
      estimateSec: enrichSec,
    },
    {
      id: 'build',
      label: 'Building results',
      description: 'Aggregating metrics and computing pass rates…',
      icon: <Sparkles className="h-4 w-4" />,
      estimateSec: buildSec,
    },
  ];

  const stepOrder: AnalysisStep[] = ['upload', 'parse', 'enrich', 'build'];
  const activeIdx = stepOrder.indexOf(activeStep);

  function getStatus(step: AnalysisStep): StepStatus {
    const idx = stepOrder.indexOf(step);
    if (hasError && idx === activeIdx) return 'error';
    if (idx < activeIdx) return 'done';
    if (idx === activeIdx) return 'active';
    return 'waiting';
  }

  // Total estimated seconds remaining
  const totalEstimate =
    (activeIdx <= 0 ? 0 : 0) +
    (activeIdx <= 1 ? parseSec : 0) +
    (activeIdx <= 2 ? enrichSec : 0) +
    buildSec;

  return (
    <div className="space-y-5">
      {/* Estimated total */}
      {!hasError && (
        <div className="flex items-center gap-2 text-[11px] text-text-muted">
          <span className="w-1.5 h-1.5 rounded-full bg-accent animate-pulse flex-shrink-0" />
          Estimated total: <span className="font-mono text-text-secondary">~{formatSec(totalEstimate)}</span>
        </div>
      )}

      <div className="space-y-4">
        {STEPS.map((step) => (
          <StepRow
            key={step.id}
            step={step}
            status={getStatus(step.id)}
            uploadPercent={uploadPercent}
            estimateSec={step.estimateSec}
            errorMessage={getStatus(step.id) === 'error' ? errorMessage : undefined}
          />
        ))}
      </div>
    </div>
  );
}
