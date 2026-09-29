"use client";

import { useState, useMemo, useCallback } from "react";
import Link from "next/link";
import { useTranslations } from "next-intl";
import RelatedTools from "@/components/RelatedTools";
import SpreadsheetIO from "@/components/SpreadsheetIO";
import type { SheetField, SheetValues } from "@/lib/spreadsheet-io";
import {
  BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer,
  LineChart, Line,
} from "recharts";

const fmt = (n: number) => n.toLocaleString("en-GB", { maximumFractionDigits: 0 });
const fmtM = (n: number) => n.toLocaleString("en-GB", { minimumFractionDigits: 1, maximumFractionDigits: 1 });

const MONTHS = ["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"];

// Inputs as spreadsheet rows (components/SpreadsheetIO.tsx). The budget is
// driver-based, so monthly figures come in as revenue + seasonality and one
// cost rate each — see applySheet.
const SHEET_FIELDS: SheetField[] = [
  { key: "company", kind: "text", label: { en: "Company name", es: "Nombre de la empresa" } },
  { key: "year", kind: "number", label: { en: "Budget year", es: "Año del presupuesto" } },
  { key: "taxRate", kind: "number", unit: "%", label: { en: "Tax rate", es: "Tipo impositivo" } },
  { key: "revenue", kind: "series", periods: MONTHS, label: { en: "Revenue", es: "Ingresos" } },
  { key: "cogs", kind: "series", periods: MONTHS, label: { en: "Cost of sales", es: "Coste de ventas" } },
  { key: "opex", kind: "series", periods: MONTHS, label: { en: "Operating expenses", es: "Gastos operativos" } },
];

const sum = (xs: number[]) => xs.reduce((a, b) => a + b, 0);
const round = (n: number, dp: number) => Math.round(n * 10 ** dp) / 10 ** dp;

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

function PctInput({ label, value, onChange }: { label: string; value: number; onChange: (v: number) => void }) {
  return (
    <div className="flex flex-col gap-1">
      <label className="text-xs text-gray-400">{label}</label>
      <div className="flex items-center bg-[#111827] border border-gray-700 rounded-lg px-3 py-1.5 focus-within:border-blue-500 transition">
        <input
          type="number"
          step={0.5}
          value={value}
          onChange={e => onChange(parseFloat(e.target.value) || 0)}
          className="bg-transparent text-white text-sm w-full outline-none"
        />
        <span className="text-gray-500 text-sm ml-1 shrink-0">%</span>
      </div>
    </div>
  );
}

