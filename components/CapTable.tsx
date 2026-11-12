"use client";

import { useMemo, useState, type ReactNode } from "react";
import { useLocale, useTranslations } from "next-intl";
import { Bar, BarChart, CartesianGrid, Legend, ResponsiveContainer, Tooltip, XAxis, YAxis } from "recharts";
import CurrencyPicker, { useCurrency } from "@/components/CurrencyPicker";
import NumberInput from "@/components/NumberInput";
import { trackEvent } from "@/lib/analytics";
import { capTable, exampleScenario, SAFE_KINDS, type Row, type SafeKind, type Scenario } from "@/lib/cap-table";

// Colours tell rows apart by position only — never good or bad.
const PALETTE = ["#3b82f6", "#f59e0b", "#8b5cf6", "#06b6d4", "#ec4899", "#84cc16", "#f97316", "#14b8a6", "#a855f7", "#eab308", "#0ea5e9", "#f43f5e"];
const POOL_COLOUR = "#6b7280";

const box = "bg-[#0d1426] border border-gray-800 rounded-xl p-5";
const field = "bg-[#111827] border border-gray-700 rounded-lg px-3 py-2 text-sm text-white w-full outline-none focus:border-blue-500 transition";
const h3 = "text-xs font-bold uppercase tracking-wider text-blue-400 mb-1";
const help = "text-xs text-gray-500 mb-3 leading-relaxed";
const addBtn = "text-xs font-semibold text-blue-400 hover:text-blue-300 transition self-start";
const removeBtn = "text-gray-500 hover:text-white text-sm px-1 transition shrink-0";

function Money({ value, onChange, label, prefix }: { value: number; onChange: (v: number) => void; label: string; prefix?: string }) {
  return (
    <div className="flex items-center bg-[#111827] border border-gray-700 rounded-lg px-3 py-2 focus-within:border-blue-500 transition min-w-0">
      {prefix && <span className="text-gray-500 text-sm mr-1.5 shrink-0">{prefix}</span>}
      <NumberInput aria-label={label} min={0} integer value={value} onChange={onChange} className="bg-transparent text-white text-sm w-full outline-none min-w-0" />
    </div>
  );
}

function Kpi({ label, value, sub, small = false }: { label: string; value: ReactNode; sub: ReactNode; small?: boolean }) {
  return (
    <div className="bg-[#0d1426] border border-gray-800 border-l-4 border-l-blue-500 rounded-xl p-4">
      <div className="text-xs text-gray-400 uppercase tracking-wider font-semibold mb-1">{label}</div>
      <div className={`${small ? "text-lg sm:text-xl" : "text-2xl"} font-extrabold text-white leading-tight`}>{value}</div>
      <div className="text-xs text-gray-500 mt-1">{sub}</div>
    </div>
  );
}

