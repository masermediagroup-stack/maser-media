'use client';

import { useCallback, useEffect, useState, useSyncExternalStore } from 'react';
import { MotionConfig } from 'motion/react';
import { LandingPage, Nav } from '@/components';
import { GsapSmoothScroll } from '@/components/GsapSmoothScroll';
import { preloadLandingMotionModules } from '@/hooks/useGsapLandingMotion';
import {
  getIntroStorageSnapshot,
  getServerIntroStorageSnapshot,
  markHomeIntroPlayed,
  subscribeToIntroStorage,
} from '@/lib/homeIntro';

export default function Home() {
  const skipIntro = useSyncExternalStore(
    subscribeToIntroStorage,
    getIntroStorageSnapshot,
    getServerIntroStorageSnapshot,
  );
  const introEnabled = !skipIntro;
  const [navReady, setNavReady] = useState(skipIntro);
  const introReady = skipIntro || navReady;
  const handleCurtainReveal = useCallback(() => {
    window.requestAnimationFrame(() => {
      window.requestAnimationFrame(() => {
        setNavReady(true);
      });
    });
  }, []);
  const handleHeroIntroDone = useCallback(() => {
    markHomeIntroPlayed();
  }, []);

  useEffect(() => {
    if (!introEnabled) return;
    void preloadLandingMotionModules();
  }, [introEnabled]);

  return (
    <MotionConfig reducedMotion="user">
      <Nav entrance={introEnabled} introReady={introReady} />
      <GsapSmoothScroll>
        <LandingPage
          key={introEnabled ? 'home-intro' : 'home-ready'}
          entrance={introEnabled}
          onCurtainReveal={handleCurtainReveal}
          onHeroIntroDone={handleHeroIntroDone}
        />
      </GsapSmoothScroll>
    </MotionConfig>
  );
}
