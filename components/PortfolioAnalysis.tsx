"use client";

import { useEffect, useMemo, useState } from "react";
import {
  Bar, BarChart, CartesianGrid, Legend, Line, LineChart, ReferenceLine, ResponsiveContainer,
  Scatter, ScatterChart, Tooltip, XAxis, YAxis, ZAxis,
} from "recharts";
import { SYMBOL_PATTERN, type PriceHistory, type PriceRange } from "@/lib/price-types";
import { analysePortfolio } from "@/lib/portfolio-stats";

// Neutral like the other market tools: opens with empty rows and no suggested
// holdings, keeps holdings in the order entered, colours by position (never by
// performance), and grades nothing — no "good" Sharpe, no green/red.

export interface HoldingRow {
  symbol: string;
  weight: string;
}

const MAX_HOLDINGS = 8;
const RANGES: PriceRange[] = ["6m", "1y", "5y", "max"];
const RANGE_LABELS: Record<string, string> = { "6m": "6M", "1y": "1Y", "5y": "5Y", max: "Max" };
const MONTHS = ["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"];
const COLORS = ["#3987e5", "#d95926", "#199e70", "#c98500", "#d55181", "#008300", "#9085e9", "#e66767"];
const DASHES = [undefined, "8 4", "2 4", "12 4 2 4"];

function fmtDate(iso: string, withDay = true) {
  const [y, m, d] = iso.split("-");
  return withDay ? `${+d} ${MONTHS[+m - 1]} ${y}` : `${MONTHS[+m - 1]} ${y}`;
}

const pct = (v: number | null, dp = 1, sign = true) => {
  if (v === null) return "—";
  // Over long periods a percentage stops being readable (+1,379.7%); show the multiple, as the other tools do
  if (sign && v >= 1000) return `×${(1 + v / 100).toLocaleString("en-GB", { maximumFractionDigits: 1 })}`;
  return `${sign && v > 0 ? "+" : ""}${v.toFixed(dp)}%`;
};

function Stat({ label, value, sub }: { label: string; value: string; sub?: string }) {
  return (
    <div className="bg-[#0d1426] border border-gray-800 rounded-xl p-4">
      <div className="text-xs text-gray-400 uppercase tracking-wider font-semibold mb-1">{label}</div>
      <div className="text-xl font-extrabold text-white leading-tight tabular-nums">{value}</div>
      {sub && <div className="text-xs text-gray-500 mt-1 leading-snug">{sub}</div>}
    </div>
  );
}

function parseWeight(s: string) {
  const v = parseFloat(s.replace(",", "."));
  return Number.isFinite(v) ? v : NaN;
}

interface Config {
  holdings: { symbol: string; weight: number }[];
  range: PriceRange;
}

function validate(rs: HoldingRow[]): Config["holdings"] | string {
  const filled = rs.filter((r) => r.symbol.trim() || r.weight.trim());
  if (filled.length < 1) return "Add at least one holding: a ticker and its weight.";
  const out: Config["holdings"] = [];
  for (const r of filled) {
    const s = r.symbol.trim().toUpperCase();
    const w = parseWeight(r.weight);
    if (!s) return "Every weight needs a ticker next to it.";
    if (!SYMBOL_PATTERN.test(s)) return `${s} doesn't look like a ticker. Use a Yahoo Finance symbol.`;
    if (!Number.isFinite(w) || w <= 0) return `Give ${s} a weight above 0.`;
    if (out.some((o) => o.symbol === s)) return `${s} appears twice. Combine its weights into one row.`;
    out.push({ symbol: s, weight: w });
  }
  return out;
}

