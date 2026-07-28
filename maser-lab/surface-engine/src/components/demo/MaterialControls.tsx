"use client";

import type { BayerSize, SurfaceMaterialParams } from "@/engine";
import { MATERIAL_PRESETS } from "@/engine";
import { Label } from "@/components/ui/label";
import { Slider } from "@/components/ui/slider";
import { Switch } from "@/components/ui/switch";
import { Button } from "@/components/ui/button";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Separator } from "@/components/ui/separator";
import { cn } from "@/lib/utils";

interface ControlDef {
  key: keyof SurfaceMaterialParams;
  label: string;
  min: number;
  max: number;
  step: number;
}

const SLIDERS: ControlDef[] = [
  { key: "posterization", label: "Posterization", min: 2, max: 16, step: 1 },
  { key: "noiseScale", label: "Noise Scale", min: 0, max: 1, step: 0.01 },
  { key: "noiseSpeed", label: "Noise Speed", min: 0, max: 1, step: 0.01 },
  { key: "contrast", label: "Contrast", min: 0.4, max: 2, step: 0.01 },
  { key: "brightness", label: "Brightness", min: -0.4, max: 0.4, step: 0.01 },
  { key: "gradientAngle", label: "Gradient Angle", min: 0, max: 360, step: 1 },
  { key: "gradientColorA", label: "Gradient Color A", min: 0, max: 1, step: 0.01 },
  { key: "gradientColorB", label: "Gradient Color B", min: 0, max: 1, step: 0.01 },
  { key: "bloom", label: "Bloom", min: 0, max: 1, step: 0.01 },
  { key: "bloomRadius", label: "Bloom Radius", min: 0.05, max: 0.6, step: 0.01 },
  { key: "grainAmount", label: "Grain Amount", min: 0, max: 0.4, step: 0.01 },
  { key: "pixelDensity", label: "Pixel Density", min: 0.5, max: 2, step: 0.05 },
  { key: "shadowStrength", label: "Shadow Strength", min: 0, max: 1, step: 0.01 },
  { key: "highlightStrength", label: "Highlight Strength", min: 0, max: 1, step: 0.01 },
  { key: "softEdge", label: "Soft Edge", min: 0, max: 1, step: 0.01 },
  { key: "randomSeed", label: "Random Seed", min: 0, max: 1, step: 0.001 },
  { key: "animationSpeed", label: "Animation Speed", min: 0, max: 1.5, step: 0.01 },
  { key: "cursorInfluence", label: "Cursor Influence", min: 0, max: 1, step: 0.01 },
  { key: "scrollInfluence", label: "Scroll Influence", min: 0, max: 1, step: 0.01 },
  { key: "depth", label: "Depth", min: 0, max: 1, step: 0.01 },
  { key: "opacity", label: "Opacity", min: 0.2, max: 1, step: 0.01 },
];

export interface MaterialControlsProps {
  params: SurfaceMaterialParams;
  onChange: <K extends keyof SurfaceMaterialParams>(
    key: K,
    value: SurfaceMaterialParams[K],
  ) => void;
  onPreset: (partial: Partial<SurfaceMaterialParams>) => void;
  onReset: () => void;
  className?: string;
}

function formatValue(value: number, step: number): string {
  if (step >= 1) return String(Math.round(value));
  if (step >= 0.01) return value.toFixed(2);
  return value.toFixed(3);
}

function readSliderValue(value: number | readonly number[]): number {
  if (typeof value === "number") return value;
  return value[0] ?? 0;
}

