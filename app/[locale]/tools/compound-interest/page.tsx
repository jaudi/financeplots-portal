"use client";

import { useState, useMemo, useCallback } from "react";
import Link from "next/link";
import { useTranslations } from "next-intl";
import RelatedTools from "@/components/RelatedTools";
import { compoundGrowth } from "@/lib/calculators";
import {
  AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer,
} from "recharts";

const fmt = (n: number) => n.toLocaleString("en-GB", { maximumFractionDigits: 0 });

const PRESETS = [
  { label: "S&P 500", rate: 10 },
  { label: "Global", rate: 8 },
  { label: "Bonds", rate: 4 },
  { label: "Savings", rate: 2 },
  { label: "Custom", rate: null },
];

function KpiCard({ label, value, sub, color = "blue" }: { label: string; value: string; sub: string; color?: "blue" | "green" | "gold" }) {
  const border = color === "green" ? "border-l-green-500" : color === "gold" ? "border-l-yellow-400" : "border-l-blue-500";
  return (
    <div className={`bg-[#0d1426] border border-gray-800 border-l-4 ${border} rounded-xl p-4`}>
      <div className="text-xs text-gray-400 uppercase tracking-wider font-semibold mb-1">{label}</div>
      <div className="text-2xl font-extrabold text-white leading-tight">{value}</div>
      <div className="text-xs text-gray-500 mt-1">{sub}</div>
    </div>
  );
}

function NumInput({ label, value, onChange, min = 0, step = 100, prefix = "£" }: {
  label: string; value: number; onChange: (v: number) => void; min?: number; step?: number; prefix?: string;
}) {
  return (
    <div className="flex flex-col gap-1">
      <label className="text-xs text-gray-400 font-medium">{label}</label>
      <div className="flex items-center bg-[#111827] border border-gray-700 rounded-lg px-3 py-2 focus-within:border-blue-500 transition">
        {prefix && <span className="text-gray-500 text-sm mr-1.5 shrink-0">{prefix}</span>}
        <input
          type="number"
          min={min}
          step={step}
          value={value}
          onChange={e => onChange(parseFloat(e.target.value) || 0)}
          className="bg-transparent text-white text-sm w-full outline-none"
        />
      </div>
    </div>
  );
}

