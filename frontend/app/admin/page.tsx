'use client';

import { useState, useEffect, useCallback } from 'react';

const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8080';

interface FeedbackEntry {
  id: string;
  sentiment: 'positive' | 'neutral' | 'negative';
  message: string;
  timestamp: string;
}

interface Summary {
  total: number;
  positive: number;
  neutral: number;
  negative: number;
}

interface FeedbackData {
  summary: Summary;
  entries: FeedbackEntry[];
}

const SENTIMENT_CONFIG = {
  positive: { emoji: '😍', label: 'Great', color: 'text-green-400', bar: 'bg-green-500' },
  neutral: { emoji: '😐', label: 'OK', color: 'text-yellow-400', bar: 'bg-yellow-500' },
  negative: { emoji: '😞', label: 'Poor', color: 'text-red-400', bar: 'bg-red-500' },
} as const;

export default function AdminPage() {
  const [token, setToken] = useState('');
  const [authed, setAuthed] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [data, setData] = useState<FeedbackData | null>(null);
  const [filter, setFilter] = useState<'all' | 'positive' | 'neutral' | 'negative'>('all');
  const [savedToken, setSavedToken] = useState('');

  // Restore token from sessionStorage
  useEffect(() => {
    const stored = sessionStorage.getItem('admin_token');
    if (stored) {
      setSavedToken(stored);
      setToken(stored);
    }
  }, []);

  const fetchData = useCallback(async (t: string) => {
    setLoading(true);
    setError('');
    try {
      const res = await fetch(`${API_URL}/api/admin/feedback`, {
        headers: { Authorization: `Bearer ${t}` },
      });
      if (res.status === 401) {
        setError('Invalid token. Please check your admin token and try again.');
        return;
      }
      if (!res.ok) {
        const body = await res.json().catch(() => ({}));
        setError(body.message || `Error ${res.status}`);
        return;
      }
      const json: FeedbackData = await res.json();
      setData(json);
      setAuthed(true);
      sessionStorage.setItem('admin_token', t);
    } catch {
      setError('Could not reach the server. Make sure the backend is running.');
    } finally {
      setLoading(false);
    }
  }, []);

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    await fetchData(token);
  };

  const handleRefresh = () => fetchData(savedToken || token);

  const handleLogout = () => {
    sessionStorage.removeItem('admin_token');
    setAuthed(false);
    setData(null);
    setToken('');
    setSavedToken('');
  };

  const filteredEntries = data?.entries.filter(
    (e) => filter === 'all' || e.sentiment === filter
  ) ?? [];

  if (!authed) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center px-4">
        <div className="w-full max-w-sm space-y-6">
          <div className="text-center space-y-1">
            <h1 className="text-2xl font-bold text-text-primary font-display">
              Admin Dashboard
            </h1>
            <p className="text-sm text-text-muted">DMARC Labs — Feedback Viewer</p>
          </div>

          <form onSubmit={handleLogin} className="space-y-4">
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
              {loading ? 'Signing in…' : 'Sign In'}
            </button>
          </form>
        </div>
      </div>
    );
  }

  const { summary } = data!;

  return (
    <div className="min-h-screen bg-background text-text-primary">
      {/* Header */}
      <header className="border-b border-border bg-card/60 backdrop-blur-sm sticky top-0 z-10">
        <div className="max-w-5xl mx-auto px-4 sm:px-6 py-3 flex items-center justify-between">
          <div>
            <h1 className="text-lg font-bold font-display text-text-primary">
              Feedback Dashboard
            </h1>
            <p className="text-xs text-text-muted">DMARC Labs Admin</p>
          </div>
          <div className="flex items-center gap-3">
            <button
              onClick={handleRefresh}
              disabled={loading}
              className="px-3 py-1.5 rounded-md border border-border text-sm text-text-muted hover:text-text-primary hover:border-accent/40 disabled:opacity-50 transition-colors"
            >
              {loading ? 'Refreshing…' : 'Refresh'}
            </button>
            <button
              onClick={handleLogout}
              className="px-3 py-1.5 rounded-md border border-red-500/30 text-sm text-red-400 hover:bg-red-500/10 transition-colors"
            >
              Sign Out
            </button>
          </div>
        </div>
      </header>

      <main className="max-w-5xl mx-auto px-4 sm:px-6 py-8 space-y-8">
        {/* Summary Cards */}
        <section>
          <h2 className="text-sm font-semibold text-text-muted uppercase tracking-wider mb-4">
            Overview
          </h2>
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
            {/* Total */}
            <div className="col-span-2 sm:col-span-1 bg-card border border-border rounded-xl p-4 space-y-1">
              <p className="text-xs text-text-muted uppercase tracking-wide">Total</p>
              <p className="text-3xl font-bold font-display text-text-primary">
                {summary.total}
              </p>
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
                      <div
                        className={`h-1.5 rounded-full ${cfg.bar} transition-all`}
                        style={{ width: `${pct}%` }}
                      />
                    </div>
                    <p className="text-xs text-text-muted">{pct}%</p>
                  </div>
                </div>
              );
            })}
          </div>
        </section>

        {/* Sentiment Bar Chart */}
        {summary.total > 0 && (
          <section className="bg-card border border-border rounded-xl p-5">
            <h2 className="text-sm font-semibold text-text-muted uppercase tracking-wider mb-4">
              Distribution
            </h2>
            <div className="flex rounded-full overflow-hidden h-5 gap-px">
              {(['positive', 'neutral', 'negative'] as const).map((s) => {
                const pct = summary.total > 0 ? (summary[s] / summary.total) * 100 : 0;
                return pct > 0 ? (
                  <div
                    key={s}
                    className={`${SENTIMENT_CONFIG[s].bar} flex items-center justify-center text-xs text-white font-medium transition-all`}
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

        {/* Entries List */}
        <section>
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-sm font-semibold text-text-muted uppercase tracking-wider">
              Responses{filteredEntries.length > 0 && ` (${filteredEntries.length})`}
            </h2>
            {/* Filter pills */}
            <div className="flex gap-1.5">
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

          {filteredEntries.length === 0 ? (
            <div className="bg-card border border-border rounded-xl p-8 text-center">
              <p className="text-text-muted text-sm">
                {summary.total === 0
                  ? 'No feedback received yet.'
                  : 'No entries match this filter.'}
              </p>
            </div>
          ) : (
            <div className="space-y-2">
              {filteredEntries.map((entry) => {
                const cfg = SENTIMENT_CONFIG[entry.sentiment];
                const date = new Date(entry.timestamp);
                return (
                  <div
                    key={entry.id}
                    className="bg-card border border-border rounded-xl px-4 py-3 flex items-start gap-4"
                  >
                    <span className="text-xl mt-0.5 flex-shrink-0" aria-label={cfg.label}>
                      {cfg.emoji}
                    </span>
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2 mb-0.5">
                        <span className={`text-xs font-medium capitalize ${cfg.color}`}>
                          {cfg.label}
                        </span>
                        <span className="text-text-muted text-xs">·</span>
                        <time
                          dateTime={entry.timestamp}
                          className="text-xs text-text-muted"
                          title={date.toLocaleString()}
                        >
                          {date.toLocaleDateString(undefined, {
                            month: 'short',
                            day: 'numeric',
                            year: 'numeric',
                          })}{' '}
                          {date.toLocaleTimeString(undefined, {
                            hour: '2-digit',
                            minute: '2-digit',
                          })}
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
      </main>
    </div>
  );
}
