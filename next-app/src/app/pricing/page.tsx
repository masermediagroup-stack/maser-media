'use client';

import { useEffect } from 'react';
import { MotionConfig } from 'motion/react';
import { GalaxyBackground, PricingPlans, Footer } from '@/components';
import { LiquidNav } from '@/components/LiquidNav';

export default function PricingPage() {
  useEffect(() => {
    const elements = document.querySelectorAll('.scroll-animate');
    elements.forEach((el) => el.classList.add('in-view'));
  }, []);

  return (
    <MotionConfig reducedMotion="user">
      <GalaxyBackground />
      <LiquidNav />
      <main id="main-content" className="site-main pricing-page-main">
        <PricingPlans />
        <Footer />
      </main>
    </MotionConfig>
  );
}
