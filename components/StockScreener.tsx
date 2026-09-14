"use client";

import Link from "next/link";
import { useEffect, useMemo, useState } from "react";
import { METRIC_GROUPS, METRICS, type MetricDef, type MetricKey } from "@/lib/stock-metrics";
import type { UniverseCompany, UniverseData, UniverseScreen } from "@/lib/universe";

// A neutral screen. The user sets every criterion, nothing is shown until they
// run it, and the results come back alphabetically. What is deliberately absent
// — and has to stay absent (UK MAR, see CLAUDE.md): a default or featured list,
// suggested thresholds, any site-built score or rank, and green/red colouring
// that reads as a verdict on a company.

const INDICES: { key: UniverseScreen; label: string }[] = [
  { key: "sp500", label: "S&P 500" },
  { key: "nasdaq100", label: "Nasdaq-100" },
  { key: "ibex35", label: "IBEX 35" },
];

type Bounds = Partial<Record<MetricKey, { min: string; max: string }>>;
type Filter = { key: MetricKey; min: number | null; max: number | null };
interface Criteria {
  filters: Filter[];
  sector: string;
  query: string;
}
type SortKey = "ticker" | "nombre" | "sector" | MetricKey;

function parseNumber(text: string): number | null | "invalid" {
  const t = text.trim().replace(",", ".");
  if (t === "") return null;
  const n = Number(t);
  return Number.isFinite(n) ? n : "invalid";
}

/** Turns the form into criteria. A metric with an unreadable number, or a
 *  minimum above its maximum, is reported rather than quietly ignored — the
 *  user would otherwise run a screen that isn't the one they typed. */
function readCriteria(bounds: Bounds, sector: string, query: string) {
  const filters: Filter[] = [];
  const problems = new Set<MetricKey>();
  for (const m of METRICS) {
    const b = bounds[m.key];
    if (!b) continue;
    const min = parseNumber(b.min);
    const max = parseNumber(b.max);
    if (min === "invalid" || max === "invalid" || (min !== null && max !== null && min > max)) {
      problems.add(m.key);
      continue;
    }
    if (min !== null || max !== null) filters.push({ key: m.key, min, max });
  }
  const criteria: Criteria = { filters, sector, query: query.trim() };
  return { criteria, problems };
}

function formatValue(value: number | null, m: MetricDef) {
  if (value === null) return "—";
  const decimals = m.key === "precio_actual" ? 2 : 1;
  const body = value.toLocaleString("en-GB", { minimumFractionDigits: decimals, maximumFractionDigits: decimals });
  return `${body}${m.unit}`;
}

function formatDate(iso: string | null) {
  if (!iso) return null;
  return new Date(iso).toLocaleDateString("en-GB", { day: "numeric", month: "short", year: "numeric" });
}

function compare(a: UniverseCompany, b: UniverseCompany, key: SortKey, dir: 1 | -1) {
  const va = a[key];
  const vb = b[key];
  // Gaps sort last in both directions: flipping the order shouldn't bring the
  // companies with no figure to the top.
  if (va === null) return vb === null ? a.ticker.localeCompare(b.ticker) : 1;
  if (vb === null) return -1;
  const order = typeof va === "number" && typeof vb === "number" ? va - vb : String(va).localeCompare(String(vb));
  return order * dir || a.ticker.localeCompare(b.ticker);
}