export default function CompoundInterestPage() {
  const t = useTranslations("compoundInterest");
  const tc = useTranslations("toolCommon");
  const presetLabels = [t("presetSP"), t("presetGlobal"), t("presetBonds"), t("presetSavings"), t("presetCustom")];

  const [initialCapital, setInitialCapital] = useState(10000);
  const [monthlyContribution, setMonthlyContribution] = useState(500);
  const [years, setYears] = useState(20);
  const [preset, setPreset] = useState(1); // index into PRESETS, 1 = Global 8%
  const [customRate, setCustomRate] = useState(8);
  const [isExporting, setIsExporting] = useState(false);

  const annualRate = PRESETS[preset].rate ?? customRate;

  const { rows, finalValue, totalInvested, totalInterest, returnMultiple, chartData } = useMemo(() => {
    const { rows, finalValue, totalInvested, totalInterest, returnMultiple } =
      compoundGrowth(initialCapital, monthlyContribution, years, annualRate);

    const chartData = rows.map(r => ({
      year: r.year,
      "Initial Capital": initialCapital,
      "Contributions": Math.max(0, r.totalContributed - initialCapital),
      "Interest": r.interestEarned,
    }));

    return { rows, finalValue, totalInvested, totalInterest, returnMultiple, chartData };
  }, [initialCapital, monthlyContribution, years, annualRate]);

  const handleExportPdf = useCallback(async () => {
    setIsExporting(true);
    try {
      const { pdf } = await import("@react-pdf/renderer");
      const { default: CompoundPDF } = await import("./pdf");
      const blob = await pdf(
        <CompoundPDF
          initialCapital={initialCapital}
          monthlyContribution={monthlyContribution}
          years={years}
          annualRate={annualRate}
          finalValue={finalValue}
          totalInvested={totalInvested}
          totalInterest={totalInterest}
          returnMultiple={returnMultiple}
          rows={rows}
        />
      ).toBlob();
      const url = URL.createObjectURL(blob);
      const a = document.createElement("a");
      a.href = url;
      a.download = "compound-interest.pdf";
      a.click();
      URL.revokeObjectURL(url);
    } finally {
      setIsExporting(false);
    }
  }, [initialCapital, monthlyContribution, years, annualRate, finalValue, totalInvested, totalInterest, returnMultiple, rows]);

  return (
    <main className="min-h-screen bg-[#0a0f1e] text-white">
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify({
          "@context": "https://schema.org",
          "@type": "SoftwareApplication",
          "name": "Compound Interest Calculator",
          "description": "Calculate compound interest growth with interactive charts. See how your investments grow over time. Free, no signup.",
          "url": "https://www.financeplots.com/tools/compound-interest",
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
          <button
            onClick={handleExportPdf}
            disabled={isExporting}
            className="flex items-center gap-2 bg-blue-600 hover:bg-blue-500 disabled:opacity-40 text-white font-semibold px-4 py-2 rounded-lg text-sm transition"
          >
            {isExporting ? tc("generating") : tc("exportPdf")}
          </button>
        </div>
      </div>

      <div className="pt-[133px] pb-20">
        <div className="max-w-7xl mx-auto px-4 sm:px-6">
          <div className="flex flex-col lg:flex-row gap-6">
            {/* Sidebar */}
            <aside className="lg:w-72 xl:w-80 shrink-0">
              <div className="lg:sticky lg:top-[133px] flex flex-col gap-4">
                {/* Capital & Contributions */}
                <div className="bg-[#0d1426] border border-gray-800 rounded-xl p-5">
                  <h3 className="text-xs font-bold uppercase tracking-wider text-blue-400 mb-3">{t("sectionCapital")}</h3>
                  <div className="flex flex-col gap-3">
                    <NumInput label={t("labelInitial")} value={initialCapital} onChange={setInitialCapital} step={500} />
                    <NumInput label={t("labelMonthly")} value={monthlyContribution} onChange={setMonthlyContribution} step={50} />
                    <div className="flex flex-col gap-1">
                      <label className="text-xs text-gray-400 font-medium">{t("labelHorizon")}: {years} years</label>
                      <input
                        type="range"
                        min={1}
                        max={50}
                        value={years}
                        onChange={e => setYears(parseInt(e.target.value))}
                        className="w-full accent-blue-500"
                      />
                      <div className="flex justify-between text-xs text-gray-600">
                        <span>1yr</span><span>25yr</span><span>50yr</span>
                      </div>
                    </div>
                  </div>
                </div>

                {/* Return Rate */}
                <div className="bg-[#0d1426] border border-gray-800 rounded-xl p-5">
                  <h3 className="text-xs font-bold uppercase tracking-wider text-blue-400 mb-3">{t("sectionReturn")}</h3>
                  <div className="flex flex-col gap-3">
                    <div className="grid grid-cols-2 gap-2">
                      {PRESETS.map((p, i) => (
                        <button
                          key={p.label}
                          onClick={() => setPreset(i)}
                          className={`py-2 px-3 rounded-lg text-xs font-semibold transition ${preset === i ? "bg-blue-600 text-white" : "bg-[#111827] text-gray-400 border border-gray-700 hover:text-white"}`}
                        >
                          {presetLabels[i]}{p.rate !== null ? ` ${p.rate}%` : ""}
                        </button>
                      ))}
                    </div>
                    {PRESETS[preset].rate === null && (
                      <NumInput label={t("labelCustomRate")} value={customRate} onChange={setCustomRate} prefix="%" step={0.5} />
                    )}
                    <div className="bg-[#111827] border border-gray-800 rounded-lg p-3 text-xs text-gray-400 leading-relaxed">
                      <div className="font-semibold text-gray-300 mb-1">{t("benchmarksTitle")}</div>
                      <div>🇺🇸 {t("bench1")}</div>
                      <div>🌍 {t("bench2")}</div>
                      <div>🏦 {t("bench3")}</div>
                      <div>💶 {t("bench4")}</div>
                      <div className="text-gray-600 mt-1">{t("disclaimer")}</div>
                    </div>
                  </div>
                </div>
              </div>
            </aside>

            {/* Main content */}
            <div className="flex-1 min-w-0 flex flex-col gap-6">
              {/* KPI Cards */}
              <div className="grid grid-cols-2 xl:grid-cols-4 gap-3">
                <KpiCard label={t("kpiFinal")} value={`£${fmt(finalValue)}`} sub={`${t("kpiFinalSub").replace("{years}", String(years))}`} />
                <KpiCard label={t("kpiInvested")} value={`£${fmt(totalInvested)}`} sub={t("kpiInvestedSub")} />
                <KpiCard label={t("kpiInterest")} value={`£${fmt(totalInterest)}`} sub={`${finalValue > 0 ? ((totalInterest / finalValue) * 100).toFixed(0) : 0}% ${t("kpiInterestSub")}`} color="green" />
                <KpiCard label={t("kpiMultiple")} value={`${returnMultiple.toFixed(1)}×`} sub={t("kpiMultipleSub").replace("{x}", returnMultiple.toFixed(2))} color="gold" />
              </div>

              {/* Growth Chart */}
              <div className="bg-[#0d1426] border border-gray-800 rounded-xl p-6">
                <h2 className="text-white font-bold mb-5">{t("chartTitle")}</h2>
                <ResponsiveContainer width="100%" height={360}>
                  <AreaChart data={chartData} margin={{ top: 10, right: 20, bottom: 20, left: 10 }}>
                    <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.05)" />
                    <XAxis
                      dataKey="year"
                      stroke="#374151"
                      tick={{ fill: "#6b7280", fontSize: 11 }}
                      label={{ value: t("chartAxisYear"), position: "insideBottom", offset: -10, fill: "#6b7280", fontSize: 11 }}
                    />
                    <YAxis
                      stroke="#374151"
                      tick={{ fill: "#6b7280", fontSize: 11 }}
                      tickFormatter={v => v >= 1000000 ? `£${(v / 1000000).toFixed(1)}M` : `£${(v / 1000).toFixed(0)}k`}
                      width={70}
                    />
                    <Tooltip
                      contentStyle={{ backgroundColor: "#111827", border: "1px solid #1e293b", borderRadius: "8px", color: "#f1f5f9", fontSize: 12 }}
                      formatter={(value) => [`£${fmt(Number(value))}`, undefined]}
                      labelFormatter={v => `Year ${v}`}
                    />
                    <Legend wrapperStyle={{ color: "#9ca3af", fontSize: 12, paddingTop: 16 }} />
                    <Area type="monotone" dataKey="Initial Capital" stackId="1" stroke="#1d4ed8" fill="#1d4ed8" fillOpacity={0.7} />
                    <Area type="monotone" dataKey="Contributions" stackId="1" stroke="#3b82f6" fill="#3b82f6" fillOpacity={0.7} />
                    <Area type="monotone" dataKey="Interest" stackId="1" stroke="#22c55e" fill="#22c55e" fillOpacity={0.7} />
                  </AreaChart>
                </ResponsiveContainer>
              </div>

              {/* Year-by-Year Table */}
              <div className="bg-[#0d1426] border border-gray-800 rounded-xl p-6">
                <h2 className="text-white font-bold mb-4">{t("tableTitle")}</h2>
                <div className="overflow-x-auto">
                  <table className="w-full text-sm">
                    <thead>
                      <tr className="border-b border-gray-700">
                        {[t("colYear"), t("colPortfolio"), t("colContributed"), t("colInterest")].map(h => (
                          <th key={h} className="text-left text-xs text-gray-400 uppercase tracking-wider py-2 pr-4 font-semibold">{h}</th>
                        ))}
                      </tr>
                    </thead>
                    <tbody>
                      {rows.map(row => (
                        <tr key={row.year} className="border-b border-gray-800 hover:bg-gray-800/20 transition text-xs">
                          <td className="py-2 pr-4 text-white font-medium">{row.year}</td>
                          <td className="py-2 pr-4 text-blue-300 font-semibold">£{fmt(row.portfolioValue)}</td>
                          <td className="py-2 pr-4 text-gray-300">£{fmt(row.totalContributed)}</td>
                          <td className="py-2 pr-4 text-green-400">£{fmt(row.interestEarned)}</td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
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
            { label: "🏠 Mortgage & Loans", href: "/tools/lending" },
            { label: "🗺️ Financial Journey", href: "/tools/financial-planner" },
          ].map(tool => (
            <Link key={tool.href} href={tool.href}
              className="text-sm text-gray-400 hover:text-white border border-gray-700 hover:border-blue-500 px-4 py-2 rounded-lg transition">
              {tool.label}
            </Link>
          ))}
        </div>
      </div>
            <RelatedTools current="compound-interest" />
      <p className="text-center text-xs text-gray-600 pb-8 px-4">{tc("disclaimer")}</p>
    </main>
  );
}
