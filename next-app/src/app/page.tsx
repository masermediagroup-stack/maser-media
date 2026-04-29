'use client';

import { useLayoutEffect } from 'react';
import { MotionConfig, motion } from 'motion/react';
import { useReducedMotionAfterMount } from '@/lib/useReducedMotionAfterMount';
import { revealScrollAnimateInViewport } from '@/lib/scrollAnimateReveal';
import {
  GalaxyBackground,
  Nav,
  Hero,
  Clients,
  CrashPlayground,
  Work,
  Services,
  Testimonials,
  Cta,
  Footer,
} from '@/components';

export default function Home() {
  const { mounted, prefersReducedMotion } = useReducedMotionAfterMount();
  const entrance = !mounted || prefersReducedMotion !== true;

  // Scroll animation: IO for scroll-driven reveal + sync pass so SPA back/forward and
  // already-visible sections (e.g. after hash scroll) are not stuck at opacity 0.
  useLayoutEffect(() => {
    const sync = () => revealScrollAnimateInViewport();

    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            entry.target.classList.add('in-view');
          }
        });
      },
      {
        threshold: 0.15,
        rootMargin: '-40px 0px -40px 0px',
      },
    );

    const elements = document.querySelectorAll('.scroll-animate');
    elements.forEach((el) => observer.observe(el));

    sync();
    requestAnimationFrame(() => {
      sync();
      requestAnimationFrame(sync);
    });

    const onPageShow = () => sync();
    window.addEventListener('pageshow', onPageShow);

    const t0 = window.setTimeout(sync, 0);
    const t1 = window.setTimeout(sync, 150);
    const t2 = window.setTimeout(sync, 400);

    return () => {
      observer.disconnect();
      window.removeEventListener('pageshow', onPageShow);
      window.clearTimeout(t0);
      window.clearTimeout(t1);
      window.clearTimeout(t2);
    };
  }, []);

  return (
    <MotionConfig reducedMotion="user">
      <GalaxyBackground />
      <Nav entrance={entrance} />
      {/* Hero shader + galaxy read as static; only body sections use a soft entrance */}
      <main id="main-content" className="site-main">
        <Hero entrance={entrance} />
        <motion.div
          className="site-main-entrance"
          initial={entrance ? { opacity: 0, y: 28 } : false}
          animate={entrance ? { opacity: 1, y: 0 } : false}
          transition={
            entrance
              ? { duration: 0.55, delay: 0.14, ease: [0.22, 1, 0.36, 1] }
              : undefined
          }
        >
          <Clients />
          <Work />
          <Services />
          <Testimonials />
          <Cta />
          <CrashPlayground />
          <Footer />
        </motion.div>
      </main>
    </MotionConfig>
  );
}
