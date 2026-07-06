'use client';

import SmokeyBackground from '@/components/lightswind/smokey-background';

export function HeroDesktopSmokeyShader() {
  return (
    <SmokeyBackground
      color="#10A4FF"
      backdropBlurAmount="none"
      className="mm-hero__smokey-canvas mm-hero__smokey-canvas--desktop h-full min-h-0 w-full"
    />
  );
}
