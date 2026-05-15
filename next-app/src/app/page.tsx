'use client';

import { useCallback, useState } from 'react';
import { MotionConfig } from 'motion/react';
import { GalaxyBackground, LandingPage, Nav } from '@/components';
import { GsapSmoothScroll } from '@/components/GsapSmoothScroll';

const HOME_INTRO_STORAGE_KEY = 'mm-home-intro-played';

function hasHomeIntroPlayed() {
  if (typeof window === 'undefined') {
    return false;
  }

  try {
    return window.sessionStorage.getItem(HOME_INTRO_STORAGE_KEY) === 'true';
  } catch {
    return false;
  }
}

function markHomeIntroPlayed() {
  try {
    window.sessionStorage.setItem(HOME_INTRO_STORAGE_KEY, 'true');
  } catch {
    // Session storage can be unavailable in locked-down browser modes.
  }
}

export default function Home() {
  const [introHasPlayed, setIntroHasPlayed] = useState(hasHomeIntroPlayed);
  const introEnabled = !introHasPlayed;
  const [introReady, setIntroReady] = useState(introHasPlayed);
  const handleHeroIntroDone = useCallback(() => {
    markHomeIntroPlayed();
    setIntroHasPlayed(true);
    setIntroReady(true);
  }, []);

  return (
    <MotionConfig reducedMotion="user">
      <GalaxyBackground />
      <Nav entrance={introEnabled} introReady={introReady} />
      <GsapSmoothScroll>
        <LandingPage entrance={introEnabled} onHeroIntroDone={handleHeroIntroDone} />
      </GsapSmoothScroll>
    </MotionConfig>
  );
}
