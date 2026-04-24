'use client';

import { useState } from 'react';
import { useForm } from 'react-hook-form';
import { X, Loader2 } from 'lucide-react';
import { submitAccessRequest } from '@/lib/api';

interface Props {
  initialFileSizeMB?: number;
  onClose: () => void;
}

interface FormValues {
  name: string;
  email: string;
  organization: string;
  fileSizeMB: string;
  useCase: string;
}

const FILE_SIZE_OPTIONS = ['100–250 MB', '250–500 MB', '500 MB – 1 GB', '1 GB+'];

export default function RequestAccessForm({ initialFileSizeMB, onClose }: Props) {
  const [submitting, setSubmitting] = useState(false);
  const [submitted, setSubmitted] = useState(false);
  const [serverError, setServerError] = useState<string | null>(null);

  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<FormValues>({
    defaultValues: {
      fileSizeMB: initialFileSizeMB ? `${Math.ceil(initialFileSizeMB / (1024 * 1024))} MB` : '',
    },
  });

  const onSubmit = async (values: FormValues) => {
    setSubmitting(true);
    setServerError(null);
    try {
      await submitAccessRequest({
        name: values.name,
        email: values.email,
        organization: values.organization,
        fileSize: parseInt(values.fileSizeMB) || 0,
        useCase: values.useCase,
      });
      setSubmitted(true);
    } catch {
      setServerError('Failed to submit request. Please try again.');
    } finally {
      setSubmitting(false);
    }
  };

  return (
    /* Backdrop */
    <div
      className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 p-4"
      role="dialog"
      aria-modal="true"
      aria-labelledby="request-access-title"
    >
      <div className="relative w-full max-w-md rounded-xl bg-card border border-border shadow-2xl">
        {/* Header */}
        <div className="flex items-center justify-between px-6 pt-5 pb-4 border-b border-border">
          <h2 id="request-access-title" className="text-lg font-semibold text-text-primary">
            Request Access
          </h2>
          <button
            onClick={onClose}
            aria-label="Close dialog"
            className="p-1.5 rounded-md text-text-muted hover:text-text-primary hover:bg-border transition-colors"
          >
            <X className="h-5 w-5" />
          </button>
        </div>

        {submitted ? (
          <div className="px-6 py-8 text-center">
            <div className="text-4xl mb-4">✅</div>
            <p className="text-text-primary font-medium">Request received!</p>
            <p className="text-text-muted text-sm mt-2">
              We&apos;ll review your request and email you within 1–2 business days.
            </p>
            <button
              onClick={onClose}
              className="mt-6 px-5 py-2 rounded-md bg-accent text-white text-sm font-medium hover:bg-accent-hover transition-colors"
            >
              Close
            </button>
          </div>
        ) : (
          <form onSubmit={handleSubmit(onSubmit)} className="px-6 py-5 space-y-4" noValidate>
            <p className="text-text-muted text-sm">
              Free tier supports up to 100 MB. Fill out this form to request access for larger files.
            </p>

            {/* Name */}
            <div>
              <label htmlFor="name" className="block text-sm font-medium text-text-primary mb-1">
                Name
              </label>
              <input
                id="name"
                type="text"
                autoComplete="name"
                className={inputClass(!!errors.name)}
                placeholder="Jane Smith"
                {...register('name', { required: 'Name is required', minLength: { value: 2, message: 'Min 2 characters' } })}
              />
              {errors.name && <p className="mt-1 text-xs text-error">{errors.name.message}</p>}
            </div>

            {/* Email */}
            <div>
              <label htmlFor="email" className="block text-sm font-medium text-text-primary mb-1">
                Email
              </label>
              <input
                id="email"
                type="email"
                autoComplete="email"
                className={inputClass(!!errors.email)}
                placeholder="jane@company.com"
                {...register('email', {
                  required: 'Email is required',
                  pattern: { value: /^[^\s@]+@[^\s@]+\.[^\s@]+$/, message: 'Invalid email address' },
                })}
              />
              {errors.email && <p className="mt-1 text-xs text-error">{errors.email.message}</p>}
            </div>

            {/* Organization */}
            <div>
              <label htmlFor="organization" className="block text-sm font-medium text-text-primary mb-1">
                Company / Organization
              </label>
              <input
                id="organization"
                type="text"
                autoComplete="organization"
                className={inputClass(!!errors.organization)}
                placeholder="Acme Corp"
                {...register('organization', { required: 'Organization is required' })}
              />
              {errors.organization && <p className="mt-1 text-xs text-error">{errors.organization.message}</p>}
            </div>

            {/* File size */}
            <div>
              <label htmlFor="fileSizeMB" className="block text-sm font-medium text-text-primary mb-1">
                Approximate File Size
              </label>
              <select
                id="fileSizeMB"
                className={inputClass(!!errors.fileSizeMB)}
                {...register('fileSizeMB', { required: 'Please select a file size range' })}
              >
                <option value="">Select range…</option>
                {FILE_SIZE_OPTIONS.map((opt) => (
                  <option key={opt} value={opt}>
                    {opt}
                  </option>
                ))}
              </select>
              {errors.fileSizeMB && <p className="mt-1 text-xs text-error">{errors.fileSizeMB.message}</p>}
            </div>

            {/* Use case */}
            <div>
              <label htmlFor="useCase" className="block text-sm font-medium text-text-primary mb-1">
                Use Case
              </label>
              <textarea
                id="useCase"
                rows={3}
                className={inputClass(!!errors.useCase)}
                placeholder="Email security audit for our domain infrastructure…"
                {...register('useCase', { required: 'Please describe your use case', minLength: { value: 10, message: 'Min 10 characters' } })}
              />
              {errors.useCase && <p className="mt-1 text-xs text-error">{errors.useCase.message}</p>}
            </div>

            {serverError && (
              <p className="text-sm text-error bg-error/10 border border-error/30 px-3 py-2 rounded-md">
                {serverError}
              </p>
            )}

            <div className="flex gap-3 pt-2">
              <button
                type="button"
                onClick={onClose}
                className="flex-1 px-4 py-2 rounded-md border border-border text-text-muted hover:text-text-primary hover:border-accent/40 text-sm transition-colors"
              >
                Cancel
              </button>
              <button
                type="submit"
                disabled={submitting}
                className="flex-1 flex items-center justify-center gap-2 px-4 py-2 rounded-md bg-accent text-white text-sm font-medium hover:bg-accent-hover disabled:opacity-60 disabled:cursor-not-allowed transition-colors"
              >
                {submitting && <Loader2 className="h-4 w-4 animate-spin" />}
                {submitting ? 'Sending…' : 'Send Request'}
              </button>
            </div>
          </form>
        )}
      </div>
    </div>
  );
}

function inputClass(hasError: boolean) {
  return [
    'w-full rounded-md px-3 py-2 text-sm bg-background border text-text-primary',
    'placeholder:text-text-muted focus:outline-none focus:ring-2 focus:ring-accent/50',
    hasError ? 'border-error' : 'border-border focus:border-accent/60',
  ].join(' ');
}
