'use client';

import { useLayoutEffect, useMemo, useRef, useState, useSyncExternalStore } from 'react';
import type React from 'react';
import Image from 'next/image';
import Link from 'next/link';
import { useInView } from 'framer-motion';
import { motion, useAnimationFrame, useReducedMotion } from 'motion/react';
import { createPortal } from 'react-dom';
import {
  ArrowUpRight,
  BadgeCheck,
  BarChart3,
  ChevronLeft,
  ChevronRight,
  CircleDot,
  MousePointer2,
  Sparkles,
  Zap,
} from 'lucide-react';
import { CONTENT } from '@/lib/content';
import { openContactModalFromApp } from '@/lib/contactModalEvents';
import SmokeyBackground from '@/components/lightswind/smokey-background';
import AuroraShader from '@/components/lightswind/aurora-shader';
import { AuroraText } from '@/registry/magicui/aurora-text';
import { Ripple } from '@/registry/magicui/ripple';
import { useGsapLandingMotion } from '@/hooks/useGsapLandingMotion';
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from '@/components/ui/accordion';
import { LiquidNav } from './LiquidNav';
import { ContactFlow } from './ContactFlow';
import { AsciiWaveFooter } from './AsciiWaveFooter';
import { FooterCoolButton } from './FooterCoolButton';

type EntranceProps = { entrance?: boolean };
type NavProps = EntranceProps & { introReady?: boolean };
type HeroProps = EntranceProps & { onIntroDone?: () => void };
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

const serviceSummaries: Record<string, string> = {
  Brand:
    'The foundation of every system we build: positioning, identity, and visual rules that hold up across every surface.',
  Web:
    'Where your brand becomes interactive: clear, polished pages and product surfaces built to convert without losing craft.',
  Content:
    'The fuel that keeps the system alive: image, video, illustration, and motion assets that make launches feel current.',
};

const testimonialAuroraStops = ['#F8F8F8', '#10A4FF', '#0065A3'];
const textRollStagger = 0.035;
const heartColors = ['#ff2fd6', '#ff4b5f', '#ff7a1a', '#ffe100', '#34f56f', '#16d9ff', '#8b5cff'];
const serviceAuroraBars = 28;

function getAuroraBarHeight(index: number, total: number, time: number, minHeight: number, maxHeight: number) {
  const normalized = total <= 1 ? 0 : index / (total - 1);
  const arch = Math.sin(normalized * Math.PI);
  const phaseOne = (index / total) * Math.PI * 2;
  const phaseTwo = (index / total) * Math.PI * 5.3;
  const wave = 0.5 + 0.25 * Math.sin(time * 1.1 + phaseOne) + 0.25 * Math.sin(time * 0.7 + phaseTwo);
  const blended = arch * 0.65 + wave * 0.35;

  return minHeight + blended * (maxHeight - minHeight);
}

function ServicesAuroraBars() {
  const shouldReduceMotion = useReducedMotion();
  const timeRef = useRef(0);
  const [heights, setHeights] = useState(() =>
    Array.from({ length: serviceAuroraBars }, (_, index) =>
      getAuroraBarHeight(index, serviceAuroraBars, 0, 0.16, 0.82),
    ),
  );

  useAnimationFrame((_, delta) => {
    if (shouldReduceMotion) {
      return;
    }

    timeRef.current += (delta / 1000) * 0.28;
    setHeights(
      Array.from({ length: serviceAuroraBars }, (_, index) =>
        getAuroraBarHeight(index, serviceAuroraBars, timeRef.current, 0.16, 0.82),
      ),
    );
  });

  return (
    <div className="mm-services__aurora" aria-hidden="true">
      <div className="mm-services__aurora-bars">
        {heights.map((height, index) => (
          <div className="mm-services__aurora-bar-wrap" key={`service-aurora-${index}`}>
            <motion.div
              className="mm-services__aurora-bar"
              style={{ height: `${height * 100}%` }}
            />
          </div>
        ))}
      </div>
      <div className="mm-services__aurora-mask" />
    </div>
  );
}

function subscribeToHydration() {
  return () => {};
}

function getHydratedSnapshot() {
  return true;
}

