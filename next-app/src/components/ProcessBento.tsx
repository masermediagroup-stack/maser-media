'use client';

import Image from 'next/image';
import { CONTENT } from '@/lib/content';
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

export function ProcessBento() {
  return (
    <section
      id="process"
      className="mm-section mm-section--process mm-process-bento"
      aria-labelledby="process-title"
    >
      <header
        className="mm-process-bento__heading mm-section-heading"
        data-mm-reveal="fade"
        data-mm-reveal-start="top 88%"
      >
        <h2 id="process-title">{title}</h2>
        <p>{subtitle}</p>
      </header>

      <div
        className="mm-process-bento__grid"
        data-mm-reveal-group="fade"
        data-mm-reveal-stagger="0.09"
        data-mm-reveal-start="top 82%"
        role="list"
        aria-label="Why Maser Media"
      >
        {items.map((item) => (
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
                <div className="mm-process-bento__icon-wrap" data-process-icon-wrap={item.icon}>
                  <ProcessIconByKey icon={item.icon} className="mm-process-bento__icon" />
                </div>
                <div className="mm-process-bento__copy mm-process-bento__copy--hero">
                  <h3>{item.title}</h3>
                  <p>{item.text}</p>
                </div>
              </>
            ) : (
              <>
                {!isDarkShaderTile(item.id) ? (
                  <div className="mm-process-bento__icon-wrap" data-process-icon-wrap={item.icon}>
                    <ProcessIconByKey icon={item.icon} className="mm-process-bento__icon" />
                  </div>
                ) : null}
                <div
                  className={`mm-process-bento__copy${isDarkShaderTile(item.id) ? ' mm-process-bento__copy--on-dark-shader' : ''}`}
                >
                  <h3>{item.title}</h3>
                  <p>{item.text}</p>
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
          <div className="mm-process-bento__quote-icon" data-process-icon-wrap="mark">
            <Image
              src={QUOTE_MONOGRAM_SRC}
              alt={CONTENT.site.logoAlt}
              width={32}
              height={32}
              className="mm-process-bento__icon mm-process-bento__icon--quote"
            />
          </div>
          <p className="mm-process-bento__quote">{pullQuote}</p>
          <span className="mm-process-bento__quote-accent" aria-hidden />
        </ProcessBentoTile>
      </div>

      <div className="mm-process-bento__pad" aria-hidden="true" />
    </section>
  );
}
