'use client';

import { useEffect, useMemo, useRef, useState } from 'react';
import type React from 'react';
import Image from 'next/image';
import Link from 'next/link';
import { motion, useReducedMotion } from 'motion/react';
import {
  ArrowRight,
  BadgeCheck,
  BarChart3,
  Check,
  ChevronLeft,
  ChevronRight,
  CircleDot,
  Layers3,
  MousePointer2,
  Sparkles,
  Zap,
} from 'lucide-react';
import { CONTENT } from '@/lib/content';
import { HeroParticles } from './HeroParticles';
import { LiquidNav } from './LiquidNav';
import { ContactFlow } from './ContactFlow';

type EntranceProps = { entrance?: boolean };
type InnerPageKind = 'work' | 'services' | 'about';

const HERO_IMAGE = '/assets/generated/maser-hero-studio.png';
const CASE_IMAGE = '/assets/generated/maser-case-wall.png';

const studioStats = [
  { value: '2-4w', label: 'Launch sprints' },
  { value: '$2k', label: 'Retainer entry' },
  { value: '1', label: 'Integrated crew' },
];

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

export function Nav({ entrance }: EntranceProps) {
  return <LiquidNav entrance={entrance} />;
}

function useGsapLandingMotion(rootRef: React.RefObject<HTMLElement | null>) {
  useEffect(() => {
    if (!rootRef.current) return;

    let cleanup = () => {};
    let cancelled = false;

    const run = async () => {
      const [{ gsap }, { ScrollTrigger }] = await Promise.all([
        import('gsap'),
        import('gsap/ScrollTrigger'),
      ]);
      if (cancelled || !rootRef.current) return;

      gsap.registerPlugin(ScrollTrigger);

      const ctx = gsap.context(() => {
        gsap.utils.toArray<HTMLElement>('.motion-rise').forEach((el) => {
          gsap.fromTo(
            el,
            { y: 70, opacity: 0, scale: 0.96 },
            {
              y: 0,
              opacity: 1,
              scale: 1,
              ease: 'power3.out',
              scrollTrigger: {
                trigger: el,
                start: 'top 84%',
                end: 'top 48%',
                scrub: 0.7,
              },
            },
          );
        });

        gsap.to('.marquee-row--primary', {
          xPercent: -35,
          ease: 'none',
          scrollTrigger: {
            trigger: '.marquee-system',
            start: 'top bottom',
            end: 'bottom top',
            scrub: 1.1,
          },
        });

        gsap.to('.marquee-row--secondary', {
          xPercent: 28,
          ease: 'none',
          scrollTrigger: {
            trigger: '.marquee-system',
            start: 'top bottom',
            end: 'bottom top',
            scrub: 1.1,
          },
        });

        gsap.utils.toArray<HTMLElement>('.stack-card').forEach((card, index) => {
          gsap.fromTo(
            card,
            { y: 120 + index * 24, opacity: 0.35, rotate: index % 2 === 0 ? -2 : 2 },
            {
              y: index * -18,
              opacity: 1,
              rotate: 0,
              ease: 'none',
              scrollTrigger: {
                trigger: '.stack-motion',
                start: 'top 76%',
                end: 'bottom 38%',
                scrub: true,
              },
            },
          );
        });
      }, rootRef);

      cleanup = () => ctx.revert();
    };

    run();

    return () => {
      cancelled = true;
      cleanup();
    };
  }, [rootRef]);
}