export function MaterialControls({
  params,
  onChange,
  onPreset,
  onReset,
  className,
}: MaterialControlsProps) {
  return (
    <aside
      className={cn(
        "flex h-full max-h-[min(90vh,920px)] w-full flex-col overflow-hidden rounded-2xl border border-neutral-200 bg-white",
        className,
      )}
    >
      <div className="flex items-start justify-between gap-3 border-b border-neutral-100 px-5 py-4">
        <div>
          <p className="text-[11px] font-medium uppercase tracking-[0.18em] text-neutral-400">
            Material
          </p>
          <h3 className="mt-1 text-sm font-semibold text-neutral-900">
            Surface Controls
          </h3>
        </div>
        <Button
          type="button"
          variant="outline"
          size="sm"
          onClick={onReset}
          className="rounded-lg"
        >
          Reset
        </Button>
      </div>

      <div className="flex-1 space-y-5 overflow-y-auto px-5 py-4">
        <div className="space-y-2">
          <Label className="text-xs text-neutral-500">Preset</Label>
          <Select
            onValueChange={(id) => {
              if (!id) return;
              const preset = MATERIAL_PRESETS.find((p) => p.id === id);
              if (preset) onPreset(preset.params);
            }}
          >
            <SelectTrigger className="w-full rounded-lg">
              <SelectValue placeholder="Choose a preset" />
            </SelectTrigger>
            <SelectContent>
              {MATERIAL_PRESETS.map((preset) => (
                <SelectItem key={preset.id} value={preset.id}>
                  {preset.label}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>

        <div className="space-y-2">
          <Label className="text-xs text-neutral-500">Dither Size</Label>
          <Select
            value={String(params.ditherSize)}
            onValueChange={(value) => {
              if (!value) return;
              onChange("ditherSize", Number(value) as BayerSize);
            }}
          >
            <SelectTrigger className="w-full rounded-lg">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              {[2, 4, 8, 16].map((size) => (
                <SelectItem key={size} value={String(size)}>
                  {size}×{size} Bayer
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>

        <div className="flex items-center justify-between gap-3">
          <Label htmlFor="blue-noise" className="text-xs text-neutral-500">
            Blue Noise Overlay
          </Label>
          <Switch
            id="blue-noise"
            checked={params.blueNoiseEnabled}
            onCheckedChange={(checked) =>
              onChange("blueNoiseEnabled", checked)
            }
          />
        </div>

        <Separator />

        <div className="space-y-4">
          <div className="space-y-2">
            <div className="flex items-center justify-between">
              <Label className="text-xs text-neutral-500">Light X</Label>
              <span className="font-mono text-[11px] text-neutral-400">
                {params.lightPosition[0].toFixed(2)}
              </span>
            </div>
            <Slider
              value={[params.lightPosition[0]]}
              min={0}
              max={1}
              step={0.01}
              onValueChange={(value) => {
                onChange("lightPosition", [
                  readSliderValue(value),
                  params.lightPosition[1],
                ]);
              }}
            />
          </div>
          <div className="space-y-2">
            <div className="flex items-center justify-between">
              <Label className="text-xs text-neutral-500">Light Y</Label>
              <span className="font-mono text-[11px] text-neutral-400">
                {params.lightPosition[1].toFixed(2)}
              </span>
            </div>
            <Slider
              value={[params.lightPosition[1]]}
              min={0}
              max={1}
              step={0.01}
              onValueChange={(value) => {
                onChange("lightPosition", [
                  params.lightPosition[0],
                  readSliderValue(value),
                ]);
              }}
            />
          </div>
        </div>

        <Separator />

        <div className="space-y-5">
          {SLIDERS.map((control) => {
            const value = params[control.key];
            if (typeof value !== "number") return null;
            return (
              <div key={control.key} className="space-y-2">
                <div className="flex items-center justify-between gap-3">
                  <Label className="text-xs text-neutral-500">
                    {control.label}
                  </Label>
                  <span className="font-mono text-[11px] text-neutral-400">
                    {formatValue(value, control.step)}
                  </span>
                </div>
                <Slider
                  value={[value]}
                  min={control.min}
                  max={control.max}
                  step={control.step}
                  onValueChange={(next) => {
                    onChange(
                      control.key,
                      readSliderValue(next) as SurfaceMaterialParams[typeof control.key],
                    );
                  }}
                />
              </div>
            );
          })}
        </div>
      </div>
    </aside>
  );
}
