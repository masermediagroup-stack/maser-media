'use client';

import { useEffect } from 'react';
import { MotionConfig } from 'motion/react';
import { GalaxyBackground, Nav, SideRail, PricingPlans, Footer, PillNav } from '@/components';
import { CONTENT } from '@/lib/content';

export default function PricingPage() {
  useEffect(() => {
    const elements = document.querySelectorAll('.scroll-animate');
    elements.forEach((el) => el.classList.add('in-view'));
  }, []);

  return (
    <MotionConfig reducedMotion="user">
      <GalaxyBackground />
      <Nav />
      <SideRail />
      <main id="main-content" className="site-main">
        <section className="pricing-page-header">
          <h1 className="pricing-page-title">{CONTENT.pricing.title}</h1>
          <p className="pricing-page-subtitle">{CONTENT.pricing.subtitle}</p>
        </section>
        <PricingPlans />
        <Footer />
      </main>
      <PillNav />
    </MotionConfig>
  );
}
