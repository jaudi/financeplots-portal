"use client";

import { useEffect, useMemo, useState, type FormEvent, type KeyboardEvent } from "react";
import { CartesianGrid, Line, LineChart, ReferenceLine, ResponsiveContainer, Tooltip, XAxis, YAxis } from "recharts";
import { PRICE_RANGES, SYMBOL_PATTERN, type PriceHistory, type PriceRange } from "@/lib/price-types";
import { commonStart, correlation, rebase, seriesStats } from "@/lib/price-stats";

// Neutral like the screener and Stock Analysis: opens empty, suggests no
// tickers, keeps them in the order the visitor typed, colours follow that order
// (never performance), and nothing is marked best or worst.

const MAX_TICKERS = 4;
const RANGE_LABELS: Record<PriceRange, string> = { "1m": "1M", "6m": "6M", "1y": "1Y", "5y": "5Y", max: "Max" };
const MONTHS = ["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"];
// Fixed categorical order; each line also gets its own dash so colour isn't the only cue.
const LINES = [
  { color: "#3987e5", dash: undefined },
  { color: "#d95926", dash: "8 4" },
  { color: "#199e70", dash: "2 4" },
  { color: "#c98500", dash: "12 4 2 4" },
];

function fmtDate(iso: string, withDay = true) {
  const [y, m, d] = iso.split("-");
  return withDay ? `${+d} ${MONTHS[+m - 1]} ${y}` : `${MONTHS[+m - 1]} ${y}`;
}

function fmtPct(v: number | null | undefined, arrows = true) {
  if (v === null || v === undefined) return "—";
  if (arrows && v >= 1000) return `▲ ×${(1 + v / 100).toLocaleString("en-GB", { maximumFractionDigits: v >= 10000 ? 0 : 1 })}`;
  const sign = v > 0 ? "+" : "";
  const arrow = !arrows ? "" : v > 0 ? "▲ " : v < 0 ? "▼ " : "";
  return `${arrow}${sign}${v.toFixed(1)}%`;
}

function parseTickers(raw: string): string[] {
  return [...new Set(raw.toUpperCase().split(/[\s,;]+/).filter(Boolean))];
}

function LineKey({ i }: { i: number }) {
  return (
    <svg width="22" height="8" aria-hidden="true" className="shrink-0">
      <line x1="0" y1="4" x2="22" y2="4" stroke={LINES[i].color} strokeWidth="2.5" strokeDasharray={LINES[i].dash} />
    </svg>
  );
}

