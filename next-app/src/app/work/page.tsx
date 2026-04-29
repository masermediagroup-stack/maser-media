'use client';

import { MotionConfig } from 'motion/react';
import { GalaxyBackground, InnerPage, Nav } from '@/components';

export default function WorkPage() {
  return (
    <MotionConfig reducedMotion="user">
      <GalaxyBackground />
      <Nav />
      <InnerPage kind="work" />
    </MotionConfig>
  );
}
