"use client";

import { useCallback, useState } from "react";
import type { SurfaceMaterialParams, SurfaceMaterialPartial } from "../core/types";
import { DEFAULT_MATERIAL } from "../core/constants";

/**
 * Holds material control state for the demo UI.
 * Updates are batched; the canvas reads the latest object by reference.
 */
export function useSurfaceControls(
  initial?: SurfaceMaterialPartial,
): {
  params: SurfaceMaterialParams;
  setParam: <K extends keyof SurfaceMaterialParams>(
    key: K,
    value: SurfaceMaterialParams[K],
  ) => void;
  setMany: (partial: SurfaceMaterialPartial) => void;
  reset: () => void;
} {
  const [params, setParams] = useState<SurfaceMaterialParams>({
    ...DEFAULT_MATERIAL,
    ...initial,
  });

  const setParam = useCallback(
    <K extends keyof SurfaceMaterialParams>(
      key: K,
      value: SurfaceMaterialParams[K],
    ) => {
      setParams((prev) => {
        if (prev[key] === value) return prev;
        return { ...prev, [key]: value };
      });
    },
    [],
  );

  const setMany = useCallback((partial: SurfaceMaterialPartial) => {
    setParams((prev) => ({ ...prev, ...partial }));
  }, []);

  const reset = useCallback(() => {
    setParams({ ...DEFAULT_MATERIAL, ...initial });
  }, [initial]);

  return { params, setParam, setMany, reset };
}
