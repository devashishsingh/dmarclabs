'use client';

import { BarChart3 } from 'lucide-react';

interface DashboardPromptProps {
  onAccept: () => void;
  onDismiss: () => void;
}

export default function DashboardPrompt({ onAccept, onDismiss }: DashboardPromptProps) {
  return (
    <div className="fixed inset-0 z-40 flex items-end sm:items-center justify-center p-4 sm:p-0">
      {/* Backdrop */}
      <div
        className="absolute inset-0 bg-black/70 backdrop-blur-sm"
        onClick={onDismiss}
        aria-hidden="true"
      />

      {/* Card */}
      <div className="relative w-full sm:max-w-md rounded-2xl border border-white/10 bg-[#0d0d0d] shadow-2xl overflow-hidden animate-in fade-in slide-in-from-bottom-4 duration-300">
        {/* Red glow top */}
        <div
          className="absolute top-0 left-1/2 -translate-x-1/2 w-64 h-24 blur-3xl pointer-events-none"
          style={{ background: 'radial-gradient(circle, #ef233c15, transparent 70%)' }}
          aria-hidden="true"
        />

        <div className="p-6">
          {/* Icon + heading */}
          <div className="flex items-start gap-4 mb-5">
            <div className="w-11 h-11 rounded-xl bg-accent/10 flex items-center justify-center flex-shrink-0">
              <BarChart3 className="h-5 w-5 text-accent" />
            </div>
            <div>
              <h3 className="text-base font-bold font-display text-white">
                Want a full dashboard view?
              </h3>
              <p className="text-sm text-white/50 mt-1 leading-relaxed">
                See pie charts, top-failing IPs, country breakdowns, threat intelligence, and more — all from your report.
              </p>
            </div>
          </div>

          {/* Buttons */}
          <div className="flex flex-col sm:flex-row gap-2.5">
            <button
              onClick={onAccept}
              className="flex-1 flex items-center justify-center gap-2 px-4 py-2.5 rounded-xl bg-accent text-white text-sm font-semibold hover:bg-red-500 transition-colors"
            >
              <BarChart3 className="h-4 w-4" />
              Let&apos;s see
            </button>
            <button
              onClick={onDismiss}
              className="flex-1 px-4 py-2.5 rounded-xl border border-white/10 text-white/50 text-sm hover:text-white hover:border-white/20 transition-colors"
            >
              No, will see later
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
