'use client';

import { useEffect } from 'react';
import { MotionConfig } from 'motion/react';
import { GalaxyBackground, InnerPage, Nav } from '@/components';

export default function WorkPage() {
  useEffect(() => {
    const scrollToTop = () => {
      window.scrollTo({ top: 0, left: 0, behavior: 'auto' });
      document.documentElement.scrollTop = 0;
      document.body.scrollTop = 0;
    };

    scrollToTop();
    const frame = window.requestAnimationFrame(scrollToTop);

    return () => window.cancelAnimationFrame(frame);
  }, []);

  return (
    <MotionConfig reducedMotion="user">
      <GalaxyBackground />
      <Nav />
      <InnerPage kind="work" />
    </MotionConfig>
  );
}