export default function StockScreener({ initialIndex }: { initialIndex: UniverseScreen }) {
  const [index, setIndex] = useState<UniverseScreen>(initialIndex);
  const [data, setData] = useState<UniverseData | null>(null);
  const [status, setStatus] = useState<"loading" | "ready" | "error">("loading");
  const [bounds, setBounds] = useState<Bounds>({});
  const [sector, setSector] = useState("");
  const [query, setQuery] = useState("");
  const [ran, setRan] = useState<Criteria | null>(null);
  const [sort, setSort] = useState<{ key: SortKey; dir: 1 | -1 }>({ key: "ticker", dir: 1 });

  useEffect(() => {
    let cancelled = false;
    fetch(`/api/universe?screen=${index}`)
      .then((res) => {
        if (!res.ok) throw new Error(String(res.status));
        return res.json() as Promise<UniverseData>;
      })
      .then((json) => {
        if (cancelled) return;
        setData(json);
        setStatus("ready");
      })
      .catch(() => {
        if (!cancelled) setStatus("error");
      });
    return () => {
      cancelled = true;
    };
  }, [index]);

  function chooseIndex(next: UniverseScreen) {
    if (next === index) return;
    setIndex(next);
    setData(null);
    setStatus("loading");
    // Results belong to the index they were run on, and sectors differ by index.
    setRan(null);
    setSector("");
  }

  function setBound(key: MetricKey, side: "min" | "max", value: string) {
    setBounds((prev) => {
      const current = prev[key] ?? { min: "", max: "" };
      return { ...prev, [key]: { ...current, [side]: value } };
    });
  }

  function clearAll() {
    setBounds({});
    setSector("");
    setQuery("");
    setRan(null);
  }

  // Back/forward between ?index= URLs is a client-side navigation: this
  // component stays mounted and only the prop changes. Follow it, or the page
  // would show one index under another's URL.
  const [indexProp, setIndexProp] = useState(initialIndex);
  if (initialIndex !== indexProp) {
    setIndexProp(initialIndex);
    chooseIndex(initialIndex);
  }

  const sectors = useMemo(() => {
    const set = new Set((data?.companies ?? []).map((c) => c.sector).filter((s): s is string => Boolean(s)));
    return Array.from(set).sort();
  }, [data]);

  const { criteria, problems } = useMemo(() => readCriteria(bounds, sector, query), [bounds, sector, query]);
  const hasCriteria = criteria.filters.length > 0 || criteria.sector !== "" || criteria.query !== "";
  const canRun = status === "ready" && hasCriteria && problems.size === 0;
  const stale = ran !== null && JSON.stringify(ran) !== JSON.stringify(criteria);

  function run() {
    if (!canRun) return;
    setRan(criteria);
    setSort({ key: "ticker", dir: 1 });
  }

  const results = useMemo(() => {
    if (!ran || !data) return null;
    const q = ran.query.toLowerCase();
    let missing = 0;
    const rows = data.companies.filter((c) => {
      if (ran.sector && c.sector !== ran.sector) return false;
      if (q && !c.ticker.toLowerCase().includes(q) && !c.nombre.toLowerCase().includes(q)) return false;
      let lacksData = false;
      for (const f of ran.filters) {
        const v = c[f.key];
        if (v === null) {
          lacksData = true;
          continue;
        }
        if ((f.min !== null && v < f.min) || (f.max !== null && v > f.max)) return false;
      }
      // Met every criterion it has figures for, but not all of them: left out
      // and counted, so a gap in the data is visible rather than silent.
      if (lacksData) {
        missing++;
        return false;
      }
      return true;
    });
    rows.sort((a, b) => compare(a, b, sort.key, sort.dir));
    return { rows, missing };
  }, [ran, data, sort]);

  const columns = ran ? METRICS.filter((m) => ran.filters.some((f) => f.key === m.key)) : [];
  const indexLabel = INDICES.find((i) => i.key === index)?.label ?? index;

  function sortBy(key: SortKey) {
    setSort((prev) => (prev.key === key ? { key, dir: prev.dir === 1 ? -1 : 1 } : { key, dir: 1 }));
  }

  function SortHeader({ k, label, numeric }: { k: SortKey; label: string; numeric?: boolean }) {
    const active = sort.key === k;
    return (
      <th className={`px-4 py-3 ${numeric ? "text-right" : "text-left"}`}>
        <button
          onClick={() => sortBy(k)}
          className={`uppercase tracking-wide transition hover:text-white ${active ? "text-white" : ""}`}
        >
          {label}
          {active && <span className="ml-1">{sort.dir === 1 ? "↑" : "↓"}</span>}
        </button>
      </th>
    );
  }

  return (
    <div>
      {/* Index */}
      <div className="flex flex-wrap justify-center gap-2 mb-3">
        {INDICES.map((i) => (
          <button
            key={i.key}
            onClick={() => chooseIndex(i.key)}
            className={`px-5 py-2.5 rounded-xl text-sm font-bold transition border ${
              index === i.key
                ? "bg-blue-600 border-blue-500 text-white"
                : "bg-[#0d1426] border-gray-800 text-gray-400 hover:border-gray-600 hover:text-white"
            }`}
          >
            {i.label}
          </button>
        ))}
      </div>
      <p className="text-center text-xs text-gray-500 mb-8 min-h-4">
        {status === "loading" && "Loading index data…"}
        {status === "error" && "This index's data couldn't be loaded. Try again later."}
        {status === "ready" && data && (
          <>
            {data.count} companies in the {indexLabel}
            {formatDate(data.generated_at) && <> · data as of {formatDate(data.generated_at)}</>}
          </>
        )}
      </p>

      {/* Criteria */}
      <div className="bg-[#0d1426] border border-gray-800 rounded-2xl p-5 sm:p-6 mb-8">
        <div className="grid sm:grid-cols-2 gap-5 mb-6">
          <div>
            <label htmlFor="screen-query" className="block text-xs font-bold uppercase tracking-wide text-gray-500 mb-2">
              Company name or ticker
            </label>
            <input
              id="screen-query"
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              placeholder="Any"
              className="w-full bg-[#070d1a] border border-gray-700 rounded-lg px-3 py-2 text-sm text-white placeholder:text-gray-600 focus:border-blue-500 focus:outline-none"
            />
          </div>
          <div>
            <label htmlFor="screen-sector" className="block text-xs font-bold uppercase tracking-wide text-gray-500 mb-2">
              Sector
            </label>
            <select
              id="screen-sector"
              value={sector}
              onChange={(e) => setSector(e.target.value)}
              className="w-full bg-[#070d1a] border border-gray-700 rounded-lg px-3 py-2 text-sm text-white focus:border-blue-500 focus:outline-none"
            >
              <option value="">Any sector</option>
              {sectors.map((s) => (
                <option key={s} value={s}>
                  {s}
                </option>
              ))}
            </select>
          </div>
        </div>

        <p className="text-xs font-bold uppercase tracking-wide text-gray-500 mb-1">Your limits</p>
        <p className="text-xs text-gray-500 mb-5">
          Fill in a minimum, a maximum or both for any measure you care about. Leave the rest empty.
        </p>

        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
          {METRIC_GROUPS.map((group) => (
            <fieldset key={group} className="space-y-4">
              <legend className="text-sm font-bold text-white mb-3">{group}</legend>
              {METRICS.filter((m) => m.group === group).map((m) => {
                const b = bounds[m.key] ?? { min: "", max: "" };
                const problem = problems.has(m.key);
                return (
                  <div key={m.key}>
                    <div className="flex items-baseline justify-between gap-2">
                      <span className="text-xs font-semibold text-gray-300">{m.label}</span>
                      {m.glossary && (
                        <Link href={`/glossary#${m.glossary}`} className="text-[10px] text-blue-400 hover:underline shrink-0">
                          what is this?
                        </Link>
                      )}
                    </div>
                    <p className="text-[11px] text-gray-500 leading-snug mb-1.5">{m.help}</p>
                    <div className="flex items-center gap-2">
                      {(["min", "max"] as const).map((side, i) => (
                        <div key={side} className="contents">
                          {i === 1 && <span className="text-gray-600 text-xs">to</span>}
                          <input
                            inputMode="decimal"
                            aria-label={`${m.label} ${side === "min" ? "minimum" : "maximum"}`}
                            value={b[side]}
                            onChange={(e) => setBound(m.key, side, e.target.value)}
                            placeholder={side}
                            className={`w-full min-w-0 bg-[#070d1a] border rounded-lg px-2.5 py-1.5 text-sm text-white placeholder:text-gray-600 focus:outline-none ${
                              problem ? "border-amber-500/70" : "border-gray-700 focus:border-blue-500"
                            }`}
                          />
                        </div>
                      ))}
                      <span className="text-xs text-gray-500 w-4 shrink-0">{m.unit}</span>
                    </div>
                    {problem && (
                      <p className="text-[11px] text-amber-400/90 mt-1">
                        Check this one — it needs numbers, with the minimum no higher than the maximum.
                      </p>
                    )}
                  </div>
                );
              })}
            </fieldset>
          ))}
        </div>

        <div className="flex flex-wrap items-center gap-3 mt-8 pt-5 border-t border-gray-800">
          <button
            onClick={run}
            disabled={!canRun}
            className="bg-blue-600 hover:bg-blue-500 disabled:bg-gray-800 disabled:text-gray-500 disabled:cursor-not-allowed text-white font-bold px-6 py-2.5 rounded-xl text-sm transition"
          >
            Run screen
          </button>
          <button onClick={clearAll} className="text-xs text-gray-500 hover:text-white transition">
            Clear all
          </button>
          <p className="text-xs text-gray-500 ml-auto">
            {!hasCriteria
              ? "Set at least one criterion to run the screen."
              : problems.size > 0
                ? "Fix the highlighted limits to run the screen."
                : stale
                  ? "Your criteria have changed — run the screen again to update the results."
                  : null}
          </p>
        </div>
      </div>

      {/* Results — only after the user has run a screen */}
      {results && ran && (
        <div>
          <div className="flex flex-wrap items-baseline justify-between gap-2 mb-3">
            <h2 className="text-lg font-bold text-white">
              {results.rows.length} {results.rows.length === 1 ? "company meets" : "companies meet"} your criteria
            </h2>
            <p className="text-xs text-gray-500">A–Z by ticker. Click a column heading to sort by it.</p>
          </div>

          {results.missing > 0 && (
            <p className="text-xs text-gray-500 mb-3">
              {results.missing} more {results.missing === 1 ? "company" : "companies"} had no figure for at least
              one of your measures, so {results.missing === 1 ? "it was" : "they were"} left out.
            </p>
          )}

          {results.rows.length === 0 ? (
            <div className="bg-[#0d1426] border border-gray-800 rounded-xl p-6 text-center text-sm text-gray-400">
              No company in the {indexLabel} meets all of these criteria.
            </div>
          ) : (
            <div className="overflow-x-auto bg-[#0d1426] border border-gray-800 rounded-xl">
              <table className="w-full text-sm">
                <thead>
                  <tr className="border-b border-gray-800 text-gray-500 text-xs">
                    <SortHeader k="ticker" label="Ticker" />
                    <SortHeader k="nombre" label="Name" />
                    <SortHeader k="sector" label="Sector" />
                    {columns.map((m) => (
                      <SortHeader key={m.key} k={m.key} label={m.label} numeric />
                    ))}
                  </tr>
                </thead>
                <tbody>
                  {results.rows.map((c) => (
                    <tr key={c.ticker} className="border-b border-gray-800/60 last:border-0">
                      <td className="px-4 py-3 font-mono text-gray-200">{c.ticker}</td>
                      <td className="px-4 py-3 text-gray-200">{c.nombre}</td>
                      <td className="px-4 py-3 text-gray-400">{c.sector ?? "—"}</td>
                      {columns.map((m) => (
                        <td key={m.key} className="px-4 py-3 text-right text-gray-300 font-mono">
                          {formatValue(c[m.key], m)}
                        </td>
                      ))}
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}

          <p className="text-xs text-gray-600 mt-4 leading-relaxed">
            These are the companies that meet the criteria you set. FinancePlots doesn&apos;t score, rank or select
            companies, and a result is not a recommendation to buy or sell anything. Figures come from public market
            data refreshed weekly and may be delayed or wrong.
          </p>
        </div>
      )}
    </div>
  );
}
