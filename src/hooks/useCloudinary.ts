'use client';

import { useState, useEffect, useRef, useCallback } from 'react';

let loadPromise: Promise<void> | null = null;

function loadSDK(): Promise<void> {
  if (loadPromise) return loadPromise;

  loadPromise = new Promise((resolve, reject) => {
    if (typeof window !== 'undefined' && (window as any).cloudinary?.createUploadWidget) {
      resolve();
      return;
    }

    const existing = document.querySelector<HTMLScriptElement>(
      'script[src*="upload-widget.cloudinary"]',
    );
    if (existing) {
      existing.addEventListener('load', () => resolve());
      existing.addEventListener('error', () => {
        loadPromise = null;
        reject(new Error('Failed to load Cloudinary SDK'));
      });
      return;
    }

    const script = document.createElement('script');
    script.src = 'https://upload-widget.cloudinary.com/global/all.js';
    script.async = true;
    script.onload = () => resolve();
    script.onerror = () => {
      loadPromise = null;
      reject(new Error('Failed to load Cloudinary SDK'));
    };
    document.body.appendChild(script);
  });

  return loadPromise;
}

const widgetConfig = {
  cloudName: 'djzg0k2g9',
  uploadPreset: 'blog_uploads',
  sources: ['local', 'url', 'camera'] as string[],
  multiple: false,
  maxFileSize: 5_000_000,
  clientAllowedFormats: ['jpg', 'jpeg', 'png', 'gif', 'webp'],
};

export type UploadStatus = 'idle' | 'loading' | 'ready' | 'error';

export function useCloudinary() {
  const [status, setStatus] = useState<UploadStatus>('idle');
  const cbRef = useRef<((url: string) => void) | null>(null);

  useEffect(() => {
    setStatus('loading');
    loadSDK()
      .then(() => setStatus('ready'))
      .catch(() => setStatus('error'));
  }, []);

  const openWidget = useCallback(
    (onSuccess: (url: string) => void) => {
      if (status !== 'ready') return;
      cbRef.current = onSuccess;

      const widget = (window as any).cloudinary.createUploadWidget(
        widgetConfig,
        (error: any, result: any) => {
          if (!error && result?.event === 'success') {
            cbRef.current?.(result.info.secure_url);
          }
        },
      );
      widget.open();
    },
    [status],
  );

  return { status, openWidget } as const;
}
