"use client";

import { useState, useMemo, useCallback } from "react";
import Link from "next/link";
import { useLocale, useTranslations } from "next-intl";
import RelatedTools from "@/components/RelatedTools";
import VideoTeaser from "@/components/VideoTeaser";
import CurrencyPicker, { useCurrency } from "@/components/CurrencyPicker";
import LendingChat from "./LendingChat";
import { buildSchedule, overpaymentPlan, type LumpSum } from "@/lib/calculators";
import {
  AreaChart, Area, LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, Legend,
  ResponsiveContainer, PieChart, Pie, Cell, Tooltip as PieTooltip,
} from "recharts";
import { trackEvent } from "@/lib/analytics";

import NumberInput from "@/components/NumberInput";
const fmt = (n: number) => n.toLocaleString("en-GB", { maximumFractionDigits: 0 });
const fmtM = (n: number) => n.toLocaleString("en-GB", { minimumFractionDigits: 2, maximumFractionDigits: 2 });

function KpiCard({ label, value, sub, color = "blue" }: { label: string; value: string; sub: string; color?: "blue" | "green" | "red" }) {
  const border = color === "green" ? "border-l-green-500" : color === "red" ? "border-l-red-500" : "border-l-blue-500";
  return (
    <div className={`bg-[#0d1426] border border-gray-800 border-l-4 ${border} rounded-xl p-4`}>
      <div className="text-xs text-gray-400 uppercase tracking-wider font-semibold mb-1">{label}</div>
      <div className="text-2xl font-extrabold text-white leading-tight">{value}</div>
      <div className="text-xs text-gray-500 mt-1">{sub}</div>
    </div>
  );
}

function NumInput({ label, value, onChange, min = 0, step = 1000, prefix: prefixProp }: {
  label: string; value: number; onChange: (v: number) => void; min?: number; step?: number; prefix?: string;
}) {
  const [currency] = useCurrency();
  const prefix = prefixProp ?? currency;
  return (
    <div className="flex flex-col gap-1">
      <label className="text-xs text-gray-400 font-medium">{label}</label>
      <div className="flex items-center bg-[#111827] border border-gray-700 rounded-lg px-3 py-2 focus-within:border-blue-500 transition">
        {prefix && <span className="text-gray-500 text-sm mr-1.5 shrink-0">{prefix}</span>}
        <NumberInput min={min} step={step} value={value} onChange={onChange} className="bg-transparent text-white text-sm w-full outline-none" />
      </div>
    </div>
  );
}

function SliderInput({ label, value, onChange, min, max, step = 0.1 }: { label: string; value: number; onChange: (v: number) => void; min: number; max: number; step?: number }) {
  return (
    <div className="flex flex-col gap-1">
      <div className="flex justify-between">
        <label className="text-xs text-gray-400 font-medium">{label}</label>
        <span className="text-xs text-blue-400 font-semibold">{value}%</span>
      </div>
      <input type="range" min={min} max={max} step={step} value={value} onChange={e => onChange(parseFloat(e.target.value))} className="w-full accent-blue-500" />
    </div>
  );
}

