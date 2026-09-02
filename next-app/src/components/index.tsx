'use client';

import { useCallback, useEffect, useLayoutEffect, useRef, useState } from 'react';
import type React from 'react';
import Image from 'next/image';
import Link from 'next/link';
import { AnimatePresence, motion, useReducedMotion } from 'motion/react';
import { createPortal } from 'react-dom';
import {
  ArrowUpRight,
  BarChart3,
  MousePointer2,
  Zap,
} from 'lucide-react';
import { CONTENT } from '@/lib/content';
import { isContactModalHref, openContactModalFromApp } from '@/lib/contactModalEvents';
import { HeroShaderBackground } from '@/components/hero-shader';
import { useGsapLandingMotion, useMmScrollReveals } from '@/hooks/useGsapLandingMotion';
import { useIsClient } from '@/hooks/useIsClient';
import { RevealText, FlipText, SectionTitleReveal } from '@/components/RevealText';
import { ScrollReveal } from '@/components/ScrollReveal';
import { HOME_INTRO_CURTAIN_MS } from '@/lib/homeIntro';
import { sanitizeScrollArtifacts } from '@/lib/scrollSanitize';
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from '@/components/ui/accordion';
import { LiquidNav } from './LiquidNav';
import { AboutFounders } from './AboutFounders';
import { AsciiWaveFooter } from './AsciiWaveFooter';
import { FooterCoolButton } from './FooterCoolButton';
import { AuroraShader, MASER_AURORA_COLOR_STOPS } from './AuroraShader';
import { ProcessBento } from './ProcessBento';
import { CtaLogoTilt } from './CtaLogoTilt';
import { LiquidMetalMeatballs } from '@/components/meatballs';

type EntranceProps = { entrance?: boolean };
type NavProps = EntranceProps & { introReady?: boolean };
type HeroProps = EntranceProps & {
  onCurtainDone?: () => void;
  contentRevealed?: boolean;
};
type InnerPageKind = 'work' | 'about';
type WorkProps = { stacked?: boolean };

const INTRO_SCROLL_KEYS = new Set([
  ' ',
  'Spacebar',
  'ArrowUp',
  'ArrowDown',
  'PageUp',
  'PageDown',
  'Home',
  'End',
]);

function isEditableTarget(target: EventTarget | null) {
  if (!(target instanceof HTMLElement)) return false;
  if (target.isContentEditable) return true;
  const tag = target.tagName;
  return tag === 'INPUT' || tag === 'TEXTAREA' || tag === 'SELECT';
}

const CASE_IMAGE = '/assets/generated/maser-case-wall.png';

const motionPanels = [
  'Realtime launch board',
  'Conversion-first storytelling',
  'Brand systems that travel',
  'Motion assets for rollout',
];

/** Long strip so scrubbing `xPercent` left never opens a gap on the trailing (right) edge. */
const primaryMarqueeItems = Array.from({ length: 10 }, () => motionPanels).flat();

const secondaryMotionPanels = ['Brand', 'Web', 'Motion', 'Strategy', 'Content', 'Launch', 'Systems', 'Conversion'];

/** Tiles immediately left of "Brand" in an infinite strip: … → Web → Brand */
const secondaryMotionBeforeBrand = [...secondaryMotionPanels.slice(1)].reverse();

/**
 * Long lead-in (left in LTR) + many full cycles so scrubbing right never opens a gap on the leading (left) edge.
 */
const secondaryMarqueeItems = [
  ...Array.from({ length: 18 }, () => secondaryMotionBeforeBrand).flat(),
  ...Array.from({ length: 10 }, () => secondaryMotionPanels).flat(),
];

