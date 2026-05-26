'use client';

import { motion, AnimatePresence } from 'framer-motion';
import { useCloudinary } from '@/hooks/useCloudinary';
import { useToast } from '@/components/Toast';
import { Loader2, Upload, X, ImageIcon } from 'lucide-react';

interface ImageUploadProps {
  value: string;
  onChange: (url: string) => void;
  onRemove?: () => void;
  label?: string;
  className?: string;
}

export default function ImageUpload({
  value,
  onChange,
  onRemove,
  label = 'Upload Image',
  className = '',
}: ImageUploadProps) {
  const { status, openWidget } = useCloudinary();
  const { showToast } = useToast();
  const isBusy = status === 'loading';

  const handleUpload = () => {
    if (status === 'error') {
      showToast('Gagal memuat SDK Cloudinary. Muat ulang halaman.', 'error');
      return;
    }
    openWidget((url) => {
      onChange(url);
      showToast('Gambar berhasil diunggah', 'success');
    });
  };

  const handleRemove = () => {
    if (onRemove) onRemove();
    else onChange('');
  };

  return (
    <div className={`space-y-1 ${className}`}>
      <AnimatePresence mode="wait">
        {value ? (
          <motion.div
            key="preview"
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 0.95 }}
            transition={{ duration: 0.25, ease: 'easeOut' }}
            className="relative rounded-lg overflow-hidden border border-outline-variant/30 group"
          >
            <img
              src={value}
              alt="Preview"
              className="w-full h-40 object-cover"
            />
            <div className="absolute inset-0 bg-black/0 group-hover:bg-black/50 transition-all duration-200 flex items-center justify-center gap-3 opacity-0 group-hover:opacity-100">
              <button
                type="button"
                onClick={handleUpload}
                disabled={isBusy}
                className="p-2 bg-background/80 backdrop-blur-sm rounded-full text-primary-container hover:bg-background transition-colors disabled:opacity-50"
                title="Ganti gambar"
              >
                <Upload className="w-4 h-4" />
              </button>
              <button
                type="button"
                onClick={handleRemove}
                className="p-2 bg-background/80 backdrop-blur-sm rounded-full text-red-400 hover:bg-background transition-colors"
                title="Hapus gambar"
              >
                <X className="w-4 h-4" />
              </button>
            </div>
          </motion.div>
        ) : (
          <motion.button
            key="upload"
            type="button"
            onClick={handleUpload}
            disabled={isBusy}
            initial={{ opacity: 0, y: 8 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -8 }}
            transition={{ duration: 0.2, ease: 'easeOut' }}
            className="w-full h-32 flex flex-col items-center justify-center gap-2 rounded-lg border-2 border-dashed border-outline-variant/30 hover:border-primary-container/50 transition-colors duration-200 bg-surface-container/30 hover:bg-surface-container/50 disabled:opacity-50 disabled:cursor-not-allowed cursor-pointer"
          >
            {isBusy ? (
              <>
                <Loader2 className="w-5 h-5 text-primary-container animate-spin" />
                <span className="font-mono text-xs text-on-surface-variant">
                  Memuat SDK...
                </span>
              </>
            ) : (
              <>
                <ImageIcon className="w-6 h-6 text-on-surface-variant" />
                <span className="font-mono text-xs text-on-surface-variant">
                  {label}
                </span>
              </>
            )}
          </motion.button>
        )}
      </AnimatePresence>
    </div>
  );
}
