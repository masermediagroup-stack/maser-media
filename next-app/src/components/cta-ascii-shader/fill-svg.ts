/** SVG fill sampling. Prefer the browser-rendered mark; Path2D is fallback. */

export type SvgFillPoint = {
  x: number;
  y: number;
  edgeDist: number;
};

export type ParsedSvg = {
  markup: string;
  pathData: string;
  paths: string[];
  width: number;
  height: number;
  originX: number;
  originY: number;
};

export type GridSample = {
  col: number;
  row: number;
  x: number;
  y: number;
  density: number;
  edgeFactor: number;
};

const DEFAULT_SIZE = 32;
export const BRAND_FILL = "#0097f5";
const BRAND_FILL_RE = /#0097f5|#2cafff/i;

function parseStyleFills(styleText: string): Map<string, string> {
  const map = new Map<string, string>();
  const block = /\.([A-Za-z0-9_-]+)\s*\{([^}]*)\}/g;
  let match: RegExpExecArray | null = block.exec(styleText);
  while (match) {
    const fill = /fill\s*:\s*([^;]+)/i.exec(match[2] ?? "");
    if (fill?.[1]) map.set(match[1], fill[1].trim());
    match = block.exec(styleText);
  }
  return map;
}

function isBrandFillValue(value: string): boolean {
  return BRAND_FILL_RE.test(value.replace(/\s/g, ""));
}

function pathIsBrandFill(path: Element, classFills: Map<string, string>): boolean {
  const fillAttr = path.getAttribute("fill") ?? "";
  if (isBrandFillValue(fillAttr)) return true;
  const classes = (path.getAttribute("class") ?? "").trim().split(/\s+/);
  if (classes.includes("st0")) return true;
  for (const name of classes) {
    const mapped = classFills.get(name);
    if (mapped && isBrandFillValue(mapped)) return true;
  }
  return false;
}

/**
 * Keep only the brand-fill silhouette (Illustrator `.st0` / `#0097f5`).
 * Shade/chrome paths are dropped so ASCII occupancy follows the real mark.
 */
export function toBrandSilhouetteMarkup(svgText: string, fill = BRAND_FILL): string {
  const doc = new DOMParser().parseFromString(svgText, "image/svg+xml");
  const svg = doc.querySelector("svg");
  if (!svg) return svgText;
  const classFills = parseStyleFills(svg.querySelector("style")?.textContent ?? "");
  const paths = [...svg.querySelectorAll("path")];
  const branded = paths.filter((path) => pathIsBrandFill(path, classFills));
  const keep = branded.length > 0 ? branded : paths;
  const keepSet = new Set(keep);
  for (const path of paths) {
    if (!keepSet.has(path)) path.remove();
  }
  for (const path of keep) {
    path.setAttribute("fill", fill);
    path.setAttribute("class", "st0");
    path.removeAttribute("opacity");
    path.removeAttribute("stroke");
  }
  const style = svg.querySelector("style");
  if (style) style.textContent = `.st0{fill:${fill};}`;
  return new XMLSerializer().serializeToString(svg);
}

export function parseSvgMarkup(svgText: string): ParsedSvg {
  const doc = new DOMParser().parseFromString(svgText, "image/svg+xml");
  const svg = doc.querySelector("svg");
  if (!svg) throw new Error("No <svg> element found");

  let originX = 0;
  let originY = 0;
  let width = DEFAULT_SIZE;
  let height = DEFAULT_SIZE;
  const viewBox = svg.getAttribute("viewBox");
  if (viewBox) {
    const parts = viewBox.trim().split(/[\s,]+/);
    if (parts.length === 4) {
      originX = parseFloat(parts[0] ?? "0") || 0;
      originY = parseFloat(parts[1] ?? "0") || 0;
      width = parseFloat(parts[2] ?? `${DEFAULT_SIZE}`);
      height = parseFloat(parts[3] ?? `${DEFAULT_SIZE}`);
    }
  } else {
    const w = svg.getAttribute("width");
    const h = svg.getAttribute("height");
    if (w && h) {
      width = parseFloat(w);
      height = parseFloat(h);
    }
  }
  if (!Number.isFinite(width) || width <= 0) width = DEFAULT_SIZE;
  if (!Number.isFinite(height) || height <= 0) height = DEFAULT_SIZE;

  const paths: string[] = [];
  svg.querySelectorAll("path").forEach((path) => {
    const d = path.getAttribute("d");
    if (d) paths.push(d);
  });
  return {
    markup: svgText,
    pathData: paths.join(" "),
    paths,
    width,
    height,
    originX,
    originY,
  };
}

function ensureSvgSize(markup: string, width: number, height: number): string {
  if (/<svg\b[^>]*\bwidth\s*=/i.test(markup) && /<svg\b[^>]*\bheight\s*=/i.test(markup)) {
    return markup;
  }
  return markup.replace(/<svg\b/i, `<svg width="${width}" height="${height}"`);
}

export function loadSvgImage(
  markup: string,
  width: number,
  height: number,
): Promise<HTMLImageElement> {
  const sized = ensureSvgSize(markup, width, height);
  const blob = new Blob([sized], { type: "image/svg+xml;charset=utf-8" });
  const url = URL.createObjectURL(blob);
  return new Promise((resolve, reject) => {
    const img = new Image();
    img.decoding = "async";
    img.onload = () => {
      const finish = () => {
        URL.revokeObjectURL(url);
        resolve(img);
      };
      void img.decode().then(finish).catch(finish);
    };
    img.onerror = () => {
      URL.revokeObjectURL(url);
      reject(new Error("Failed to rasterize SVG markup"));
    };
    img.src = url;
  });
}

