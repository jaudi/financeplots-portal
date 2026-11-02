"use client";

import Link from "next/link";
import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { useLocale, useTranslations } from "next-intl";
import { geoNaturalEarth1, geoPath } from "d3-geo";
import { feature } from "topojson-client";
import type { GeometryCollection, Topology } from "topojson-specification";
import world from "world-atlas/countries-110m.json";
import PositionBar from "@/components/PositionBar";
import type { CompanyMapData, MapCard, MapCompany } from "@/lib/company-map";
import type { UniverseScreen } from "@/lib/universe";

// Every company in the chosen index, as one dot at its headquarters. The dots
// are all the same size and colour (UK MAR, CLAUDE.md): nothing about a dot —
// no price, return or score — can make one company stand out. Where dots
// overlap they merge into a bubble with a count; clicking it zooms in, or,
// where the companies share a city, lists them. A dot opens a card with the
// company page's ratios and positions.

// Same as INDEX_LABELS in lib/company.ts, which can't be imported here: it
// pulls the universe snapshots into the browser bundle.
const INDEX_LABELS: Record<UniverseScreen, string> = {
  sp500: "S&P 500",
  nasdaq100: "Nasdaq-100",
  ftse100: "FTSE 100",
  ibex35: "IBEX 35",
};
const SCREENS = Object.keys(INDEX_LABELS) as UniverseScreen[];

const CLUSTER_PX = 30; // dots closer than this on screen merge into a bubble (two full bubbles just touch)
const MAX_ZOOM = 60;
const DOT = "#60a5fa";

const topo = world as unknown as Topology<{ countries: GeometryCollection }>;
const COUNTRIES = feature(topo, topo.objects.countries).features.filter((f) => f.id !== "010"); // no Antarctica
// The inhabited world, so the map isn't half ocean and ice on a phone.
const FRAME = { type: "MultiPoint" as const, coordinates: [[-170, -48], [180, -48], [-170, 78], [180, 78], [0, 78], [0, -48]] };

type View = { k: number; x: number; y: number };

const projectionFor = (w: number, h: number) => geoNaturalEarth1().fitExtent([[6, 6], [w - 6, h - 6]], FRAME);
const heightFor = (w: number) => Math.round(Math.min(560, Math.max(220, w * 0.56)));
/** Keep the map covering its frame: no zooming out past the world, no panning it away. */
function clampView(v: View, w: number, h: number): View {
  const k = Math.min(MAX_ZOOM, Math.max(1, v.k));
  return { k, x: Math.min(0, Math.max(w - w * k, v.x)), y: Math.min(0, Math.max(h - h * k, v.y)) };
}
type Cluster = { key: string; members: MapCompany[]; x: number; y: number };
type Selected =
  | { kind: "company"; ticker: string; back?: Extract<Selected, { kind: "group" }> }
  | { kind: "group"; title: string; tickers: string[] };

const byName = (a: MapCompany, b: MapCompany) => a.name.localeCompare(b.name);
/** A bubble's radius grows with how many companies it holds — a count, not a figure about any of them. */
const bubble = (n: number) => Math.min(CLUSTER_PX / 2, 6 + 1.8 * Math.sqrt(n));

