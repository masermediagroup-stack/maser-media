'use client';

import type { CSSProperties, PointerEvent as ReactPointerEvent } from 'react';
import { LiquidMetal, Metaballs } from '@paper-design/shaders-react';
import { motion } from 'motion/react';

import { useReducedMotionAfterMount } from '@/lib/useReducedMotionAfterMount';

/** Paper artboard `15O-0` — copy + layout from Paper MCP `get_jsx` export (March 2025). */
const BOOK_CALL_HREF = '/#contact';

const METABALLS_COLORS = [
  '#0097F5',
  '#0084D7',
  '#388ACB',
  '#0065A3',
  '#000000',
  '#000000FC',
  '#FFFFFF',
];

const METABALLS_PROPS = {
  speed: 1.23,
  count: 16,
  size: 0.7,
  scale: 1.17,
  colors: METABALLS_COLORS,
  colorBack: '#000000FA',
};

const LIQUID_METAL_IMAGE =
  'https://workers.paper.design/file-assets/01KJG8T4NE29Q3TPBDYJSJ9C00/01KMJ26CTKB12E4REG0CR4BZY1.webp';

const LIQUID_METAL_PROPS = {
  speed: 0.24,
  softness: 0.34,
  repetition: 1.75,
  shiftRed: -0.14,
  shiftBlue: 0,
  distortion: 0.1,
  contour: 0.64,
  scale: 0.82,
  rotation: 0,
  shape: 'diamond' as const,
  angle: -40,
  image: LIQUID_METAL_IMAGE,
  colorBack: '#00000000',
  colorTint: '#FFFFFF',
};

const PAPER_COPY = {
  lede:
    'Two ways to work with us. Both built for speed, backed by senior talent, and designed to get you results - not excuses.',
  retainer: {
    title: 'Retainer',
    summary: 'Ongoing execution. Relentless output.',
    bullets: [
      'Design, dev and strategy - no bottlenecks',
      'You scale, we keep up - month after month',
      'Built to move fast and hit deadlines, period',
    ],
    priceMain: '$2k',
    priceSuffix: '/month',
  },
  project: {
    title: 'Project',
    summary: 'One goal. One timeline. Done right.',
    bullets: [
      'Scoped, quoted, and delivered in 2-4 weeks flat.',
      'Custom code, not cookie-cutter templates',
      'Launch ready assets that will drive real results',
    ],
  },
} as const;

const CheckIcon = () => (
  <svg
    width="20"
    height="20"
    viewBox="0 0 24 24"
    fill="none"
    role="presentation"
    aria-hidden="true"
    focusable="false"
    className="pricing-card__check"
  >
    <circle cx="12" cy="12" r="10" fill="#683A3333" />
    <path
      d="M8 12L11 15L16 9"
      stroke="#FFFFFFF7"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
    />
  </svg>
);

const cardFaceGradient: CSSProperties = {
  backgroundImage:
    'radial-gradient(ellipse 90.04% 164.2% at 82.02% 94.55% in oklab, oklab(78.9% -0.042 -0.104 / 36%) 0%, oklab(69.8% -0.062 -0.154 / 25%) 28.61%, oklab(27.7% -0.025 -0.058) 57.23%, oklab(0% 0 -0.0001) 100%)',
};

const ctaGradient: CSSProperties = {
  backgroundImage:
    'radial-gradient(ellipse 187.36% 246.57% at 50.27% 50% in oklab, oklab(99.8% -0.0005 -0.001) 0%, oklab(49.1% -0.051 -0.115 / 0%) 100%)',
};

type TiltNode = HTMLElement & { __pricingTiltRaf?: number };

