"use client";

import { useState, useMemo, useCallback } from "react";
import Link from "next/link";
import { useTranslations } from "next-intl";
import RelatedTools from "@/components/RelatedTools";
import { breakEven } from "@/lib/calculators";
import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ReferenceLine,
  ResponsiveContainer,
  PieChart,
  Pie,
  Cell,
  Tooltip as PieTooltip,
} from "recharts";

// ── Helpers ──────────────────────────────────────────────────────────────────

const fmt = (n: number) =>
  n.toLocaleString("en-GB", { maximumFractionDigits: 0 });

const fmtM = (n: number) =>
  n.toLocaleString("en-GB", {
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  });

const PIE_COLORS = ["#3b82f6", "#6366f1", "#8b5cf6", "#a78bfa", "#0ea5e9", "#06b6d4"];

// ── Sub-components ────────────────────────────────────────────────────────────

function NumInput({
  label,
  value,
  onChange,
  min = 0,
  step = 100,
  prefix = "£",
}: {
  label: string;
  value: number;
  onChange: (v: number) => void;
  min?: number;
  step?: number;
  prefix?: string;
}) {
  return (
    <div className="flex flex-col gap-1">
      <label className="text-xs text-gray-400 font-medium">{label}</label>
      <div className="flex items-center bg-[#111827] border border-gray-700 rounded-lg px-3 py-2 focus-within:border-blue-500 transition">
        {prefix && (
          <span className="text-gray-500 text-sm mr-1.5 shrink-0">{prefix}</span>
        )}
        <input
          type="number"
          min={min}
          step={step}
          value={value}
          onChange={(e) => onChange(parseFloat(e.target.value) || 0)}
          className="bg-transparent text-white text-sm w-full outline-none"
        />
      </div>
    </div>
  );
}

function KpiCard({
  label,
  value,
  sub,
  color = "blue",
}: {
  label: string;
  value: string;
  sub: string;
  color?: "blue" | "green" | "red";
}) {
  const border =
    color === "green"
      ? "border-l-green-500"
      : color === "red"
      ? "border-l-red-500"
      : "border-l-blue-500";
  return (
    <div
      className={`bg-[#0d1426] border border-gray-800 border-l-4 ${border} rounded-xl p-4`}
    >
      <div className="text-xs text-gray-400 uppercase tracking-wider font-semibold mb-1">
        {label}
      </div>
      <div className="text-2xl font-extrabold text-white leading-tight">{value}</div>
      <div className="text-xs text-gray-500 mt-1">{sub}</div>
    </div>
  );
}

// ── Main page ─────────────────────────────────────────────────────────────────

