"use client";

import { useRouter } from "next/navigation";
import { useEffect, useRef, useState } from "react";
import TickerSearch from "@/components/TickerSearch";

// The centrepiece of a company page: every ratio on the page as one spoke of a
// snowflake, flat or tilted into 3D. The visitor can type one more company to
// draw on the same snowflake (?vs=): in 3D each is a layer, one above the other.
//
// Same rules as NeutralSnowflake (UK MAR, CLAUDE.md), which is why it can exist:
// - A point's distance from the centre is the share of the company's index with
//   a LOWER figure on that measure. Further out = higher, never better: a high
//   P/E or a high debt ratio sits far out too. No axis is inverted by the site.
// - No area, total, group score or rank is computed or shown.
// - Colours tell layers apart, nothing more: no green/red, and the first company
//   always gets the same slate blue whatever its figures.

export interface SnowflakeSpoke {
  label: string;
  group: string;
}

export interface SnowflakeLayer {
  ticker: string;
  indexLabel: string;
  /** One per spoke, same order; null where the company has no figure. */
  positions: (number | null)[];
  /** Hover text per spoke. */
  titles: string[];
  /** The figure per spoke, formatted with its unit ("—" where missing). */
  values: string[];
}

const LAYER_COLOURS = ["148 163 184", "251 146 60"]; // slate, orange: easy to tell apart, neither reads as good or bad
const MIN_DRAWN = 3; // a figure at the very bottom of the index stays visible
const SIZE = 440;
const R = 140; // radius of the 100% ring, in 3D units
const LAYER_GAP = 46; // height between stacked companies
const PEAK = 120; // one company: in 3D each point also rises with its position
const PITCH = 0.8; // default tilt of the 3D view, radians

type V3 = [number, number, number];

/** Closed Catmull-Rom curve through the points, as an SVG path: the organic
 *  outline Simply Wall St made familiar, without changing where any point sits. */
function smoothPath(pts: [number, number][]) {
  const n = pts.length;
  const p = (i: number) => pts[(i + n) % n];
  let d = `M${p(0)[0].toFixed(1)},${p(0)[1].toFixed(1)}`;
  for (let i = 0; i < n; i++) {
    const [p0, p1, p2, p3] = [p(i - 1), p(i), p(i + 1), p(i + 2)];
    const t = 0.16;
    const c1 = [p1[0] + (p2[0] - p0[0]) * t, p1[1] + (p2[1] - p0[1]) * t];
    const c2 = [p2[0] - (p3[0] - p1[0]) * t, p2[1] - (p3[1] - p1[1]) * t];
    d += ` C${c1[0].toFixed(1)},${c1[1].toFixed(1)} ${c2[0].toFixed(1)},${c2[1].toFixed(1)} ${p2[0].toFixed(1)},${p2[1].toFixed(1)}`;
  }
  return d + "Z";
}

/** Adds or removes the one company drawn alongside (?vs=). Typed by the
 *  visitor; nothing is suggested before two characters (see TickerSearch). */
function CompareControl({ ticker, vs, vsMissing }: { ticker: string; vs: string | null; vsMissing: boolean }) {
  const router = useRouter();
  const [value, setValue] = useState("");
  const go = (other: string | null) => {
    const t = other?.trim().toUpperCase();
    const path = window.location.pathname;
    router.push(t && t !== ticker ? `${path}?vs=${encodeURIComponent(t)}` : path, { scroll: false });
    setValue("");
  };

  if (vs) {
    return (
      <div className="flex flex-wrap items-center gap-2 text-sm">
        <span className="text-gray-400">Compared with</span>
        <span className="inline-flex items-center gap-1 bg-[#111827] border border-orange-400/40 rounded-lg pl-3 pr-1 py-1">
          <span className="font-mono text-orange-300">{vs}</span>
          <button type="button" onClick={() => go(null)} aria-label={`Stop comparing with ${vs}`} className="text-gray-500 hover:text-white px-1.5">×</button>
        </span>
        {vsMissing && <span className="text-xs text-gray-500">No figures for {vs}: only S&amp;P 500, Nasdaq-100, IBEX 35 and FTSE 100 companies have them.</span>}
      </div>
    );
  }
  return (
    <form
      className="flex flex-col sm:flex-row gap-2 w-full max-w-md"
      onSubmit={(e) => {
        e.preventDefault();
        go(value);
      }}
    >
      <TickerSearch
        id="compare-with"
        value={value}
        onChange={setValue}
        onPick={(symbol) => go(symbol)}
        onEnter={() => go(value)}
        placeholder={`Compare ${ticker} with… (name or ticker)`}
        ariaLabel={`Compare ${ticker} with another company`}
      />
      <button type="submit" disabled={!value.trim()} className="px-4 py-2 rounded-lg text-sm font-semibold bg-[#111827] border border-gray-700 text-gray-200 hover:text-white disabled:opacity-40 disabled:cursor-not-allowed">
        Compare
      </button>
    </form>
  );
}

