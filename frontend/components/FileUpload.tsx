'use client';

import { useRef, useState, useCallback } from 'react';
import { Upload, FileText, AlertCircle } from 'lucide-react';
import { formatBytes, validateDMARCFile } from '@/lib/utils';

interface FileUploadProps {
  onFileAccepted: (file: File) => void;
  onFileTooLarge: (file: File) => void;
  disabled?: boolean;
}

export default function FileUpload({ onFileAccepted, onFileTooLarge, disabled }: FileUploadProps) {
  const inputRef = useRef<HTMLInputElement>(null);
  const [isDragging, setIsDragging] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleFile = useCallback(
    (file: File) => {
      setError(null);
      const validationError = validateDMARCFile(file);
      if (validationError === 'FILE_TOO_LARGE') {
        onFileTooLarge(file);
        return;
      }
      if (validationError) {
        setError(validationError);
        return;
      }
      onFileAccepted(file);
    },
    [onFileAccepted, onFileTooLarge]
  );

  const onDrop = useCallback(
    (e: React.DragEvent<HTMLDivElement>) => {
      e.preventDefault();
      setIsDragging(false);
      if (disabled) return;
      const file = e.dataTransfer.files[0];
      if (file) handleFile(file);
    },
    [disabled, handleFile]
  );

  const onDragOver = (e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    if (!disabled) setIsDragging(true);
  };

  const onDragLeave = () => setIsDragging(false);

  const onInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) handleFile(file);
    // Reset input so the same file can be re-selected
    e.target.value = '';
  };

  return (
    <div className="w-full">
      <div
        role="button"
        aria-label="Upload DMARC report file"
        tabIndex={disabled ? -1 : 0}
        onDrop={onDrop}
        onDragOver={onDragOver}
        onDragLeave={onDragLeave}
        onClick={() => !disabled && inputRef.current?.click()}
        onKeyDown={(e) => {
          if ((e.key === 'Enter' || e.key === ' ') && !disabled) {
            inputRef.current?.click();
          }
        }}
        className={[
          'group relative flex flex-col items-center justify-center gap-4',
          'min-h-[260px] w-full rounded-xl border-2 border-dashed',
          'transition-all duration-300 cursor-pointer select-none',
          disabled
            ? 'border-white/5 opacity-50 cursor-not-allowed'
            : isDragging
            ? 'border-accent bg-accent/5'
            : 'border-white/8 hover:border-accent/60 hover:bg-accent/[0.02]',
        ].join(' ')}
      >
        <input
          ref={inputRef}
          type="file"
          accept=".xml"
          className="sr-only"
          onChange={onInputChange}
          disabled={disabled}
          aria-hidden="true"
        />

        <div className="flex flex-col items-center gap-4 px-6 text-center">
          <div className="w-16 h-16 rounded-full bg-accent/10 flex items-center justify-center text-accent transition-transform duration-300 group-hover:scale-110">
            {isDragging ? (
              <FileText className="h-7 w-7" aria-hidden="true" />
            ) : (
              <Upload className="h-7 w-7" aria-hidden="true" />
            )}
          </div>

          <div>
            <p className="text-text-primary font-semibold text-lg font-display">
              {isDragging ? 'Drop your file here' : 'Drag and drop your DMARC XML report'}
            </p>
            <p className="text-text-muted text-sm mt-1">
              or <span className="text-accent font-medium">click to browse</span> from device
            </p>
          </div>

          <button
            type="button"
            disabled={disabled}
            aria-hidden="true"
            tabIndex={-1}
            className="mt-1 px-6 py-2.5 rounded-full bg-accent text-white text-sm font-semibold hover:bg-accent-hover transition-all active:scale-95 pointer-events-none"
            style={{ boxShadow: '0 0 20px rgba(239,35,60,0.3)' }}
          >
            Browse files
          </button>

          <p className="mt-2 text-text-muted text-[10px] font-mono uppercase tracking-[0.2em]">
            XML &mdash; up to 100 MB
          </p>
        </div>
      </div>

      {error && (
        <div
          role="alert"
          className="mt-3 flex items-center gap-2 rounded-md bg-error/10 border border-error/30 px-4 py-3 text-error text-sm"
        >
          <AlertCircle className="h-4 w-4 shrink-0" aria-hidden="true" />
          {error}
        </div>
      )}

      <p className="my-4 text-center text-text-muted text-xs flex items-center justify-center gap-2">
        <span className="text-accent text-sm" aria-hidden="true">✓</span>
        Privacy-first. Files are never stored on our servers.
        <span className="relative group inline-flex items-center">
          <button
            type="button"
            className="text-accent/70 hover:text-accent underline underline-offset-2 decoration-dotted transition-colors cursor-default focus:outline-none"
            aria-label="Learn how privacy works"
          >
            learn how?
          </button>
          {/* Tooltip */}
          <span
            role="tooltip"
            className="pointer-events-none absolute bottom-full left-1/2 -translate-x-1/2 mb-2 w-72 rounded-lg border border-white/10 bg-[#0d0d0d] px-4 py-3 text-left text-xs text-text-muted shadow-xl
              opacity-0 scale-95 group-hover:opacity-100 group-hover:scale-100 transition-all duration-150 origin-bottom z-50"
          >
            <span className="block font-semibold text-text-primary mb-1.5">How your privacy is protected</span>
            When you upload a file, it is written to the server&apos;s ephemeral RAM — never to any disk, database, or object storage. The file buffer is passed directly to the XML parser in memory, and the raw bytes are discarded immediately after parsing completes. Parsed results are stored in a Node.js <code className="text-accent/80">Map</code> keyed to a randomly generated session ID, and are evicted automatically after 1 hour via a TTL timer. No file content, IP address, or personal data is logged or persisted. When you click &quot;Delete data&quot;, or when the session expires, the entry is removed from the Map and becomes unreachable — there is no recovery path, no backup, and no third-party service that received the data.
          </span>
        </span>
      </p>
    </div>
  );
}