function getServerHydratedSnapshot() {
  return false;
}

function useHydrated() {
  return useSyncExternalStore(subscribeToHydration, getHydratedSnapshot, getServerHydratedSnapshot);
}

function TextRoll({ children, className = '', center = false }: { children: string; className?: string; center?: boolean }) {
  const letters = children.split('');

  return (
    <motion.span
      initial="initial"
      className={`mm-text-roll ${className}`}
      aria-label={children}
    >
      <span className="mm-text-roll__row" aria-hidden>
        {letters.map((letter, index) => {
          const delay = center ? textRollStagger * Math.abs(index - (letters.length - 1) / 2) : textRollStagger * index;
          return (
            <motion.span
              className="mm-text-roll__char"
              variants={{ initial: { y: '0%', opacity: 1 }, hovered: { y: '-112%', opacity: 0 } }}
              transition={{ duration: 0.42, ease: 'easeInOut', delay }}
              key={`top-${letter}-${index}`}
            >
              {letter === ' ' ? '\u00a0' : letter}
            </motion.span>
          );
        })}
      </span>
      <span className="mm-text-roll__row mm-text-roll__row--clone" aria-hidden>
        {letters.map((letter, index) => {
          const delay = center ? textRollStagger * Math.abs(index - (letters.length - 1) / 2) : textRollStagger * index;
          return (
            <motion.span
              className="mm-text-roll__char"
              variants={{ initial: { y: '112%', opacity: 0 }, hovered: { y: '0%', opacity: 1 } }}
              transition={{ duration: 0.42, ease: 'easeInOut', delay }}
              key={`clone-${letter}-${index}`}
            >
              {letter === ' ' ? '\u00a0' : letter}
            </motion.span>
          );
        })}
      </span>
    </motion.span>
  );
}

function FlipText({ text, className = '', stagger = 0.04 }: { text: string; className?: string; stagger?: number }) {
  const parts = text.split(/(\s+)/);

  return (
    <motion.span
      className={`mm-flip-text ${className}`}
      initial="hidden"
      whileInView="show"
      viewport={{ once: true, amount: 0.65 }}
      aria-label={text}
    >
      {parts.map((part, index) => {
        if (/^\s+$/.test(part)) {
          return <span aria-hidden key={`space-${index}`}> </span>;
        }

        return (
          <motion.span
            className="mm-flip-text__word"
            variants={{
              hidden: { opacity: 0, y: 18, rotateX: -86 },
              show: { opacity: 1, y: 0, rotateX: 0 },
            }}
            transition={{ duration: 0.62, ease: [0.22, 1, 0.36, 1], delay: index * stagger }}
            key={`${part}-${index}`}
            aria-hidden
          >
            {part}
          </motion.span>
        );
      })}
    </motion.span>
  );
}

export function Nav({ entrance, introReady }: NavProps) {
  return <LiquidNav entrance={entrance} introReady={introReady} />;
}

