"use client";

import { useCallback, useEffect, useState, type FormEvent, type KeyboardEvent } from "react";
import { Area, CartesianGrid, ComposedChart, Line, ResponsiveContainer, Tooltip, XAxis, YAxis } from "recharts";
import { PRICE_RANGES, SYMBOL_PATTERN, type PriceHistory, type PriceRange } from "@/lib/price-types";

// Neutral by construction, like the stock screener: nothing is shown until the
// visitor enters a ticker, no ticker is suggested or featured, and moves are
// shown with ▲/▼ in one colour — never green/red, which reads as good/bad.

const RANGE_LABELS: Record<PriceRange, string> = { "1m": "1M", "6m": "6M", "1y": "1Y", "5y": "5Y", max: "Max" };
const MONTHS = ["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"];

const ERRORS: Record<string, string> = {
  invalid_symbol: "That doesn't look like a ticker. Use letters, digits and . - ^ = only, e.g. a Yahoo Finance symbol.",
  unknown_symbol: "No price data found for that ticker. Outside the US, add the exchange suffix (.MC Madrid, .L London, .PA Paris, .DE Xetra).",
  unavailable: "Price data is temporarily unavailable. Try again in a minute.",
};

function fmtDate(iso: string, withDay = true) {
  const [y, m, d] = iso.split("-");
  return withDay ? `${+d} ${MONTHS[+m - 1]} ${y}` : `${MONTHS[+m - 1]} ${y}`;
}

// One precision per instrument, from its latest price, so a share that once traded
// at 2.34 and now at 12.69 doesn't show 2.3375 next to 12.93. FX needs 4.
function fmtPrice(v: number, currency: string, dp: number) {
  const n = v.toLocaleString("en-GB", { minimumFractionDigits: dp, maximumFractionDigits: dp });
  return currency ? `${n} ${currency}` : n;
}

function fmtPct(v: number) {
  // Over long periods a percentage stops being readable (+261,887%); show the multiple instead
  if (v >= 1000) return `▲ ×${(1 + v / 100).toLocaleString("en-GB", { maximumFractionDigits: v >= 10000 ? 0 : 1 })}`;
  return `${v > 0 ? "▲ +" : v < 0 ? "▼ " : ""}${v.toFixed(1)}%`;
}

function Stat({ label, value, sub }: { label: string; value: string; sub?: string }) {
  return (
    <div className="bg-[#0d1426] border border-gray-800 rounded-xl p-4">
      <div className="text-xs text-gray-400 uppercase tracking-wider font-semibold mb-1">{label}</div>
      <div className="text-xl font-extrabold text-white leading-tight tabular-nums">{value}</div>
      {sub && <div className="text-xs text-gray-500 mt-1">{sub}</div>}
    </div>
  );
}