function useStackedWorkPosters(
  sectionRef: React.RefObject<HTMLElement | null>,
  enabled: boolean,
  reduceMotion: boolean | null,
) {
  useEffect(() => {
    if (!enabled || reduceMotion) {
      return;
    }

    let cancelled = false;
    let cleanup = () => {};

    const runStack = async () => {
      const section = sectionRef.current;

      if (!section) {
        return;
      }

      const [{ gsap }, { ScrollTrigger }] = await Promise.all([
        import('gsap'),
        import('gsap/ScrollTrigger'),
      ]);

      if (cancelled || !sectionRef.current) {
        return;
      }

      gsap.registerPlugin(ScrollTrigger);

      const context = gsap.context(() => {
        const wrappers = gsap.utils.toArray<HTMLElement>('.mm-work-card-pin');
        const cards = gsap.utils.toArray<HTMLElement>('.mm-work-card');
        const viewAll = section.querySelector<HTMLElement>('.mm-work-view-all');
        const matchMedia = gsap.matchMedia();

        if (!wrappers.length || !cards.length || !viewAll) {
          return;
        }

        gsap.set(section, { '--mm-work-bg-size': '170%' });
        gsap.set(cards, {
          transformOrigin: 'top center',
          force3D: true,
          willChange: 'transform',
        });

        matchMedia.add('(min-width: 761px) and (pointer: fine)', () => {
          gsap.to(section, {
            '--mm-work-bg-size': '230%',
            ease: 'none',
            scrollTrigger: {
              trigger: section,
              start: 'top bottom',
              endTrigger: viewAll,
              end: 'top 82%',
              scrub: 0.8,
              invalidateOnRefresh: true,
            },
          });

          wrappers.forEach((wrapper, index) => {
            const card = wrapper.querySelector<HTMLElement>('.mm-work-card');

            if (!card) {
              return;
            }

            gsap.set(wrapper, { zIndex: index + 1 });

            gsap.to(card, {
              y: () => -index * 12,
              scale: () => Math.max(0.9, 1 - (wrappers.length - index - 1) * 0.035),
              rotate: index % 2 === 0 ? -0.7 : 0.7,
              ease: 'none',
              scrollTrigger: {
                trigger: wrapper,
                start: 'top top+=112',
                endTrigger: viewAll,
                end: 'top 78%',
                pin: wrapper,
                pinSpacing: false,
                scrub: 0.85,
                anticipatePin: 1,
                invalidateOnRefresh: true,
              },
            });
          });

          ScrollTrigger.refresh();
        });

        matchMedia.add('(max-width: 760px), (pointer: coarse)', () => {
          gsap.fromTo(
            cards,
            { autoAlpha: 0, y: 28 },
            {
              autoAlpha: 1,
              y: 0,
              duration: 0.72,
              stagger: 0.09,
              ease: 'power3.out',
              scrollTrigger: {
                trigger: section,
                start: 'top 78%',
                once: true,
              },
            },
          );
        });
      }, section);

      cleanup = () => {
        context.revert();
      };
    };

    void runStack();

    return () => {
      cancelled = true;
      cleanup();
    };
  }, [enabled, reduceMotion, sectionRef]);
}

function useWorkCardContentReveal(
  sectionRef: React.RefObject<HTMLElement | null>,
  reduceMotion: boolean | null,
) {
  useEffect(() => {
    const section = sectionRef.current;

    if (!section) {
      return;
    }

    const cards = Array.from(section.querySelectorAll<HTMLElement>('.mm-work-card'));

    if (!cards.length) {
      return;
    }

    if (reduceMotion || typeof IntersectionObserver === 'undefined') {
      cards.forEach((card) => {
        card.classList.add('mm-work-card--content-visible');
      });
      return;
    }

    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (!entry.isIntersecting) {
            return;
          }

          entry.target.classList.add('mm-work-card--content-visible');
          observer.unobserve(entry.target);
        });
      },
      {
        rootMargin: '0px 0px -16% 0px',
        threshold: 0.28,
      },
    );

    cards.forEach((card) => {
      observer.observe(card);
    });

    return () => {
      observer.disconnect();
    };
  }, [sectionRef, reduceMotion]);
}

