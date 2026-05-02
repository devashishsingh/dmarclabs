'use client';

import { useMemo } from 'react';
import { X, Shield, AlertTriangle, TrendingUp, BarChart3 } from 'lucide-react';
import {
  PieChart,
  Pie,
  Cell,
  Tooltip,
  ResponsiveContainer,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Legend,
} from 'recharts';
import type { IPRecord } from '@/lib/api';

interface DashboardProps {
  records: IPRecord[];
  onClose: () => void;
}

const ACCENT = '#ef233c';
const GREEN = '#22c55e';

const THREAT_COLORS: Record<string, string> = {
  TRUSTED: '#22c55e',
  NEUTRAL: '#6b7280',
  SUSPICIOUS: '#eab308',
  UNKNOWN: '#3b82f6',
};

// Custom tooltip for pie charts
function PieTooltip({ active, payload }: { active?: boolean; payload?: { name: string; value: number; payload: { fill: string } }[] }) {
  if (!active || !payload?.length) return null;
  return (
    <div className="bg-[#0d0d0d] border border-white/10 rounded-lg px-3 py-2 text-xs shadow-xl">
      <p style={{ color: payload[0].payload.fill }} className="font-semibold">{payload[0].name}</p>
      <p className="text-white">{payload[0].value.toLocaleString()}</p>
    </div>
  );
}

// Custom tooltip for bar charts
function BarTooltip({ active, payload, label }: { active?: boolean; payload?: { name: string; value: number; fill: string }[]; label?: string }) {
  if (!active || !payload?.length) return null;
  return (
    <div className="bg-[#0d0d0d] border border-white/10 rounded-lg px-3 py-2 text-xs shadow-xl max-w-[200px]">
      <p className="text-white/60 mb-1 truncate">{label}</p>
      {payload.map((p) => (
        <p key={p.name} style={{ color: p.fill }} className="font-semibold">{p.name}: {p.value.toLocaleString()}</p>
      ))}
    </div>
  );
}

function StatCard({ icon: Icon, label, value, sub, color = ACCENT }: {
  icon: React.ElementType;
  label: string;
  value: string;
  sub?: string;
  color?: string;
}) {
  return (
    <div className="rounded-xl border border-white/8 bg-[#0d0d0d] p-4 flex items-start gap-3">
      <div className="w-9 h-9 rounded-full flex items-center justify-center flex-shrink-0" style={{ background: `${color}15` }}>
        <Icon className="h-4 w-4" style={{ color }} />
      </div>
      <div className="min-w-0">
        <p className="text-[11px] text-white/40 uppercase tracking-wider">{label}</p>
        <p className="text-xl font-bold font-mono text-white mt-0.5 truncate">{value}</p>
        {sub && <p className="text-[11px] text-white/40 mt-0.5">{sub}</p>}
      </div>
    </div>
  );
}

function SectionHeading({ children }: { children: React.ReactNode }) {
  return (
    <h3 className="text-sm font-semibold text-white/80 uppercase tracking-widest flex items-center gap-2 mb-4">
      <span className="w-1 h-4 rounded-full" style={{ background: ACCENT }} />
      {children}
    </h3>
  );
}

