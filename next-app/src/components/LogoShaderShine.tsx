'use client';

import { ShaderGradient, ShaderGradientCanvas } from '@shadergradient/react';

export function LogoShaderShine() {
  return (
    <div className="mm-logo-shader" aria-hidden="true">
      <ShaderGradientCanvas
        style={{ position: 'absolute', inset: 0, width: '100%', height: '100%', pointerEvents: 'none' }}
        pixelDensity={2}
        fov={42}
      >
        <ShaderGradient
          animate="on"
          type="plane"
          shader="defaults"
          lightType="3d"
          envPreset="city"
          color1="#ffffff"
          color2="#f3f9ff"
          color3="#9fd8ff"
          brightness={1.35}
          grain="off"
          cDistance={3.4}
          cPolarAngle={108}
          cAzimuthAngle={165}
          uSpeed={0.08}
          uStrength={2.4}
          uFrequency={5}
          uDensity={0.95}
          positionX={0}
          positionY={0}
          positionZ={0}
          rotationX={0}
          rotationY={0}
          rotationZ={0}
          reflection={0.18}
        />
      </ShaderGradientCanvas>
    </div>
  );
}