export function Nav({ entrance, introReady }: NavProps) {
  return <LiquidNav entrance={entrance} introReady={introReady} />;
}

export function Hero({ entrance, onCurtainDone, contentRevealed }: HeroProps) {
  const [curtainDone, setCurtainDone] = useState(!entrance);
  const [canMountCurtain, setCanMountCurtain] = useState(false);
  const [scrollUnlocked, setScrollUnlocked] = useState(!entrance);
  const curtainRef = useRef<HTMLDivElement>(null);
  const copyRevealed = contentRevealed ?? !entrance;

  useEffect(() => {
    if (!entrance) return;

    const frame = window.requestAnimationFrame(() => {
      setCanMountCurtain(true);
    });

    return () => {
      window.cancelAnimationFrame(frame);
    };
  }, [entrance]);

  useEffect(() => {
    if (!canMountCurtain || curtainDone) {
      document.body.classList.remove('mm-intro-mounted');
      return;
    }

    document.body.classList.add('mm-intro-mounted');
    return () => {
      document.body.classList.remove('mm-intro-mounted');
    };
  }, [canMountCurtain, curtainDone]);

  useLayoutEffect(() => {
    if (!entrance || scrollUnlocked) return;

    const previousScrollRestoration = window.history.scrollRestoration;
    window.history.scrollRestoration = 'manual';
    window.scrollTo(0, 0);

    const preventScroll = (event: Event) => {
      event.preventDefault();
    };
    const preventKeys = (event: KeyboardEvent) => {
      if (!INTRO_SCROLL_KEYS.has(event.key) || isEditableTarget(event.target)) return;
      event.preventDefault();
    };

    window.addEventListener('wheel', preventScroll, { passive: false });
    window.addEventListener('touchmove', preventScroll, { passive: false });
    window.addEventListener('keydown', preventKeys, { capture: true });

    return () => {
      window.removeEventListener('wheel', preventScroll);
      window.removeEventListener('touchmove', preventScroll);
      window.removeEventListener('keydown', preventKeys, { capture: true });
      window.history.scrollRestoration = previousScrollRestoration;
    };
  }, [entrance, scrollUnlocked]);

  useEffect(() => {
    if (!entrance || !copyRevealed || scrollUnlocked) return;
    let frame2 = 0;
    let frame3 = 0;
    let frame4 = 0;
    const frame1 = window.requestAnimationFrame(() => {
      frame2 = window.requestAnimationFrame(() => {
        frame3 = window.requestAnimationFrame(() => {
          frame4 = window.requestAnimationFrame(() => setScrollUnlocked(true));
        });
      });
    });
    return () => {
      window.cancelAnimationFrame(frame1);
      window.cancelAnimationFrame(frame2);
      window.cancelAnimationFrame(frame3);
      window.cancelAnimationFrame(frame4);
    };
  }, [copyRevealed, entrance, scrollUnlocked]);

  useLayoutEffect(() => {
    if (!entrance) {
      onCurtainDone?.();
      return;
    }

    if (!canMountCurtain) {
      return;
    }

    let finished = false;
    const finishCurtain = () => {
      if (finished) return;
      finished = true;
      setCurtainDone(true);
      document.documentElement.classList.remove('mm-intro-pending');
      document.body.classList.add('mm-intro-complete');
      window.requestAnimationFrame(() => {
        onCurtainDone?.();
      });
    };

    const reducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
    const curtain = curtainRef.current;

    if (reducedMotion) {
      const timeout = window.setTimeout(finishCurtain, 200);
      return () => {
        window.clearTimeout(timeout);
        document.body.classList.remove('mm-intro-mounted');
      };
    }

    const onAnimationEnd = (event: AnimationEvent) => {
      if (event.target !== curtain || event.animationName !== 'mm-hero-curtain-mask') return;
      finishCurtain();
    };

    curtain?.addEventListener('animationend', onAnimationEnd);
    const failsafe = window.setTimeout(finishCurtain, HOME_INTRO_CURTAIN_MS + 80);

    return () => {
      curtain?.removeEventListener('animationend', onAnimationEnd);
      window.clearTimeout(failsafe);
      document.body.classList.remove('mm-intro-mounted');
    };
  }, [canMountCurtain, entrance, onCurtainDone]);

  return (
    <header id="hero" className={`mm-hero${curtainDone ? ' mm-hero--curtain-done' : ''}`}>
      <div className="mm-hero__bg-scale" aria-hidden>
        <div className="mm-hero__smokey">
          <div className="mm-hero__smokey-placeholder" aria-hidden />
          <HeroShaderBackground />
        </div>
      </div>
      <div className="mm-hero__exit-splash" aria-hidden />
      {canMountCurtain
        ? createPortal(
            <>
              <div
                className={`mm-hero__load-curtain${curtainDone ? ' mm-hero__load-curtain--done' : ''}`}
                aria-hidden="true"
                ref={curtainRef}
              />
              <div
                className={`mm-hero__dot-stage${curtainDone ? ' mm-hero__dot-stage--done' : ''}`}
                aria-hidden="true"
              >
                <span className="mm-hero__reveal-dot" />
              </div>
            </>,
            document.body,
          )
        : null}
      <motion.div
        className={`mm-hero__content${entrance && !copyRevealed ? ' mm-hero__content--pre-reveal' : ''}`}
        initial={false}
        animate={false}
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
            <div className="mm-hero__headline">
              <h1 className="mm-hero__title">
                <span className="mm-hero__title-break">{CONTENT.hero.storyTitle}</span>
                <span className="mm-hero__title-break">{CONTENT.hero.storyHighlight}</span>
              </h1>
              <p className="mm-hero__lead">{CONTENT.hero.lead}</p>
            </div>
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
          <SectionTitleReveal text={headingBase} />
          {headingAccent ? (
            <>
              {' '}
              <SectionTitleReveal text={headingAccent} wordClassName="mm-gradient-word" />
            </>
          ) : null}
        </span>
      </h2>
      <ul className="mm-clients__grid" role="list">
        {items.map((item) => (
          <li key={item.name} className="mm-clients__grid-item">
            {item.href ? (
              <a
                className="mm-client-name"
                href={item.href}
                target="_blank"
                rel="noreferrer"
              >
                {item.name}
              </a>
            ) : (
              <span className="mm-client-name">{item.name}</span>
            )}
          </li>
        ))}
      </ul>
    </section>
  );
}