export function Hero({ entrance }: EntranceProps) {
  const reduceMotion = useReducedMotion();

  return (
    <header className="mm-hero">
      <HeroParticles />
      <motion.div
        className="mm-hero__content"
        initial={entrance ? { opacity: 0, y: 24, filter: reduceMotion ? 'none' : 'blur(14px)' } : false}
        animate={entrance ? { opacity: 1, y: 0, filter: 'blur(0px)' } : false}
        transition={entrance ? { duration: 0.8, ease: [0.22, 1, 0.36, 1] } : undefined}
      >
        <div className="mm-hero__logo-wrap">
          <Image
            src="/assets/logo-maser-cloud-white-transparent.png"
            alt={CONTENT.site.logoAlt}
            width={CONTENT.site.logoWidth}
            height={CONTENT.site.logoHeight}
            className="mm-hero__logo mm-hero__logo--plain"
            priority
          />
        </div>
        <div className="mm-hero__copy">
          <h1 className="mm-hero__title">Brand, web and products for teams ready to look unavoidable to the world.</h1>
          <p className="mm-hero__lead">
            Maser Media blends Bou-style agency craft with Visitors-style product clarity: sharp positioning,
            polished systems, launch-ready websites, and motion that makes people keep scrolling.
          </p>
          <div className="mm-hero__actions">
            <Link href="/contact" className="mm-button mm-button--primary">
              Book a call <ArrowRight size={18} aria-hidden />
            </Link>
            <Link href="/work" className="mm-button mm-button--ghost">
              View work
            </Link>
          </div>
        </div>
      </motion.div>
      <motion.div
        className="mm-hero__media motion-rise"
        initial={entrance ? { opacity: 0, y: 42, scale: 0.94 } : false}
        animate={entrance ? { opacity: 1, y: 0, scale: 1 } : false}
        transition={entrance ? { duration: 0.9, delay: 0.2, ease: [0.22, 1, 0.36, 1] } : undefined}
      >
        <Image src={HERO_IMAGE} alt="" fill priority sizes="(max-width: 768px) 92vw, 1120px" />
        <div className="mm-hero__dashboard" aria-hidden="true">
          <span>Live launch velocity</span>
          <strong>98%</strong>
          <small>clarity score</small>
        </div>
      </motion.div>
    </header>
  );
}

export function Clients() {
  const logos = [...CONTENT.clients.items, ...CONTENT.clients.items];

  return (
    <section className="mm-section mm-clients motion-rise" aria-label="Trusted by">
      <p className="mm-kicker">{CONTENT.clients.label}</p>
      <div className="mm-client-strip">
        {logos.map((item, index) => (
          <span key={`${item.name}-${index}`} className="mm-client-pill">
            {item.name}
          </span>
        ))}
      </div>
    </section>
  );
}

export function Services() {
  const [active, setActive] = useState(CONTENT.services.items[0]?.title ?? '');
  const activeService = CONTENT.services.items.find((item) => item.title === active) ?? CONTENT.services.items[0];

  return (
    <section className="mm-section mm-services motion-rise" id="services">
      <div className="mm-section-heading">
        <p className="mm-kicker">Services</p>
        <h2>One studio for the whole launch surface.</h2>
        <p>
          Strategy, identity, web, content, and motion stay connected so the experience feels built by one
          opinionated team.
        </p>
      </div>
      <div className="mm-service-board">
        <div className="mm-service-tabs" role="tablist" aria-label="Service categories">
          {CONTENT.services.items.map((service) => (
            <button
              key={service.title}
              type="button"
              role="tab"
              aria-selected={active === service.title}
              className="mm-service-tab"
              onClick={() => setActive(service.title)}
            >
              {service.title}
            </button>
          ))}
        </div>
        <div className="mm-service-panel">
          <div>
            <span className="mm-panel-icon">
              <Layers3 size={20} aria-hidden />
            </span>
            <h3>{activeService.title}</h3>
          </div>
          <ul>
            {activeService.items.map((item) => (
              <li key={item}>
                <Check size={18} aria-hidden />
                {item}
              </li>
            ))}
          </ul>
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
    <section className="mm-section mm-work motion-rise" id="work">
      <div className="mm-section-heading mm-section-heading--wide">
        <p className="mm-kicker">Work</p>
        <h2>{CONTENT.work.title}</h2>
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
    </section>
  );
}

export function MotionSystem() {
  return (
    <section className="mm-section marquee-system" aria-label="Creative system">
      <div className="marquee-row marquee-row--primary">
        {motionPanels.concat(motionPanels).map((item, index) => (
          <span key={`primary-${item}-${index}`}>{item}</span>
        ))}
      </div>
      <div className="marquee-row marquee-row--secondary">
        {['Brand', 'Web', 'Motion', 'Strategy', 'Content', 'Launch', 'Systems', 'Conversion'].map((item, index) => (
          <span key={`secondary-${item}-${index}`}>{item}</span>
        ))}
      </div>
    </section>
  );
}

export function ProcessStack() {
  return (
    <section className="mm-section stack-motion">
      <div className="mm-section-heading">
        <p className="mm-kicker">How it moves</p>
        <h2>Fast does not have to feel thin.</h2>
        <p>
          The process is built around decisive creative direction, clear delivery rhythms, and enough motion
          detail to make the launch feel expensive.
        </p>
      </div>
      <div className="stack-grid">
        {processSteps.map((step, index) => (
          <article key={step.title} className="stack-card" style={{ ['--stack-index' as string]: index }}>
            <span>{String(index + 1).padStart(2, '0')}</span>
            <h3>{step.title}</h3>
            <p>{step.text}</p>
          </article>
        ))}
      </div>
    </section>
  );
}

