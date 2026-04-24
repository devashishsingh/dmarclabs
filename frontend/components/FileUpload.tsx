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
            XML &mdash; up to 200 MB
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
      </p>
    </div>
  );
}
