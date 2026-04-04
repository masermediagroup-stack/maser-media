'use client';

import { useEffect } from 'react';
import { MotionConfig } from 'motion/react';
import { GalaxyBackground, Nav, SideRail, PricingPlans, Footer, PillNav } from '@/components';

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
      <main id="main-content" className="site-main pricing-page-main">
        <PricingPlans />
        <Footer />
      </main>
      <PillNav />
    </MotionConfig>
  );
}
