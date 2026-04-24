'use client';

import { useState } from 'react';
import { Send, Github, Twitter } from 'lucide-react';

const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8080';

export default function ContactPage() {
  const [form, setForm] = useState({ name: '', subject: '', message: '' });
  const [status, setStatus] = useState<'idle' | 'sending' | 'sent' | 'error'>('idle');
  const [errorMessage, setErrorMessage] = useState<string>('Something went wrong. Please try again.');

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setStatus('sending');
    try {
      const res = await fetch(`${API_URL}/api/contact`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(form),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.message || 'Send failed');
      setStatus('sent');
    } catch (err: unknown) {
      setErrorMessage(err instanceof Error ? err.message : 'Something went wrong. Please try again.');
      setStatus('error');
    }
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
    setForm((prev) => ({ ...prev, [e.target.name]: e.target.value }));
  };

  return (
    <div className="w-full max-w-3xl mx-auto px-6 pt-36 pb-20">
      {/* Header */}
      <div className="mb-10 space-y-3">
        <span className="inline-flex items-center gap-2 text-[11px] font-medium text-text-muted border border-white/10 rounded-full px-3 py-1 bg-white/[0.03]">
          <span className="w-2 h-2 bg-accent rotate-45 inline-block flex-shrink-0" style={{ boxShadow: '0 0 6px #ef233c' }} />
          We usually respond within 1–2 business days
        </span>
        <h1 className="text-4xl font-bold font-display text-text-primary tracking-tight">
          Get in touch
        </h1>
        <p className="text-text-muted text-base max-w-lg leading-relaxed">
          Have a question, found a bug, or want to discuss DMARC at scale? We&apos;d love to hear from you.
        </p>
      </div>

      <div className="grid md:grid-cols-5 gap-8">
        {/* Contact methods */}
        <aside className="md:col-span-2 space-y-4">
          <div className="rounded-2xl border border-white/10 bg-card p-5 space-y-4">
            <h2 className="text-sm font-semibold font-display text-text-primary">Other ways to reach us</h2>
            <div className="space-y-3">
              <a
                href="https://github.com"
                target="_blank"
                rel="noopener noreferrer"
                className="flex items-center gap-3 text-sm text-text-muted hover:text-accent transition-colors group"
              >
                <span className="w-8 h-8 rounded-full bg-accent/10 flex items-center justify-center text-accent group-hover:bg-accent/20 transition-colors flex-shrink-0">
                  <Github className="h-3.5 w-3.5" />
                </span>
                GitHub Issues
              </a>
              <a
                href="https://twitter.com"
                target="_blank"
                rel="noopener noreferrer"
                className="flex items-center gap-3 text-sm text-text-muted hover:text-accent transition-colors group"
              >
                <span className="w-8 h-8 rounded-full bg-accent/10 flex items-center justify-center text-accent group-hover:bg-accent/20 transition-colors flex-shrink-0">
                  <Twitter className="h-3.5 w-3.5" />
                </span>
                @dmarcLabs
              </a>
            </div>
          </div>

          <div className="rounded-2xl border border-white/10 bg-card p-5 space-y-2">
            <h2 className="text-sm font-semibold font-display text-text-primary">Response time</h2>
            <p className="text-xs text-text-muted leading-relaxed">
              General enquiries: 1–2 business days<br />
              Bug reports: same day<br />
              Access requests: within 24 hours<br />
              GDPR / privacy: within 5 business days
            </p>
          </div>
        </aside>

        {/* Form */}
        <div className="md:col-span-3">
          {status === 'sent' ? (
            <div className="rounded-2xl border border-success/30 bg-success/5 p-8 text-center space-y-3">
              <div className="w-12 h-12 rounded-full bg-success/10 flex items-center justify-center text-success mx-auto">
                <Send className="h-5 w-5" />
              </div>
              <h2 className="text-lg font-semibold font-display text-text-primary">Message sent!</h2>
              <p className="text-text-muted text-sm">
                Thanks for reaching out. We&apos;ll get back to you as soon as possible.
              </p>
            </div>
          ) : (
            <form
              onSubmit={handleSubmit}
              className="rounded-2xl border border-white/10 bg-card p-6 space-y-5"
              noValidate
            >
              <Field label="Name" required>
                <input
                  type="text"
                  name="name"
                  value={form.name}
                  onChange={handleChange}
                  required
                  placeholder="Your name"
                  className="input-field"
                />
              </Field>

              <Field label="Subject" required>
                <select
                  name="subject"
                  value={form.subject}
                  onChange={handleChange}
                  required
                  className="input-field"
                >
                  <option value="" disabled>Select a topic…</option>
                  <option value="bug">Bug report</option>
                  <option value="feature">Feature request</option>
                  <option value="access">Higher file size limits</option>
                  <option value="privacy">Privacy / GDPR enquiry</option>
                  <option value="general">General question</option>
                  <option value="other">Other</option>
                </select>
              </Field>

              <Field label="Message" required>
                <textarea
                  name="message"
                  value={form.message}
                  onChange={handleChange}
                  required
                  rows={5}
                  placeholder="Tell us more…"
                  className="input-field resize-none"
                />
              </Field>

              {status === 'error' && (
                <p role="alert" className="text-error text-sm rounded-lg bg-error/10 border border-error/30 px-4 py-3">
                  {errorMessage}
                </p>
              )}

              <button
                type="submit"
                disabled={status === 'sending'}
                className="w-full flex items-center justify-center gap-2 px-6 py-3 rounded-full bg-accent text-white text-sm font-semibold hover:bg-accent-hover transition-all active:scale-95 disabled:opacity-60 disabled:cursor-not-allowed"
                style={{ boxShadow: '0 0 20px rgba(239,35,60,0.25)' }}
              >
                <Send className="h-4 w-4" aria-hidden="true" />
                {status === 'sending' ? 'Sending…' : 'Send message'}
              </button>

              <p className="text-[11px] text-text-muted text-center">
                By submitting this form you agree to our{' '}
                <a href="/privacy" className="text-accent hover:underline">Privacy Policy</a>.
              </p>
            </form>
          )}
        </div>
      </div>
    </div>
  );
}

function Field({ label, required, children }: { label: string; required?: boolean; children: React.ReactNode }) {
  return (
    <label className="block space-y-1.5">
      <span className="text-xs font-medium text-text-secondary">
        {label}{required && <span className="text-accent ml-0.5">*</span>}
      </span>
      {children}
    </label>
  );
}