export default function StockComparison({ initialSymbols, initialRange }: { initialSymbols: string[]; initialRange: PriceRange }) {
  const [input, setInput] = useState(initialSymbols.join(", "));
  const [symbols, setSymbols] = useState<string[]>(initialSymbols);
  const [range, setRange] = useState<PriceRange>(initialRange);
  const [result, setResult] = useState<{ key: string; data: PriceHistory[]; failed: string[] } | null>(null);
  const [error, setError] = useState<string | null>(null);

  // Loading is derived from the request, and a late response for an older
  // request is dropped, so quick clicks on the periods can't show stale data.
  const requestKey = `${symbols.join(",")}|${range}`;
  const loading = symbols.length > 0 && result?.key !== requestKey;
  const data = useMemo(() => result?.data ?? [], [result]);
  const failed = result?.failed ?? [];

  useEffect(() => {
    if (!symbols.length) return;
    let current = true;
    (async () => {
      const results = await Promise.all(
        symbols.map(async (s) => {
          try {
            const res = await fetch(`/api/prices?symbol=${encodeURIComponent(s)}&range=${range}`);
            return res.ok ? ((await res.json()) as PriceHistory) : null;
          } catch {
            return null;
          }
        }),
      );
      if (!current) return;
      setResult({
        key: `${symbols.join(",")}|${range}`,
        data: results.filter((h): h is PriceHistory => h !== null),
        failed: symbols.filter((_, i) => results[i] === null),
      });
      const url = new URL(window.location.href);
      url.searchParams.set("symbols", symbols.join(","));
      url.searchParams.set("range", range);
      window.history.replaceState(null, "", url);
    })();
    return () => {
      current = false;
    };
  }, [symbols, range]);

  function submit(e: FormEvent | KeyboardEvent) {
    e.preventDefault();
    const list = parseTickers(input);
    if (list.length < 2) return setError("Enter at least two tickers, separated by commas or spaces.");
    if (list.length > MAX_TICKERS) return setError(`Compare up to ${MAX_TICKERS} tickers at a time.`);
    const bad = list.filter((s) => !SYMBOL_PATTERN.test(s));
    if (bad.length) return setError(`${bad.join(", ")} ${bad.length > 1 ? "don't" : "doesn't"} look like a ticker. Use Yahoo Finance symbols.`);
    setSymbols(list);
  }

  // Everything is measured from the latest first date, so no series gets a head start.
  const view = useMemo(() => {
    if (data.length < 2) return null;
    const start = commonStart(data.map((h) => h.points));
    const series = data.map((h) => h.points.filter((p) => p.date >= start));
    if (series.some((s) => s.length < 2)) return null;
    const perYear = data[0].interval === "1wk" ? 52 : 252;
    const rows = rebase(series);
    const spanYears = (Date.parse(rows[rows.length - 1].date as string) - Date.parse(start)) / 3.156e10;
    return {
      start,
      rows,
      spanYears,
      stats: series.map((s) => seriesStats(s, perYear)),
      corr: series.map((a, i) => series.map((b, j) => (i === j ? 1 : correlation(a, b)))),
    };
  }, [data]);

  const currencies = [...new Set(data.map((h) => h.currency).filter(Boolean))];

  return (
    <div className="flex flex-col gap-6">
      <form onSubmit={submit} className="bg-[#0d1426] border border-gray-800 rounded-xl p-5 flex flex-col md:flex-row md:items-end gap-4">
        <div className="flex-1">
          <label htmlFor="tickers" className="text-xs text-gray-400 font-medium">Tickers (2 to {MAX_TICKERS})</label>
          <div className="flex gap-2 mt-1">
            <input
              id="tickers"
              value={input}
              onChange={(e) => {
                setInput(e.target.value);
                setError(null);
              }}
              // Explicit, so Enter works even where implicit form submission doesn't fire
              onKeyDown={(e) => {
                if (e.key === "Enter" && !e.nativeEvent.isComposing) submit(e);
              }}
              placeholder="Yahoo Finance symbols, separated by commas"
              autoCapitalize="characters"
              autoComplete="off"
              spellCheck={false}
              className="flex-1 min-w-0 bg-[#111827] border border-gray-700 focus:border-blue-500 rounded-lg px-3 py-2 text-white text-sm uppercase outline-none transition"
            />
            <button type="submit" disabled={loading} className="bg-blue-600 hover:bg-blue-500 disabled:opacity-50 text-white font-semibold px-5 py-2 rounded-lg text-sm transition">
              Compare
            </button>
          </div>
          <p className="text-xs text-gray-500 mt-1.5">Outside the US, add the exchange suffix: .MC Madrid, .L London, .PA Paris, .DE Xetra. Indices start with ^.</p>
        </div>
        <div className="flex gap-1 bg-[#111827] border border-gray-700 rounded-lg p-1 self-start md:self-auto" role="group" aria-label="Period">
          {PRICE_RANGES.map((r) => (
            <button
              key={r}
              type="button"
              onClick={() => setRange(r)}
              aria-pressed={range === r}
              className={`px-3 py-1.5 rounded-md text-xs font-semibold transition ${range === r ? "bg-blue-600 text-white" : "text-gray-400 hover:text-white"}`}
            >
              {RANGE_LABELS[r]}
            </button>
          ))}
        </div>
      </form>

      {error && <p className="text-sm text-red-300 bg-red-500/10 border border-red-500/30 rounded-lg px-4 py-3">{error}</p>}
      {!loading && failed.length > 0 && (
        <p className="text-sm text-amber-200 bg-amber-500/10 border border-amber-500/30 rounded-lg px-4 py-3">
          No price data for {failed.join(", ")}. Check the ticker and its exchange suffix.
          {data.length < 2 && " At least two tickers with data are needed to compare."}
        </p>
      )}

      {symbols.length === 0 && !error && (
        <div className="border border-dashed border-gray-800 rounded-xl p-10 text-center text-gray-500 text-sm">
          Enter two to four tickers to compare how their prices moved.
        </div>
      )}

      {symbols.length > 0 && loading && data.length === 0 && <div className="h-[460px] bg-[#0d1426] border border-gray-800 rounded-xl animate-pulse" />}

      {view && (
        <div className={`flex flex-col gap-6 transition-opacity ${loading ? "opacity-50" : ""}`}>
          <div className="bg-[#0d1426] border border-gray-800 rounded-xl p-5">
            <div className="flex flex-wrap gap-x-5 gap-y-2 mb-4 text-xs text-gray-300">
              {data.map((h, i) => (
                <span key={h.symbol} className="flex items-center gap-2">
                  <LineKey i={i} />
                  <span className="font-semibold">{h.symbol}</span>
                  <span className="text-gray-500 truncate max-w-[180px]">{h.name}</span>
                </span>
              ))}
            </div>
            <ResponsiveContainer width="100%" height={380}>
              <LineChart data={view.rows} margin={{ top: 5, right: 10, bottom: 5, left: 0 }}>
                <CartesianGrid stroke="rgba(255,255,255,0.05)" vertical={false} />
                <XAxis
                  dataKey="date"
                  stroke="#374151"
                  tick={{ fill: "#6b7280", fontSize: 11 }}
                  tickFormatter={(d: string) =>
                    view.spanYears > 15 ? d.slice(0, 4) : view.spanYears > 1.5 ? `${MONTHS[+d.slice(5, 7) - 1]} ${d.slice(2, 4)}` : fmtDate(d, data[0].range === "1m")
                  }
                  minTickGap={40}
                />
                <YAxis
                  stroke="#374151"
                  tick={{ fill: "#6b7280", fontSize: 11 }}
                  domain={["auto", "auto"]}
                  scale={view.spanYears > 15 ? "log" : "auto"}
                  tickFormatter={(v: number) => v.toLocaleString("en-GB", { maximumFractionDigits: 0 })}
                  width={56}
                />
                <ReferenceLine y={100} stroke="#4b5563" strokeDasharray="3 3" />
                <Tooltip
                  contentStyle={{ backgroundColor: "#111827", border: "1px solid #1e293b", borderRadius: "8px", color: "#f1f5f9", fontSize: 12 }}
                  labelFormatter={(d) => fmtDate(String(d))}
                  formatter={(v, key) => {
                    const i = Number(String(key).slice(1));
                    return [`${Number(v).toFixed(1)}  (${fmtPct(Number(v) - 100, false)})`, data[i]?.symbol];
                  }}
                />
                {data.map((h, i) => (
                  <Line
                    key={h.symbol}
                    type="monotone"
                    dataKey={`s${i}`}
                    name={`s${i}`}
                    stroke={LINES[i].color}
                    strokeDasharray={LINES[i].dash}
                    strokeWidth={2}
                    dot={false}
                    isAnimationActive={false}
                    connectNulls
                  />
                ))}
              </LineChart>
            </ResponsiveContainer>
            <p className="text-xs text-gray-600 mt-3">
              Each line starts at 100 on {fmtDate(view.start)}, the first date all {data.length} have prices
              {currencies.length > 1 ? `, and moves in its own currency (${currencies.join(", ")}) — currency swings aren't included` : ""}.
              {data[0].interval === "1wk" ? " Weekly closes, log scale over long periods." : " Daily closes."} Yahoo Finance, delayed. Past prices say nothing about future returns.
            </p>
          </div>

          <div className="bg-[#0d1426] border border-gray-800 rounded-xl p-5 overflow-x-auto">
            <table className="w-full text-sm tabular-nums">
              <thead>
                <tr className="border-b border-gray-700">
                  <th className="text-left text-xs text-gray-400 uppercase tracking-wider py-2 pr-4 font-semibold">Since {fmtDate(view.start)}</th>
                  {data.map((h, i) => (
                    <th key={h.symbol} className="text-right text-xs text-gray-300 py-2 px-3 font-semibold whitespace-nowrap">
                      <span className="inline-flex items-center gap-2"><LineKey i={i} />{h.symbol}</span>
                    </th>
                  ))}
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-800">
                {[
                  { label: "Last close", cell: (i: number) => `${view.stats[i].last.close.toLocaleString("en-GB", { minimumFractionDigits: 2, maximumFractionDigits: view.stats[i].last.close < 10 ? 4 : 2 })} ${data[i].currency}` },
                  { label: "Change over the period", cell: (i: number) => fmtPct(view.stats[i].change_pct) },
                  { label: "Annualised return", cell: (i: number) => (view.stats[i].annualised_pct === null ? "— (under 1 year)" : fmtPct(view.stats[i].annualised_pct, false)) },
                  { label: "Volatility (annualised)", cell: (i: number) => (view.stats[i].volatility_pct === null ? "—" : `${view.stats[i].volatility_pct!.toFixed(1)}%`) },
                  {
                    label: "Largest fall from a high",
                    cell: (i: number) => {
                      const dd = view.stats[i].max_drawdown;
                      return dd ? `${dd.pct.toFixed(1)}%` : "—";
                    },
                    sub: (i: number) => {
                      const dd = view.stats[i].max_drawdown;
                      return dd ? `${fmtDate(dd.peak, false)} → ${fmtDate(dd.trough, false)}` : "";
                    },
                  },
                ].map((row) => (
                  <tr key={row.label}>
                    <td className="py-2.5 pr-4 text-gray-400 text-xs">{row.label}</td>
                    {data.map((h, i) => (
                      <td key={h.symbol} className="py-2.5 px-3 text-right text-white whitespace-nowrap">
                        {row.cell(i)}
                        {row.sub && <div className="text-[11px] text-gray-500">{row.sub(i)}</div>}
                      </td>
                    ))}
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          <div className="bg-[#0d1426] border border-gray-800 rounded-xl p-5 overflow-x-auto">
            <h3 className="text-white font-bold text-sm mb-1">How closely they moved together</h3>
            <p className="text-xs text-gray-500 mb-4">
              Correlation of {data[0].interval === "1wk" ? "weekly" : "daily"} returns on the days both traded: 1 means they always moved the same way, 0 no relation, −1 opposite ways.
            </p>
            <table className="text-sm tabular-nums">
              <thead>
                <tr>
                  <th />
                  {data.map((h) => (
                    <th key={h.symbol} className="text-right text-xs text-gray-400 font-semibold px-3 py-1.5">{h.symbol}</th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {data.map((row, i) => (
                  <tr key={row.symbol}>
                    <td className="text-xs text-gray-400 font-semibold pr-3 py-1.5">{row.symbol}</td>
                    {data.map((col, j) => {
                      const c = view.corr[i][j];
                      return (
                        <td key={col.symbol} className={`text-right px-3 py-1.5 ${i === j ? "text-gray-600" : "text-white"}`}>
                          {c === null ? "—" : c.toFixed(2)}
                        </td>
                      );
                    })}
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}
    </div>
  );
}