function handleTiltMove(event: ReactPointerEvent<HTMLElement>, enabled: boolean) {
  if (!enabled || event.pointerType !== 'mouse') return;

  const node = event.currentTarget as TiltNode;
  const rect = node.getBoundingClientRect();
  const x = (event.clientX - rect.left) / rect.width;
  const y = (event.clientY - rect.top) / rect.height;
  const rotateY = (x - 0.5) * 6;
  const rotateX = (0.5 - y) * 5;

  if (node.__pricingTiltRaf) {
    window.cancelAnimationFrame(node.__pricingTiltRaf);
  }

  node.__pricingTiltRaf = window.requestAnimationFrame(() => {
    node.style.setProperty('--pricing-pointer-x', `${Math.round(x * 100)}%`);
    node.style.setProperty('--pricing-pointer-y', `${Math.round(y * 100)}%`);
    node.style.transform = `perspective(1100px) rotateX(${rotateX.toFixed(2)}deg) rotateY(${rotateY.toFixed(2)}deg) translateY(-2px)`;
  });
}

function handleTiltLeave(event: ReactPointerEvent<HTMLElement>, enabled: boolean) {
  if (!enabled) return;
  const node = event.currentTarget as TiltNode;
  if (node.__pricingTiltRaf) {
    window.cancelAnimationFrame(node.__pricingTiltRaf);
  }
  node.style.transform = '';
  node.dataset.pressed = 'false';
  node.style.removeProperty('--pricing-pointer-x');
  node.style.removeProperty('--pricing-pointer-y');
}

function handleTiltDown(event: ReactPointerEvent<HTMLElement>, enabled: boolean) {
  if (!enabled || event.pointerType !== 'mouse') return;
  const node = event.currentTarget as HTMLElement;
  node.dataset.pressed = 'true';
}

function handleTiltUp(event: ReactPointerEvent<HTMLElement>) {
  const node = event.currentTarget as HTMLElement;
  node.dataset.pressed = 'false';
}

function RetainerCard({ reducedMotion }: { reducedMotion: boolean | null }) {
  const canTilt = !reducedMotion;
  const liquidStyle: CSSProperties = {
    position: 'absolute',
    left: 42.5,
    top: 13,
    width: '651px',
    height: '401px',
    backgroundColor: 'transparent',
    filter: 'blur(15px) grayscale(100%)',
    mixBlendMode: 'screen',
    opacity: 0.5,
    pointerEvents: 'none',
  };

  return (
    <div className="pricing-card-slot pricing-card-slot--retainer">
      <motion.article
        className="pricing-card pricing-card--retainer pricing-card--interactive"
        onPointerMove={(event) => handleTiltMove(event, canTilt)}
        onPointerLeave={(event) => handleTiltLeave(event, canTilt)}
        onPointerDown={(event) => handleTiltDown(event, canTilt)}
        onPointerUp={handleTiltUp}
        initial={false}
        transition={{ type: 'spring', stiffness: 280, damping: 24 }}
      >
        <div className="pricing-card__face" style={cardFaceGradient}>
          <div className="pricing-card__liquid-wrap" aria-hidden="true">
            {!reducedMotion ? (
              <LiquidMetal {...LIQUID_METAL_PROPS} style={liquidStyle} suspendWhenProcessingImage />
            ) : null}
          </div>

          <div className="pricing-card__body">
            <header className="pricing-card__header">
              <h3 className="pricing-card__title">{PAPER_COPY.retainer.title}</h3>
              <p className="pricing-card__summary">{PAPER_COPY.retainer.summary}</p>
            </header>

            <ul className="pricing-card__bullets">
              {PAPER_COPY.retainer.bullets.map((text) => (
                <li key={text} className="pricing-card__bullet">
                  <CheckIcon />
                  <span>{text}</span>
                </li>
              ))}
            </ul>

            <div className="pricing-card__footer pricing-card__footer--retainer">
              <div className="pricing-card__price-block">
                <span className="pricing-card__price-label">Starting at</span>
                <div className="pricing-card__price-row">
                  <span className="pricing-card__price pricing-card__price--retainer-main">
                    {PAPER_COPY.retainer.priceMain}
                  </span>
                  <span className="pricing-card__price-suffix">{PAPER_COPY.retainer.priceSuffix}</span>
                </div>
              </div>
              <a
                href={BOOK_CALL_HREF}
                className="pricing-card__cta pricing-card__cta--pill"
                aria-label="Book call for Retainer plan"
                style={ctaGradient}
              >
                Book Call
              </a>
            </div>
          </div>
        </div>
      </motion.article>
    </div>
  );
}

