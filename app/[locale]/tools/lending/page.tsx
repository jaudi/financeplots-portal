"use client";

import { useState, useMemo, useCallback } from "react";
import Link from "next/link";
import { useTranslations } from "next-intl";
import RelatedTools from "@/components/RelatedTools";
import { buildSchedule } from "@/lib/calculators";
import {
  AreaChart, Area, LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, Legend,
  ResponsiveContainer, PieChart, Pie, Cell, Tooltip as PieTooltip,
} from "recharts";

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

function NumInput({ label, value, onChange, min = 0, step = 1000, prefix = "£" }: {
  label: string; value: number; onChange: (v: number) => void; min?: number; step?: number; prefix?: string;
}) {
  return (
    <div className="flex flex-col gap-1">
      <label className="text-xs text-gray-400 font-medium">{label}</label>
      <div className="flex items-center bg-[#111827] border border-gray-700 rounded-lg px-3 py-2 focus-within:border-blue-500 transition">
        {prefix && <span className="text-gray-500 text-sm mr-1.5 shrink-0">{prefix}</span>}
        <input type="number" min={min} step={step} value={value} onChange={e => onChange(parseFloat(e.target.value) || 0)} className="bg-transparent text-white text-sm w-full outline-none" />
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
  const t = useTranslations("lending");
  const tc = useTranslations("toolCommon");
  const [tab, setTab] = useState<"loan" | "mortgage">("loan");
  const [lAmount, setLAmount] = useState(20000);
  const [lRate, setLRate] = useState(5.0);
  const [lYears, setLYears] = useState(5);
  const [mAmount, setMAmount] = useState(250000);
  const [mRate, setMRate] = useState(4.5);
  const [mYears, setMYears] = useState(25);
  const [mSavRate, setMSavRate] = useState(6.0);
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
      URL.revokeObjectURL(url);
    } finally {
      setIsExporting(false);
    }
  }, [tab, activeAmount, activeRate, activeYears, activeCalc]);

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
          <div className="flex items-center gap-3">
            <Link href="/tools" className="text-gray-400 hover:text-white text-sm transition">{tc("allTools")}</Link>
            <span className="text-gray-700 hidden sm:block">|</span>
            <h1 className="text-white font-bold hidden sm:block">{t("title")}</h1>
          </div>
          <button onClick={handleExportPdf} disabled={isExporting} className="flex items-center gap-2 bg-blue-600 hover:bg-blue-500 disabled:opacity-40 text-white font-semibold px-4 py-2 rounded-lg text-sm transition">
            {isExporting ? tc("generating") : tc("exportPdf")}
          </button>
        </div>
      </div>

      <div className="pt-[133px] pb-20">
        <div className="max-w-7xl mx-auto px-4 sm:px-6">
          {/* Tabs */}
          <div className="flex gap-2 mb-6">
            {([{ id: "loan", label: t("tabLoan") }, { id: "mortgage", label: t("tabMortgage") }] as { id: "loan" | "mortgage"; label: string }[]).map(tb => (
              <button key={tb.id} onClick={() => setTab(tb.id)}
                className={`px-5 py-2 rounded-lg text-sm font-semibold transition ${tab === tb.id ? "bg-blue-600 text-white" : "bg-[#0d1426] text-gray-400 border border-gray-800 hover:text-white"}`}>
                {tb.label}
              </button>
            ))}
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
              </div>
            </aside>

            {/* Main content */}
            <div className="flex-1 min-w-0 flex flex-col gap-6">
              {/* KPIs */}
              <div className="grid grid-cols-2 xl:grid-cols-4 gap-3">
                <KpiCard label={t("kpiPayment")} value={`£${fmtM(activeCalc.pmt)}`} sub={`${activeYears}-year term`} />
                <KpiCard label={t("kpiTotal")} value={`£${fmt(activeCalc.totalPaid)}`} sub={`Loan: £${fmt(activeAmount)}`} />
                <KpiCard label={t("kpiInterest")} value={`£${fmt(activeCalc.totalInterest)}`} sub={`${activeAmount > 0 ? ((activeCalc.totalInterest / activeAmount) * 100).toFixed(1) : 0}% of loan`} color="red" />
                <KpiCard label={t("kpiRate")} value={`${activeRate}%`} sub="Annual" />
              </div>

              {/* Early Repayment (mortgage only) */}
              {tab === "mortgage" && mCalc.earlyRepay && (
                <div className="bg-[#0d1426] border border-gray-800 rounded-xl p-6">
                  <h2 className="text-white font-bold mb-4">{t("earlyRepaymentTitle")}</h2>
                  <div className="grid grid-cols-2 xl:grid-cols-4 gap-3 mb-4">
                    <KpiCard label="Balance at Year -5" value={`£${fmt(mCalc.earlyRepay.balAtCutoff)}`} sub={`After ${mYears - 5} years`} />
                    <KpiCard label="Interest Saved" value={`£${fmt(mCalc.earlyRepay.interestSaved)}`} sub="Last 5 years eliminated" color="green" />
                    <KpiCard label="Monthly Saving" value={`£${fmtM(mCalc.earlyRepay.monthly)}`} sub={`Over ${mCalc.earlyRepay.monthsToSave} months`} />
                    <KpiCard label="Strategy" value={mCalc.earlyRepay.recommend ? "Invest" : "Repay Early"} sub={`Savings (${mSavRate}%) ${mCalc.earlyRepay.recommend ? ">" : "<"} mortgage (${mRate}%)`} color={mCalc.earlyRepay.recommend ? "green" : "blue"} />
                  </div>
                  <div className={`rounded-xl p-4 text-sm ${mCalc.earlyRepay.recommend ? "bg-green-900/20 border border-green-700/40 text-green-300" : "bg-blue-900/20 border border-blue-700/40 text-blue-300"}`}>
                    💡 {mCalc.earlyRepay.recommend
                      ? `Invest instead of repaying early. Your savings rate (${mSavRate}%) exceeds the mortgage rate (${mRate}%). Invest the £${fmtM(mCalc.earlyRepay.monthly)}/mo instead.`
                      : `Pay off early. Your mortgage rate (${mRate}%) exceeds what savings earn (${mSavRate}%). Save £${fmtM(mCalc.earlyRepay.monthly)}/mo for ${mCalc.earlyRepay.monthsToSave} months to save £${fmt(mCalc.earlyRepay.interestSaved)} in interest.`}
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
                      <YAxis stroke="#374151" tick={{ fill: "#6b7280", fontSize: 10 }} tickFormatter={v => `£${(v / 1000).toFixed(0)}k`} width={55} />
                      <Tooltip contentStyle={tooltipStyle} formatter={(v) => [`£${fmtM(Number(v))}`, undefined]} />
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
                      <YAxis stroke="#374151" tick={{ fill: "#6b7280", fontSize: 10 }} tickFormatter={v => `£${(v / 1000).toFixed(0)}k`} width={55} />
                      <Tooltip contentStyle={tooltipStyle} formatter={(v) => [`£${fmt(Number(v))}`, undefined]} />
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
                      <PieTooltip contentStyle={tooltipStyle} formatter={(v) => [`£${fmt(Number(v))}`, undefined]} />
                    </PieChart>
                  </ResponsiveContainer>
                  <div className="flex flex-col gap-3">
                    <div className="flex items-center gap-2">
                      <div className="w-3 h-3 rounded-full bg-green-500" />
                      <div><div className="text-xs text-gray-400">{t("legendPrincipal")}</div><div className="text-sm font-semibold text-white">£{fmt(activeAmount)}</div></div>
                    </div>
                    <div className="flex items-center gap-2">
                      <div className="w-3 h-3 rounded-full bg-red-500" />
                      <div><div className="text-xs text-gray-400">{t("legendInterest")}</div><div className="text-sm font-semibold text-white">£{fmt(activeCalc.totalInterest)}</div></div>
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
                            <td className="py-1.5 pr-4 text-gray-300">£{fmtM(row.payment)}</td>
                            <td className="py-1.5 pr-4 text-red-400">£{fmtM(row.interest)}</td>
                            <td className="py-1.5 pr-4 text-green-400">£{fmtM(row.principal)}</td>
                            <td className="py-1.5 pr-4 text-gray-300">£{fmt(row.balance)}</td>
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
            <RelatedTools current="lending" />
      <p className="text-center text-xs text-gray-600 pb-8 px-4">{tc("disclaimer")}</p>
    </main>
  );
}
