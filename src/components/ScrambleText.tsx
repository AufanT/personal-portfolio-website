'use client';

import { useState, useRef, useCallback, useEffect } from 'react';

const CHARS = '!<>-_\\/[]{}—=+*^?#@$%&';

export default function ScrambleText({
  children,
  className = '',
}: {
  children: string;
  className?: string;
}) {
  const [displayText, setDisplayText] = useState(children);
  const intervalRef = useRef<ReturnType<typeof setInterval> | null>(null);

  const scramble = useCallback(() => {
    if (intervalRef.current) clearInterval(intervalRef.current);

    let frame = 0;
    const totalFrames = 15;

    intervalRef.current = setInterval(() => {
      frame++;
      const progress = frame / totalFrames;

      if (progress >= 1) {
        setDisplayText(children);
        if (intervalRef.current) clearInterval(intervalRef.current);
        intervalRef.current = null;
        return;
      }

      const settledCount = Math.floor(progress * children.length);
      let result = '';
      for (let i = 0; i < children.length; i++) {
        if (i < settledCount) {
          result += children[i];
        } else {
          result += CHARS[Math.floor(Math.random() * CHARS.length)];
        }
      }
      setDisplayText(result);
    }, 33);
  }, [children]);

  const stop = useCallback(() => {
    if (intervalRef.current) {
      clearInterval(intervalRef.current);
      intervalRef.current = null;
    }
    setDisplayText(children);
  }, [children]);

  useEffect(() => {
    return () => {
      if (intervalRef.current) clearInterval(intervalRef.current);
    };
  }, []);

  return (
    <span
      className={className}
      onMouseEnter={scramble}
      onMouseLeave={stop}
      aria-label={children}
    >
      {displayText}
    </span>
  );
}
