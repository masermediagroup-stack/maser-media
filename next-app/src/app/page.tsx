'use client';

import { useEffect } from 'react';
import { MotionConfig, motion } from 'motion/react';
import { useReducedMotionAfterMount } from '@/lib/useReducedMotionAfterMount';
import {
  GalaxyBackground,
  Nav,
  SideRail,
  Hero,
  PillNav,
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

  // Scroll animation observer for sections
  useEffect(() => {
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
      }
    );

    const elements = document.querySelectorAll('.scroll-animate');
    elements.forEach((el) => observer.observe(el));

    return () => observer.disconnect();
  }, []);

  return (
    <MotionConfig reducedMotion="user">
      <GalaxyBackground />
      <Nav entrance={entrance} />
      <SideRail entrance={entrance} />
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
          <CrashPlayground />
          <Work />
          <Services />
          <Testimonials />
          <Cta />
          <Footer />
        </motion.div>
      </main>
      <PillNav entrance={entrance} />
    </MotionConfig>
  );
}
