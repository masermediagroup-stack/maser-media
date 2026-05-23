'use client';

import type { ReactNode } from 'react';

export type ProcessBentoTileVariant = 'hero' | 'card' | 'accent' | 'quote';

export type ProcessBentoTileProps = {
  variant: ProcessBentoTileVariant;
  gridArea: string;
  media?: ReactNode;
  children: ReactNode;
  className?: string;
  'data-mm-reveal'?: string;
  'aria-label'?: string;
};

export function ProcessBentoTile({
  variant,
  gridArea,
  media,
  children,
  className = '',
  'data-mm-reveal': dataReveal,
  'aria-label': ariaLabel,
}: ProcessBentoTileProps) {
  const isQuote = variant === 'quote';
  const Tag = isQuote ? 'aside' : 'article';

  return (
    <div
      className={`mm-process-bento__tile-shell mm-process-bento__tile-shell--${variant} ${className}`.trim()}
      style={{ gridArea }}
      data-mm-reveal={dataReveal}
      role={isQuote ? undefined : 'listitem'}
    >
      <Tag
        className={`mm-process-bento__tile mm-process-bento__tile--${variant}`}
        aria-label={ariaLabel}
      >
        {media}
        <div className="mm-process-bento__tile-body">{children}</div>
      </Tag>
    </div>
  );
}
