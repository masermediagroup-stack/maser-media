'use client';

import { MotionConfig } from 'motion/react';
import { GalaxyBackground, LandingPage, Nav } from '@/components';

export default function Home() {
  return (
    <MotionConfig reducedMotion="user">
      <GalaxyBackground />
      <Nav entrance />
      <LandingPage />
    </MotionConfig>
  );
}
