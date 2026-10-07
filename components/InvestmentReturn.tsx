"use client";

import { useEffect, useMemo, useState } from "react";
import { useLocale, useTranslations } from "next-intl";
import { Area, CartesianGrid, ComposedChart, Legend, Line, ReferenceLine, ResponsiveContainer, Tooltip, XAxis, YAxis } from "recharts";
import CurrencyPicker, { useCurrency } from "@/components/CurrencyPicker";
import TickerSearch from "@/components/TickerSearch";
import { investmentReturnChart } from "@/lib/charts/tool-charts";
import { CURRENCY_CODES } from "@/lib/currency";
import {
  checkFlows,
  encodeFlows,
  investmentReturn,
  netInvestedSteps,
  parseAmount,
  parseFlowsText,
  rangeFor,
  replayFlows,
  type ClosePoint,
  type DatedFlow,
} from "@/lib/investment-return";
import { trackEvent } from "@/lib/analytics";
import { convertPoints, majorCurrency } from "@/lib/portfolio-stats";
import { normaliseSymbol, type PriceHistory } from "@/lib/price-types";

// The maths lives in lib/investment-return.ts, shared with the MCP tool
// investment_return. The comparison follows the stock tools' neutrality: no
// index is chosen for the visitor, the difference is shown with ▲/▼ rather
// than green/red, and nothing is graded. Colours follow series position.

const SERIES_COLOURS = ["#3987e5", "#d95926"];

/** Indices offered for the comparison, in a fixed order; "Other" takes any ticker. */
const INDICES: { symbol: string; label: string }[] = [
  { symbol: "^GSPC", label: "S&P 500" },
  { symbol: "^NDX", label: "Nasdaq-100" },
  { symbol: "^DJI", label: "Dow Jones" },
  { symbol: "^FTSE", label: "FTSE 100" },
  { symbol: "^STOXX50E", label: "Euro Stoxx 50" },
  { symbol: "^GDAXI", label: "DAX" },
  { symbol: "^IBEX", label: "IBEX 35" },
  { symbol: "^N225", label: "Nikkei 225" },
];
const OTHER = "other";
const MAX_ROWS = 200;

interface Row {
  id: number;
  date: string;
  dir: "in" | "out";
  amount: string;
}

let nextId = 1;
const toRow = (f: DatedFlow): Row => ({ id: nextId++, date: f.date, dir: f.amount < 0 ? "out" : "in", amount: String(Math.abs(f.amount)) });

function KpiCard({ label, value, sub }: { label: string; value: string; sub: string }) {
  return (
    <div className="bg-[#0d1426] border border-gray-800 border-l-4 border-l-blue-500 rounded-xl p-4">
      <div className="text-xs text-gray-400 uppercase tracking-wider font-semibold mb-1">{label}</div>
      <div className="text-2xl font-extrabold text-white leading-tight">{value}</div>
      <div className="text-xs text-gray-500 mt-1">{sub}</div>
    </div>
  );
}

type Prices = { key: string; history: PriceHistory | null; points: ClosePoint[] | null; error: "failed" | "fx" | null; fx: { from: string; to: string } | null };

