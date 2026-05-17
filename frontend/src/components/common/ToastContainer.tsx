import { useContext, useEffect, useState } from 'react';
import { ToastContext } from '../../context/ToastContext';
import type { Toast } from '../../context/ToastContext';

const TOAST_STYLES: Record<Toast['type'], string> = {
  success: 'bg-emerald-600 border-emerald-700',
  error: 'bg-red-600 border-red-700',
  info: 'bg-blue-600 border-blue-700',
};

interface ToastItemProps {
  toast: Toast;
  onDismiss: (id: number) => void;
}

const ToastItem = ({ toast, onDismiss }: ToastItemProps) => {
  const [visible, setVisible] = useState(false);

  useEffect(() => {
    const handle = requestAnimationFrame(() => setVisible(true));
    return () => cancelAnimationFrame(handle);
  }, []);

  return (
    <div
      role="status"
      className={`flex items-start justify-between gap-3 px-4 py-3 rounded-lg shadow-lg border text-white transition-opacity duration-300 ${
        TOAST_STYLES[toast.type]
      } ${visible ? 'opacity-100' : 'opacity-0'}`}
    >
      <span className="text-sm font-medium leading-snug flex-1">{toast.message}</span>
      <button
        type="button"
        onClick={() => onDismiss(toast.id)}
        aria-label="Close notification"
        className="flex-shrink-0 text-white/80 hover:text-white transition-colors"
      >
        <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
        </svg>
      </button>
    </div>
  );
};

const ToastContainer = () => {
  const ctx = useContext(ToastContext);
  if (!ctx) return null;

  return (
    <div
      aria-live="polite"
      aria-atomic="true"
      className="fixed bottom-6 right-6 z-[100] flex flex-col gap-3 max-w-sm w-80 pointer-events-none"
    >
      {ctx.toasts.map((toast) => (
        <div key={toast.id} className="pointer-events-auto">
          <ToastItem toast={toast} onDismiss={ctx.dismissToast} />
        </div>
      ))}
    </div>
  );
};

export default ToastContainer;