export default function CompanyMap({ data }: { data: CompanyMapData }) {
  const t = useTranslations("companyMap");
  const [index, setIndex] = useState<UniverseScreen | "all">("all");
  const [sector, setSector] = useState("all");
  const [size, setSize] = useState({ w: 960, h: 480 });
  const [view, setViewState] = useState<View>({ k: 1, x: 0, y: 0 });
  const [selected, setSelected] = useState<Selected | null>(null);

  const wrapRef = useRef<HTMLDivElement>(null);
  const svgRef = useRef<SVGSVGElement>(null);
  // Handlers read the view between renders (drag, pinch, animation), so every
  // change goes through setView, which keeps the ref in step.
  const viewRef = useRef(view);
  const setView = useCallback((v: View) => {
    viewRef.current = v;
    setViewState(v);
  }, []);

  // ── Size and projection ──────────────────────────────────────────────────
  useEffect(() => {
    const el = wrapRef.current;
    if (!el) return;
    let last = 0;
    // Only a change of width redraws (and resets the zoom): the height follows from it.
    const measure = () => {
      const w = Math.round(el.clientWidth);
      if (w === last || w === 0) return;
      const first = last === 0;
      last = w;
      const h = heightFor(w);
      setSize({ w, h });
      setView({ k: 1, x: 0, y: 0 });
      // ?focus=AAPL (the link on each company page): open on that company,
      // centred, with its card. Only the visitor's own click brings it here.
      const focus = first ? new URLSearchParams(window.location.search).get("focus") : null;
      const c = focus ? data.companies.find((x) => x.ticker === focus.toUpperCase()) : undefined;
      const p = c && projectionFor(w, h)([c.lon, c.lat]);
      if (c && p) {
        const k = 8;
        setView(clampView({ k, x: w / 2 - p[0] * k, y: h / 2 - p[1] * k }, w, h));
        setSelected({ kind: "company", ticker: c.ticker });
      }
    };
    measure();
    const ro = new ResizeObserver(measure);
    ro.observe(el);
    return () => ro.disconnect();
  }, [setView, data.companies]);

  const { w, h } = size;
  const projection = useMemo(() => projectionFor(w, h), [w, h]);
  const countryPaths = useMemo(() => {
    const path = geoPath(projection);
    // A few countries in the atlas have no id (Kosovo, Northern Cyprus).
    return COUNTRIES.map((f, i) => ({ id: `${f.id ?? "x"}-${i}`, d: path(f) ?? "" }));
  }, [projection]);
  const base = useMemo(() => {
    const m = new Map<string, [number, number]>();
    for (const c of data.companies) {
      const p = projection([c.lon, c.lat]);
      if (p) m.set(c.ticker, p);
    }
    return m;
  }, [data.companies, projection]);

  // ── Filters ──────────────────────────────────────────────────────────────
  const sectors = useMemo(() => [...new Set(data.companies.map((c) => c.sector))].sort(), [data.companies]);
  const matches = useCallback(
    (c: Pick<MapCompany, "indices" | "sector">) => (index === "all" || c.indices.includes(index)) && (sector === "all" || c.sector === sector),
    [index, sector],
  );
  const shown = useMemo(() => data.companies.filter(matches), [data.companies, matches]);
  const missing = useMemo(() => data.missing.filter(matches), [data.missing, matches]);
  const byTicker = useMemo(() => new Map(data.companies.map((c) => [c.ticker, c])), [data.companies]);

  // ── View: zoom and pan ───────────────────────────────────────────────────
  const clamp = useCallback((v: View) => clampView(v, w, h), [w, h]);
  const zoomAt = useCallback(
    (factor: number, cx: number, cy: number) => {
      const v = viewRef.current;
      const k = Math.min(MAX_ZOOM, Math.max(1, v.k * factor));
      setView(clamp({ k, x: cx - (cx - v.x) * (k / v.k), y: cy - (cy - v.y) * (k / v.k) }));
    },
    [clamp, setView],
  );

  const anim = useRef(0);
  const animateTo = useCallback(
    (target: View) => {
      cancelAnimationFrame(anim.current);
      const from = viewRef.current;
      const to = clamp(target);
      const start = performance.now();
      const step = (now: number) => {
        const p = Math.min(1, (now - start) / 350);
        const e = 1 - (1 - p) ** 3;
        setView({ k: from.k * (to.k / from.k) ** e, x: from.x + (to.x - from.x) * e, y: from.y + (to.y - from.y) * e });
        if (p < 1) anim.current = requestAnimationFrame(step);
      };
      anim.current = requestAnimationFrame(step);
    },
    [clamp, setView],
  );
  /** Centre the map on a base-coordinate point at zoom k. */
  const centreOn = useCallback((px: number, py: number, k: number) => animateTo({ k, x: w / 2 - px * k, y: h / 2 - py * k }), [animateTo, w, h]);
  const goTo = (lon: number, lat: number, k: number) => {
    const p = projection([lon, lat]);
    if (p) centreOn(p[0], p[1], k);
  };

  /** Pointer position in the SVG's own units (it may be drawn scaled). */
  const toSvg = useCallback(
    (clientX: number, clientY: number) => {
      const r = svgRef.current!.getBoundingClientRect();
      return [((clientX - r.left) * w) / r.width, ((clientY - r.top) * h) / r.height] as const;
    },
    [w, h],
  );

  useEffect(() => {
    const svg = svgRef.current;
    if (!svg) return;
    const onWheel = (e: WheelEvent) => {
      e.preventDefault();
      cancelAnimationFrame(anim.current);
      const [x, y] = toSvg(e.clientX, e.clientY);
      zoomAt(Math.exp(-e.deltaY * 0.0015), x, y);
    };
    svg.addEventListener("wheel", onWheel, { passive: false });
    return () => svg.removeEventListener("wheel", onWheel);
  }, [toSvg, zoomAt]);

  // Drag to pan, two fingers to pinch. A drag of more than a few pixels is not a click.
  const pointers = useRef(new Map<number, { x: number; y: number }>());
  const dragged = useRef(false);
  const downAt = useRef({ x: 0, y: 0 });
  const onPointerDown = (e: React.PointerEvent) => {
    cancelAnimationFrame(anim.current);
    const [x, y] = toSvg(e.clientX, e.clientY);
    pointers.current.set(e.pointerId, { x, y });
    if (pointers.current.size === 1) {
      dragged.current = false;
      downAt.current = { x, y };
    }
  };
  const onPointerMove = (e: React.PointerEvent) => {
    const prev = pointers.current.get(e.pointerId);
    if (!prev) return;
    const [x, y] = toSvg(e.clientX, e.clientY);
    if (pointers.current.size === 1) {
      if (!dragged.current && Math.hypot(x - downAt.current.x, y - downAt.current.y) < 5) return;
      if (!dragged.current) svgRef.current?.setPointerCapture(e.pointerId);
      dragged.current = true;
      const v = viewRef.current;
      setView(clamp({ k: v.k, x: v.x + x - prev.x, y: v.y + y - prev.y }));
    } else if (pointers.current.size === 2) {
      dragged.current = true;
      const [other] = [...pointers.current.entries()].filter(([id]) => id !== e.pointerId).map(([, p]) => p);
      const before = Math.hypot(prev.x - other.x, prev.y - other.y);
      const after = Math.hypot(x - other.x, y - other.y);
      if (before > 0) zoomAt(after / before, (x + other.x) / 2, (y + other.y) / 2);
    }
    pointers.current.set(e.pointerId, { x, y });
  };
  const onPointerUp = (e: React.PointerEvent) => {
    pointers.current.delete(e.pointerId);
  };

  // ── Clusters ─────────────────────────────────────────────────────────────
  const clusters = useMemo(() => {
    const pts = shown.flatMap((c) => {
      const b = base.get(c.ticker);
      return b ? [{ c, bx: b[0], by: b[1], x: b[0] * view.k + view.x, y: b[1] * view.k + view.y }] : [];
    });
    const cells = new Map<string, number[]>();
    const cellOf = (x: number, y: number) => `${Math.floor(x / CLUSTER_PX)},${Math.floor(y / CLUSTER_PX)}`;
    pts.forEach((p, i) => {
      const key = cellOf(p.x, p.y);
      cells.set(key, [...(cells.get(key) ?? []), i]);
    });
    const used = new Uint8Array(pts.length);
    const out: (Cluster & { spread: number })[] = [];
    pts.forEach((p, i) => {
      if (used[i]) return;
      used[i] = 1;
      const members = [i];
      const gx = Math.floor(p.x / CLUSTER_PX);
      const gy = Math.floor(p.y / CLUSTER_PX);
      for (let dx = -1; dx <= 1; dx++)
        for (let dy = -1; dy <= 1; dy++)
          for (const j of cells.get(`${gx + dx},${gy + dy}`) ?? [])
            if (!used[j] && Math.hypot(pts[j].x - p.x, pts[j].y - p.y) <= CLUSTER_PX) {
              used[j] = 1;
              members.push(j);
            }
      const ms = members.map((m) => pts[m]);
      const xs = ms.map((m) => m.bx);
      const ys = ms.map((m) => m.by);
      out.push({
        key: ms.map((m) => m.c.ticker).join(","),
        members: ms.map((m) => m.c),
        x: ms.reduce((s, m) => s + m.x, 0) / ms.length,
        y: ms.reduce((s, m) => s + m.y, 0) / ms.length,
        spread: Math.max(Math.max(...xs) - Math.min(...xs), Math.max(...ys) - Math.min(...ys)),
      });
    });
    return out;
  }, [shown, base, view]);

  const openGroup = useCallback(
    (members: MapCompany[]) => {
      const cities = new Map<string, number>();
      for (const m of members) cities.set(m.city, (cities.get(m.city) ?? 0) + 1);
      const city = [...cities.entries()].sort((a, b) => b[1] - a[1] || a[0].localeCompare(b[0]))[0][0];
      setSelected({
        kind: "group",
        title: cities.size === 1 ? t("inCity", { count: members.length, city }) : t("nearCity", { count: members.length, city }),
        tickers: [...members].sort(byName).map((m) => m.ticker),
      });
    },
    [t],
  );

  const onCluster = (cl: Cluster & { spread: number }) => {
    if (dragged.current) return;
    if (cl.members.length === 1) {
      setSelected({ kind: "company", ticker: cl.members[0].ticker });
      return;
    }
    // Zoom in while that can still pull the dots apart; after that, list them.
    const k = view.k;
    if (cl.spread * MAX_ZOOM < CLUSTER_PX || k >= MAX_ZOOM) {
      openGroup(cl.members);
      return;
    }
    const target = Math.min(MAX_ZOOM, Math.max(k * 2.5, (CLUSTER_PX * 4) / Math.max(cl.spread, 1e-6)));
    centreOn((cl.x - view.x) / k, (cl.y - view.y) / k, target);
  };

  const showCity = (members: MapCompany[]) => {
    const b = base.get(members[0].ticker);
    if (b) centreOn(b[0], b[1], Math.max(viewRef.current.k, 12));
    if (members.length === 1) setSelected({ kind: "company", ticker: members[0].ticker });
    else openGroup(members);
    wrapRef.current?.scrollIntoView({ behavior: "smooth", block: "center" });
  };

  useEffect(() => {
    const onKey = (e: KeyboardEvent) => e.key === "Escape" && setSelected(null);
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, []);

  const selectedTicker = selected?.kind === "company" ? selected.ticker : null;
  const selectedPoint = selectedTicker ? base.get(selectedTicker) : undefined;

  // ── The list, by country and city ────────────────────────────────────────
  const listing = useMemo(() => {
    const countries = new Map<string, Map<string, MapCompany[]>>();
    for (const c of shown) {
      const cities = countries.get(c.country) ?? new Map<string, MapCompany[]>();
      cities.set(c.city, [...(cities.get(c.city) ?? []), c]);
      countries.set(c.country, cities);
    }
    return [...countries.entries()]
      .sort((a, b) => a[0].localeCompare(b[0]))
      .map(([country, cities]) => ({
        country,
        count: [...cities.values()].reduce((s, cs) => s + cs.length, 0),
        cities: [...cities.entries()].sort((a, b) => a[0].localeCompare(b[0])).map(([city, cs]) => ({ city, companies: [...cs].sort(byName) })),
      }));
  }, [shown]);

  const ctl = "min-w-8 h-8 px-2.5 rounded-lg bg-[#111827] border border-gray-700 text-gray-300 text-xs hover:border-blue-500 hover:text-white";
  const pill = (active: boolean) =>
    `px-3 py-1.5 rounded-full text-xs font-semibold border transition ${
      active ? "bg-blue-500/15 border-blue-500 text-blue-300" : "border-gray-700 text-gray-400 hover:border-gray-500 hover:text-gray-200"
    }`;

  return (
    <div>
      {/* Filters */}
      <div className="flex flex-wrap items-center gap-2 mb-3">
        <span className="text-xs text-gray-500 mr-1">{t("indexLabel")}</span>
        <button className={pill(index === "all")} onClick={() => setIndex("all")}>{t("allIndices")}</button>
        {SCREENS.map((s) => (
          <button key={s} className={pill(index === s)} onClick={() => setIndex(s)}>{INDEX_LABELS[s]}</button>
        ))}
      </div>
      <div className="flex flex-wrap items-center gap-3 mb-4">
        <label className="text-xs text-gray-500" htmlFor="map-sector">{t("sectorLabel")}</label>
        <select
          id="map-sector"
          value={sector}
          onChange={(e) => setSector(e.target.value)}
          className="bg-[#111827] border border-gray-700 rounded-lg px-3 py-1.5 text-sm text-gray-200 max-w-[16rem]"
        >
          <option value="all">{t("allSectors")}</option>
          {sectors.map((s) => <option key={s} value={s}>{s}</option>)}
        </select>
        <p className="text-xs text-gray-400" aria-live="polite">
          {t("shown", { placed: shown.length, total: shown.length + missing.length })}
        </p>
      </div>

      {/* Map */}
      <div ref={wrapRef} className="relative bg-[#0d1426] border border-gray-800 rounded-2xl overflow-hidden">
        <div className="flex flex-wrap items-center gap-1.5 px-2 py-2 border-b border-gray-800">
          <button aria-label={t("zoomIn")} onClick={() => zoomAt(2, w / 2, h / 2)} className={ctl}>+</button>
          <button aria-label={t("zoomOut")} onClick={() => zoomAt(0.5, w / 2, h / 2)} className={ctl}>−</button>
          <span className="w-px h-5 bg-gray-800 mx-1" />
          <button onClick={() => animateTo({ k: 1, x: 0, y: 0 })} className={ctl}>{t("world")}</button>
          <button onClick={() => goTo(-96, 38, 3.4)} className={ctl}>{t("northAmerica")}</button>
          <button onClick={() => goTo(-2, 46.5, 5.5)} className={ctl}>{t("europe")}</button>
        </div>
        <svg
          ref={svgRef}
          viewBox={`0 0 ${w} ${h}`}
          className="block w-full h-auto select-none cursor-grab active:cursor-grabbing"
          style={{ touchAction: "pan-y" }}
          role="img"
          aria-label={t("mapLabel", { count: shown.length })}
          onPointerDown={onPointerDown}
          onPointerMove={onPointerMove}
          onPointerUp={onPointerUp}
          onPointerCancel={onPointerUp}
        >
          <g transform={`translate(${view.x} ${view.y}) scale(${view.k})`}>
            {countryPaths.map((c) => (
              <path key={c.id} d={c.d} fill="#1a2338" stroke="#2c3a57" strokeWidth={0.6} vectorEffect="non-scaling-stroke" />
            ))}
          </g>
          {clusters.map((cl) => {
            if (cl.x < -30 || cl.y < -30 || cl.x > w + 30 || cl.y > h + 30) return null;
            const n = cl.members.length;
            const label = n === 1 ? `${cl.members[0].name} — ${cl.members[0].city}` : t("bubble", { count: n });
            return (
              <g key={cl.key} transform={`translate(${cl.x} ${cl.y})`} className="cursor-pointer" onClick={() => onCluster(cl)}>
                <title>{label}</title>
                <circle r={n === 1 ? 12 : bubble(n) + 4} fill="transparent" />
                {n === 1 ? (
                  <circle r={4.5} fill={DOT} stroke="#0a0f1e" strokeWidth={1.2} />
                ) : (
                  <>
                    <circle r={bubble(n)} fill={DOT} fillOpacity={0.85} stroke="#0a0f1e" strokeWidth={1.2} />
                    <text textAnchor="middle" dy="0.35em" fontSize={n > 99 ? 9 : 10.5} fontWeight={700} fill="#0a0f1e" pointerEvents="none">
                      {n}
                    </text>
                  </>
                )}
              </g>
            );
          })}
          {selectedPoint && (
            <circle
              cx={selectedPoint[0] * view.k + view.x}
              cy={selectedPoint[1] * view.k + view.y}
              r={9}
              fill="none"
              stroke="#ffffff"
              strokeWidth={1.5}
              pointerEvents="none"
            />
          )}
        </svg>

        {selected && (
          <Panel
            selected={selected}
            byTicker={byTicker}
            onClose={() => setSelected(null)}
            onPick={(ticker) => setSelected({ kind: "company", ticker, back: selected.kind === "group" ? selected : undefined })}
            onBack={(group) => setSelected(group)}
          />
        )}
      </div>
      <p className="text-xs text-gray-500 mt-2">{t("hint")}</p>

      {missing.length > 0 && (
        <p className="text-xs text-gray-500 mt-2 leading-relaxed">
          {t("missingNote", { count: missing.length })}{" "}
          {missing.map((m, i) => (
            <span key={m.ticker}>
              <Link href={`/tools/stocks/${encodeURIComponent(m.ticker)}`} className="text-gray-400 hover:text-blue-300">{m.name}</Link>
              {i < missing.length - 1 ? ", " : "."}
            </span>
          ))}
        </p>
      )}

      {/* The same companies as a list: for phones, screen readers and search engines. */}
      <section className="mt-10">
        <h2 className="text-xl font-bold text-white mb-1">{t("listTitle")}</h2>
        <p className="text-sm text-gray-400 mb-4">{t("listIntro")}</p>
        <div className="flex flex-col gap-2">
          {listing.map(({ country, count, cities }) => (
            <details key={country} className="bg-[#0d1426] border border-gray-800 rounded-xl group">
              <summary className="cursor-pointer px-4 py-3 text-sm font-semibold text-gray-200 flex justify-between gap-3">
                <span>{country}</span>
                <span className="text-gray-500 font-normal">{t("companies", { count })}</span>
              </summary>
              <div className="px-4 pb-4 grid sm:grid-cols-2 lg:grid-cols-3 gap-x-6 gap-y-4">
                {cities.map(({ city, companies }) => (
                  <div key={city}>
                    <button onClick={() => showCity(companies)} className="text-xs font-bold uppercase tracking-wider text-blue-400 hover:text-blue-300 mb-1 text-left">
                      {city} <span className="text-gray-500 font-normal normal-case tracking-normal">· {t("showOnMap")}</span>
                    </button>
                    <ul className="text-sm leading-relaxed">
                      {companies.map((c) => (
                        <li key={c.ticker}>
                          <Link href={`/tools/stocks/${encodeURIComponent(c.ticker)}`} className="text-gray-300 hover:text-white">
                            {c.name} <span className="font-mono text-xs text-gray-500">{c.ticker}</span>
                          </Link>
                        </li>
                      ))}
                    </ul>
                  </div>
                ))}
              </div>
            </details>
          ))}
        </div>
      </section>
    </div>
  );
}

// ── The panel: a company's card, or the companies in one place ─────────────

function Panel({
  selected,
  byTicker,
  onClose,
  onPick,
  onBack,
}: {
  selected: Selected;
  byTicker: Map<string, MapCompany>;
  onClose: () => void;
  onPick: (ticker: string) => void;
  onBack: (group: Extract<Selected, { kind: "group" }>) => void;
}) {
  const t = useTranslations("companyMap");
  const headingRef = useRef<HTMLHeadingElement>(null);
  useEffect(() => headingRef.current?.focus(), [selected]);

  return (
    <div
      className="fixed inset-x-0 bottom-0 z-40 max-h-[72vh] overflow-y-auto rounded-t-2xl border-t border-gray-700 bg-[#0d1426] shadow-2xl
        md:absolute md:inset-x-auto md:right-3 md:top-3 md:bottom-3 md:w-[22rem] md:max-h-none md:rounded-2xl md:border"
      role="dialog"
      aria-modal="false"
    >
      <div className="sticky top-0 flex items-center justify-between gap-2 bg-[#0d1426] px-4 pt-3 pb-2 border-b border-gray-800">
        {selected.kind === "company" && selected.back ? (
          <button onClick={() => onBack(selected.back!)} className="text-xs text-blue-400 hover:text-blue-300">{t("backToList")}</button>
        ) : (
          <span />
        )}
        <button onClick={onClose} aria-label={t("close")} className="w-8 h-8 rounded-lg text-gray-400 hover:text-white hover:bg-gray-800 text-lg leading-none">×</button>
      </div>
      <div className="px-4 pb-5 pt-3">
        {selected.kind === "group" ? (
          <>
            <h3 ref={headingRef} tabIndex={-1} className="text-base font-bold text-white mb-3 outline-none">{selected.title}</h3>
            <ul className="flex flex-col">
              {selected.tickers.map((tk) => {
                const c = byTicker.get(tk)!;
                return (
                  <li key={tk}>
                    <button onClick={() => onPick(tk)} className="w-full text-left py-2 border-b border-gray-800/70 hover:bg-gray-800/40 px-1 rounded">
                      <span className="text-sm text-gray-200">{c.name}</span>{" "}
                      <span className="font-mono text-xs text-gray-500">{tk}</span>
                      <span className="block text-[11px] text-gray-500">{c.sector} · {c.city}</span>
                    </button>
                  </li>
                );
              })}
            </ul>
          </>
        ) : (
          <CompanyCard key={selected.ticker} company={byTicker.get(selected.ticker)!} headingRef={headingRef} />
        )}
      </div>
    </div>
  );
}

const cardCache = new Map<string, MapCard>();

function CompanyCard({ company, headingRef }: { company: MapCompany; headingRef: React.RefObject<HTMLHeadingElement | null> }) {
  const t = useTranslations("companyMap");
  const locale = useLocale();
  const [card, setCard] = useState<MapCard | null>(cardCache.get(company.ticker) ?? null);
  const [failed, setFailed] = useState(false);

  // Keyed by ticker, so a new company starts from a fresh state.
  useEffect(() => {
    if (cardCache.has(company.ticker)) return;
    let live = true;
    fetch(`/api/company-map?t=${encodeURIComponent(company.ticker)}`)
      .then((r) => (r.ok ? r.json() : Promise.reject(new Error(String(r.status)))))
      .then((c: MapCard) => {
        cardCache.set(company.ticker, c);
        if (live) setCard(c);
      })
      .catch(() => live && setFailed(true));
    return () => {
      live = false;
    };
  }, [company.ticker]);

  const asOf = card?.generatedAt
    ? new Date(card.generatedAt).toLocaleDateString(locale === "es" ? "es-ES" : "en-GB", { day: "numeric", month: "short", year: "numeric" })
    : null;

  return (
    <>
      <p className="font-mono text-blue-400 text-xs font-bold">{company.ticker}</p>
      <h3 ref={headingRef} tabIndex={-1} className="text-lg font-extrabold text-white leading-snug outline-none">{company.name}</h3>
      <p className="text-xs text-gray-400 mt-1">
        {company.sector} · {company.indices.map((s) => INDEX_LABELS[s]).join(", ")}
      </p>
      <p className="text-xs text-gray-500 mt-0.5">📍 {company.city}, {company.country}</p>
      <Link
        href={`/tools/stocks/${encodeURIComponent(company.ticker)}`}
        className="inline-block mt-3 bg-blue-600 hover:bg-blue-500 text-white px-3.5 py-2 rounded-lg text-xs font-semibold transition"
      >
        {t("openPage")}
      </Link>

      {failed ? (
        <p className="text-xs text-gray-500 mt-5">{t("cardError")}</p>
      ) : !card ? (
        <p className="text-xs text-gray-500 mt-5">{t("loading")}</p>
      ) : (
        <div className="mt-5">
          <p className="text-[11px] text-gray-500 leading-relaxed mb-4">
            {t("cardNote", { index: card.indexLabel })}
            {asOf && <> {t("asOf", { date: asOf })}</>}
          </p>
          <div className="flex flex-col gap-5">
            {card.groups.map(({ group, measures }) => (
              <div key={group}>
                <h4 className="text-[11px] font-bold uppercase tracking-wider text-blue-400 mb-3">{group}</h4>
                <div className="flex flex-col gap-4">
                  {measures.map((m) => (
                    <div key={m.key}>
                      <div className="flex justify-between gap-3">
                        <p className="text-xs text-white font-semibold">
                          {m.label}
                          {m.glossary && <Link href={`/glossary#${m.glossary}`} className="ml-1.5 text-[10px] text-blue-400 hover:underline font-normal">?</Link>}
                        </p>
                        <p className="font-mono text-xs text-gray-200 shrink-0">{m.display}</p>
                      </div>
                      {m.sentence && <p className="text-[11px] text-gray-400 mt-0.5 mb-1.5">{m.sentence}</p>}
                      <PositionBar position={m.position} indexLabel={card.indexLabel} />
                    </div>
                  ))}
                </div>
              </div>
            ))}
          </div>
        </div>
      )}
    </>
  );
}
