'use client';

import { useLayoutEffect, useMemo, useRef, useState } from 'react';
import type React from 'react';
import Image from 'next/image';
import Link from 'next/link';
import { useInView } from 'framer-motion';
import { motion, useReducedMotion } from 'motion/react';
import {
  BadgeCheck,
  BarChart3,
  ChevronLeft,
  ChevronRight,
  CircleDot,
  MousePointer2,
  Sparkles,
  Zap,
} from 'lucide-react';
import { CONTENT, type TestimonialCarouselItem } from '@/lib/content';
import { openContactModalFromApp } from '@/lib/contactModalEvents';
import SmokeyBackground from '@/components/lightswind/smokey-background';
import { GlowingCard } from '@/components/lightswind/glowing-cards';
import TestimonialsWaveBackground from '@/components/TestimonialsWaveBackground';
import { AuroraText } from '@/registry/magicui/aurora-text';
import { Ripple } from '@/registry/magicui/ripple';
import { useGsapLandingMotion } from '@/hooks/useGsapLandingMotion';
import { LiquidNav } from './LiquidNav';
import { ContactFlow } from './ContactFlow';
import { AsciiWaveFooter } from './AsciiWaveFooter';
import { FooterCoolButton } from './FooterCoolButton';

type EntranceProps = { entrance?: boolean };
type InnerPageKind = 'work' | 'services' | 'about';

const CASE_IMAGE = '/assets/generated/maser-case-wall.png';

const processSteps = [
  {
    title: 'Narrative lock',
    text: 'Positioning, hierarchy, and conversion intent get sharpened before pixels start moving.',
  },
  {
    title: 'Visual system',
    text: 'Brand, web, and campaign materials share one language instead of feeling stitched together.',
  },
  {
    title: 'Launch build',
    text: 'Custom code, fast iteration, and handoff-ready assets keep the path from approval to launch tight.',
  },
];

const motionPanels = [
  'Realtime launch board',
  'Conversion-first storytelling',
  'Brand systems that travel',
  'Motion assets for rollout',
];

/** Long strip so scrubbing `xPercent` left never opens a gap on the trailing (right) edge. */
const primaryMarqueeItems = Array.from({ length: 10 }, () => motionPanels).flat();

const secondaryMotionPanels = ['Brand', 'Web', 'Motion', 'Strategy', 'Content', 'Launch', 'Systems', 'Conversion'];

/** Tiles immediately left of "Brand" in an infinite strip: â€¦ â†’ Web â†’ Brand */
const secondaryMotionBeforeBrand = [...secondaryMotionPanels.slice(1)].reverse();

/**
 * Long lead-in (left in LTR) + many full cycles so scrubbing right never opens a gap on the leading (left) edge.
 */
const secondaryMarqueeItems = [
  ...Array.from({ length: 18 }, () => secondaryMotionBeforeBrand).flat(),
  ...Array.from({ length: 10 }, () => secondaryMotionPanels).flat(),
];

export function Nav({ entrance }: EntranceProps) {
  return <LiquidNav entrance={entrance} />;
}

export function Hero({ entrance }: EntranceProps) {
  const reduceMotion = useReducedMotion();

  return (
    <header className="mm-hero">
      <div className="mm-hero__bg-scale" aria-hidden>
        <div className="mm-hero__smokey">
          <SmokeyBackground color="#10A4FF" backdropBlurAmount="none" className="h-full min-h-0 w-full" />
        </div>
        <div className="mm-hero__grain" aria-hidden />
      </div>
      <div className="mm-hero__exit-splash" aria-hidden />
      <motion.div
        className="mm-hero__content"
        initial={entrance ? { opacity: 0, y: 24, filter: reduceMotion ? 'none' : 'blur(14px)' } : false}
        animate={entrance ? { opacity: 1, y: 0, filter: 'blur(0px)' } : false}
        transition={entrance ? { duration: 0.8, ease: [0.22, 1, 0.36, 1] } : undefined}
      >
        <div className="mm-hero__content-shift">
          <div className="mm-hero__copy">
            <h1 className="mm-hero__title">Maser Media brings brands, stories, and experiences to life.</h1>
            <p className="mm-hero__lead">
              A creative team shaping culture-forward ideas through design and technology.
            </p>
          </div>
        </div>
      </motion.div>
    </header>
  );
}

