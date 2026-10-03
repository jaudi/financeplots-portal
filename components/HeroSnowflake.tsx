"use client";

import { useEffect, useState } from "react";
import { THEMES } from "@/lib/charts/layout";
import { layoutRadar, TILTED, type RadarSpec } from "@/lib/charts/radar";
import { sceneToSvg } from "@/lib/charts/svg";
import { METRICS } from "@/lib/stock-metrics";

// The homepage's hero picture: a snowflake turning slowly in 3D, laid out by the
// same code as the company pages' MCP chart. It is an ILLUSTRATION — invented
// positions, no company named — because the homepage must not feature a real
// share (UK MAR, CLAUDE.md). The caption says so.

const RATIOS = METRICS.filter((m) => m.group !== "Price & trend");
const SHAPE = [62, 70, 48, 66, 40, 78, 72, 81, 69, 35, 28, 74, 58, 64];

const SPEC: RadarSpec = {
  kind: "radar",
  title: "",
  spokes: RATIOS.map((m) => ({ label: m.short, group: m.group })),
  layers: [{ name: "Illustration", within: "index", positions: RATIOS.map((_, i) => SHAPE[i % SHAPE.length]), values: RATIOS.map(() => "") }],
};

function render(yaw: number) {
  const scene = layoutRadar(SPEC, { width: 560, height: 470, theme: THEMES.dark, view: { ...TILTED, yaw } });
  // Crop the empty band the (blank) chart title would have used.
  return sceneToSvg({ ...scene, texts: scene.texts.filter((t) => t.text) }, { background: false })
    .replace('height="470"', 'height="420"')
    .replace('viewBox="0 0 560 470"', 'viewBox="0 40 560 420"');
}

export default function HeroSnowflake({ caption }: { caption: string }) {
  const [svg, setSvg] = useState(() => render(TILTED.yaw));

  useEffect(() => {
    if (matchMedia("(prefers-reduced-motion: reduce)").matches) return;
    let yaw = TILTED.yaw;
    let raf = 0;
    let last = 0;
    const tick = (t: number) => {
      // ~30 fps is plenty for a slow turn, and half the work.
      if (t - last > 33) {
        yaw += 0.006;
        setSvg(render(yaw));
        last = t;
      }
      raf = requestAnimationFrame(tick);
    };
    raf = requestAnimationFrame(tick);
    return () => cancelAnimationFrame(raf);
  }, []);

  return (
    <figure className="relative">
      <div className="absolute inset-8 bg-blue-600/20 rounded-full blur-3xl pointer-events-none" />
      <div
        className="relative [&_svg]:w-full [&_svg]:h-auto"
        role="img"
        aria-label={caption}
        dangerouslySetInnerHTML={{ __html: svg }}
      />
      <figcaption className="relative text-center text-[11px] text-gray-500 -mt-2">{caption}</figcaption>
    </figure>
  );
}
