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
  uniform float uAspect;

  uniform vec2 uRippleOrigin;
  uniform float uRippleStartTime;
  uniform float uRippleActive;

  uniform float uRippleStrength;
  uniform float uRingWidth;
  uniform float uRippleSpeed;
  uniform float uDecay;
  uniform float uWhiteIntensity;
  uniform float uDistortionAmount;
  uniform int uRingCount;

  varying vec2 vUv;

  const int MAX_RINGS = 6;

  float baseSmokeyGlow(vec2 uv, float time) {
    vec2 centeredUV = (uv - 0.5) * vec2(uAspect, 1.0) * 2.0;
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

    vec2 p = (sampleUv - uRippleOrigin) * vec2(uAspect, 1.0);
    float dist = length(p);
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

  vec2 rippleDisplacement(vec2 uv) {
    float eps = 0.0018;
    float h = rippleHeightAt(uv);
    float hx = rippleHeightAt(uv + vec2(eps, 0.0)) - rippleHeightAt(uv - vec2(eps, 0.0));
    float hy = rippleHeightAt(uv + vec2(0.0, eps)) - rippleHeightAt(uv - vec2(0.0, eps));
    return uv + vec2(hx, hy) * uDistortionAmount;
  }

  void main() {
    float time = uTime * 0.5;
    vec2 uv = vUv;

    vec2 displacedUv = rippleDisplacement(uv);
    vec2 centeredDisplaced = (displacedUv - 0.5) * vec2(uAspect, 1.0) * 2.0;

    float glow = baseSmokeyGlow(displacedUv, time);
    vec3 baseColor = uColor * glow;

    float eps = 0.0018;
    float height = rippleHeightAt(uv);
    float hx = rippleHeightAt(uv + vec2(eps, 0.0)) - rippleHeightAt(uv - vec2(eps, 0.0));
    float hy = rippleHeightAt(uv + vec2(0.0, eps)) - rippleHeightAt(uv - vec2(0.0, eps));
    vec3 normal = normalize(vec3(-hx * 2.4, -hy * 2.4, 1.0));
    vec3 lightDir = normalize(vec3(-0.35, 0.55, 0.75));
    vec3 viewDir = vec3(0.0, 0.0, 1.0);
    float diffuse = clamp(dot(normal, lightDir), 0.0, 1.0);
    float spec = pow(clamp(dot(reflect(-lightDir, normal), viewDir), 0.0, 1.0), 28.0);

    float ridge = smoothstep(0.08, 0.95, abs(height) / max(uRippleStrength * 0.85, 0.0001));
    float blueMask = smoothstep(0.12, 0.55, glow);
    float whiteRidge = ridge * blueMask * uWhiteIntensity;

    baseColor = mix(baseColor, vec3(1.0), whiteRidge);
    baseColor *= 0.82 + diffuse * 0.22;
    baseColor += spec * 0.12 * blueMask;
    baseColor = mix(vec3(0.0), baseColor, smoothstep(0.02, 0.14, glow));

    float vignette = smoothstep(1.35, 0.15, length(centeredDisplaced * 0.72));
    baseColor *= mix(0.35, 1.0, vignette);

    gl_FragColor = vec4(baseColor, 1.0);
  }
`;
