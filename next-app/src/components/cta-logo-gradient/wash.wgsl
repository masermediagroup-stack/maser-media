struct Params {
  phase: f32,
  heading: f32,
  highlight: f32,
  shade: f32,
  glow: f32,
  pad: f32,
}

@group(0) @binding(0) var<uniform> params: Params;

const BLUE = vec3f(0.062745, 0.643137, 1.0);
const WHITE = vec3f(0.960784, 0.984314, 1.0);
const DARK = vec3f(0.031373, 0.447059, 0.768627);
const TAU = 6.283185307179586;
const NEIGHBOR = 0.09;
const BLOB_RADIUS = 1.2;
const BLOB_STOP = 0.78;

fn paletteAt(t: f32) -> vec3f {
  let u = fract(t);
  let seg = u * 4.0;
  let i = floor(seg);
  let f = fract(seg);
  let hi = mix(BLUE, WHITE, params.highlight * 0.48) + WHITE * params.glow * 0.18;
  let lo = mix(BLUE, DARK, params.shade * 0.82);
  var a = BLUE;
  var b = BLUE;
  if (i < 0.5) {
    a = BLUE;
    b = hi;
  } else if (i < 1.5) {
    a = hi;
    b = BLUE;
  } else if (i < 2.5) {
    a = BLUE;
    b = lo;
  } else {
    a = lo;
    b = BLUE;
  }
  return clamp(mix(a, b, f), vec3f(0.0), vec3f(1.0));
}

fn dist4(index: f32, hot: f32) -> f32 {
  let d = abs(index - hot);
  return min(d, 4.0 - d);
}

fn blobAlpha(uv: vec2f, center: vec2f) -> f32 {
  let fall = saturate(1.0 - length((uv - center) / BLOB_RADIUS) / BLOB_STOP);
  return fall * fall;
}

@fragment fn fs_main(@location(0) uv: vec2f) -> @location(0) vec4f {
  let hot = fract(params.heading / TAU) * 4.0;
  let phase = fract(params.phase);
  let tl = paletteAt(phase + dist4(0.0, hot) * NEIGHBOR);
  let tr = paletteAt(phase + dist4(1.0, hot) * NEIGHBOR);
  let br = paletteAt(phase + dist4(2.0, hot) * NEIGHBOR);
  let bl = paletteAt(phase + dist4(3.0, hot) * NEIGHBOR);
  var c = BLUE;
  c = mix(c, br, blobAlpha(uv, vec2f(1.0, 1.0)));
  c = mix(c, bl, blobAlpha(uv, vec2f(0.0, 1.0)));
  c = mix(c, tr, blobAlpha(uv, vec2f(1.0, 0.0)));
  c = mix(c, tl, blobAlpha(uv, vec2f(0.0, 0.0)));
  return vec4f(c, 1.0);
}
