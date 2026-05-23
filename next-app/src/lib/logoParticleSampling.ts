/** SVG point sampling utilities (ported from shaders.evilrabbit.com particles shader). */

export type SvgSamplePoint = {
  x: number;
  y: number;
  edgeDist: number;
};

export type LogoTransform = {
  scale: number;
  offsetX: number;
  offsetY: number;
};

export type ParsedSvg = {
  pathData: string;
  width: number;
  height: number;
};

export function parseSvgMarkup(svgText: string): ParsedSvg {
  const doc = new DOMParser().parseFromString(svgText, 'image/svg+xml');
  const svg = doc.querySelector('svg');
  if (!svg) throw new Error('No <svg> element found');

  let width = 308;
  let height = 320;
  const viewBox = svg.getAttribute('viewBox');
  if (viewBox) {
    const parts = viewBox.trim().split(/[\s,]+/);
    if (parts.length === 4) {
      width = parseFloat(parts[2]!);
      height = parseFloat(parts[3]!);
    }
  } else {
    const w = svg.getAttribute('width');
    const h = svg.getAttribute('height');
    if (w && h) {
      width = parseFloat(w);
      height = parseFloat(h);
    }
  }

  const paths: string[] = [];
  svg.querySelectorAll('path').forEach((path) => {
    const d = path.getAttribute('d');
    if (d) paths.push(d);
  });
  if (paths.length === 0) throw new Error('No <path> elements with d attributes found');

  return { pathData: paths.join(' '), width, height };
}

/** Grid-sample points inside an SVG path; gridSize matches evilrabbit UI (1–4). */
export function fillSvgPath(
  pathData: string,
  gridSize: number,
  svgWidth = 308,
  svgHeight = 320,
): SvgSamplePoint[] {
  const pathEl = document.createElementNS('http://www.w3.org/2000/svg', 'path');
  pathEl.setAttribute('d', pathData);

  const svg = document.createElementNS('http://www.w3.org/2000/svg', 'svg');
  svg.setAttribute('viewBox', `0 0 ${svgWidth} ${svgHeight}`);
  svg.appendChild(pathEl);
  document.body.appendChild(svg);

  const points: SvgSamplePoint[] = [];
  const bbox = pathEl.getBBox();
  const step = (Math.min(svgWidth, svgHeight) / 308) * gridSize;
  const filled: { x: number; y: number }[] = [];

  for (let x = bbox.x; x < bbox.x + bbox.width; x += step) {
    for (let y = bbox.y; y < bbox.y + bbox.height; y += step) {
      const pt = svg.createSVGPoint();
      pt.x = x;
      pt.y = y;
      if (pathEl.isPointInFill(pt)) filled.push({ x, y });
    }
  }

  const filledSet = new Set(filled.map((p) => `${p.x},${p.y}`));

  for (const p of filled) {
    let edgeDist = 10;
    const dirs = [
      [-1, 0],
      [1, 0],
      [0, -1],
      [0, 1],
      [-1, -1],
      [1, -1],
      [-1, 1],
      [1, 1],
    ] as const;

    for (let n = 1; n <= 10; n++) {
      for (const [dx, dy] of dirs) {
        const nx = p.x + dx * step * n;
        const ny = p.y + dy * step * n;
        if (!filledSet.has(`${nx},${ny}`)) {
          edgeDist = Math.min(edgeDist, n);
          break;
        }
      }
    }

    points.push({ x: p.x, y: p.y, edgeDist: Math.min(edgeDist, 10) });
  }

  document.body.removeChild(svg);
  return points;
}

export function getLogoTransform(
  displayWidth: number,
  displayHeight: number,
  scale = 1,
  svgWidth = 308,
  svgHeight = 320,
): LogoTransform {
  const s =
    Math.min((0.169 * displayHeight) / svgHeight, (0.197 * displayWidth) / svgWidth) * scale;
  return {
    scale: s,
    offsetX: displayWidth / 2 - (svgWidth * s) / 2,
    offsetY: displayHeight / 2 - (svgHeight * s) / 2,
  };
}
