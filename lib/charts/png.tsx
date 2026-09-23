import { ImageResponse } from "next/og";
import { layoutChart, textWidth, THEMES } from "@/lib/charts/layout";
import type { ChartSpec } from "@/lib/charts/spec";
import { sceneToSvg } from "@/lib/charts/svg";

// Rasterises a chart for clients without MCP Apps. The shapes go in as one SVG
// image; the text is laid over it as Satori divs at the positions the layout
// gave, since SVG text would render without a font.

export const PNG_SIZE = { width: 800, height: 450 } as const;

export async function chartPng(spec: ChartSpec): Promise<string> {
  const scene = layoutChart(spec, { ...PNG_SIZE, theme: THEMES.dark });
  const svg = sceneToSvg(scene, { text: false });
  const res = new ImageResponse(
    (
      <div style={{ display: "flex", position: "relative", width: scene.width, height: scene.height, background: scene.theme.bg }}>
        {/* eslint-disable-next-line @next/next/no-img-element, jsx-a11y/alt-text */}
        <img width={scene.width} height={scene.height} src={`data:image/svg+xml;base64,${Buffer.from(svg).toString("base64")}`} style={{ position: "absolute", left: 0, top: 0 }} />
        {scene.texts.map((t, i) => {
          // Satori positions boxes, not baselines: centre a box on (x, y).
          const w = textWidth(t.text, t.size) + 8;
          const left = t.anchor === "start" ? t.x : t.anchor === "middle" ? t.x - w / 2 : t.x - w;
          return (
            <div
              key={i}
              style={{
                position: "absolute",
                left,
                top: t.y - t.size * 0.7,
                width: w,
                height: t.size * 1.4,
                display: "flex",
                alignItems: "center",
                justifyContent: t.anchor === "start" ? "flex-start" : t.anchor === "middle" ? "center" : "flex-end",
                fontSize: t.size,
                fontWeight: t.weight ?? 400,
                color: t.color,
                whiteSpace: "nowrap",
              }}
            >
              {t.text}
            </div>
          );
        })}
      </div>
    ),
    PNG_SIZE,
  );
  return Buffer.from(await res.arrayBuffer()).toString("base64");
}
