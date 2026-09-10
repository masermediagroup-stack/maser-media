"use client";

import { useEffect, useState } from "react";
import { LOGO_SRC } from "@/components/cta-logo-gradient/constants";
import { AsciiShader, ASCII_SHADER_DEFAULTS } from "./ascii-shader";
import { parseSvgMarkup } from "./fill-svg";
import "./cta-ascii-shader.css";

const MASER_BLUE = "16,164,255";

function maserColor(): string {
  return MASER_BLUE;
}

/**
 * Homepage CTA test cut: full Evil Rabbit AsciiShader
 * filling the production Blue-HD mark (not the Vercel triangle).
 */
export function CtaAsciiShaderTest() {
  const [svg, setSvg] = useState<{
    pathData: string;
    width: number;
    height: number;
  } | null>(null);
  const [reduced, setReduced] = useState(false);

  useEffect(() => {
    const mq = window.matchMedia("(prefers-reduced-motion: reduce)");
    const sync = () => setReduced(mq.matches);
    sync();
    mq.addEventListener("change", sync);
    return () => mq.removeEventListener("change", sync);
  }, []);

  useEffect(() => {
    let cancelled = false;
    void fetch(LOGO_SRC)
      .then((res) => {
        if (!res.ok) throw new Error("Blue-HD missing");
        return res.text();
      })
      .then((text) => {
        if (cancelled) return;
        setSvg(parseSvgMarkup(text));
      })
      .catch(() => {
        if (!cancelled) setSvg(null);
      });
    return () => {
      cancelled = true;
    };
  }, []);

  return (
    <div className="cta-er-test">
      <p className="cta-er-test__label">Evil Rabbit test cut</p>
      <div className="cta-er-test__stage">
        <div className="cta-er-test__canvas">
          {svg ? (
            <AsciiShader
              svgPath={svg.pathData}
              svgWidth={svg.width}
              svgHeight={svg.height}
              config={ASCII_SHADER_DEFAULTS}
              theme="light"
              colorFn={maserColor}
              reducedMotion={reduced}
            />
          ) : (
            <div className="cta-er-test__pending" aria-hidden="true" />
          )}
        </div>
      </div>
    </div>
  );
}
