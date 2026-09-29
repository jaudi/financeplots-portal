"use client";

import { useState, useMemo, useCallback } from "react";
import Link from "next/link";
import { useTranslations } from "next-intl";
import RelatedTools from "@/components/RelatedTools";
import SpreadsheetIO from "@/components/SpreadsheetIO";
import type { SheetField } from "@/lib/spreadsheet-io";
import {
  AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer,
  BarChart, Bar, ReferenceLine,
} from "recharts";

const fmt = (n: number) => n.toLocaleString("en-GB", { maximumFractionDigits: 0 });

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

function NumInput({ label, value, onChange, prefix = "£", step = 1000 }: {
  label: string; value: number; onChange: (v: number) => void; prefix?: string; step?: number;
}) {
  return (
    <div className="flex flex-col gap-1">
      <label className="text-xs text-gray-400">{label}</label>
      <div className="flex items-center bg-[#111827] border border-gray-700 rounded-lg px-3 py-1.5 focus-within:border-blue-500 transition">
        <span className="text-gray-500 text-sm mr-1.5 shrink-0">{prefix}</span>
        <input
          type="number"
          step={step}
          value={value}
          onChange={e => onChange(parseFloat(e.target.value) || 0)}
          className="bg-transparent text-white text-sm w-full outline-none"
        />
      </div>
    </div>
  );
}

const WEEKS = Array.from({ length: 13 }, (_, i) => `W${i + 1}`);

// Inputs as spreadsheet rows (components/SpreadsheetIO.tsx).
const SHEET_FIELDS: SheetField[] = [
  { key: "name", kind: "text", label: { en: "Forecast name", es: "Nombre de la previsión" } },
  { key: "opening", kind: "number", label: { en: "Opening cash balance", es: "Saldo de caja inicial" } },
  { key: "inflows", kind: "series", periods: WEEKS, label: { en: "Cash inflows", es: "Cobros" } },
  { key: "outflows", kind: "series", periods: WEEKS, label: { en: "Cash outflows", es: "Pagos" } },
];

const WEEK_LABELS = [
  "Jan W1", "Jan W2", "Jan W3", "Jan W4",
  "Feb W1", "Feb W2", "Feb W3", "Feb W4",
  "Mar W1", "Mar W2", "Mar W3", "Mar W4",
  "Mar W5",
];

