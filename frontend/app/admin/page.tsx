'use client';

import { useState, useEffect, useCallback } from 'react';

const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8080';

// â”€â”€ Types â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€

interface FeedbackEntry {
  id: string;
  sentiment: 'positive' | 'neutral' | 'negative';
  message: string;
  timestamp: string;
}

interface FeedbackSummary {
  total: number;
  positive: number;
  neutral: number;
  negative: number;
}

interface ContactEntry {
  id: string;
  name: string;
  subject: string;
  message: string;
  timestamp: string;
  read: boolean;
}

interface ScanStats {
  totalScans: number;
  totalRecords: number;
  failedScans: number;
  avgProcessingMs: number;
  avgFileSizeMB: number;
  totalFileSizeMB: number;
  dailyChart: { date: string; scans: number }[];
}

// â”€â”€ Config â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€

const SENTIMENT_CONFIG = {
  positive: { emoji: 'ðŸ˜', label: 'Great', color: 'text-green-400', bar: 'bg-green-500' },
  neutral: { emoji: 'ðŸ˜', label: 'OK', color: 'text-yellow-400', bar: 'bg-yellow-500' },
  negative: { emoji: 'ðŸ˜ž', label: 'Poor', color: 'text-red-400', bar: 'bg-red-500' },
} as const;

const SUBJECT_LABELS: Record<string, string> = {
  bug: 'Bug report',
  feature: 'Feature request',
  access: 'Access request',
  privacy: 'Privacy / GDPR',
  general: 'General',
  other: 'Other',
};

// â”€â”€ Login screen â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€

function LoginScreen({
  onLogin,
}: {
  onLogin: (token: string) => Promise<string | null>;
}) {
  const [token, setToken] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError('');
    const err = await onLogin(token);
    if (err) setError(err);
    setLoading(false);
  };

  return (
    <div className="min-h-screen bg-background flex items-center justify-center px-4">
      <div className="w-full max-w-sm space-y-6">
        <div className="text-center space-y-1">
          <h1 className="text-2xl font-bold text-text-primary font-display">Admin Dashboard</h1>
          <p className="text-sm text-text-muted">DMARC Labs â€” Internal Panel</p>
        </div>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label htmlFor="token" className="block text-sm text-text-muted mb-1.5">
              Admin Token
            </label>
            <input
              id="token"
              type="password"
              value={token}
              onChange={(e) => setToken(e.target.value)}
              placeholder="Enter your admin token"
              autoComplete="current-password"
              required
              className="w-full px-3 py-2 rounded-lg bg-card border border-border text-text-primary text-sm focus:outline-none focus:ring-2 focus:ring-accent/50 focus:border-accent/60 placeholder:text-text-muted"
            />
          </div>
          {error && (
            <p className="text-sm text-red-400 bg-red-500/10 border border-red-500/20 rounded-lg px-3 py-2">
              {error}
            </p>
          )}
          <button
            type="submit"
            disabled={loading || !token}
            className="w-full py-2.5 rounded-lg bg-accent text-white text-sm font-medium hover:bg-accent-hover disabled:opacity-60 transition-colors"
          >
            {loading ? 'Signing inâ€¦' : 'Sign In'}
          </button>
        </form>
      </div>
    </div>
  );
}

// â”€â”€ Main dashboard â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€

