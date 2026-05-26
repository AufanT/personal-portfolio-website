import { Terminal } from 'lucide-react';

export default function LoadingPage() {
  return (
    <div className="min-h-[60vh] flex items-center justify-center">
      <div className="flex flex-col items-center gap-4 font-mono text-sm text-on-surface-variant">
        <Terminal className="w-8 h-8 text-primary-container animate-pulse" />
        <span>LOADING_SYSTEM...</span>
      </div>
    </div>
  );
}