export default function InvestmentReturn({
  initialFlows,
  initialValue,
  initialValueDate,
  initialCompare,
  today,
}: {
  initialFlows: DatedFlow[];
  initialValue: number | null;
  initialValueDate: string;
  initialCompare: string | null;
  today: string;
}) {
  const t = useTranslations("investmentReturn");
  const locale = useLocale();
  const decimal = locale === "es" ? "," : ".";
  const [currency] = useCurrency();
  const code = CURRENCY_CODES[currency];
  const nf = (n: number, dp = 0) => n.toLocaleString(locale === "es" ? "es-ES" : "en-GB", { minimumFractionDigits: dp, maximumFractionDigits: dp });
  const money = (n: number) => `${n < 0 ? "−" : ""}${currency}${nf(Math.abs(n))}`;
  const pct = (n: number) => `${n < 0 ? "−" : ""}${nf(Math.abs(n), 1)}%`;
  const dateText = (iso: string) =>
    new Date(`${iso}T00:00:00Z`).toLocaleDateString(locale === "es" ? "es-ES" : "en-GB", { day: "numeric", month: "short", year: "numeric", timeZone: "UTC" });

  const [rows, setRows] = useState<Row[]>(() => initialFlows.map(toRow));
  const [value, setValue] = useState(initialValue === null ? "" : String(initialValue));
  const [valueDate, setValueDate] = useState(initialValueDate);
  const [pasteOpen, setPasteOpen] = useState(false);
  const [pasteText, setPasteText] = useState("");
  const [pasteMsg, setPasteMsg] = useState<string | null>(null);
  const known = initialCompare && INDICES.some((i) => i.symbol === initialCompare);
  const [choice, setChoice] = useState<string>(initialCompare ? (known ? initialCompare : OTHER) : "");
  const [otherText, setOtherText] = useState(initialCompare && !known ? initialCompare : "");
  const [otherSymbol, setOtherSymbol] = useState<string | null>(initialCompare && !known ? initialCompare : null);
  const [copied, setCopied] = useState(false);

  // ── The visitor's own return ───────────────────────────────────────────────
  const flows: DatedFlow[] = useMemo(
    () =>
      rows
        .map((r) => ({ date: r.date, amount: parseAmount(r.amount, decimal) ?? NaN, dir: r.dir }))
        .filter((r) => r.date && Number.isFinite(r.amount) && r.amount > 0)
        .map((r) => ({ date: r.date, amount: r.dir === "out" ? -r.amount : r.amount })),
    [rows, decimal],
  );
  const valueNum = value.trim() === "" ? NaN : parseAmount(value, decimal) ?? NaN;
  const problem = checkFlows(flows, valueNum, valueDate) ?? (valueDate > today ? "future" : null);
  const result = useMemo(() => {
    if (problem) return null;
    const r = investmentReturn(flows, valueNum, valueDate);
    return r.years > 0 ? r : null;
  }, [flows, valueNum, valueDate, problem]);
  const sameDay = !problem && !result;

  // ── The same money in an index ─────────────────────────────────────────────
  const compareSymbol = choice === OTHER ? otherSymbol : choice || null;
  const compareName = INDICES.find((i) => i.symbol === compareSymbol)?.label ?? compareSymbol ?? "";
  const range = result ? rangeFor(result.firstDate, today) : null;
  const priceKey = compareSymbol && range ? `${compareSymbol}|${range}|${code}` : "";
  const [prices, setPrices] = useState<Prices | null>(null);

  useEffect(() => {
    if (!priceKey || !compareSymbol || !range) return;
    let current = true;
    const get = async (symbol: string): Promise<PriceHistory | null> => {
      try {
        const res = await fetch(`/api/prices?symbol=${encodeURIComponent(symbol)}&range=${range}`);
        return res.ok ? ((await res.json()) as PriceHistory) : null;
      } catch {
        return null;
      }
    };
    (async () => {
      const history = await get(compareSymbol);
      if (!history) {
        if (current) setPrices({ key: priceKey, history: null, points: null, error: "failed", fx: null });
        return;
      }
      const listing = majorCurrency(history.currency || code);
      let points: ClosePoint[] = convertPoints(history.points, null, listing.scale);
      let fx: Prices["fx"] = null;
      if (listing.code !== code) {
        const rate = await get(`${listing.code}${code}=X`);
        if (!rate) {
          if (current) setPrices({ key: priceKey, history, points: null, error: "fx", fx: { from: listing.code, to: code } });
          return;
        }
        points = convertPoints(history.points, rate.points, listing.scale);
        fx = { from: listing.code, to: code };
      }
      if (current) setPrices({ key: priceKey, history, points, error: null, fx });
    })();
    return () => {
      current = false;
    };
  }, [priceKey, compareSymbol, range, code]);

  const pricesReady = prices !== null && prices.key === priceKey;
  const replay = useMemo(() => {
    if (!result || !pricesReady || !prices.points) return null;
    return replayFlows(flows, prices.points, valueDate);
  }, [result, pricesReady, prices, flows, valueDate]);

  // ── Chart: the same sampling as the MCP tool's chart ───────────────────────
  const chartRows = useMemo(() => {
    if (!result) return [];
    const spec = investmentReturnChart(
      netInvestedSteps(flows),
      valueDate,
      valueNum,
      code,
      replay?.ok ? { label: "replay", path: replay.path } : undefined,
    );
    return spec.x.labels.map((label, i) => ({
      label,
      net: spec.series[0].values[i],
      replay: spec.series[1]?.values[i] ?? null,
    }));
  }, [result, flows, valueDate, valueNum, code, replay]);

  // Keep the URL shareable once there is a result.
  const shareQuery = useMemo(() => {
    if (!result) return null;
    const q = new URLSearchParams({ f: encodeFlows(flows), v: String(valueNum), on: valueDate });
    if (compareSymbol) q.set("vs", compareSymbol);
    const s = q.toString();
    return s.length < 1800 ? s : null;
  }, [result, flows, valueNum, valueDate, compareSymbol]);
  useEffect(() => {
    if (!shareQuery) return;
    const url = new URL(window.location.href);
    url.search = shareQuery;
    window.history.replaceState(null, "", url);
  }, [shareQuery]);

  async function copyLink() {
    try {
      await navigator.clipboard.writeText(window.location.href);
      setCopied(true);
      trackEvent("share_link");
      setTimeout(() => setCopied(false), 2000);
    } catch {
      // Clipboard blocked: the address bar has the same link.
    }
  }

  // ── Row editing ────────────────────────────────────────────────────────────
  const update = (id: number, patch: Partial<Row>) => setRows((rs) => rs.map((r) => (r.id === id ? { ...r, ...patch } : r)));
  const remove = (id: number) => setRows((rs) => rs.filter((r) => r.id !== id));
  const addRow = () => setRows((rs) => (rs.length >= MAX_ROWS ? rs : [...rs, { id: nextId++, date: "", dir: "in", amount: "" }]));

  function applyPaste(replace: boolean) {
    const { flows: parsed, skipped } = parseFlowsText(pasteText, decimal);
    if (parsed.length === 0) {
      setPasteMsg(t("pasteNone"));
      return;
    }
    setRows((rs) => [...(replace ? [] : rs.filter((r) => r.date || r.amount)), ...parsed.map(toRow)].slice(0, MAX_ROWS));
    setPasteMsg([t("pasteAdded", { count: parsed.length }), skipped > 0 ? t("pasteSkipped", { count: skipped }) : ""].filter(Boolean).join(" "));
    setPasteText("");
  }

  const input = "bg-[#111827] border border-gray-700 rounded-lg px-2.5 py-2 text-white text-sm outline-none focus:border-blue-500 min-w-0";
  const card = "bg-[#0d1426] border border-gray-800 rounded-xl p-5";
  const heading = "text-xs font-bold uppercase tracking-wider text-blue-400 mb-3";

  const problemText =
    problem === "future" ? t("problem.future") : problem && (problem !== "no_flows" || rows.some((r) => r.date || r.amount)) ? t(`problem.${problem}`) : null;
  const ar = result?.annualReturnPct ?? null;
  const theirs = replay?.ok ? replay.result.annualReturnPct : null;
  const diff = ar !== null && theirs !== null ? Math.round((ar - theirs) * 10) / 10 : null;

  return (
    <div className="flex flex-col lg:flex-row gap-6">
      {/* Inputs */}
      <aside className="lg:w-[29rem] shrink-0 flex flex-col gap-4">
        <div className={card}>
          <div className="flex items-center justify-between gap-3 mb-1">
            <h2 className={heading.replace(" mb-3", "")}>{t("sectionFlows")}</h2>
            <CurrencyPicker label={t("currency")} hideLabel />
          </div>
          <p className="text-xs text-gray-500 mb-3">{t("flowsHelp")}</p>
          <div className="flex flex-col gap-2">
            {rows.length > 0 && (
              <div className="hidden sm:flex gap-2 text-[11px] text-gray-500 uppercase tracking-wider">
                <span className="w-[9.5rem]">{t("colDate")}</span>
                <span className="w-[7rem]">{t("colType")}</span>
                <span>{t("colAmount")}</span>
              </div>
            )}
            {rows.map((r) => (
              // On a phone the amount wraps onto its own line under the date and type.
              <div key={r.id} className="flex flex-wrap gap-2 items-center pb-2 sm:pb-0 border-b border-gray-800 sm:border-0 last:border-0">
                <input type="date" value={r.date} max={today} onChange={(e) => update(r.id, { date: e.target.value })} aria-label={t("colDate")} className={`${input} w-[9.5rem]`} />
                <select value={r.dir} onChange={(e) => update(r.id, { dir: e.target.value as Row["dir"] })} aria-label={t("colType")} className={`${input} w-[7rem]`}>
                  <option value="in">{t("in")}</option>
                  <option value="out">{t("out")}</option>
                </select>
                <div className={`${input} flex items-center flex-1 min-w-[7rem]`}>
                  <span className="text-gray-500 mr-1 shrink-0">{currency}</span>
                  <input
                    inputMode="decimal"
                    value={r.amount}
                    onChange={(e) => update(r.id, { amount: e.target.value })}
                    aria-label={t("colAmount")}
                    className="bg-transparent w-full outline-none min-w-0"
                  />
                </div>
                <button type="button" onClick={() => remove(r.id)} aria-label={t("removeRow")} className="w-5 text-gray-500 hover:text-white text-lg leading-none">
                  ×
                </button>
              </div>
            ))}
          </div>
          <div className="flex flex-wrap gap-2 mt-3">
            <button type="button" onClick={addRow} className="text-sm text-blue-300 hover:text-white border border-gray-700 hover:border-blue-500 rounded-lg px-3 py-1.5 transition">
              {t("addRow")}
            </button>
            <button
              type="button"
              onClick={() => {
                setPasteOpen((o) => !o);
                setPasteMsg(null);
              }}
              aria-expanded={pasteOpen}
              className="text-sm text-gray-300 hover:text-white border border-gray-700 hover:border-blue-500 rounded-lg px-3 py-1.5 transition"
            >
              {t("pasteOpen")}
            </button>
            {rows.length > 0 && (
              <button type="button" onClick={() => setRows([])} className="text-sm text-gray-500 hover:text-white px-2 py-1.5 transition ml-auto">
                {t("clearAll")}
              </button>
            )}
          </div>
          {pasteOpen && (
            <div className="mt-3 flex flex-col gap-2">
              <p className="text-xs text-gray-500 leading-relaxed">{t("pasteHelp")}</p>
              <textarea
                value={pasteText}
                onChange={(e) => setPasteText(e.target.value)}
                rows={5}
                placeholder={t("pastePlaceholder")}
                aria-label={t("pasteOpen")}
                className="bg-[#111827] border border-gray-700 rounded-lg px-3 py-2 text-white text-sm font-mono outline-none focus:border-blue-500"
              />
              <div className="flex gap-2">
                <button type="button" onClick={() => applyPaste(false)} disabled={!pasteText.trim()} className="bg-blue-600 hover:bg-blue-500 disabled:opacity-40 text-white text-sm font-semibold rounded-lg px-3 py-1.5 transition">
                  {t("pasteAdd")}
                </button>
                <button type="button" onClick={() => applyPaste(true)} disabled={!pasteText.trim()} className="text-sm text-gray-300 hover:text-white border border-gray-700 rounded-lg px-3 py-1.5 transition disabled:opacity-40">
                  {t("pasteReplace")}
                </button>
              </div>
            </div>
          )}
          {pasteMsg && <p className="text-xs text-gray-400 mt-2" role="status">{pasteMsg}</p>}
        </div>

        <div className={card}>
          <h2 className={heading}>{t("sectionValue")}</h2>
          <div className="grid grid-cols-2 gap-2">
            <label className="flex flex-col gap-1 text-xs text-gray-400">
              {t("labelValue")}
              <div className={`${input} flex items-center`}>
                <span className="text-gray-500 mr-1 shrink-0">{currency}</span>
                <input inputMode="decimal" value={value} onChange={(e) => setValue(e.target.value)} className="bg-transparent w-full outline-none min-w-0" />
              </div>
            </label>
            <label className="flex flex-col gap-1 text-xs text-gray-400">
              {t("labelValueDate")}
              <input type="date" value={valueDate} max={today} onChange={(e) => setValueDate(e.target.value)} className={input} />
            </label>
          </div>
        </div>

        <div className={card}>
          <h2 className={heading}>{t("sectionCompare")}</h2>
          <p className="text-xs text-gray-500 mb-3 leading-relaxed">{t("compareHelp")}</p>
          <select value={choice} onChange={(e) => setChoice(e.target.value)} aria-label={t("sectionCompare")} className={`${input} w-full`}>
            <option value="">{t("compareNone")}</option>
            {INDICES.map((i) => (
              <option key={i.symbol} value={i.symbol}>
                {i.label}
              </option>
            ))}
            <option value={OTHER}>{t("compareOther")}</option>
          </select>
          {choice === OTHER && (
            <TickerSearch
              value={otherText}
              // Prices are fetched for a picked suggestion or on Enter, not on every keystroke.
              onChange={(v) => {
                setOtherText(v);
                setOtherSymbol(null);
              }}
              onPick={(symbol) => {
                setOtherText(symbol);
                setOtherSymbol(symbol);
              }}
              onEnter={() => setOtherSymbol(normaliseSymbol(otherText))}
              placeholder={t("compareOtherPlaceholder")}
              ariaLabel={t("compareOther")}
              className="mt-2"
            />
          )}
        </div>
      </aside>

      {/* Results */}
      <div className="flex-1 min-w-0 flex flex-col gap-6">
        {problemText && (
          <div className="bg-[#0d1426] border border-gray-700 rounded-xl p-4 text-sm text-gray-300" role="status">
            {problemText}
          </div>
        )}
        {sameDay && <div className="bg-[#0d1426] border border-gray-700 rounded-xl p-4 text-sm text-gray-300">{t("problem.same_day")}</div>}
        {!result && !problemText && !sameDay && (
          <div className="bg-[#0d1426] border border-gray-800 rounded-xl p-8 text-center text-gray-400 text-sm leading-relaxed">{t("empty")}</div>
        )}

        {result && (
          <>
            <div className="grid grid-cols-2 xl:grid-cols-4 gap-3">
              <KpiCard
                label={t("kpiAnnual")}
                value={ar === null ? t("na") : pct(ar)}
                sub={t("kpiAnnualSub", { from: dateText(result.firstDate), to: dateText(result.valueDate) })}
              />
              <KpiCard label={t("kpiGain")} value={money(result.gain)} sub={t("kpiGainSub")} />
              <KpiCard label={t("kpiSimple")} value={pct(result.simpleReturnPct)} sub={t("kpiSimpleSub", { total: money(result.totalIn) })} />
              <KpiCard label={t("kpiMultiple")} value={`${nf(result.multiple, 2)}×`} sub={t("kpiMultipleSub", { currency, x: nf(result.multiple, 2) })} />
            </div>

            <div className="bg-[#0d1426] border border-gray-800 rounded-xl p-5 text-sm text-gray-300 leading-relaxed">
              <h2 className="text-white font-bold mb-2">{t("explainTitle")}</h2>
              <p>{t("explain", { currency })}</p>
              {result.shortPeriod && <p className="mt-2 text-gray-400">{t("shortPeriod", { simple: pct(result.simpleReturnPct) })}</p>}
              {ar === null && <p className="mt-2 text-gray-400">{t("noRate")}</p>}
            </div>

            <div className="bg-[#0d1426] border border-gray-800 rounded-xl p-6">
              <h2 className="text-white font-bold mb-5">{t("chartTitle")}</h2>
              <ResponsiveContainer width="100%" height={340}>
                <ComposedChart data={chartRows} margin={{ top: 10, right: 20, bottom: 10, left: 10 }}>
                  <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.05)" />
                  <XAxis dataKey="label" stroke="#374151" tick={{ fill: "#6b7280", fontSize: 11 }} minTickGap={24} />
                  <YAxis
                    stroke="#374151"
                    tick={{ fill: "#6b7280", fontSize: 11 }}
                    tickFormatter={(v: number) => (Math.abs(v) >= 1e6 ? `${currency}${nf(v / 1e6, 1)}M` : `${currency}${nf(v / 1000, 0)}k`)}
                    width={64}
                  />
                  <Tooltip
                    contentStyle={{ backgroundColor: "#111827", border: "1px solid #1e293b", borderRadius: "8px", color: "#f1f5f9", fontSize: 12 }}
                    formatter={(v) => (v === null || v === undefined ? "–" : money(Number(v)))}
                  />
                  <Legend wrapperStyle={{ color: "#9ca3af", fontSize: 12, paddingTop: 12 }} />
                  <Area type="stepAfter" dataKey="net" name={t("seriesNet")} stroke={SERIES_COLOURS[0]} fill={SERIES_COLOURS[0]} fillOpacity={0.15} isAnimationActive={false} />
                  {replay?.ok && (
                    <Line type="monotone" dataKey="replay" name={t("seriesReplay", { name: compareName })} stroke={SERIES_COLOURS[1]} dot={false} strokeWidth={2} isAnimationActive={false} />
                  )}
                  <ReferenceLine y={valueNum} ifOverflow="extendDomain" stroke="#9ca3af" strokeDasharray="4 4" label={{ value: `${t("worthNow")}: ${money(valueNum)}`, fill: "#9ca3af", fontSize: 11, position: "insideTopLeft" }} />
                </ComposedChart>
              </ResponsiveContainer>
            </div>

            {compareSymbol && (
              <div className="bg-[#0d1426] border border-gray-800 rounded-xl p-5 text-sm">
                <h2 className="text-white font-bold mb-3">{t("compareTitle", { name: compareName })}</h2>
                {!pricesReady && <p className="text-gray-400">{t("compareLoading", { name: compareName })}</p>}
                {pricesReady && prices.error === "failed" && <p className="text-gray-400">{t("compareFailed", { name: compareName })}</p>}
                {pricesReady && prices.error === "fx" && prices.fx && <p className="text-gray-400">{t("compareFxFailed", prices.fx)}</p>}
                {replay && !replay.ok && (
                  <p className="text-gray-400">
                    {t(replay.problem === "history_too_short" ? "compareTooShort" : "compareTooLarge", { name: compareName, date: dateText(replay.date) })}
                  </p>
                )}
                {replay?.ok && (
                  <>
                    <div className="grid grid-cols-2 gap-3 mb-3">
                      <div>
                        <div className="text-xs text-gray-400 uppercase tracking-wider font-semibold">{t("compareValue")}</div>
                        <div className="text-xl font-bold text-white">{money(replay.value)}</div>
                      </div>
                      <div>
                        <div className="text-xs text-gray-400 uppercase tracking-wider font-semibold">{t("compareAnnual")}</div>
                        <div className="text-xl font-bold text-white">{theirs === null ? t("na") : pct(theirs)}</div>
                      </div>
                    </div>
                    {diff !== null && (
                      <p className="text-gray-300 mb-2">
                        {diff === 0 ? t("diffSame") : t(diff > 0 ? "diffAbove" : "diffBelow", { points: nf(Math.abs(diff), 1) })}
                      </p>
                    )}
                    <p className="text-xs text-gray-500 leading-relaxed">
                      {t("compareNote")}
                      {prices?.fx && ` ${t("compareNoteFx", prices.fx)}`} {t("compareSource")}
                    </p>
                  </>
                )}
              </div>
            )}

            {shareQuery && (
              <div className="flex flex-wrap items-center gap-3">
                <button type="button" onClick={copyLink} className="text-sm text-gray-300 hover:text-white border border-gray-700 hover:border-blue-500 rounded-lg px-4 py-2 transition">
                  {copied ? `✓ ${t("linkCopied")}` : t("copyLink")}
                </button>
                <span className="text-xs text-gray-500">{t("privacy")}</span>
              </div>
            )}
          </>
        )}

        <div className="bg-[#0d1426] border border-gray-800 rounded-xl p-5 text-sm text-gray-400 leading-relaxed">
          <h2 className="text-white font-bold mb-2">{t("howTitle")}</h2>
          <ul className="list-disc pl-5 flex flex-col gap-1.5">
            {[0, 1, 2].map((i) => (
              <li key={i}>{t(`how.${i}`)}</li>
            ))}
          </ul>
        </div>
      </div>
    </div>
  );
}
