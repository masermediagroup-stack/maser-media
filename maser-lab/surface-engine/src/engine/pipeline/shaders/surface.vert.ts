/** Fullscreen triangle vertex shader. */
export const SURFACE_VERT = `#version 300 es
precision highp float;

out vec2 vUv;

void main() {
  // Fullscreen triangle via vertex id
  float x = float((gl_VertexID & 1) << 2) - 1.0;
  float y = float((gl_VertexID & 2) << 1) - 1.0;
  vUv = vec2(x, y) * 0.5 + 0.5;
  gl_Position = vec4(x, y, 0.0, 1.0);
}
`;
