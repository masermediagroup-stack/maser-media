'use client';

import Image from 'next/image';
import { useEffect, useRef } from 'react';
import type { CSSProperties, ReactNode, RefObject } from 'react';
import { CONTENT } from '@/lib/content';
import { SectionTitleReveal } from '@/components/RevealText';
import { ProcessIconByKey } from '@/components/ProcessIcons';
import { ProcessBentoGridBackground } from '@/components/process-bento/ProcessBentoGridBackground';
import { ProcessBentoHeroRipple } from '@/components/process-bento/ProcessBentoHeroRipple';
import { ProcessBentoTile } from '@/components/process-bento/ProcessBentoTile';
import { ProcessNetworkShader } from '@/components/process-bento/ProcessNetworkShader';
import { ProcessQuoteLiquidSurface } from '@/components/process-bento/ProcessQuoteLiquidSurface';

const { title, subtitle, pullQuote, items } = CONTENT.whyMaserMedia;
const QUOTE_MONOGRAM_SRC = '/assets/MaserMedia-MM-monogram-white-transparent.png';

const TILE_AREAS: Record<string, string> = {
  direct: 'direct',
  system: 'system',
  launch: 'launch',
};

function tileMedia(id: string) {
  if (id === 'direct') {
    return <ProcessBentoHeroRipple />;
  }
  if (id === 'system') {
    return <ProcessNetworkShader theme="dark" interactive />;
  }
  if (id === 'launch') {
    return <ProcessBentoGridBackground />;
  }
  return null;
}

function isDarkShaderTile(id: string) {
  return id === 'system';
}

function useProcessBentoReveal(gridRef: RefObject<HTMLDivElement | null>) {
  useEffect(() => {
    const grid = gridRef.current;

    if (!grid) {
      return;
    }

    const prefersReducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;

    if (prefersReducedMotion || typeof IntersectionObserver === 'undefined') {
      grid.classList.add('mm-process-bento__grid--motion-ready');
      grid.classList.add('mm-process-bento__grid--text-motion-ready');
      return;
    }

    let hasPreparedMedia = false;

    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry?.isIntersecting) {
          if (!hasPreparedMedia) {
            grid.classList.add('mm-process-bento__grid--motion-ready');
            hasPreparedMedia = true;
          }

          grid.classList.add('mm-process-bento__grid--text-motion-ready');
          return;
        }

        grid.classList.remove('mm-process-bento__grid--text-motion-ready');
      },
      {
        // Keep tile copy on screen until the grid has actually left.
        // A 0.24 threshold + bottom shrink hid every card's text while later
        // stacked tiles were still in view on mobile.
        rootMargin: '0px 0px 20% 0px',
        threshold: 0,
      },
    );

    observer.observe(grid);

    return () => {
      observer.disconnect();
    };
  }, [gridRef]);
}

function ProcessTextReveal({
  children,
  className = '',
  nowrap = false,
  delay = 0,
}: {
  children: ReactNode;
  className?: string;
  nowrap?: boolean;
  delay?: number;
}) {
  return (
    <span
      className={`mm-process-bento__text-reveal-line ${className}`.trim()}
      style={{ '--mm-process-text-delay': `${delay}ms` } as CSSProperties}
    >
      <span
        className={`mm-process-bento__text-reveal-inner${nowrap ? ' mm-process-bento__text-reveal-inner--nowrap' : ''}`}
      >
        {children}
      </span>
    </span>
  );
}

function renderProcessPullQuote(quote: string) {
  return <ProcessTextReveal delay={220}>{quote}</ProcessTextReveal>;
}

export function ProcessBento() {
  const gridRef = useRef<HTMLDivElement>(null);

  useProcessBentoReveal(gridRef);

  return (
    <section
      id="process"
      className="mm-section mm-section--process mm-process-bento"
      aria-labelledby="process-title"
    >
      <header className="mm-process-bento__heading mm-section-heading">
        <h2 id="process-title">
          <SectionTitleReveal text={title} />
        </h2>
        <p>{subtitle}</p>
      </header>

      <div
        ref={gridRef}
        className="mm-process-bento__grid"
        data-mm-reveal-group="fade"
        data-mm-reveal-repeat="true"
        data-mm-reveal-reset="hidden"
        data-mm-reveal-stagger="0.09"
        data-mm-reveal-start="top 82%"
        data-mm-reveal-end="bottom+=48 top"
        role="list"
        aria-label="Why Maser Media"
      >
        {items.map((item, index) => (
          <ProcessBentoTile
            key={item.id}
            variant={item.variant}
            gridArea={TILE_AREAS[item.id] ?? item.id}
            media={tileMedia(item.id)}
            data-mm-reveal="fade"
            className={
              isDarkShaderTile(item.id) ? 'mm-process-bento__tile-shell--shader-dark' : undefined
            }
          >
            {item.variant === 'hero' ? (
              <>
                <div
                  className="mm-process-bento__icon-wrap"
                  data-process-icon-wrap={item.icon}
                  style={{ '--mm-process-icon-delay': `${80 + index * 120}ms` } as CSSProperties}
                >
                  <ProcessIconByKey icon={item.icon} className="mm-process-bento__icon" />
                </div>
                <div className="mm-process-bento__copy mm-process-bento__copy--hero">
                  <h3>
                    <ProcessTextReveal delay={120 + index * 80}>{item.title}</ProcessTextReveal>
                  </h3>
                  <p>
                    <ProcessTextReveal delay={220 + index * 80}>{item.text}</ProcessTextReveal>
                  </p>
                </div>
              </>
            ) : (
              <>
                {!isDarkShaderTile(item.id) ? (
                  <div
                    className="mm-process-bento__icon-wrap"
                    data-process-icon-wrap={item.icon}
                    style={{ '--mm-process-icon-delay': `${80 + index * 120}ms` } as CSSProperties}
                  >
                    <ProcessIconByKey icon={item.icon} className="mm-process-bento__icon" />
                  </div>
                ) : null}
                <div
                  className={`mm-process-bento__copy${isDarkShaderTile(item.id) ? ' mm-process-bento__copy--on-dark-shader' : ''}`}
                >
                  <h3>
                    <ProcessTextReveal delay={120 + index * 80}>{item.title}</ProcessTextReveal>
                  </h3>
                  <p>
                    <ProcessTextReveal delay={220 + index * 80}>{item.text}</ProcessTextReveal>
                  </p>
                </div>
              </>
            )}
          </ProcessBentoTile>
        ))}

        <ProcessBentoTile
          variant="quote"
          gridArea="quote"
          media={<ProcessQuoteLiquidSurface />}
          className="mm-process-bento__tile-shell--quote-liquid"
          data-mm-reveal="fade"
          aria-label="Studio summary"
        >
          <div
            className="mm-process-bento__quote-icon"
            data-process-icon-wrap="mark"
            style={{ '--mm-process-icon-delay': '440ms' } as CSSProperties}
          >
            <Image
              src={QUOTE_MONOGRAM_SRC}
              alt={CONTENT.site.logoAlt}
              width={32}
              height={32}
              className="mm-process-bento__icon mm-process-bento__icon--quote"
            />
          </div>
          <p className="mm-process-bento__quote">{renderProcessPullQuote(pullQuote)}</p>
          <span className="mm-process-bento__quote-accent" aria-hidden />
        </ProcessBentoTile>
      </div>

      <div className="mm-process-bento__pad" aria-hidden="true" />
    </section>
  );
}
