/** Static CSS cluster when WebGL2 is missing. Same locked colors, no motion. */

export function LiquidMetalFallback({ className }: { className?: string }) {
  return (
    <div className={className ? `lmm-fallback ${className}` : "lmm-fallback"} aria-hidden>
      <span className="lmm-fallback__blob lmm-fallback__blob--a" />
      <span className="lmm-fallback__blob lmm-fallback__blob--b" />
      <span className="lmm-fallback__blob lmm-fallback__blob--c" />
      <span className="lmm-fallback__blob lmm-fallback__blob--d" />
      <span className="lmm-fallback__blob lmm-fallback__blob--e" />
    </div>
  );
}
