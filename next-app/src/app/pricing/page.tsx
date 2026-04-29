'use client';

import { MotionConfig } from 'motion/react';
import { GalaxyBackground, Nav, PricingPlans, Footer } from '@/components';

export default function PricingPage() {
  return (
    <MotionConfig reducedMotion="user">
      <GalaxyBackground />
      <Nav />
      <main id="main-content" className="site-main mm-inner-main">
        <PricingPlans />
        <Footer />
      </main>
    </MotionConfig>
  );
}
