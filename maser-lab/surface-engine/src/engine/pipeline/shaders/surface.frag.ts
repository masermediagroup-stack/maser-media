/**
 * Maser Surface Engine — Fragment Pipeline
 *
 * Stage 1  Procedural grayscale gradient
 * Stage 2  Ordered Bayer dithering
 * Stage 3  Optional blue-noise overlay
 * Stage 4  Posterization
 * Stage 5  Contrast remapping
 * Stage 6  Highlight bloom
 * Stage 7  Animated grain
 * Stage 8  Motion (CPU-interpolated uniforms)
 */

export const SURFACE_FRAG = `#version 300 es
precision highp float;

in vec2 vUv;
out vec4 fragColor;

uniform vec2 uResolution;
uniform float uTime;
uniform float uDpr;

uniform float uDitherSize;
uniform float uPosterization;
uniform float uNoiseScale;
uniform float uNoiseSpeed;
uniform float uContrast;
uniform float uBrightness;
uniform float uGradientAngle;
uniform float uGradientA;
uniform float uGradientB;
uniform float uBloom;
uniform float uBloomRadius;
uniform float uGrainAmount;
uniform float uShadowStrength;
uniform float uHighlightStrength;
uniform float uSoftEdge;
uniform float uSeed;
uniform float uAnimSpeed;
uniform float uCursorInfluence;
uniform float uScrollInfluence;
uniform float uDepth;
uniform vec2 uLight;
uniform vec2 uPointer;
uniform float uScroll;
uniform float uOpacity;
uniform float uBlueNoiseEnabled;
uniform float uReducedMotion;

uniform sampler2D uBayer;
uniform sampler2D uBlueNoise;

float hash21(vec2 p) {
  p = fract(p * vec2(123.34, 456.21) + uSeed);
  p += dot(p, p + 45.32);
  return fract(p.x * p.y);
}

float softThreshold(float value, float edge, float softness) {
  return smoothstep(edge - softness, edge + softness, value);
}

/* Stage 1 — Procedural grayscale gradient field */
float stageGradient(vec2 uv) {
  float angle = radians(uGradientAngle);
  vec2 dir = vec2(cos(angle), sin(angle));

  // Soft depth parallax from damped pointer / scroll
  vec2 offset = (uPointer - 0.5) * uCursorInfluence * uDepth * 0.18;
  offset.y += (uScroll - 0.5) * uScrollInfluence * 0.08;
  vec2 sampleUv = uv + offset;

  float t = dot(sampleUv - 0.5, dir) + 0.5;

  // Soft edge reshapes the falloff without banding in continuous space
  float soft = mix(0.35, 1.4, clamp(uSoftEdge, 0.0, 1.0));
  t = pow(clamp(t, 0.0, 1.0), soft);

  // Slow ambient drift — engineered, not twitchy
  float drift = 0.0;
  if (uReducedMotion < 0.5) {
    drift = sin(uTime * uAnimSpeed * 0.35 + uSeed * 6.28) * 0.018;
  }

  return mix(uGradientA, uGradientB, clamp(t + drift, 0.0, 1.0));
}

/* Lighting response — cursor influences light & highlight position */
float applyLight(float field, vec2 uv) {
  vec2 light = mix(uLight, uPointer, uCursorInfluence * 0.65);
  float dist = distance(uv, light);
  float highlight = exp(-dist * dist / max(0.02, uBloomRadius * uBloomRadius * 2.8));
  float shadow = smoothstep(0.15, 0.95, dist);

  field += highlight * uHighlightStrength * 0.35;
  field -= shadow * uShadowStrength * 0.18;
  return field;
}

/* Stage 5 — Contrast remapping */
float stageContrast(float field) {
  field = (field - 0.5) * uContrast + 0.5 + uBrightness;
  return clamp(field, 0.0, 1.0);
}

/* Stage 4 — Posterization (continuous-space quantization) */
float stagePosterize(float field) {
  float levels = max(2.0, uPosterization);
  return floor(field * (levels - 1.0) + 0.5) / (levels - 1.0);
}

/* Stage 2 + 3 — Bayer dither with optional blue-noise threshold mix */
float stageDither(float field, vec2 fragCoord) {
  float size = max(2.0, uDitherSize);
  vec2 bayerUv = mod(floor(fragCoord), size) / size + 0.5 / size;
  float threshold = texture(uBayer, bayerUv).r;

  if (uBlueNoiseEnabled > 0.5) {
    vec2 noiseUv = fragCoord / 64.0;
    if (uReducedMotion < 0.5) {
      noiseUv += vec2(uTime * uNoiseSpeed * 0.04, -uTime * uNoiseSpeed * 0.03);
    }
    float blue = texture(uBlueNoise, noiseUv).r;
    threshold = mix(threshold, blue, clamp(uNoiseScale, 0.0, 1.0));
  }

  // Multi-level ordered dither: recovers tonal nuance without chunky pixels
  float levels = max(2.0, uPosterization);
  float dithered = floor(field * levels + threshold) / levels;
  return clamp(dithered, 0.0, 1.0);
}

/* Stage 6 — Highlight bloom from continuous field */
float stageBloom(float dithered, float continuous, vec2 uv) {
  if (uBloom <= 0.001) return dithered;

  vec2 light = mix(uLight, uPointer, uCursorInfluence * 0.65);
  float dist = distance(uv, light);
  float glow = exp(-dist * dist / max(0.01, uBloomRadius * uBloomRadius));
  float energy = softThreshold(continuous, 0.62, 0.18) * glow * uBloom;
  return clamp(dithered + energy * 0.55, 0.0, 1.0);
}

/* Stage 7 — Animated grain */
float stageGrain(float field, vec2 fragCoord) {
  if (uGrainAmount <= 0.001) return field;
  float t = uReducedMotion > 0.5 ? uSeed : uTime * uAnimSpeed;
  float g = hash21(fragCoord + t) - 0.5;
  return clamp(field + g * uGrainAmount * 0.35, 0.0, 1.0);
}

void main() {
  vec2 fragCoord = vUv * uResolution;

  // Continuous tonal field
  float field = stageGradient(vUv);
  field = applyLight(field, vUv);
  field = stageContrast(field);

  float continuous = field;

  // Discretization path
  float poster = stagePosterize(field);
  // Blend posterized base into dither for controlled structure
  float mixed = mix(field, poster, 0.35);
  float dithered = stageDither(mixed, fragCoord);

  float lit = stageBloom(dithered, continuous, vUv);
  float grained = stageGrain(lit, fragCoord);

  // Monochrome output — engineered editorial black/white
  vec3 color = vec3(grained);
  fragColor = vec4(color, uOpacity);
}
`;
