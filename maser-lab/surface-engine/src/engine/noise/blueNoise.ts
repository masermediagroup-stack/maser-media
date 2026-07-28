/**
 * Blue-noise threshold field for Stage 3.
 *
 * Generated once via void-and-cluster approximation so the GPU only
 * samples a texture — never rebuilds noise each frame.
 */

const SIZE = 64;

function hash2(x: number, y: number, seed: number): number {
  const n = Math.sin(x * 127.1 + y * 311.7 + seed * 74.7) * 43758.5453;
  return n - Math.floor(n);
}

/**
 * Approximate blue-noise by discarding nearest-neighbor energy.
 * Not a perfect void-and-cluster, but GPU-friendly and seedable.
 */
export function generateBlueNoise(seed = 0.417, size = SIZE): Float32Array {
  const values = new Float32Array(size * size);
  const order: { x: number; y: number; rank: number }[] = [];

  for (let y = 0; y < size; y += 1) {
    for (let x = 0; x < size; x += 1) {
      const jitter = hash2(x, y, seed);
      const checker = ((x * 0.618 + y * 0.382) % 1) * 0.35;
      order.push({ x, y, rank: jitter * 0.65 + checker });
    }
  }

  order.sort((a, b) => a.rank - b.rank);

  const occupied = new Uint8Array(size * size);
  let placed = 0;
  const total = size * size;

  // Greedy placement with local repulsion for bluish spectrum.
  for (const candidate of order) {
    const idx = candidate.y * size + candidate.x;
    if (occupied[idx]) continue;

    let energy = 0;
    const radius = 3;
    for (let oy = -radius; oy <= radius; oy += 1) {
      for (let ox = -radius; ox <= radius; ox += 1) {
        if (ox === 0 && oy === 0) continue;
        const nx = (candidate.x + ox + size) % size;
        const ny = (candidate.y + oy + size) % size;
        if (occupied[ny * size + nx]) {
          const dist = Math.sqrt(ox * ox + oy * oy);
          energy += 1 / (dist * dist);
        }
      }
    }

    if (energy > 1.8 && placed < total * 0.85) {
      continue;
    }

    occupied[idx] = 1;
    values[idx] = placed / total;
    placed += 1;
  }

  // Fill remaining cells.
  for (let i = 0; i < total; i += 1) {
    if (!occupied[i]) {
      values[i] = placed / total;
      occupied[i] = 1;
      placed += 1;
    }
  }

  return values;
}

export function uploadBlueNoiseTexture(
  gl: WebGL2RenderingContext,
  seed: number,
  existing?: WebGLTexture | null,
): WebGLTexture {
  const data = generateBlueNoise(seed, SIZE);
  const texture = existing ?? gl.createTexture();
  if (!texture) {
    throw new Error("Surface Engine: failed to create blue-noise texture");
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
    SIZE,
    SIZE,
    0,
    gl.RED,
    gl.FLOAT,
    data,
  );
  gl.bindTexture(gl.TEXTURE_2D, null);
  return texture;
}

export const BLUE_NOISE_SIZE = SIZE;
