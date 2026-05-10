'use client';

import { useState } from 'react';
import { CheckCircle2, AlertTriangle, XCircle, type LucideIcon } from 'lucide-react';
import { submitFeedback } from '@/lib/api';

interface FeedbackProps {
  sessionId: string;
}

type Sentiment = 'positive' | 'neutral' | 'negative';

const EMOJI_OPTIONS: {
  sentiment: Sentiment;
  Icon: LucideIcon;
  iconClass: string;
  label: string;
}[] = [
  { sentiment: 'positive', Icon: CheckCircle2, iconClass: 'text-success', label: 'Great' },
  { sentiment: 'neutral', Icon: AlertTriangle, iconClass: 'text-warning', label: 'OK' },
  { sentiment: 'negative', Icon: XCircle, iconClass: 'text-error', label: 'Poor' },
];

const PLACEHOLDER: Record<Sentiment, string> = {
  positive: 'What did you like? (optional)',
  neutral: 'What could be improved? (optional)',
  negative: 'What went wrong? Your feedback helps us improve.',
};

export default function Feedback({ sessionId }: FeedbackProps) {
  const [selected, setSelected] = useState<Sentiment | null>(null);
  const [message, setMessage] = useState('');
  const [submitted, setSubmitted] = useState(false);
  const [submitting, setSubmitting] = useState(false);

  if (submitted) {
    return (
      <p className="text-text-muted text-sm text-center py-2">
        Thanks for the feedback!
      </p>
    );
  }

  const handleSelect = (sentiment: Sentiment) => {
    setSelected(sentiment);
    setMessage('');
  };

  const handleSubmit = async () => {
    if (!selected) return;
    setSubmitting(true);
    try {
      await submitFeedback(selected, message, sessionId);
    } catch {
      // Non-critical — silent failure
    } finally {
      setSubmitted(true);
      setSubmitting(false);
    }
  };

  return (
    <div className="flex flex-col items-center gap-4 py-2">
      <p className="text-text-muted text-sm">How was your experience?</p>

      <div className="flex gap-4" role="group" aria-label="Feedback rating">
        {EMOJI_OPTIONS.map(({ sentiment, Icon, iconClass, label }) => (
          <button
            key={sentiment}
            onClick={() => handleSelect(sentiment)}
            aria-label={label}
            aria-pressed={selected === sentiment}
            className={[
              'flex flex-col items-center gap-1 p-3 rounded-lg border transition-all min-w-[64px]',
              selected === sentiment
                ? 'border-accent bg-accent/10 scale-105'
                : 'border-border hover:border-accent/50 hover:bg-card',
            ].join(' ')}
          >
            <Icon className={`h-7 w-7 ${iconClass}`} aria-hidden />
            <span className="text-xs text-text-muted">{label}</span>
          </button>
        ))}
      </div>

      {selected && (
        <div className="w-full max-w-md space-y-3">
          <textarea
            rows={3}
            value={message}
            onChange={(e) => setMessage(e.target.value)}
            placeholder={PLACEHOLDER[selected]}
            className="w-full rounded-md px-3 py-2 text-sm bg-background border border-border text-text-primary placeholder:text-text-muted focus:outline-none focus:ring-2 focus:ring-accent/50 focus:border-accent/60 resize-none"
            aria-label="Feedback message"
          />
          <button
            onClick={handleSubmit}
            disabled={submitting}
            className="w-full px-4 py-2 rounded-md bg-accent text-white text-sm font-medium hover:bg-accent-hover disabled:opacity-60 transition-colors"
          >
            {submitting ? 'Sending…' : 'Submit Feedback'}
          </button>
        </div>
      )}
    </div>
  );
}
