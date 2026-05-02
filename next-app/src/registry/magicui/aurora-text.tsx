'use client';

import type { CSSProperties } from 'react';
import React, { memo } from 'react';
import { cn } from '@/lib/utils';

export interface AuroraTextProps {
  children: React.ReactNode;
  className?: string;
  /** CSS color stops for the animated gradient (loops back to first). */
  colors?: string[];
  /** Higher = faster aurora motion. */
  speed?: number;
}

export const AuroraText = memo(function AuroraText({
  children,
  className,
  colors = ['#fffef0', '#fff9c4', '#fde047', '#fbbf24', '#ca8a04'],
  speed = 1,
}: AuroraTextProps) {
  const gradientStyle: CSSProperties = {
    backgroundImage: `linear-gradient(135deg, ${colors.join(', ')}, ${colors[0]})`,
    WebkitBackgroundClip: 'text',
    WebkitTextFillColor: 'transparent',
    backgroundClip: 'text',
    backgroundSize: '200% auto',
    backgroundPosition: '0% 50%',
    backgroundRepeat: 'no-repeat',
    animationDuration: `${10 / speed}s`,
  };

  return (
    <span className={cn('relative inline-block', className)}>
      <span className="sr-only">{children}</span>
      <span
        className={cn(
          'mm-aurora-text-gradient animate-mm-aurora-text relative flex flex-col items-start bg-clip-text text-transparent',
        )}
        style={gradientStyle}
        aria-hidden={true}
      >
        {children}
      </span>
    </span>
  );
});

AuroraText.displayName = 'AuroraText';
