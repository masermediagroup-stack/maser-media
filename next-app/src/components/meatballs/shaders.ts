import { MAX_CHARGES } from "./constants";

/**
 * Fullscreen triangle via gl_VertexID.
 * No attribute buffer.
 */
export const VERT_SRC = `#version 300 es
precision highp float;
const vec2 POS[3] = vec2[3](
  vec2(-1.0, -1.0),
  vec2( 3.0, -1.0),
  vec2(-1.0,  3.0)
);
out vec2 vUv;
void main() {
  vec2 p = POS[gl_VertexID];
  vUv = p * 0.5 + 0.5;
  gl_Position = vec4(p, 0.0, 1.0);
}
`;

/**
 * Geometry: IQ quadratic smin on circle SDFs.
 * Color: shared UV/IDW Maser-blue wash.
 * Isolated disc = wet mercury: IDW spec wash + combined-field isocontour
 * limb graze. No per-ball lamp, no dither.
 */
export const FRAG_SRC = `#version 300 es
precision highp float;

in vec2 vUv;
out vec4 fragColor;

const int MAX_CHARGES = ${MAX_CHARGES};
const int PAL_COUNT = 5;

uniform vec4 uBalls[MAX_CHARGES];
uniform vec2 uResolution;
uniform float uMergeK;
uniform vec3 uAlbedo;
uniform vec3 uCrease;
uniform vec3 uSpec;
uniform float uHueShift;
uniform float uSatMul;
uniform float uWetness;

const vec2 PAL_POS[PAL_COUNT] = vec2[PAL_COUNT](
  vec2(0.16, 0.20),
  vec2(0.82, 0.16),
  vec2(0.48, 0.58),
  vec2(0.18, 0.84),
  vec2(0.86, 0.78)
);

vec3 rgb2hsv(vec3 c) {
  vec4 k = vec4(0.0, -1.0 / 3.0, 2.0 / 3.0, -1.0);
  vec4 p = mix(vec4(c.bg, k.wz), vec4(c.gb, k.xy), step(c.b, c.g));
  vec4 q = mix(vec4(p.xyw, c.r), vec4(c.r, p.yzx), step(p.x, c.r));
  float d = q.x - min(q.w, q.y);
  float e = 1.0e-10;
  return vec3(abs(q.z + (q.w - q.y) / (6.0 * d + e)), d / (q.x + e), q.x);
}

vec3 hsv2rgb(vec3 c) {
  vec4 k = vec4(1.0, 2.0 / 3.0, 1.0 / 3.0, 3.0);
  vec3 p = abs(fract(c.xxx + k.xyz) * 6.0 - k.www);
  return c.z * mix(k.xxx, clamp(p - k.xxx, 0.0, 1.0), c.y);
}

vec3 mercuryTint(vec3 rgb) {
  vec3 hsv = rgb2hsv(rgb);
  hsv.x = fract(hsv.x + uHueShift + 1.0);
  hsv.y = clamp(hsv.y * uSatMul, 0.0, 1.0);
  return hsv2rgb(hsv);
}

vec2 sminQuadratic(float a, float b, float k) {
  float h = 1.0 - min(abs(a - b) / (4.0 * k), 1.0);
  float w = h * h;
  float m = w * 0.5;
  float s = w * k;
  return (a < b) ? vec2(a - s, m) : vec2(b - s, 1.0 - m);
}

float field(vec2 p, out float crease) {
  float d = 1e6;
  crease = 0.0;
  for (int i = 0; i < MAX_CHARGES; i++) {
    vec4 ball = uBalls[i];
    if (ball.w < 0.5) continue;
    float di = length(p - ball.xy) - ball.z;
    vec2 sm = sminQuadratic(d, di, uMergeK);
    crease = max(crease, 4.0 * sm.y * (1.0 - sm.y));
    d = sm.x;
  }
  return d;
}

vec3 metalWash(vec2 uv, vec3 albedo, vec3 crease, float wet) {
  vec3 stops[PAL_COUNT];
  stops[0] = mix(albedo, uSpec, wet);
  stops[1] = mix(mix(albedo, crease, mix(0.04, 0.22, wet)), uSpec, wet);
  stops[2] = mix(mix(albedo, crease, mix(0.08, 0.34, wet)), uSpec, wet);
  stops[3] = mix(mix(albedo, crease, mix(0.10, 0.42, wet)), uSpec, wet);
  stops[4] = mix(mix(albedo, crease, mix(0.03, 0.16, wet)), uSpec, wet);

  vec3 color = vec3(0.0);
  float totalWeight = 0.0;
  for (int i = 0; i < PAL_COUNT; i++) {
    float dist = length(uv - PAL_POS[i]);
    dist = pow(max(dist, 1e-4), 2.0);
    float w = 1.0 / (dist + 1e-3);
    color += stops[i] * w;
    totalWeight += w;
  }
  return color / max(totalWeight, 1e-4);
}

void main() {
  vec2 p = vUv * uResolution;
  float crease = 0.0;
  float d = field(p, crease);

  vec2 fd = vec2(dFdx(d), dFdy(d));
  float dPx = max(fwidth(d), 1e-4);
  float cSlope = length(vec2(dFdx(crease), dFdy(crease)));
  float cPx = max(fwidth(crease), 1e-4);

  float aa = max(dPx, 0.75);
  float mask = smoothstep(aa, -aa, d);
  if (mask < 0.004) {
    fragColor = vec4(0.0);
    return;
  }

  vec3 albedo = mercuryTint(uAlbedo);
  vec3 creaseCol = mercuryTint(uCrease);
  float wet = clamp(uWetness, 0.0, 1.0);
  float washWet = mix(0.03, 0.34, wet);

  vec3 color = metalWash(vUv, albedo, creaseCol, washWet);
  color = mix(color, albedo, mix(0.28, 0.0, wet));
  color = mix(color, mix(albedo, creaseCol, 0.62), mix(0.0, 0.34, wet));
  float creaseAmt = mix(0.32, 0.98, wet);
  float creasePow = mix(0.92, 0.52, wet);
  color = mix(color, creaseCol, clamp(pow(clamp(crease, 0.0, 1.0), creasePow) * creaseAmt, 0.0, 1.0));

  float rim = smoothstep(mix(-20.0, -7.0, wet), mix(-4.0, -0.9, wet), d);
  float limb = smoothstep(mix(-26.0, -9.0, wet), mix(-5.0, -1.2, wet), d);

  float gLen = length(fd);
  float alive = smoothstep(0.16, 0.58, gLen / dPx);

  vec2 n2 = vec2(0.0);
  if (gLen > 1e-5) n2 = fd / gLen;
  vec2 L = normalize(vec2(-0.42, 0.78));
  float ndl = max(dot(n2, L), 0.0);

  float rimAmt = mix(0.10, 0.72, wet);
  float grazeAmt = mix(0.16, 1.0, wet);
  float specAmt = mix(0.03, 0.92, wet);
  color = mix(color, mix(albedo, uSpec, mix(0.42, 0.82, wet)), rim * rimAmt);
  float graze = pow(ndl, mix(2.2, 5.8, wet)) * limb * alive;
  float specK = pow(ndl, mix(4.5, 13.0, wet)) * pow(limb, mix(0.72, 1.4, wet)) * alive;
  color = mix(color, mix(albedo, uSpec, mix(0.55, 0.94, wet)), graze * grazeAmt);
  color = mix(color, uSpec, specK * specAmt);

  float c = clamp(crease, 0.0, 1.0);
  float wall = smoothstep(cPx * 0.12, cPx * 8.0, cSlope);
  wall *= smoothstep(mix(0.22, 0.12, wet), mix(0.62, 0.40, wet), c);
  color = mix(color, mix(albedo, uSpec, 0.90), wall * mix(0.06, 0.70, wet));
  color = mix(color, uSpec, wall * wall * mix(0.02, 0.48, wet));

  fragColor = vec4(color * mask, mask);
}
`;