export default function LendingPage() {
  const [currency] = useCurrency();
  const t = useTranslations("lending");
  const tc = useTranslations("toolCommon");
  const es = useLocale() === "es";
  const [tab, setTab] = useState<"loan" | "mortgage">("loan");
  const [lAmount, setLAmount] = useState(20000);
  const [lRate, setLRate] = useState(5.0);
  const [lYears, setLYears] = useState(5);
  const [mAmount, setMAmount] = useState(250000);
  const [mRate, setMRate] = useState(4.5);
  const [mYears, setMYears] = useState(25);
  const [mSavRate, setMSavRate] = useState(6.0);
  const [mExtra, setMExtra] = useState(100);
  const [mLumps, setMLumps] = useState<LumpSum[]>([]);
  const [mAllowance, setMAllowance] = useState(10);
  const [showTable, setShowTable] = useState(false);
  const [isExporting, setIsExporting] = useState(false);

  const lCalc = useMemo(() => {
    const schedule = buildSchedule(lRate / 100, lYears, lAmount);
    const totalPaid = schedule.reduce((s, r) => s + r.payment, 0);
    const totalInterest = schedule.reduce((s, r) => s + r.interest, 0);
    const pmt = schedule[0]?.payment ?? 0;
    // downsample for chart
    const step = Math.max(1, Math.floor(schedule.length / 60));
    const chartData = schedule.filter((_, i) => i % step === 0 || i === schedule.length - 1)
      .map(r => ({ month: r.period, Interest: r.interest, Principal: r.principal, Balance: r.balance }));
    return { schedule, totalPaid, totalInterest, pmt, chartData };
  }, [lAmount, lRate, lYears]);

  const mCalc = useMemo(() => {
    const schedule = buildSchedule(mRate / 100, mYears, mAmount);
    const totalPaid = schedule.reduce((s, r) => s + r.payment, 0);
    const totalInterest = schedule.reduce((s, r) => s + r.interest, 0);
    const pmt = schedule[0]?.payment ?? 0;
    const nMonths = mYears * 12;
    const step = Math.max(1, Math.floor(schedule.length / 60));
    const chartData = schedule.filter((_, i) => i % step === 0 || i === schedule.length - 1)
      .map(r => ({ month: r.period, Interest: r.interest, Principal: r.principal, Balance: r.balance }));
    let earlyRepay = null;
    if (nMonths > 60) {
      const cutoffIdx = nMonths - 60 - 1;
      const balAtCutoff = schedule[cutoffIdx]?.balance ?? 0;
      const monthsToSave = schedule[cutoffIdx]?.period ?? 0;
      const interestSaved = schedule.slice(cutoffIdx + 1).reduce((s, r) => s + r.interest, 0);
      const r = mSavRate / 100 / 12;
      const monthly = r === 0 ? balAtCutoff / monthsToSave : (balAtCutoff * r) / (Math.pow(1 + r, monthsToSave) - 1);
      earlyRepay = { balAtCutoff, monthsToSave, interestSaved, monthly, recommend: mSavRate > mRate };
    }
    return { schedule, totalPaid, totalInterest, pmt, chartData, earlyRepay };
  }, [mAmount, mRate, mYears, mSavRate]);

  // Overpaying (mortgage tab): a regular amount plus one-off lump sums. The
  // lender is assumed to keep the payment and shorten the term.
  const monthNames = useMemo(
    () => Array.from({ length: 12 }, (_, m) => new Intl.DateTimeFormat(es ? "es-ES" : "en-GB", { month: "short" }).format(new Date(2000, m, 1))),
    [es],
  );
  const over = useMemo(() => {
    const plan = overpaymentPlan(mRate / 100, mYears, mAmount, mExtra, mLumps);
    const chartData = [
      { year: 0, with: mAmount, without: mAmount },
      ...plan.yearly.map(y => ({ year: y.year, with: y.closingBalance, without: y.baselineClosing })),
    ];
    const years = plan.yearly.filter(y => y.overpaid > 0.005);
    const overAllowance = years.filter(y => y.shareOfOpening > mAllowance / 100 + 1e-9);
    return { plan, chartData, years, overAllowance, active: plan.totalOverpaid > 0.005 };
  }, [mRate, mYears, mAmount, mExtra, mLumps, mAllowance]);
  const ym = (months: number) => t("over.duration", { years: Math.floor(months / 12), months: months % 12 });
  const setLump = (i: number, patch: Partial<LumpSum>) => setMLumps(ls => ls.map((l, j) => (j === i ? { ...l, ...patch } : l)));

  const activeCalc = tab === "loan" ? lCalc : mCalc;
  const activeAmount = tab === "loan" ? lAmount : mAmount;
  const activeRate = tab === "loan" ? lRate : mRate;
  const activeYears = tab === "loan" ? lYears : mYears;

  const pieData = [
    { name: "Principal", value: activeAmount },
    { name: "Interest", value: Math.round(activeCalc.totalInterest) },
  ];

  const handleExportPdf = useCallback(async () => {
    setIsExporting(true);
    try {
      const { pdf } = await import("@react-pdf/renderer");
      const { default: LendingPDF } = await import("./pdf");
      const blob = await pdf(
        <LendingPDF
          currency={currency}
          mode={tab}
          amount={activeAmount}
          rate={activeRate}
          years={activeYears}
          monthlyPayment={activeCalc.pmt}
          totalPaid={activeCalc.totalPaid}
          totalInterest={activeCalc.totalInterest}
          schedule={activeCalc.schedule}
        />
      ).toBlob();
      const url = URL.createObjectURL(blob);
      const a = document.createElement("a");
      a.href = url;
      a.download = `lending-calculator-${tab}.pdf`;
      a.click();
      trackEvent("export", { format: "pdf" });
      URL.revokeObjectURL(url);
    } finally {
      setIsExporting(false);
    }
  }, [currency, tab, activeAmount, activeRate, activeYears, activeCalc]);

  const tooltipStyle = { backgroundColor: "#111827", border: "1px solid #1e293b", borderRadius: "8px", color: "#f1f5f9", fontSize: 12 };

  return (
    <main className="min-h-screen bg-[#0a0f1e] text-white">
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify({
          "@context": "https://schema.org",
          "@type": "SoftwareApplication",
          "name": "Lending Calculator",
          "description": "Calculate loan repayments, total interest, and amortisation schedules. Compare loan options side by side. Free, no signup.",
          "url": "https://www.financeplots.com/tools/lending",
          "applicationCategory": "FinanceApplication",
          "operatingSystem": "Web",
          "offers": { "@type": "Offer", "price": "0", "priceCurrency": "GBP" },
          "provider": { "@type": "Organization", "name": "FinancePlots", "url": "https://www.financeplots.com" }
        })}}
      />
      <div className="fixed top-[65px] left-0 right-0 z-40 bg-[#0d1426]/95 backdrop-blur border-b border-gray-800 px-6 py-3">
        <div className="max-w-7xl mx-auto flex items-center justify-between gap-4">
          <div className="flex items-center gap-3 min-w-0">
            <Link href="/tools/personal" className="text-gray-400 hover:text-white text-sm transition shrink-0 whitespace-nowrap">{tc("backPersonal")}</Link>
            <span className="text-gray-700 hidden sm:block">|</span>
            <h1 className="text-white font-bold text-sm sm:text-base truncate">{t("title")}</h1>
          </div>
          <CurrencyPicker label={tc("currency")} hideLabel className="ml-auto" />
          <button onClick={handleExportPdf} disabled={isExporting} className="flex items-center gap-2 shrink-0 whitespace-nowrap bg-blue-600 hover:bg-blue-500 disabled:opacity-40 text-white font-semibold px-4 py-2 rounded-lg text-sm transition">
            {isExporting ? tc("generating") : <><span className="sm:hidden">📄 PDF</span><span className="hidden sm:inline">{tc("exportPdf")}</span></>}
          </button>
        </div>
      </div>

      <div className="pt-[133px] pb-20">
        <div className="max-w-7xl mx-auto px-4 sm:px-6">
          {/* Tabs */}
          <div className="flex flex-wrap items-center gap-2 mb-6">
            {([{ id: "loan", label: t("tabLoan") }, { id: "mortgage", label: t("tabMortgage") }] as { id: "loan" | "mortgage"; label: string }[]).map(tb => (
              <button key={tb.id} onClick={() => setTab(tb.id)}
                className={`px-5 py-2 rounded-lg text-sm font-semibold transition ${tab === tb.id ? "bg-blue-600 text-white" : "bg-[#0d1426] text-gray-400 border border-gray-800 hover:text-white"}`}>
                {tb.label}
              </button>
            ))}
            {/* Captions are burned in, so each locale has its own cut (made in marketing/mortgage-cartoon). */}
            <VideoTeaser
              src={es ? "/mortgage-cartoon-es.mp4" : "/mortgage-cartoon.mp4"}
              poster={es ? "/mortgage-cartoon-es-poster.jpg" : "/mortgage-cartoon-poster.jpg"}
              name={es ? "mortgage-cartoon-es" : "mortgage-cartoon"}
              title={t("video.title")}
              subtitle={t("video.subtitle")}
              closeLabel={t("video.close")}
              className="sm:ml-auto"
            />
          </div>

          <div className="flex flex-col lg:flex-row gap-6">
            {/* Sidebar */}
            <aside className="lg:w-72 xl:w-80 shrink-0">
              <div className="lg:sticky lg:top-[133px] flex flex-col gap-4">
                {tab === "loan" ? (
                  <div className="bg-[#0d1426] border border-gray-800 rounded-xl p-5">
                    <h3 className="text-xs font-bold uppercase tracking-wider text-blue-400 mb-3">{t("sectionLoan")}</h3>
                    <div className="flex flex-col gap-3">
                      <NumInput label={t("labelAmount")} value={lAmount} onChange={setLAmount} step={500} />
                      <SliderInput label={t("labelRate")} value={lRate} onChange={setLRate} min={0.1} max={20} />
                      <div className="flex flex-col gap-1">
                        <div className="flex justify-between">
                          <label className="text-xs text-gray-400 font-medium">{t("labelDuration")}</label>
                          <span className="text-xs text-blue-400 font-semibold">{lYears} years</span>
                        </div>
                        <input type="range" min={1} max={40} step={1} value={lYears} onChange={e => setLYears(parseInt(e.target.value))} className="w-full accent-blue-500" />
                      </div>
                    </div>
                  </div>
                ) : (
                  <div className="bg-[#0d1426] border border-gray-800 rounded-xl p-5">
                    <h3 className="text-xs font-bold uppercase tracking-wider text-blue-400 mb-3">{t("sectionMortgage")}</h3>
                    <div className="flex flex-col gap-3">
                      <NumInput label={t("labelMortgageAmount")} value={mAmount} onChange={setMAmount} step={5000} />
                      <SliderInput label={t("labelMortgageRate")} value={mRate} onChange={setMRate} min={0.1} max={20} />
                      <div className="flex flex-col gap-1">
                        <div className="flex justify-between">
                          <label className="text-xs text-gray-400 font-medium">{t("labelDuration")}</label>
                          <span className="text-xs text-blue-400 font-semibold">{mYears} years</span>
                        </div>
                        <input type="range" min={1} max={40} step={1} value={mYears} onChange={e => setMYears(parseInt(e.target.value))} className="w-full accent-blue-500" />
                      </div>
                      <SliderInput label={t("labelSavingsRate")} value={mSavRate} onChange={setMSavRate} min={0.1} max={20} />
                    </div>
                  </div>
                )}
                {tab === "mortgage" && (
                  <div className="bg-[#0d1426] border border-gray-800 rounded-xl p-5">
                    <h3 className="text-xs font-bold uppercase tracking-wider text-blue-400 mb-1">{t("over.section")}</h3>
                    <p className="text-xs text-gray-500 mb-3 leading-relaxed">{t("over.sectionHelp")}</p>
                    <div className="flex flex-col gap-3">
                      <NumInput label={t("over.monthly")} value={mExtra} onChange={setMExtra} step={50} />
                      <div className="flex flex-col gap-2">
                        <span className="text-xs text-gray-400 font-medium">{t("over.lumps")}</span>
                        {mLumps.map((l, i) => (
                          <div key={i} className="flex flex-col gap-1.5 bg-[#0a0f1e] border border-gray-800 rounded-lg p-2">
                            <div className="flex items-center gap-1.5">
                              <select aria-label={t("over.year")} value={l.year} onChange={e => setLump(i, { year: parseInt(e.target.value) })}
                                className="flex-1 min-w-0 bg-[#111827] border border-gray-700 rounded-lg px-2 py-1.5 text-xs text-white outline-none focus:border-blue-500">
                                {Array.from({ length: mYears }, (_, y) => <option key={y + 1} value={y + 1}>{t("over.yearN", { n: y + 1 })}</option>)}
                              </select>
                              <select aria-label={t("over.month")} value={l.month} onChange={e => setLump(i, { month: parseInt(e.target.value) })}
                                className="flex-1 min-w-0 bg-[#111827] border border-gray-700 rounded-lg px-2 py-1.5 text-xs text-white outline-none focus:border-blue-500">
                                {monthNames.map((name, m) => <option key={m + 1} value={m + 1}>{name}</option>)}
                              </select>
                              <button onClick={() => setMLumps(ls => ls.filter((_, j) => j !== i))} aria-label={t("over.remove")} title={t("over.remove")}
                                className="text-gray-500 hover:text-white text-sm px-1 transition shrink-0">✕</button>
                            </div>
                            <div className="flex items-center bg-[#111827] border border-gray-700 rounded-lg px-3 py-1.5 focus-within:border-blue-500 transition">
                              <span className="text-gray-500 text-sm mr-1.5 shrink-0">{currency}</span>
                              <NumberInput aria-label={t("over.amount")} min={0} value={l.amount} onChange={v => setLump(i, { amount: v })} className="bg-transparent text-white text-sm w-full outline-none" />
                            </div>
                          </div>
                        ))}
                        <button onClick={() => setMLumps(ls => [...ls, { year: Math.min(5, mYears), month: 1, amount: 10000 }])}
                          className="text-xs font-semibold text-blue-400 hover:text-blue-300 transition self-start">{t("over.addLump")}</button>
                      </div>
                      <NumInput label={t("over.allowance")} value={mAllowance} onChange={setMAllowance} step={1} prefix="%" />
                    </div>
                  </div>
                )}
              </div>
            </aside>

            {/* Main content */}
            <div className="flex-1 min-w-0 flex flex-col gap-6">
              {/* KPIs */}
              <div className="grid grid-cols-2 xl:grid-cols-4 gap-3">
                <KpiCard label={t("kpiPayment")} value={`${currency}${fmtM(activeCalc.pmt)}`} sub={t("kpiPaymentTerm", { years: activeYears })} />
                <KpiCard label={t("kpiTotal")} value={`${currency}${fmt(activeCalc.totalPaid)}`} sub={`${t("kpiTotalSub")}: ${currency}${fmt(activeAmount)}`} />
                <KpiCard label={t("kpiInterest")} value={`${currency}${fmt(activeCalc.totalInterest)}`} sub={`${activeAmount > 0 ? ((activeCalc.totalInterest / activeAmount) * 100).toFixed(1) : 0}${t("kpiInterestSub")}`} color="red" />
                <KpiCard label={t("kpiRate")} value={`${activeRate}%`} sub={t("kpiRateSub")} />
              </div>

              {/* Overpaying (mortgage only) */}
              {tab === "mortgage" && (
                <div className="bg-[#0d1426] border border-gray-800 rounded-xl p-6">
                  <h2 className="text-white font-bold mb-1">{t("over.title")}</h2>
                  <p className="text-xs text-gray-500 mb-4">{t("over.assumption")}</p>
                  {!over.active ? (
                    <p className="text-sm text-gray-400">{t("over.hint")}</p>
                  ) : (
                    <>
                      <div className="grid grid-cols-2 xl:grid-cols-4 gap-3 mb-5">
                        <KpiCard label={t("over.kpiFree")} value={ym(over.plan.months)} sub={t("over.kpiFreeSub", { term: ym(mYears * 12) })} />
                        <KpiCard label={t("over.kpiTime")} value={over.plan.monthsSaved > 0 ? ym(over.plan.monthsSaved) : "—"} sub={t("over.kpiTimeSub")} />
                        <KpiCard label={t("over.kpiInterest")} value={`${currency}${fmt(over.plan.interestSaved)}`} sub={t("over.kpiInterestSub", { total: `${currency}${fmt(over.plan.totalInterest)}` })} />
                        <KpiCard label={t("over.kpiOverpaid")} value={`${currency}${fmt(over.plan.totalOverpaid)}`} sub={t("over.kpiOverpaidSub", { payment: `${currency}${fmtM(over.plan.monthlyPayment + mExtra)}` })} />
                      </div>
                      <ResponsiveContainer width="100%" height={260}>
                        <LineChart data={over.chartData} margin={{ top: 5, right: 10, bottom: 10, left: 5 }}>
                          <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.05)" />
                          <XAxis dataKey="year" stroke="#374151" tick={{ fill: "#6b7280", fontSize: 10 }} label={{ value: t("over.axisYear"), position: "insideBottom", offset: -5, fill: "#6b7280", fontSize: 10 }} />
                          <YAxis stroke="#374151" tick={{ fill: "#6b7280", fontSize: 10 }} tickFormatter={v => `${currency}${(v / 1000).toFixed(0)}k`} width={55} />
                          <Tooltip contentStyle={tooltipStyle} formatter={(v) => `${currency}${fmt(Number(v))}`} labelFormatter={v => t("over.yearN", { n: Number(v) })} />
                          <Legend wrapperStyle={{ color: "#9ca3af", fontSize: 11, paddingTop: 8 }} />
                          <Line type="monotone" dataKey="without" name={t("over.lineWithout")} stroke="#6b7280" strokeDasharray="5 4" strokeWidth={2} dot={false} isAnimationActive={false} />
                          <Line type="monotone" dataKey="with" name={t("over.lineWith")} stroke="#3b82f6" strokeWidth={2.5} dot={false} isAnimationActive={false} />
                        </LineChart>
                      </ResponsiveContainer>
                      <div className="mt-5">
                        <h3 className="text-sm font-semibold text-white mb-2">{t("over.byYear")}</h3>
                        <div className="max-h-64 overflow-y-auto">
                          <table className="w-full text-xs">
                            <thead>
                              <tr className="border-b border-gray-700 text-gray-400 uppercase tracking-wider">
                                <th className="text-left py-2 pr-4 font-semibold">{t("over.colYear")}</th>
                                <th className="text-right py-2 pr-4 font-semibold">{t("over.colOverpaid")}</th>
                                <th className="text-right py-2 font-semibold">{t("over.colShare")}</th>
                              </tr>
                            </thead>
                            <tbody>
                              {over.years.map(y => {
                                const above = y.shareOfOpening > mAllowance / 100 + 1e-9;
                                return (
                                  <tr key={y.year} className="border-b border-gray-800">
                                    <td className="py-1.5 pr-4 text-white">{y.year}</td>
                                    <td className="py-1.5 pr-4 text-right text-gray-300 tabular-nums">{currency}{fmt(y.overpaid)}</td>
                                    <td className={`py-1.5 text-right tabular-nums ${above ? "text-yellow-300 font-semibold" : "text-gray-300"}`}>
                                      {above && <span title={t("over.aboveAllowance")}>⚠ </span>}
                                      {(y.shareOfOpening * 100).toFixed(1)}%
                                    </td>
                                  </tr>
                                );
                              })}
                            </tbody>
                          </table>
                        </div>
                        {over.overAllowance.length > 0 && (
                          <div className="mt-3 rounded-lg p-3 text-xs bg-yellow-900/20 border border-yellow-700/40 text-yellow-200 leading-relaxed">
                            ⚠ {t("over.warning", { count: over.overAllowance.length, years: over.overAllowance.map(y => y.year).join(", "), allowance: mAllowance })}
                          </div>
                        )}
                        <p className="text-xs text-gray-600 mt-3">{t("over.credit")}</p>
                      </div>
                    </>
                  )}
                </div>
              )}

              {/* Early Repayment (mortgage only) */}
              {tab === "mortgage" && mCalc.earlyRepay && (
                <div className="bg-[#0d1426] border border-gray-800 rounded-xl p-6">
                  <h2 className="text-white font-bold mb-4">{t("earlyRepaymentTitle")}</h2>
                  <div className="grid grid-cols-2 xl:grid-cols-4 gap-3 mb-4">
                    <KpiCard label={t("kpiBalance")} value={`${currency}${fmt(mCalc.earlyRepay.balAtCutoff)}`} sub={t("kpiBalanceSub", { years: mYears - 5 })} />
                    <KpiCard label={t("kpiSaved")} value={`${currency}${fmt(mCalc.earlyRepay.interestSaved)}`} sub={t("kpiSavedSub")} color="green" />
                    <KpiCard label={t("kpiMonthlySaving")} value={`${currency}${fmtM(mCalc.earlyRepay.monthly)}`} sub={t("kpiMonthlySavingSub", { months: mCalc.earlyRepay.monthsToSave })} />
                    <KpiCard label={t("kpiStrategy")} value={mCalc.earlyRepay.recommend ? t("strategyInvest") : t("strategyRepay")} sub={t("strategySub", { savings: mSavRate, sign: mCalc.earlyRepay.recommend ? ">" : "<", mortgage: mRate })} color={mCalc.earlyRepay.recommend ? "green" : "blue"} />
                  </div>
                  <div className={`rounded-xl p-4 text-sm ${mCalc.earlyRepay.recommend ? "bg-green-900/20 border border-green-700/40 text-green-300" : "bg-blue-900/20 border border-blue-700/40 text-blue-300"}`}>
                    💡 {mCalc.earlyRepay.recommend
                      ? t("adviceInvest", { savings: mSavRate, mortgage: mRate, monthly: `${currency}${fmtM(mCalc.earlyRepay.monthly)}` })
                      : t("adviceRepay", { savings: mSavRate, mortgage: mRate, monthly: `${currency}${fmtM(mCalc.earlyRepay.monthly)}`, months: mCalc.earlyRepay.monthsToSave, saved: `${currency}${fmt(mCalc.earlyRepay.interestSaved)}` })}
                  </div>
                </div>
              )}

              {/* Charts */}
              <div className="grid md:grid-cols-2 gap-6">
                <div className="bg-[#0d1426] border border-gray-800 rounded-xl p-6">
                  <h2 className="text-white font-bold mb-4">{t("chartInterestPrincipal")}</h2>
                  <ResponsiveContainer width="100%" height={260}>
                    <AreaChart data={activeCalc.chartData} margin={{ top: 5, right: 10, bottom: 10, left: 5 }}>
                      <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.05)" />
                      <XAxis dataKey="month" stroke="#374151" tick={{ fill: "#6b7280", fontSize: 10 }} label={{ value: "Month", position: "insideBottom", offset: -5, fill: "#6b7280", fontSize: 10 }} />
                      <YAxis stroke="#374151" tick={{ fill: "#6b7280", fontSize: 10 }} tickFormatter={v => `${currency}${(v / 1000).toFixed(0)}k`} width={55} />
                      <Tooltip contentStyle={tooltipStyle} formatter={(v) => [`${currency}${fmtM(Number(v))}`, undefined]} />
                      <Legend wrapperStyle={{ color: "#9ca3af", fontSize: 11 }} />
                      <Area type="monotone" dataKey="Interest" stroke="#ef4444" fill="#ef4444" fillOpacity={0.15} strokeWidth={2} />
                      <Area type="monotone" dataKey="Principal" stroke="#22c55e" fill="#22c55e" fillOpacity={0.15} strokeWidth={2} />
                    </AreaChart>
                  </ResponsiveContainer>
                </div>

                <div className="bg-[#0d1426] border border-gray-800 rounded-xl p-6">
                  <h2 className="text-white font-bold mb-4">{t("chartBalance")}</h2>
                  <ResponsiveContainer width="100%" height={260}>
                    <AreaChart data={activeCalc.chartData} margin={{ top: 5, right: 10, bottom: 10, left: 5 }}>
                      <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.05)" />
                      <XAxis dataKey="month" stroke="#374151" tick={{ fill: "#6b7280", fontSize: 10 }} label={{ value: "Month", position: "insideBottom", offset: -5, fill: "#6b7280", fontSize: 10 }} />
                      <YAxis stroke="#374151" tick={{ fill: "#6b7280", fontSize: 10 }} tickFormatter={v => `${currency}${(v / 1000).toFixed(0)}k`} width={55} />
                      <Tooltip contentStyle={tooltipStyle} formatter={(v) => [`${currency}${fmt(Number(v))}`, undefined]} />
                      <Area type="monotone" dataKey="Balance" stroke="#3b82f6" fill="#3b82f6" fillOpacity={0.15} strokeWidth={2.5} name="Balance" />
                    </AreaChart>
                  </ResponsiveContainer>
                </div>
              </div>

              {/* Donut */}
              <div className="bg-[#0d1426] border border-gray-800 rounded-xl p-6">
                <h2 className="text-white font-bold mb-4">{t("chartPaymentBreakdown")}</h2>
                <div className="flex flex-col md:flex-row items-center gap-6">
                  <ResponsiveContainer width={200} height={200}>
                    <PieChart>
                      <Pie data={pieData} cx="50%" cy="50%" innerRadius={55} outerRadius={85} dataKey="value" paddingAngle={2}>
                        <Cell fill="#22c55e" />
                        <Cell fill="#ef4444" />
                      </Pie>
                      <PieTooltip contentStyle={tooltipStyle} formatter={(v) => [`${currency}${fmt(Number(v))}`, undefined]} />
                    </PieChart>
                  </ResponsiveContainer>
                  <div className="flex flex-col gap-3">
                    <div className="flex items-center gap-2">
                      <div className="w-3 h-3 rounded-full bg-green-500" />
                      <div><div className="text-xs text-gray-400">{t("legendPrincipal")}</div><div className="text-sm font-semibold text-white">{currency}{fmt(activeAmount)}</div></div>
                    </div>
                    <div className="flex items-center gap-2">
                      <div className="w-3 h-3 rounded-full bg-red-500" />
                      <div><div className="text-xs text-gray-400">{t("legendInterest")}</div><div className="text-sm font-semibold text-white">{currency}{fmt(activeCalc.totalInterest)}</div></div>
                    </div>
                  </div>
                </div>
              </div>

              {/* Amortisation table */}
              <div className="bg-[#0d1426] border border-gray-800 rounded-xl overflow-hidden">
                <button onClick={() => setShowTable(!showTable)} className="w-full flex items-center justify-between px-6 py-4 text-sm font-semibold text-white hover:bg-gray-800/20 transition">
                  <span>{t("tableTitle")}</span>
                  <span className="text-gray-500 text-xs">{showTable ? `▲ ${t("collapse")}` : `▼ ${t("expand")}`}</span>
                </button>
                {showTable && (
                  <div className="px-6 pb-6 border-t border-gray-800 overflow-x-auto">
                    <table className="w-full text-xs mt-4">
                      <thead>
                        <tr className="border-b border-gray-700">
                          {[t("colMonth"), t("colPayment"), t("colInterest"), t("colPrincipal"), t("colBalance")].map(h => (
                            <th key={h} className="text-left text-gray-400 uppercase tracking-wider py-2 pr-4 font-semibold">{h}</th>
                          ))}
                        </tr>
                      </thead>
                      <tbody>
                        {activeCalc.schedule.slice(0, 24).map(row => (
                          <tr key={row.period} className="border-b border-gray-800 hover:bg-gray-800/20">
                            <td className="py-1.5 pr-4 text-white font-medium">{row.period}</td>
                            <td className="py-1.5 pr-4 text-gray-300">{currency}{fmtM(row.payment)}</td>
                            <td className="py-1.5 pr-4 text-red-400">{currency}{fmtM(row.interest)}</td>
                            <td className="py-1.5 pr-4 text-green-400">{currency}{fmtM(row.principal)}</td>
                            <td className="py-1.5 pr-4 text-gray-300">{currency}{fmt(row.balance)}</td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                    {activeCalc.schedule.length > 24 && <p className="text-xs text-gray-600 mt-2">Showing first 24 months of {activeCalc.schedule.length}</p>}
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>
      </div>
      <div className="max-w-7xl mx-auto px-4 sm:px-6 pb-8">
        <p className="text-xs font-bold uppercase tracking-wider text-gray-600 mb-3">{tc("alsoTry")}</p>
        <div className="flex flex-wrap gap-3">
          {[
            { label: "💰 Personal Budget", href: "/tools/personal-budget" },
            { label: "💹 Compound Interest", href: "/tools/compound-interest" },
            { label: "💧 Cash Flow Forecast", href: "/tools/cash-flow" },
          ].map(tool => (
            <Link key={tool.href} href={tool.href}
              className="text-sm text-gray-400 hover:text-white border border-gray-700 hover:border-blue-500 px-4 py-2 rounded-lg transition">
              {tool.label}
            </Link>
          ))}
        </div>
      </div>
            <LendingChat
              currency={currency}
              api={{
                tab, setTab,
                loan: { amount: lAmount, rate: lRate, years: lYears },
                setLoan: p => { if (p.amount !== undefined) setLAmount(p.amount); if (p.rate !== undefined) setLRate(p.rate); if (p.years !== undefined) setLYears(p.years); },
                mortgage: { amount: mAmount, rate: mRate, years: mYears, savingsRate: mSavRate },
                setMortgage: p => { if (p.amount !== undefined) setMAmount(p.amount); if (p.rate !== undefined) setMRate(p.rate); if (p.years !== undefined) setMYears(p.years); if (p.savingsRate !== undefined) setMSavRate(p.savingsRate); },
                payment: activeCalc.pmt,
                totalInterest: activeCalc.totalInterest,
              }}
            />
            <RelatedTools current="lending" />
      <p className="text-center text-xs text-gray-600 pb-8 px-4">{tc("disclaimer")}</p>
    </main>
  );
}
