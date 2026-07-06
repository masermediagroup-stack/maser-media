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

type LandingMotionModules = [
  typeof import('gsap'),
  typeof import('gsap/ScrollTrigger'),
  typeof import('gsap/SplitText'),
];

let landingMotionModulesPromise: Promise<LandingMotionModules> | null = null;

function loadLandingMotionModules() {
  landingMotionModulesPromise ??= Promise.all([
    import('gsap'),
    import('gsap/ScrollTrigger'),
    import('gsap/SplitText'),
  ]) as Promise<LandingMotionModules>;

  return landingMotionModulesPromise;
}

export function preloadLandingMotionModules() {
  return loadLandingMotionModules();
}

export function useMmScrollReveals(rootRef: RefObject<HTMLElement | null>, enabled = true) {
  useLayoutEffect(() => {
    if (!enabled || !rootRef.current) return;

    let cleanup = () => {};
    let cancelled = false;

    const run = async () => {
      const [{ gsap }, { ScrollTrigger }] = await loadLandingMotionModules();
      if (cancelled || !rootRef.current) return;

      gsap.registerPlugin(ScrollTrigger);
      const root = rootRef.current;
      const reduced = prefersReducedMotion();

      const ctx = gsap.context(() => {
        if (reduced) {
          gsap.set(root.querySelectorAll('[data-mm-reveal]'), {
            autoAlpha: 1,
            y: 0,
            clearProps: 'filter',
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

            gsap.utils.toArray<HTMLElement>('[data-mm-reveal]', root).forEach((el) => {
              const kind = (el.dataset.mmReveal === 'blur' ? 'blur' : 'fade') as RevealKind;
              gsap.set(el, revealFromVars(kind, isNarrow));
            });
            bindLandingScrollReveals(gsap, ScrollTrigger, root, isNarrow, scrollTriggerDefaults);
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
  }, [enabled, rootRef]);
}

function stToggleActive(target: Element | Element[] | string | null | undefined) {
  if (!target) return {};
  return {
    toggleClass: { targets: target, className: 'st-active' },
  };
}

type RevealKind = 'fade' | 'blur';

function revealFromVars(kind: RevealKind, isNarrow: boolean) {
  if (kind === 'blur') {
    return { autoAlpha: 0, y: isNarrow ? 12 : 18, filter: 'blur(8px)' };
  }
  return { autoAlpha: 0, y: isNarrow ? 14 : 20 };
}

function revealToVars(kind: RevealKind) {
  if (kind === 'blur') {
    return { autoAlpha: 1, y: 0, filter: 'blur(0px)', clearProps: 'filter' };
  }
  return { autoAlpha: 1, y: 0 };
}

function bindLandingScrollReveals(
  gsap: typeof import('gsap').gsap,
  ScrollTrigger: typeof import('gsap/ScrollTrigger').ScrollTrigger,
  scope: Element,
  isNarrow: boolean,
  stDefaults: typeof scrollTriggerDefaults,
) {
  const singles = gsap.utils.toArray<HTMLElement>('[data-mm-reveal]', scope);

  singles.forEach((el) => {
    if (el.closest('[data-mm-reveal-group]')) return;

    const kind = (el.dataset.mmReveal === 'blur' ? 'blur' : 'fade') as RevealKind;
    const trigger = el.dataset.mmRevealTrigger
      ? scope.querySelector<HTMLElement>(el.dataset.mmRevealTrigger) ?? el
      : el;
    const repeat = el.dataset.mmRevealRepeat === 'true';
    const resetHidden = (el.dataset.mmRevealReset ?? 'hidden') === 'hidden';
    const fromVars = revealFromVars(kind, isNarrow);
    const toVars = {
      ...revealToVars(kind),
      duration: kind === 'blur' ? 0.88 : 0.72,
      ease: 'power2.out',
    };

    if (repeat) {
      const timeline = gsap.timeline({ paused: true }).fromTo(el, fromVars, toVars);

      ScrollTrigger.create({
        trigger,
        start: el.dataset.mmRevealStart ?? 'top 88%',
        onEnter: () => {
          timeline.restart();
        },
        onEnterBack: () => {
          timeline.restart();
        },
        onLeave: () => {
          if (resetHidden) timeline.pause(0);
        },
        onLeaveBack: () => {
          if (resetHidden) timeline.pause(0);
        },
        ...stDefaults,
      });

      return;
    }

    gsap.fromTo(el, fromVars, {
      ...toVars,
      scrollTrigger: {
        trigger,
        start: el.dataset.mmRevealStart ?? 'top 88%',
        toggleActions: 'play none none none',
        ...stDefaults,
      },
    });
  });

  gsap.utils.toArray<HTMLElement>('[data-mm-reveal-group]', scope).forEach((group) => {
    const items = gsap.utils.toArray<HTMLElement>('[data-mm-reveal]', group);
    if (!items.length) return;

    const kind = (group.dataset.mmRevealGroup === 'blur' ? 'blur' : 'fade') as RevealKind;
    const stagger = Number.parseFloat(group.dataset.mmRevealStagger ?? '') || (isNarrow ? 0.1 : 0.12);
    const repeat = group.dataset.mmRevealRepeat === 'true';
    const resetHidden = (group.dataset.mmRevealReset ?? 'hidden') === 'hidden';
    const fromVars = revealFromVars(kind, isNarrow);
    const toVars = {
      ...revealToVars(kind),
      duration: kind === 'blur' ? 0.82 : 0.68,
      ease: 'power2.out',
      stagger: { each: stagger, from: 'start' as const },
    };

    if (repeat) {
      const timeline = gsap.timeline({ paused: true }).fromTo(items, fromVars, toVars);

      ScrollTrigger.create({
        trigger: group,
        start: group.dataset.mmRevealStart ?? 'top 86%',
        onEnter: () => {
          timeline.restart();
        },
        onEnterBack: () => {
          timeline.restart();
        },
        onLeave: () => {
          if (resetHidden) timeline.pause(0);
        },
        onLeaveBack: () => {
          if (resetHidden) timeline.pause(0);
        },
        ...stDefaults,
      });

      return;
    }

    gsap.fromTo(items, fromVars, {
      ...toVars,
      scrollTrigger: {
        trigger: group,
        start: group.dataset.mmRevealStart ?? 'top 86%',
        toggleActions: 'play none none none',
        ...stDefaults,
      },
    });
  });
}

export function useGsapLandingMotion(
  rootRef: RefObject<HTMLElement | null>,
  {
    animateHeroIntro = true,
    holdHeroIntro = false,
    onHeroIntroStart,
    onHeroIntroDone,
  }: {
    animateHeroIntro?: boolean;
    holdHeroIntro?: boolean;
    onHeroIntroStart?: () => void;
    onHeroIntroDone?: () => void;
  } = {},
) {
  useLayoutEffect(() => {
    if (!rootRef.current) return;

    if (holdHeroIntro) {
      rootRef.current.dataset.heroMotion = 'pending';
      void loadLandingMotionModules();
      return;
    }

    let cleanup = () => {};
    let cancelled = false;

    const run = async () => {
      const [{ gsap }, { ScrollTrigger }, { SplitText }] = await loadLandingMotionModules();
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
          if (animateHeroIntro) {
            onHeroIntroStart?.();
            onHeroIntroDone?.();
          }
          if (hero) gsap.set(hero, { '--hero-exit-p': 0, '--hero-content-p': 0 });
          gsap.utils.toArray<HTMLElement>('.mm-section, .marquee-system', root).forEach((el) => {
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
          const revealEls = gsap.utils.toArray<HTMLElement>('[data-mm-reveal]', root);
          if (revealEls.length) {
            gsap.set(revealEls, {
              autoAlpha: 1,
              y: 0,
              clearProps: 'filter',
            });
          }
          return;
        }

        const mm = gsap.matchMedia();

        const heroTitleDelay = 0.05;
        const heroTitleDuration = 0.88;
        const heroTitleStagger = 0.08;
        const heroLeadGap = 0.02;
        let heroTitleLineCount = 1;
        let heroIntroCompleteCount = 0;
        const heroIntroSegmentCount = (heroTitle ? 1 : 0) + (heroLead ? 1 : 0);
        let heroIntroDone = false;

        const markHeroIntroReady = () => {
          if (!animateHeroIntro) {
            root.dataset.heroMotion = 'ready';
            return;
          }
          heroIntroCompleteCount += 1;
          if (!heroIntroDone && heroIntroCompleteCount >= heroIntroSegmentCount) {
            heroIntroDone = true;
            root.dataset.heroMotion = 'ready';
            onHeroIntroDone?.();
          }
        };

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
                onComplete: markHeroIntroReady,
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
                onComplete: markHeroIntroReady,
              });
            },
          });
        }

        if (animateHeroIntro && heroIntroSegmentCount === 0) {
          root.dataset.heroMotion = 'ready';
          onHeroIntroStart?.();
          onHeroIntroDone?.();
        } else if (animateHeroIntro) {
          root.dataset.heroMotion = 'running';
          onHeroIntroStart?.();
        }

        mm.add(
          {
            isNarrow: '(max-width: 767px)',
            isWide: '(min-width: 768px)',
          },
          (context) => {
            const isNarrow = Boolean(context.conditions?.isNarrow);

            if (animateHeroIntro && isNarrow && hero) {
              const mobileLogo = hero.querySelector<HTMLElement>('.mm-hero__mobile-logo');
              if (mobileLogo) {
                gsap.from(mobileLogo, {
                  autoAlpha: 0,
                  y: 14,
                  duration: 0.75,
                  delay: heroTitleDelay,
                  ease: 'power3.out',
                });
              }
            }

            const heroScene = root.querySelector<HTMLElement>('.mm-hero-scene');
            const heroContent = hero?.querySelector<HTMLElement>('.mm-hero__content');
            const bgScale = hero?.querySelector<HTMLElement>('.mm-hero__bg-scale');
            const heroScrollTrigger = heroScene ?? hero;

            if (hero && heroScrollTrigger) {
              gsap.set(hero, { '--hero-exit-p': 0, '--hero-content-p': 0 });

              if (isNarrow) {
                const mobileExit = gsap.timeline({
                  scrollTrigger: {
                    trigger: heroScrollTrigger,
                    start: 'top top',
                    end: 'bottom 70%',
                    scrub: 0.55,
                    invalidateOnRefresh: true,
                    ...scrollTriggerDefaults,
                  },
                });

                mobileExit.fromTo(
                  hero,
                  { '--hero-exit-p': 0 },
                  { '--hero-exit-p': 1, ease: 'power2.inOut', duration: 1 },
                  0,
                );
                mobileExit.fromTo(
                  hero,
                  { '--hero-content-p': 0 },
                  { '--hero-content-p': 1, ease: 'power2.in', duration: 0.55 },
                  0,
                );

                if (bgScale) {
                  mobileExit.fromTo(
                    bgScale,
                    { scale: 1, transformOrigin: '50% 100%' },
                    { scale: 1.18, ease: 'none', duration: 1 },
                    0,
                  );
                }
              } else {
                const desktopExit = gsap.timeline({
                  scrollTrigger: {
                    trigger: heroScrollTrigger,
                    pin: hero,
                    pinSpacing: true,
                    start: 'top top',
                    end: '+=85%',
                    scrub: 0.85,
                    invalidateOnRefresh: true,
                    ...scrollTriggerDefaults,
                  },
                });

                desktopExit.fromTo(
                  hero,
                  { '--hero-exit-p': 0 },
                  { '--hero-exit-p': 1, ease: 'power2.inOut', duration: 1 },
                  0,
                );
                desktopExit.fromTo(
                  hero,
                  { '--hero-content-p': 0 },
                  { '--hero-content-p': 1, ease: 'power2.in', duration: 0.55 },
                  0,
                );

                if (bgScale) {
                  desktopExit.fromTo(
                    bgScale,
                    { scale: 1, transformOrigin: '50% 82%' },
                    { scale: 1.38, ease: 'none', duration: 1 },
                    0,
                  );
                }

                if (heroContent) {
                  gsap.set(heroContent, { force3D: true });
                }
              }
            }

            const clientsSection = root.querySelector<HTMLElement>('.mm-clients');
            const clientsHeadlineText = root.querySelector<HTMLElement>('.mm-clients__headline-text');
            const clientPanelFadeItems = clientsSection?.querySelectorAll<HTMLElement>(
              '.mm-client-name, .mm-clients__more',
            );

            if (clientsHeadlineText) {
              gsap.fromTo(
                clientsHeadlineText,
                { autoAlpha: 0, y: isNarrow ? 14 : 22 },
                {
                  autoAlpha: 1,
                  y: 0,
                  duration: isNarrow ? 1.45 : 1.85,
                  ease: 'power2.out',
                  scrollTrigger: {
                    trigger: clientsSection ?? clientsHeadlineText,
                    start: 'top 88%',
                    toggleActions: 'play none none none',
                    ...stToggleActive(clientsHeadlineText),
                    ...scrollTriggerDefaults,
                  },
                },
              );
            }

            if (clientsSection && clientPanelFadeItems && clientPanelFadeItems.length) {
              SplitText.create(clientPanelFadeItems, {
                type: 'lines, words',
                mask: 'lines',
                linesClass: 'mm-client-line++',
                wordsClass: 'mm-client-word++',
                autoSplit: true,
                onSplit(self) {
                  gsap.set(clientPanelFadeItems, { autoAlpha: 1 });

                  return gsap.from(self.words, {
                    autoAlpha: 0,
                    yPercent: 115,
                    rotateX: -72,
                    transformOrigin: '50% 100%',
                    transformPerspective: 720,
                    duration: isNarrow ? 0.58 : 0.68,
                    ease: 'power4.out',
                    stagger: { each: isNarrow ? 0.035 : 0.045, from: 'start' },
                    clearProps: 'transformPerspective,transformOrigin',
                    scrollTrigger: {
                      trigger: clientsSection,
                      start: 'top 82%',
                      toggleActions: 'play none none none',
                      ...scrollTriggerDefaults,
                    },
                  });
                },
              });
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

            const primaryMarqueeRows = gsap.utils.toArray<HTMLElement>('.marquee-row--primary', root);
            if (primaryMarqueeRows.length) {
              gsap.fromTo(
                primaryMarqueeRows,
                { xPercent: 0 },
                {
                  xPercent: primaryTravel,
                  ease: 'none',
                  scrollTrigger: { ...marqueeScrollBase, scrub: primaryScrub, ...scrollTriggerDefaults },
                },
              );
            }

            const secondaryMarqueeRows = gsap.utils.toArray<HTMLElement>('.marquee-row--secondary', root);
            if (secondaryMarqueeRows.length) {
              gsap.fromTo(
                secondaryMarqueeRows,
                { xPercent: secondaryFrom },
                {
                  xPercent: secondaryTo,
                  ease: 'none',
                  scrollTrigger: { ...marqueeScrollBase, scrub: secondaryScrub, ...scrollTriggerDefaults },
                },
              );
            }

            const testimonialsGrid = root.querySelector<HTMLElement>(
              '.mm-testimonials-wave__static--live',
            );
            if (testimonialsGrid) {
              ScrollTrigger.create({
                trigger: testimonialsGrid,
                start: 'top 78%',
                toggleActions: 'play none none none',
                ...stToggleActive(testimonialsGrid),
                ...scrollTriggerDefaults,
              });
            }

            gsap.utils.toArray<HTMLElement>('[data-mm-reveal]', root).forEach((el) => {
              const kind = (el.dataset.mmReveal === 'blur' ? 'blur' : 'fade') as RevealKind;
              gsap.set(el, revealFromVars(kind, isNarrow));
            });
            bindLandingScrollReveals(gsap, ScrollTrigger, root, isNarrow, scrollTriggerDefaults);

            ScrollTrigger.refresh();
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
  }, [animateHeroIntro, holdHeroIntro, onHeroIntroDone, onHeroIntroStart, rootRef]);
}
