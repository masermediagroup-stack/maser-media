'use client';

import { useLayoutEffect } from 'react';
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

export function useGsapLandingMotion(
  rootRef: RefObject<HTMLElement | null>,
  { animateHeroIntro = true }: { animateHeroIntro?: boolean } = {},
) {
  useLayoutEffect(() => {
    if (!rootRef.current) return;

    let cleanup = () => {};
    let cancelled = false;

    const run = async () => {
      const [{ gsap }, { ScrollTrigger }, { SplitText }] = await Promise.all([
        import('gsap'),
        import('gsap/ScrollTrigger'),
        import('gsap/SplitText'),
      ]);
      if (cancelled || !rootRef.current) return;

      gsap.registerPlugin(ScrollTrigger, SplitText);
      const root = rootRef.current;
      const reduced = prefersReducedMotion();

      const ctx = gsap.context(() => {
        const hero = root.querySelector<HTMLElement>('.mm-hero');
        const heroTitle = hero?.querySelector<HTMLElement>('.mm-hero__title');
        const heroLead = hero?.querySelector<HTMLElement>('.mm-hero__lead');

        if (reduced) {
          root.dataset.heroMotion = 'ready';
          if (hero) gsap.set(hero, { '--hero-exit-p': 1 });
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

        const heroTitleDelay = 1.15;
        const heroTitleDuration = 1.05;
        const heroTitleStagger = 0.095;
        const heroLeadGap = 0.01;
        let heroTitleLineCount = 1;

        if (!animateHeroIntro) {
          root.dataset.heroMotion = 'ready';
        }

        if (animateHeroIntro && heroTitle) {
          SplitText.create(heroTitle, {
            type: 'lines',
            mask: 'lines',
            linesClass: 'mm-hero-title-line++',
            autoSplit: true,
            onSplit(self) {
              const linesTopToBottom = [...self.lines].sort(
                (a, b) => a.getBoundingClientRect().top - b.getBoundingClientRect().top,
              );
              heroTitleLineCount = Math.max(linesTopToBottom.length, 1);

              return gsap.from(linesTopToBottom, {
                yPercent: 112,
                autoAlpha: 0,
                duration: heroTitleDuration,
                stagger: { each: heroTitleStagger, from: 'start' },
                ease: 'power4.out',
                delay: heroTitleDelay,
              });
            },
          });
        }

        if (animateHeroIntro && heroLead) {
          SplitText.create(heroLead, {
            type: 'lines',
            mask: 'lines',
            linesClass: 'mm-hero-lead-line++',
            autoSplit: true,
            onSplit(self) {
              const linesTopToBottom = [...self.lines].sort(
                (a, b) => a.getBoundingClientRect().top - b.getBoundingClientRect().top,
              );

              return gsap.from(linesTopToBottom, {
                yPercent: 112,
                autoAlpha: 0,
                duration: 0.6,
                stagger: { each: 0.045, from: 'start' },
                ease: 'power3.out',
                delay:
                  heroTitleDelay +
                  heroTitleDuration +
                  heroTitleStagger * (heroTitleLineCount - 1) +
                  heroLeadGap,
              });
            },
          });
        }

        if (animateHeroIntro) {
          root.dataset.heroMotion = 'running';
        }

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
              gsap.set(workHeading, { autoAlpha: 1, x: 0, y: 0 });
            }

            if (workCard) {
              gsap.set(workCard, {
                autoAlpha: 1,
                y: 0,
                clipPath: 'inset(0% 0% 0% 0% round 12px)',
              });
            }

            const servicesSection = root.querySelector<HTMLElement>('#services');
            const servicesIntro = servicesSection?.querySelector<HTMLElement>('.mm-services__masthead');
            const servicesTitle = servicesSection?.querySelector<HTMLElement>('.mm-services__title');
            const servicesLede = servicesSection?.querySelector<HTMLElement>('.mm-services__lede');
            const servicesCategoryStage = servicesSection?.querySelector<HTMLElement>('.mm-services__category-stage');

            if (servicesIntro) {
              if (servicesTitle && servicesLede) {
                SplitText.create(servicesTitle, {
                  type: 'lines',
                  mask: 'lines',
                  linesClass: 'mm-services-title-line++',
                  autoSplit: true,
                  onSplit(self) {
                    const linesTopToBottom = [...self.lines].sort(
                      (a, b) => a.getBoundingClientRect().top - b.getBoundingClientRect().top,
                    );

                    return gsap.from(linesTopToBottom, {
                      xPercent: -16,
                      yPercent: 105,
                      autoAlpha: 0,
                      duration: isNarrow ? 0.72 : 0.95,
                      stagger: { each: 0.075, from: 'start' },
                      ease: 'power4.out',
                      scrollTrigger: {
                        trigger: servicesIntro,
                        start: 'top 86%',
                        toggleActions: 'play none none none',
                        ...stToggleActive(servicesIntro),
                        ...scrollTriggerDefaults,
                      },
                    });
                  },
                });

                SplitText.create(servicesLede, {
                  type: 'lines',
                  mask: 'lines',
                  linesClass: 'mm-services-lede-line++',
                  autoSplit: true,
                  onSplit(self) {
                    const linesTopToBottom = [...self.lines].sort(
                      (a, b) => a.getBoundingClientRect().top - b.getBoundingClientRect().top,
                    );

                    return gsap.from(linesTopToBottom, {
                      xPercent: 18,
                      autoAlpha: 0,
                      duration: 0.72,
                      stagger: { each: 0.055, from: 'start' },
                      ease: 'power3.out',
                      scrollTrigger: {
                        trigger: servicesIntro,
                        start: 'top 86%',
                        toggleActions: 'play none none none',
                        ...scrollTriggerDefaults,
                      },
                    });
                  },
                });
              } else {
                gsap.set(servicesIntro, { autoAlpha: 1, y: 0 });
                ScrollTrigger.create({
                  trigger: servicesIntro,
                  start: 'top 88%',
                  toggleActions: 'play none none none',
                  ...stToggleActive(servicesIntro),
                  ...scrollTriggerDefaults,
                });
              }
            }

            if (servicesCategoryStage) {
              gsap.fromTo(
                servicesCategoryStage,
                { autoAlpha: 0.92, y: isNarrow ? 10 : 18 },
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

            const primaryTravel = isNarrow ? -3.5 : -7;
            const secondaryFrom = isNarrow ? -0.8 : -1.4;
            const secondaryTo = isNarrow ? 0.8 : 1.4;
            const primaryScrub = isNarrow ? 3.2 : 3.8;
            const secondaryScrub = isNarrow ? 4.2 : 4.8;

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
  }, [animateHeroIntro, rootRef]);
}
