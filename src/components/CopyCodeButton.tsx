'use client';

import { useState } from 'react';
import { Check, Copy } from 'lucide-react';

export default function CopyCodeButton({ code }: { code: string }) {
  const [copied, setCopied] = useState(false);

  const copy = async () => {
    try {
      await navigator.clipboard.writeText(code);
      setCopied(true);
      setTimeout(() => setCopied(false), 1500);
    } catch {
      // Clipboard API butuh HTTPS atau localhost; kalau ditolak, diam saja.
    }
  };

  return (
    <button
      type="button"
      onClick={copy}
      title={copied ? 'Tersalin' : 'Salin kode'}
      aria-label={copied ? 'Tersalin' : 'Salin kode'}
      className="code-window-copy"
    >
      {copied ? <Check className="w-3.5 h-3.5" /> : <Copy className="w-3.5 h-3.5" />}
    </button>
  );
}
