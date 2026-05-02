'use client';

import React, { type ComponentPropsWithoutRef, type CSSProperties } from 'react';

import { cn } from '@/lib/utils';

export interface RippleProps extends ComponentPropsWithoutRef<'div'> {
  mainCircleSize?: number;
  mainCircleOpacity?: number;
  numCircles?: number;
}

/**
 * Magic UI Ripple — concentric pulsing rings. Parent should be `relative overflow-hidden`.
 * Requires `animate-magicui-ripple` + `@keyframes magicui-ripple` in global/theme CSS.
 */
export const Ripple = React.memo(function Ripple({
  mainCircleSize = 210,
  mainCircleOpacity = 0.38,
  numCircles = 8,
  className,
  ...props
}: RippleProps) {
  return (
    <div
      className={cn(
        'pointer-events-none absolute inset-0 select-none mask-[linear-gradient(to_bottom,white_0%,white_42%,transparent_100%)]',
        className,
      )}
      {...props}
    >
      {Array.from({ length: numCircles }, (_, i) => {
        const size = mainCircleSize + i * 70;
        const opacity = Math.max(0.08, mainCircleOpacity - i * 0.028);
        const animationDelay = `${i * 0.06}s`;
        const borderStyle = 'solid';

        return (
          <div
            key={i}
            className="animate-magicui-ripple absolute rounded-full border border-foreground bg-foreground/18 shadow-[0_0_40px_-12px_color-mix(in_oklch,var(--color-foreground)_35%,transparent)]"
            style={
              {
                '--i': i,
                width: `${size}px`,
                height: `${size}px`,
                opacity,
                animationDelay,
                borderStyle,
                borderWidth: '1.5px',
                borderColor: 'color-mix(in oklch, var(--color-foreground) 72%, transparent)',
                top: '50%',
                left: '50%',
                transform: 'translate(-50%, -50%) scale(1)',
              } as CSSProperties
            }
          />
        );
      })}
    </div>
  );
});

Ripple.displayName = 'Ripple';
