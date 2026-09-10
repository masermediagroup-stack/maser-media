/** SVG fill sampling from Evil Rabbit's AsciiShader (`fillSVGPath` + parseSVGFile). */

export type SvgFillPoint = {
  x: number;
  y: number;
  edgeDist: number;
};

export type ParsedSvg = {
  pathData: string;
  width: number;
  height: number;
};

export function parseSvgMarkup(svgText: string): ParsedSvg {
  const doc = new DOMParser().parseFromString(svgText, "image/svg+xml");
  const svg = doc.querySelector("svg");
  if (!svg) throw new Error("No <svg> element found");

  let width = 32;
  let height = 32;
  const viewBox = svg.getAttribute("viewBox");
  if (viewBox) {
    const parts = viewBox.trim().split(/[\s,]+/);
    if (parts.length === 4) {
      width = parseFloat(parts[2] ?? "32");
      height = parseFloat(parts[3] ?? "32");
    }
  } else {
    const w = svg.getAttribute("width");
    const h = svg.getAttribute("height");
    if (w && h) {
      width = parseFloat(w);
      height = parseFloat(h);
    }
  }

  const paths: string[] = [];
  svg.querySelectorAll("path").forEach((path) => {
    const d = path.getAttribute("d");
    if (d) paths.push(d);
  });
  if (paths.length === 0) {
    throw new Error("No <path> elements with d attributes found");
  }

  return { pathData: paths.join(" "), width, height };
}

/**
 * Evil Rabbit `fillSVGPath`: grid `isPointInPath` + edge distance.
 * Fine for small viewBoxes (their 32×32 triangle). Blue-HD is too large;
 * use `rasterFillSvg` for the CTA mark.
 */
export function fillSvgPath(
  pathData: string,
  gridSize = 1.2,
  svgWidth = 32,
  svgHeight = 32,
): SvgFillPoint[] {
  const ctx = document.createElement("canvas").getContext("2d");
  if (!ctx) return [];
  const path = new Path2D(pathData);
  const points: SvgFillPoint[] = [];
  const nx = Math.ceil(svgWidth / gridSize);
  const ny = Math.ceil(svgHeight / gridSize);

  for (let iy = 0; iy <= ny; iy++) {
    for (let ix = 0; ix <= nx; ix++) {
      const x = ix * gridSize;
      const y = iy * gridSize;
      if (!ctx.isPointInPath(path, x, y, "nonzero")) continue;
      let minD = Infinity;
      for (let a = 0; a < Math.PI * 2; a += Math.PI / 8) {
        for (let r = gridSize; r < 40; r += gridSize) {
          if (!ctx.isPointInPath(path, x + Math.cos(a) * r, y + Math.sin(a) * r, "nonzero")) {
            minD = Math.min(minD, r);
            break;
          }
        }
      }
      points.push({ x, y, edgeDist: minD === Infinity ? 20 : minD });
    }
  }
  return points;
}

/**
 * Raster fill for large SVGs (Blue-HD viewBox ~3777×1916).
 * Same silhouette as filling the combined path, without a 1.2-unit grid hitch.
 */
export function rasterFillSvg(svg: ParsedSvg, sampleWidth = 420): SvgFillPoint[] {
  const sampleHeight = Math.max(8, Math.round(sampleWidth * (svg.height / svg.width)));
  const canvas = document.createElement("canvas");
  canvas.width = sampleWidth;
  canvas.height = sampleHeight;
  const ctx = canvas.getContext("2d", { willReadFrequently: true });
  if (!ctx) return [];
  const s = sampleWidth / svg.width;
  ctx.setTransform(s, 0, 0, s, 0, 0);
  ctx.fillStyle = "#000";
  ctx.fill(new Path2D(svg.pathData), "nonzero");
  const data = ctx.getImageData(0, 0, sampleWidth, sampleHeight).data;
  const points: SvgFillPoint[] = [];
  const alphaAt = (x: number, y: number) => {
    if (x < 0 || y < 0 || x >= sampleWidth || y >= sampleHeight) return 0;
    return data[(y * sampleWidth + x) * 4 + 3] ?? 0;
  };
  for (let y = 0; y < sampleHeight; y++) {
    for (let x = 0; x < sampleWidth; x++) {
      if (alphaAt(x, y) < 128) continue;
      let edge = 8;
      if (
        alphaAt(x - 1, y) < 128 ||
        alphaAt(x + 1, y) < 128 ||
        alphaAt(x, y - 1) < 128 ||
        alphaAt(x, y + 1) < 128
      ) {
        edge = 1;
      } else if (
        alphaAt(x - 2, y) < 128 ||
        alphaAt(x + 2, y) < 128 ||
        alphaAt(x, y - 2) < 128 ||
        alphaAt(x, y + 2) < 128
      ) {
        edge = 3;
      }
      points.push({ x: x / s, y: y / s, edgeDist: edge });
    }
  }
  return points;
}

export function fitLogoTransform(
  displayWidth: number,
  displayHeight: number,
  svgWidth: number,
  svgHeight: number,
  pad = 0.04,
): { scale: number; offsetX: number; offsetY: number } {
  const innerW = displayWidth * (1 - pad * 2);
  const innerH = displayHeight * (1 - pad * 2);
  const scale = Math.min(innerW / svgWidth, innerH / svgHeight);
  return {
    scale,
    offsetX: (displayWidth - svgWidth * scale) / 2,
    offsetY: (displayHeight - svgHeight * scale) / 2,
  };
}
