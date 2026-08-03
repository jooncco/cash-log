import { useEffect } from 'react';
import { AlertCircle, AlertTriangle, CheckCircle, Info, X } from 'lucide-react';
import { useUIStore } from '../lib/stores/uiStore';
import type { Toast } from '../types';

const DEFAULT_DURATION_MS = 4000;

const TOAST_STYLES: Record<Toast['type'], string> = {
  success:
    'border-green-500 bg-green-50 text-green-800 dark:border-green-500/50 dark:bg-green-900/30 dark:text-green-300',
  error:
    'border-red-500 bg-red-50 text-red-800 dark:border-red-500/50 dark:bg-red-900/30 dark:text-red-300',
  warning:
    'border-yellow-500 bg-yellow-50 text-yellow-800 dark:border-yellow-500/50 dark:bg-yellow-900/30 dark:text-yellow-300',
  info: 'border-blue-500 bg-blue-50 text-blue-800 dark:border-blue-500/50 dark:bg-blue-900/30 dark:text-blue-300',
};

const TOAST_ICONS: Record<Toast['type'], typeof CheckCircle> = {
  success: CheckCircle,
  error: AlertCircle,
  warning: AlertTriangle,
  info: Info,
};

function ToastItem({ toast }: { toast: Toast }) {
  const removeToast = useUIStore((s) => s.removeToast);

  useEffect(() => {
    const timer = setTimeout(() => removeToast(toast.id), toast.duration ?? DEFAULT_DURATION_MS);
    return () => clearTimeout(timer);
  }, [toast.id, toast.duration, removeToast]);

  const Icon = TOAST_ICONS[toast.type];

  return (
    <div
      role="alert"
      className={`flex w-80 items-start gap-3 rounded-xl2 border px-4 py-3 shadow-elevate-lg animate-slide-in-right dark:shadow-elevate-lg-dark ${TOAST_STYLES[toast.type]}`}
      data-testid={`toast-${toast.type}`}
    >
      <Icon size={18} className="mt-0.5 shrink-0" />
      <p className="flex-1 text-sm leading-snug">{toast.message}</p>
      <button
        onClick={() => removeToast(toast.id)}
        className="shrink-0 rounded-md p-0.5 opacity-60 transition-opacity hover:opacity-100"
        aria-label="Close"
        data-testid={`toast-close-${toast.id}`}
      >
        <X size={16} />
      </button>
    </div>
  );
}

export function ToastContainer() {
  const toasts = useUIStore((s) => s.toasts);

  if (toasts.length === 0) return null;

  return (
    <div
      className="pointer-events-none fixed bottom-4 right-4 z-[100] flex flex-col gap-2"
      data-testid="toast-container"
    >
      {toasts.map((toast) => (
        <div key={toast.id} className="pointer-events-auto">
          <ToastItem toast={toast} />
        </div>
      ))}
    </div>
  );
}
