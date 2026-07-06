'use client';

import { useEffect, useState } from 'react';

import { HERO_SHADER_MOBILE_MQ } from './constants';
import { HeroDesktopSmokeyShader } from './desktop';
import { HeroMobileRippleShader } from './mobile';
import { DEFAULT_HERO_MOBILE_RIPPLE_CONTROLS } from './mobile/types';

type HeroShaderVariant = 'desktop' | 'mobile';

/**
 * Mounts exactly one hero background shader based on viewport width.
 * Placeholder-only render until matchMedia resolves to avoid hydration mismatch.
 */
export function HeroShaderBackground() {
  const [variant, setVariant] = useState<HeroShaderVariant | null>(null);

  useEffect(() => {
    const mq = window.matchMedia(HERO_SHADER_MOBILE_MQ);
    const apply = () => setVariant(mq.matches ? 'mobile' : 'desktop');
    apply();
    mq.addEventListener('change', apply);
    return () => mq.removeEventListener('change', apply);
  }, []);

  if (variant === null) {
    return null;
  }

  if (variant === 'mobile') {
    return (
      <HeroMobileRippleShader
        color="#10A4FF"
        rippleStrength={DEFAULT_HERO_MOBILE_RIPPLE_CONTROLS.rippleStrength}
        ringWidth={DEFAULT_HERO_MOBILE_RIPPLE_CONTROLS.ringWidth}
        rippleSpeed={DEFAULT_HERO_MOBILE_RIPPLE_CONTROLS.rippleSpeed}
        decay={DEFAULT_HERO_MOBILE_RIPPLE_CONTROLS.decay}
        distortionAmount={DEFAULT_HERO_MOBILE_RIPPLE_CONTROLS.distortionAmount}
        ringCount={DEFAULT_HERO_MOBILE_RIPPLE_CONTROLS.ringCount}
      />
    );
  }

  return <HeroDesktopSmokeyShader />;
}