export default function CapTable() {
  const t = useTranslations("capTable");
  const locale = useLocale();
  const [currency] = useCurrency();
  const example = () => exampleScenario({
    founder1: t("example.founder", { n: 1 }), founder2: t("example.founder", { n: 2 }), granted: t("example.granted"),
    preSeed: t("example.preSeed"), angel: t("example.angel"), lead: t("example.lead"),
  });
  const [sc, setSc] = useState<Scenario>(example);

  const nf = locale === "es" ? "es-ES" : "en-GB";
  const int = (n: number) => n.toLocaleString(nf, { maximumFractionDigits: 0 });
  const pct = (n: number) => `${(n * 100).toLocaleString(nf, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}%`;
  const money = (n: number) => {
    const a = Math.abs(n);
    const s = a >= 1e9 ? `${(a / 1e9).toLocaleString(nf, { maximumFractionDigits: 2 })}bn`
      : a >= 1e6 ? `${(a / 1e6).toLocaleString(nf, { maximumFractionDigits: 2 })}m`
      : int(a);
    return `${n < 0 ? "−" : ""}${currency}${s}`;
  };
  const price = (n: number) => `${currency}${n.toLocaleString(nf, { minimumFractionDigits: 2, maximumFractionDigits: 5 })}`;

  // A line left without a name gets one in the page's language ("Shareholder 2"), here
  // rather than in lib/cap-table.ts, so the table and error messages read the same.
  const result = useMemo(() => capTable({
    ...sc,
    holders: sc.holders.map((h, i) => ({ ...h, name: h.name.trim() || t("fallback.holder", { n: i + 1 }) })),
    safes: sc.safes.map((s, i) => ({ ...s, name: s.name.trim() || t("fallback.safe", { n: i + 1 }) })),
    investors: sc.investors.map((v, i) => ({ ...v, name: v.name.trim() || t("fallback.investor", { n: i + 1 }) })),
  }), [sc, t]);

  const set = (patch: Partial<Scenario>) => setSc((s) => ({ ...s, ...patch }));
  const setAt = <K extends "holders" | "safes" | "investors">(key: K, i: number, patch: Partial<Scenario[K][number]>) =>
    setSc((s) => ({ ...s, [key]: s[key].map((x, j) => (j === i ? { ...x, ...patch } : x)) }));
  const removeAt = (key: "holders" | "safes" | "investors", i: number) =>
    setSc((s) => ({ ...s, [key]: s[key].filter((_, j) => j !== i) }));

  const rowName = (r: Row) => (r.kind === "pool" ? t("rowPool") : r.name || "—");
  const colourOf = (r: Row, rows: Row[]) => (r.kind === "pool" ? POOL_COLOUR : PALETTE[rows.filter((x) => x.kind !== "pool").indexOf(r) % PALETTE.length]);

  const errorText = () => {
    if (result.ok) return null;
    const e = result.error;
    switch (e.key) {
      case "safeAmount":
      case "safeCap":
        return t(`error.${e.key}`, { name: e.name });
      case "failed":
        return t("error.failed", { detail: e.detail });
      default:
        return t(`error.${e.key}`);
    }
  };

  const shown = result.ok ? result.rows.filter((r) => r.kind !== "pool" || r.sharesBefore > 0 || (r.sharesAfter ?? 0) > 0) : [];
  const hasAfter = result.ok && result.mode !== "today";
  const afterKnown = result.ok && result.totalAfter !== undefined;
  const afterLabel = result.ok && result.mode === "round" ? t("stageAfter") : t("stageAfterSafes");

  const chartData = result.ok
    ? [
        { stage: t("stageToday"), ...Object.fromEntries(shown.map((r, k) => [`r${k}`, r.pctBefore * 100])) },
        ...(afterKnown ? [{ stage: afterLabel, ...Object.fromEntries(shown.map((r, k) => [`r${k}`, (r.pctAfter ?? 0) * 100])) }] : []),
      ]
    : [];

  const exportCsv = () => {
    if (!result.ok) return;
    const head = [t("colHolder"), t("colSharesToday"), t("colPctToday"), t("colSharesAfter"), t("colPctAfter"), t("colInvested"), t("colPrice")];
    const lines = shown.map((r) => [
      rowName(r),
      r.sharesBefore,
      (r.pctBefore * 100).toFixed(4),
      r.sharesAfter ?? "",
      r.pctAfter === undefined ? "" : (r.pctAfter * 100).toFixed(4),
      r.invested ?? "",
      r.pps ?? "",
    ]);
    const csv = [head, ...lines].map((l) => l.map((c) => `"${String(c).replace(/"/g, '""')}"`).join(",")).join("\n");
    const url = URL.createObjectURL(new Blob([csv], { type: "text/csv;charset=utf-8" }));
    const a = document.createElement("a");
    a.href = url;
    a.download = "cap-table.csv";
    a.click();
    URL.revokeObjectURL(url);
    trackEvent("export", { format: "csv" });
  };

  return (
    <div className="flex flex-col lg:flex-row gap-6">
      {/* Inputs */}
      <aside className="lg:w-[380px] shrink-0 flex flex-col gap-4">
        <div className="flex items-center justify-between gap-3">
          <CurrencyPicker label={t("currency")} />
        </div>

        <section className={box}>
          <h3 className={h3}>{t("sectionHolders")}</h3>
          <p className={help}>{t("holdersHelp")}</p>
          <div className="flex flex-col gap-2">
            {sc.holders.map((h, i) => (
              <div key={i} className="flex items-center gap-2">
                <input className={`${field} flex-1`} aria-label={t("holderName")} placeholder={t("holderName")} value={h.name} onChange={(e) => setAt("holders", i, { name: e.target.value })} />
                <div className="w-36 shrink-0"><Money label={t("shares")} value={h.shares} onChange={(v) => setAt("holders", i, { shares: v })} /></div>
                <button className={removeBtn} aria-label={t("remove")} title={t("remove")} onClick={() => removeAt("holders", i)}>✕</button>
              </div>
            ))}
            <button className={addBtn} onClick={() => set({ holders: [...sc.holders, { name: "", shares: 0 }] })}>{t("addHolder")}</button>
          </div>
          <div className="mt-4 pt-4 border-t border-gray-800">
            <label className="text-xs text-gray-400 font-medium">{t("unusedPool")}</label>
            <div className="mt-1"><Money label={t("unusedPool")} value={sc.unusedPool} onChange={(v) => set({ unusedPool: v })} /></div>
            <p className="text-xs text-gray-500 mt-1">{t("unusedPoolHelp")}</p>
          </div>
        </section>

        <section className={box}>
          <h3 className={h3}>{t("sectionSafes")}</h3>
          <p className={help}>{t("safesHelp")}</p>
          <div className="flex flex-col gap-3">
            {sc.safes.map((s, i) => (
              <div key={i} className="flex flex-col gap-2 bg-[#0a0f1e] border border-gray-800 rounded-lg p-3">
                <div className="flex items-center gap-2">
                  <input className={`${field} flex-1`} aria-label={t("safeName")} placeholder={t("safeName")} value={s.name} onChange={(e) => setAt("safes", i, { name: e.target.value })} />
                  <button className={removeBtn} aria-label={t("remove")} title={t("remove")} onClick={() => removeAt("safes", i)}>✕</button>
                </div>
                <select className={field} aria-label={t("kind")} value={s.kind} onChange={(e) => setAt("safes", i, { kind: e.target.value as SafeKind })}>
                  {SAFE_KINDS.map((k) => <option key={k} value={k}>{t(`kinds.${k}`)}</option>)}
                </select>
                <p className="text-xs text-gray-500 leading-relaxed">{t(`kindHelp.${s.kind}`)}</p>
                <div className="grid grid-cols-2 gap-2">
                  <div>
                    <label className="text-xs text-gray-400">{t("invested")}</label>
                    <Money label={t("invested")} prefix={currency} value={s.investment} onChange={(v) => setAt("safes", i, { investment: v })} />
                  </div>
                  {(s.kind === "post" || s.kind === "pre") && (
                    <div>
                      <label className="text-xs text-gray-400">{t("cap")}</label>
                      <Money label={t("cap")} prefix={currency} value={s.cap} onChange={(v) => setAt("safes", i, { cap: v })} />
                    </div>
                  )}
                  {(s.kind === "post" || s.kind === "pre") && (
                    <div>
                      <label className="text-xs text-gray-400">{t("discount")}</label>
                      <div className="flex items-center bg-[#111827] border border-gray-700 rounded-lg px-3 py-2 focus-within:border-blue-500 transition">
                        <NumberInput aria-label={t("discount")} min={0} max={95} value={s.discountPct} onChange={(v) => setAt("safes", i, { discountPct: v })} className="bg-transparent text-white text-sm w-full outline-none min-w-0" />
                        <span className="text-gray-500 text-sm ml-1">%</span>
                      </div>
                    </div>
                  )}
                </div>
              </div>
            ))}
            <button className={addBtn} onClick={() => set({ safes: [...sc.safes, { name: "", investment: 0, cap: 0, discountPct: 0, kind: "post" }] })}>{t("addSafe")}</button>
          </div>
          <p className="text-xs text-gray-500 mt-3 leading-relaxed">{t("ukNote")}</p>
        </section>

        <section className={box}>
          <div className="flex items-center justify-between gap-3 mb-1">
            <h3 className={`${h3} mb-0`}>{t("sectionRound")}</h3>
            <label className="flex items-center gap-2 text-xs text-gray-300 cursor-pointer">
              <input type="checkbox" className="accent-blue-500" checked={sc.roundOn} onChange={(e) => set({ roundOn: e.target.checked })} />
              {t("roundToggle")}
            </label>
          </div>
          <p className={help}>{t("roundHelp")}</p>
          {sc.roundOn && (
            <div className="flex flex-col gap-3">
              <div>
                <label className="text-xs text-gray-400 font-medium">{t("preMoney")}</label>
                <Money label={t("preMoney")} prefix={currency} value={sc.preMoney} onChange={(v) => set({ preMoney: v })} />
              </div>
              <div className="flex flex-col gap-2">
                <span className="text-xs text-gray-400 font-medium">{t("investors")}</span>
                {sc.investors.map((v, i) => (
                  <div key={i} className="flex items-center gap-2">
                    <input className={`${field} flex-1`} aria-label={t("investorName")} placeholder={t("investorName")} value={v.name} onChange={(e) => setAt("investors", i, { name: e.target.value })} />
                    <div className="w-36 shrink-0"><Money label={t("invested")} prefix={currency} value={v.investment} onChange={(n) => setAt("investors", i, { investment: n })} /></div>
                    <button className={removeBtn} aria-label={t("remove")} title={t("remove")} onClick={() => removeAt("investors", i)}>✕</button>
                  </div>
                ))}
                <button className={addBtn} onClick={() => set({ investors: [...sc.investors, { name: "", investment: 0 }] })}>{t("addInvestor")}</button>
              </div>
              <div>
                <label className="text-xs text-gray-400 font-medium">{t("targetPool")}</label>
                <div className="flex items-center bg-[#111827] border border-gray-700 rounded-lg px-3 py-2 focus-within:border-blue-500 transition">
                  <NumberInput aria-label={t("targetPool")} min={0} max={49} value={sc.targetPoolPct} onChange={(v) => set({ targetPoolPct: v })} className="bg-transparent text-white text-sm w-full outline-none" />
                  <span className="text-gray-500 text-sm ml-1">%</span>
                </div>
                <p className="text-xs text-gray-500 mt-1 leading-relaxed">{t("targetPoolHelp")}</p>
              </div>
            </div>
          )}
        </section>
        <button className="text-xs text-gray-500 hover:text-white transition self-start" onClick={() => setSc(example())}>{t("reset")}</button>
      </aside>

      {/* Results */}
      <div className="flex-1 min-w-0 flex flex-col gap-6" aria-live="polite">
        {!result.ok ? (
          <div className="bg-[#1a1408] border border-yellow-700/60 rounded-xl p-5 text-sm text-yellow-200">{errorText()}</div>
        ) : (
          <>
            <div className="grid grid-cols-2 xl:grid-cols-4 gap-3">
              {result.mode === "round" ? (
                <>
                  <Kpi label={t("kpiPps")} value={price(result.pps!)} sub={t("kpiPpsSub")} />
                  <Kpi label={t("kpiPost")} value={money(result.postMoney!)} sub={t("kpiPostSub", { pre: money(sc.preMoney), money: money(result.seriesInvestment!) })} />
                  <Kpi small label={t("kpiHolders")} value={<>{pct(result.holdersBefore)} → {pct(result.holdersAfter!)}</>} sub={t("kpiHoldersSub")} />
                  <Kpi label={t("kpiNewShares")} value={int(result.newShares!)} sub={t("kpiNewSharesSub", { options: int(result.additionalOptions!) })} />
                </>
              ) : (
                <>
                  <Kpi label={t("kpiTotal")} value={int(result.totalBefore)} sub={t("kpiTotalSub")} />
                  <Kpi small={result.holdersAfter !== undefined} label={t("kpiHolders")} value={result.holdersAfter === undefined ? pct(result.holdersBefore) : <>{pct(result.holdersBefore)} → {pct(result.holdersAfter)}</>} sub={result.mode === "today" ? t("kpiHoldersTodaySub") : t("kpiHoldersSafesSub")} />
                  {result.mode === "estimate" && <Kpi label={t("kpiSafeMoney")} value={money(result.safeInvestment)} sub={t("kpiSafeMoneySub", { count: sc.safes.length })} />}
                </>
              )}
            </div>

            {result.mode === "estimate" && <p className="text-sm text-gray-400 leading-relaxed">{t("estimateNote")}</p>}

            <section className={`${box} p-6`}>
              <h2 className="text-white font-bold mb-1">{t("chartTitle")}</h2>
              <p className="text-xs text-gray-500 mb-4">{t("chartHelp")}</p>
              <ResponsiveContainer width="100%" height={afterKnown ? 220 : 140}>
                <BarChart data={chartData} layout="vertical" margin={{ top: 0, right: 16, bottom: 0, left: 0 }}>
                  <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.05)" horizontal={false} />
                  <XAxis type="number" domain={[0, 100]} ticks={[0, 25, 50, 75, 100]} tickFormatter={(v) => `${v}%`} stroke="#374151" tick={{ fill: "#6b7280", fontSize: 11 }} />
                  <YAxis type="category" dataKey="stage" width={124} stroke="#374151" tick={{ fill: "#9ca3af", fontSize: 12 }} />
                  <Tooltip
                    cursor={{ fill: "rgba(255,255,255,0.03)" }}
                    contentStyle={{ backgroundColor: "#111827", border: "1px solid #1e293b", borderRadius: 8, color: "#f1f5f9", fontSize: 12 }}
                    formatter={(v) => `${Number(v).toLocaleString(nf, { maximumFractionDigits: 2 })}%`}
                  />
                  <Legend itemSorter={null} wrapperStyle={{ color: "#9ca3af", fontSize: 12, paddingTop: 8 }} />
                  {shown.map((r, k) => (
                    <Bar key={k} dataKey={`r${k}`} name={rowName(r)} stackId="own" fill={colourOf(r, shown)} isAnimationActive={false} />
                  ))}
                </BarChart>
              </ResponsiveContainer>
            </section>

            <section className={`${box} p-6`}>
              <div className="flex items-center justify-between gap-3 mb-4">
                <h2 className="text-white font-bold">{t("tableTitle")}</h2>
                <button onClick={exportCsv} className="text-xs font-semibold text-gray-300 hover:text-white border border-gray-700 hover:border-blue-500 px-3 py-1.5 rounded-lg transition shrink-0">{t("exportCsv")}</button>
              </div>
              <div className="overflow-x-auto">
                <table className="w-full text-sm">
                  <thead>
                    <tr className="border-b border-gray-700 text-xs text-gray-400 uppercase tracking-wider">
                      <th className="text-left py-2 pr-4 font-semibold">{t("colHolder")}</th>
                      <th className="hidden sm:table-cell text-right py-2 pr-4 font-semibold">{t("colSharesToday")}</th>
                      <th className="text-right py-2 pr-4 font-semibold">{t("colPctToday")}</th>
                      {hasAfter && <th className="hidden sm:table-cell text-right py-2 pr-4 font-semibold">{t("colSharesAfter")}</th>}
                      {hasAfter && <th className="text-right py-2 pr-4 font-semibold">{t("colPctAfter")}</th>}
                      {hasAfter && <th className="text-right py-2 pr-4 font-semibold">{t("colChange")}</th>}
                      {hasAfter && <th className="hidden md:table-cell text-right py-2 font-semibold">{t("colPrice")}</th>}
                    </tr>
                  </thead>
                  <tbody>
                    {shown.map((r, k) => {
                      const change = r.pctAfter === undefined ? undefined : r.pctAfter - r.pctBefore;
                      return (
                        <tr key={k} className="border-b border-gray-800 text-xs">
                          <td className="py-2 pr-4 text-white font-medium sm:whitespace-nowrap">
                            <span className="inline-block w-2.5 h-2.5 rounded-sm mr-2 align-middle" style={{ background: colourOf(r, shown) }} />
                            {rowName(r)}
                            {r.kind === "safe" && <span className="text-gray-500 font-normal"> · {t("tagSafe")}</span>}
                            {r.kind === "series" && <span className="text-gray-500 font-normal"> · {t("tagNew")}</span>}
                          </td>
                          <td className="hidden sm:table-cell py-2 pr-4 text-right text-gray-300 tabular-nums">{r.sharesBefore ? int(r.sharesBefore) : "—"}</td>
                          <td className="py-2 pr-4 text-right text-gray-300 tabular-nums">{r.pctBefore ? pct(r.pctBefore) : "—"}</td>
                          {hasAfter && <td className="hidden sm:table-cell py-2 pr-4 text-right text-gray-300 tabular-nums">{r.sharesAfter === undefined ? <span className="text-gray-500">{t(r.note === "caveat" ? "caveat" : "tbd")}</span> : int(r.sharesAfter)}</td>}
                          {hasAfter && <td className="py-2 pr-4 text-right text-white font-semibold tabular-nums">{r.pctAfter === undefined ? "—" : pct(r.pctAfter)}{r.note === "caveat" && r.pctAfter !== undefined && <span className="text-gray-500 font-normal"> *</span>}</td>}
                          {hasAfter && (
                            <td className="py-2 pr-4 text-right text-gray-400 tabular-nums whitespace-nowrap">
                              {change === undefined || Math.abs(change) < 5e-7 ? "—" : `${change > 0 ? "▲" : "▼"} ${(Math.abs(change) * 100).toLocaleString(nf, { minimumFractionDigits: 2, maximumFractionDigits: 2 })} ${t("pts")}`}
                            </td>
                          )}
                          {hasAfter && <td className="hidden md:table-cell py-2 text-right text-gray-400 tabular-nums">{r.pps ? price(r.pps) : "—"}</td>}
                        </tr>
                      );
                    })}
                  </tbody>
                  <tfoot>
                    <tr className="text-xs font-semibold text-white">
                      <td className="py-2 pr-4">{t("total")}</td>
                      <td className="hidden sm:table-cell py-2 pr-4 text-right tabular-nums">{int(result.totalBefore)}</td>
                      <td className="py-2 pr-4 text-right tabular-nums">{pct(1)}</td>
                      {hasAfter && <td className="hidden sm:table-cell py-2 pr-4 text-right tabular-nums">{result.totalAfter === undefined ? "—" : int(result.totalAfter)}</td>}
                      {hasAfter && <td className="py-2 pr-4 text-right tabular-nums">{result.totalAfter === undefined ? "—" : pct(1)}</td>}
                      {hasAfter && <td />}
                      {hasAfter && <td className="hidden md:table-cell" />}
                    </tr>
                  </tfoot>
                </table>
              </div>
              {shown.some((r) => r.note === "caveat") && <p className="text-xs text-gray-500 mt-3">* {t("caveatNote")}</p>}
            </section>
          </>
        )}

        <section className="text-xs text-gray-500 leading-relaxed flex flex-col gap-2">
          <p>{t.rich("credit", { link: (c) => <a href="https://github.com/1984vc/cap-table" target="_blank" rel="noopener noreferrer" className="text-blue-400 hover:text-blue-300 underline">{c}</a> })}</p>
          <p>{t("limits")}</p>
          <p>{t("privacy")}</p>
        </section>
      </div>
    </div>
  );
}