export function Services() {
  const sectionRef = useRef<HTMLElement>(null);
  const laydownRef = useRef<HTMLDivElement>(null);
  const pillars = CONTENT.services.items;

  useEffect(() => {
    const section = sectionRef.current;
    const plane = laydownRef.current;

    if (!section || !plane) return;

    const reducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
    if (reducedMotion || typeof IntersectionObserver === 'undefined') {
      plane.classList.add('mm-services-laydown-plane--ready');
      return;
    }

    const observer = new IntersectionObserver(
      ([entry]) => {
        if (!entry?.isIntersecting) return;
        plane.classList.add('mm-services-laydown-plane--ready');
        observer.disconnect();
      },
      // Arm before the section is the scroll target so the 3D settle
      // does not start cold on the same frames as scrolling into Services.
      { rootMargin: '80% 0px 20% 0px', threshold: 0 },
    );

    observer.observe(section);

    return () => observer.disconnect();
  }, []);

  return (
    <section
      ref={sectionRef}
      className="mm-section mm-section--services mm-services"
      id="services"
      aria-labelledby="services-heading"
    >
      <div className="mm-services__shell">
        <div className="mm-services__masthead">
          <h2 id="services-heading" className="mm-services__title">
            {CONTENT.services.title.split(/(?<=\.)\s+/).map((line) => (
              <span className="mm-services__title-line" key={line}>
                <SectionTitleReveal text={line} />
              </span>
            ))}
          </h2>
        </div>

        <div className="mm-services-laydown-stage">
        <div ref={laydownRef} className="mm-services-laydown-plane" data-mm-services-laydown>
          <Accordion className="mm-services__accordion">
            {pillars.map((pillar) => {
              const value = pillar.title.toLowerCase();
              return (
                <AccordionItem className="mm-services__accordion-item" key={pillar.title} value={value}>
                  <AccordionTrigger className="mm-services__accordion-trigger">
                    <span className="mm-services__accordion-trigger-copy">
                      <span className="mm-services__accordion-title">
                        <RevealText text={pillar.title} amount={0.15} blur={false} />
                      </span>
                      <span className="mm-services__accordion-summary">
                        <RevealText text={pillar.lede} stagger={0.015} amount={0.15} blur={false} />
                      </span>
                    </span>
                  </AccordionTrigger>
                  <AccordionContent className="mm-services__accordion-content">
                    <ul className="mm-services__service-grid">
                      {pillar.items.map((service) => (
                        <li className="mm-services__service-card" key={service.label}>
                          <h3>{service.label}</h3>
                        </li>
                      ))}
                    </ul>
                  </AccordionContent>
                </AccordionItem>
              );
            })}
          </Accordion>
        </div>
        </div>

        <button
          type="button"
          className="mm-services__contact mm-tactile-button"
          data-mm-reveal="fade"
          data-mm-reveal-start="top 90%"
          onClick={() => openContactModalFromApp()}
        >
          <span>Contact</span>
          <ArrowUpRight className="mm-services__contact-icon" size={22} aria-hidden />
        </button>
      </div>
    </section>
  );
}

