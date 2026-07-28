/**
 * Ordered Bayer matrices for Stages 2 of the Surface pipeline.
 *
 * Values are normalized to [0, 1). Generated recursively so 2/4/8/16
 * stay consistent — engineered structure, not hand-tuned nostalgia.
 */

import type { BayerSize } from "../core/types";

const BAYER_2: number[][] = [
  [0, 2],
  [3, 1],
];

function expandBayer(source: number[][]): number[][] {
  const n = source.length;
  const next = Array.from({ length: n * 2 }, () => Array<number>(n * 2).fill(0));
  for (let y = 0; y < n; y += 1) {
    for (let x = 0; x < n; x += 1) {
      const v = source[y]![x]! * 4;
      next[y]![x] = v;
      next[y]![x + n] = v + 2;
      next[y + n]![x] = v + 3;
      next[y + n]![x + n] = v + 1;
    }
  }
  return next;
}

function normalize(matrix: number[][]): Float32Array {
  const n = matrix.length;
  const denom = n * n;
  const out = new Float32Array(n * n);
  for (let y = 0; y < n; y += 1) {
    for (let x = 0; x < n; x += 1) {
      out[y * n + x] = matrix[y]![x]! / denom;
    }
  }
  return out;
}

const BAYER_4 = expandBayer(BAYER_2);
const BAYER_8 = expandBayer(BAYER_4);
const BAYER_16 = expandBayer(BAYER_8);

const CACHE: Record<BayerSize, Float32Array> = {
  2: normalize(BAYER_2),
  4: normalize(BAYER_4),
  8: normalize(BAYER_8),
  16: normalize(BAYER_16),
};

export function getBayerMatrix(size: BayerSize): Float32Array {
  return CACHE[size];
}

/** Upload a Bayer matrix as a single-channel R32F texture (WebGL2). */
export function uploadBayerTexture(
  gl: WebGL2RenderingContext,
  size: BayerSize,
  existing?: WebGLTexture | null,
): WebGLTexture {
  const data = getBayerMatrix(size);
  const texture = existing ?? gl.createTexture();
  if (!texture) {
    throw new Error("Surface Engine: failed to create Bayer texture");
  }

  gl.bindTexture(gl.TEXTURE_2D, texture);
  gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MIN_FILTER, gl.NEAREST);
  gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MAG_FILTER, gl.NEAREST);
  gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_S, gl.REPEAT);
  gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_T, gl.REPEAT);
  gl.pixelStorei(gl.UNPACK_ALIGNMENT, 1);
  gl.texImage2D(
    gl.TEXTURE_2D,
    0,
    gl.R32F,
    size,
    size,
    0,
    gl.RED,
    gl.FLOAT,
    data,
  );
  gl.bindTexture(gl.TEXTURE_2D, null);
  return texture;
}