function ProjectCard({ reducedMotion }: { reducedMotion: boolean | null }) {
  const canTilt = !reducedMotion;
  const liquidStyle: CSSProperties = {
    position: 'absolute',
    left: 0,
    top: 0,
    width: '100%',
    height: '100%',
    backgroundColor: 'transparent',
    filter: 'blur(15px) grayscale(100%)',
    mixBlendMode: 'screen',
    opacity: 0.5,
    pointerEvents: 'none',
  };

  return (
    <div className="pricing-card-slot pricing-card-slot--project">
      <motion.article
        className="pricing-card pricing-card--project pricing-card--interactive"
        onPointerMove={(event) => handleTiltMove(event, canTilt)}
        onPointerLeave={(event) => handleTiltLeave(event, canTilt)}
        onPointerDown={(event) => handleTiltDown(event, canTilt)}
        onPointerUp={handleTiltUp}
        initial={false}
        transition={{ type: 'spring', stiffness: 280, damping: 24 }}
      >
        <div className="pricing-card__face" style={cardFaceGradient}>
          <div className="pricing-card__liquid-wrap" aria-hidden="true">
            {!reducedMotion ? (
              <LiquidMetal {...LIQUID_METAL_PROPS} style={liquidStyle} suspendWhenProcessingImage />
            ) : null}
          </div>

          <div className="pricing-card__body">
            <header className="pricing-card__header">
              <h3 className="pricing-card__title">{PAPER_COPY.project.title}</h3>
              <p className="pricing-card__summary">{PAPER_COPY.project.summary}</p>
            </header>

            <ul className="pricing-card__bullets">
              {PAPER_COPY.project.bullets.map((text) => (
                <li key={text} className="pricing-card__bullet">
                  <CheckIcon />
                  <span>{text}</span>
                </li>
              ))}
            </ul>

            <div className="pricing-card__footer pricing-card__footer--project">
              <a
                href={BOOK_CALL_HREF}
                className="pricing-card__cta pricing-card__cta--full"
                aria-label="Book call for Project plan"
                style={ctaGradient}
              >
                Book Call
              </a>
            </div>
          </div>
        </div>
      </motion.article>
    </div>
  );
}

export function PricingPlans() {
  const { mounted, prefersReducedMotion } = useReducedMotionAfterMount();
  // Until mount, match SSR (no shaders). After mount, same semantics as `useReducedMotion() ?? true`.
  const reducedMotion = !mounted ? true : (prefersReducedMotion ?? true);

  return (
    <section id="pricing" className="pricing-plans pricing-plans--paper" aria-labelledby="pricing-heading">
      <div className="pricing-plans__stage">
        <div className="pricing-plans__shader-bg" aria-hidden="true">
          {!reducedMotion ? (
            <Metaballs
              {...METABALLS_PROPS}
              style={{
                position: 'absolute',
                inset: 0,
                width: '100%',
                height: '100%',
                backgroundColor: '#000000',
                filter: 'blur(13px)',
              }}
            />
          ) : null}
        </div>

        <div className="pricing-plans__content">
          <div className="pricing-plans__content-scale">
            {/* Paper 15O-0: outer frame 522×364; inner column max 500px; gap 24px headline↔lede */}
            <div className="pricing-plans__headline-shell">
              <div className="pricing-plans__headline-block">
                <h2 id="pricing-heading" className="pricing-plans__headline">
                  <span className="pricing-plans__headline-lines">
                    <span className="pricing-plans__headline-line pricing-plans__headline-line--ship">Ship fast.</span>{' '}
                    <span className="pricing-plans__headline-line pricing-plans__headline-line--look">
                      Look credible.
                    </span>
                    <br className="pricing-plans__headline-br" aria-hidden="true" />
                    <span className="pricing-plans__headline-line pricing-plans__headline-line--stand">Stand out.</span>
                  </span>
                </h2>
                <p className="pricing-plans__lede">{PAPER_COPY.lede}</p>
              </div>
            </div>

            <div className="pricing-plans__cards-column" aria-label="Pricing options">
              <ProjectCard reducedMotion={reducedMotion} />
              <RetainerCard reducedMotion={reducedMotion} />
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
