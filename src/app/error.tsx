'use client';

import { useEffect } from 'react';
import { AlertCircle, RefreshCw } from 'lucide-react';

export default function GlobalError({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  useEffect(() => {
    console.error('Global error:', error);
  }, [error]);

  return (
    <div className="cyber-grid min-h-[60vh] flex items-center justify-center py-12 px-4">
      <div className="glass-panel max-w-md w-full p-8 md:p-10 text-center border border-red-500/30">
        <AlertCircle className="w-12 h-12 text-red-400 mx-auto mb-4" />
        <h1 className="font-mono text-xl text-red-400 font-bold mb-2">SYSTEM_ERROR</h1>
        <p className="font-sans text-sm text-on-surface-variant mb-6">
          An unexpected error occurred. The system has logged this event.
        </p>
        <button
          onClick={reset}
          className="btn-neon inline-flex items-center gap-2"
        >
          <RefreshCw className="w-4 h-4" />
          RETRY_SYSTEM
        </button>
      </div>
    </div>
  );
}
