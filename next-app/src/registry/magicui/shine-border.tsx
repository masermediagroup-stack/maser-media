'use client';

import type { CSSProperties, HTMLAttributes } from 'react';

type ShineBorderProps = Omit<HTMLAttributes<HTMLDivElement>, 'style'> & {
  borderWidth?: number;
  duration?: number;
  shineColor?: string | string[];
  /** Use OKLCH interpolation so white↔blue stops don’t drift through cyan (sRGB does). */
  hueSafe?: boolean;
  style?: CSSProperties;
};

function gradientStops(colors: string[]): string {
  if (colors.length === 0) return '#000000 0%, #000000 100%';
  if (colors.length === 1) return `${colors[0]} 0%, ${colors[0]} 100%`;
  return colors.map((c, i) => `${c} ${(i / (colors.length - 1)) * 100}%`).join(', ');
}

/**
 * Magic UI–style animated border ring (mask-based). Parent must be `position: relative; overflow: hidden; border-radius: inherit`.
 */
export function ShineBorder({
  borderWidth = 1,
  duration = 14,
  shineColor = '#000000',
  hueSafe = false,
  className,
  style,
  ...props
}: ShineBorderProps) {
  const colors = Array.isArray(shineColor) ? shineColor : [shineColor];
  const stops = gradientStops(colors);
  const backgroundImage = hueSafe
    ? `linear-gradient(128deg in oklch, ${stops})`
    : `radial-gradient(transparent, transparent, ${colors.join(', ')}, transparent, transparent)`;

  return (
    <div
      style={
        {
          '--shine-duration': `${duration}s`,
          '--border-width': `${borderWidth}px`,
          backgroundImage,
          backgroundSize: '300% 300%',
          mask: 'linear-gradient(#fff 0 0) content-box, linear-gradient(#fff 0 0)',
          WebkitMask: 'linear-gradient(#fff 0 0) content-box, linear-gradient(#fff 0 0)',
          WebkitMaskComposite: 'xor',
          maskComposite: 'exclude',
          padding: 'var(--border-width)',
          ...style,
        } as CSSProperties
      }
      className={['shine-border-magic', className].filter(Boolean).join(' ')}
      {...props}
    />
  );
}
