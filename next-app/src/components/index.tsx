'use client';

import { useEffect, useLayoutEffect, useMemo, useRef, useState, useSyncExternalStore } from 'react';
import type React from 'react';
import Image from 'next/image';
import Link from 'next/link';
import { useInView } from 'framer-motion';
import { AnimatePresence, motion, useReducedMotion } from 'motion/react';
import { createPortal } from 'react-dom';
import {
  ArrowUpRight,
  BadgeCheck,
  BarChart3,
  CircleDot,
  MousePointer2,
  Sparkles,
  Zap,
} from 'lucide-react';
import { CONTENT } from '@/lib/content';
import { openContactModalFromApp } from '@/lib/contactModalEvents';
import SmokeyBackground from '@/components/lightswind/smokey-background';
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
type InnerPageKind = 'work' | 'about';

const CASE_IMAGE = '/assets/generated/maser-case-wall.png';

const processSteps = [
  {
    title: 'Direct communication',
    text: 'You work close to the people making the decisions and the work, so feedback stays visible and turns into progress quickly.',
  },
  {
    title: 'One connected system',
    text: 'Brand, website, content, and launch assets share one point of view, so the final experience feels aligned instead of stitched together.',
  },
  {
    title: 'Built for launch pressure',
    text: 'Every sprint is scoped around clear decisions, realistic timelines, reusable assets, and what your team needs to send next.',
  },
];