export default function CashFlowPage() {
  const t = useTranslations("cashFlow");
  const tc = useTranslations("toolCommon");
  const [forecastName, setForecastName] = useState("Q1 Forecast");
  const [openingBalance, setOpeningBalance] = useState(50000);
  // Weekly inflows & outflows
  const [weeklyInflows, setWeeklyInflows] = useState<number[]>(() => Array(13).fill(20000));
  const [weeklyOutflows, setWeeklyOutflows] = useState<number[]>(() => Array(13).fill(18000));
  // Inflow/outflow templates
  const [inflowGrowth, setInflowGrowth] = useState(0);
  const [outflowGrowth, setOutflowGrowth] = useState(0);
  const [isExporting, setIsExporting] = useState(false);
  const [showTable, setShowTable] = useState(true);

  const rows = useMemo(() => {
    let balance = openingBalance;
    return weeklyInflows.map((inflow, i) => {
      const outflow = weeklyOutflows[i];
      const net = inflow - outflow;
      const opening = balance;
      balance += net;
      return {
        week: i + 1,
        label: WEEK_LABELS[i],
        openingBalance: Math.round(opening),
        inflows: Math.round(inflow),
        outflows: Math.round(outflow),
        netCashFlow: Math.round(net),
        closingBalance: Math.round(balance),
      };
    });
  }, [openingBalance, weeklyInflows, weeklyOutflows]);

  const totalInflows = rows.reduce((a, r) => a + r.inflows, 0);
  const totalOutflows = rows.reduce((a, r) => a + r.outflows, 0);
  const closingBalance = rows[rows.length - 1]?.closingBalance ?? openingBalance;
  const minBalance = Math.min(...rows.map(r => r.closingBalance));
  const weeksNegative = rows.filter(r => r.closingBalance < 0).length;

  const chartData = rows.map(r => ({
    week: `W${r.week}`,
    Inflows: r.inflows,
    Outflows: r.outflows,
    Balance: r.closingBalance,
  }));

  const applyGrowthRates = () => {
    const g_in = inflowGrowth / 100;
    const g_out = outflowGrowth / 100;
    const baseIn = weeklyInflows[0];
    const baseOut = weeklyOutflows[0];
    setWeeklyInflows(Array.from({ length: 13 }, (_, i) => Math.round(baseIn * Math.pow(1 + g_in, i))));
    setWeeklyOutflows(Array.from({ length: 13 }, (_, i) => Math.round(baseOut * Math.pow(1 + g_out, i))));
  };

  const handleExportPdf = useCallback(async () => {
    setIsExporting(true);
    try {
      const { pdf } = await import("@react-pdf/renderer");
      const { default: CashFlowPDF } = await import("./pdf");
      const blob = await pdf(
        <CashFlowPDF
          forecastName={forecastName}
          openingBalance={openingBalance}
          totalInflows={totalInflows}
          totalOutflows={totalOutflows}
          closingBalance={closingBalance}
          minBalance={minBalance}
          weeksNegative={weeksNegative}
          rows={rows}
        />
      ).toBlob();
      const url = URL.createObjectURL(blob);
      const a = document.createElement("a");
      a.href = url;
      a.download = "cash-flow-forecast.pdf";
      a.click();
      URL.revokeObjectURL(url);
    } finally {
      setIsExporting(false);
    }
  }, [forecastName, openingBalance, totalInflows, totalOutflows, closingBalance, minBalance, weeksNegative, rows]);

  return (
    <main className="min-h-screen bg-[#0a0f1e] text-white">
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify({
          "@context": "https://schema.org",
          "@type": "SoftwareApplication",
          "name": "13-Week Cash Flow Forecast",
          "description": "Build a 13-week rolling cash flow forecast to manage liquidity and plan ahead. Free tool, instant PDF export.",
          "url": "https://www.financeplots.com/tools/cash-flow",
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
                  title={`13-week cash flow forecast — ${forecastName}`}
                  fileName="cash-flow-forecast"
                  fields={SHEET_FIELDS}
                  getValues={() => ({ name: forecastName, opening: openingBalance, inflows: weeklyInflows, outflows: weeklyOutflows })}
                  onImport={v => {
                    if (typeof v.name === "string") setForecastName(v.name);
                    if (typeof v.opening === "number") setOpeningBalance(v.opening);
                    if (Array.isArray(v.inflows)) setWeeklyInflows(v.inflows);
                    if (Array.isArray(v.outflows)) setWeeklyOutflows(v.outflows);
                  }}
                />
                {/* Settings */}
                <div className="bg-[#0d1426] border border-gray-800 rounded-xl p-5">
                  <h3 className="text-xs font-bold uppercase tracking-wider text-blue-400 mb-3">{t("sectionSettings")}</h3>
                  <div className="flex flex-col gap-3">
                    <div className="flex flex-col gap-1">
                      <label className="text-xs text-gray-400">{t("labelName")}</label>
                      <input
                        value={forecastName}
                        onChange={e => setForecastName(e.target.value)}
                        className="bg-[#111827] border border-gray-700 rounded-lg px-3 py-2 text-white text-sm outline-none focus:border-blue-500 transition"
                      />
                    </div>
                    <NumInput label={t("labelOpening")} value={openingBalance} onChange={setOpeningBalance} />
                  </div>
                </div>

                {/* Quick Setup */}
                <div className="bg-[#0d1426] border border-gray-800 rounded-xl p-5">
                  <h3 className="text-xs font-bold uppercase tracking-wider text-blue-400 mb-3">{t("sectionQuickSetup")}</h3>
                  <div className="flex flex-col gap-3">
                    <NumInput
                      label={t("labelWeek1Inflows")}
                      value={weeklyInflows[0]}
                      onChange={v => setWeeklyInflows(prev => { const n = [...prev]; n[0] = v; return n; })}
                    />
                    <NumInput
                      label={t("labelInflowGrowth")}
                      value={inflowGrowth}
                      onChange={setInflowGrowth}
                      prefix="%"
                      step={0.5}
                    />
                    <NumInput
                      label={t("labelWeek1Outflows")}
                      value={weeklyOutflows[0]}
                      onChange={v => setWeeklyOutflows(prev => { const n = [...prev]; n[0] = v; return n; })}
                    />
                    <NumInput
                      label={t("labelOutflowGrowth")}
                      value={outflowGrowth}
                      onChange={setOutflowGrowth}
                      prefix="%"
                      step={0.5}
                    />
                    <button
                      onClick={applyGrowthRates}
                      className="bg-blue-600 hover:bg-blue-500 text-white text-sm font-semibold py-2 rounded-lg transition"
                    >
                      {t("btnApply")}
                    </button>
                  </div>
                </div>

                {/* Warnings */}
                {(weeksNegative > 0 || minBalance < 10000) && (
                  <div className="bg-red-900/20 border border-red-800 rounded-xl p-4">
                    <div className="text-xs font-bold text-red-400 uppercase tracking-wider mb-2">⚠ {t("alertTitle")}</div>
                    {weeksNegative > 0 && (
                      <div className="text-xs text-red-300">{weeksNegative} week{weeksNegative > 1 ? "s" : ""} with negative balance</div>
                    )}
                    {minBalance < 10000 && minBalance >= 0 && (
                      <div className="text-xs text-yellow-300 mt-1">Min balance £{fmt(minBalance)} — low buffer</div>
                    )}
                    {minBalance < 0 && (
                      <div className="text-xs text-red-300 mt-1">Minimum balance: £{fmt(minBalance)}</div>
                    )}
                  </div>
                )}
              </div>
            </aside>

            {/* Main Content */}
            <div className="flex-1 min-w-0 flex flex-col gap-6">
              {/* KPI Cards */}
              <div className="grid grid-cols-2 xl:grid-cols-4 gap-3">
                <KpiCard label="Opening Balance" value={`£${fmt(openingBalance)}`} sub="Start of period" />
                <KpiCard label="Total Inflows" value={`£${fmt(totalInflows)}`} sub="13-week total" color="green" />
                <KpiCard label="Total Outflows" value={`£${fmt(totalOutflows)}`} sub="13-week total" color="red" />
                <KpiCard
                  label="Closing Balance"
                  value={`£${fmt(closingBalance)}`}
                  sub={weeksNegative > 0 ? `${weeksNegative} negative weeks` : "All weeks positive"}
                  color={closingBalance >= 0 ? "green" : "red"}
                />
              </div>

              {/* Balance Chart */}
              <div className="bg-[#0d1426] border border-gray-800 rounded-xl p-6">
                <h2 className="text-white font-bold mb-5">{t("chartBalance")}</h2>
                <ResponsiveContainer width="100%" height={300}>
                  <AreaChart data={chartData} margin={{ top: 10, right: 20, bottom: 0, left: 10 }}>
                    <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.05)" />
                    <XAxis dataKey="week" stroke="#374151" tick={{ fill: "#6b7280", fontSize: 11 }} />
                    <YAxis
                      stroke="#374151"
                      tick={{ fill: "#6b7280", fontSize: 11 }}
                      tickFormatter={v => v >= 1000 ? `£${(v / 1000).toFixed(0)}k` : `£${v}`}
                      width={65}
                    />
                    <Tooltip
                      contentStyle={{ backgroundColor: "#111827", border: "1px solid #1e293b", borderRadius: "8px", color: "#f1f5f9", fontSize: 12 }}
                      formatter={(value: unknown) => [`£${fmt(Number(value))}`, undefined]}
                    />
                    <ReferenceLine y={0} stroke="#ef4444" strokeDasharray="4 4" />
                    <Area type="monotone" dataKey="Balance" stroke="#3b82f6" fill="#3b82f6" fillOpacity={0.3} strokeWidth={2} />
                  </AreaChart>
                </ResponsiveContainer>
              </div>

              {/* Inflows vs Outflows */}
              <div className="bg-[#0d1426] border border-gray-800 rounded-xl p-6">
                <h2 className="text-white font-bold mb-5">{t("chartInOut")}</h2>
                <ResponsiveContainer width="100%" height={260}>
                  <BarChart data={chartData} margin={{ top: 10, right: 20, bottom: 0, left: 10 }}>
                    <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.05)" />
                    <XAxis dataKey="week" stroke="#374151" tick={{ fill: "#6b7280", fontSize: 11 }} />
                    <YAxis
                      stroke="#374151"
                      tick={{ fill: "#6b7280", fontSize: 11 }}
                      tickFormatter={v => `£${(v / 1000).toFixed(0)}k`}
                      width={55}
                    />
                    <Tooltip
                      contentStyle={{ backgroundColor: "#111827", border: "1px solid #1e293b", borderRadius: "8px", color: "#f1f5f9", fontSize: 12 }}
                      formatter={(value: unknown) => [`£${fmt(Number(value))}`, undefined]}
                    />
                    <Legend wrapperStyle={{ color: "#9ca3af", fontSize: 12, paddingTop: 8 }} />
                    <Bar dataKey="Inflows" fill="#22c55e" radius={[3, 3, 0, 0]} />
                    <Bar dataKey="Outflows" fill="#ef4444" radius={[3, 3, 0, 0]} />
                  </BarChart>
                </ResponsiveContainer>
              </div>

              {/* Weekly Table */}
              <div className="bg-[#0d1426] border border-gray-800 rounded-xl p-6">
                <div className="flex items-center justify-between mb-4">
                  <h2 className="text-white font-bold">{t("tableTitle")}</h2>
                  <button
                    onClick={() => setShowTable(v => !v)}
                    className="text-xs text-gray-400 hover:text-white transition"
                  >
                    {showTable ? `▲ ${t("collapse")}` : `▼ ${t("expand")}`}
                  </button>
                </div>
                {showTable && (
                  <div className="overflow-x-auto">
                    <table className="w-full text-sm">
                      <thead>
                        <tr className="border-b border-gray-700">
                          {["Wk", "Period", "Opening", "Inflows", "Outflows", "Net", "Closing"].map(h => (
                            <th key={h} className="text-left text-xs text-gray-400 uppercase tracking-wider py-2 pr-3 font-semibold">{h}</th>
                          ))}
                        </tr>
                      </thead>
                      <tbody>
                        {rows.map(row => (
                          <tr
                            key={row.week}
                            className={`border-b text-xs transition ${row.closingBalance < 0 ? "bg-red-900/20 border-red-900/30" : "border-gray-800 hover:bg-gray-800/20"}`}
                          >
                            <td className="py-2 pr-3 text-white font-bold">{row.week}</td>
                            <td className="py-2 pr-3 text-gray-400">{row.label}</td>
                            <td className="py-2 pr-3 text-gray-300">£{fmt(row.openingBalance)}</td>
                            <td className="py-2 pr-3 text-green-400 font-semibold">£{fmt(row.inflows)}</td>
                            <td className="py-2 pr-3 text-red-400">£{fmt(row.outflows)}</td>
                            <td className={`py-2 pr-3 font-semibold ${row.netCashFlow >= 0 ? "text-blue-300" : "text-red-400"}`}>
                              {row.netCashFlow >= 0 ? "+" : ""}£{fmt(row.netCashFlow)}
                            </td>
                            <td className={`py-2 pr-3 font-bold ${row.closingBalance < 0 ? "text-red-400" : "text-white"}`}>
                              £{fmt(row.closingBalance)}
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                )}
              </div>

              {/* Edit weekly values */}
              <div className="bg-[#0d1426] border border-gray-800 rounded-xl p-6">
                <h2 className="text-white font-bold mb-4">{t("editTitle")}</h2>
                <div className="overflow-x-auto">
                  <table className="w-full text-sm">
                    <thead>
                      <tr className="border-b border-gray-700">
                        <th className="text-left text-xs text-gray-400 py-2 pr-3 uppercase tracking-wider">Week</th>
                        <th className="text-left text-xs text-gray-400 py-2 pr-3 uppercase tracking-wider">Inflows (£)</th>
                        <th className="text-left text-xs text-gray-400 py-2 pr-3 uppercase tracking-wider">Outflows (£)</th>
                      </tr>
                    </thead>
                    <tbody>
                      {Array.from({ length: 13 }, (_, i) => (
                        <tr key={i} className="border-b border-gray-800">
                          <td className="py-1.5 pr-3 text-xs text-gray-400">{WEEK_LABELS[i]}</td>
                          <td className="py-1.5 pr-3">
                            <input
                              type="number"
                              value={weeklyInflows[i]}
                              onChange={e => {
                                const v = parseFloat(e.target.value) || 0;
                                setWeeklyInflows(prev => { const n = [...prev]; n[i] = v; return n; });
                              }}
                              className="bg-[#111827] border border-gray-700 rounded px-2 py-1 text-white text-xs w-28 outline-none focus:border-blue-500"
                            />
                          </td>
                          <td className="py-1.5 pr-3">
                            <input
                              type="number"
                              value={weeklyOutflows[i]}
                              onChange={e => {
                                const v = parseFloat(e.target.value) || 0;
                                setWeeklyOutflows(prev => { const n = [...prev]; n[i] = v; return n; });
                              }}
                              className="bg-[#111827] border border-gray-700 rounded px-2 py-1 text-white text-xs w-28 outline-none focus:border-red-500"
                            />
                          </td>
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
            { label: "📊 5-Year Financial Model", href: "/tools/financial-model" },
            { label: "📋 Annual Budget", href: "/tools/annual-budget" },
            { label: "💎 Business Valuation", href: "/tools/valuation" },
          ].map(tool => (
            <Link key={tool.href} href={tool.href}
              className="text-sm text-gray-400 hover:text-white border border-gray-700 hover:border-blue-500 px-4 py-2 rounded-lg transition">
              {tool.label}
            </Link>
          ))}
        </div>
      </div>
            <RelatedTools current="cash-flow" />
      <p className="text-center text-xs text-gray-600 pb-8 px-4">{tc("disclaimer")}</p>
    </main>
  );
}
