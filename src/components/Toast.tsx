'use client';

import { useState, useCallback } from 'react';
import { Terminal } from 'lucide-react';

type ToastType = 'success' | 'error' | 'info';

interface ToastState {
  message: string;
  type: ToastType;
}

export function useToast() {
  const [toast, setToast] = useState<ToastState | null>(null);

  const showToast = useCallback((message: string, type: ToastType = 'info') => {
    setToast({ message, type });
    setTimeout(() => setToast(null), 4500);
  }, []);

  return { toast, showToast, setToast };
}

export function ToastComponent({ toast, onClose }: { toast: ToastState; onClose: () => void }) {
  return (
    <div className="fixed top-6 right-6 z-50">
      <div className={`glass-panel p-4 border rounded-xl shadow-2xl flex items-center gap-3 min-w-[280px] max-w-sm backdrop-blur-xl ${
        toast.type === 'success'
          ? 'border-primary-container bg-background/90 shadow-[0_0_15px_rgba(57,255,20,0.25)] text-primary-container'
          : toast.type === 'error'
          ? 'border-red-500 bg-background/90 shadow-[0_0_15px_rgba(239,68,68,0.25)] text-red-400'
          : 'border-outline-variant bg-background/90 text-on-surface'
      }`}>
        <Terminal className="w-5 h-5 animate-pulse text-primary-container flex-shrink-0" />
        <div className="flex-grow font-mono text-xs">
          <span className={`font-bold uppercase tracking-wider block text-[10px] opacity-70 mb-0.5 ${
            toast.type === 'success' ? 'text-primary-container' : toast.type === 'error' ? 'text-red-400' : 'text-on-surface-variant'
          }`}>
            {toast.type === 'success' ? 'SYSTEM_SUCCESS' : toast.type === 'error' ? 'SYSTEM_ERROR' : 'SYSTEM_INFO'}
          </span>
          <p className="text-white">{toast.message}</p>
        </div>
        <button type="button" onClick={onClose} className="text-on-surface-variant hover:text-white font-bold font-mono text-xs p-1">[X]</button>
      </div>
    </div>
  );
}
