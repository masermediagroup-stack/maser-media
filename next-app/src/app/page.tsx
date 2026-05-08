'use client';

import { useCallback, useState } from 'react';
import { MotionConfig } from 'motion/react';
import { GalaxyBackground, LandingPage, Nav } from '@/components';
import { GsapSmoothScroll } from '@/components/GsapSmoothScroll';

export default function Home() {
  const [introReady, setIntroReady] = useState(false);
  const handleHeroIntroDone = useCallback(() => setIntroReady(true), []);

  return (
    <MotionConfig reducedMotion="user">
      <GalaxyBackground />
      <Nav entrance introReady={introReady} />
      <GsapSmoothScroll>
        <LandingPage onHeroIntroDone={handleHeroIntroDone} />
      </GsapSmoothScroll>
    </MotionConfig>
  );
}
