import { DEFAULT_MATERIAL } from "./constants";
import type {
  SurfaceMaterialParams,
  SurfaceMaterialPartial,
} from "./types";
import { DAMP } from "./constants";
import { damp } from "../animation/damp";

type NumericKey = Exclude<
  {
    [K in keyof SurfaceMaterialParams]: SurfaceMaterialParams[K] extends number
      ? K
      : never;
  }[keyof SurfaceMaterialParams],
  "ditherSize"
>;

const NUMERIC_KEYS: NumericKey[] = [
  "posterization",
  "noiseScale",
  "noiseSpeed",
  "contrast",
  "brightness",
  "gradientAngle",
  "gradientColorA",
  "gradientColorB",
  "bloom",
  "bloomRadius",
  "grainAmount",
  "pixelDensity",
  "shadowStrength",
  "highlightStrength",
  "softEdge",
  "randomSeed",
  "animationSpeed",
  "cursorInfluence",
  "scrollInfluence",
  "depth",
  "opacity",
];

/**
 * Mutable material instance with damped runtime values.
 * Targets update immediately from UI; display values ease for Stage 8.
 */
export class SurfaceMaterial {
  readonly kind = "surface" as const;

  private target: SurfaceMaterialParams;
  private display: SurfaceMaterialParams;

  constructor(partial?: SurfaceMaterialPartial) {
    this.target = { ...DEFAULT_MATERIAL, ...partial };
    this.display = { ...this.target };
  }

  set(partial: SurfaceMaterialPartial): void {
    this.target = { ...this.target, ...partial };
    // Discrete / non-interpolated fields snap.
    if (partial.ditherSize !== undefined) {
      this.display.ditherSize = partial.ditherSize;
    }
    if (partial.blueNoiseEnabled !== undefined) {
      this.display.blueNoiseEnabled = partial.blueNoiseEnabled;
    }
    if (partial.lightPosition !== undefined) {
      this.target.lightPosition = [...partial.lightPosition];
    }
  }

  replace(params: SurfaceMaterialParams): void {
    this.target = { ...params };
    this.display = { ...params };
  }

  /** Ease numeric params toward targets. */
  update(delta: number): SurfaceMaterialParams {
    for (const key of NUMERIC_KEYS) {
      this.display[key] = damp(
        this.display[key],
        this.target[key],
        DAMP.material,
        delta,
      );
    }

    this.display.lightPosition = [
      damp(
        this.display.lightPosition[0],
        this.target.lightPosition[0],
        DAMP.light,
        delta,
      ),
      damp(
        this.display.lightPosition[1],
        this.target.lightPosition[1],
        DAMP.light,
        delta,
      ),
    ];

    this.display.ditherSize = this.target.ditherSize;
    this.display.blueNoiseEnabled = this.target.blueNoiseEnabled;

    return this.display;
  }

  get params(): SurfaceMaterialParams {
    return this.display;
  }

  get targets(): SurfaceMaterialParams {
    return this.target;
  }

  clone(): SurfaceMaterial {
    return new SurfaceMaterial({ ...this.target });
  }
}
