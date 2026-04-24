import { useCallback, useRef, useState } from 'react';
import type { ToastMessage, ToastVariant } from '@/components/Toast';

export function useToast() {
  const [toasts, setToasts] = useState<ToastMessage[]>([]);
  const counter = useRef(0);

  const push = useCallback(
    (opts: Omit<ToastMessage, 'id'>) => {
      const id = `toast-${++counter.current}`;
      setToasts((prev) => [...prev, { ...opts, id }]);
      return id;
    },
    []
  );

  const dismiss = useCallback((id: string) => {
    setToasts((prev) => prev.filter((t) => t.id !== id));
  }, []);

  /** Shorthand helpers */
  const info = useCallback(
    (title: string, description?: string, duration?: number) =>
      push({ variant: 'info' as ToastVariant, title, description, duration }),
    [push]
  );

  const success = useCallback(
    (title: string, description?: string, duration?: number) =>
      push({ variant: 'success' as ToastVariant, title, description, duration }),
    [push]
  );

  const warning = useCallback(
    (title: string, description?: string, duration?: number) =>
      push({ variant: 'warning' as ToastVariant, title, description, duration }),
    [push]
  );

  const purge = useCallback(
    (title: string, description?: string, duration?: number) =>
      push({ variant: 'purge' as ToastVariant, title, description, duration }),
    [push]
  );

  return { toasts, push, dismiss, info, success, warning, purge };
}