export default function CompanySnowflake({
  spokes,
  layers,
  ticker,
  vs = null,
  vsMissing = false,
}: {
  spokes: SnowflakeSpoke[];
  layers: SnowflakeLayer[];
  ticker: string;
  /** The company drawn alongside, if the visitor chose one. */
  vs?: string | null;
  /** That company has no figures (outside the three indices). */
  vsMissing?: boolean;
}) {
  const [mode, setMode] = useState<"flat" | "3d">("3d");
  // Where the view is heading (set by dragging) and where it is now (eased).
  const goal = useRef({ yaw: -0.5, pitch: PITCH });
  const [anim, setAnim] = useState({ yaw: -0.5, pitch: PITCH });
  const drag = useRef<{ x: number; y: number; yaw: number; pitch: number } | null>(null);
  const autoTurn = useRef(true);
  const [hover, setHover] = useState<number | null>(null);
  // A point pressed or tapped stays selected, with its figure beside it, until
  // another point or empty space is pressed. Works on phones, where there is no hover.
  const [pinned, setPinned] = useState<{ layer: number; spoke: number } | null>(null);
  const moved = useRef(false);
  const shown = hover ?? pinned?.spoke ?? null;

  // Ease towards the goal; a slow turn in 3D until the visitor takes over.
  useEffect(() => {
    let raf = 0;
    const reduce = window.matchMedia?.("(prefers-reduced-motion: reduce)").matches;
    const tick = () => {
      if (mode === "3d" && autoTurn.current && !reduce) goal.current.yaw += 0.0025;
      const yaw = mode === "3d" ? goal.current.yaw : 0;
      const pitch = mode === "3d" ? goal.current.pitch : 0;
      setAnim((a) => {
        const next = { yaw: a.yaw + (yaw - a.yaw) * 0.15, pitch: a.pitch + (pitch - a.pitch) * 0.15 };
        return Math.abs(next.yaw - a.yaw) + Math.abs(next.pitch - a.pitch) < 1e-5 ? a : next;
      });
      raf = requestAnimationFrame(tick);
    };
    raf = requestAnimationFrame(tick);
    return () => cancelAnimationFrame(raf);
  }, [mode]);

  const n = spokes.length;
  if (n < 3 || layers.length === 0) return null;

  const angle = (i: number) => -Math.PI / 2 + (2 * Math.PI * i) / n;
  const base = -((layers.length - 1) * LAYER_GAP) / 2;
  const tilt = Math.min(1, anim.pitch / PITCH); // 0 flat … 1 fully 3D: heights grow as the view tilts
  const lift = (li: number) => (base + li * LAYER_GAP) * tilt;

  // Rotate around the vertical axis (yaw), then tilt towards the viewer (pitch),
  // then a gentle perspective.
  const project = ([x, y, z]: V3): [number, number] => {
    const cy = Math.cos(anim.yaw), sy = Math.sin(anim.yaw);
    const x1 = x * cy - y * sy;
    const y1 = x * sy + y * cy;
    const cp = Math.cos(anim.pitch), sp = Math.sin(anim.pitch);
    const y2 = y1 * cp - z * sp;
    const depth = y1 * sp + z * cp;
    const f = 900 / (900 - depth * 0.6);
    // Rounded so the server's and the browser's maths agree when hydrating.
    return [Math.round((SIZE / 2 + x1 * f) * 10) / 10, Math.round((SIZE / 2 + y2 * f) * 10) / 10];
  };
  const at = (i: number, position: number, z: number): V3 => {
    const d = (R * Math.max(MIN_DRAWN, Math.min(100, position))) / 100;
    return [d * Math.cos(angle(i)), d * Math.sin(angle(i)), z];
  };

  // Floor: rings and spokes at the lowest layer's height.
  const single = layers.length === 1;
  const floorZ = single ? (-PEAK / 2) * tilt : lift(0) - 30 * tilt;
  // Height of a point: a stacked layer in compare mode; for one company, rising
  // from the floor with its position, so the 3D shape is a crown of spikes.
  const elev = (li: number, p: number | null) =>
    single ? floorZ + ((Math.max(MIN_DRAWN, Math.min(100, p ?? 0)) / 100) * PEAK * tilt) : lift(li);
  const ring = (p: number) => spokes.map((_, i) => project(at(i, p, floorZ)));

  // Group arcs: which spokes belong together, drawn just outside the 100% ring.
  const groups: { name: string; from: number; to: number }[] = [];
  spokes.forEach((s, i) => {
    const g = groups[groups.length - 1];
    if (g && g.name === s.group) g.to = i;
    else groups.push({ name: s.group, from: i, to: i });
  });

  const onDown = (e: React.PointerEvent) => {
    moved.current = false;
    if (mode !== "3d") return;
    moved.current = false;
    drag.current = { x: e.clientX, y: e.clientY, ...goal.current };
  };
  const onMove = (e: React.PointerEvent) => {
    const d = drag.current;
    if (!d) return;
    if (!moved.current && Math.hypot(e.clientX - d.x, e.clientY - d.y) < 5) return; // a press, not a drag
    if (!moved.current) {
      try {
        e.currentTarget.setPointerCapture(e.pointerId); // keep turning if the pointer leaves the chart
      } catch {
        // the pointer is already gone
      }
    }
    moved.current = true;
    autoTurn.current = false;
    goal.current = { yaw: d.yaw - (e.clientX - d.x) * 0.008, pitch: Math.max(0.15, Math.min(1.3, d.pitch - (e.clientY - d.y) * 0.006)) };
  };
  const onUp = () => (drag.current = null);

  return (
    <div className="bg-[#0d1426] border border-gray-800 rounded-2xl p-5">
      <div className="flex flex-wrap items-start justify-between gap-3">
        <div>
          <h2 className="text-xl font-bold text-white">The shape of the figures</h2>
          <p className="text-sm text-gray-400 mt-1 max-w-xl leading-relaxed">
            Each spoke is one ratio. Further out means a <em>higher</em> figure than more of the index — not a better one.
            A high P/E or high debt sits far out too, so the size of the shape is not a score.
          </p>
        </div>
        <div className="flex rounded-lg border border-gray-700 overflow-hidden text-sm shrink-0" role="group" aria-label="View">
          {(["3d", "flat"] as const).map((m) => (
            <button
              key={m}
              type="button"
              onClick={() => setMode(m)}
              aria-pressed={mode === m}
              className={`px-3 py-1.5 font-semibold transition ${mode === m ? "bg-blue-600 text-white" : "bg-[#111827] text-gray-400 hover:text-white"}`}
            >
              {m === "3d" ? "3D" : "Flat"}
            </button>
          ))}
        </div>
      </div>

      <div className="mt-4">
        <CompareControl ticker={ticker} vs={vs} vsMissing={vsMissing} />
      </div>

      <div className="flex flex-col lg:flex-row gap-6 items-center justify-center mt-2">
        <svg
          viewBox={`0 ${Math.round(40 * tilt)} ${SIZE} ${Math.round(SIZE - 45 * tilt)}`}
          className={`w-full max-w-[540px] touch-pan-y select-none ${mode === "3d" ? "cursor-grab active:cursor-grabbing" : ""}`}
          role="img"
          aria-label={`Position within the index on each ratio${layers.length > 1 ? `, for ${layers.map((l) => l.ticker).join(", ")}` : ""}`}
          onPointerDown={onDown}
          onPointerMove={onMove}
          onPointerUp={onUp}
          onPointerCancel={onUp}
          onClick={() => !moved.current && setPinned(null)}
        >
          {/* floor grid */}
          {[25, 50, 75, 100].map((p) => (
            <polygon key={p} points={ring(p).map((q) => q.join(",")).join(" ")} fill={p === 100 ? "rgba(31,41,55,0.25)" : "none"} stroke="rgb(31 41 55)" strokeWidth={1} />
          ))}
          {spokes.map((_, i) => {
            const [x1, y1] = project([0, 0, floorZ]);
            const [x2, y2] = project(at(i, 100, floorZ));
            return <line key={i} x1={x1} y1={y1} x2={x2} y2={y2} stroke={shown === i ? "rgb(75 85 99)" : "rgb(31 41 55)"} strokeWidth={1} />;
          })}

          {/* group arcs */}
          {groups.map((g) => {
            const pts: [number, number][] = [];
            const a0 = angle(g.from) - Math.PI / n + 0.06, a1 = angle(g.to) + Math.PI / n - 0.06;
            for (let k = 0; k <= 16; k++) {
              const a = a0 + ((a1 - a0) * k) / 16;
              pts.push(project([(R + 38) * Math.cos(a), (R + 38) * Math.sin(a), floorZ]));
            }
            // Between two spokes, so the group name never sits on a spoke's label.
            const am = (a0 + a1) / 2 + ((g.to - g.from) % 2 === 0 ? Math.PI / n : 0);
            const mid = project([(R + 56) * Math.cos(am), (R + 56) * Math.sin(am), floorZ]);
            return (
              <g key={g.name}>
                <polyline points={pts.map((q) => q.join(",")).join(" ")} fill="none" stroke="rgb(59 130 246 / 0.45)" strokeWidth={2} strokeLinecap="round" />
                <text x={Math.max(6, Math.min(SIZE - 6, mid[0]))} y={mid[1] + 3} textAnchor={mid[0] < 90 ? "start" : mid[0] > SIZE - 90 ? "end" : "middle"} fontSize={10} fontWeight={700} letterSpacing={1} fill="rgb(96 165 250)">
                  {g.name.toUpperCase()}
                </text>
              </g>
            );
          })}

          {/* spoke labels */}
          {spokes.map((s, i) => {
            const [x, y] = project(at(i, 100, floorZ).map((v, k) => (k < 2 ? v * 1.13 : v)) as V3);
            return (
              <text key={s.label} x={x} y={y + 3} textAnchor="middle" fontSize={9} fill={shown === i ? "rgb(229 231 235)" : "rgb(107 114 128)"}>
                {s.label}
              </text>
            );
          })}

          {/* one shape per company, lowest layer first */}
          {layers.map((layer, li) => {
            const colour = LAYER_COLOURS[li % LAYER_COLOURS.length];
            const pts = layer.positions.map((p, i) => project(at(i, p ?? 0, elev(li, p))));
            // A missing figure is left out of the outline rather than drawn as a
            // zero, which would pull the shape into the centre.
            const known = layer.positions.flatMap((p, i) => (p === null ? [] : [i]));
            if (known.length < 3) return null;
            const shadow = single && tilt > 0.05 ? known.map((i) => project(at(i, layer.positions[i]!, floorZ))) : null;
            return (
              <g key={layer.ticker}>
                {shadow && <path d={smoothPath(shadow)} fill={`rgb(${colour} / 0.07)`} stroke={`rgb(${colour} / 0.3)`} strokeWidth={1} />}
                {/* drop lines to the floor give the 3D view its depth */}
                {anim.pitch > 0.05 &&
                  layer.positions.map((p, i) => {
                    if (p === null) return null;
                    const top = pts[i];
                    const foot = project(at(i, p, floorZ));
                    return <line key={i} x1={top[0]} y1={top[1]} x2={foot[0]} y2={foot[1]} stroke={`rgb(${colour} / 0.25)`} strokeWidth={1} strokeDasharray="2 3" />;
                  })}
                <path d={smoothPath(known.map((i) => pts[i]))} fill={`rgb(${colour} / ${layers.length > 1 ? 0.16 : 0.22})`} stroke={`rgb(${colour})`} strokeWidth={1.75} strokeLinejoin="round" />
                {layer.positions.map((p, i) => {
                  const [x, y] = pts[i];
                  const selected = pinned?.layer === li && pinned.spoke === i;
                  return (
                    <g key={i}>
                      <circle cx={x} cy={y} r={selected || hover === i ? 4.5 : 3} fill={p === null ? "#0d1426" : `rgb(${colour})`} stroke={selected ? "white" : `rgb(${colour})`} strokeWidth={selected ? 1.75 : 1.25} pointerEvents="none" />
                      {/* a larger invisible target, so a fingertip can hit the point */}
                      <circle
                        cx={x}
                        cy={y}
                        r={11}
                        fill="transparent"
                        className="cursor-pointer"
                        role="button"
                        aria-label={`${spokes[i].label}${layers.length > 1 ? `, ${layer.ticker}` : ""}: ${layer.titles[i]}`}
                        onPointerEnter={(e) => e.pointerType === "mouse" && setHover(i)}
                        onPointerLeave={() => setHover(null)}
                        onClick={(e) => {
                          e.stopPropagation();
                          if (moved.current) return;
                          autoTurn.current = false;
                          setPinned(selected ? null : { layer: li, spoke: i });
                        }}
                      />
                    </g>
                  );
                })}
              </g>
            );
          })}
          {pinned && layers[pinned.layer] && (() => {
            const l = layers[pinned.layer];
            const p = l.positions[pinned.spoke];
            const [x, y] = project(at(pinned.spoke, p ?? 0, elev(pinned.layer, p)));
            const line1 = `${layers.length > 1 ? `${l.ticker} · ` : ""}${spokes[pinned.spoke].label}: ${l.values[pinned.spoke]}`;
            const line2 = p === null ? "no figure reported" : `higher than ${Math.round(p)}% of the ${l.indexLabel}`;
            const w = Math.max(line1.length * 6.4, line2.length * 5.4) + 16;
            const bx = Math.max(4, Math.min(SIZE - w - 4, x - w / 2));
            const by = y - 50 < 4 ? y + 12 : y - 50;
            return (
              <g pointerEvents="none">
                <rect x={bx} y={by} width={w} height={38} rx={7} fill="#111827" stroke="rgb(75 85 99)" />
                <text x={bx + 8} y={by + 16} fontSize={11.5} fontWeight={700} fill="white">{line1}</text>
                <text x={bx + 8} y={by + 30} fontSize={9.5} fill="rgb(156 163 175)">{line2}</text>
              </g>
            );
          })()}
        </svg>

        <div className="w-full lg:w-72 lg:shrink-0 min-w-0">
          {layers.length > 1 && (
            <ul className="flex flex-wrap gap-x-4 gap-y-1 mb-3 text-sm">
              {layers.map((l, li) => (
                <li key={l.ticker} className="flex items-center gap-1.5">
                  <span className="inline-block h-2.5 w-2.5 rounded-full" style={{ background: `rgb(${LAYER_COLOURS[li % LAYER_COLOURS.length]})` }} />
                  <span className="font-mono text-gray-200">{l.ticker}</span>
                  <span className="text-gray-500 text-xs">vs the {l.indexLabel}</span>
                </li>
              ))}
            </ul>
          )}
          <div className="rounded-xl border border-gray-800 bg-[#0a0f1e] px-4 py-3 min-h-[5.5rem]">
            {shown === null ? (
              <p className="text-sm text-gray-500 leading-relaxed">
                {mode === "3d" ? "Drag to turn the shape. " : ""}Tap or point at a dot to read the figure behind it.
                {layers.length > 1 && " In 3D each company is its own layer; each is measured within its own index."}
              </p>
            ) : (
              <>
                <p className="text-xs font-bold uppercase tracking-wider text-blue-400">{spokes[shown].group}</p>
                <p className="text-white font-semibold">{spokes[shown].label}</p>
                {layers.map((l, li) => (
                  <p key={l.ticker} className="text-sm text-gray-300 mt-0.5">
                    {layers.length > 1 && <span className="font-mono mr-1.5" style={{ color: `rgb(${LAYER_COLOURS[li % LAYER_COLOURS.length]})` }}>{l.ticker}</span>}
                    {l.titles[shown]}
                  </p>
                ))}
              </>
            )}
          </div>
          <p className="text-xs text-gray-500 mt-3 leading-relaxed">
            The figures and what each one means are below. A hollow dot means the company doesn&apos;t report that figure.
          </p>
        </div>
      </div>
    </div>
  );
}
