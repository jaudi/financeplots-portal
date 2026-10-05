"use client";

import { useState, useMemo, useCallback } from "react";
import Link from "next/link";
import { useTranslations } from "next-intl";
import RelatedTools from "@/components/RelatedTools";
import CurrencyPicker, { useCurrency } from "@/components/CurrencyPicker";
import FinancialModelChat from "./FinancialModelChat";
import {
  AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer,
  BarChart, Bar,
} from "recharts";

const fmt = (n: number) => n.toLocaleString("en-GB", { maximumFractionDigits: 0 });
const fmtM = (n: number) => n.toLocaleString("en-GB", { minimumFractionDigits: 1, maximumFractionDigits: 1 });

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

function NumInput({ label, value, onChange, step = 10000 }: { label: string; value: number; onChange: (v: number) => void; step?: number }) {
  const [currency] = useCurrency();
  return (
    <div className="flex flex-col gap-1">
      <label className="text-xs text-gray-400">{label}</label>
      <div className="flex items-center bg-[#111827] border border-gray-700 rounded-lg px-3 py-1.5 focus-within:border-blue-500 transition">
        <span className="text-gray-500 text-sm mr-1.5 shrink-0">{currency}</span>
        <input
          type="number"
          min={0}
          step={step}
          value={value}
          onChange={e => onChange(parseFloat(e.target.value) || 0)}
          className="bg-transparent text-white text-sm w-full outline-none"
        />
      </div>
    </div>
  );
}

function DaysInput({ label, value, onChange }: { label: string; value: number; onChange: (v: number) => void }) {
  return (
    <div className="flex flex-col gap-1">
      <label className="text-xs text-gray-400">{label}</label>
      <div className="flex items-center bg-[#111827] border border-gray-700 rounded-lg px-3 py-1.5 focus-within:border-blue-500 transition">
        <input
          type="number"
          min={0}
          step={1}
          value={value}
          onChange={e => onChange(parseFloat(e.target.value) || 0)}
          className="bg-transparent text-white text-sm w-full outline-none"
        />
        <span className="text-gray-500 text-sm ml-1 shrink-0">days</span>
      </div>
    </div>
  );
}

type YearData = {
  year: number; revenue: number; cogs: number; grossProfit: number; grossMargin: number;
  opex: number; ebitda: number; ebitdaMargin: number; depreciation: number; ebit: number;
  interest: number; ebt: number; tax: number; netIncome: number; netMargin: number;
};