export function Hero({ entrance, onIntroDone }: HeroProps) {
  const [curtainDone, setCurtainDone] = useState(!entrance);
  const hydrated = useHydrated();

  useLayoutEffect(() => {
    if (!entrance) {
      onIntroDone?.();
      return;
    }

    const previousScrollRestoration = window.history.scrollRestoration;
    const previousOverflow = document.documentElement.style.overflow;
    const previousBodyOverflow = document.body.style.overflow;
    window.history.scrollRestoration = 'manual';
    document.documentElement.style.overflow = 'hidden';
    document.body.style.overflow = 'hidden';
    window.scrollTo(0, 0);
    document.documentElement.scrollTop = 0;
    document.body.scrollTop = 0;

    let animationFrame = 0;
    const pinToTop = () => {
      window.scrollTo(0, 0);
      document.documentElement.scrollTop = 0;
      document.body.scrollTop = 0;
      animationFrame = window.requestAnimationFrame(pinToTop);
    };
    animationFrame = window.requestAnimationFrame(pinToTop);

    const timeout = window.setTimeout(() => {
      window.cancelAnimationFrame(animationFrame);
      setCurtainDone(true);
      onIntroDone?.();
      window.history.scrollRestoration = previousScrollRestoration;
      document.documentElement.style.overflow = previousOverflow;
      document.body.style.overflow = previousBodyOverflow;
      document.body.classList.add('mm-intro-complete');
    }, 1550);

    return () => {
      window.clearTimeout(timeout);
      window.cancelAnimationFrame(animationFrame);
      window.history.scrollRestoration = previousScrollRestoration;
      document.documentElement.style.overflow = previousOverflow;
      document.body.style.overflow = previousBodyOverflow;
      document.body.classList.remove('mm-intro-mounted');
    };
  }, [entrance, onIntroDone]);

  return (
    <header className={`mm-hero${curtainDone ? ' mm-hero--curtain-done' : ''}`}>
      <div className="mm-hero__bg-scale" aria-hidden>
        <div className="mm-hero__smokey">
          <SmokeyBackground color="#10A4FF" backdropBlurAmount="none" className="h-full min-h-0 w-full" />
        </div>
        <div className="mm-hero__grain" aria-hidden />
      </div>
      <div className="mm-hero__exit-splash" aria-hidden />
      {entrance && hydrated
        ? createPortal(
            <div
              className={`mm-hero__load-curtain${curtainDone ? ' mm-hero__load-curtain--done' : ''}`}
              aria-hidden="true"
              ref={(node) => {
                document.body.classList.toggle('mm-intro-mounted', Boolean(node && !curtainDone));
              }}
            >
              <span className="mm-hero__reveal-dot" />
            </div>,
            document.body,
          )
        : null}
      <motion.div
        className="mm-hero__content"
        initial={entrance ? { opacity: 0, y: 24 } : false}
        animate={entrance && curtainDone ? { opacity: 1, y: 0 } : entrance ? { opacity: 0, y: 24 } : false}
        transition={entrance ? { duration: 0.8, ease: [0.22, 1, 0.36, 1] } : undefined}
      >
        <div className="mm-hero__content-shift">
          <div className="mm-hero__copy">
            <Image
              src="/assets/MaserMedia-White-SVG_1.svg"
              alt="Maser Media"
              width={320}
              height={162}
              className="mm-hero__mobile-logo"
              priority
            />
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
        <TextRoll center>{CONTENT.clients.label}</TextRoll>
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
  const defaultService = pillars[0]?.title.toLowerCase() ?? 'brand';

  return (
    <section
      className="mm-section mm-section--services mm-services"
      id="services"
      aria-labelledby="services-heading"
    >
      <ServicesAuroraBars />
      <div className="mm-services__shell">
        <div className="mm-services__masthead">
          <h2 id="services-heading" className="mm-services__title">
            Services.
          </h2>
          <p className="mm-services__lede">
            Brand, web, and content systems built with one launch language: a single, coherent design vocabulary
            that scales from your logo to your last social post.
          </p>
        </div>

        <Accordion className="mm-services__accordion" defaultValue={[defaultService]}>
          {pillars.map((pillar) => {
            const value = pillar.title.toLowerCase();
            return (
              <AccordionItem className="mm-services__accordion-item" key={pillar.title} value={value}>
                <AccordionTrigger className="mm-services__accordion-trigger">
                  <span className="mm-services__accordion-trigger-copy">
                    <span className="mm-services__accordion-title">{pillar.title}</span>
                    <span className="mm-services__accordion-summary">
                      {serviceSummaries[pillar.title] ?? pillar.items[0]?.description}
                    </span>
                  </span>
                </AccordionTrigger>
                <AccordionContent className="mm-services__accordion-content">
                  <ul className="mm-services__service-grid">
                    {pillar.items.map((service) => (
                      <motion.li
                        className="mm-services__service-card"
                        key={service.label}
                        transition={{ duration: 0.42, ease: [0.16, 1, 0.3, 1] }}
                      >
                        <h3>{service.label}</h3>
                        <p>{service.description}</p>
                      </motion.li>
                    ))}
                  </ul>
                </AccordionContent>
              </AccordionItem>
            );
          })}
        </Accordion>

        <button
          type="button"
          className="mm-services__contact"
          onClick={() => openContactModalFromApp()}
        >
          <span>Contact</span>
          <ArrowUpRight className="mm-services__contact-icon" size={22} aria-hidden />
        </button>
      </div>
    </section>
  );
}

export function Work() {
  const [activeCategory, setActiveCategory] = useState('All');
  const [previewCategory, setPreviewCategory] = useState<string | null>(null);
  const [projectIndex, setProjectIndex] = useState(0);
  const [transitionKey, setTransitionKey] = useState(0);
  const touchStartX = useRef<number | null>(null);
  const displayCategory = previewCategory ?? activeCategory;
  const filteredProjects = useMemo(
    () => CONTENT.work.items.filter((project) => displayCategory === 'All' || project.category === displayCategory),
    [displayCategory],
  );
  const displayedProjectIndex = previewCategory ? 0 : projectIndex;
  const activeProject = filteredProjects[displayedProjectIndex] ?? filteredProjects[0];
  const hasMultipleProjects = filteredProjects.length > 1;

  const switchProject = (direction: -1 | 1) => {
    if (previewCategory) {
      setPreviewCategory(null);
    }
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

  const previewProjectCategory = (category: string) => {
    if (category !== displayCategory) {
      setTransitionKey((key) => key + 1);
    }
    setPreviewCategory(category);
  };

  return (
    <section className="mm-section mm-section--work mm-work relative overflow-hidden" id="work">
      <div className="mm-work__ripple-layer absolute inset-0 z-0" aria-hidden>
        <Ripple />
      </div>
      <div
        className="mm-work__blue-wash pointer-events-none absolute inset-0 z-[1]"
        aria-hidden
      />
      <div className="relative z-10">
        <div className="mm-section-heading mm-section-heading--wide">
          <h2 className="mm-work__title">{CONTENT.work.title}</h2>
          <p>{CONTENT.work.subtitle}</p>
        </div>
        <div className="mm-work-tabs" aria-label="Project categories" onMouseLeave={() => setPreviewCategory(null)}>
          {CONTENT.work.categories.map((category) => (
            <button
              key={category}
              type="button"
              className="mm-work-tab"
              aria-pressed={activeCategory === category}
              onMouseEnter={() => previewProjectCategory(category)}
              onFocus={() => previewProjectCategory(category)}
              onBlur={() => setPreviewCategory(null)}
              onClick={() => {
                setProjectIndex(0);
                setActiveCategory(category);
                setPreviewCategory(null);
                setTransitionKey((key) => key + 1);
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
                      {displayedProjectIndex + 1} / {filteredProjects.length}
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
  const [activeStep, setActiveStep] = useState(0);
  const nextStep = () => setActiveStep((index) => (index + 1) % processSteps.length);

  return (
    <section className="mm-section mm-section--process stack-motion">
      <div className="mm-section-heading">
        <h2>Fast does not have to feel rushed.</h2>
        <p>
          The process is built around decisive creative direction, clear delivery rhythms, and enough motion
          detail to make the launch feel expensive.
        </p>
      </div>
      <div className="stack-grid stack-grid--interactive" role="list" aria-label="Process steps">
        {processSteps.map((step, index) => {
          const offset = (index - activeStep + processSteps.length) % processSteps.length;
          const isActive = offset === 0;

          return (
            <motion.button
              key={step.title}
              type="button"
              role="listitem"
              className={`stack-card stack-card--flip flex flex-col${isActive ? ' is-active' : ''}`}
              style={{ ['--stack-index' as string]: index }}
            animate={{
                y: offset * 18,
                scale: 1 - offset * 0.055,
                rotateX: isActive ? 0 : -7,
                opacity: 1,
                zIndex: processSteps.length - offset,
              }}
              transition={{ duration: 0.48, ease: [0.22, 1, 0.36, 1] }}
              onClick={nextStep}
              aria-label={`Show next process card. Current card: ${step.title}`}
            >
              <span>{String(index + 1).padStart(2, '0')}</span>
              <h3>{step.title}</h3>
              <p>{step.text}</p>
            </motion.button>
          );
        })}
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
                <FlipText text={CONTENT.cta.title} />
              </h2>
              <p className="mm-cta__lead">
                <FlipText text={CONTENT.cta.subtitle} className="mm-flip-text--lead" stagger={0.014} />
              </p>
              <div className="mm-cta__actions mm-cta__actions--contact">
                <button
                  type="button"
                  className="liquid-nav-contact liquid-nav-contact--inline mm-cta__contact-btn"
                  onClick={() => openContactModalFromApp()}
                >
                  {CONTENT.cta.contactButtonLabel}
                  <ArrowUpRight className="liquid-contact-arrow" size={15} aria-hidden />
                </button>
              </div>
            </div>
            <div className="mm-cta__logo-stage" aria-hidden>
              <Image
                src="/assets/Blue-HD.svg"
                alt=""
                width={520}
                height={280}
                className="mm-cta__logo"
              />
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

export function LandingPage({ onHeroIntroDone }: { onHeroIntroDone?: () => void }) {
  const rootRef = useRef<HTMLElement>(null);
  useGsapLandingMotion(rootRef);

  return (
    <main ref={rootRef} id="main-content" className="site-main mm-main">
      <Hero entrance onIntroDone={onHeroIntroDone} />
      <Clients />
      <ProcessStack />
      <Services />
      <Work />
      <MotionSystem />
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

export function Testimonials() {
  const sectionRef = useRef<HTMLElement>(null);
  const auroraVisible = useInView(sectionRef, { amount: 0.01, margin: '55% 0px 55% 0px' });
  const { title, items } = CONTENT.testimonials;
  const reduceMotion = useReducedMotion();
  const titleWords = useMemo(() => title.trim().split(/\s+/).filter(Boolean), [title]);
  const [hearts, setHearts] = useState<
    { id: number; x: number; y: number; color: string; dx: number; dy: number; rotate: number }[]
  >([]);

  const handleTestimonialsClick = (event: React.MouseEvent<HTMLElement>) => {
    const bounds = event.currentTarget.getBoundingClientRect();
    const angle = Math.random() * Math.PI * 2;
    const distance = 28 + Math.random() * 38;
    const id = Date.now() + Math.floor(Math.random() * 1000);
    const nextHeart = {
      id,
      x: event.clientX - bounds.left,
      y: event.clientY - bounds.top,
      color: heartColors[Math.floor(Math.random() * heartColors.length)],
      dx: Math.cos(angle) * distance,
      dy: Math.sin(angle) * distance - (18 + Math.random() * 28),
      rotate: -28 + Math.random() * 56,
    };

    setHearts((current) => [...current.slice(-18), nextHeart]);
    window.setTimeout(() => {
      setHearts((current) => current.filter((heart) => heart.id !== id));
    }, 760);
  };

  return (
    <section
      ref={sectionRef}
      className="testimonials-carousel mm-section mm-section--testimonials mm-testimonials-wave"
      id="testimonials"
      aria-labelledby="testimonials-title"
      onClick={handleTestimonialsClick}
    >
      <div className="mm-testimonials-wave__aurora" aria-hidden>
        {auroraVisible ? (
          <AuroraShader
            colorStops={testimonialAuroraStops}
            amplitude={1.18}
            blend={0.42}
            speed={reduceMotion ? 0 : 0.68}
          />
        ) : null}
      </div>
      <div className="mm-testimonials-wave__gradient" aria-hidden />
      <div className="mm-testimonials-hearts" aria-hidden>
        {hearts.map((heart) => (
          <span
            key={heart.id}
            className="mm-testimonials-heart"
            style={{
              left: heart.x,
              top: heart.y,
              color: heart.color,
              ['--heart-x' as string]: `${heart.dx}px`,
              ['--heart-y' as string]: `${heart.dy}px`,
              ['--heart-rotate' as string]: `${heart.rotate}deg`,
            }}
          >
            ♥
          </span>
        ))}
      </div>
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
                    colors={['#ffffff', '#f8fafc', '#f1f5f9', '#e2e8f0', '#cbd5e1']}
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

          <ul className="mm-testimonials-wave__static mm-testimonials-wave__static--live">
            {items.map((item, index) => (
              <li key={`${item.name}-${index}`}>
                <TestimonialCardArticle quote={item.quote} name={item.name} role={item.role} />
              </li>
            ))}
          </ul>
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
