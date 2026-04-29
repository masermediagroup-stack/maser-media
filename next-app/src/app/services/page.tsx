'use client';

import { MotionConfig } from 'motion/react';
import { GalaxyBackground, InnerPage, Nav } from '@/components';

export default function ServicesPage() {
  return (
    <MotionConfig reducedMotion="user">
      <GalaxyBackground />
      <Nav />
      <InnerPage kind="services" />
    </MotionConfig>
  );
}