const whyMaserMediaSubtitle =
  'Maser Media is built for companies, startups, and brands\nthat need a polished brand presence without slow layers.';

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
  const bars = useMemo(
    () =>
      Array.from({ length: serviceAuroraBars }, (_, index) => ({
        height: getAuroraBarHeight(index, serviceAuroraBars, 0, 0.16, 0.82),
        delay: index * -0.18,
        drift: 0.82 + ((index % 7) * 0.045),
      })),
    [],
  );

  return (
    <div className="mm-services__aurora" aria-hidden="true">
      <div className="mm-services__aurora-bars">
        {bars.map((bar, index) => (
          <div className="mm-services__aurora-bar-wrap" key={`service-aurora-${index}`}>
            <div
              className="mm-services__aurora-bar"
              style={{
                ['--service-bar-height' as string]: `${bar.height * 100}%`,
                ['--service-bar-delay' as string]: `${bar.delay}s`,
                ['--service-bar-drift' as string]: bar.drift,
              }}
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
  const clientHeading = CONTENT.clients.label;
  const headingAccent = clientHeading.endsWith('Us') ? 'Us' : '';
  const headingBase = headingAccent ? clientHeading.slice(0, -headingAccent.length).trimEnd() : clientHeading;

  return (
    <section className="mm-section mm-section--clients mm-clients" aria-labelledby="clients-heading">
      <h2 id="clients-heading" className="mm-clients__headline">
        <span className="mm-clients__headline-text">
          {headingBase}
          {headingAccent ? (
            <>
              {' '}
              <span className="mm-gradient-word">{headingAccent}</span>
            </>
          ) : null}
        </span>
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
            <span className="mm-services__title-line">Serious Craft.</span>
            <span className="mm-services__title-line">Playful Energy.</span>
          </h2>
          <p className="mm-services__lede">
            {CONTENT.services.subtitle ||
              'Brand, web, and content systems built with one launch language: a single, coherent design vocabulary that scales from your logo to your last social post.'}
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
  const sectionRef = useRef<HTMLElement>(null);
  const reduceMotion = useReducedMotion();
  const rippleVisible = useInView(sectionRef, { amount: 0.01, margin: '45% 0px 45% 0px' });
  const landingProjects = CONTENT.work.items.slice(0, 3);

  return (
    <section ref={sectionRef} className="mm-section mm-section--work mm-work relative overflow-hidden" id="work">
      <div className="mm-work__ripple-layer absolute inset-0 z-0" aria-hidden>
        {rippleVisible && !reduceMotion ? <Ripple numCircles={6} /> : null}
      </div>
      <div
        className="mm-work__blue-wash pointer-events-none absolute inset-0 z-[1]"
        aria-hidden
      />
      <div className="relative z-10">
        <div className="mm-section-heading mm-section-heading--wide">
          <h2 className="mm-work__title">{CONTENT.work.title}</h2>
          {CONTENT.work.subtitle ? <p>{CONTENT.work.subtitle}</p> : null}
        </div>
        <div className="mm-work-projects">
          {landingProjects.map((project) => (
            <Link
              key={project.title}
              href={project.link}
              className="mm-work-card"
              target={project.link.startsWith('http') ? '_blank' : undefined}
              rel={project.link.startsWith('http') ? 'noopener noreferrer' : undefined}
            >
              <div className="mm-work-card__image">
                <Image
                  src={project.image ?? CASE_IMAGE}
                  alt=""
                  fill
                  sizes="(max-width: 900px) 92vw, 1180px"
                />
              </div>
              <div className="mm-work-card__body">
                <h3>{project.title}</h3>
                <p>{project.description}</p>
                {project.tags?.length ? (
                  <div className="mm-work-card__tags" aria-label="Project tags">
                    {project.tags.slice(0, 3).map((tag) => (
                      <span key={tag} className="mm-work-card__tag">
                        {tag}
                      </span>
                    ))}
                  </div>
                ) : null}
              </div>
            </Link>
          ))}
        </div>
        <Link href="/work#main-content" className="mm-work-view-all">
          <span>View all projects</span>
          <ArrowUpRight size={20} aria-hidden />
        </Link>
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
        <h2>Why Maser Media</h2>
        <p>{whyMaserMediaSubtitle}</p>
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

export function TrustSection() {
  const { eyebrow, title, subtitle, items } = CONTENT.trust;

  return (
    <section className="mm-section mm-trust" aria-labelledby="trust-title">
      <div className="mm-trust__shell">
        <div className="mm-trust__copy">
          <p className="mm-kicker">{eyebrow}</p>
          <h2 id="trust-title">{title}</h2>
          <p>{subtitle}</p>
        </div>
        <div className="mm-trust__grid">
          {items.map((item, index) => (
            <article key={item.title} className="mm-trust__card">
              <span>{String(index + 1).padStart(2, '0')}</span>
              <h3>{item.title}</h3>
              <p>{item.text}</p>
            </article>
          ))}
        </div>
      </div>
    </section>
  );
}

export function FaqSection() {
  return (
    <section className="mm-section mm-faq" aria-labelledby="faq-title">
      <div className="mm-faq__shell">
        <h2 id="faq-title">{CONTENT.faqs.title}</h2>
        <div className="mm-faq__list">
          {CONTENT.faqs.items.map((item) => (
            <article key={item.question} className="mm-faq__item">
              <h3>{item.question}</h3>
              <p>{item.answer}</p>
            </article>
          ))}
        </div>
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
              {CONTENT.cta.subtitle ? <p className="mm-cta__lead">{CONTENT.cta.subtitle}</p> : null}
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
      <Services />
      <Work />
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
        title={CONTENT.pricing.title}
        copy={CONTENT.pricing.subtitle}
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
        title="Start with the problem. We will shape the path."
        copy="Send the goal, deadline, and what feels unclear. You will get a direct next step from a small team built for quick communication."
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
    about: {
      eyebrow: 'About',
      title: 'A lean creative crew for teams that need senior taste and real output.',
      copy: 'Maser Media works close to the decision makers, keeps the process direct, and builds brand experiences that are clear enough to sell.',
      body: <TrustSection />,
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
    <motion.article
      className={`testimonial-card mm-testimonials-wave__card${className ? ` ${className}` : ''}`}
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      transition={{ duration: 1.35, ease: 'easeInOut' }}
    >
      <Sparkles className="testimonial-card-quote-icon" size={22} aria-hidden />
      <p className="testimonial-card-text">{quote}</p>
      <div className="testimonial-card-footer">
        <div className="testimonial-card-avatar testimonial-card-avatar--placeholder" aria-hidden />
        <div className="testimonial-card-who">
          <strong className="testimonial-card-name">{name}</strong>
          <span className="testimonial-card-role">{role}</span>
        </div>
      </div>
    </motion.article>
  );
}

export function Testimonials() {
  const sectionRef = useRef<HTMLElement>(null);
  const { eyebrow, title, items } = CONTENT.testimonials;
  const reduceMotion = useReducedMotion();
  const visibleCount = Math.min(3, items.length);
  const [visibleIndexes, setVisibleIndexes] = useState(() =>
    Array.from({ length: visibleCount }, (_, index) => index),
  );

  useEffect(() => {
    if (reduceMotion || items.length <= visibleCount) {
      return;
    }

    const interval = window.setInterval(() => {
      setVisibleIndexes((current) => {
        const slot = Math.floor(Math.random() * current.length);
        const availableIndexes = items
          .map((_, index) => index)
          .filter((index) => !current.includes(index) || index === current[slot]);
        const nextPool = availableIndexes.filter((index) => index !== current[slot]);
        const nextIndex = nextPool[Math.floor(Math.random() * nextPool.length)] ?? current[slot];

        return current.map((index, itemSlot) => (itemSlot === slot ? nextIndex : index));
      });
    }, 4200);

    return () => window.clearInterval(interval);
  }, [items, reduceMotion, visibleCount]);

  return (
    <section
      ref={sectionRef}
      className="testimonials-carousel mm-section mm-section--testimonials mm-testimonials-wave"
      id="testimonials"
      aria-labelledby="testimonials-title"
    >
      <div className="mm-testimonials-wave__gradient" aria-hidden />
      <div className="testimonials-carousel-inner mm-testimonials-wave__inner">
        <div className="mm-testimonials-wave__layout">
          <header className="mm-testimonials-wave__head">
            {eyebrow ? <p className="mm-testimonials-wave__eyebrow">{eyebrow}</p> : null}
            <h2 className="mm-testimonials-wave__title" id="testimonials-title">
              {title}
            </h2>
          </header>

          <ul className="mm-testimonials-wave__static mm-testimonials-wave__static--live" aria-live="off">
            {visibleIndexes.map((itemIndex, slot) => {
              const item = items[itemIndex];

              return (
                <li key={`testimonial-slot-${slot}`} className="mm-testimonials-wave__slot">
                  <AnimatePresence mode="wait" initial={false}>
                    <TestimonialCardArticle
                      key={`${slot}-${item.name}`}
                      quote={item.quote}
                      name={item.name}
                      role={item.role}
                    />
                  </AnimatePresence>
                </li>
              );
            })}
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