export function AboutPreview() {
  return (
    <section className="mm-section mm-about-preview motion-rise" id="about">
      <div className="mm-about-preview__media">
        <Image src={CASE_IMAGE} alt="" fill sizes="(max-width: 900px) 92vw, 520px" />
      </div>
      <div>
        <p className="mm-kicker">About</p>
        <h2>Small enough to care. Senior enough to call the shot.</h2>
        <p>
          We are a direct creative partner for founders, operators, and service brands that need one crew
          across story, design, web, and launch content.
        </p>
        <div className="mm-stat-grid">
          {studioStats.map((stat) => (
            <div key={stat.label}>
              <strong>{stat.value}</strong>
              <span>{stat.label}</span>
            </div>
          ))}
        </div>
        <Link href="/about" className="mm-button mm-button--ghost">
          Meet the studio <ArrowRight size={18} aria-hidden />
        </Link>
      </div>
    </section>
  );
}

export function Cta() {
  return (
    <section className="mm-section mm-cta motion-rise" id="contact">
      <p className="mm-kicker">Contact</p>
      <h2>{CONTENT.cta.title}</h2>
      <p>{CONTENT.cta.subtitle}</p>
      <div className="mm-cta__actions">
        <Link href={CONTENT.cta.primaryButton.href} className="mm-button mm-button--primary">
          {CONTENT.cta.primaryButton.text} <ArrowRight size={18} aria-hidden />
        </Link>
        <a href={CONTENT.cta.secondaryButton.href} className="mm-button mm-button--ghost">
          {CONTENT.cta.secondaryButton.text}
        </a>
      </div>
    </section>
  );
}

export function Footer() {
  return (
    <footer className="mm-footer">
      <div className="mm-footer__brand">
        <Image
          src={CONTENT.site.logo}
          alt={CONTENT.site.logoAlt}
          width={CONTENT.site.logoWidth}
          height={CONTENT.site.logoHeight}
        />
        <p>Creative systems for brands that need to ship, sell, and stand out.</p>
      </div>
      <nav className="mm-footer__nav" aria-label="Footer navigation">
        {CONTENT.footer.nav.map((item) => (
          <Link key={item.href} href={item.href}>
            {item.text}
          </Link>
        ))}
      </nav>
      <p className="mm-footer__copy">© {CONTENT.footer.copyright}</p>
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
      <Work />
      <Services />
      <MotionSystem />
      <ProcessStack />
      <Testimonials />
      <AboutPreview />
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
      body: (
        <>
          <AboutPreview />
          <MotionSystem />
        </>
      ),
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
          ★
        </span>
      ))}
    </div>
  );
}

export function Testimonials() {
  const [activeIndex, setActiveIndex] = useState(0);
  const { title, prevLabel, nextLabel, items } = CONTENT.testimonials;
  const active = items[activeIndex];

  const go = (direction: -1 | 1) => {
    setActiveIndex((index) => (index + direction + items.length) % items.length);
  };

  return (
    <section className="testimonials-carousel mm-section motion-rise" id="testimonials" aria-labelledby="testimonials-title">
      <div className="testimonials-carousel-inner">
        <header className="testimonials-carousel-header">
          <p className="testimonials-carousel-eyebrow">Client notes</p>
          <h2 className="testimonials-carousel-title" id="testimonials-title">
            {title}
          </h2>
        </header>
        <div className="mm-testimonial-stage">
          <button
            type="button"
            className="testimonials-carousel-btn testimonials-carousel-btn--muted"
            onClick={() => go(-1)}
            aria-label={prevLabel}
          >
            <ChevronLeft size={20} aria-hidden />
          </button>
          <article className="testimonial-card testimonial-card--active testimonial-card--center" aria-current="true">
            <Sparkles className="testimonial-card-quote-icon" size={24} aria-hidden />
            <Stars />
            <p className="testimonial-card-text">{active.quote}</p>
            <div className="testimonial-card-footer">
              <div className="testimonial-card-avatar testimonial-card-avatar--placeholder" aria-hidden />
              <div className="testimonial-card-who">
                <strong className="testimonial-card-name">{active.name}</strong>
                <span className="testimonial-card-role">{active.role}</span>
              </div>
            </div>
          </article>
          <button
            type="button"
            className="testimonials-carousel-btn testimonials-carousel-btn--primary"
            onClick={() => go(1)}
            aria-label={nextLabel}
          >
            <ChevronRight size={20} aria-hidden />
          </button>
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