export default function Dashboard({ records, onClose }: DashboardProps) {
  const data = useMemo(() => {
    const totalEmails = records.reduce((s, r) => s + r.emailVolume, 0);
    const dmarcPass = records.reduce((s, r) => s + r.dmarc.pass, 0);
    const dmarcFail = records.reduce((s, r) => s + r.dmarc.fail, 0);

    // Threat distribution
    const threatCounts: Record<string, number> = { TRUSTED: 0, NEUTRAL: 0, SUSPICIOUS: 0, UNKNOWN: 0 };
    records.forEach((r) => { threatCounts[r.whois.threatLevel] = (threatCounts[r.whois.threatLevel] ?? 0) + 1; });
    const threatPie = Object.entries(threatCounts)
      .filter(([, v]) => v > 0)
      .map(([name, value]) => ({ name, value, fill: THREAT_COLORS[name] }));

    // DMARC pass/fail pie
    const dmarcPie = [
      { name: 'Pass', value: dmarcPass, fill: GREEN },
      { name: 'Fail', value: dmarcFail, fill: ACCENT },
    ].filter((d) => d.value > 0);

    // Top 10 highest volume IPs
    const topVolume = [...records]
      .sort((a, b) => b.emailVolume - a.emailVolume)
      .slice(0, 10)
      .map((r) => ({
        ip: r.ip,
        Emails: r.emailVolume,
        'DMARC Pass': r.dmarc.pass,
        'DMARC Fail': r.dmarc.fail,
        threat: r.whois.threatLevel,
      }));

    // Top 10 most DMARC-failing IPs
    const topFailing = [...records]
      .sort((a, b) => b.dmarc.fail - a.dmarc.fail)
      .filter((r) => r.dmarc.fail > 0)
      .slice(0, 10)
      .map((r) => ({
        ip: r.ip,
        Fail: r.dmarc.fail,
        Pass: r.dmarc.pass,
        owner: r.whois.owner,
      }));

    // Suspicious / bad reputation IPs
    const suspiciousIPs = records.filter((r) => r.whois.threatLevel === 'SUSPICIOUS');
    const topSuspicious = [...suspiciousIPs]
      .sort((a, b) => b.emailVolume - a.emailVolume)
      .slice(0, 10)
      .map((r) => ({
        ip: r.ip,
        Emails: r.emailVolume,
        owner: r.whois.owner,
      }));

    // Country distribution (top 8)
    const countryCounts: Record<string, number> = {};
    records.forEach((r) => {
      const c = r.whois.country || 'Unknown';
      countryCounts[c] = (countryCounts[c] ?? 0) + r.emailVolume;
    });
    const countryData = Object.entries(countryCounts)
      .sort(([, a], [, b]) => b - a)
      .slice(0, 8)
      .map(([name, value]) => ({ name, Emails: value }));

    // SPF vs DKIM policy pass comparison
    const spfDkimCompare = records.slice(0, 10).map((r) => ({
      ip: r.ip,
      'SPF Policy': r.spf.policyPass,
      'DKIM Policy': r.dkim.policyPass,
    }));

    return {
      totalEmails,
      dmarcPass,
      dmarcFail,
      threatPie,
      dmarcPie,
      topVolume,
      topFailing,
      topSuspicious,
      countryData,
      spfDkimCompare,
      suspiciousCount: suspiciousIPs.length,
      trustedCount: threatCounts.TRUSTED,
    };
  }, [records]);

  return (
    <div className="fixed inset-0 z-50 flex flex-col bg-black overflow-y-auto">
      {/* Header */}
      <div className="sticky top-0 z-10 bg-black/90 backdrop-blur-xl border-b border-white/8 px-4 sm:px-8 py-4 flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div className="w-8 h-8 rounded-full bg-accent/10 flex items-center justify-center">
            <BarChart3 className="h-4 w-4 text-accent" />
          </div>
          <div>
            <h2 className="text-base font-bold font-display text-white">Sender Intelligence Dashboard</h2>
            <p className="text-[11px] text-white/40">{records.length} IPs · {data.totalEmails.toLocaleString()} emails analysed</p>
          </div>
        </div>
        <button
          onClick={onClose}
          className="flex items-center gap-2 px-3 py-1.5 rounded-lg border border-white/10 text-white/60 hover:text-white hover:border-white/20 text-xs transition-colors"
        >
          <X className="h-3.5 w-3.5" />
          Close
        </button>
      </div>

      {/* Content */}
      <div className="flex-1 px-4 sm:px-8 py-6 space-y-8 max-w-7xl mx-auto w-full">

        {/* KPI cards */}
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
          <StatCard
            icon={Shield}
            label="DMARC Pass Rate"
            value={data.totalEmails > 0 ? `${Math.round((data.dmarcPass / data.totalEmails) * 100)}%` : '—'}
            sub={`${data.dmarcPass.toLocaleString()} of ${data.totalEmails.toLocaleString()} emails`}
            color={GREEN}
          />
          <StatCard
            icon={AlertTriangle}
            label="DMARC Failures"
            value={data.dmarcFail.toLocaleString()}
            sub={`${records.filter((r) => r.dmarc.fail > 0).length} sending IPs`}
            color={ACCENT}
          />
          <StatCard
            icon={AlertTriangle}
            label="Suspicious IPs"
            value={String(data.suspiciousCount)}
            sub={`${data.suspiciousCount} flagged senders`}
            color="#eab308"
          />
          <StatCard
            icon={TrendingUp}
            label="Trusted Senders"
            value={String(data.trustedCount)}
            sub={`of ${records.length} total IPs`}
            color="#22c55e"
          />
        </div>

        {/* Row 1: DMARC Pie + Threat Pie */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 sm:gap-6">
          <div className="rounded-2xl border border-white/8 bg-[#0a0a0a] p-4 sm:p-5">
            <SectionHeading>DMARC Pass vs Fail</SectionHeading>
            <ResponsiveContainer width="100%" height={200}>
              <PieChart>
                <Pie
                  data={data.dmarcPie}
                  cx="50%"
                  cy="45%"
                  innerRadius={50}
                  outerRadius={80}
                  paddingAngle={3}
                  dataKey="value"
                >
                  {data.dmarcPie.map((entry, i) => (
                    <Cell key={i} fill={entry.fill} stroke="transparent" />
                  ))}
                </Pie>
                <Tooltip content={<PieTooltip />} />
                <Legend
                  iconSize={10}
                  wrapperStyle={{ fontSize: 12, paddingTop: 8 }}
                  formatter={(value, entry) => (
                    <span style={{ color: (entry as { color: string }).color }}>{value}</span>
                  )}
                />
              </PieChart>
            </ResponsiveContainer>
          </div>

          <div className="rounded-2xl border border-white/8 bg-[#0a0a0a] p-4 sm:p-5">
            <SectionHeading>Threat Level Distribution</SectionHeading>
            <ResponsiveContainer width="100%" height={200}>
              <PieChart>
                <Pie
                  data={data.threatPie}
                  cx="50%"
                  cy="45%"
                  innerRadius={50}
                  outerRadius={80}
                  paddingAngle={3}
                  dataKey="value"
                >
                  {data.threatPie.map((entry, i) => (
                    <Cell key={i} fill={entry.fill} stroke="transparent" />
                  ))}
                </Pie>
                <Tooltip content={<PieTooltip />} />
                <Legend
                  iconSize={10}
                  wrapperStyle={{ fontSize: 12, paddingTop: 8 }}
                  formatter={(value, entry) => (
                    <span style={{ color: (entry as { color: string }).color }}>{value}</span>
                  )}
                />
              </PieChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Row 2: Top 10 Most-Hit IPs — horizontal bars so IP labels have space */}
        <div className="rounded-2xl border border-white/8 bg-[#0a0a0a] p-4 sm:p-5">
          <SectionHeading>Top 10 Highest Volume Senders</SectionHeading>
          <ResponsiveContainer width="100%" height={data.topVolume.length * 38 + 40}>
            <BarChart
              data={data.topVolume}
              layout="vertical"
              margin={{ top: 0, right: 16, left: 8, bottom: 0 }}
            >
              <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.04)" horizontal={false} />
              <XAxis type="number" tick={{ fill: '#6b7280', fontSize: 10 }} axisLine={false} tickLine={false} />
              <YAxis
                type="category"
                dataKey="ip"
                width={110}
                tick={{ fill: '#9ca3af', fontSize: 10, fontFamily: 'monospace' }}
                axisLine={false}
                tickLine={false}
              />
              <Tooltip content={<BarTooltip />} cursor={{ fill: 'rgba(255,255,255,0.03)' }} />
              <Legend
                iconSize={10}
                wrapperStyle={{ fontSize: 12, paddingTop: 8 }}
                formatter={(v) => <span style={{ color: '#9ca3af' }}>{v}</span>}
              />
              <Bar dataKey="DMARC Pass" stackId="a" fill={GREEN} />
              <Bar dataKey="DMARC Fail" stackId="a" fill={ACCENT} radius={[0, 3, 3, 0]} />
            </BarChart>
          </ResponsiveContainer>
        </div>

        {/* Row 3: Top DMARC Failing IPs */}
        {data.topFailing.length > 0 && (
          <div className="rounded-2xl border border-white/8 bg-[#0a0a0a] p-4 sm:p-5">
            <SectionHeading>Most DMARC-Failing IPs</SectionHeading>
            {/* Mobile: horizontal bar chart. Desktop: table */}
            <div className="block sm:hidden">
              <ResponsiveContainer width="100%" height={data.topFailing.length * 36 + 40}>
                <BarChart
                  data={data.topFailing}
                  layout="vertical"
                  margin={{ top: 0, right: 16, left: 8, bottom: 0 }}
                >
                  <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.04)" horizontal={false} />
                  <XAxis type="number" tick={{ fill: '#6b7280', fontSize: 10 }} axisLine={false} tickLine={false} />
                  <YAxis
                    type="category"
                    dataKey="ip"
                    width={110}
                    tick={{ fill: '#9ca3af', fontSize: 10, fontFamily: 'monospace' }}
                    axisLine={false}
                    tickLine={false}
                  />
                  <Tooltip content={<BarTooltip />} cursor={{ fill: 'rgba(255,255,255,0.03)' }} />
                  <Legend iconSize={10} wrapperStyle={{ fontSize: 12, paddingTop: 8 }} formatter={(v) => <span style={{ color: '#9ca3af' }}>{v}</span>} />
                  <Bar dataKey="Pass" fill={GREEN} />
                  <Bar dataKey="Fail" fill={ACCENT} radius={[0, 3, 3, 0]} />
                </BarChart>
              </ResponsiveContainer>
            </div>
            <div className="hidden sm:block overflow-x-auto">
              <table className="w-full text-sm">
                <thead>
                  <tr className="border-b border-white/5">
                    <th className="text-left py-2 px-3 text-[11px] font-semibold text-white/40 uppercase tracking-wider">IP</th>
                    <th className="text-left py-2 px-3 text-[11px] font-semibold text-white/40 uppercase tracking-wider">Owner</th>
                    <th className="text-right py-2 px-3 text-[11px] font-semibold text-white/40 uppercase tracking-wider">Fail</th>
                    <th className="text-right py-2 px-3 text-[11px] font-semibold text-white/40 uppercase tracking-wider">Pass</th>
                    <th className="text-right py-2 px-3 text-[11px] font-semibold text-white/40 uppercase tracking-wider">Fail Rate</th>
                  </tr>
                </thead>
                <tbody>
                  {data.topFailing.map((row, i) => {
                    const total = row.Fail + row.Pass;
                    const failRate = total > 0 ? Math.round((row.Fail / total) * 100) : 0;
                    return (
                      <tr key={i} className="border-b border-white/5 hover:bg-white/[0.02] transition-colors">
                        <td className="py-2.5 px-3 font-mono text-xs text-white">{row.ip}</td>
                        <td className="py-2.5 px-3 text-xs text-white/60 max-w-[200px] truncate">{row.owner || '—'}</td>
                        <td className="py-2.5 px-3 text-right font-mono text-xs text-red-400 font-semibold">{row.Fail.toLocaleString()}</td>
                        <td className="py-2.5 px-3 text-right font-mono text-xs text-green-400">{row.Pass.toLocaleString()}</td>
                        <td className="py-2.5 px-3 text-right">
                          <span
                            className="inline-block font-mono text-[11px] font-bold px-2 py-0.5 rounded-full"
                            style={{
                              background: failRate >= 75 ? `${ACCENT}20` : failRate >= 40 ? '#eab30820' : '#22c55e20',
                              color: failRate >= 75 ? ACCENT : failRate >= 40 ? '#eab308' : '#22c55e',
                            }}
                          >
                            {failRate}%
                          </span>
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          </div>
        )}

        {/* Row 4: Country Distribution */}
        {data.countryData.length > 1 && (
          <div className="rounded-2xl border border-white/8 bg-[#0a0a0a] p-4 sm:p-5">
            <SectionHeading>Email Volume by Country</SectionHeading>
            <ResponsiveContainer width="100%" height={Math.max(200, data.countryData.length * 36 + 40)}>
              <BarChart
                data={data.countryData}
                layout="vertical"
                margin={{ top: 0, right: 16, left: 8, bottom: 0 }}
              >
                <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.04)" horizontal={false} />
                <XAxis type="number" tick={{ fill: '#6b7280', fontSize: 10 }} axisLine={false} tickLine={false} />
                <YAxis
                  type="category"
                  dataKey="name"
                  width={90}
                  tick={{ fill: '#9ca3af', fontSize: 11 }}
                  axisLine={false}
                  tickLine={false}
                />
                <Tooltip content={<BarTooltip />} cursor={{ fill: 'rgba(255,255,255,0.03)' }} />
                <Bar dataKey="Emails" fill={ACCENT} radius={[0, 3, 3, 0]} opacity={0.85} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        )}

        {/* Row 5: Suspicious IPs table */}
        {data.topSuspicious.length > 0 && (
          <div className="rounded-2xl border border-yellow-500/20 bg-[#0a0a0a] p-4 sm:p-5">
            <SectionHeading>Suspicious / Flagged Senders</SectionHeading>
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead>
                  <tr className="border-b border-white/5">
                    <th className="text-left py-2 px-3 text-[11px] font-semibold text-white/40 uppercase tracking-wider">IP</th>
                    <th className="text-left py-2 px-3 text-[11px] font-semibold text-white/40 uppercase tracking-wider">Owner</th>
                    <th className="text-right py-2 px-3 text-[11px] font-semibold text-white/40 uppercase tracking-wider">Emails Sent</th>
                  </tr>
                </thead>
                <tbody>
                  {data.topSuspicious.map((row, i) => (
                    <tr key={i} className="border-b border-white/5 hover:bg-white/[0.02] transition-colors">
                      <td className="py-2.5 px-3 font-mono text-xs text-yellow-400 font-semibold">{row.ip}</td>
                      <td className="py-2.5 px-3 text-xs text-white/60 max-w-[200px] truncate">{row.owner || '—'}</td>
                      <td className="py-2.5 px-3 text-right font-mono text-xs text-white">{row.Emails.toLocaleString()}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        )}

        {/* Row 6: SPF vs DKIM Policy — horizontal bar chart */}
        <div className="rounded-2xl border border-white/8 bg-[#0a0a0a] p-4 sm:p-5">
          <SectionHeading>SPF vs DKIM Policy Pass (Top 10 IPs)</SectionHeading>
          <ResponsiveContainer width="100%" height={data.spfDkimCompare.length * 44 + 50}>
            <BarChart
              data={data.spfDkimCompare}
              layout="vertical"
              margin={{ top: 0, right: 16, left: 8, bottom: 0 }}
            >
              <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.04)" horizontal={false} />
              <XAxis type="number" tick={{ fill: '#6b7280', fontSize: 10 }} axisLine={false} tickLine={false} />
              <YAxis
                type="category"
                dataKey="ip"
                width={110}
                tick={{ fill: '#9ca3af', fontSize: 10, fontFamily: 'monospace' }}
                axisLine={false}
                tickLine={false}
              />
              <Tooltip content={<BarTooltip />} cursor={{ fill: 'rgba(255,255,255,0.03)' }} />
              <Legend
                iconSize={10}
                wrapperStyle={{ fontSize: 12, paddingTop: 8 }}
                formatter={(v) => <span style={{ color: '#9ca3af' }}>{v}</span>}
              />
              <Bar dataKey="SPF Policy" fill="#3b82f6" radius={[0, 2, 2, 0]} />
              <Bar dataKey="DKIM Policy" fill="#8b5cf6" radius={[0, 2, 2, 0]} />
            </BarChart>
          </ResponsiveContainer>
        </div>

        {/* Footer note */}
        <p className="text-center text-[11px] text-white/20 pb-4">
          All data sourced from your uploaded DMARC report · No data is stored on our servers
        </p>
      </div>
    </div>
  );
}
