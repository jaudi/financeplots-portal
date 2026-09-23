import { ImageResponse } from "next/og";
import type { CompoundRow } from "@/lib/calculators";

// PNG charts for the MCP server, drawn with next/og (Satori): plain flexbox
// divs, no chart library. Every tool that returns a chart returns the numbers
// too, so the image is a convenience, never the only copy of a figure.

const W = 800;
const H = 450;
const C = {
  bg: "#0a0f1e",
  grid: "#1e293b",
  text: "#e2e8f0",
  muted: "#94a3b8",
  contributed: "#3b82f6",
  interest: "#22c55e",
};

function compact(n: number) {
  const a = Math.abs(n);
  if (a >= 1e9) return `${(n / 1e9).toFixed(1)}bn`;
  if (a >= 1e6) return `${(n / 1e6).toFixed(1)}m`;
  if (a >= 1e3) return `${(n / 1e3).toFixed(0)}k`;
  return n.toFixed(0);
}

/** Round step for about four gridlines. */
function niceStep(max: number) {
  const raw = max / 4;
  const mag = 10 ** Math.floor(Math.log10(raw || 1));
  return [1, 2, 2.5, 5, 10].map((m) => m * mag).find((s) => s >= raw) ?? raw;
}

async function png(node: React.ReactElement) {
  const res = new ImageResponse(node, { width: W, height: H });
  return Buffer.from(await res.arrayBuffer()).toString("base64");
}

/** Stacked bars per year: what was paid in, and the growth on top of it. */
export async function compoundInterestChart(rows: CompoundRow[], title: string) {
  const plotW = W - 120;
  const plotH = H - 150;
  const max = Math.max(...rows.map((r) => r.portfolioValue), 1);
  const step = niceStep(max);
  const top = Math.ceil(max / step) * step;
  const ticks = Array.from({ length: Math.round(top / step) + 1 }, (_, i) => i * step).reverse();
  const gap = rows.length > 40 ? 1 : rows.length > 15 ? 3 : 6;
  const barW = Math.max(2, (plotW - gap * rows.length) / rows.length);
  const labelEvery = Math.ceil(rows.length / 10);

  return png(
    <div style={{ width: W, height: H, display: "flex", flexDirection: "column", background: C.bg, padding: "24px 32px", fontSize: 14, color: C.text }}>
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
        <div style={{ display: "flex", fontSize: 20, fontWeight: 700 }}>{title}</div>
        <div style={{ display: "flex", gap: 18, color: C.muted }}>
          <div style={{ display: "flex", alignItems: "center", gap: 6 }}>
            <div style={{ width: 12, height: 12, background: C.contributed, borderRadius: 2 }} />
            Contributed
          </div>
          <div style={{ display: "flex", alignItems: "center", gap: 6 }}>
            <div style={{ width: 12, height: 12, background: C.interest, borderRadius: 2 }} />
            Growth
          </div>
        </div>
      </div>

      <div style={{ display: "flex", marginTop: 24, height: plotH }}>
        {/* y axis */}
        <div style={{ display: "flex", flexDirection: "column", justifyContent: "space-between", width: 56, height: plotH, color: C.muted, fontSize: 12 }}>
          {ticks.map((t) => (
            <div key={t} style={{ display: "flex", height: 0, alignItems: "center", justifyContent: "flex-end", paddingRight: 8 }}>
              {compact(t)}
            </div>
          ))}
        </div>
        {/* plot */}
        <div style={{ display: "flex", position: "relative", width: plotW, height: plotH }}>
          {ticks.map((t) => (
            <div key={t} style={{ position: "absolute", left: 0, right: 0, top: plotH - (t / top) * plotH, height: 1, background: C.grid }} />
          ))}
          {/* absolute too, so it paints over the gridlines */}
          <div style={{ display: "flex", position: "absolute", left: 0, bottom: 0, alignItems: "flex-end", gap, width: plotW, height: plotH }}>
            {rows.map((r) => {
              // One block with a hard colour stop: two stacked divs leave a
              // hairline seam where Satori rounds their heights.
              const split = r.portfolioValue > 0 ? (Math.min(r.totalContributed, r.portfolioValue) / r.portfolioValue) * 100 : 100;
              return (
                <div
                  key={r.year}
                  style={{
                    width: barW,
                    height: (r.portfolioValue / top) * plotH,
                    borderRadius: "2px 2px 0 0",
                    backgroundImage: `linear-gradient(to top, ${C.contributed} ${split}%, ${C.interest} ${split}%)`,
                  }}
                />
              );
            })}
          </div>
        </div>
      </div>

      {/* x axis */}
      <div style={{ display: "flex", marginLeft: 56, marginTop: 8, gap, color: C.muted, fontSize: 12 }}>
        {rows.map((r, i) => (
          <div key={r.year} style={{ display: "flex", width: barW, justifyContent: "center", overflow: "visible" }}>
            {(i + 1) % labelEvery === 0 || i === 0 ? String(r.year) : ""}
          </div>
        ))}
      </div>
      <div style={{ display: "flex", justifyContent: "space-between", marginTop: 10, color: C.muted, fontSize: 12 }}>
        <div style={{ display: "flex" }}>Year</div>
        <div style={{ display: "flex" }}>financeplots.com · assumed return, not a forecast</div>
      </div>
    </div>,
  );
}