export default function AdminPage() {
  const [authed, setAuthed] = useState(false);
  const [savedToken, setSavedToken] = useState('');
  const [activeTab, setActiveTab] = useState<'stats' | 'contact' | 'feedback'>('stats');

  // Feedback state
  const [feedbackData, setFeedbackData] = useState<{ summary: FeedbackSummary; entries: FeedbackEntry[] } | null>(null);
  const [feedbackFilter, setFeedbackFilter] = useState<'all' | 'positive' | 'neutral' | 'negative'>('all');

  // Contact state
  const [contactData, setContactData] = useState<{ unread: number; total: number; entries: ContactEntry[] } | null>(null);
  const [contactFilter, setContactFilter] = useState<'all' | 'unread'>('all');
  const [expandedContact, setExpandedContact] = useState<string | null>(null);

  // Stats state
  const [scanStats, setScanStats] = useState<ScanStats | null>(null);

  const [loading, setLoading] = useState(false);

  // Restore session token
  useEffect(() => {
    const stored = sessionStorage.getItem('admin_token');
    if (stored) setSavedToken(stored);
  }, []);

  const authFetch = useCallback(
    async (path: string, options?: RequestInit) => {
      return fetch(`${API_URL}${path}`, {
        ...options,
        headers: { Authorization: `Bearer ${savedToken}`, ...(options?.headers ?? {}) },
      });
    },
    [savedToken]
  );

  const loadAll = useCallback(
    async (token: string): Promise<string | null> => {
      setLoading(true);
      try {
        const [fbRes, ctRes, stRes] = await Promise.all([
          fetch(`${API_URL}/api/admin/feedback`, { headers: { Authorization: `Bearer ${token}` } }),
          fetch(`${API_URL}/api/admin/contact`, { headers: { Authorization: `Bearer ${token}` } }),
          fetch(`${API_URL}/api/admin/stats`, { headers: { Authorization: `Bearer ${token}` } }),
        ]);

        if (fbRes.status === 401 || ctRes.status === 401 || stRes.status === 401) {
          return 'Invalid token. Please check your admin token and try again.';
        }
        if (!fbRes.ok || !ctRes.ok || !stRes.ok) {
          return `Server error (${fbRes.status})`;
        }

        const [fbJson, ctJson, stJson] = await Promise.all([fbRes.json(), ctRes.json(), stRes.json()]);
        setFeedbackData(fbJson);
        setContactData(ctJson);
        setScanStats(stJson);
        return null;
      } catch {
        return 'Could not reach the server. Make sure the backend is running.';
      } finally {
        setLoading(false);
      }
    },
    []
  );

  const handleLogin = async (token: string): Promise<string | null> => {
    const err = await loadAll(token);
    if (!err) {
      setSavedToken(token);
      sessionStorage.setItem('admin_token', token);
      setAuthed(true);
    }
    return err;
  };

  const handleRefresh = () => loadAll(savedToken);

  const handleLogout = () => {
    sessionStorage.removeItem('admin_token');
    setAuthed(false);
    setFeedbackData(null);
    setContactData(null);
    setScanStats(null);
    setSavedToken('');
  };

  const handleOpenContact = async (entry: ContactEntry) => {
    setExpandedContact(expandedContact === entry.id ? null : entry.id);
    if (!entry.read) {
      try {
        await authFetch(`/api/admin/contact/${entry.id}/read`, { method: 'PATCH' });
        setContactData((prev) =>
          prev
            ? {
                ...prev,
                unread: Math.max(0, prev.unread - 1),
                entries: prev.entries.map((e) => (e.id === entry.id ? { ...e, read: true } : e)),
              }
            : prev
        );
      } catch {
        // non-critical
      }
    }
  };

  if (!authed) return <LoginScreen onLogin={handleLogin} />;

  const unreadCount = contactData?.unread ?? 0;

  return (
    <div className="min-h-screen bg-background text-text-primary">
      {/* Header */}
      <header className="border-b border-border bg-card/60 backdrop-blur-sm sticky top-0 z-10">
        <div className="max-w-5xl mx-auto px-4 sm:px-6 py-3 flex items-center justify-between">
          <div>
            <h1 className="text-lg font-bold font-display text-text-primary">Admin Dashboard</h1>
            <p className="text-xs text-text-muted">DMARC Labs</p>
          </div>
          <div className="flex items-center gap-3">
            <button
              onClick={handleRefresh}
              disabled={loading}
              className="px-3 py-1.5 rounded-md border border-border text-sm text-text-muted hover:text-text-primary hover:border-accent/40 disabled:opacity-50 transition-colors"
            >
              {loading ? 'Refreshingâ€¦' : 'Refresh'}
            </button>
            <button
              onClick={handleLogout}
              className="px-3 py-1.5 rounded-md border border-red-500/30 text-sm text-red-400 hover:bg-red-500/10 transition-colors"
            >
              Sign Out
            </button>
          </div>
        </div>

        {/* Tabs */}
        <div className="max-w-5xl mx-auto px-4 sm:px-6 flex gap-1 pb-0">
          <TabButton active={activeTab === 'stats'} onClick={() => setActiveTab('stats')}>
            Scans
            {scanStats && (
              <span className="ml-1.5 text-text-muted text-xs">({scanStats.totalScans})</span>
            )}
          </TabButton>
          <TabButton active={activeTab === 'contact'} onClick={() => setActiveTab('contact')}>
            Contact Messages
            {unreadCount > 0 && (
              <span className="ml-1.5 inline-flex items-center justify-center px-1.5 py-0.5 rounded-full text-[10px] font-bold bg-accent text-white min-w-[18px]">
                {unreadCount}
              </span>
            )}
          </TabButton>
          <TabButton active={activeTab === 'feedback'} onClick={() => setActiveTab('feedback')}>
            Feedback
            {feedbackData && (
              <span className="ml-1.5 text-text-muted text-xs">({feedbackData.summary.total})</span>
            )}
          </TabButton>
        </div>
      </header>

      <main className="max-w-5xl mx-auto px-4 sm:px-6 py-8">
      {activeTab === 'stats' && scanStats && (
          <StatsTab data={scanStats} />
        )}
        {activeTab === 'contact' && contactData && (
          <ContactTab
            data={contactData}
            filter={contactFilter}
            setFilter={setContactFilter}
            expandedId={expandedContact}
            onOpen={handleOpenContact}
          />
        )}
        {activeTab === 'feedback' && feedbackData && (
          <FeedbackTab
            data={feedbackData}
            filter={feedbackFilter}
            setFilter={setFeedbackFilter}
          />
        )}
      </main>
    </div>
  );
}