function sampleAlphaGrid(
  data: Uint8ClampedArray,
  width: number,
  height: number,
  cellSize: number,
  minCol: number,
  maxCol: number,
  minRow: number,
  maxRow: number,
): GridSample[] {
  const alphaAt = (x: number, y: number) => {
    const ix = Math.round(x);
    const iy = Math.round(y);
    if (ix < 0 || iy < 0 || ix >= width || iy >= height) return 0;
    return data[(iy * width + ix) * 4 + 3] ?? 0;
  };

  const cellH = 1.6 * cellSize;
  const samples: GridSample[] = [];
  const neighbor = Math.max(1, cellSize * 0.35);
  const neighborY = Math.max(1, cellH * 0.35);

  for (let row = minRow; row <= maxRow; row++) {
    for (let col = minCol; col <= maxCol; col++) {
      const x = col * cellSize + cellSize / 2;
      const y = row * cellH + 0.8 * cellSize;
      if (alphaAt(x, y) < 128) continue;

      let hits = 0;
      for (let oy = -1; oy <= 1; oy++) {
        for (let ox = -1; ox <= 1; ox++) {
          if (alphaAt(x + ox * neighbor, y + oy * neighborY) >= 128) hits += 1;
        }
      }

      let edge = 8;
      if (
        alphaAt(x - neighbor, y) < 128 ||
        alphaAt(x + neighbor, y) < 128 ||
        alphaAt(x, y - neighborY) < 128 ||
        alphaAt(x, y + neighborY) < 128
      ) {
        edge = 1;
      } else if (
        alphaAt(x - 2 * neighbor, y) < 128 ||
        alphaAt(x + 2 * neighbor, y) < 128 ||
        alphaAt(x, y - 2 * neighborY) < 128 ||
        alphaAt(x, y + 2 * neighborY) < 128
      ) {
        edge = 3;
      }

      samples.push({
        col,
        row,
        x,
        y,
        density: hits / 9,
        edgeFactor: edge / 10,
      });
    }
  }
  return samples;
}

/**
 * Sample ASCII cell centers against the browser-rendered SVG (viewBox, fills,
 * groups). This is the real Maser mark outline, not a reconstructed path string.
 */
export function sampleSvgImageOnGrid(options: {
  image: HTMLImageElement;
  cssWidth: number;
  cssHeight: number;
  svgWidth: number;
  svgHeight: number;
  cellSize: number;
  offsetX: number;
  offsetY: number;
  scale: number;
}): GridSample[] {
  const { image, cssWidth, cssHeight, svgWidth, svgHeight, cellSize, offsetX, offsetY, scale } =
    options;
  const width = Math.max(1, Math.round(cssWidth));
  const height = Math.max(1, Math.round(cssHeight));
  const canvas = document.createElement("canvas");
  canvas.width = width;
  canvas.height = height;
  const ctx = canvas.getContext("2d", { willReadFrequently: true });
  if (!ctx) return [];
  ctx.clearRect(0, 0, width, height);
  const logoW = svgWidth * scale;
  const logoH = svgHeight * scale;
  ctx.drawImage(image, offsetX, offsetY, logoW, logoH);
  const data = ctx.getImageData(0, 0, width, height).data;
  const cellH = 1.6 * cellSize;
  const minCol = Math.max(0, Math.floor(offsetX / cellSize) - 2);
  const maxCol = Math.ceil((offsetX + logoW) / cellSize) + 2;
  const minRow = Math.max(0, Math.floor(offsetY / cellH) - 2);
  const maxRow = Math.ceil((offsetY + logoH) / cellH) + 2;
  return sampleAlphaGrid(data, width, height, cellSize, minCol, maxCol, minRow, maxRow);
}

function collectFilledPoints(
  ctx: CanvasRenderingContext2D,
  sampleWidth: number,
  sampleHeight: number,
  scaleToSvg: number,
): SvgFillPoint[] {
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
      points.push({
        x: x / scaleToSvg,
        y: y / scaleToSvg,
        edgeDist: edge,
      });
    }
  }
  return points;
}

/**
 * Path2D fallback: fill each `<path>` separately so concatenated `d` strings
 * cannot collapse the mark. Honors viewBox origin.
 */
export function rasterFillSvg(svg: ParsedSvg, sampleWidth = 1024): SvgFillPoint[] {
  const sampleHeight = Math.max(8, Math.round(sampleWidth * (svg.height / svg.width)));
  const canvas = document.createElement("canvas");
  canvas.width = sampleWidth;
  canvas.height = sampleHeight;
  const ctx = canvas.getContext("2d", { willReadFrequently: true });
  if (!ctx) return [];
  const s = sampleWidth / svg.width;
  ctx.setTransform(s, 0, 0, s, -svg.originX * s, -svg.originY * s);
  ctx.fillStyle = "#000";
  const pathList = svg.paths.length > 0 ? svg.paths : svg.pathData ? [svg.pathData] : [];
  if (pathList.length === 0) return [];
  for (const d of pathList) {
    try {
      ctx.fill(new Path2D(d), "nonzero");
    } catch {
      // Skip a malformed subpath; remaining letters still fill.
    }
  }
  ctx.setTransform(1, 0, 0, 1, 0, 0);
  return collectFilledPoints(ctx, sampleWidth, sampleHeight, s);
}

/**
 * Evil Rabbit `fillSVGPath`: grid `isPointInPath` + edge distance.
 * Fine for small viewBoxes (their 32×32 triangle). Blue-HD is too large;
 * use `sampleSvgImageOnGrid` for the CTA mark.
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
