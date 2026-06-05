'use client';

import { useCallback, useRef } from 'react';

interface CodeTextareaProps {
  value: string;
  onChange: (value: string) => void;
  placeholder?: string;
  className?: string;
  minHeight?: string;
}

/**
 * A <textarea> that behaves like a minimal code editor:
 *  - Tab          → insert 2 spaces (no focus jump)
 *  - Shift+Tab    → remove up-to-2 leading spaces from the current line
 *  - Enter        → auto-indent to match the current line's leading whitespace
 *  - Paste        → preserved as-is (browsers already handle this, but we
 *                   normalise CRLF → LF so it looks consistent)
 */
export default function CodeTextarea({
  value,
  onChange,
  placeholder,
  className = '',
  minHeight = '100px',
}: CodeTextareaProps) {
  const ref = useRef<HTMLTextAreaElement>(null);

  const handleKeyDown = useCallback(
    (e: React.KeyboardEvent<HTMLTextAreaElement>) => {
      const ta = e.currentTarget;
      const { selectionStart: start, selectionEnd: end, value: v } = ta;

      // ── Tab ──────────────────────────────────────────────────────────────
      if (e.key === 'Tab') {
        e.preventDefault();
        const INDENT = '  '; // 2 spaces

        if (!e.shiftKey) {
          // Insert indent at cursor / replace selection
          const next = v.substring(0, start) + INDENT + v.substring(end);
          onChange(next);
          // Restore cursor after indent
          requestAnimationFrame(() => {
            ta.selectionStart = ta.selectionEnd = start + INDENT.length;
          });
        } else {
          // Shift+Tab: remove up to 2 leading spaces from the current line
          const lineStart = v.lastIndexOf('\n', start - 1) + 1;
          const lineText = v.substring(lineStart);
          const stripped = lineText.replace(/^  /, ''); // remove max 2 spaces
          const removed = lineText.length - stripped.length;
          if (removed > 0) {
            const next = v.substring(0, lineStart) + stripped;
            onChange(next);
            requestAnimationFrame(() => {
              ta.selectionStart = ta.selectionEnd = Math.max(lineStart, start - removed);
            });
          }
        }
        return;
      }

      // ── Enter — auto-indent ────────────────────────────────────────────
      if (e.key === 'Enter') {
        e.preventDefault();
        // Detect leading whitespace of current line
        const lineStart = v.lastIndexOf('\n', start - 1) + 1;
        const currentLine = v.substring(lineStart, start);
        const leadingWS = currentLine.match(/^(\s*)/)?.[1] ?? '';
        const insert = '\n' + leadingWS;
        const next = v.substring(0, start) + insert + v.substring(end);
        onChange(next);
        requestAnimationFrame(() => {
          ta.selectionStart = ta.selectionEnd = start + insert.length;
        });
        return;
      }
    },
    [onChange]
  );

  const handlePaste = useCallback(
    (e: React.ClipboardEvent<HTMLTextAreaElement>) => {
      // Normalise line endings so CRLF from Windows clips don't cause issues
      const raw = e.clipboardData.getData('text');
      if (!raw.includes('\r')) return; // nothing to normalise
      e.preventDefault();
      const ta = e.currentTarget;
      const { selectionStart: start, selectionEnd: end, value: v } = ta;
      const normalised = raw.replace(/\r\n/g, '\n').replace(/\r/g, '\n');
      const next = v.substring(0, start) + normalised + v.substring(end);
      onChange(next);
      requestAnimationFrame(() => {
        ta.selectionStart = ta.selectionEnd = start + normalised.length;
      });
    },
    [onChange]
  );

  return (
    <textarea
      ref={ref}
      value={value}
      onChange={(e) => onChange(e.target.value)}
      onKeyDown={handleKeyDown}
      onPaste={handlePaste}
      placeholder={placeholder}
      spellCheck={false}
      autoCorrect="off"
      autoCapitalize="off"
      style={{ minHeight, tabSize: 2 }}
      className={`command-input text-xs font-mono whitespace-pre ${className}`}
    />
  );
}