export default function PortfolioAnalysis({
  initialRows,
  initialRange,
  initialRiskFree,
  riskFreeNote,
}: {
  initialRows: HoldingRow[];
  initialRange: PriceRange;
  initialRiskFree: number;
  riskFreeNote: string;
}) {
  const [rows, setRows] = useState<HoldingRow[]>(initialRows.length ? initialRows : [{ symbol: "", weight: "" }, { symbol: "", weight: "" }]);
  const [range, setRange] = useState<PriceRange>(initialRange);
  const [riskFree, setRiskFree] = useState(String(initialRiskFree));
  // Opened from a shared link: analyse straight away.
  const [config, setConfig] = useState<Config | null>(() => {
    const v = initialRows.length ? validate(initialRows) : null;
    return v && typeof v !== "string" ? { holdings: v, range: initialRange } : null;
  });
  const [result, setResult] = useState<{ key: string; data: Record<string, PriceHistory>; failed: string[] } | null>(null);
  const [formError, setFormError] = useState<string | null>(null);
  const [showHoldings, setShowHoldings] = useState(false);

  function analyse() {
    const v = validate(rows);
    if (typeof v === "string") return setFormError(v);
    setFormError(null);
    setConfig({ holdings: v, range });
  }

  const requestKey = config ? `${config.holdings.map((h) => h.symbol).join(",")}|${config.range}` : "";
  const loading = config !== null && result?.key !== requestKey;

  useEffect(() => {
    if (!config) return;
    let current = true;
    const key = `${config.holdings.map((h) => h.symbol).join(",")}|${config.range}`;
    (async () => {
      const got = await Promise.all(
        config.holdings.map(async (h) => {
          try {
            const res = await fetch(`/api/prices?symbol=${encodeURIComponent(h.symbol)}&range=${config.range}`);
            return res.ok ? ((await res.json()) as PriceHistory) : null;
          } catch {
            return null;
          }
        }),
      );
      if (!current) return;
      const data: Record<string, PriceHistory> = {};
      got.forEach((h, i) => {
        if (h) data[config.holdings[i].symbol] = h;
      });
      setResult({ key, data, failed: config.holdings.filter((_, i) => !got[i]).map((h) => h.symbol) });
    })();
    return () => {
      current = false;
    };
  }, [config]);

  const rf = parseWeight(riskFree);
  const analysis = useMemo(() => {
    if (!config || !result || result.key !== requestKey || result.failed.length) return null;
    const hs = config.holdings.map((h) => ({ ...h, points: result.data[h.symbol].points }));
    const perYear = result.data[hs[0].symbol].interval === "1wk" ? 52 : 252;
    return analysePortfolio(hs, Number.isFinite(rf) ? rf : 0, perYear);
  }, [config, result, requestKey, rf]);

  // Keep the URL shareable once an analysis has run.
  useEffect(() => {
    if (!analysis || !config) return;
    const url = new URL(window.location.href);
    url.searchParams.set("h", config.holdings.map((h) => `${h.symbol}:${h.weight}`).join(","));
    url.searchParams.set("range", config.range);
    url.searchParams.set("rf", riskFree);
    window.history.replaceState(null, "", url);
  }, [analysis, config, riskFree]);

  const names = result?.data ?? {};
  const currencies = [...new Set(Object.values(names).map((h) => h.currency).filter(Boolean))];
  const weightTotal = rows.reduce((s, r) => s + (parseWeight(r.weight) || 0), 0);

  const chartRows = useMemo(() => {
    if (!analysis || !config || !result) return [];
    // Holdings rebased to 100 on the portfolio's start date, for the optional overlay
    const base = config.holdings.map((h) => {
      const pts = result.data[h.symbol].points;
      const first = pts.find((p) => p.date >= analysis.start) ?? pts[0];
      return { pts, first: first.close, j: 0, last: first.close };
    });
    return analysis.path.map((p) => {
      const row: Record<string, number | string> = { date: p.date, portfolio: Math.round(p.value * 100) / 100 };
      base.forEach((b, k) => {
        while (b.j < b.pts.length && b.pts[b.j].date <= p.date) b.last = b.pts[b.j++].close;
        row[`h${k}`] = Math.round((b.last / b.first) * 10000) / 100;
      });
      return row;
    });
  }, [analysis, config, result]);

  function downloadCsv() {
    if (!analysis) return;
    const q = (s: string) => `"${s.replace(/"/g, '""')}"`;
    const lines = [
      "FinancePlots portfolio analysis — historical figures, not a forecast",
      `Period,${analysis.start} to ${analysis.end}`,
      `Risk-free rate %,${rf}`,
      "",
      "Metric,Value",
      `Change over the period %,${analysis.change_pct.toFixed(2)}`,
      `Annualised return %,${analysis.annualised_pct?.toFixed(2) ?? ""}`,
      `Volatility (annualised) %,${analysis.volatility_pct.toFixed(2)}`,
      `Sharpe ratio,${analysis.sharpe?.toFixed(2) ?? ""}`,
      `Largest fall from a high %,${analysis.max_drawdown.pct.toFixed(2)}`,
      `95% VaR (one ${analysis.periods_per_year === 52 ? "week" : "day"}) %,${analysis.var95_pct.toFixed(2)}`,
      `Average loss beyond VaR %,${analysis.cvar95_pct.toFixed(2)}`,
      "",
      "Holding,Name,Weight %,Change %,Annualised %,Volatility %,Largest fall %,Share of risk %",
      ...analysis.holdings.map((h) =>
        [h.symbol, q(names[h.symbol]?.name ?? ""), h.weight.toFixed(2), h.change_pct.toFixed(2), h.annualised_pct?.toFixed(2) ?? "", h.volatility_pct.toFixed(2), h.max_drawdown_pct.toFixed(2), h.risk_share_pct.toFixed(2)].join(","),
      ),
      "",
      "Date,Portfolio value (start = 100)",
      ...analysis.path.map((p) => `${p.date},${p.value.toFixed(4)}`),
    ];
    const blob = new Blob([lines.join("\n")], { type: "text/csv;charset=utf-8" });
    const a = document.createElement("a");
    a.href = URL.createObjectURL(blob);
    a.download = "portfolio-analysis.csv";
    a.click();
    URL.revokeObjectURL(a.href);
  }

  const periodWord = analysis?.periods_per_year === 52 ? "week" : "day";
  const spanYears = analysis ? (Date.parse(analysis.end) - Date.parse(analysis.start)) / 3.156e10 : 0;

  return (
    <div className="flex flex-col gap-6">
      {/* Inputs */}
      <div className="bg-[#0d1426] border border-gray-800 rounded-xl p-5 flex flex-col gap-5">
        <div>
          <div className="grid grid-cols-[1fr_110px_36px] gap-2 text-xs text-gray-400 font-medium mb-1.5">
            <span>Ticker</span>
            <span>Weight</span>
            <span />
          </div>
          <div className="flex flex-col gap-2">
            {rows.map((r, i) => (
              <div key={i} className="grid grid-cols-[1fr_110px_36px] gap-2 items-center">
                <input
                  aria-label={`Ticker ${i + 1}`}
                  value={r.symbol}
                  onChange={(e) => {
                    setRows(rows.map((x, j) => (j === i ? { ...x, symbol: e.target.value } : x)));
                    setFormError(null);
                  }}
                  onKeyDown={(e) => e.key === "Enter" && !e.nativeEvent.isComposing && analyse()}
                  placeholder="Yahoo Finance symbol"
                  autoCapitalize="characters"
                  autoComplete="off"
                  spellCheck={false}
                  className="min-w-0 bg-[#111827] border border-gray-700 focus:border-blue-500 rounded-lg px-3 py-2 text-white text-sm uppercase outline-none transition"
                />
                <div className="flex items-center bg-[#111827] border border-gray-700 focus-within:border-blue-500 rounded-lg px-3 py-2 transition">
                  <input
                    aria-label={`Weight ${i + 1}`}
                    value={r.weight}
                    inputMode="decimal"
                    onChange={(e) => {
                      setRows(rows.map((x, j) => (j === i ? { ...x, weight: e.target.value } : x)));
                      setFormError(null);
                    }}
                    onKeyDown={(e) => e.key === "Enter" && !e.nativeEvent.isComposing && analyse()}
                    placeholder="0"
                    className="bg-transparent text-white text-sm w-full outline-none text-right tabular-nums"
                  />
                  <span className="text-gray-500 text-sm ml-1">%</span>
                </div>
                <button
                  type="button"
                  onClick={() => setRows(rows.length > 1 ? rows.filter((_, j) => j !== i) : [{ symbol: "", weight: "" }])}
                  aria-label={`Remove row ${i + 1}`}
                  className="h-9 rounded-lg text-gray-500 hover:text-white hover:bg-white/5 transition"
                >
                  ×
                </button>
              </div>
            ))}
          </div>
          <div className="flex flex-wrap items-center gap-3 mt-3 text-xs">
            <button
              type="button"
              disabled={rows.length >= MAX_HOLDINGS}
              onClick={() => setRows([...rows, { symbol: "", weight: "" }])}
              className="text-blue-400 hover:text-blue-300 disabled:text-gray-600 font-semibold transition"
            >
              + Add holding
            </button>
            <button
              type="button"
              onClick={() => {
                const filled = rows.filter((r) => r.symbol.trim());
                if (!filled.length) return;
                const each = Math.round((100 / filled.length) * 100) / 100;
                setRows(rows.map((r) => (r.symbol.trim() ? { ...r, weight: String(each) } : r)));
              }}
              className="text-blue-400 hover:text-blue-300 font-semibold transition"
            >
              Equal weights
            </button>
            <span className={`ml-auto tabular-nums ${Math.abs(weightTotal - 100) < 0.01 || weightTotal === 0 ? "text-gray-500" : "text-amber-300"}`}>
              Total {weightTotal.toLocaleString("en-GB", { maximumFractionDigits: 2 })}%
              {weightTotal > 0 && Math.abs(weightTotal - 100) >= 0.01 && " — scaled to 100%"}
            </span>
          </div>
          <p className="text-xs text-gray-500 mt-2">
            Up to {MAX_HOLDINGS} stocks, ETFs or indices. Outside the US add the exchange suffix: .MC Madrid, .L London, .PA Paris, .DE Xetra.
          </p>
        </div>

        <div className="flex flex-wrap items-end gap-4">
          <div>
            <span className="text-xs text-gray-400 font-medium">Period</span>
            <div className="flex gap-1 bg-[#111827] border border-gray-700 rounded-lg p-1 mt-1" role="group" aria-label="Period">
              {RANGES.map((r) => (
                <button
                  key={r}
                  type="button"
                  onClick={() => {
                    setRange(r);
                    if (config) setConfig({ ...config, range: r });
                  }}
                  aria-pressed={range === r}
                  className={`px-3 py-1.5 rounded-md text-xs font-semibold transition ${range === r ? "bg-blue-600 text-white" : "text-gray-400 hover:text-white"}`}
                >
                  {RANGE_LABELS[r]}
                </button>
              ))}
            </div>
          </div>
          <div>
            <label htmlFor="rf" className="text-xs text-gray-400 font-medium">Risk-free rate</label>
            <div className="flex items-center bg-[#111827] border border-gray-700 focus-within:border-blue-500 rounded-lg px-3 py-2 mt-1 w-28 transition">
              <input
                id="rf"
                value={riskFree}
                inputMode="decimal"
                onChange={(e) => setRiskFree(e.target.value)}
                className="bg-transparent text-white text-sm w-full outline-none text-right tabular-nums"
              />
              <span className="text-gray-500 text-sm ml-1">%</span>
            </div>
          </div>
          <button
            type="button"
            onClick={analyse}
            disabled={loading}
            className="bg-blue-600 hover:bg-blue-500 disabled:opacity-50 text-white font-semibold px-6 py-2.5 rounded-lg text-sm transition"
          >
            {loading ? "Loading…" : "Analyse portfolio"}
          </button>
          <p className="text-xs text-gray-500 basis-full">{riskFreeNote} Used only for the Sharpe ratio.</p>
        </div>
      </div>

      {formError && <p className="text-sm text-red-300 bg-red-500/10 border border-red-500/30 rounded-lg px-4 py-3">{formError}</p>}
      {!loading && result && result.failed.length > 0 && (
        <p className="text-sm text-red-300 bg-red-500/10 border border-red-500/30 rounded-lg px-4 py-3">
          No price data for {result.failed.join(", ")}. Check the ticker and its exchange suffix, or remove it — the
          portfolio isn&apos;t calculated with a holding missing, because the other weights would silently change.
        </p>
      )}
      {!config && !formError && (
        <div className="border border-dashed border-gray-800 rounded-xl p-10 text-center text-gray-500 text-sm">
          Add your holdings and their weights, then analyse the portfolio.
        </div>
      )}
      {loading && !analysis && <div className="h-[460px] bg-[#0d1426] border border-gray-800 rounded-xl animate-pulse" />}
      {!loading && config && result && !result.failed.length && !analysis && (
        <p className="text-sm text-amber-200 bg-amber-500/10 border border-amber-500/30 rounded-lg px-4 py-3">
          Not enough shared price history to analyse. Try a longer period.
        </p>
      )}

      {analysis && config && (
        <div className={`flex flex-col gap-6 transition-opacity ${loading ? "opacity-50" : ""}`}>
          <div className="flex flex-wrap items-end justify-between gap-3">
            <p className="text-sm text-gray-400">
              {fmtDate(analysis.start)} → {fmtDate(analysis.end)} · {config.holdings.length} holding{config.holdings.length > 1 ? "s" : ""}, weights held constant
            </p>
            <button onClick={downloadCsv} className="text-sm text-blue-400 hover:text-blue-300 border border-gray-700 hover:border-blue-500 px-4 py-2 rounded-lg transition">
              Download CSV
            </button>
          </div>

          <div className="grid grid-cols-2 lg:grid-cols-3 xl:grid-cols-6 gap-3">
            <Stat label="Change" value={pct(analysis.change_pct)} sub="over the period" />
            <Stat label="Annualised return" value={pct(analysis.annualised_pct)} sub={analysis.annualised_pct === null ? "needs a year or more" : "compound, per year"} />
            <Stat label="Volatility" value={pct(analysis.volatility_pct, 1, false)} sub="annualised" />
            <Stat
              label="Sharpe ratio"
              value={analysis.sharpe === null ? "—" : analysis.sharpe.toFixed(2)}
              sub={analysis.sharpe === null ? "needs a year or more" : `return above ${Number.isFinite(rf) ? rf : 0}%, per unit of volatility`}
            />
            <Stat
              label="Largest fall"
              value={pct(analysis.max_drawdown.pct)}
              sub={`${fmtDate(analysis.max_drawdown.peak, false)} → ${fmtDate(analysis.max_drawdown.trough, false)}`}
            />
            <Stat
              label={`95% VaR, 1 ${periodWord}`}
              value={`−${analysis.var95_pct.toFixed(1)}%`}
              sub={`1 ${periodWord} in 20 lost more than this`}
            />
          </div>

          {/* Portfolio value */}
          <div className="bg-[#0d1426] border border-gray-800 rounded-xl p-5">
            <div className="flex flex-wrap items-center justify-between gap-3 mb-4">
              <h2 className="text-white font-bold">Portfolio value (start = 100)</h2>
              <label className="flex items-center gap-2 text-xs text-gray-400 cursor-pointer">
                <input type="checkbox" checked={showHoldings} onChange={(e) => setShowHoldings(e.target.checked)} className="accent-blue-500" />
                Show each holding
              </label>
            </div>
            <ResponsiveContainer width="100%" height={340}>
              <LineChart data={chartRows} margin={{ top: 5, right: 10, bottom: 5, left: 0 }}>
                <CartesianGrid stroke="rgba(255,255,255,0.05)" vertical={false} />
                <XAxis
                  dataKey="date"
                  stroke="#374151"
                  tick={{ fill: "#6b7280", fontSize: 11 }}
                  tickFormatter={(d: string) => (spanYears > 15 ? d.slice(0, 4) : spanYears > 1.5 ? `${MONTHS[+d.slice(5, 7) - 1]} ${d.slice(2, 4)}` : fmtDate(d, false))}
                  minTickGap={40}
                />
                <YAxis stroke="#374151" tick={{ fill: "#6b7280", fontSize: 11 }} domain={["auto", "auto"]} scale={spanYears > 15 ? "log" : "auto"} width={52} />
                <ReferenceLine y={100} stroke="#4b5563" strokeDasharray="3 3" />
                <Tooltip
                  contentStyle={{ backgroundColor: "#111827", border: "1px solid #1e293b", borderRadius: "8px", color: "#f1f5f9", fontSize: 12 }}
                  labelFormatter={(d) => fmtDate(String(d))}
                  formatter={(v, key) => [Number(v).toFixed(1), key === "portfolio" ? "Portfolio" : config.holdings[Number(String(key).slice(1))]?.symbol]}
                />
                {showHoldings &&
                  config.holdings.map((h, k) => (
                    <Line key={h.symbol} dataKey={`h${k}`} stroke={COLORS[k]} strokeDasharray={DASHES[k % 4]} strokeWidth={1.25} strokeOpacity={0.8} dot={false} isAnimationActive={false} />
                  ))}
                <Line dataKey="portfolio" stroke="#f1f5f9" strokeWidth={2.5} dot={false} isAnimationActive={false} />
              </LineChart>
            </ResponsiveContainer>
            {showHoldings && (
              <div className="flex flex-wrap gap-x-5 gap-y-1 mt-2 text-xs text-gray-400">
                <span className="flex items-center gap-2"><span className="w-5 h-0.5 bg-slate-100" />Portfolio</span>
                {config.holdings.map((h, k) => (
                  <span key={h.symbol} className="flex items-center gap-2">
                    <svg width="20" height="6" aria-hidden="true"><line x1="0" y1="3" x2="20" y2="3" stroke={COLORS[k]} strokeWidth="2" strokeDasharray={DASHES[k % 4]} /></svg>
                    {h.symbol}
                  </span>
                ))}
              </div>
            )}
          </div>

          <div className="grid lg:grid-cols-2 gap-6">
            {/* Weight vs share of risk */}
            <div className="bg-[#0d1426] border border-gray-800 rounded-xl p-5">
              <h2 className="text-white font-bold mb-1">Weight vs share of risk</h2>
              <p className="text-xs text-gray-500 mb-4">
                A holding&apos;s share of the portfolio&apos;s ups and downs can be far from its weight. Diversification brought
                volatility down to {analysis.volatility_pct.toFixed(1)}%, against {analysis.undiversified_volatility_pct.toFixed(1)}% if
                the holdings had moved in lockstep.
              </p>
              <ResponsiveContainer width="100%" height={Math.max(180, config.holdings.length * 52 + 60)}>
                <BarChart
                  layout="vertical"
                  data={analysis.holdings.map((h) => ({ name: h.symbol, weight: Math.round(h.weight * 10) / 10, risk: Math.round(h.risk_share_pct * 10) / 10 }))}
                  margin={{ top: 0, right: 20, bottom: 0, left: 0 }}
                  barGap={2}
                >
                  <CartesianGrid stroke="rgba(255,255,255,0.05)" horizontal={false} />
                  <XAxis type="number" stroke="#374151" tick={{ fill: "#6b7280", fontSize: 11 }} tickFormatter={(v) => `${v}%`} />
                  <YAxis type="category" dataKey="name" stroke="#374151" tick={{ fill: "#9ca3af", fontSize: 11 }} width={72} />
                  <ReferenceLine x={0} stroke="#4b5563" />
                  <Tooltip
                    cursor={{ fill: "rgba(255,255,255,0.03)" }}
                    contentStyle={{ backgroundColor: "#111827", border: "1px solid #1e293b", borderRadius: "8px", color: "#f1f5f9", fontSize: 12 }}
                    formatter={(v, key) => [`${v}%`, key === "weight" ? "Weight" : "Share of risk"]}
                  />
                  <Legend wrapperStyle={{ fontSize: 12, color: "#9ca3af" }} formatter={(v) => (v === "weight" ? "Weight" : "Share of risk")} />
                  <Bar dataKey="weight" fill="#64748b" radius={[0, 4, 4, 0]} maxBarSize={18} isAnimationActive={false} />
                  <Bar dataKey="risk" fill="#3987e5" radius={[0, 4, 4, 0]} maxBarSize={18} isAnimationActive={false} />
                </BarChart>
              </ResponsiveContainer>
            </div>

            {/* Risk vs return */}
            <div className="bg-[#0d1426] border border-gray-800 rounded-xl p-5">
              <h2 className="text-white font-bold mb-1">Volatility vs {analysis.annualised_pct === null ? "change" : "annualised return"}</h2>
              <p className="text-xs text-gray-500 mb-4">Each holding, and the portfolio as a whole (white).</p>
              <ResponsiveContainer width="100%" height={Math.max(180, config.holdings.length * 52 + 60)}>
                <ScatterChart margin={{ top: 10, right: 20, bottom: 10, left: 0 }}>
                  <CartesianGrid stroke="rgba(255,255,255,0.05)" />
                  <XAxis type="number" dataKey="x" name="Volatility" stroke="#374151" tick={{ fill: "#6b7280", fontSize: 11 }} tickFormatter={(v) => `${v}%`} domain={[0, "auto"]} />
                  <YAxis type="number" dataKey="y" name="Return" stroke="#374151" tick={{ fill: "#6b7280", fontSize: 11 }} tickFormatter={(v) => `${v}%`} width={52} />
                  <ZAxis range={[90, 90]} />
                  <ReferenceLine y={0} stroke="#4b5563" />
                  <Tooltip
                    cursor={{ strokeDasharray: "3 3" }}
                    contentStyle={{ backgroundColor: "#111827", border: "1px solid #1e293b", borderRadius: "8px", color: "#f1f5f9", fontSize: 12 }}
                    formatter={(v, key) => [`${Number(v).toFixed(1)}%`, key]}
                    labelFormatter={() => ""}
                  />
                  {analysis.holdings.map((h, k) => (
                    <Scatter
                      key={h.symbol}
                      name={h.symbol}
                      data={[{ x: Math.round(h.volatility_pct * 10) / 10, y: Math.round((h.annualised_pct ?? h.change_pct) * 10) / 10 }]}
                      fill={COLORS[k]}
                      isAnimationActive={false}
                    />
                  ))}
                  <Scatter
                    name="Portfolio"
                    data={[{ x: Math.round(analysis.volatility_pct * 10) / 10, y: Math.round((analysis.annualised_pct ?? analysis.change_pct) * 10) / 10 }]}
                    fill="#f1f5f9"
                    shape="diamond"
                    isAnimationActive={false}
                  />
                  <Legend wrapperStyle={{ fontSize: 12, color: "#9ca3af" }} />
                </ScatterChart>
              </ResponsiveContainer>
            </div>
          </div>

          {/* Holdings table */}
          <div className="bg-[#0d1426] border border-gray-800 rounded-xl p-5 overflow-x-auto">
            <table className="w-full text-sm tabular-nums">
              <thead>
                <tr className="border-b border-gray-700 text-xs text-gray-400 uppercase tracking-wider">
                  <th className="text-left py-2 pr-4 font-semibold">Holding</th>
                  <th className="text-right py-2 px-3 font-semibold">Weight</th>
                  <th className="text-right py-2 px-3 font-semibold">Change</th>
                  <th className="text-right py-2 px-3 font-semibold">Annualised</th>
                  <th className="text-right py-2 px-3 font-semibold">Volatility</th>
                  <th className="text-right py-2 px-3 font-semibold">Largest fall</th>
                  <th className="text-right py-2 pl-3 font-semibold">Share of risk</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-800">
                {analysis.holdings.map((h, k) => (
                  <tr key={h.symbol}>
                    <td className="py-2.5 pr-4">
                      <span className="flex items-center gap-2">
                        <span className="w-2.5 h-2.5 rounded-sm shrink-0" style={{ background: COLORS[k] }} />
                        <span className="text-white font-semibold">{h.symbol}</span>
                        <span className="text-gray-500 text-xs truncate max-w-[200px]">{names[h.symbol]?.name}</span>
                      </span>
                    </td>
                    <td className="py-2.5 px-3 text-right text-white">{h.weight.toFixed(1)}%</td>
                    <td className="py-2.5 px-3 text-right text-white">{pct(h.change_pct)}</td>
                    <td className="py-2.5 px-3 text-right text-white">{pct(h.annualised_pct)}</td>
                    <td className="py-2.5 px-3 text-right text-white">{h.volatility_pct.toFixed(1)}%</td>
                    <td className="py-2.5 px-3 text-right text-white">{h.max_drawdown_pct.toFixed(1)}%</td>
                    <td className="py-2.5 pl-3 text-right text-white">{h.risk_share_pct.toFixed(1)}%</td>
                  </tr>
                ))}
              </tbody>
            </table>
            <p className="text-xs text-gray-600 mt-3">
              {analysis.periods_per_year === 52 ? "Weekly" : "Daily"} closes from Yahoo Finance, delayed, from the first date every holding has a price.
              {currencies.length > 1 ? ` Each holding moves in its own currency (${currencies.join(", ")}); currency swings aren't included.` : ""}
              {" "}On days one market was closed, its last price is carried forward. Past prices say nothing about future returns.
            </p>
          </div>

          <details className="bg-[#0d1426] border border-gray-800 rounded-xl p-5 text-sm text-gray-400">
            <summary className="text-white font-bold cursor-pointer">How these figures are worked out</summary>
            <ul className="mt-3 space-y-2 leading-relaxed list-disc pl-5">
              <li><strong className="text-gray-200">Weights held constant:</strong> the portfolio is rebalanced back to your weights every {periodWord}, the usual assumption for risk figures. A portfolio left alone would drift towards whatever rose most.</li>
              <li><strong className="text-gray-200">Annualised return:</strong> the compound yearly rate that turns the start value into the end value. Only shown for a year or more, where annualising doesn&apos;t exaggerate.</li>
              <li><strong className="text-gray-200">Volatility:</strong> standard deviation of {periodWord}ly returns, scaled to a year (×√{analysis.periods_per_year}).</li>
              <li><strong className="text-gray-200">Sharpe ratio:</strong> (annualised return − risk-free rate) ÷ volatility — how much return above cash the portfolio earned per unit of volatility.</li>
              <li><strong className="text-gray-200">95% VaR:</strong> historical, not modelled. In 5% of {periodWord}s the portfolio lost more than this; on those {periodWord}s the average loss was {analysis.cvar95_pct.toFixed(1)}%. The worst single {periodWord} was {analysis.worst_period.pct.toFixed(1)}% on {fmtDate(analysis.worst_period.date)}. It is not a maximum.</li>
              <li><strong className="text-gray-200">Share of risk:</strong> each holding&apos;s contribution to the portfolio&apos;s variance, weight × covariance with the portfolio ÷ portfolio variance. The shares add up to 100%; one can be negative if it tended to move against the rest.</li>
            </ul>
          </details>
        </div>
      )}
    </div>
  );
}
