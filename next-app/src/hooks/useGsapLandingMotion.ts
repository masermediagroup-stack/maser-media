'use client';

import { useEffect } from 'react';
import type { RefObject } from 'react';

function prefersReducedMotion(): boolean {
  if (typeof window === 'undefined') return false;
  return window.matchMedia('(prefers-reduced-motion: reduce)').matches;
}

const scrollTriggerDefaults = {
  anticipatePin: 1,
} as const;

function stToggleActive(target: Element | Element[] | string | null | undefined) {
  if (!target) return {};
  return {
    toggleClass: { targets: target, className: 'st-active' },
  };
}

export function useGsapLandingMotion(rootRef: RefObject<HTMLElement | null>) {
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
      const root = rootRef.current;
      const reduced = prefersReducedMotion();

      const ctx = gsap.context(() => {
        const hero = root.querySelector<HTMLElement>('.mm-hero');

        if (reduced) {
          if (hero) gsap.set(hero, { '--hero-exit-p': 1 });
          const servicesSectionR = root.querySelector<HTMLElement>('#services');
          const serviceRowsR = servicesSectionR?.querySelectorAll<HTMLElement>('.mm-services__row');
          serviceRowsR?.forEach((row) => {
            row.classList.add('mm-services__row--active');
            row.classList.remove('mm-services__row--muted');
            const body = row.querySelector<HTMLElement>('.mm-services__body');
            if (body) {
              body.removeAttribute('inert');
              body.setAttribute('aria-hidden', 'false');
            }
          });
          servicesSectionR?.classList.add('mm-services--all-open');
          gsap.utils
            .toArray<HTMLElement>(root.querySelectorAll('.mm-section, .marquee-system'))
            .forEach((el) => {
              gsap.fromTo(
                el,
                { opacity: 0.92 },
                {
                  opacity: 1,
                  duration: 0.4,
                  ease: 'power1.out',
                  scrollTrigger: {
                    trigger: el,
                    start: 'top 94%',
                    toggleActions: 'play none none none',
                    ...scrollTriggerDefaults,
                  },
                },
              );
            });
          return;
        }

        const mm = gsap.matchMedia();

        mm.add(
          {
            isNarrow: '(max-width: 767px)',
            isWide: '(min-width: 768px)',
          },
          (context) => {
            const isNarrow = Boolean(context.conditions?.isNarrow);
            const isWide = !isNarrow;

            if (hero) {
              gsap.fromTo(
                hero,
                { '--hero-exit-p': 0 },
                {
                  '--hero-exit-p': 1,
                  ease: 'power2.inOut',
                  scrollTrigger: {
                    trigger: hero,
                    start: 'top top',
                    end: isNarrow ? 'bottom 70%' : 'bottom top',
                    scrub: isNarrow ? 0.55 : 0.85,
                    invalidateOnRefresh: true,
                    ...scrollTriggerDefaults,
                  },
                },
              );

              const bgScale = hero.querySelector<HTMLElement>('.mm-hero__bg-scale');
              if (bgScale) {
                gsap.fromTo(
                  bgScale,
                  { scale: isNarrow ? 1.01 : 1.018 },
                  {
                    scale: isNarrow ? 0.995 : 0.988,
                    ease: 'none',
                    scrollTrigger: {
                      trigger: hero,
                      start: 'top top',
                      end: isNarrow ? 'bottom 70%' : 'bottom top',
                      scrub: isNarrow ? 0.55 : 0.85,
                      invalidateOnRefresh: true,
                      ...scrollTriggerDefaults,
                    },
                  },
                );
              }
            }

            const clientsSection = root.querySelector<HTMLElement>('.mm-clients');
            const clientsHeadline = root.querySelector<HTMLElement>('.mm-clients__headline');
            const clientPills = clientsSection?.querySelectorAll<HTMLElement>('.mm-client-pill');

            if (clientsHeadline) {
              if (isWide) {
                gsap.fromTo(
                  clientsHeadline,
                  {
                    rotationX: -82,
                    autoAlpha: 0,
                    transformOrigin: '50% 78%',
                    transformPerspective: 1200,
                  },
                  {
                    rotationX: 0,
                    autoAlpha: 1,
                    transformPerspective: 1200,
                    duration: 0.95,
                    ease: 'power3.out',
                    scrollTrigger: {
                      trigger: clientsHeadline,
                      start: 'top 88%',
                      toggleActions: 'play none none none',
                      ...stToggleActive(clientsHeadline),
                      ...scrollTriggerDefaults,
                    },
                  },
                );
              } else {
                gsap.fromTo(
                  clientsHeadline,
                  { autoAlpha: 0, y: 20 },
                  {
                    autoAlpha: 1,
                    y: 0,
                    duration: 0.55,
                    ease: 'power2.out',
                    scrollTrigger: {
                      trigger: clientsHeadline,
                      start: 'top 90%',
                      toggleActions: 'play none none none',
                      ...stToggleActive(clientsHeadline),
                      ...scrollTriggerDefaults,
                    },
                  },
                );
              }
            }

            if (hero && clientPills && clientPills.length) {
              gsap.fromTo(
                clientPills,
                { autoAlpha: 0, y: isNarrow ? 10 : 18 },
                {
                  autoAlpha: 1,
                  y: 0,
                  ease: 'none',
                  stagger: { each: isNarrow ? 0.03 : 0.045, from: 'start' },
                  scrollTrigger: {
                    trigger: hero,
                    start: 'bottom 88%',
                    end: 'bottom 52%',
                    scrub: 0.55,
                    ...scrollTriggerDefaults,
                  },
                },
              );
            }

            const workSection = root.querySelector<HTMLElement>('.mm-work');
            const workHeading = workSection?.querySelector<HTMLElement>('.mm-section-heading');
            const workCard = workSection?.querySelector<HTMLElement>('.mm-work-card--single');

            if (workHeading) {
              gsap.fromTo(
                workHeading,
                { autoAlpha: 0, x: isNarrow ? 0 : -28, y: isNarrow ? 22 : 0 },
                {
                  autoAlpha: 1,
                  x: 0,
                  y: 0,
                  ease: 'power2.out',
                  scrollTrigger: {
                    trigger: workHeading,
                    start: 'top 86%',
                    end: 'top 58%',
                    scrub: 0.55,
                    ...stToggleActive(workHeading),
                    ...scrollTriggerDefaults,
                  },
                },
              );
            }

            if (workCard && isWide) {
              gsap.fromTo(
                workCard,
                { clipPath: 'inset(8% 8% 8% 8% round 12px)', autoAlpha: 0.85 },
                {
                  clipPath: 'inset(0% 0% 0% 0% round 12px)',
                  autoAlpha: 1,
                  ease: 'power2.inOut',
                  scrollTrigger: {
                    trigger: workSection,
                    start: 'top 72%',
                    end: 'top 36%',
                    scrub: 0.65,
                    ...stToggleActive(workCard),
                    ...scrollTriggerDefaults,
                  },
                },
              );
            } else if (workCard && isNarrow) {
              gsap.fromTo(
                workCard,
                { autoAlpha: 0, y: 24 },
                {
                  autoAlpha: 1,
                  y: 0,
                  ease: 'power2.out',
                  scrollTrigger: {
                    trigger: workSection,
                    start: 'top 78%',
                    end: 'top 52%',
                    scrub: 0.45,
                    ...stToggleActive(workCard),
                    ...scrollTriggerDefaults,
                  },
                },
              );
            }

            const servicesSection = root.querySelector<HTMLElement>('#services');
            const servicesIntro = servicesSection?.querySelector<HTMLElement>('.mm-services__intro');
            const servicesScroll = servicesSection?.querySelector<HTMLElement>('.mm-services__grid-scroll');
            const servicesGrid = servicesScroll?.querySelector<HTMLElement>('.mm-services__grid');

            if (servicesIntro) {
              gsap.set(servicesIntro, { autoAlpha: 1, y: 0 });
              ScrollTrigger.create({
                trigger: servicesIntro,
                start: 'top 88%',
                toggleActions: 'play none none none',
                ...stToggleActive(servicesIntro),
                ...scrollTriggerDefaults,
              });
            }

            const serviceRows = servicesSection?.querySelectorAll<HTMLElement>('.mm-services__row');
            if (servicesSection && serviceRows && serviceRows.length > 0) {
              const focalRatio = isNarrow ? 0.46 : 0.42;
              let previousActive = -1;

              const measureServiceBodies = () => {
                serviceRows.forEach((row) => {
                  const body = row.querySelector<HTMLElement>('.mm-services__body');
                  if (!body) return;
                  const wasActive = row.classList.contains('mm-services__row--active');
                  row.classList.add('mm-services__row--active');
                  body.style.maxHeight = 'none';
                  body.style.opacity = '1';
                  const h = Math.ceil(body.scrollHeight);
                  body.style.removeProperty('max-height');
                  body.style.removeProperty('opacity');
                  if (!wasActive) {
                    row.classList.remove('mm-services__row--active');
                  }
                  body.style.setProperty('--mm-services-body-max', `${Math.max(h, 56)}px`);
                });
              };

              const applyServiceActive = (next: number) => {
                if (next === previousActive) return;
                previousActive = next;
                serviceRows.forEach((row, i) => {
                  row.classList.toggle('mm-services__row--active', i === next);
                  row.classList.toggle('mm-services__row--muted', i !== next);
                  const body = row.querySelector<HTMLElement>('.mm-services__body');
                  if (body) {
                    const open = i === next;
                    body.setAttribute('aria-hidden', open ? 'false' : 'true');
                    if (open) {
                      body.removeAttribute('inert');
                    } else {
                      body.setAttribute('inert', '');
                    }
                  }
                });
              };

              const updateServiceActiveFromScroll = () => {
                const sec = servicesSection.getBoundingClientRect();
                const vh = window.innerHeight;
                if (sec.bottom < 0) {
                  applyServiceActive(serviceRows.length - 1);
                  return;
                }
                if (sec.top > vh) {
                  applyServiceActive(0);
                  return;
                }

                const focalY = vh * focalRatio;
                let bestIdx = 0;
                let bestDist = Infinity;
                serviceRows.forEach((row, i) => {
                  const anchor = row.querySelector<HTMLElement>('.mm-services__pillar');
                  if (!anchor) return;
                  const r = anchor.getBoundingClientRect();
                  const mid = (r.top + r.bottom) / 2;
                  const d = Math.abs(mid - focalY);
                  if (d < bestDist) {
                    bestDist = d;
                    bestIdx = i;
                  }
                });
                applyServiceActive(bestIdx);
              };

              ScrollTrigger.create({
                trigger: servicesSection,
                start: 'top bottom',
                end: 'bottom top',
                invalidateOnRefresh: true,
                onRefresh: () => {
                  measureServiceBodies();
                  updateServiceActiveFromScroll();
                },
                onUpdate: updateServiceActiveFromScroll,
              });
            }

            if (servicesScroll && servicesGrid && isWide) {
              gsap.set(servicesScroll, {
                '--services-pack': 0,
                maxHeight: 'none',
              });
            } else if (servicesScroll && isNarrow) {
              gsap.fromTo(
                servicesScroll,
                { autoAlpha: 0.9, y: 12 },
                {
                  autoAlpha: 1,
                  y: 0,
                  ease: 'none',
                  scrollTrigger: {
                    trigger: servicesSection,
                    start: 'top 80%',
                    end: 'top 55%',
                    scrub: 0.35,
                    ...scrollTriggerDefaults,
                  },
                },
              );
            }

            const marqueeScrollBase = {
              trigger: root.querySelector('.marquee-system') ?? root,
              start: 'top bottom',
              end: 'bottom top',
            } as const;

            const primaryTravel = isNarrow ? -10 : -22;
            const secondaryFrom = isNarrow ? -2 : -4;
            const secondaryTo = isNarrow ? 2 : 4;
            const primaryScrub = isNarrow ? 1.6 : 1.1;
            const secondaryScrub = isNarrow ? 2.2 : 2.8;

            gsap.fromTo(
              root.querySelectorAll('.marquee-row--primary'),
              { xPercent: 0 },
              {
                xPercent: primaryTravel,
                ease: 'none',
                scrollTrigger: { ...marqueeScrollBase, scrub: primaryScrub, ...scrollTriggerDefaults },
              },
            );

            gsap.fromTo(
              root.querySelectorAll('.marquee-row--secondary'),
              { xPercent: secondaryFrom },
              {
                xPercent: secondaryTo,
                ease: 'none',
                scrollTrigger: { ...marqueeScrollBase, scrub: secondaryScrub, ...scrollTriggerDefaults },
              },
            );

            const testimonialsSection = root.querySelector<HTMLElement>('#testimonials');
            /** Animate the headline wrapper — not `.title-line` nodes inside `background-clip: text`
             *  (AuroraText); GSAP transform/opacity on those descendants breaks the gradient mask. */
            const testimonialTitleAnim = testimonialsSection?.querySelector<HTMLElement>(
              '.mm-testimonials-wave__title-anim',
            );
            const testimonialGrid = testimonialsSection?.querySelector<HTMLElement>(
              '.mm-testimonials-wave__grid',
            );

            if (testimonialTitleAnim) {
              gsap.fromTo(
                testimonialTitleAnim,
                { autoAlpha: 0, y: isNarrow ? 10 : 18 },
                {
                  autoAlpha: 1,
                  y: 0,
                  ease: 'power2.out',
                  scrollTrigger: {
                    trigger: testimonialsSection,
                    start: 'top 86%',
                    toggleActions: 'play none none none',
                    ...scrollTriggerDefaults,
                  },
                },
              );
            }

            if (testimonialGrid) {
              gsap.fromTo(
                testimonialGrid,
                { autoAlpha: 0.75, y: isNarrow ? 8 : 16 },
                {
                  autoAlpha: 1,
                  y: 0,
                  ease: 'power2.out',
                  scrollTrigger: {
                    trigger: testimonialsSection,
                    start: 'top 78%',
                    toggleActions: 'play none none none',
                    ...stToggleActive(testimonialGrid),
                    ...scrollTriggerDefaults,
                  },
                },
              );
            }

          },
        );
      }, root);

      cleanup = () => ctx.revert();
    };

    void run();

    return () => {
      cancelled = true;
      cleanup();
    };
  }, [rootRef]);
}
