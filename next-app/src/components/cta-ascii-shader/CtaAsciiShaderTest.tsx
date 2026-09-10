"use client";

import { useEffect, useState } from "react";
import { AsciiShader, ASCII_SHADER_DEFAULTS } from "./ascii-shader";
import { parseSvgMarkup, type ParsedSvg } from "./fill-svg";
import "./cta-ascii-shader.css";

export const ASCII_LOGO_SRC = "/assets/cta-ascii-shader/maser-media-mark.svg";

/** Brand fill #0097f5 */
const MASER_BLUE = "0,151,245";

function maserColor(): string {
  return MASER_BLUE;
}

/**
 * Homepage CTA test cut: full Evil Rabbit AsciiShader
 * filling the HQ-aspect Maser Media mark (not the Vercel triangle).
 */
export function CtaAsciiShaderTest() {
  const [svg, setSvg] = useState<ParsedSvg | null>(null);
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
    void fetch(ASCII_LOGO_SRC)
      .then((res) => {
        if (!res.ok) throw new Error("Maser mark SVG missing");
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
      <div
        className="cta-er-test__stage"
        style={
          svg
            ? { aspectRatio: `${svg.width} / ${svg.height}` }
            : undefined
        }
      >
        <div className="cta-er-test__canvas">
          {svg ? (
            <AsciiShader
              svgMarkup={svg.markup}
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
