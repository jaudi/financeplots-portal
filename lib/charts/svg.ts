import type { Scene } from "@/lib/charts/layout";

// Serialises a Scene to SVG markup. The MCP App view draws it with text; the
// PNG renderer draws it without, because the rasteriser behind next/og has no
// fonts for SVG text, and lays the text over it with Satori instead.

const esc = (s: string) => s.replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;").replace(/"/g, "&quot;");

export const FONT_STACK = "Inter, system-ui, -apple-system, 'Segoe UI', Roboto, sans-serif";

export function sceneToSvg(scene: Scene, { text = true, background = true } = {}): string {
  const out: string[] = [];
  out.push(`<svg xmlns="http://www.w3.org/2000/svg" width="${scene.width}" height="${scene.height}" viewBox="0 0 ${scene.width} ${scene.height}" role="img">`);
  if (background) out.push(`<rect width="${scene.width}" height="${scene.height}" fill="${scene.theme.bg}"/>`);
  for (const s of scene.shapes) {
    if (s.t === "path") {
      const attrs = [`d="${s.d}"`, `fill="${s.fill ?? "none"}"`];
      if (s.stroke) attrs.push(`stroke="${s.stroke}"`, `stroke-width="${s.width ?? 1}"`, `stroke-linejoin="round"`, `stroke-linecap="round"`);
      if (s.opacity !== undefined) attrs.push(`${s.stroke && !s.fill ? "stroke-opacity" : "fill-opacity"}="${s.opacity}"`);
      out.push(`<path ${attrs.join(" ")}/>`);
    } else if (s.t === "line") {
      out.push(
        `<line x1="${s.x1}" y1="${s.y1}" x2="${s.x2}" y2="${s.y2}" stroke="${s.stroke}" stroke-width="${s.width}"${s.opacity !== undefined ? ` stroke-opacity="${s.opacity}"` : ""} stroke-linecap="round"/>`,
      );
    } else {
      out.push(`<circle cx="${s.cx}" cy="${s.cy}" r="${s.r}" fill="${s.fill}"${s.stroke ? ` stroke="${s.stroke}" stroke-width="${s.width ?? 2}"` : ""}/>`);
    }
  }
  if (text) {
    for (const t of scene.texts) {
      out.push(
        `<text x="${t.x}" y="${t.y}" font-size="${t.size}" fill="${t.color}" text-anchor="${t.anchor}" dominant-baseline="central" font-family="${esc(FONT_STACK)}"${t.weight === 600 ? ' font-weight="600"' : ""}>${esc(t.text)}</text>`,
      );
    }
  }
  out.push("</svg>");
  return out.join("");
}