export function Clients() {
  const items = CONTENT.clients.items;

  return (
    <section className="mm-section mm-section--clients mm-clients" aria-labelledby="clients-heading">
      <h2 id="clients-heading" className="mm-clients__headline">
        {CONTENT.clients.label}
      </h2>
      <div className="mm-client-strip">
        <div className="mm-client-strip__track">
          <div className="mm-client-strip__segment">
            {items.map((item) => (
              <span key={item.name} className="mm-client-pill">
                {item.name}
              </span>
            ))}
          </div>
          <div className="mm-client-strip__segment" aria-hidden="true">
            {items.map((item) => (
              <span key={`${item.name}-dup`} className="mm-client-pill">
                {item.name}
              </span>
            ))}
          </div>
        </div>
      </div>
    </section>
  );
}

export function Services() {
  const pillars = CONTENT.services.items;

  return (
    <section className="mm-section mm-section--services mm-services" id="services" aria-labelledby="services-heading">
      <div className="mm-services__layout">
        <div className="mm-services__intro">
          {/* h2 + .mm-type-display: matches hero display scale without a second h1 on the landing page. If this section is ever the sole top-level heading on a route, promote to h1 and drop .mm-type-display from the hero (or split layouts) so the document has one h1. */}
          <h2 id="services-heading" className="mm-type-display">
            One studio for the whole launch surface.
          </h2>
        </div>
        <div className="mm-services__grid-scroll">
          <div className="mm-services__grid">
            {pillars.map((pillar, index) => (
              <div
                key={pillar.title}
                className={`mm-services__row${index === 0 ? ' mm-services__row--active' : ' mm-services__row--muted'}`}
              >
                <div className="mm-services__head">
                  <span className="mm-services__index" aria-hidden="true">
                    {String(index + 1).padStart(2, '0')}
                  </span>
                  <h3 className="mm-services__pillar" id={`services-pillar-${index}`}>
                    {pillar.title}
                  </h3>
                </div>
                <div className="mm-services__body" id={`services-body-${index}`}>
                  <ul className="mm-services__lines" aria-labelledby={`services-pillar-${index}`}>
                    {pillar.items.map((line) => (
                      <li key={line} className="mm-services__line">
                        {line}
                      </li>
                    ))}
                  </ul>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </section>
  );
}

export function Work() {
  const [activeCategory, setActiveCategory] = useState('All');
  const [projectIndex, setProjectIndex] = useState(0);
  const [transitionKey, setTransitionKey] = useState(0);
  const touchStartX = useRef<number | null>(null);
  const filteredProjects = useMemo(
    () => CONTENT.work.items.filter((project) => activeCategory === 'All' || project.category === activeCategory),
    [activeCategory],
  );
  const activeProject = filteredProjects[projectIndex] ?? filteredProjects[0];
  const hasMultipleProjects = filteredProjects.length > 1;

  const switchProject = (direction: -1 | 1) => {
    setProjectIndex((index) => {
      if (filteredProjects.length === 0) return 0;
      return (index + direction + filteredProjects.length) % filteredProjects.length;
    });
    setTransitionKey((key) => key + 1);
  };

  const handleTouchStart = (event: React.TouchEvent<HTMLDivElement>) => {
    touchStartX.current = event.touches[0]?.clientX ?? null;
  };

  const handleTouchEnd = (event: React.TouchEvent<HTMLDivElement>) => {
    if (touchStartX.current === null || !hasMultipleProjects) return;
    const endX = event.changedTouches[0]?.clientX ?? touchStartX.current;
    const deltaX = endX - touchStartX.current;
    touchStartX.current = null;

    if (Math.abs(deltaX) < 44) return;
    switchProject(deltaX < 0 ? 1 : -1);
  };

  return (
    <section className="mm-section mm-section--work mm-work relative overflow-hidden" id="work">
      <div className="mm-work__ripple-layer absolute inset-0 z-0" aria-hidden>
        <Ripple />
      </div>
      <div
        className="pointer-events-none absolute inset-0 z-[1] bg-sky-400/20"
        aria-hidden
      />
      <div className="relative z-10">
        <div className="mm-section-heading mm-section-heading--wide">
          <h2 className="mm-work__title">{CONTENT.work.title}</h2>
          <p>{CONTENT.work.subtitle}</p>
        </div>
        <div className="mm-work-tabs" aria-label="Project categories">
          {CONTENT.work.categories.map((category) => (
            <button
              key={category}
              type="button"
              className="mm-work-tab"
              aria-pressed={activeCategory === category}
              onClick={() => {
                setProjectIndex(0);
                setActiveCategory(category);
              }}
            >
              {category}
            </button>
          ))}
        </div>
        <div className="mm-work-carousel" onTouchStart={handleTouchStart} onTouchEnd={handleTouchEnd}>
          <button
            type="button"
            className="mm-work-arrow mm-work-arrow--prev"
            onClick={() => switchProject(-1)}
            aria-label="Show previous project"
            disabled={!hasMultipleProjects}
          >
            <ChevronLeft size={24} aria-hidden />
          </button>

          {activeProject ? (
            <Link
              key={activeProject.title}
              href={activeProject.link}
              className="mm-work-card mm-work-card--single"
              target={activeProject.link.startsWith('http') ? '_blank' : undefined}
              rel={activeProject.link.startsWith('http') ? 'noopener noreferrer' : undefined}
            >
              <span key={transitionKey} className="mm-work-card__blue-transition" aria-hidden />
              <div className="mm-work-card__image">
                <Image
                  src={activeProject.image ?? CASE_IMAGE}
                  alt=""
                  fill
                  sizes="(max-width: 900px) 92vw, 980px"
                />
              </div>
              <div className="mm-work-card__body">
                <span>{activeProject.category}</span>
                <h3>{activeProject.title}</h3>
                <p>{activeProject.description}</p>
                <dl>
                  <div>
                    <dt>Timeline</dt>
                    <dd>{activeProject.timeframe}</dd>
                  </div>
                  <div>
                    <dt>Role</dt>
                    <dd>{activeProject.role}</dd>
                  </div>
                  <div>
                    <dt>Project</dt>
                    <dd>
                      {projectIndex + 1} / {filteredProjects.length}
                    </dd>
                  </div>
                </dl>
              </div>
            </Link>
          ) : null}

          <button
            type="button"
            className="mm-work-arrow mm-work-arrow--next"
            onClick={() => switchProject(1)}
            aria-label="Show next project"
            disabled={!hasMultipleProjects}
          >
            <ChevronRight size={24} aria-hidden />
          </button>
        </div>
      </div>
    </section>
  );
}

export function MotionSystem() {
  return (
    <section className="mm-section mm-section--marquee marquee-system" aria-label="Creative system">
      <div className="marquee-row marquee-row--primary">
        {primaryMarqueeItems.map((item, index) => (
          <span key={`primary-${item}-${index}`}>{item}</span>
        ))}
      </div>
      <div className="marquee-row marquee-row--secondary">
        {secondaryMarqueeItems.map((item, index) => (
          <span key={`secondary-${item}-${index}`}>{item}</span>
        ))}
      </div>
    </section>
  );
}

export function ProcessStack() {
  return (
    <section className="mm-section mm-section--process stack-motion">
      <div className="mm-section-heading">
        <h2>Fast does not have to feel thin.</h2>
        <p>
          The process is built around decisive creative direction, clear delivery rhythms, and enough motion
          detail to make the launch feel expensive.
        </p>
      </div>
      <div className="stack-grid">
        {processSteps.map((step, index) => (
          <article
            key={step.title}
            className="stack-card flex flex-col"
            style={{ ['--stack-index' as string]: index }}
          >
            <GlowingCard glowColor="#ffea00" hoverEffect={false} surface="plain">
              <span>{String(index + 1).padStart(2, '0')}</span>
              <h3>{step.title}</h3>
              <p>{step.text}</p>
            </GlowingCard>
          </article>
        ))}
      </div>
    </section>
  );
}

export function Cta() {
  return (
    <section className="mm-cta mm-section--cta" id="contact" aria-labelledby="contact-heading">
      <div className="mm-cta__surface">
        <div className="mm-cta__inner">
          <div className="mm-cta__shell">
            <div className="mm-cta__column">
              <h2 id="contact-heading" className="mm-cta__title">
                {CONTENT.cta.title}
              </h2>
              <p className="mm-cta__lead">{CONTENT.cta.subtitle}</p>
              <div className="mm-cta__actions mm-cta__actions--contact">
                <button
                  type="button"
                  className="liquid-nav-contact liquid-nav-contact--inline mm-cta__contact-btn"
                  onClick={() => openContactModalFromApp()}
                >
                  {CONTENT.cta.contactButtonLabel}
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}

export function Footer() {
  return (
    <footer className="mm-footer relative">
      <div className="mm-footer__brand">
        <Image
          src={CONTENT.site.logo}
          alt={CONTENT.site.logoAlt}
          width={CONTENT.site.logoWidth}
          height={CONTENT.site.logoHeight}
        />
      </div>
      <nav className="mm-footer__nav" aria-label="Footer navigation">
        {CONTENT.footer.nav.map((item) => (
          <Link key={item.href} href={item.href}>
            {item.text}
          </Link>
        ))}
      </nav>
      <p className="mm-footer__copy">© {CONTENT.footer.copyright}</p>
      <AsciiWaveFooter color="#10A4FF" speed={1} />
      <FooterCoolButton />
    </footer>
  );
}

export function LandingPage() {
  const rootRef = useRef<HTMLElement>(null);
  useGsapLandingMotion(rootRef);

  return (
    <main ref={rootRef} id="main-content" className="site-main mm-main">
      <Hero entrance />
      <Clients />
      <Services />
      <Work />
      <MotionSystem />
      <ProcessStack />
      <Testimonials />
      <Cta />
      <Footer />
    </main>
  );
}

export function PricingPlans() {
  return (
    <section id="pricing" className="mm-pricing-page" aria-labelledby="pricing-heading">
      <InnerHero
        eyebrow={CONTENT.pricing.eyebrow}
        title="Pricing built for clear decisions."
        copy="Two ways to work with us. Both built for speed, backed by senior talent, and designed to get you results - not excuses."
      />
      <div className="mm-pricing-grid">
        {CONTENT.pricing.plans.map((plan) => (
          <article key={plan.name} className={`mm-price-card ${plan.featured ? 'mm-price-card--featured' : ''}`}>
            <div className="mm-price-card__top">
              <span>{plan.featured ? 'Ongoing partner' : 'Scoped sprint'}</span>
              <h2>{plan.name}</h2>
              <p>{plan.summary}</p>
            </div>
            <div className="mm-price-card__price">{plan.price}</div>
            <div className="mm-price-card__notes">
              <p>{plan.bestFor}</p>
              <p>{plan.cadence}</p>
            </div>
            <ul>
              {plan.bullets.map((bullet) => (
                <li key={bullet}>
                  <BadgeCheck size={18} aria-hidden />
                  {bullet}
                </li>
              ))}
            </ul>
            <div className="mm-price-card__actions">
              <Link href={plan.primaryCta.href} className="mm-button mm-button--primary">
                {plan.primaryCta.text}
              </Link>
              <a href={plan.secondaryCta.href} className="mm-button mm-button--ghost">
                {plan.secondaryCta.text}
              </a>
            </div>
          </article>
        ))}
      </div>
    </section>
  );
}

export function ContactPageExperience() {
  return (
    <main id="main-content" className="site-main mm-inner-main">
      <InnerHero
        eyebrow="Contact"
        title="Start with the shape of the problem. We will handle the path."
        copy="Use the quick intake below. It keeps the first conversation focused and gives us enough signal to respond with a useful next step."
      />
      <section className="mm-contact-layout">
        <div className="mm-contact-card">
          <CircleDot size={20} aria-hidden />
          <h2>Direct and focused.</h2>
          <p>
            Tell us what you are building, what is blocked, and how soon you want to move. We will reply with
            the cleanest way to start.
          </p>
        </div>
        <ContactFlow />
      </section>
      <Footer />
    </main>
  );
}

export function InnerHero({ eyebrow, title, copy }: { eyebrow: string; title: string; copy: string }) {
  return (
    <header className="mm-inner-hero">
      <p className="mm-kicker">{eyebrow}</p>
      <h1>{title}</h1>
      <p>{copy}</p>
    </header>
  );
}

export function InnerPage({ kind }: { kind: InnerPageKind }) {
  const config = {
    work: {
      eyebrow: 'Work',
      title: 'Proof that clarity can still feel cinematic.',
      copy: 'A focused look at the launch surfaces we shape: websites, product stories, identities, and motion systems.',
      body: <Work />,
    },
    services: {
      eyebrow: 'Services',
      title: 'Strategy, design, web, content, and motion under one roof.',
      copy: 'Use us when the brand, landing page, product story, and launch assets need to feel like they came from one confident source.',
      body: (
        <>
          <Services />
          <ProcessStack />
        </>
      ),
    },
    about: {
      eyebrow: 'About',
      title: 'A lean creative crew for teams that need senior taste and real output.',
      copy: 'Maser Media works close to the decision makers, keeps the process direct, and builds brand experiences that are clear enough to sell.',
      body: <MotionSystem />,
    },
  } satisfies Record<InnerPageKind, { eyebrow: string; title: string; copy: string; body: React.ReactNode }>;

  const page = config[kind];

  return (
    <main id="main-content" className="site-main mm-inner-main">
      <InnerHero eyebrow={page.eyebrow} title={page.title} copy={page.copy} />
      {page.body}
      <Cta />
      <Footer />
    </main>
  );
}

function Stars({ muted = false }: { muted?: boolean }) {
  return (
    <div className={`testimonial-stars ${muted ? 'testimonial-stars--muted' : ''}`} aria-hidden>
      {Array.from({ length: 5 }).map((_, i) => (
        <span key={i} className="testimonial-star">
          â˜…
        </span>
      ))}
    </div>
  );
}

function TestimonialCardArticle({
  quote,
  name,
  role,
  className = '',
}: {
  quote: string;
  name: string;
  role: string;
  className?: string;
}) {
  return (
    <article
      className={`testimonial-card mm-testimonials-wave__card${className ? ` ${className}` : ''}`}
    >
      <Sparkles className="testimonial-card-quote-icon" size={22} aria-hidden />
      <Stars />
      <p className="testimonial-card-text">{quote}</p>
      <div className="testimonial-card-footer">
        <div className="testimonial-card-avatar testimonial-card-avatar--placeholder" aria-hidden />
        <div className="testimonial-card-who">
          <strong className="testimonial-card-name">{name}</strong>
          <span className="testimonial-card-role">{role}</span>
        </div>
      </div>
    </article>
  );
}

/** Syncs CSS marquee loop to measured half-height (fonts/resize/viewport reflow) to avoid end-of-loop jumps. */
function TestimonialsWaveMarquee({ loopItems }: { loopItems: TestimonialCarouselItem[] }) {
  const trackRef = useRef<HTMLUListElement>(null);

  useLayoutEffect(() => {
    const el = trackRef.current;
    if (!el) return;

    let debounceTimer: ReturnType<typeof window.setTimeout> | undefined;

    const syncLoopDistance = (restartAnimation: boolean) => {
      const { scrollHeight } = el;
      if (scrollHeight < 4) return;
      const halfPx = scrollHeight / 2;
      const prevRaw = el.style.getPropertyValue('--mm-testimonials-marquee-loop-px');
      const prev = prevRaw.endsWith('px') ? Number.parseFloat(prevRaw) : NaN;
      const next = `${halfPx}px`;
      if (prevRaw === next) return;

      el.style.setProperty('--mm-testimonials-marquee-loop-px', next);

      if (restartAnimation && !Number.isNaN(prev) && Math.abs(prev - halfPx) > 0.5) {
        el.style.animation = 'none';
        void el.offsetHeight;
        el.style.removeProperty('animation');
      }
    };

    const schedule = () => {
      window.clearTimeout(debounceTimer);
      debounceTimer = window.setTimeout(() => syncLoopDistance(true), 100);
    };

    syncLoopDistance(false);

    const ro = new ResizeObserver(schedule);
    ro.observe(el);

    const fonts = typeof document !== 'undefined' ? document.fonts : undefined;
    const fontsDone = fonts?.ready?.then(() => syncLoopDistance(true));

    return () => {
      ro.disconnect();
      window.clearTimeout(debounceTimer);
      void fontsDone;
    };
  }, [loopItems]);

  return (
    <div className="mm-testimonials-wave__marquee" aria-label="Client testimonials, scrolling">
      <div className="mm-testimonials-wave__marquee-mask">
        <ul ref={trackRef} className="mm-testimonials-wave__marquee-track">
          {loopItems.map((item, index) => (
            <li className="mm-testimonials-wave__marquee-cell" key={`${item.name}-${index}`}>
              <TestimonialCardArticle quote={item.quote} name={item.name} role={item.role} />
            </li>
          ))}
        </ul>
      </div>
    </div>
  );
}

export function Testimonials() {
  const sectionRef = useRef<HTMLElement>(null);
  const waveRunning = useInView(sectionRef, { amount: 0.12, margin: '0px 0px -8% 0px' });
  const { title, items } = CONTENT.testimonials;
  const reduceMotion = useReducedMotion();
  const titleWords = useMemo(() => title.trim().split(/\s+/).filter(Boolean), [title]);
  const loopItems = useMemo(() => [...items, ...items], [items]);

  return (
    <section
      ref={sectionRef}
      className="testimonials-carousel mm-section mm-section--testimonials mm-testimonials-wave"
      id="testimonials"
      aria-labelledby="testimonials-title"
    >
      <TestimonialsWaveBackground running={waveRunning} />
      <div className="mm-testimonials-wave__gradient" aria-hidden />
      <div className="testimonials-carousel-inner mm-testimonials-wave__inner">
        <div className="mm-testimonials-wave__grid">
          <header className="mm-testimonials-wave__head">
            <h2 className="mm-testimonials-wave__title" id="testimonials-title">
              <span className="mm-testimonials-wave__title-anim">
                {reduceMotion ? (
                  titleWords.map((word, i) => (
                    <span className="mm-testimonials-wave__title-line" key={`${i}-${word}`}>
                      {word}
                    </span>
                  ))
                ) : (
                  <AuroraText
                    className="relative z-10 flex flex-col items-start"
                    colors={['#fffef0', '#fff9c4', '#fde047', '#fbbf24', '#ca8a04']}
                    speed={1.15}
                  >
                    {titleWords.map((word, i) => (
                      <span className="mm-testimonials-wave__title-line" key={`${i}-${word}`}>
                        {word}
                      </span>
                    ))}
                  </AuroraText>
                )}
              </span>
            </h2>
          </header>

          {reduceMotion ? (
            <ul className="mm-testimonials-wave__static">
              {items.map((item, index) => (
                <li key={`${item.name}-${index}`}>
                  <TestimonialCardArticle quote={item.quote} name={item.name} role={item.role} />
                </li>
              ))}
            </ul>
          ) : (
            <TestimonialsWaveMarquee loopItems={loopItems} />
          )}
        </div>
      </div>
    </section>
  );
}

export function CrashPlayground() {
  return (
    <section className="mm-section mm-signal-panel" aria-label="Studio signals">
      <div>
        <MousePointer2 size={20} aria-hidden />
        <span>Interactive briefs</span>
      </div>
      <div>
        <BarChart3 size={20} aria-hidden />
        <span>Launch metrics</span>
      </div>
      <div>
        <Zap size={20} aria-hidden />
        <span>Fast production</span>
      </div>
    </section>
  );
}

export { GalaxyBackground } from './GalaxyBackground';
