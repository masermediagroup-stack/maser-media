export const heroRippleVertexShader = /* glsl */ `
  varying vec2 vUv;

  void main() {
    vUv = uv;
    gl_Position = vec4(position.xy, 0.0, 1.0);
  }
`;

export const heroRippleFragmentShader = /* glsl */ `
  precision highp float;

  uniform vec2 uResolution;
  uniform float uTime;
  uniform vec3 uColor;

  uniform vec2 uRippleOrigin;
  uniform float uRippleStartTime;
  uniform float uRippleActive;

  uniform float uRippleStrength;
  uniform float uRingWidth;
  uniform float uRippleSpeed;
  uniform float uDecay;
  uniform float uDistortionAmount;
  uniform int uRingCount;

  varying vec2 vUv;

  const int MAX_RINGS = 6;

  vec2 heroUv(vec2 uv) {
    vec2 centered = uv * uResolution - uResolution * 0.5;
    return centered / min(uResolution.x, uResolution.y);
  }

  float baseSmokeyGlow(vec2 uv, float time) {
    vec2 centeredUV = heroUv(uv);
    vec2 distortion = centeredUV;

    for (float i = 1.0; i < 8.0; i++) {
      distortion.x += 0.42 / i * cos(i * 2.0 * distortion.y + time);
      distortion.y += 0.42 / i * cos(i * 2.0 * distortion.x + time);
    }

    float wave = abs(sin(distortion.x + distortion.y + time));
    return smoothstep(0.9, 0.2, wave);
  }

  float rippleHeightAt(vec2 sampleUv) {
    if (uRippleActive < 0.5) {
      return 0.0;
    }

    float elapsed = max(uTime - uRippleStartTime, 0.0);
    if (elapsed > 4.5) {
      return 0.0;
    }

    vec2 p = heroUv(sampleUv);
    vec2 origin = heroUv(uRippleOrigin);
    float dist = length(p - origin);
    float height = 0.0;

    for (int i = 0; i < MAX_RINGS; i++) {
      if (i >= uRingCount) {
        break;
      }

      float ringIndex = float(i);
      float speedScale = 1.0 - ringIndex * 0.07;
      float radius = elapsed * uRippleSpeed * speedScale - ringIndex * (uRingWidth * 3.2);
      float ringDist = dist - radius;
      float envelope = exp(-abs(ringDist) * uDecay) * exp(-elapsed * 0.42);
      float wave = sin(ringDist / uRingWidth) * envelope;
      height += wave * uRippleStrength * (1.0 - ringIndex * 0.14);
    }

    return height;
  }

  vec2 rippleGradient(vec2 uv) {
    float eps = 0.0014;
    float hx = rippleHeightAt(uv + vec2(eps, 0.0)) - rippleHeightAt(uv - vec2(eps, 0.0));
    float hy = rippleHeightAt(uv + vec2(0.0, eps)) - rippleHeightAt(uv - vec2(0.0, eps));
    return vec2(hx, hy);
  }

  vec2 rippleDisplacement(vec2 uv) {
    vec2 offset = rippleGradient(uv) * uDistortionAmount;
    // Second pass — refract the field like a water surface catching the wave twice.
    offset += rippleGradient(uv + offset) * uDistortionAmount * 0.72;
    return uv + offset;
  }

  void main() {
    float time = uTime * 0.5;
    vec2 displacedUv = rippleDisplacement(vUv);
    float glow = baseSmokeyGlow(displacedUv, time);
    gl_FragColor = vec4(uColor * glow, 1.0);
  }
`;
