'use client';

import { MotionConfig } from 'motion/react';
import { GalaxyBackground, LandingPage, Nav } from '@/components';
import { GsapSmoothScroll } from '@/components/GsapSmoothScroll';

export default function Home() {
  return (
    <MotionConfig reducedMotion="user">
      <GalaxyBackground />
      <Nav entrance />
      <GsapSmoothScroll>
        <LandingPage />
      </GsapSmoothScroll>
    </MotionConfig>
  );
}
