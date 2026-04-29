'use client';

import { MotionConfig } from 'motion/react';
import { GalaxyBackground, InnerPage, Nav } from '@/components';

export default function AboutPage() {
  return (
    <MotionConfig reducedMotion="user">
      <GalaxyBackground />
      <Nav />
      <InnerPage kind="about" />
    </MotionConfig>
  );
}