export default function FinancialModelPage() {
  const [currency] = useCurrency();
  const t = useTranslations("financialModel");
  const tc = useTranslations("toolCommon");
  const [companyName, setCompanyName] = useState("My Company");
  const [baseRevenue, setBaseRevenue] = useState(1000000);
  const [revenueGrowth, setRevenueGrowth] = useState(20);
  const [cogsRate, setCogsRate] = useState(40);
  const [opexRate, setOpexRate] = useState(30);
  const [daRate, setDaRate] = useState(5);
  const [interestExpense, setInterestExpense] = useState(20000);
  const [taxRate, setTaxRate] = useState(25);
  // Balance sheet / CF inputs
  const [startingCash, setStartingCash] = useState(100000);
  const [startingPPE, setStartingPPE] = useState(500000);
  const [startingDebt, setStartingDebt] = useState(200000);
  const [capexRate, setCapexRate] = useState(5);
  const [arDays, setArDays] = useState(45);
  const [apDays, setApDays] = useState(30);
  const [debtRepayment, setDebtRepayment] = useState(20000);
  const [activeTab, setActiveTab] = useState<"income" | "balance" | "cashflow">("income");
  const [isExporting, setIsExporting] = useState(false);

  const years = useMemo<YearData[]>(() => {
    let revenue = baseRevenue;
    return Array.from({ length: 5 }, (_, i) => {
      if (i > 0) revenue = revenue * (1 + revenueGrowth / 100);
      const cogs = revenue * (cogsRate / 100);
      const grossProfit = revenue - cogs;
      const grossMargin = revenue > 0 ? (grossProfit / revenue) * 100 : 0;
      const opex = revenue * (opexRate / 100);
      const ebitda = grossProfit - opex;
      const ebitdaMargin = revenue > 0 ? (ebitda / revenue) * 100 : 0;
      const depreciation = revenue * (daRate / 100);
      const ebit = ebitda - depreciation;
      const interest = interestExpense;
      const ebt = ebit - interest;
      const tax = ebt > 0 ? ebt * (taxRate / 100) : 0;
      const netIncome = ebt - tax;
      const netMargin = revenue > 0 ? (netIncome / revenue) * 100 : 0;
      return {
        year: i + 1,
        revenue: Math.round(revenue), cogs: Math.round(cogs), grossProfit: Math.round(grossProfit), grossMargin,
        opex: Math.round(opex), ebitda: Math.round(ebitda), ebitdaMargin,
        depreciation: Math.round(depreciation), ebit: Math.round(ebit), interest: Math.round(interest),
        ebt: Math.round(ebt), tax: Math.round(tax), netIncome: Math.round(netIncome), netMargin,
      };
    });
  }, [baseRevenue, revenueGrowth, cogsRate, opexRate, daRate, interestExpense, taxRate]);

  // Balance Sheet & Cash Flow model
  const bsAndCf = useMemo(() => {
    // Opening AR/AP (Year 0) approximated from Year 1 revenue
    let prevAR = years[0].revenue * (arDays / 365);
    let prevAP = years[0].cogs * (apDays / 365);
    let prevCash = startingCash;
    let prevPPE = startingPPE;
    let prevDebt = startingDebt;
    // Opening equity: assets − liabilities
    let prevEquity = startingCash + prevAR + startingPPE - prevAP - startingDebt;

    return years.map((y) => {
      const ar = y.revenue * (arDays / 365);
      const ap = y.cogs * (apDays / 365);
      const capex = y.revenue * (capexRate / 100);
      const deltaAR = ar - prevAR;
      const deltaAP = ap - prevAP;
      const repayment = Math.min(debtRepayment, prevDebt);

      const operatingCF = y.netIncome + y.depreciation - deltaAR + deltaAP;
      const investingCF = -capex;
      const financingCF = -repayment;
      const netCF = operatingCF + investingCF + financingCF;

      const cash = prevCash + netCF;
      const ppeNet = Math.max(0, prevPPE + capex - y.depreciation);
      const debt = Math.max(0, prevDebt - debtRepayment);
      const equity = prevEquity + y.netIncome;
      const totalCurrentAssets = cash + ar;
      const totalAssets = totalCurrentAssets + ppeNet;
      const totalLiabilities = ap + debt;
      const totalLE = totalLiabilities + equity;

      const result = {
        year: y.year,
        // CF rows
        netIncome: y.netIncome, depreciation: y.depreciation,
        changeAR: -deltaAR, changeAP: deltaAP,
        operatingCF, capex: -capex, investingCF, debtRepayment: -repayment, financingCF, netCF,
        beginningCash: prevCash, endingCash: cash,
        // BS rows
        cash, ar, totalCurrentAssets, ppeNet, totalAssets,
        ap, debt, totalLiabilities, equity, totalLE,
      };

      prevAR = ar; prevAP = ap; prevCash = cash;
      prevPPE = ppeNet; prevDebt = debt; prevEquity = equity;
      return result;
    });
  }, [years, startingCash, startingPPE, startingDebt, capexRate, arDays, apDays, debtRepayment]);

  const cagr = useMemo(() => {
    const y1 = years[0].revenue; const y5 = years[4].revenue;
    return y1 > 0 ? (Math.pow(y5 / y1, 1 / 4) - 1) * 100 : 0;
  }, [years]);

  const avgEbitdaMargin = years.reduce((a, y) => a + y.ebitdaMargin, 0) / 5;
  const avgNetMargin = years.reduce((a, y) => a + y.netMargin, 0) / 5;

  const chartData = years.map(y => ({
    year: `Year ${y.year}`, Revenue: y.revenue,
    "Gross Profit": y.grossProfit, EBITDA: y.ebitda, "Net Income": y.netIncome,
  }));

  const marginData = years.map(y => ({
    year: `Y${y.year}`,
    "Gross Margin": parseFloat(y.grossMargin.toFixed(1)),
    "EBITDA Margin": parseFloat(y.ebitdaMargin.toFixed(1)),
    "Net Margin": parseFloat(y.netMargin.toFixed(1)),
  }));

  const handleExportPdf = useCallback(async () => {
    setIsExporting(true);
    try {
      const { pdf } = await import("@react-pdf/renderer");
      const { default: FinancialModelPDF } = await import("./pdf");
      const blob = await pdf(
        <FinancialModelPDF
          currency={currency}
          companyName={companyName}
          years={years}
          bsAndCf={bsAndCf}
          cagr={cagr}
          avgEbitdaMargin={avgEbitdaMargin}
          avgNetMargin={avgNetMargin}
          year5Revenue={years[4].revenue}
        />
      ).toBlob();
      const url = URL.createObjectURL(blob);
      const a = document.createElement("a");
      a.href = url;
      a.download = "financial-model.pdf";
      a.click();
      URL.revokeObjectURL(url);
    } finally {
      setIsExporting(false);
    }
  }, [currency, companyName, years, cagr, avgEbitdaMargin, avgNetMargin]);

  const IS_ROWS: { label: string; key: keyof YearData; isPct?: boolean; bold?: boolean; color?: string }[] = [
    { label: "Revenue", key: "revenue", bold: true, color: "text-green-400" },
    { label: "COGS", key: "cogs", color: "text-red-400" },
    { label: "Gross Profit", key: "grossProfit", bold: true },
    { label: "Gross Margin %", key: "grossMargin", isPct: true },
    { label: "OpEx", key: "opex", color: "text-red-400" },
    { label: "EBITDA", key: "ebitda", bold: true },
    { label: "EBITDA Margin %", key: "ebitdaMargin", isPct: true },
    { label: "D&A", key: "depreciation", color: "text-red-400" },
    { label: "EBIT", key: "ebit", bold: true },
    { label: "Interest Expense", key: "interest", color: "text-red-400" },
    { label: "EBT", key: "ebt" },
    { label: "Tax", key: "tax", color: "text-red-400" },
    { label: "Net Income", key: "netIncome", bold: true },
    { label: "Net Margin %", key: "netMargin", isPct: true },
  ];

  type BsCfKey = keyof (typeof bsAndCf)[0];
  const BS_ROWS: { label: string; key: BsCfKey; bold?: boolean; color?: string; section?: boolean }[] = [
    { label: "ASSETS", key: "cash", section: true, bold: true },
    { label: "Cash & Equivalents", key: "cash", color: "text-blue-300" },
    { label: "Accounts Receivable", key: "ar" },
    { label: "Total Current Assets", key: "totalCurrentAssets", bold: true },
    { label: "PP&E (net)", key: "ppeNet" },
    { label: "Total Assets", key: "totalAssets", bold: true, color: "text-white" },
    { label: "LIABILITIES & EQUITY", key: "ap", section: true, bold: true },
    { label: "Accounts Payable", key: "ap", color: "text-red-400" },
    { label: "Long-term Debt", key: "debt", color: "text-red-400" },
    { label: "Total Liabilities", key: "totalLiabilities", bold: true, color: "text-red-300" },
    { label: "Shareholders' Equity", key: "equity", color: "text-green-400" },
    { label: "Total L&E", key: "totalLE", bold: true, color: "text-white" },
  ];

  const CF_ROWS: { label: string; key: BsCfKey; bold?: boolean; color?: string; section?: boolean }[] = [
    { label: "OPERATING ACTIVITIES", key: "netIncome", section: true, bold: true },
    { label: "Net Income", key: "netIncome" },
    { label: "Add: Depreciation & Amortisation", key: "depreciation" },
    { label: "Change in Accounts Receivable", key: "changeAR" },
    { label: "Change in Accounts Payable", key: "changeAP" },
    { label: "Cash from Operations", key: "operatingCF", bold: true, color: "text-blue-300" },
    { label: "INVESTING ACTIVITIES", key: "capex", section: true, bold: true },
    { label: "Capital Expenditure", key: "capex", color: "text-red-400" },
    { label: "Cash from Investing", key: "investingCF", bold: true, color: "text-red-300" },
    { label: "FINANCING ACTIVITIES", key: "debtRepayment", section: true, bold: true },
    { label: "Debt Repayment", key: "debtRepayment", color: "text-red-400" },
    { label: "Cash from Financing", key: "financingCF", bold: true, color: "text-red-300" },
    { label: "NET CHANGE IN CASH", key: "netCF", bold: true, section: true },
    { label: "Beginning Cash", key: "beginningCash" },
    { label: "Ending Cash", key: "endingCash", bold: true, color: "text-green-400" },
  ];

  const fmtVal = (val: number, isPct?: boolean) =>
    isPct ? `${fmtM(val)}%` : val < 0 ? `(${currency}${fmt(Math.abs(val))})` : `${currency}${fmt(val)}`;

  const TABS = [
    { id: "income" as const, label: t("tabIS") },
    { id: "balance" as const, label: t("tabBS") },
    { id: "cashflow" as const, label: t("tabCF") },
  ];

  return (
    <main className="min-h-screen bg-[#0a0f1e] text-white">
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify({
          "@context": "https://schema.org",
          "@type": "SoftwareApplication",
          "name": "5-Year Financial Model",
          "description": "Build a 5-year financial model with revenue projections, P&L, and cash flow. Export to PDF and Excel. Free, no signup.",
          "url": "https://www.financeplots.com/tools/financial-model",
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
          <CurrencyPicker label={tc("currency")} hideLabel className="ml-auto" />
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
              <div className="lg:sticky lg:top-[133px] flex flex-col gap-4 max-h-[calc(100vh-153px)] overflow-y-auto pr-1">
                <div className="bg-[#0d1426] border border-gray-800 rounded-xl p-5">
                  <h3 className="text-xs font-bold uppercase tracking-wider text-blue-400 mb-3">{t("sectionCompany")}</h3>
                  <div className="flex flex-col gap-1">
                    <label className="text-xs text-gray-400">{t("labelCompany")}</label>
                    <input
                      value={companyName}
                      onChange={e => setCompanyName(e.target.value)}
                      className="bg-[#111827] border border-gray-700 rounded-lg px-3 py-2 text-white text-sm outline-none focus:border-blue-500 transition"
                    />
                  </div>
                </div>

                <div className="bg-[#0d1426] border border-gray-800 rounded-xl p-5">
                  <h3 className="text-xs font-bold uppercase tracking-wider text-blue-400 mb-3">{t("sectionRevenue")}</h3>
                  <div className="flex flex-col gap-3">
                    <NumInput label={t("labelYear1Revenue")} value={baseRevenue} onChange={setBaseRevenue} step={50000} />
                    <PctInput label={t("labelGrowthRate")} value={revenueGrowth} onChange={setRevenueGrowth} />
                  </div>
                </div>

                <div className="bg-[#0d1426] border border-gray-800 rounded-xl p-5">
                  <h3 className="text-xs font-bold uppercase tracking-wider text-blue-400 mb-3">{t("sectionCosts")}</h3>
                  <div className="flex flex-col gap-3">
                    <PctInput label="COGS %" value={cogsRate} onChange={setCogsRate} />
                    <PctInput label="OpEx %" value={opexRate} onChange={setOpexRate} />
                    <PctInput label="D&A %" value={daRate} onChange={setDaRate} />
                    <PctInput label="CapEx %" value={capexRate} onChange={setCapexRate} />
                  </div>
                </div>

                <div className="bg-[#0d1426] border border-gray-800 rounded-xl p-5">
                  <h3 className="text-xs font-bold uppercase tracking-wider text-blue-400 mb-3">{t("sectionFinancing")}</h3>
                  <div className="flex flex-col gap-3">
                    <NumInput label="Annual Interest Expense" value={interestExpense} onChange={setInterestExpense} step={5000} />
                    <PctInput label={t("labelTax")} value={taxRate} onChange={setTaxRate} />
                    <NumInput label="Annual Debt Repayment" value={debtRepayment} onChange={setDebtRepayment} step={5000} />
                  </div>
                </div>

                <div className="bg-[#0d1426] border border-gray-800 rounded-xl p-5">
                  <h3 className="text-xs font-bold uppercase tracking-wider text-purple-400 mb-3">{t("sectionBalanceSheet")}</h3>
                  <div className="flex flex-col gap-3">
                    <NumInput label="Starting Cash" value={startingCash} onChange={setStartingCash} step={10000} />
                    <NumInput label="Starting PP&E (net)" value={startingPPE} onChange={setStartingPPE} step={50000} />
                    <NumInput label="Starting Debt" value={startingDebt} onChange={setStartingDebt} step={10000} />
                  </div>
                </div>

                <div className="bg-[#0d1426] border border-gray-800 rounded-xl p-5">
                  <h3 className="text-xs font-bold uppercase tracking-wider text-purple-400 mb-3">{t("sectionWorkingCapital")}</h3>
                  <div className="flex flex-col gap-3">
                    <DaysInput label="Accounts Receivable Days" value={arDays} onChange={setArDays} />
                    <DaysInput label="Accounts Payable Days" value={apDays} onChange={setApDays} />
                  </div>
                </div>
              </div>
            </aside>

            {/* Main Content */}
            <div className="flex-1 min-w-0 flex flex-col gap-6">
              {/* KPI Cards */}
              <div className="grid grid-cols-2 xl:grid-cols-4 gap-3">
                <KpiCard label="Year 1 Revenue" value={`${currency}${fmt(years[0].revenue)}`} sub="Base year" />
                <KpiCard label="Year 5 Revenue" value={`${currency}${fmt(years[4].revenue)}`} sub={`CAGR ${fmtM(cagr)}%`} color="green" />
                <KpiCard label="Avg EBITDA Margin" value={`${fmtM(avgEbitdaMargin)}%`} sub="5-year average" color={avgEbitdaMargin > 0 ? "green" : "red"} />
                <KpiCard label="Avg Net Margin" value={`${fmtM(avgNetMargin)}%`} sub="5-year average" color={avgNetMargin > 0 ? "green" : "red"} />
              </div>

              {/* Revenue & Profit Chart */}
              <div className="bg-[#0d1426] border border-gray-800 rounded-xl p-6">
                <h2 className="text-white font-bold mb-5">{t("chartRevenue")}</h2>
                <ResponsiveContainer width="100%" height={300}>
                  <BarChart data={chartData} margin={{ top: 10, right: 20, bottom: 0, left: 10 }}>
                    <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.05)" />
                    <XAxis dataKey="year" stroke="#374151" tick={{ fill: "#6b7280", fontSize: 12 }} />
                    <YAxis
                      stroke="#374151"
                      tick={{ fill: "#6b7280", fontSize: 11 }}
                      tickFormatter={v => v >= 1000000 ? `${currency}${(v / 1000000).toFixed(1)}M` : `${currency}${(v / 1000).toFixed(0)}k`}
                      width={75}
                    />
                    <Tooltip
                      contentStyle={{ backgroundColor: "#111827", border: "1px solid #1e293b", borderRadius: "8px", color: "#f1f5f9", fontSize: 12 }}
                      formatter={(value: unknown) => [`${currency}${fmt(Number(value))}`, undefined]}
                    />
                    <Legend wrapperStyle={{ color: "#9ca3af", fontSize: 12, paddingTop: 8 }} />
                    <Bar dataKey="Revenue" fill="#1d4ed8" radius={[4, 4, 0, 0]} />
                    <Bar dataKey="Gross Profit" fill="#3b82f6" radius={[4, 4, 0, 0]} />
                    <Bar dataKey="EBITDA" fill="#22c55e" radius={[4, 4, 0, 0]} />
                    <Bar dataKey="Net Income" fill="#f59e0b" radius={[4, 4, 0, 0]} />
                  </BarChart>
                </ResponsiveContainer>
              </div>

              {/* Margins Chart */}
              <div className="bg-[#0d1426] border border-gray-800 rounded-xl p-6">
                <h2 className="text-white font-bold mb-5">{t("chartMargins")}</h2>
                <ResponsiveContainer width="100%" height={240}>
                  <AreaChart data={marginData} margin={{ top: 10, right: 20, bottom: 0, left: 10 }}>
                    <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.05)" />
                    <XAxis dataKey="year" stroke="#374151" tick={{ fill: "#6b7280", fontSize: 12 }} />
                    <YAxis stroke="#374151" tick={{ fill: "#6b7280", fontSize: 11 }} tickFormatter={v => `${v}%`} width={45} />
                    <Tooltip
                      contentStyle={{ backgroundColor: "#111827", border: "1px solid #1e293b", borderRadius: "8px", color: "#f1f5f9", fontSize: 12 }}
                      formatter={(value: unknown) => [`${Number(value).toFixed(1)}%`, undefined]}
                    />
                    <Legend wrapperStyle={{ color: "#9ca3af", fontSize: 12, paddingTop: 8 }} />
                    <Area type="monotone" dataKey="Gross Margin" stroke="#3b82f6" fill="#3b82f6" fillOpacity={0.2} strokeWidth={2} />
                    <Area type="monotone" dataKey="EBITDA Margin" stroke="#22c55e" fill="#22c55e" fillOpacity={0.2} strokeWidth={2} />
                    <Area type="monotone" dataKey="Net Margin" stroke="#f59e0b" fill="#f59e0b" fillOpacity={0.2} strokeWidth={2} />
                  </AreaChart>
                </ResponsiveContainer>
              </div>

              {/* Tabbed Statements */}
              <div className="bg-[#0d1426] border border-gray-800 rounded-xl overflow-hidden">
                {/* Tab Nav */}
                <div className="flex border-b border-gray-800">
                  {TABS.map(tab => (
                    <button
                      key={tab.id}
                      onClick={() => setActiveTab(tab.id)}
                      className={`px-5 py-3 text-sm font-semibold transition border-b-2 ${
                        activeTab === tab.id
                          ? "border-blue-500 text-white"
                          : "border-transparent text-gray-400 hover:text-white hover:bg-gray-800/30"
                      }`}
                    >
                      {tab.label}
                    </button>
                  ))}
                </div>

                <div className="p-6 overflow-x-auto">
                  {activeTab === "income" && (
                    <table className="w-full text-xs">
                      <thead>
                        <tr className="border-b border-gray-700">
                          <th className="text-left text-xs text-gray-400 uppercase py-2 pr-4 w-44">Metric</th>
                          {years.map(y => (
                            <th key={y.year} className="text-left text-xs text-gray-400 uppercase py-2 pr-4">Year {y.year}</th>
                          ))}
                        </tr>
                      </thead>
                      <tbody>
                        {IS_ROWS.map(row => (
                          <tr
                            key={row.label}
                            className={`border-b text-xs transition ${row.bold ? "bg-blue-900/10 border-blue-900/30" : "border-gray-800 hover:bg-gray-800/20"}`}
                          >
                            <td className={`py-2 pr-4 ${row.bold ? "text-white font-bold" : "text-gray-400"}`}>{row.label}</td>
                            {years.map(y => {
                              const val = y[row.key as keyof YearData] as number;
                              let cls = row.color ?? (row.bold ? "text-white font-semibold" : "text-gray-300");
                              if (row.key === "netIncome") cls = val >= 0 ? "text-green-400 font-bold" : "text-red-400 font-bold";
                              return (
                                <td key={y.year} className={`py-2 pr-4 ${cls}`}>
                                  {row.isPct ? `${fmtM(val)}%` : `${currency}${fmt(val)}`}
                                </td>
                              );
                            })}
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  )}

                  {activeTab === "balance" && (
                    <table className="w-full text-xs">
                      <thead>
                        <tr className="border-b border-gray-700">
                          <th className="text-left text-xs text-gray-400 uppercase py-2 pr-4 w-52">Item</th>
                          {bsAndCf.map(y => (
                            <th key={y.year} className="text-left text-xs text-gray-400 uppercase py-2 pr-4">Year {y.year}</th>
                          ))}
                        </tr>
                      </thead>
                      <tbody>
                        {BS_ROWS.map((row, idx) => {
                          if (row.section && idx > 0) {
                            return (
                              <tr key={row.label} className="border-t-2 border-gray-600">
                                <td colSpan={6} className="pt-3 pb-1 text-xs font-bold uppercase tracking-wider text-blue-400">{row.label}</td>
                              </tr>
                            );
                          }
                          if (row.section) return (
                            <tr key={row.label}>
                              <td colSpan={6} className="pb-1 text-xs font-bold uppercase tracking-wider text-blue-400">{row.label}</td>
                            </tr>
                          );
                          return (
                            <tr key={row.label} className={`border-b text-xs transition ${row.bold ? "bg-blue-900/10 border-blue-900/30" : "border-gray-800 hover:bg-gray-800/20"}`}>
                              <td className={`py-2 pr-4 ${row.bold ? "text-white font-bold" : "text-gray-400"}`}>{row.label}</td>
                              {bsAndCf.map(y => {
                                const val = y[row.key] as number;
                                const cls = row.color ?? (row.bold ? "text-white font-semibold" : "text-gray-300");
                                return <td key={y.year} className={`py-2 pr-4 ${cls}`}>{fmtVal(val)}</td>;
                              })}
                            </tr>
                          );
                        })}
                      </tbody>
                    </table>
                  )}

                  {activeTab === "cashflow" && (
                    <table className="w-full text-xs">
                      <thead>
                        <tr className="border-b border-gray-700">
                          <th className="text-left text-xs text-gray-400 uppercase py-2 pr-4 w-52">Item</th>
                          {bsAndCf.map(y => (
                            <th key={y.year} className="text-left text-xs text-gray-400 uppercase py-2 pr-4">Year {y.year}</th>
                          ))}
                        </tr>
                      </thead>
                      <tbody>
                        {CF_ROWS.map((row, idx) => {
                          if (row.section) {
                            return (
                              <tr key={`sec-${idx}`} className={idx > 0 ? "border-t-2 border-gray-600" : ""}>
                                <td colSpan={6} className={`${idx > 0 ? "pt-3" : ""} pb-1 text-xs font-bold uppercase tracking-wider text-purple-400`}>{row.label}</td>
                              </tr>
                            );
                          }
                          return (
                            <tr key={row.label} className={`border-b text-xs transition ${row.bold ? "bg-blue-900/10 border-blue-900/30" : "border-gray-800 hover:bg-gray-800/20"}`}>
                              <td className={`py-2 pr-4 ${row.bold ? "text-white font-bold" : "text-gray-400"}`}>{row.label}</td>
                              {bsAndCf.map(y => {
                                const val = y[row.key] as number;
                                const cls = row.color ?? (row.bold ? "text-white font-semibold" : "text-gray-300");
                                return <td key={y.year} className={`py-2 pr-4 ${cls}`}>{fmtVal(val)}</td>;
                              })}
                            </tr>
                          );
                        })}
                      </tbody>
                    </table>
                  )}
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
            { label: "💧 Cash Flow Forecast", href: "/tools/cash-flow" },
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
            <FinancialModelChat
              currency={currency}
              name={companyName}
              setName={setCompanyName}
              values={{ baseRevenue, revenueGrowth, cogsRate, opexRate, daRate, interestExpense, taxRate, startingCash, startingPPE, startingDebt, capexRate, arDays, apDays, debtRepayment }}
              setValue={(key, v) => ({
                baseRevenue: setBaseRevenue, revenueGrowth: setRevenueGrowth, cogsRate: setCogsRate, opexRate: setOpexRate, daRate: setDaRate,
                interestExpense: setInterestExpense, taxRate: setTaxRate, startingCash: setStartingCash, startingPPE: setStartingPPE,
                startingDebt: setStartingDebt, capexRate: setCapexRate, arDays: setArDays, apDays: setApDays, debtRepayment: setDebtRepayment,
              } as Record<string, (n: number) => void>)[key]?.(v)}
              setTab={setActiveTab}
              year5Revenue={years[4].revenue}
            />
            <RelatedTools current="financial-model" />
      <p className="text-center text-xs text-gray-600 pb-8 px-4">{tc("disclaimer")}</p>
    </main>
  );
}