export function Work({ stacked = true }: WorkProps = {}) {
  const sectionRef = useRef<HTMLElement>(null);
  const reduceMotion = useReducedMotion();
  const landingProjects = CONTENT.work.items.slice(0, 3);
  const stackEnabled = stacked && landingProjects.length > 1;
  const showViewAll = stacked && landingProjects.length < CONTENT.work.items.length;

  useStackedWorkPosters(sectionRef, stackEnabled, reduceMotion);
  useWorkCardContentReveal(sectionRef, reduceMotion);

  const renderProjectCard = (project: (typeof landingProjects)[number]) => {
    const isLogoPanel = project.cardLayout === 'logo-panel';
    return (
    <Link
      key={project.title}
      href={project.link}
      className={`mm-work-card${project.cardVariant ? ` mm-work-card--${project.cardVariant}` : ''}${isLogoPanel ? ' mm-work-card--logo-panel' : ''}`}
      target={project.link.startsWith('http') ? '_blank' : undefined}
      rel={project.link.startsWith('http') ? 'noopener noreferrer' : undefined}
    >
      <div
        className={`mm-work-card__image${isLogoPanel ? ' mm-work-card__image--logo-panel' : ''}`}
      >
        {isLogoPanel && project.logo ? (
          <div className="mm-work-card__logo">
            <Image
              src={project.logo}
              alt=""
              width={project.logoWidth ?? 400}
              height={project.logoHeight ?? 240}
              sizes="(max-width: 900px) 48vw, 480px"
              className="mm-work-card__logo-img"
              unoptimized
            />
          </div>
        ) : (
          <Image
            src={project.image ?? CASE_IMAGE}
            alt=""
            fill
            sizes="(max-width: 900px) 92vw, 1180px"
          />
        )}
      </div>
      <div className="mm-work-card__body">
        <h3>
          {project.titleLines ? (
            <>
              <span className="mm-work-card__title-line">{project.titleLines[0]}</span>
              <span className="mm-work-card__title-line">{project.titleLines[1]}</span>
            </>
          ) : (
            project.title
          )}
        </h3>
        <hr className="mm-work-card__divider" aria-hidden="true" />
        <p>{project.description}</p>
        {project.tags?.length ? (
          <>
            <ul className="mm-work-card__tags" aria-label={`What we delivered: ${project.tags.slice(0, 3).join(', ')}`}>
              {project.tags.slice(0, 3).map((tag) => (
                <li className="mm-work-card__tag" key={tag}>
                  {tag}
                </li>
              ))}
            </ul>
          </>
        ) : null}
      </div>
    </Link>
    );
  };

  return (
    <section
      ref={sectionRef}
      className={`mm-section mm-section--work mm-work relative${stackEnabled ? ' mm-work--stacked' : ''}`}
      id="work"
    >
      <div className="relative z-10">
        <div className="mm-section-heading mm-section-heading--wide">
          <h2 className="mm-work__title">
            <SectionTitleReveal text={CONTENT.work.title} className="mm-splitting-text" />
          </h2>
          {CONTENT.work.subtitle ? (
            <p>
              <RevealText
                text={CONTENT.work.subtitle}
                className="mm-splitting-text"
                stagger={0.018}
                delay={0.12}
                amount={0.15}
              />
            </p>
          ) : null}
        </div>
        <div
          className="mm-work-projects"
          {...(stackEnabled
            ? {}
            : {
                'data-mm-reveal-group': 'fade',
                'data-mm-reveal-stagger': '0.1',
                'data-mm-reveal-start': 'top 82%',
              })}
        >
          {landingProjects.map((project, index) =>
            stackEnabled ? (
              <div
                key={project.title}
                className="mm-work-card-pin"
                style={{ '--mm-work-card-index': index } as React.CSSProperties}
              >
                {renderProjectCard(project)}
              </div>
            ) : (
              renderProjectCard(project)
            ),
          )}
        </div>
        {showViewAll ? (
          <Link
            href="/work#main-content"
            className="mm-work-view-all mm-tactile-button"
            data-mm-reveal="fade"
            data-mm-reveal-start="top 92%"
          >
            <span>{CONTENT.work.viewAllLabel}</span>
            <ArrowUpRight size={20} aria-hidden />
          </Link>
        ) : null}
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
  const reduceMotion = useReducedMotion();
  const isClient = useIsClient();
  const animateLogo = isClient && !reduceMotion;

  return (
    <section className="mm-cta mm-section--cta" id="contact" aria-labelledby="contact-heading">
      <div className="mm-cta__surface">
        <div className="mm-cta__inner">
          <div className="mm-cta__shell">
            <div className="mm-cta__column">
              <h2 id="contact-heading" className="mm-cta__title">
                <FlipText text={CONTENT.cta.title} replay />
              </h2>
              {CONTENT.cta.subtitle ? (
                <p className="mm-cta__lead" data-mm-reveal="fade" data-mm-reveal-start="top 90%">
                  {CONTENT.cta.subtitle}
                </p>
              ) : null}
              <div className="mm-cta__actions mm-cta__actions--contact">
                <button
                  type="button"
                  className="mm-cta__contact-btn mm-tactile-button"
                  onClick={() => openContactModalFromApp()}
                >
                  {CONTENT.cta.contactButtonLabel}
                  <ArrowUpRight className="liquid-contact-arrow" size={15} aria-hidden />
                </button>
              </div>
            </div>
            <motion.div
              className="mm-cta__logo-stage"
              initial={animateLogo ? { opacity: 0, y: 12 } : false}
              whileInView={animateLogo ? { opacity: 1, y: 0 } : undefined}
              viewport={{ once: true, amount: 0.45 }}
              transition={{ duration: 0.7, ease: [0.22, 1, 0.36, 1] }}
            >
              <Link href="/#hero" className="mm-cta__logo-link" aria-label="Back to the Maser Media hero">
                <CtaLogoTilt />
              </Link>
            </motion.div>
          </div>
        </div>
      </div>
    </section>
  );
}

function FooterNavItem({ text, href }: { text: string; href: string }) {
  if (isContactModalHref(href)) {
    return (
      <button
        type="button"
        className="mm-footer__nav-link"
        onClick={() => openContactModalFromApp()}
      >
        {text}
      </button>
    );
  }

  return (
    <Link href={href} className="mm-footer__nav-link" data-mm-native-nav="true">
      {text}
    </Link>
  );
}

export function Footer() {
  return (
    <footer className="mm-footer relative">
      <p className="mm-footer__copy">
        © {CONTENT.footer.copyright}
      </p>
      <nav className="mm-footer__nav" aria-label="Footer navigation">
        {CONTENT.footer.nav.map((item) => (
          <FooterNavItem key={item.href} text={item.text} href={item.href} />
        ))}
      </nav>
      <AsciiWaveFooter speed={1} />
      <FooterCoolButton />
    </footer>
  );
}

function ProofBand() {
  const bandRef = useRef<HTMLDivElement>(null);

  return (
    <div ref={bandRef} className="mm-proof-band">
      <LiquidMetalMeatballs triggerRef={bandRef} className="mm-proof-band__field" />
      <div className="mm-proof-band__content">
        <Clients />
        <Services />
      </div>
    </div>
  );
}

export function LandingPage({
  entrance = true,
  onCurtainReveal,
  onHeroIntroDone,
}: {
  entrance?: boolean;
  onCurtainReveal?: () => void;
  onHeroIntroDone?: () => void;
}) {
  const rootRef = useRef<HTMLElement>(null);
  const [curtainRevealed, setCurtainRevealed] = useState(!entrance);
  const [introPrepared, setIntroPrepared] = useState(!entrance);
  const [heroMotion, setHeroMotion] = useState<'pending' | 'running' | 'ready'>(
    entrance ? 'pending' : 'ready',
  );

  const handleHeroIntroPrepared = useCallback(() => {
    setIntroPrepared(true);
  }, []);

  const handleHeroIntroStart = useCallback(() => {
    setHeroMotion('running');
    window.requestAnimationFrame(() => {
      onCurtainReveal?.();
    });
  }, [onCurtainReveal]);

  const handleHeroIntroDone = useCallback(() => {
    setHeroMotion('ready');
    onHeroIntroDone?.();
  }, [onHeroIntroDone]);

  const handleCurtainDone = useCallback(() => {
    setCurtainRevealed(true);
  }, []);

  useGsapLandingMotion(rootRef, {
    animateHeroIntro: entrance && curtainRevealed && introPrepared,
    holdHeroIntro: entrance && (!curtainRevealed || !introPrepared),
    onHeroIntroPrepared: handleHeroIntroPrepared,
    onHeroIntroStart: handleHeroIntroStart,
    onHeroIntroDone: handleHeroIntroDone,
  });

  return (
    <main
      ref={rootRef}
      id="main-content"
      className="site-main mm-main"
      data-hero-motion={heroMotion}
    >
      <div className="mm-hero-scene">
        <Hero
          entrance={entrance}
          onCurtainDone={handleCurtainDone}
          contentRevealed={!entrance || heroMotion !== 'pending'}
        />
      </div>
      <div className="mm-home-slate">
        <ProofBand />
        <ProcessBento />
        <Work />
        <Testimonials />
        <Cta />
        <Footer />
      </div>
    </main>
  );
}

export function InnerPageMain({ children }: { children: React.ReactNode }) {
  const rootRef = useRef<HTMLElement>(null);

  useLayoutEffect(() => {
    document.documentElement.classList.add('mm-inner-route');
    void sanitizeScrollArtifacts();

    return () => {
      document.documentElement.classList.remove('mm-inner-route');
    };
  }, []);

  useMmScrollReveals(rootRef);

  return (
    <main id="main-content" className="site-main mm-inner-main" ref={rootRef}>
      <div className="mm-inner-main__stack">{children}</div>
      <Footer />
    </main>
  );
}


export function InnerHero({
  title,
  copy,
  below,
  className = '',
}: {
  title: string;
  copy: string;
  below?: React.ReactNode;
  className?: string;
}) {
  return (
    <header className={`mm-inner-hero${className ? ` ${className}` : ''}`}>
      <div className="mm-inner-hero__shader">
        <AuroraShader
          colorStops={[...MASER_AURORA_COLOR_STOPS]}
          amplitude={1.35}
          blend={0.4}
          speed={0.9}
        />
      </div>
      <div className="mm-inner-hero__content">
        <ScrollReveal as="div" variant="blur" amount={0.35}>
          <h1>{title}</h1>
        </ScrollReveal>
        <ScrollReveal as="p" className="mm-inner-hero__lead" variant="fade" delay={0.08} amount={0.4}>
          {copy}
        </ScrollReveal>
        {below}
      </div>
    </header>
  );
}

export function AboutInnerHero() {
  const { title, lead } = CONTENT.aboutPage;

  return (
    <InnerHero className="mm-inner-hero--editorial" title={title} copy={lead} />
  );
}

export function InnerPage({ kind }: { kind: InnerPageKind }) {
  const config = {
    work: {
      title: CONTENT.workPage.title,
      copy: CONTENT.workPage.lead,
      body: <Work stacked={false} />,
    },
    about: {
      body: <AboutFounders />,
    },
  } satisfies Record<InnerPageKind, { title?: string; copy?: string; body: React.ReactNode }>;

  if (kind === 'about') {
    return (
      <InnerPageMain>
        <AboutInnerHero />
        {config.about.body}
        <Cta />
      </InnerPageMain>
    );
  }

  const page = config.work;

  return (
    <InnerPageMain>
      <InnerHero
        className="mm-inner-hero--editorial mm-inner-hero--work"
        title={page.title}
        copy={page.copy}
      />
      {page.body}
      <Cta />
    </InnerPageMain>
  );
}

function TestimonialCardArticle({
  quote,
  name,
  role,
  logo,
  logoWidth = 240,
  logoHeight = 120,
  logoMonochrome = false,
  className = '',
}: {
  quote: string;
  name: string;
  role: string;
  logo: string;
  logoWidth?: number;
  logoHeight?: number;
  logoMonochrome?: boolean;
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
      <p className="testimonial-card-text">{quote}</p>
      <div className="testimonial-card-footer">
        <div className="testimonial-card-who">
          <strong className="testimonial-card-name">{name}</strong>
          <span className="testimonial-card-role">{role}</span>
        </div>
      </div>
      <Image
        src={logo}
        alt=""
        width={logoWidth}
        height={logoHeight}
        className={`testimonial-card-logo${logoMonochrome ? ' testimonial-card-logo--mono' : ''}`}
        aria-hidden
      />
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
      <div className="testimonials-carousel-inner mm-testimonials-wave__inner">
        <div className="mm-testimonials-wave__layout">
          <header className="mm-testimonials-wave__head">
            {eyebrow ? (
              <p
                className="mm-testimonials-wave__eyebrow"
                data-mm-reveal="fade"
                data-mm-reveal-repeat="true"
                data-mm-reveal-reset="hidden"
                data-mm-reveal-start="top 90%"
                data-mm-reveal-end="bottom+=40 top"
              >
                {eyebrow}
              </p>
            ) : null}
            <h2 className="mm-testimonials-wave__title" id="testimonials-title">
              <SectionTitleReveal text={title} className="mm-testimonials-wave__title-anim" />
            </h2>
          </header>

          <ul
            className="mm-testimonials-wave__static mm-testimonials-wave__static--live"
            data-mm-reveal="fade"
            data-mm-reveal-start="top 80%"
            aria-live="off"
          >
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
                      logo={item.logo}
                      logoWidth={item.logoWidth}
                      logoHeight={item.logoHeight}
                      logoMonochrome={item.logoMonochrome}
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

export { InnerRouteShell } from './InnerRouteShell';