// â”€â”€ Tab button â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€

function TabButton({
  active,
  onClick,
  children,
}: {
  active: boolean;
  onClick: () => void;
  children: React.ReactNode;
}) {
  return (
    <button
      onClick={onClick}
      className={[
        'flex items-center px-4 py-2.5 text-sm font-medium border-b-2 transition-colors',
        active
          ? 'border-accent text-text-primary'
          : 'border-transparent text-text-muted hover:text-text-primary',
      ].join(' ')}
    >
      {children}
    </button>
  );
}

// â”€â”€ Stats tab â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€

function StatsTab({ data }: { data: ScanStats }) {
  const maxScans = Math.max(...data.dailyChart.map((d) => d.scans), 1);

  return (
    <div className="space-y-8">
      {/* KPI cards */}
      <section>
        <h2 className="text-sm font-semibold text-text-muted uppercase tracking-wider mb-4">Overview</h2>
        <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
          <StatCard label="Total scans" value={data.totalScans} highlight={data.totalScans > 0} />
          <StatCard label="IP records processed" value={data.totalRecords} />
          <StatCard label="Failed scans" value={data.failedScans} />
          <div className="bg-card border border-border rounded-xl p-4 space-y-1">
            <p className="text-xs text-text-muted">Avg processing time</p>
            <p className="text-2xl font-bold font-display text-text-primary">
              {data.avgProcessingMs < 1000
                ? `${data.avgProcessingMs}ms`
                : `${(data.avgProcessingMs / 1000).toFixed(1)}s`}
            </p>
          </div>
          <div className="bg-card border border-border rounded-xl p-4 space-y-1">
            <p className="text-xs text-text-muted">Avg file size</p>
            <p className="text-2xl font-bold font-display text-text-primary">{data.avgFileSizeMB} MB</p>
          </div>
          <div className="bg-card border border-border rounded-xl p-4 space-y-1">
            <p className="text-xs text-text-muted">Total data processed</p>
            <p className="text-2xl font-bold font-display text-text-primary">{data.totalFileSizeMB} MB</p>
          </div>
        </div>
      </section>

      {/* Daily chart */}
      <section className="bg-card border border-border rounded-xl p-5">
        <h2 className="text-sm font-semibold text-text-muted uppercase tracking-wider mb-5">
          Scans â€” last 30 days
        </h2>
        {data.totalScans === 0 ? (
          <p className="text-sm text-text-muted text-center py-6">No scans recorded yet.</p>
        ) : (
          <div className="flex items-end gap-[3px] h-32">
            {data.dailyChart.map(({ date, scans }) => {
              const heightPct = scans > 0 ? Math.max(4, Math.round((scans / maxScans) * 100)) : 0;
              const label = new Date(date + 'T00:00:00').toLocaleDateString(undefined, {
                month: 'short',
                day: 'numeric',
              });
              return (
                <div
                  key={date}
                  className="flex-1 flex flex-col items-center justify-end gap-1 group relative"
                  title={`${label}: ${scans} scan${scans !== 1 ? 's' : ''}`}
                >
                  <div
                    className={`w-full rounded-sm transition-all ${scans > 0 ? 'bg-accent/70 group-hover:bg-accent' : 'bg-white/5'}`}
                    style={{ height: scans > 0 ? `${heightPct}%` : '4px' }}
                  />
                  {/* Tooltip */}
                  {scans > 0 && (
                    <div className="absolute bottom-full mb-1.5 left-1/2 -translate-x-1/2 hidden group-hover:flex flex-col items-center z-10 pointer-events-none">
                      <div className="bg-card border border-border rounded px-2 py-1 text-xs text-text-primary whitespace-nowrap shadow-lg">
                        {label}: <span className="font-semibold text-accent">{scans}</span>
                      </div>
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        )}
      </section>

      {data.totalScans === 0 && (
        <p className="text-xs text-text-muted text-center">
          Stats are recorded from this moment forward â€” in-memory only, reset on server restart.
        </p>
      )}
    </div>
  );
}

// â”€â”€ Contact tab â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€

function ContactTab({
  data,
  filter,
  setFilter,
  expandedId,
  onOpen,
}: {
  data: { unread: number; total: number; entries: ContactEntry[] };
  filter: 'all' | 'unread';
  setFilter: (f: 'all' | 'unread') => void;
  expandedId: string | null;
  onOpen: (entry: ContactEntry) => void;
}) {
  const filtered = data.entries.filter((e) => filter === 'all' || !e.read);

  return (
    <div className="space-y-6">
      {/* Stats */}
      <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
        <StatCard label="Total messages" value={data.total} />
        <StatCard label="Unread" value={data.unread} highlight={data.unread > 0} />
        <StatCard label="Read" value={data.total - data.unread} />
      </div>

      {/* List */}
      <div>
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-sm font-semibold text-text-muted uppercase tracking-wider">
            Messages{filtered.length > 0 && ` (${filtered.length})`}
          </h2>
          <div className="flex gap-1.5">
            {(['all', 'unread'] as const).map((f) => (
              <button
                key={f}
                onClick={() => setFilter(f)}
                className={[
                  'px-2.5 py-1 rounded-full text-xs font-medium transition-colors capitalize',
                  filter === f
                    ? 'bg-accent text-white'
                    : 'bg-card border border-border text-text-muted hover:text-text-primary',
                ].join(' ')}
              >
                {f === 'all' ? 'All' : `Unread${data.unread > 0 ? ` (${data.unread})` : ''}`}
              </button>
            ))}
          </div>
        </div>

        {filtered.length === 0 ? (
          <EmptyState text={data.total === 0 ? 'No messages yet.' : 'No unread messages.'} />
        ) : (
          <div className="space-y-2">
            {filtered.map((entry) => (
              <div
                key={entry.id}
                className={[
                  'rounded-xl border transition-colors cursor-pointer',
                  !entry.read ? 'border-accent/30 bg-accent/5' : 'border-border bg-card',
                ].join(' ')}
                onClick={() => onOpen(entry)}
              >
                <div className="flex items-center gap-3 px-4 py-3">
                  {!entry.read && (
                    <span className="w-2 h-2 rounded-full bg-accent flex-shrink-0" aria-label="Unread" />
                  )}
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2 flex-wrap">
                      <span className="text-sm font-medium text-text-primary">{entry.name}</span>
                      <span className="text-xs px-2 py-0.5 rounded-full bg-white/5 border border-white/10 text-text-muted">
                        {SUBJECT_LABELS[entry.subject] ?? entry.subject}
                      </span>
                      <time className="text-xs text-text-muted ml-auto">
                        {new Date(entry.timestamp).toLocaleDateString(undefined, {
                          month: 'short',
                          day: 'numeric',
                          year: 'numeric',
                        })}
                      </time>
                    </div>
                    {expandedId !== entry.id && (
                      <p className="text-xs text-text-muted mt-0.5 truncate">{entry.message}</p>
                    )}
                  </div>
                  <span className="text-text-muted text-xs ml-2 flex-shrink-0">
                    {expandedId === entry.id ? 'â–²' : 'â–¼'}
                  </span>
                </div>

                {expandedId === entry.id && (
                  <div className="px-4 pb-4 pt-0 border-t border-white/5">
                    <p className="text-sm text-text-primary whitespace-pre-wrap leading-relaxed mt-3">
                      {entry.message}
                    </p>
                  </div>
                )}
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}

// â”€â”€ Feedback tab â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€

function FeedbackTab({
  data,
  filter,
  setFilter,
}: {
  data: { summary: FeedbackSummary; entries: FeedbackEntry[] };
  filter: 'all' | 'positive' | 'neutral' | 'negative';
  setFilter: (f: 'all' | 'positive' | 'neutral' | 'negative') => void;
}) {
  const { summary } = data;
  const filtered = data.entries.filter((e) => filter === 'all' || e.sentiment === filter);

  return (
    <div className="space-y-8">
      {/* Summary Cards */}
      <section>
        <h2 className="text-sm font-semibold text-text-muted uppercase tracking-wider mb-4">Overview</h2>
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
          <div className="col-span-2 sm:col-span-1 bg-card border border-border rounded-xl p-4 space-y-1">
            <p className="text-xs text-text-muted uppercase tracking-wide">Total</p>
            <p className="text-3xl font-bold font-display text-text-primary">{summary.total}</p>
            <p className="text-xs text-text-muted">responses</p>
          </div>
          {(['positive', 'neutral', 'negative'] as const).map((s) => {
            const cfg = SENTIMENT_CONFIG[s];
            const count = summary[s];
            const pct = summary.total > 0 ? Math.round((count / summary.total) * 100) : 0;
            return (
              <div key={s} className="bg-card border border-border rounded-xl p-4 space-y-2">
                <div className="flex items-center justify-between">
                  <span className="text-xs text-text-muted capitalize">{cfg.label}</span>
                  <span className="text-lg">{cfg.emoji}</span>
                </div>
                <p className={`text-2xl font-bold font-display ${cfg.color}`}>{count}</p>
                <div className="space-y-1">
                  <div className="w-full bg-border/30 rounded-full h-1.5">
                    <div className={`h-1.5 rounded-full ${cfg.bar} transition-all`} style={{ width: `${pct}%` }} />
                  </div>
                  <p className="text-xs text-text-muted">{pct}%</p>
                </div>
              </div>
            );
          })}
        </div>
      </section>

      {/* Distribution bar */}
      {summary.total > 0 && (
        <section className="bg-card border border-border rounded-xl p-5">
          <h2 className="text-sm font-semibold text-text-muted uppercase tracking-wider mb-4">Distribution</h2>
          <div className="flex rounded-full overflow-hidden h-5 gap-px">
            {(['positive', 'neutral', 'negative'] as const).map((s) => {
              const pct = summary.total > 0 ? (summary[s] / summary.total) * 100 : 0;
              return pct > 0 ? (
                <div
                  key={s}
                  className={`${SENTIMENT_CONFIG[s].bar} flex items-center justify-center text-xs text-white font-medium`}
                  style={{ width: `${pct}%` }}
                  title={`${SENTIMENT_CONFIG[s].label}: ${summary[s]} (${Math.round(pct)}%)`}
                >
                  {pct >= 10 && `${Math.round(pct)}%`}
                </div>
              ) : null;
            })}
          </div>
          <div className="flex gap-5 mt-3">
            {(['positive', 'neutral', 'negative'] as const).map((s) => (
              <div key={s} className="flex items-center gap-1.5">
                <span className={`inline-block w-2.5 h-2.5 rounded-sm ${SENTIMENT_CONFIG[s].bar}`} />
                <span className="text-xs text-text-muted">{SENTIMENT_CONFIG[s].label}</span>
              </div>
            ))}
          </div>
        </section>
      )}

      {/* Entries */}
      <section>
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-sm font-semibold text-text-muted uppercase tracking-wider">
            Responses{filtered.length > 0 && ` (${filtered.length})`}
          </h2>
          <div className="flex gap-1.5 flex-wrap">
            {(['all', 'positive', 'neutral', 'negative'] as const).map((f) => (
              <button
                key={f}
                onClick={() => setFilter(f)}
                className={[
                  'px-2.5 py-1 rounded-full text-xs font-medium transition-colors capitalize',
                  filter === f
                    ? 'bg-accent text-white'
                    : 'bg-card border border-border text-text-muted hover:text-text-primary',
                ].join(' ')}
              >
                {f === 'all' ? 'All' : `${SENTIMENT_CONFIG[f].emoji} ${SENTIMENT_CONFIG[f].label}`}
              </button>
            ))}
          </div>
        </div>

        {filtered.length === 0 ? (
          <EmptyState text={summary.total === 0 ? 'No feedback received yet.' : 'No entries match this filter.'} />
        ) : (
          <div className="space-y-2">
            {filtered.map((entry) => {
              const cfg = SENTIMENT_CONFIG[entry.sentiment];
              const date = new Date(entry.timestamp);
              return (
                <div key={entry.id} className="bg-card border border-border rounded-xl px-4 py-3 flex items-start gap-4">
                  <span className="text-xl mt-0.5 flex-shrink-0">{cfg.emoji}</span>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2 mb-0.5">
                      <span className={`text-xs font-medium capitalize ${cfg.color}`}>{cfg.label}</span>
                      <span className="text-text-muted text-xs">Â·</span>
                      <time dateTime={entry.timestamp} className="text-xs text-text-muted">
                        {date.toLocaleDateString(undefined, { month: 'short', day: 'numeric', year: 'numeric' })}{' '}
                        {date.toLocaleTimeString(undefined, { hour: '2-digit', minute: '2-digit' })}
                      </time>
                    </div>
                    {entry.message ? (
                      <p className="text-sm text-text-primary break-words">{entry.message}</p>
                    ) : (
                      <p className="text-xs text-text-muted italic">No message left</p>
                    )}
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </section>
    </div>
  );
}

// â”€â”€ Shared helpers â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€

function StatCard({ label, value, highlight }: { label: string; value: number; highlight?: boolean }) {
  return (
    <div className={['bg-card border rounded-xl p-4 space-y-1', highlight ? 'border-accent/40' : 'border-border'].join(' ')}>
      <p className="text-xs text-text-muted">{label}</p>
      <p className={['text-2xl font-bold font-display', highlight ? 'text-accent' : 'text-text-primary'].join(' ')}>
        {value}
      </p>
    </div>
  );
}

function EmptyState({ text }: { text: string }) {
  return (
    <div className="bg-card border border-border rounded-xl p-8 text-center">
      <p className="text-text-muted text-sm">{text}</p>
    </div>
  );
}
