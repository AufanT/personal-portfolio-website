'use client';

import { ReactNode } from 'react';
import BackgroundRippleEffect from '@/components/ui/BackgroundRippleEffect';

export default function RippleSection({
  children,
  className = '',
}: {
  children: ReactNode;
  className?: string;
}) {
  return (
    <div className={`relative overflow-hidden w-full pb-6 md:pb-8 ${className}`}>
      <BackgroundRippleEffect onCellClick={() => window.dispatchEvent(new CustomEvent('music:hero-play'))} />
      <div className="relative z-10 w-fit ml-margin-mobile md:ml-margin-desktop">
        {children}
      </div>
    </div>
  );
}