export default function AnnualBudgetPage() {
  const t = useTranslations("annualBudget");
  const tc = useTranslations("toolCommon");
  const [companyName, setCompanyName] = useState("My Company");
  const [year, setYear] = useState(new Date().getFullYear());
  const [baseRevenue, setBaseRevenue] = useState(100000);
  const [seasonalityEnabled, setSeasonalityEnabled] = useState(false);
  // Seasonality multipliers for each month (default: flat 1.0)
  const [seasonality, setSeasonality] = useState<number[]>(() => Array(12).fill(1.0));
  const [cogsRate, setCogsRate] = useState(40);
  const [opexRate, setOpexRate] = useState(30);
  const [taxRate, setTaxRate] = useState(25);
  const [isExporting, setIsExporting] = useState(false);

  // Monthly revenue → a base (the average month) and a seasonality multiplier
  // per month. Monthly costs → one rate each, as a share of the year's revenue.
  function applySheet(v: SheetValues): string | void {
    if (typeof v.company === "string") setCompanyName(v.company);
    if (typeof v.year === "number") setYear(Math.round(v.year));
    if (typeof v.taxRate === "number") setTaxRate(v.taxRate);
    let annualRevenue = sum(months.map(m => m.revenue));
    if (Array.isArray(v.revenue)) {
      const avg = sum(v.revenue) / 12;
      annualRevenue = sum(v.revenue);
      if (avg > 0) {
        setBaseRevenue(Math.round(avg));
        const mult = v.revenue.map(r => round(r / avg, 3));
        setSeasonality(mult);
        setSeasonalityEnabled(mult.some(m => m !== 1));
      }
    }
    const notes: string[] = [];
    if (annualRevenue > 0) {
      if (Array.isArray(v.cogs)) {
        const rate = round((sum(v.cogs) / annualRevenue) * 100, 1);
        setCogsRate(rate);
        notes.push(`${t("rowCOGS")}: ${rate}%`);
      }
      if (Array.isArray(v.opex)) {
        const rate = round((sum(v.opex) / annualRevenue) * 100, 1);
        setOpexRate(rate);
        notes.push(`${t("rowOpEx")}: ${rate}%`);
      }
    }
    if (notes.length) return t("sheetRatesNote", { rates: notes.join(", ") });
  }

  const months = useMemo(() => {
    return MONTHS.map((month, i) => {
      const multiplier = seasonalityEnabled ? seasonality[i] : 1.0;
      const revenue = Math.round(baseRevenue * multiplier);
      const cogs = Math.round(revenue * (cogsRate / 100));
      const grossProfit = revenue - cogs;
      const opex = Math.round(revenue * (opexRate / 100));
      const ebitda = grossProfit - opex;
      const tax = ebitda > 0 ? Math.round(ebitda * (taxRate / 100)) : 0;
      const netIncome = ebitda - tax;
      return { month, revenue, cogs, grossProfit, opex, ebitda, netIncome };
    });
  }, [baseRevenue, seasonalityEnabled, seasonality, cogsRate, opexRate, taxRate]);

  const totals = useMemo(() => ({
    revenue: months.reduce((a, m) => a + m.revenue, 0),
    cogs: months.reduce((a, m) => a + m.cogs, 0),
    grossProfit: months.reduce((a, m) => a + m.grossProfit, 0),
    opex: months.reduce((a, m) => a + m.opex, 0),
    ebitda: months.reduce((a, m) => a + m.ebitda, 0),
    netIncome: months.reduce((a, m) => a + m.netIncome, 0),
  }), [months]);

  const avgGrossMargin = totals.revenue > 0 ? (totals.grossProfit / totals.revenue) * 100 : 0;
  const avgEbitdaMargin = totals.revenue > 0 ? (totals.ebitda / totals.revenue) * 100 : 0;

  const chartData = months.map(m => ({
    month: m.month,
    Revenue: m.revenue,
    "Gross Profit": m.grossProfit,
    EBITDA: m.ebitda,
    "Net Income": m.netIncome,
  }));

  const marginData = months.map(m => ({
    month: m.month,
    "Gross Margin": m.revenue > 0 ? parseFloat(((m.grossProfit / m.revenue) * 100).toFixed(1)) : 0,
    "EBITDA Margin": m.revenue > 0 ? parseFloat(((m.ebitda / m.revenue) * 100).toFixed(1)) : 0,
  }));

  const handleExportPdf = useCallback(async () => {
    setIsExporting(true);
    try {
      const { pdf } = await import("@react-pdf/renderer");
      const { default: AnnualBudgetPDF } = await import("./pdf");
      const blob = await pdf(
        <AnnualBudgetPDF
          companyName={companyName}
          year={year}
          months={months}
          totalRevenue={totals.revenue}
          totalCogs={totals.cogs}
          totalGrossProfit={totals.grossProfit}
          totalOpex={totals.opex}
          totalEbitda={totals.ebitda}
          totalNetIncome={totals.netIncome}
          avgGrossMargin={avgGrossMargin}
          avgEbitdaMargin={avgEbitdaMargin}
        />
      ).toBlob();
      const url = URL.createObjectURL(blob);
      const a = document.createElement("a");
      a.href = url;
      a.download = "annual-budget.pdf";
      a.click();
      URL.revokeObjectURL(url);
    } finally {
      setIsExporting(false);
    }
  }, [companyName, year, months, totals, avgGrossMargin, avgEbitdaMargin]);

  return (
    <main className="min-h-screen bg-[#0a0f1e] text-white">
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify({
          "@context": "https://schema.org",
          "@type": "SoftwareApplication",
          "name": "Annual Budget Planner",
          "description": "Build a full annual budget with monthly breakdowns, income vs expense tracking, and variance analysis. Free, no signup.",
          "url": "https://www.financeplots.com/tools/annual-budget",
          "applicationCategory": "FinanceApplication",
          "operatingSystem": "Web",
          "offers": { "@type": "Offer", "price": "0", "priceCurrency": "GBP" },
          "provider": { "@type": "Organization", "name": "FinancePlots", "url": "https://www.financeplots.com" }
        })}}
      />
      <div className="fixed top-[65px] left-0 right-0 z-40 bg-[#0d1426]/95 backdrop-blur border-b border-gray-800 px-6 py-3">
        <div className="max-w-7xl mx-auto flex items-center justify-between gap-4">
          <div className="flex items-center gap-3">
            <Link href="/tools/business" className="text-gray-400 hover:text-white text-sm transition">{tc("backBusiness")}</Link>
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
                <SpreadsheetIO
                  title={`${companyName} — annual budget ${year}`}
                  fileName="annual-budget"
                  fields={SHEET_FIELDS}
                  getValues={() => ({
                    company: companyName,
                    year,
                    taxRate,
                    revenue: months.map(m => m.revenue),
                    cogs: months.map(m => m.cogs),
                    opex: months.map(m => m.opex),
                  })}
                  onImport={applySheet}
                />
                <div className="bg-[#0d1426] border border-gray-800 rounded-xl p-5">
                  <h3 className="text-xs font-bold uppercase tracking-wider text-blue-400 mb-3">{t("sectionCompany")}</h3>
                  <div className="flex flex-col gap-3">
                    <div className="flex flex-col gap-1">
                      <label className="text-xs text-gray-400">{t("labelCompany")}</label>
                      <input
                        value={companyName}
                        onChange={e => setCompanyName(e.target.value)}
                        className="bg-[#111827] border border-gray-700 rounded-lg px-3 py-2 text-white text-sm outline-none focus:border-blue-500 transition"
                      />
                    </div>
                    <div className="flex flex-col gap-1">
                      <label className="text-xs text-gray-400">{t("labelYear")}</label>
                      <input
                        type="number"
                        value={year}
                        onChange={e => setYear(parseInt(e.target.value) || new Date().getFullYear())}
                        className="bg-[#111827] border border-gray-700 rounded-lg px-3 py-2 text-white text-sm outline-none focus:border-blue-500 transition"
                      />
                    </div>
                  </div>
                </div>

                <div className="bg-[#0d1426] border border-gray-800 rounded-xl p-5">
                  <h3 className="text-xs font-bold uppercase tracking-wider text-blue-400 mb-3">{t("sectionRevenue")}</h3>
                  <div className="flex flex-col gap-3">
                    <div className="flex flex-col gap-1">
                      <label className="text-xs text-gray-400">{t("labelBaseRevenue")}</label>
                      <div className="flex items-center bg-[#111827] border border-gray-700 rounded-lg px-3 py-2 focus-within:border-blue-500 transition">
                        <span className="text-gray-500 text-sm mr-1.5 shrink-0">£</span>
                        <input
                          type="number"
                          min={0}
                          step={5000}
                          value={baseRevenue}
                          onChange={e => setBaseRevenue(parseFloat(e.target.value) || 0)}
                          className="bg-transparent text-white text-sm w-full outline-none"
                        />
                      </div>
                    </div>
                    <label className="flex items-center gap-2 cursor-pointer">
                      <input
                        type="checkbox"
                        checked={seasonalityEnabled}
                        onChange={e => setSeasonalityEnabled(e.target.checked)}
                        className="accent-blue-500 w-4 h-4"
                      />
                      <span className="text-xs text-gray-300">{t("labelSeasonality")}</span>
                    </label>
                    {seasonalityEnabled && (
                      <div className="grid grid-cols-3 gap-1.5">
                        {MONTHS.map((m, i) => (
                          <div key={m} className="flex flex-col gap-0.5">
                            <label className="text-xs text-gray-500">{m}</label>
                            <input
                              type="number"
                              step={0.05}
                              min={0}
                              value={seasonality[i]}
                              onChange={e => {
                                const v = parseFloat(e.target.value) || 0;
                                setSeasonality(prev => { const n = [...prev]; n[i] = v; return n; });
                              }}
                              className="bg-[#111827] border border-gray-700 rounded px-2 py-1 text-white text-xs outline-none focus:border-blue-500 w-full"
                            />
                          </div>
                        ))}
                        <div className="col-span-3 text-xs text-gray-500 mt-1">{t("seasonalityNote")}</div>
                      </div>
                    )}
                  </div>
                </div>

                <div className="bg-[#0d1426] border border-gray-800 rounded-xl p-5">
                  <h3 className="text-xs font-bold uppercase tracking-wider text-blue-400 mb-3">{t("sectionCosts")}</h3>
                  <div className="flex flex-col gap-3">
                    <PctInput label={t("labelCOGS")} value={cogsRate} onChange={setCogsRate} />
                    <PctInput label={t("labelOpEx")} value={opexRate} onChange={setOpexRate} />
                    <PctInput label={t("labelTax")} value={taxRate} onChange={setTaxRate} />
                  </div>
                </div>

                {/* Annual Summary Sidebar */}
                <div className="bg-[#0d1426] border border-gray-800 rounded-xl p-5">
                  <h3 className="text-xs font-bold uppercase tracking-wider text-blue-400 mb-3">Annual Totals</h3>
                  <div className="space-y-2 text-xs">
                    {[
                      { label: "Revenue", value: totals.revenue, color: "text-green-400" },
                      { label: "COGS", value: totals.cogs, color: "text-red-400" },
                      { label: "Gross Profit", value: totals.grossProfit, color: "text-white" },
                      { label: "OpEx", value: totals.opex, color: "text-red-400" },
                      { label: "EBITDA", value: totals.ebitda, color: "text-white" },
                      { label: "Net Income", value: totals.netIncome, color: totals.netIncome >= 0 ? "text-green-400" : "text-red-400" },
                    ].map(row => (
                      <div key={row.label} className="flex justify-between border-b border-gray-800 pb-1.5">
                        <span className="text-gray-400">{row.label}</span>
                        <span className={`font-semibold ${row.color}`}>£{fmt(row.value)}</span>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            </aside>

            {/* Main Content */}
            <div className="flex-1 min-w-0 flex flex-col gap-6">
              {/* KPI Cards */}
              <div className="grid grid-cols-2 xl:grid-cols-4 gap-3">
                <KpiCard label={t("kpiRevenue")} value={`£${fmt(totals.revenue)}`} sub={`${year}`} color="green" />
                <KpiCard label={t("kpiGrossProfit")} value={`£${fmt(totals.grossProfit)}`} sub={`${fmtM(avgGrossMargin)}% margin`} />
                <KpiCard label={t("kpiEBITDA")} value={`£${fmt(totals.ebitda)}`} sub={`${fmtM(avgEbitdaMargin)}% margin`} color={totals.ebitda >= 0 ? "green" : "red"} />
                <KpiCard label={t("kpiNetIncome")} value={`£${fmt(totals.netIncome)}`} sub="Bottom line" color={totals.netIncome >= 0 ? "green" : "red"} />
              </div>

              {/* Revenue & Profit Chart */}
              <div className="bg-[#0d1426] border border-gray-800 rounded-xl p-6">
                <h2 className="text-white font-bold mb-5">{t("chartMonthly")}</h2>
                <ResponsiveContainer width="100%" height={300}>
                  <BarChart data={chartData} margin={{ top: 10, right: 20, bottom: 0, left: 10 }}>
                    <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.05)" />
                    <XAxis dataKey="month" stroke="#374151" tick={{ fill: "#6b7280", fontSize: 11 }} />
                    <YAxis
                      stroke="#374151"
                      tick={{ fill: "#6b7280", fontSize: 11 }}
                      tickFormatter={v => v >= 1000000 ? `£${(v / 1000000).toFixed(1)}M` : `£${(v / 1000).toFixed(0)}k`}
                      width={70}
                    />
                    <Tooltip
                      contentStyle={{ backgroundColor: "#111827", border: "1px solid #1e293b", borderRadius: "8px", color: "#f1f5f9", fontSize: 12 }}
                      formatter={(value: unknown) => [`£${fmt(Number(value))}`, undefined]}
                    />
                    <Legend wrapperStyle={{ color: "#9ca3af", fontSize: 12, paddingTop: 8 }} />
                    <Bar dataKey="Revenue" fill="#1d4ed8" radius={[3, 3, 0, 0]} />
                    <Bar dataKey="Gross Profit" fill="#3b82f6" radius={[3, 3, 0, 0]} />
                    <Bar dataKey="EBITDA" fill="#22c55e" radius={[3, 3, 0, 0]} />
                    <Bar dataKey="Net Income" fill="#f59e0b" radius={[3, 3, 0, 0]} />
                  </BarChart>
                </ResponsiveContainer>
              </div>

              {/* Margins Chart */}
              <div className="bg-[#0d1426] border border-gray-800 rounded-xl p-6">
                <h2 className="text-white font-bold mb-5">{t("chartMargins")}</h2>
                <ResponsiveContainer width="100%" height={220}>
                  <LineChart data={marginData} margin={{ top: 10, right: 20, bottom: 0, left: 10 }}>
                    <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.05)" />
                    <XAxis dataKey="month" stroke="#374151" tick={{ fill: "#6b7280", fontSize: 11 }} />
                    <YAxis stroke="#374151" tick={{ fill: "#6b7280", fontSize: 11 }} tickFormatter={v => `${v}%`} width={45} />
                    <Tooltip
                      contentStyle={{ backgroundColor: "#111827", border: "1px solid #1e293b", borderRadius: "8px", color: "#f1f5f9", fontSize: 12 }}
                      formatter={(value: unknown) => [`${Number(value).toFixed(1)}%`, undefined]}
                    />
                    <Legend wrapperStyle={{ color: "#9ca3af", fontSize: 12, paddingTop: 8 }} />
                    <Line type="monotone" dataKey="Gross Margin" stroke="#3b82f6" strokeWidth={2} dot={false} />
                    <Line type="monotone" dataKey="EBITDA Margin" stroke="#22c55e" strokeWidth={2} dot={false} />
                  </LineChart>
                </ResponsiveContainer>
              </div>

              {/* Monthly Table */}
              <div className="bg-[#0d1426] border border-gray-800 rounded-xl p-6">
                <h2 className="text-white font-bold mb-4">{t("tableTitle")}</h2>
                <div className="overflow-x-auto">
                  <table className="w-full text-xs">
                    <thead>
                      <tr className="border-b border-gray-700">
                        {[t("colMonth"), "Revenue", "COGS", "Gross Profit", "OpEx", "EBITDA", "Net Income"].map(h => (
                          <th key={h} className="text-left text-xs text-gray-400 uppercase tracking-wider py-2 pr-4 font-semibold">{h}</th>
                        ))}
                      </tr>
                    </thead>
                    <tbody>
                      {months.map((m, idx) => (
                        <tr key={m.month} className={`border-b border-gray-800 text-xs transition hover:bg-gray-800/20 ${idx % 2 === 1 ? "bg-gray-900/20" : ""}`}>
                          <td className="py-2 pr-4 text-white font-semibold">{m.month}</td>
                          <td className="py-2 pr-4 text-green-400 font-semibold">£{fmt(m.revenue)}</td>
                          <td className="py-2 pr-4 text-red-400">£{fmt(m.cogs)}</td>
                          <td className="py-2 pr-4 text-gray-300">£{fmt(m.grossProfit)}</td>
                          <td className="py-2 pr-4 text-red-400">£{fmt(m.opex)}</td>
                          <td className="py-2 pr-4 text-gray-300">£{fmt(m.ebitda)}</td>
                          <td className={`py-2 pr-4 font-semibold ${m.netIncome >= 0 ? "text-green-400" : "text-red-400"}`}>£{fmt(m.netIncome)}</td>
                        </tr>
                      ))}
                      <tr className="border-t-2 border-blue-800 bg-blue-900/10 text-xs font-bold">
                        <td className="py-2 pr-4 text-white">{t("rowTotal")}</td>
                        <td className="py-2 pr-4 text-green-400">£{fmt(totals.revenue)}</td>
                        <td className="py-2 pr-4 text-red-400">£{fmt(totals.cogs)}</td>
                        <td className="py-2 pr-4 text-white">£{fmt(totals.grossProfit)}</td>
                        <td className="py-2 pr-4 text-red-400">£{fmt(totals.opex)}</td>
                        <td className="py-2 pr-4 text-white">£{fmt(totals.ebitda)}</td>
                        <td className={`py-2 pr-4 ${totals.netIncome >= 0 ? "text-green-400" : "text-red-400"}`}>£{fmt(totals.netIncome)}</td>
                      </tr>
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
            { label: "📊 5-Year Financial Model", href: "/tools/financial-model" },
            { label: "💧 Cash Flow Forecast", href: "/tools/cash-flow" },
            { label: "⚖️ Break-Even Analysis", href: "/tools/break-even" },
          ].map(tool => (
            <Link key={tool.href} href={tool.href}
              className="text-sm text-gray-400 hover:text-white border border-gray-700 hover:border-blue-500 px-4 py-2 rounded-lg transition">
              {tool.label}
            </Link>
          ))}
        </div>
      </div>
            <RelatedTools current="annual-budget" />
      <p className="text-center text-xs text-gray-600 pb-8 px-4">{tc("disclaimer")}</p>
    </main>
  );
}