export default function StockAnalysis({ initialSymbol, initialRange }: { initialSymbol: string | null; initialRange: PriceRange }) {
  const [input, setInput] = useState(initialSymbol ?? "");
  const [symbol, setSymbol] = useState<string | null>(initialSymbol);
  const [range, setRange] = useState<PriceRange>(initialRange);
  const [data, setData] = useState<PriceHistory | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [showMa, setShowMa] = useState(true);

  const load = useCallback(async (s: string, r: PriceRange) => {
    setLoading(true);
    setError(null);
    try {
      const res = await fetch(`/api/prices?symbol=${encodeURIComponent(s)}&range=${r}`);
      const json = await res.json();
      if (!res.ok) {
        setData(null);
        setError(ERRORS[json.error] ?? ERRORS.unavailable);
        return;
      }
      setData(json as PriceHistory);
      const url = new URL(window.location.href);
      url.searchParams.set("symbol", s);
      url.searchParams.set("range", r);
      window.history.replaceState(null, "", url);
    } catch {
      setError(ERRORS.unavailable);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    if (symbol) load(symbol, range);
  }, [symbol, range, load]);

  function submit(e: FormEvent | KeyboardEvent) {
    e.preventDefault();
    const s = input.trim().toUpperCase();
    if (!s) return setError("Enter a ticker first.");
    if (!SYMBOL_PATTERN.test(s)) return setError(ERRORS.invalid_symbol);
    if (s === symbol && data) return;
    setSymbol(s);
  }

  const stats = data?.stats;
  const daily = data?.interval === "1d";
  const dp = stats && stats.last_close < 10 ? 4 : 2;
  const spanYears = data ? (Date.parse(stats!.last_date) - Date.parse(stats!.first_date)) / 3.156e10 : 0;

  return (
    <div className="flex flex-col gap-6">
      {/* Ticker + range */}
      <form onSubmit={submit} className="bg-[#0d1426] border border-gray-800 rounded-xl p-5 flex flex-col md:flex-row md:items-end gap-4">
        <div className="flex-1">
          <label htmlFor="ticker" className="text-xs text-gray-400 font-medium">Ticker</label>
          <div className="flex gap-2 mt-1">
            <input
              id="ticker"
              value={input}
              onChange={(e) => {
                setInput(e.target.value);
                setError(null);
              }}
              // Explicit, so Enter works even where implicit form submission doesn't fire
              onKeyDown={(e) => {
                if (e.key === "Enter" && !e.nativeEvent.isComposing) submit(e);
              }}
              placeholder="Yahoo Finance symbol"
              autoCapitalize="characters"
              autoComplete="off"
              spellCheck={false}
              className="flex-1 min-w-0 bg-[#111827] border border-gray-700 focus:border-blue-500 rounded-lg px-3 py-2 text-white text-sm uppercase outline-none transition"
            />
            <button type="submit" disabled={loading} className="bg-blue-600 hover:bg-blue-500 disabled:opacity-50 text-white font-semibold px-5 py-2 rounded-lg text-sm transition">
              Show
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

      {!symbol && !error && (
        <div className="border border-dashed border-gray-800 rounded-xl p-10 text-center text-gray-500 text-sm">
          Enter a ticker to see its price history.
        </div>
      )}

      {symbol && loading && !data && <div className="h-[460px] bg-[#0d1426] border border-gray-800 rounded-xl animate-pulse" />}

      {data && stats && (
        <div className={`flex flex-col gap-6 transition-opacity ${loading ? "opacity-50" : ""}`}>
          <div className="flex flex-wrap items-end justify-between gap-3">
            <div>
              <h2 className="text-2xl font-extrabold text-white">{data.name}</h2>
              <p className="text-gray-400 text-sm">
                {data.symbol}
                {data.exchange && ` · ${data.exchange}`}
                {data.currency && ` · ${data.currency}`}
              </p>
            </div>
            <div className="text-right">
              <div className="text-3xl font-extrabold text-white tabular-nums">{fmtPrice(stats.last_close, data.currency, dp)}</div>
              <div className="text-xs text-gray-500">Close, {fmtDate(stats.last_date)}</div>
            </div>
          </div>

          <div className="grid grid-cols-2 lg:grid-cols-5 gap-3">
            <Stat label={`Change, ${RANGE_LABELS[data.range]}`} value={fmtPct(stats.change_pct)} sub={`since ${fmtDate(stats.first_date)}`} />
            <Stat label={daily ? "Highest close" : "Highest weekly close"} value={fmtPrice(stats.high.close, "", dp)} sub={fmtDate(stats.high.date)} />
            <Stat label={daily ? "Lowest close" : "Lowest weekly close"} value={fmtPrice(stats.low.close, "", dp)} sub={fmtDate(stats.low.date)} />
            <Stat
              label="vs 200-day avg"
              value={stats.vs_ma200_pct === null ? "—" : fmtPct(stats.vs_ma200_pct)}
              sub={stats.vs_ma200_pct === null ? "not shown on Max" : "last close vs average"}
            />
            <Stat
              label="Volatility"
              value={stats.volatility_pct === null ? "—" : `${stats.volatility_pct.toFixed(1)}%`}
              sub={stats.volatility_pct === null ? "daily ranges only" : "annualised, daily returns"}
            />
          </div>

          <div className="bg-[#0d1426] border border-gray-800 rounded-xl p-5">
            <div className="flex flex-wrap items-center justify-between gap-3 mb-4">
              <div className="flex items-center gap-4 text-xs text-gray-400">
                <span className="flex items-center gap-1.5"><span className="w-4 h-0.5 bg-blue-500" />Close</span>
                {daily && showMa && (
                  <span className="flex items-center gap-1.5"><span className="w-4 border-t-2 border-dashed border-gray-400" />200-day average</span>
                )}
              </div>
              {daily && (
                <label className="flex items-center gap-2 text-xs text-gray-400 cursor-pointer">
                  <input type="checkbox" checked={showMa} onChange={(e) => setShowMa(e.target.checked)} className="accent-blue-500" />
                  Show 200-day average
                </label>
              )}
            </div>
            <ResponsiveContainer width="100%" height={380}>
              <ComposedChart data={data.points} margin={{ top: 5, right: 10, bottom: 5, left: 0 }}>
                <defs>
                  <linearGradient id="closeFill" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="0%" stopColor="#3b82f6" stopOpacity={0.25} />
                    <stop offset="100%" stopColor="#3b82f6" stopOpacity={0} />
                  </linearGradient>
                </defs>
                <CartesianGrid stroke="rgba(255,255,255,0.05)" vertical={false} />
                <XAxis
                  dataKey="date"
                  stroke="#374151"
                  tick={{ fill: "#6b7280", fontSize: 11 }}
                  tickFormatter={(d: string) =>
                    spanYears > 15 ? d.slice(0, 4) : spanYears > 1.5 ? `${MONTHS[+d.slice(5, 7) - 1]} ${d.slice(2, 4)}` : fmtDate(d, data.range === "1m")
                  }
                  minTickGap={40}
                />
                <YAxis
                  stroke="#374151"
                  tick={{ fill: "#6b7280", fontSize: 11 }}
                  domain={["auto", "auto"]}
                  scale={spanYears > 15 ? "log" : "auto"}
                  tickFormatter={(v: number) => v.toLocaleString("en-GB", { maximumFractionDigits: v < 10 ? 3 : 0 })}
                  width={64}
                />
                <Tooltip
                  contentStyle={{ backgroundColor: "#111827", border: "1px solid #1e293b", borderRadius: "8px", color: "#f1f5f9", fontSize: 12 }}
                  labelFormatter={(d) => fmtDate(String(d))}
                  formatter={(v, name) => [fmtPrice(Number(v), data.currency, dp), name === "ma200" ? "200-day average" : "Close"]}
                />
                <Area type="monotone" dataKey="close" stroke="#3b82f6" strokeWidth={2} fill="url(#closeFill)" dot={false} isAnimationActive={false} />
                {daily && showMa && (
                  <Line type="monotone" dataKey="ma200" stroke="#9ca3af" strokeWidth={1.5} strokeDasharray="6 4" dot={false} isAnimationActive={false} connectNulls />
                )}
              </ComposedChart>
            </ResponsiveContainer>
            <p className="text-xs text-gray-600 mt-3">
              {data.interval === "1wk" ? "Weekly closing prices, log scale over long periods," : "Daily closing prices"} from Yahoo Finance, delayed. Past prices say nothing about future returns.
            </p>
          </div>
        </div>
      )}
    </div>
  );
}