export default function BreakEvenPage() {
  const t = useTranslations("breakEven");
  const tc = useTranslations("toolCommon");

  // Inputs
  const [companyName, setCompanyName] = useState("My Product");
  const [sellingPrice, setSellingPrice] = useState(100);
  const [variableCost, setVariableCost] = useState(40);
  const [currentUnits, setCurrentUnits] = useState(500);
  const [fixed, setFixed] = useState({
    rent: 5000,
    payroll: 20000,
    insurance: 500,
    depreciation: 1000,
    marketing: 2000,
    other: 500,
  });
  const [isExporting, setIsExporting] = useState(false);

  const setFixedKey = useCallback(
    (key: keyof typeof fixed, val: number) =>
      setFixed((prev) => ({ ...prev, [key]: val })),
    []
  );

  // ── Calculations ────────────────────────────────────────────────────────────

  const calcs = useMemo(() => {
    const totalFixed = Object.values(fixed).reduce((a, b) => a + b, 0);
    return breakEven(totalFixed, sellingPrice, variableCost, currentUnits);
  }, [fixed, sellingPrice, variableCost, currentUnits]);

  const invalid = calcs.cm <= 0;

  // ── Chart data ──────────────────────────────────────────────────────────────

  const chartData = useMemo(() => {
    const bep = calcs.bepUnits ?? currentUnits;
    const maxUnits = Math.max(bep * 2.2, currentUnits * 1.3, 100);
    const steps = 80;
    return Array.from({ length: steps + 1 }, (_, i) => {
      const u = Math.round((maxUnits / steps) * i);
      return {
        units: u,
        Revenue: u * sellingPrice,
        "Total Cost": calcs.totalFixed + variableCost * u,
        "Fixed Cost": calcs.totalFixed,
      };
    });
  }, [calcs.bepUnits, calcs.totalFixed, sellingPrice, variableCost, currentUnits]);

  // ── Sensitivity rows ────────────────────────────────────────────────────────

  const sensitivityRows = useMemo(() => {
    const base = calcs.bepUnits ?? currentUnits;
    const scenarios = [0.5, 0.75, 1.0, 1.25, 1.5, 1.75, 2.0].map((m) =>
      Math.round(base * m)
    );
    const allUnits = Array.from(new Set([...scenarios, currentUnits])).sort(
      (a, b) => a - b
    );
    return allUnits.map((u) => {
      const revenue = u * sellingPrice;
      const totalCost = calcs.totalFixed + variableCost * u;
      const profit = revenue - totalCost;
      return { units: u, revenue, totalCost, profit, isCurrent: u === currentUnits };
    });
  }, [calcs.bepUnits, calcs.totalFixed, sellingPrice, variableCost, currentUnits]);

  // ── Pie data ────────────────────────────────────────────────────────────────

  const pieData = useMemo(
    () =>
      [
        { name: t("pieLabelRent"), value: fixed.rent },
        { name: t("pieLabelPayroll"), value: fixed.payroll },
        { name: t("pieLabelInsurance"), value: fixed.insurance },
        { name: t("pieLabelDepreciation"), value: fixed.depreciation },
        { name: t("pieLabelMarketing"), value: fixed.marketing },
        { name: t("pieLabelOther"), value: fixed.other },
      ].filter((d) => d.value > 0),
    [fixed, t]
  );

  // ── PDF export ──────────────────────────────────────────────────────────────

  const handleExportPdf = useCallback(async () => {
    if (invalid || isExporting) return;
    setIsExporting(true);
    try {
      const { pdf } = await import("@react-pdf/renderer");
      const { default: BreakEvenPDF } = await import("./pdf");
      const blob = await pdf(
        <BreakEvenPDF
          companyName={companyName}
          bepUnits={calcs.bepUnits ?? 0}
          bepRevenue={calcs.bepRevenue ?? 0}
          contributionMargin={calcs.cm}
          cmRatio={calcs.cmRatio}
          currentProfit={calcs.currentProfit}
          currentUnits={currentUnits}
          mosUnits={calcs.mosUnits ?? 0}
          mosPct={calcs.mosPct ?? 0}
          totalFixed={calcs.totalFixed}
          fixedCosts={fixed}
          sensitivityRows={sensitivityRows}
        />
      ).toBlob();
      const url = URL.createObjectURL(blob);
      const a = document.createElement("a");
      a.href = url;
      a.download = `break-even-${companyName.replace(/\s+/g, "-").toLowerCase()}.pdf`;
      a.click();
      URL.revokeObjectURL(url);
    } finally {
      setIsExporting(false);
    }
  }, [invalid, isExporting, companyName, calcs, currentUnits, fixed, sensitivityRows]);

  // ── Render ──────────────────────────────────────────────────────────────────

  return (
    <main className="min-h-screen bg-[#0a0f1e] text-white">
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify({
          "@context": "https://schema.org",
          "@type": "SoftwareApplication",
          "name": "Break-Even Analysis Tool",
          "description": "Calculate your break-even point, contribution margin and margin of safety. Free, instant, no signup.",
          "url": "https://www.financeplots.com/tools/break-even",
          "applicationCategory": "FinanceApplication",
          "operatingSystem": "Web",
          "offers": {
            "@type": "Offer",
            "price": "0",
            "priceCurrency": "GBP"
          },
          "provider": {
            "@type": "Organization",
            "name": "FinancePlots",
            "url": "https://www.financeplots.com"
          }
        })}}
      />
      {/* Tool header bar */}
      <div className="fixed top-[65px] left-0 right-0 z-40 bg-[#0d1426]/95 backdrop-blur border-b border-gray-800 px-6 py-3">
        <div className="max-w-7xl mx-auto flex items-center justify-between gap-4">
          <div className="flex items-center gap-3">
            <Link
              href="/tools"
              className="text-gray-400 hover:text-white text-sm transition"
            >
              {tc("allTools")}
            </Link>
            <span className="text-gray-700 hidden sm:block">|</span>
            <h1 className="text-white font-bold hidden sm:block">
              {t("title")}
            </h1>
          </div>
          <button
            onClick={handleExportPdf}
            disabled={invalid || isExporting}
            className="flex items-center gap-2 bg-blue-600 hover:bg-blue-500 disabled:opacity-40 disabled:cursor-not-allowed text-white font-semibold px-4 py-2 rounded-lg text-sm transition"
          >
            {isExporting ? tc("generating") : tc("exportPdf")}
          </button>
        </div>
      </div>

      {/* Content — pushed down past navbar (65px) + tool bar (~52px) */}
      <div className="pt-[133px] pb-20">
        <div className="max-w-7xl mx-auto px-4 sm:px-6">
          <div className="flex flex-col lg:flex-row gap-6">
            {/* ── Sidebar ────────────────────────────────────────────────────── */}
            <aside className="lg:w-72 xl:w-80 shrink-0">
              <div className="lg:sticky lg:top-[133px] flex flex-col gap-4">
                {/* Company */}
                <div className="bg-[#0d1426] border border-gray-800 rounded-xl p-5">
                  <h3 className="text-xs font-bold uppercase tracking-wider text-blue-400 mb-3">
                    {t("sectionGeneral")}
                  </h3>
                  <div className="flex flex-col gap-1">
                    <label className="text-xs text-gray-400 font-medium">
                      {t("labelCompany")}
                    </label>
                    <input
                      type="text"
                      value={companyName}
                      onChange={(e) => setCompanyName(e.target.value)}
                      className="bg-[#111827] border border-gray-700 rounded-lg px-3 py-2 text-white text-sm outline-none focus:border-blue-500 transition"
                    />
                  </div>
                </div>

                {/* Fixed costs */}
                <div className="bg-[#0d1426] border border-gray-800 rounded-xl p-5">
                  <h3 className="text-xs font-bold uppercase tracking-wider text-blue-400 mb-3">
                    {t("sectionFixed")}
                  </h3>
                  <div className="flex flex-col gap-3">
                    <NumInput
                      label={t("labelRent")}
                      value={fixed.rent}
                      onChange={(v) => setFixedKey("rent", v)}
                    />
                    <NumInput
                      label={t("labelPayroll")}
                      value={fixed.payroll}
                      onChange={(v) => setFixedKey("payroll", v)}
                      step={500}
                    />
                    <NumInput
                      label={t("labelInsurance")}
                      value={fixed.insurance}
                      onChange={(v) => setFixedKey("insurance", v)}
                      step={50}
                    />
                    <NumInput
                      label={t("labelDepreciation")}
                      value={fixed.depreciation}
                      onChange={(v) => setFixedKey("depreciation", v)}
                    />
                    <NumInput
                      label={t("labelMarketing")}
                      value={fixed.marketing}
                      onChange={(v) => setFixedKey("marketing", v)}
                    />
                    <NumInput
                      label={t("labelOther")}
                      value={fixed.other}
                      onChange={(v) => setFixedKey("other", v)}
                    />
                    <div className="flex justify-between text-sm pt-2 border-t border-gray-800 mt-1">
                      <span className="text-gray-400">{t("totalFixed")}</span>
                      <span className="text-white font-bold">
                        £{fmt(calcs.totalFixed)}
                      </span>
                    </div>
                  </div>
                </div>

                {/* Revenue & Variable */}
                <div className="bg-[#0d1426] border border-gray-800 rounded-xl p-5">
                  <h3 className="text-xs font-bold uppercase tracking-wider text-blue-400 mb-3">
                    {t("sectionRevenue")}
                  </h3>
                  <div className="flex flex-col gap-3">
                    <NumInput
                      label={t("labelSellingPrice")}
                      value={sellingPrice}
                      onChange={setSellingPrice}
                      step={1}
                    />
                    <NumInput
                      label={t("labelVariableCost")}
                      value={variableCost}
                      onChange={setVariableCost}
                      step={1}
                    />
                    <NumInput
                      label={t("labelUnits")}
                      value={currentUnits}
                      onChange={(v) => setCurrentUnits(Math.max(0, Math.round(v)))}
                      prefix=""
                      step={10}
                    />
                  </div>
                </div>
              </div>
            </aside>

            {/* ── Main results ────────────────────────────────────────────────── */}
            <div className="flex-1 min-w-0 flex flex-col gap-6">
              {/* Validation error */}
              {invalid && (
                <div className="bg-red-900/20 border border-red-700/60 rounded-xl p-4 text-red-400 text-sm">
                  {t("errorMargin")}
                </div>
              )}

              {/* KPI Cards */}
              <div className="grid grid-cols-2 xl:grid-cols-4 gap-3">
                <KpiCard
                  label={t("kpiBepUnits")}
                  value={calcs.bepUnits !== null ? `${fmt(calcs.bepUnits)} ${t("kpiProfitUnits")}` : "N/A"}
                  sub={
                    calcs.bepRevenue !== null
                      ? `${t("kpiBepRevenue")}: £${fmt(calcs.bepRevenue)}`
                      : "—"
                  }
                />
                <KpiCard
                  label={t("kpiCM")}
                  value={`£${fmtM(calcs.cm)}`}
                  sub={`${t("kpiCMRatio")}: ${(calcs.cmRatio * 100).toFixed(1)}%`}
                  color="green"
                />
                <KpiCard
                  label={t("kpiProfit")}
                  value={`£${fmt(calcs.currentProfit)}`}
                  sub={`${t("kpiProfitAt")} ${fmt(currentUnits)} ${t("kpiProfitUnits")}`}
                  color={calcs.currentProfit >= 0 ? "green" : "red"}
                />
                <KpiCard
                  label={t("kpiMoS")}
                  value={
                    calcs.mosPct !== null ? `${calcs.mosPct.toFixed(1)}%` : "N/A"
                  }
                  sub={
                    calcs.mosUnits !== null
                      ? `${fmt(calcs.mosUnits)} ${t("kpiMoSUnits")}`
                      : "—"
                  }
                  color={
                    calcs.mosUnits === null
                      ? "blue"
                      : calcs.mosUnits >= 0
                      ? "green"
                      : "red"
                  }
                />
              </div>

              {/* Break-Even Chart */}
              <div className="bg-[#0d1426] border border-gray-800 rounded-xl p-6">
                <h2 className="text-white font-bold mb-5">{t("chartTitle")}</h2>
                <ResponsiveContainer width="100%" height={360}>
                  <LineChart
                    data={chartData}
                    margin={{ top: 10, right: 20, bottom: 20, left: 10 }}
                  >
                    <CartesianGrid
                      strokeDasharray="3 3"
                      stroke="rgba(255,255,255,0.05)"
                    />
                    <XAxis
                      dataKey="units"
                      stroke="#374151"
                      tick={{ fill: "#6b7280", fontSize: 11 }}
                      label={{
                        value: t("chartAxisUnits"),
                        position: "insideBottom",
                        offset: -10,
                        fill: "#6b7280",
                        fontSize: 11,
                      }}
                    />
                    <YAxis
                      stroke="#374151"
                      tick={{ fill: "#6b7280", fontSize: 11 }}
                      tickFormatter={(v) =>
                        v >= 1000 ? `£${(v / 1000).toFixed(0)}k` : `£${v}`
                      }
                      width={60}
                    />
                    <Tooltip
                      contentStyle={{
                        backgroundColor: "#111827",
                        border: "1px solid #1e293b",
                        borderRadius: "8px",
                        color: "#f1f5f9",
                        fontSize: 12,
                      }}
                      labelStyle={{ color: "#9ca3af" }}
                      formatter={(value) => [`£${fmt(Number(value))}`, undefined]}
                      labelFormatter={(v) => `Units: ${fmt(v as number)}`}
                    />
                    <Legend
                      wrapperStyle={{ color: "#9ca3af", fontSize: 12, paddingTop: 16 }}
                    />
                    {calcs.bepUnits !== null && (
                      <ReferenceLine
                        x={calcs.bepUnits}
                        stroke="#22c55e"
                        strokeDasharray="5 4"
                        strokeWidth={2}
                        ifOverflow="extendDomain"
                        label={{
                          value: `BEP: ${fmt(calcs.bepUnits)}`,
                          fill: "#22c55e",
                          fontSize: 11,
                          position: "top",
                        }}
                      />
                    )}
                    {currentUnits > 0 && (
                      <ReferenceLine
                        x={currentUnits}
                        stroke="#a78bfa"
                        strokeDasharray="4 4"
                        strokeWidth={2}
                        ifOverflow="extendDomain"
                        label={{
                          value: `Current: ${fmt(currentUnits)}`,
                          fill: "#a78bfa",
                          fontSize: 11,
                          position: "top",
                        }}
                      />
                    )}
                    <Line
                      type="monotone"
                      dataKey="Revenue"
                      stroke="#3b82f6"
                      strokeWidth={2.5}
                      dot={false}
                      activeDot={{ r: 4 }}
                    />
                    <Line
                      type="monotone"
                      dataKey="Total Cost"
                      stroke="#f97316"
                      strokeWidth={2.5}
                      dot={false}
                      activeDot={{ r: 4 }}
                    />
                    <Line
                      type="monotone"
                      dataKey="Fixed Cost"
                      stroke="#6b7280"
                      strokeWidth={2}
                      dot={false}
                      strokeDasharray="6 4"
                    />
                  </LineChart>
                </ResponsiveContainer>
              </div>

              {/* Sensitivity Table + Pie Chart */}
              <div className="grid md:grid-cols-2 gap-6">
                {/* Sensitivity Table */}
                <div className="bg-[#0d1426] border border-gray-800 rounded-xl p-6">
                  <h2 className="text-white font-bold mb-1">
                    {t("tableTitle")}
                  </h2>
                  <p className="text-gray-500 text-xs mb-4">
                    {t("tableDesc")}
                  </p>
                  <div className="overflow-x-auto">
                    <table className="w-full text-sm">
                      <thead>
                        <tr className="border-b border-gray-700">
                          {[t("colUnits"), t("colRevenue"), t("colProfit"), t("colStatus")].map((h) => (
                            <th
                              key={h}
                              className="text-left text-xs text-gray-400 uppercase tracking-wider py-2 pr-3 font-semibold"
                            >
                              {h}
                            </th>
                          ))}
                        </tr>
                      </thead>
                      <tbody>
                        {sensitivityRows.map((row) => (
                          <tr
                            key={row.units}
                            className={`border-b border-gray-800 text-xs ${
                              row.isCurrent
                                ? "bg-blue-600/10"
                                : "hover:bg-gray-800/30"
                            } transition`}
                          >
                            <td className="py-2 pr-3 text-white font-medium">
                              {fmt(row.units)}
                            </td>
                            <td className="py-2 pr-3 text-gray-300">
                              £{fmt(row.revenue)}
                            </td>
                            <td
                              className={`py-2 pr-3 font-semibold ${
                                row.profit >= 0 ? "text-green-400" : "text-red-400"
                              }`}
                            >
                              £{fmt(row.profit)}
                            </td>
                            <td className="py-2">
                              <span
                                className={`text-xs px-1.5 py-0.5 rounded-full font-semibold ${
                                  row.profit > 0
                                    ? "bg-green-900/40 text-green-400"
                                    : row.profit === 0
                                    ? "bg-yellow-900/40 text-yellow-400"
                                    : "bg-red-900/40 text-red-400"
                                }`}
                              >
                                {row.profit > 0
                                  ? t("statusProfit")
                                  : row.profit === 0
                                  ? t("statusBep")
                                  : t("statusLoss")}
                              </span>
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                </div>

                {/* Fixed Cost Breakdown */}
                <div className="bg-[#0d1426] border border-gray-800 rounded-xl p-6">
                  <h2 className="text-white font-bold mb-4">{t("pieTitle")}</h2>
                  <div className="flex justify-center">
                    <ResponsiveContainer width={220} height={220}>
                      <PieChart>
                        <Pie
                          data={pieData}
                          cx="50%"
                          cy="50%"
                          innerRadius={60}
                          outerRadius={95}
                          paddingAngle={2}
                          dataKey="value"
                        >
                          {pieData.map((_, i) => (
                            <Cell
                              key={i}
                              fill={PIE_COLORS[i % PIE_COLORS.length]}
                            />
                          ))}
                        </Pie>
                        <PieTooltip
                          contentStyle={{
                            backgroundColor: "#111827",
                            border: "1px solid #1e293b",
                            borderRadius: "8px",
                            color: "#f1f5f9",
                            fontSize: 12,
                          }}
                          formatter={(value) => [
                            `£${fmt(Number(value))}`,
                            undefined,
                          ]}
                        />
                      </PieChart>
                    </ResponsiveContainer>
                  </div>
                  <div className="grid grid-cols-2 gap-x-4 gap-y-2 mt-2">
                    {pieData.map((item, i) => (
                      <div key={item.name} className="flex items-center gap-2">
                        <div
                          className="w-2.5 h-2.5 rounded-full shrink-0"
                          style={{ background: PIE_COLORS[i % PIE_COLORS.length] }}
                        />
                        <div>
                          <div className="text-xs text-gray-400">{item.name}</div>
                          <div className="text-xs text-white font-semibold">
                            £{fmt(item.value)}
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
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
            { label: "💎 Business Valuation", href: "/tools/valuation" },
          ].map(tool => (
            <Link key={tool.href} href={tool.href}
              className="text-sm text-gray-400 hover:text-white border border-gray-700 hover:border-blue-500 px-4 py-2 rounded-lg transition">
              {tool.label}
            </Link>
          ))}
        </div>
      </div>
            <RelatedTools current="break-even" />
      <p className="text-center text-xs text-gray-600 pb-8 px-4">{tc("disclaimer")}</p>
    </main>
  );
}
