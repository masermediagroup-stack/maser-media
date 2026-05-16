'use client';

import { useCallback, useState, useSyncExternalStore } from 'react';
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

function subscribeToIntroStorage() {
  return () => {};
}

function getIntroStorageSnapshot() {
  return hasHomeIntroPlayed();
}

function getServerIntroStorageSnapshot() {
  return false;
}

export default function Home() {
  const skipIntro = useSyncExternalStore(
    subscribeToIntroStorage,
    getIntroStorageSnapshot,
    getServerIntroStorageSnapshot,
  );
  const introEnabled = !skipIntro;
  const [introDone, setIntroDone] = useState(false);
  const introReady = skipIntro || introDone;
  const handleHeroIntroDone = useCallback(() => {
    markHomeIntroPlayed();
    setIntroDone(true);
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
