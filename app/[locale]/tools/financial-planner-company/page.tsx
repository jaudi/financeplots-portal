"use client";

import { useState, useMemo } from "react";
import Link from "next/link";
import { useTranslations } from "next-intl";
import RelatedTools from "@/components/RelatedTools";
import SpreadsheetIO from "@/components/SpreadsheetIO";
import type { SheetField, SheetValues } from "@/lib/spreadsheet-io";
import {
  BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip,
  ResponsiveContainer, Cell, Legend,
} from "recharts";

// Every input of the five steps as spreadsheet rows (components/SpreadsheetIO.tsx).
// Labels match the on-screen ones in both languages, so either imports.
const SHEET_FIELDS: SheetField[] = [
  { key: "revenue", kind: "number", label: { en: "Annual Revenue", es: "Ingresos anuales" } },
  { key: "cogs", kind: "number", label: { en: "Cost of Goods Sold (COGS)", es: "Coste de ventas (COGS)" } },
  { key: "salaries", kind: "number", label: { en: "Salaries & Wages", es: "Salarios" } },
  { key: "rent", kind: "number", label: { en: "Rent & Facilities", es: "Alquiler / Instalaciones" } },
  { key: "marketing", kind: "number", label: { en: "Marketing", es: "Marketing" } },
  { key: "software", kind: "number", label: { en: "Software & IT", es: "Software / TI" } },
  { key: "otherOpex", kind: "number", label: { en: "Other OpEx", es: "Otros gastos operativos" } },
  { key: "da", kind: "number", label: { en: "Depreciation & Amortisation", es: "Depreciación y amortización" } },
  { key: "interest", kind: "number", label: { en: "Interest Expense", es: "Gastos financieros" } },
  { key: "taxRate", kind: "number", unit: "%", label: { en: "Tax Rate", es: "Tipo impositivo" } },
  { key: "arDays", kind: "number", unit: "days", label: { en: "Accounts Receivable Days", es: "Días de cobro a clientes" } },
  { key: "apDays", kind: "number", unit: "days", label: { en: "Accounts Payable Days", es: "Días de pago a proveedores" } },
  { key: "invDays", kind: "number", unit: "days", label: { en: "Inventory Days (0 if services)", es: "Días de inventario (0 si es servicios)" } },
  { key: "capex", kind: "number", label: { en: "Annual CapEx", es: "CapEx anual" } },
  { key: "debtRepay", kind: "number", label: { en: "Debt Repayments", es: "Amortización de deuda" } },
  { key: "bsCash", kind: "number", label: { en: "Cash & Equivalents", es: "Efectivo y equivalentes" } },
  { key: "otherCurrentAssets", kind: "number", label: { en: "Other Current Assets", es: "Otros activos corrientes" } },
  { key: "fixedAssets", kind: "number", label: { en: "Fixed Assets (Net)", es: "Activos fijos (neto)" } },
  { key: "stDebt", kind: "number", label: { en: "Short-term Debt", es: "Deuda a corto plazo" } },
  { key: "ltDebt", kind: "number", label: { en: "Long-term Debt", es: "Deuda a largo plazo" } },
  { key: "otherLiabilities", kind: "number", label: { en: "Other Liabilities", es: "Otros pasivos" } },
  { key: "evEbitdaMult", kind: "number", unit: "x", label: { en: "EV/EBITDA Multiple", es: "Múltiplo EV/EBITDA" } },
  { key: "revMult", kind: "number", unit: "x", label: { en: "Revenue Multiple", es: "Múltiplo sobre ingresos" } },
  { key: "peMult", kind: "number", unit: "x", label: { en: "P/E Multiple", es: "Múltiplo P/E" } },
  { key: "discountRate", kind: "number", unit: "%", label: { en: "Discount Rate (WACC)", es: "Tasa de descuento (WACC)" } },
  { key: "termGrowth", kind: "number", unit: "%", label: { en: "Terminal Growth Rate", es: "Tasa de crecimiento terminal" } },
];

const fmt = (n: number) => n.toLocaleString("en-GB", { maximumFractionDigits: 0 });
const fmtM = (n: number) => {
  if (Math.abs(n) >= 1_000_000) return `${(n / 1_000_000).toFixed(1)}M`;
  if (Math.abs(n) >= 1_000) return `${(n / 1_000).toFixed(0)}k`;
  return String(Math.round(n));
};

const CURRENCIES = ["£", "$", "€", "¥", "₹"];

// ── Helper components ──────────────────────────────────────────────────────────

function NumInput({
  label, value, onChange, prefix = "£", step = 1000, note, suffix,
}: {
  label: string; value: number; onChange: (v: number) => void;
  prefix?: string; step?: number; note?: string; suffix?: string;
}) {
  return (
    <div className="flex flex-col gap-1">
      <label className="text-xs text-gray-400">{label}</label>
      <div className="flex items-center bg-[#111827] border border-gray-700 rounded-lg px-3 py-2 focus-within:border-blue-500 transition">
        {prefix && <span className="text-gray-500 text-sm mr-1.5 shrink-0">{prefix}</span>}
        <input
          type="number" min={0} step={step} value={value}
          onChange={e => onChange(parseFloat(e.target.value) || 0)}
          className="bg-transparent text-white text-sm w-full outline-none"
        />
        {suffix && <span className="text-gray-500 text-sm ml-1.5 shrink-0">{suffix}</span>}
      </div>
      {note && <p className="text-xs text-gray-600">{note}</p>}
    </div>
  );
}

function KpiCard({
  label, value, sub, colorClass,
}: { label: string; value: string; sub: string; colorClass: string }) {
  return (
    <div className={`bg-[#0d1426] border border-gray-800 border-l-4 ${colorClass} rounded-xl p-4`}>
      <div className="text-xs text-gray-400 uppercase tracking-wider font-semibold mb-1">{label}</div>
      <div className="text-2xl font-extrabold text-white leading-tight">{value}</div>
      <div className="text-xs text-gray-500 mt-1">{sub}</div>
    </div>
  );
}

function SectionHeader({ title, sub }: { title: string; sub?: string }) {
  return (
    <div className="mb-4">
      <h2 className="text-white font-bold text-base">{title}</h2>
      {sub && <p className="text-gray-500 text-xs mt-0.5">{sub}</p>}
    </div>
  );
}

function ScoreBadge({ score, highLabel, medLabel, lowLabel }: { score: number; highLabel: string; medLabel: string; lowLabel: string }) {
  const color = score >= 70 ? "text-green-400 bg-green-400/10 border-green-500/30"
              : score >= 40 ? "text-amber-400 bg-amber-400/10 border-amber-500/30"
                            : "text-red-400 bg-red-400/10 border-red-500/30";
  const label = score >= 70 ? highLabel : score >= 40 ? medLabel : lowLabel;
  return (
    <span className={`text-xs font-bold px-2 py-0.5 rounded-full border ${color}`}>
      {label} · {score}%
    </span>
  );
}

function ChecklistItem({ item }: { item: { label: string; pass: boolean; amber: boolean } }) {
  const icon  = item.pass ? "✅" : item.amber ? "🟡" : "❌";
  const color = item.pass ? "text-green-400" : item.amber ? "text-amber-400" : "text-red-400";
  return (
    <div className="flex items-center gap-3 py-2 border-b border-gray-800 last:border-0">
      <span>{icon}</span>
      <span className={`text-sm ${color}`}>{item.label}</span>
    </div>
  );
}

// ── Main component ─────────────────────────────────────────────────────────────

export default function FinancialPlannerCompanyPage() {
  const t = useTranslations("companyPlanner");

  const [step, setStep] = useState(1);
  const [currency, setCurrency] = useState("£");
  const [pdfLoading, setPdfLoading] = useState(false);

  const STEPS = [
    { num: 1, label: t("stepPL"),            icon: "📊" },
    { num: 2, label: t("stepCashFlow"),      icon: "💧" },
    { num: 3, label: t("stepBalanceSheet"),  icon: "⚖️" },
    { num: 4, label: t("stepValuation"),     icon: "💎" },
    { num: 5, label: t("stepExitStrategy"),  icon: "🚀" },
  ];

  // ── Step 1 — P&L inputs ────────────────────────────────────────────────────
  const [revenue, setRevenue]   = useState(2_000_000);
  const [cogs, setCogs]         = useState(800_000);
  const [salaries, setSalaries] = useState(400_000);
  const [rent, setRent]         = useState(60_000);
  const [marketing, setMarketing] = useState(50_000);
  const [software, setSoftware] = useState(30_000);
  const [otherOpex, setOtherOpex] = useState(40_000);
  const [da, setDa]             = useState(40_000);
  const [interest, setInterest] = useState(20_000);
  const [taxRate, setTaxRate]   = useState(25);

  // ── Step 2 — Cash Flow inputs ──────────────────────────────────────────────
  const [arDays, setArDays]   = useState(45);
  const [apDays, setApDays]   = useState(30);
  const [invDays, setInvDays] = useState(0);
  const [capex, setCapex]     = useState(80_000);
  const [debtRepay, setDebtRepay] = useState(50_000);

  // ── Step 3 — Balance Sheet inputs ─────────────────────────────────────────
  const [bsCash, setBsCash]             = useState(250_000);
  const [otherCurrentAssets, setOtherCurrentAssets] = useState(100_000);
  const [fixedAssets, setFixedAssets]   = useState(300_000);
  const [stDebt, setStDebt]             = useState(100_000);
  const [ltDebt, setLtDebt]             = useState(200_000);
  const [otherLiabilities, setOtherLiabilities] = useState(80_000);

  // ── Step 4 — Valuation inputs ──────────────────────────────────────────────
  const [evEbitdaMult, setEvEbitdaMult] = useState(8);
  const [revMult, setRevMult]           = useState(1.5);
  const [peMult, setPeMult]             = useState(12);
  const [discountRate, setDiscountRate] = useState(10);
  const [termGrowth, setTermGrowth]     = useState(3);

  const sheetValues = (): SheetValues => ({ revenue, cogs, salaries, rent, marketing, software, otherOpex, da, interest, taxRate, arDays, apDays, invDays, capex, debtRepay, bsCash, otherCurrentAssets, fixedAssets, stDebt, ltDebt, otherLiabilities, evEbitdaMult, revMult, peMult, discountRate, termGrowth });
  function applySheet(v: SheetValues) {
    if (typeof v.revenue === "number") setRevenue(v.revenue);
    if (typeof v.cogs === "number") setCogs(v.cogs);
    if (typeof v.salaries === "number") setSalaries(v.salaries);
    if (typeof v.rent === "number") setRent(v.rent);
    if (typeof v.marketing === "number") setMarketing(v.marketing);
    if (typeof v.software === "number") setSoftware(v.software);
    if (typeof v.otherOpex === "number") setOtherOpex(v.otherOpex);
    if (typeof v.da === "number") setDa(v.da);
    if (typeof v.interest === "number") setInterest(v.interest);
    if (typeof v.taxRate === "number") setTaxRate(v.taxRate);
    if (typeof v.arDays === "number") setArDays(v.arDays);
    if (typeof v.apDays === "number") setApDays(v.apDays);
    if (typeof v.invDays === "number") setInvDays(v.invDays);
    if (typeof v.capex === "number") setCapex(v.capex);
    if (typeof v.debtRepay === "number") setDebtRepay(v.debtRepay);
    if (typeof v.bsCash === "number") setBsCash(v.bsCash);
    if (typeof v.otherCurrentAssets === "number") setOtherCurrentAssets(v.otherCurrentAssets);
    if (typeof v.fixedAssets === "number") setFixedAssets(v.fixedAssets);
    if (typeof v.stDebt === "number") setStDebt(v.stDebt);
    if (typeof v.ltDebt === "number") setLtDebt(v.ltDebt);
    if (typeof v.otherLiabilities === "number") setOtherLiabilities(v.otherLiabilities);
    if (typeof v.evEbitdaMult === "number") setEvEbitdaMult(v.evEbitdaMult);
    if (typeof v.revMult === "number") setRevMult(v.revMult);
    if (typeof v.peMult === "number") setPeMult(v.peMult);
    if (typeof v.discountRate === "number") setDiscountRate(v.discountRate);
    if (typeof v.termGrowth === "number") setTermGrowth(v.termGrowth);
  }

  // ── Step 1 calculations ────────────────────────────────────────────────────
  const totalOpex = salaries + rent + marketing + software + otherOpex;
  const grossProfit = revenue - cogs;
  const grossMargin = revenue > 0 ? (grossProfit / revenue) * 100 : 0;
  const ebitda = grossProfit - totalOpex;
  const ebit = ebitda - da;
  const ebt = ebit - interest;
  const netProfit = ebt * (1 - taxRate / 100);
  const ebitdaMargin = revenue > 0 ? (ebitda / revenue) * 100 : 0;
  const netMargin = revenue > 0 ? (netProfit / revenue) * 100 : 0;

  const plWaterfallData = [
    { name: t("glanceRevenue"),    value: revenue,    color: "#3b82f6" },
    { name: "Gross Profit",        value: grossProfit, color: grossProfit >= 0 ? "#22c55e" : "#ef4444" },
    { name: "EBITDA",              value: ebitda,      color: ebitda >= 0 ? "#10b981" : "#ef4444" },
    { name: "EBIT",                value: ebit,        color: ebit >= 0 ? "#f59e0b" : "#ef4444" },
    { name: t("kpiNetProfit"),     value: netProfit,   color: netProfit >= 0 ? "#8b5cf6" : "#ef4444" },
  ];

  // ── Step 2 calculations ────────────────────────────────────────────────────
  const arBalance   = revenue > 0 ? (arDays / 365) * revenue : 0;
  const apBalance   = cogs > 0    ? (apDays / 365) * cogs    : 0;
  const invBalance  = cogs > 0    ? (invDays / 365) * cogs   : 0;
  const workingCapital = arBalance + invBalance - apBalance;

  // Operating CF = Net Profit + D&A - ΔWC (using WC as proxy for change)
  const operatingCF = netProfit + da - (workingCapital * 0.1); // 10% of WC as annual change
  const freeCashFlow = operatingCF - capex;
  const netCashFlow  = freeCashFlow - debtRepay;
  const cashConversion = ebitda > 0 ? (freeCashFlow / ebitda) * 100 : 0;

  const cfBarData = [
    { name: t("kpiOperatingCF"),   value: operatingCF, color: operatingCF >= 0 ? "#22c55e" : "#ef4444" },
    { name: "CapEx",               value: -capex,      color: "#f59e0b" },
    { name: t("labelDebtRepay"),   value: -debtRepay,  color: "#ef4444" },
    { name: t("kpiNetCashFlow"),   value: netCashFlow, color: netCashFlow >= 0 ? "#3b82f6" : "#ef4444" },
  ];

  // ── Step 3 calculations ────────────────────────────────────────────────────
  const totalCurrentAssets = bsCash + otherCurrentAssets + arBalance;
  const totalAssets = totalCurrentAssets + fixedAssets;
  const totalDebt   = stDebt + ltDebt;
  const totalLiabilities = totalDebt + otherLiabilities;
  const bookEquity  = totalAssets - totalLiabilities;
  const netDebt     = totalDebt - bsCash;
  const leverage    = ebitda > 0 ? netDebt / ebitda : 0;

  const bsChartData = [
    { name: t("sectionAssets"), Cash: Math.round(bsCash), "AR & Current": Math.round(otherCurrentAssets + arBalance), "Fixed Assets": Math.round(fixedAssets) },
    { name: `${t("sectionLiabilities")} & ${t("kpiBookEquity")}`, "Short-term Debt": Math.round(stDebt), "Long-term Debt": Math.round(ltDebt), "Other Liabilities": Math.round(otherLiabilities), Equity: Math.max(0, Math.round(bookEquity)) },
  ];

  // ── Step 4 calculations ────────────────────────────────────────────────────
  const evByEbitda   = ebitda * evEbitdaMult;
  const eqByEbitda   = evByEbitda - netDebt;
  const evByRev      = revenue * revMult;
  const eqByRev      = evByRev - netDebt;
  const eqByPE       = netProfit > 0 ? netProfit * peMult : 0;

  // 5-year DCF: FCF grows at 5% p.a.; terminal value = FCF_5 × (1+g)/(WACC-g)
  const dcfEquity = useMemo(() => {
    if (freeCashFlow <= 0 || discountRate <= termGrowth) return 0;
    const wacc = discountRate / 100;
    const g    = termGrowth / 100;
    let pv = 0;
    let fcfYear = freeCashFlow;
    for (let y = 1; y <= 5; y++) {
      fcfYear = y === 1 ? freeCashFlow : fcfYear * 1.05;
      pv += fcfYear / Math.pow(1 + wacc, y);
    }
    const fcf5 = freeCashFlow * Math.pow(1.05, 4);
    const terminalValue = (fcf5 * (1 + g)) / (wacc - g);
    pv += terminalValue / Math.pow(1 + wacc, 5);
    return pv - netDebt;
  }, [freeCashFlow, discountRate, termGrowth, netDebt]);

  const validMethods = [eqByEbitda, eqByRev, eqByPE, dcfEquity].filter(v => v > 0);
  const blendedEquity = validMethods.length > 0
    ? validMethods.reduce((a, b) => a + b, 0) / validMethods.length
    : 0;
  const exitLow  = validMethods.length > 0 ? Math.min(...validMethods) : 0;
  const exitHigh = validMethods.length > 0 ? Math.max(...validMethods) : 0;

  const valuationChartData = [
    { name: "EV/EBITDA",    value: Math.max(0, Math.round(eqByEbitda)), color: "#3b82f6" },
    { name: "Rev Multiple", value: Math.max(0, Math.round(eqByRev)),    color: "#8b5cf6" },
    { name: "P/E",          value: Math.max(0, Math.round(eqByPE)),     color: "#f59e0b" },
    { name: "DCF",          value: Math.max(0, Math.round(dcfEquity)),  color: "#22c55e" },
  ];

  // ── Step 5 — Exit Strategy derived insights ───────────────────────────────
  const checklistLabels = t.raw("checklistItems") as string[];
  const exitChecklist = [
    { label: checklistLabels[0], pass: ebitda > 0,                  amber: false },
    { label: checklistLabels[1], pass: ebitdaMargin >= 15,          amber: ebitdaMargin >= 10 && ebitdaMargin < 15 },
    { label: checklistLabels[2], pass: freeCashFlow > 0,            amber: false },
    { label: checklistLabels[3], pass: leverage < 2,                amber: leverage >= 2 && leverage < 3 },
    { label: checklistLabels[4], pass: revenue > 0,                 amber: false },
    { label: checklistLabels[5], pass: netProfit > 0,               amber: false },
  ];

  const dynamicActions: string[] = [];
  if (ebitdaMargin < 15)
    dynamicActions.push(t("actionImproveMargin"));
  if (leverage > 3)
    dynamicActions.push(t("actionReduceDebt"));
  if (ebitda > 0 && freeCashFlow < ebitda * 0.7)
    dynamicActions.push(t("actionImproveCashConversion"));
  if (bookEquity < 0)
    dynamicActions.push(t("actionRecapitalise"));
  dynamicActions.push(t("actionCleanFinancials"));
  dynamicActions.push(t("actionDocumentContracts"));

  // Suitability scores for exit options (0–100)
  const tradeSaleScore      = Math.min(100, Math.max(0, (ebitda > 0 ? 40 : 0) + (revenue > 500_000 ? 30 : 15) + (ebitdaMargin > 10 ? 30 : 0)));
  const peBuyoutScore       = Math.min(100, Math.max(0, (ebitdaMargin > 15 ? 40 : 20) + (leverage < 3 ? 30 : 0) + (ebitda > 200_000 ? 30 : 0)));
  const mboScore            = Math.min(100, Math.max(0, 40 + (ebitda > 0 ? 30 : 0) + (freeCashFlow > 0 ? 30 : 0)));
  const organicGrowthScore  = Math.min(100, Math.max(0, 50 + (freeCashFlow > 0 ? 30 : 0) + (ebitdaMargin > 10 ? 20 : 0)));

  async function handleExportPdf() {
    setPdfLoading(true);
    try {
    const { pdf } = await import("@react-pdf/renderer");
    const { CompanyPdf } = await import("./pdf");
    const blob = await pdf(
      <CompanyPdf
        currency={currency}
        revenue={revenue}
        grossProfit={grossProfit}
        grossMargin={grossMargin}
        ebitda={ebitda}
        ebitdaMargin={ebitdaMargin}
        ebit={ebit}
        netProfit={netProfit}
        netMargin={netMargin}
        totalOpex={totalOpex}
        operatingCF={operatingCF}
        freeCashFlow={freeCashFlow}
        netCashFlow={netCashFlow}
        cashConversion={cashConversion}
        totalAssets={totalAssets}
        netDebt={netDebt}
        bookEquity={bookEquity}
        leverage={leverage}
        eqByEbitda={eqByEbitda}
        eqByRev={eqByRev}
        eqByPE={eqByPE}
        dcfEquity={dcfEquity}
        blendedEquity={blendedEquity}
        exitLow={exitLow}
        exitHigh={exitHigh}
        evEbitdaMult={evEbitdaMult}
        revMult={revMult}
        peMult={peMult}
        exitChecklist={exitChecklist}
        dynamicActions={dynamicActions}
        date={new Date().toLocaleDateString("en-GB", { day: "numeric", month: "long", year: "numeric" })}
      />
    ).toBlob();
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = "company-financial-report.pdf";
    a.click();
    URL.revokeObjectURL(url);
    } catch (e) {
      console.error("PDF generation failed:", e);
    } finally {
      setPdfLoading(false);
    }
  }

  const navBar = (
    <div className="fixed top-[65px] left-0 right-0 z-40 bg-[#0d1426]/95 backdrop-blur border-b border-gray-800 px-4 py-3">
      <div className="max-w-7xl mx-auto flex items-center justify-between gap-4">
        <div className="flex items-center gap-3 shrink-0">
          <Link href="/tools/business" className="text-gray-400 hover:text-white text-sm transition">{t("backToTools")}</Link>
          <span className="text-gray-700 hidden md:block">|</span>
          <span className="text-white font-bold text-sm hidden md:block">{t("pageTitle")}</span>
        </div>
        <div className="flex items-center gap-1">
          {STEPS.map((s, i) => (
            <div key={s.num} className="flex items-center gap-1">
              <button
                onClick={() => setStep(s.num)}
                className={`flex items-center gap-1.5 px-2.5 py-1.5 rounded-lg text-xs font-semibold transition ${
                  step === s.num
                    ? "bg-blue-600 text-white"
                    : step > s.num
                    ? "bg-green-600/20 text-green-400 border border-green-600/30"
                    : "text-gray-500 hover:text-gray-300"
                }`}
              >
                <span>{s.icon}</span>
                <span className="hidden sm:block">{s.label}</span>
              </button>
              {i < STEPS.length - 1 && <span className="text-gray-700 text-xs">›</span>}
            </div>
          ))}
        </div>
      </div>
      <div className="max-w-7xl mx-auto mt-2">
        <div className="h-1 bg-gray-800 rounded-full overflow-hidden">
          <div
            className="h-full bg-blue-600 rounded-full transition-all duration-500"
            style={{ width: `${((step - 1) / (STEPS.length - 1)) * 100}%` }}
          />
        </div>
      </div>
    </div>
  );

  return (
    <main className="min-h-screen bg-[#0a0f1e] text-white">
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify({
          "@context": "https://schema.org",
          "@type": "SoftwareApplication",
          "name": "Financial Planner for Companies",
          "description": "Comprehensive financial planning for businesses — P&L, cash flow, valuation, and exit price estimation. Free, no signup.",
          "url": "https://www.financeplots.com/tools/financial-planner-company",
          "applicationCategory": "FinanceApplication",
          "operatingSystem": "Web",
          "offers": { "@type": "Offer", "price": "0", "priceCurrency": "GBP" },
          "provider": { "@type": "Organization", "name": "FinancePlots", "url": "https://www.financeplots.com" }
        })}}
      />
      {navBar}

      <div className="pt-[140px] pb-20">
        <div className="max-w-7xl mx-auto px-4 sm:px-6">

          {/* ── STEP 1: P&L ──────────────────────────────────────────────── */}
          {step === 1 && (
            <div className="flex flex-col lg:flex-row gap-6">
              <aside className="lg:w-72 xl:w-80 shrink-0">
                <div className="lg:sticky lg:top-[140px] flex flex-col gap-4">
                  <SpreadsheetIO
                    title={`${t("pageTitle")} (${currency})`}
                    fileName="company-financial-plan"
                    fields={SHEET_FIELDS}
                    getValues={sheetValues}
                    onImport={applySheet}
                  />
                  {/* Currency */}
                  <div className="bg-[#0d1426] border border-gray-800 rounded-xl p-5">
                    <h3 className="text-xs font-bold uppercase tracking-wider text-blue-400 mb-3">{t("sectionCurrency")}</h3>
                    <div className="flex gap-2 flex-wrap mb-5">
                      {CURRENCIES.map(c => (
                        <button key={c} onClick={() => setCurrency(c)}
                          className={`px-3 py-1.5 rounded-lg text-sm font-semibold transition ${currency === c ? "bg-blue-600 text-white" : "bg-[#111827] text-gray-400 border border-gray-700 hover:text-white"}`}>
                          {c}
                        </button>
                      ))}
                    </div>
                    <h3 className="text-xs font-bold uppercase tracking-wider text-green-400 mb-3">{t("sectionRevenue")}</h3>
                    <NumInput label={t("labelAnnualRevenue")} value={revenue} onChange={setRevenue} prefix={currency} />
                    <div className="mt-3">
                      <NumInput label={t("labelCOGS")} value={cogs} onChange={setCogs} prefix={currency} />
                    </div>
                  </div>

                  {/* OpEx */}
                  <div className="bg-[#0d1426] border border-gray-800 rounded-xl p-5">
                    <h3 className="text-xs font-bold uppercase tracking-wider text-red-400 mb-3">{t("sectionOpEx")}</h3>
                    <div className="flex flex-col gap-2.5">
                      <NumInput label={t("labelSalaries")}   value={salaries}  onChange={setSalaries}  prefix={currency} />
                      <NumInput label={t("labelRent")}        value={rent}       onChange={setRent}      prefix={currency} />
                      <NumInput label={t("labelMarketing")}   value={marketing}  onChange={setMarketing} prefix={currency} />
                      <NumInput label={t("labelSoftware")}    value={software}   onChange={setSoftware}  prefix={currency} />
                      <NumInput label={t("labelOtherOpEx")}   value={otherOpex}  onChange={setOtherOpex} prefix={currency} />
                    </div>
                  </div>

                  {/* Below the line */}
                  <div className="bg-[#0d1426] border border-gray-800 rounded-xl p-5">
                    <h3 className="text-xs font-bold uppercase tracking-wider text-gray-400 mb-3">{t("sectionBelowLine")}</h3>
                    <div className="flex flex-col gap-2.5">
                      <NumInput label={t("labelDA")}       value={da}       onChange={setDa}       prefix={currency} />
                      <NumInput label={t("labelInterest")} value={interest} onChange={setInterest} prefix={currency} />
                      <NumInput label={t("labelTaxRate")} value={taxRate} onChange={setTaxRate} prefix="" suffix="%" step={1}
                        note={t("noteTaxRate")} />
                    </div>
                  </div>
                </div>
              </aside>

              <div className="flex-1 min-w-0 flex flex-col gap-6">
                {/* KPIs */}
                <div className="grid grid-cols-2 lg:grid-cols-4 gap-3">
                  <KpiCard label={t("kpiRevenue")}     value={`${currency}${fmtM(revenue)}`}    sub={t("kpiRevenueSub")}       colorClass="border-l-blue-500" />
                  <KpiCard label={t("kpiGrossMargin")} value={`${grossMargin.toFixed(1)}%`}      sub={`${currency}${fmtM(grossProfit)} ${t("kpiGrossProfitSub")}`} colorClass={grossMargin >= 40 ? "border-l-green-500" : "border-l-amber-500"} />
                  <KpiCard label={t("kpiEBITDA")}      value={`${currency}${fmtM(ebitda)}`}      sub={`${ebitdaMargin.toFixed(1)}% ${t("kpiEBITDAMarginSub")}`}   colorClass={ebitda >= 0 ? "border-l-emerald-500" : "border-l-red-500"} />
                  <KpiCard label={t("kpiNetProfit")}   value={`${currency}${fmtM(netProfit)}`}   sub={`${netMargin.toFixed(1)}% ${t("kpiNetMarginSub")}`}         colorClass={netProfit >= 0 ? "border-l-purple-500" : "border-l-red-500"} />
                </div>

                {/* Waterfall chart */}
                <div className="bg-[#0d1426] border border-gray-800 rounded-xl p-6">
                  <SectionHeader title={t("chartPLWaterfallTitle")} sub={t("chartPLWaterfallSub")} />
                  <ResponsiveContainer width="100%" height={300}>
                    <BarChart data={plWaterfallData} margin={{ top: 10, right: 20, bottom: 10, left: 20 }}>
                      <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.05)" vertical={false} />
                      <XAxis dataKey="name" stroke="#374151" tick={{ fill: "#9ca3af", fontSize: 11 }} />
                      <YAxis stroke="#374151" tick={{ fill: "#6b7280", fontSize: 11 }}
                        tickFormatter={v => `${currency}${fmtM(Number(v))}`} />
                      <Tooltip
                        contentStyle={{ backgroundColor: "#111827", border: "1px solid #1e293b", borderRadius: "8px", fontSize: 12 }}
                        formatter={(v: unknown) => [`${currency}${fmt(Number(v))}`, t("chartTooltipValue")]}
                      />
                      <Bar dataKey="value" name={t("chartTooltipValue")} radius={[4, 4, 0, 0]}>
                        {plWaterfallData.map((entry, i) => <Cell key={i} fill={entry.color} />)}
                      </Bar>
                    </BarChart>
                  </ResponsiveContainer>
                </div>

                {/* Insights */}
                {ebitda < 0 && (
                  <div className="bg-red-900/20 border border-red-700/40 rounded-xl p-4 text-sm text-red-300">
                    {t("insightEBITDANeg", { currency, loss: fmt(Math.abs(ebitda)), opex: fmtM(totalOpex), grossProfit: fmtM(grossProfit) })}
                  </div>
                )}
                {ebitda > 0 && ebitdaMargin >= 15 && (
                  <div className="bg-green-900/20 border border-green-700/40 rounded-xl p-4 text-sm text-green-300">
                    {t("insightEBITDAHealthy", { margin: ebitdaMargin.toFixed(1) })}
                  </div>
                )}
                {ebitda > 0 && ebitdaMargin > 0 && ebitdaMargin < 15 && (
                  <div className="bg-amber-900/20 border border-amber-700/40 rounded-xl p-4 text-sm text-amber-300">
                    {t("insightEBITDALow", { margin: ebitdaMargin.toFixed(1) })}
                  </div>
                )}
                {netProfit < 0 && ebitda > 0 && (
                  <div className="bg-amber-900/20 border border-amber-700/40 rounded-xl p-4 text-sm text-amber-300">
                    {t("insightEBITDAPosNetLoss")}
                  </div>
                )}

                <div className="flex justify-end">
                  <button onClick={() => setStep(2)} className="bg-blue-600 hover:bg-blue-500 text-white font-bold px-8 py-3 rounded-xl transition">
                    {t("nextCashFlow")}
                  </button>
                </div>
              </div>
            </div>
          )}

          {/* ── STEP 2: Cash Flow ─────────────────────────────────────────── */}
          {step === 2 && (
            <div className="flex flex-col lg:flex-row gap-6">
              <aside className="lg:w-72 xl:w-80 shrink-0">
                <div className="lg:sticky lg:top-[140px] flex flex-col gap-4">
                  {/* Auto-populated from Step 1 */}
                  <div className="bg-[#0d1426] border border-gray-800 rounded-xl p-5">
                    <h3 className="text-xs font-bold uppercase tracking-wider text-blue-400 mb-3">{t("sectionFromPL")}</h3>
                    <div className="flex flex-col gap-1 text-sm">
                      {[
                        [t("labelNetProfit"),  netProfit],
                        [t("labelDAAddBack"),  da],
                        [t("labelEBITDA"),     ebitda],
                      ].map(([label, val]) => (
                        <div key={String(label)} className="flex justify-between py-1.5 border-b border-gray-800 last:border-0">
                          <span className="text-gray-400">{label}</span>
                          <span className={Number(val) >= 0 ? "text-white font-semibold" : "text-red-400 font-semibold"}>
                            {currency}{fmt(Math.round(Number(val)))}
                          </span>
                        </div>
                      ))}
                    </div>
                  </div>

                  {/* Working capital */}
                  <div className="bg-[#0d1426] border border-gray-800 rounded-xl p-5">
                    <h3 className="text-xs font-bold uppercase tracking-wider text-purple-400 mb-3">{t("sectionWorkingCapital")}</h3>
                    <div className="flex flex-col gap-2.5">
                      <NumInput label={t("labelARDays")}  value={arDays}  onChange={setArDays}  prefix="" suffix="days" step={5} />
                      <NumInput label={t("labelAPDays")}  value={apDays}  onChange={setApDays}  prefix="" suffix="days" step={5} />
                      <NumInput label={t("labelInvDays")} value={invDays} onChange={setInvDays} prefix="" suffix="days" step={5} />
                    </div>
                  </div>

                  {/* CapEx & debt */}
                  <div className="bg-[#0d1426] border border-gray-800 rounded-xl p-5">
                    <h3 className="text-xs font-bold uppercase tracking-wider text-orange-400 mb-3">{t("sectionCapFinancing")}</h3>
                    <div className="flex flex-col gap-2.5">
                      <NumInput label={t("labelCapEx")}     value={capex}     onChange={setCapex}     prefix={currency} />
                      <NumInput label={t("labelDebtRepay")} value={debtRepay} onChange={setDebtRepay} prefix={currency} />
                    </div>
                  </div>
                </div>
              </aside>

              <div className="flex-1 min-w-0 flex flex-col gap-6">
                {/* KPIs */}
                <div className="grid grid-cols-2 lg:grid-cols-4 gap-3">
                  <KpiCard label={t("kpiOperatingCF")}    value={`${currency}${fmtM(operatingCF)}`}  sub={t("kpiOperatingCFSub")}   colorClass={operatingCF >= 0 ? "border-l-green-500" : "border-l-red-500"} />
                  <KpiCard label={t("kpiFreeCashFlow")}   value={`${currency}${fmtM(freeCashFlow)}`} sub={t("kpiFCFSub")}           colorClass={freeCashFlow >= 0 ? "border-l-blue-500" : "border-l-red-500"} />
                  <KpiCard label={t("kpiNetCashFlow")}    value={`${currency}${fmtM(netCashFlow)}`}  sub={t("kpiNetCFSub")}         colorClass={netCashFlow >= 0 ? "border-l-purple-500" : "border-l-red-500"} />
                  <KpiCard label={t("kpiCashConversion")} value={`${cashConversion.toFixed(0)}%`}    sub={t("kpiCashConversionSub")} colorClass={cashConversion >= 70 ? "border-l-emerald-500" : "border-l-amber-500"} />
                </div>

                {/* Working capital breakdown */}
                <div className="bg-[#0d1426] border border-gray-800 rounded-xl p-6">
                  <SectionHeader title={t("chartWCBreakdownTitle")} sub={t("chartWCBreakdownSub")} />
                  <div className="grid grid-cols-3 gap-4">
                    {[
                      { label: t("labelARBalance"), value: arBalance,  color: "text-amber-400" },
                      { label: t("labelAPBalance"), value: apBalance,  color: "text-green-400" },
                      { label: t("labelInventory"), value: invBalance, color: "text-blue-400" },
                    ].map(item => (
                      <div key={item.label} className="bg-[#111827] rounded-xl p-4 text-center">
                        <div className="text-xs text-gray-500 mb-1">{item.label}</div>
                        <div className={`text-xl font-bold ${item.color}`}>{currency}{fmtM(item.value)}</div>
                      </div>
                    ))}
                  </div>
                  <div className="mt-3 text-sm text-gray-400">
                    {t("netWorkingCapital")}: <span className={workingCapital > 0 ? "text-white font-bold" : "text-red-400 font-bold"}>{currency}{fmtM(workingCapital)}</span>
                    <span className="text-gray-600 text-xs ml-2">{t("netWCFormula")}</span>
                  </div>
                </div>

                {/* Cash flow chart */}
                <div className="bg-[#0d1426] border border-gray-800 rounded-xl p-6">
                  <SectionHeader title={t("chartCFBridgeTitle")} sub={t("chartCFBridgeSub")} />
                  <ResponsiveContainer width="100%" height={260}>
                    <BarChart data={cfBarData} margin={{ top: 10, right: 20, bottom: 10, left: 20 }}>
                      <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.05)" vertical={false} />
                      <XAxis dataKey="name" stroke="#374151" tick={{ fill: "#9ca3af", fontSize: 11 }} />
                      <YAxis stroke="#374151" tick={{ fill: "#6b7280", fontSize: 11 }}
                        tickFormatter={v => `${currency}${fmtM(Number(v))}`} />
                      <Tooltip
                        contentStyle={{ backgroundColor: "#111827", border: "1px solid #1e293b", borderRadius: "8px", fontSize: 12 }}
                        formatter={(v: unknown) => [`${currency}${fmt(Math.abs(Number(v)))}`, t("chartTooltipAmount")]}
                      />
                      <Bar dataKey="value" radius={[4, 4, 0, 0]}>
                        {cfBarData.map((entry, i) => <Cell key={i} fill={entry.color} />)}
                      </Bar>
                    </BarChart>
                  </ResponsiveContainer>
                </div>

                {/* Insights */}
                {freeCashFlow < 0 && (
                  <div className="bg-red-900/20 border border-red-700/40 rounded-xl p-4 text-sm text-red-300">
                    {t("insightFCFNeg", { currency, amount: fmt(Math.abs(freeCashFlow)) })}
                  </div>
                )}
                {cashConversion < 70 && ebitda > 0 && freeCashFlow > 0 && (
                  <div className="bg-amber-900/20 border border-amber-700/40 rounded-xl p-4 text-sm text-amber-300">
                    {t("insightCashConvLow", { pct: cashConversion.toFixed(0) })}
                  </div>
                )}
                {freeCashFlow > 0 && cashConversion >= 70 && (
                  <div className="bg-green-900/20 border border-green-700/40 rounded-xl p-4 text-sm text-green-300">
                    {t("insightCashConvStrong", { pct: cashConversion.toFixed(0) })}
                  </div>
                )}

                <div className="flex justify-between items-center">
                  <button onClick={() => setStep(1)} className="text-gray-400 hover:text-white text-sm transition">{t("btnBack")}</button>
                  <button onClick={() => setStep(3)} className="bg-blue-600 hover:bg-blue-500 text-white font-bold px-8 py-3 rounded-xl transition">
                    {t("nextBalanceSheet")}
                  </button>
                </div>
              </div>
            </div>
          )}

          {/* ── STEP 3: Balance Sheet ─────────────────────────────────────── */}
          {step === 3 && (
            <div className="flex flex-col lg:flex-row gap-6">
              <aside className="lg:w-72 xl:w-80 shrink-0">
                <div className="lg:sticky lg:top-[140px] flex flex-col gap-4">
                  {/* AR auto-populated */}
                  <div className="bg-[#0d1426] border border-gray-800 rounded-xl p-4">
                    <div className="flex items-center justify-between mb-1">
                      <span className="text-xs text-gray-500 uppercase tracking-wider">{t("labelARAutoStep2")}</span>
                    </div>
                    <div className="text-lg font-bold text-blue-400">{currency}{fmtM(arBalance)}</div>
                  </div>

                  {/* Assets */}
                  <div className="bg-[#0d1426] border border-gray-800 rounded-xl p-5">
                    <h3 className="text-xs font-bold uppercase tracking-wider text-blue-400 mb-3">{t("sectionAssets")}</h3>
                    <div className="flex flex-col gap-2.5">
                      <NumInput label={t("labelCash")}              value={bsCash}            onChange={setBsCash}            prefix={currency} />
                      <NumInput label={t("labelOtherCurrentAssets")} value={otherCurrentAssets} onChange={setOtherCurrentAssets} prefix={currency} />
                      <NumInput label={t("labelFixedAssetsNet")}    value={fixedAssets}        onChange={setFixedAssets}        prefix={currency} />
                    </div>
                  </div>

                  {/* Liabilities */}
                  <div className="bg-[#0d1426] border border-gray-800 rounded-xl p-5">
                    <h3 className="text-xs font-bold uppercase tracking-wider text-red-400 mb-3">{t("sectionLiabilities")}</h3>
                    <div className="flex flex-col gap-2.5">
                      <NumInput label={t("labelSTDebt")}           value={stDebt}           onChange={setStDebt}           prefix={currency} />
                      <NumInput label={t("labelLTDebt")}           value={ltDebt}           onChange={setLtDebt}           prefix={currency} />
                      <NumInput label={t("labelOtherLiabilities")} value={otherLiabilities} onChange={setOtherLiabilities} prefix={currency} />
                    </div>
                  </div>
                </div>
              </aside>

              <div className="flex-1 min-w-0 flex flex-col gap-6">
                {/* KPIs */}
                <div className="grid grid-cols-2 lg:grid-cols-4 gap-3">
                  <KpiCard label={t("kpiTotalAssets")} value={`${currency}${fmtM(totalAssets)}`}  sub={`${currency}${fmtM(totalCurrentAssets)} ${t("kpiTotalAssetsSub")}`}  colorClass="border-l-blue-500" />
                  <KpiCard label={t("kpiNetDebt")}     value={`${currency}${fmtM(netDebt)}`}      sub={`${currency}${fmtM(totalDebt)} ${t("kpiNetDebtSub")}`}         colorClass={netDebt < 0 ? "border-l-green-500" : "border-l-amber-500"} />
                  <KpiCard label={t("kpiBookEquity")}  value={`${currency}${fmtM(bookEquity)}`}   sub={t("kpiBookEquitySub")}                          colorClass={bookEquity >= 0 ? "border-l-emerald-500" : "border-l-red-500"} />
                  <KpiCard label={t("kpiLeverage")}    value={ebitda > 0 ? `${leverage.toFixed(1)}×` : t("kpiLeverageNA")} sub={t("kpiLeverageSub")}            colorClass={leverage < 2 ? "border-l-green-500" : leverage < 3 ? "border-l-amber-500" : "border-l-red-500"} />
                </div>

                {/* Balance check */}
                <div className={`rounded-xl p-4 text-sm border ${Math.abs(totalAssets - totalLiabilities - Math.max(0, bookEquity)) < 1 ? "bg-green-900/10 border-green-700/30 text-green-300" : "bg-[#0d1426] border-gray-800 text-gray-300"}`}>
                  <div className="font-semibold mb-2">{t("bsSummaryTitle")}</div>
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <div className="text-xs text-gray-500 uppercase tracking-wider mb-1">{t("bsTotalAssets")}</div>
                      <div className="text-white font-bold">{currency}{fmt(Math.round(totalAssets))}</div>
                    </div>
                    <div>
                      <div className="text-xs text-gray-500 uppercase tracking-wider mb-1">{t("bsTotalLiabEquity")}</div>
                      <div className="text-white font-bold">{currency}{fmt(Math.round(totalLiabilities + Math.max(0, bookEquity)))}</div>
                    </div>
                  </div>
                </div>

                {/* Stacked bar chart */}
                <div className="bg-[#0d1426] border border-gray-800 rounded-xl p-6">
                  <SectionHeader title={t("chartBSCompositionTitle")} sub={t("chartBSCompositionSub")} />
                  <ResponsiveContainer width="100%" height={280}>
                    <BarChart data={bsChartData} margin={{ top: 10, right: 20, bottom: 10, left: 20 }}>
                      <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.05)" vertical={false} />
                      <XAxis dataKey="name" stroke="#374151" tick={{ fill: "#9ca3af", fontSize: 11 }} />
                      <YAxis stroke="#374151" tick={{ fill: "#6b7280", fontSize: 11 }}
                        tickFormatter={v => `${currency}${fmtM(Number(v))}`} />
                      <Tooltip
                        contentStyle={{ backgroundColor: "#111827", border: "1px solid #1e293b", borderRadius: "8px", fontSize: 12 }}
                        formatter={(v: unknown) => [`${currency}${fmt(Number(v))}`, undefined]}
                      />
                      <Legend wrapperStyle={{ color: "#9ca3af", fontSize: 12, paddingTop: 8 }} />
                      <Bar dataKey="Cash"            stackId="a" fill="#3b82f6"  radius={[0,0,0,0]} />
                      <Bar dataKey="AR & Current"    stackId="a" fill="#6366f1"  radius={[0,0,0,0]} />
                      <Bar dataKey="Fixed Assets"    stackId="a" fill="#8b5cf6"  radius={[4,4,0,0]} />
                      <Bar dataKey="Short-term Debt" stackId="a" fill="#ef4444"  radius={[0,0,0,0]} />
                      <Bar dataKey="Long-term Debt"  stackId="a" fill="#f97316"  radius={[0,0,0,0]} />
                      <Bar dataKey="Other Liabilities" stackId="a" fill="#f59e0b" radius={[0,0,0,0]} />
                      <Bar dataKey="Equity"          stackId="a" fill="#22c55e"  radius={[4,4,0,0]} />
                    </BarChart>
                  </ResponsiveContainer>
                </div>

                {/* Insights */}
                {bookEquity < 0 && (
                  <div className="bg-red-900/20 border border-red-700/40 rounded-xl p-4 text-sm text-red-300">
                    {t("insightNegEquity", { currency, amount: fmt(Math.abs(bookEquity)) })}
                  </div>
                )}
                {leverage > 3 && ebitda > 0 && (
                  <div className="bg-red-900/20 border border-red-700/40 rounded-xl p-4 text-sm text-red-300">
                    {t("insightLeverageHigh", { lev: leverage.toFixed(1) })}
                  </div>
                )}
                {leverage <= 2 && leverage >= 0 && ebitda > 0 && (
                  <div className="bg-green-900/20 border border-green-700/40 rounded-xl p-4 text-sm text-green-300">
                    {t("insightLeverageGood", { lev: leverage.toFixed(1) })}
                  </div>
                )}
                {leverage > 2 && leverage <= 3 && ebitda > 0 && (
                  <div className="bg-amber-900/20 border border-amber-700/40 rounded-xl p-4 text-sm text-amber-300">
                    {t("insightLeverageAmber", { lev: leverage.toFixed(1) })}
                  </div>
                )}

                <div className="flex justify-between items-center">
                  <button onClick={() => setStep(2)} className="text-gray-400 hover:text-white text-sm transition">{t("btnBack")}</button>
                  <button onClick={() => setStep(4)} className="bg-blue-600 hover:bg-blue-500 text-white font-bold px-8 py-3 rounded-xl transition">
                    {t("nextValuation")}
                  </button>
                </div>
              </div>
            </div>
          )}

          {/* ── STEP 4: Valuation ─────────────────────────────────────────── */}
          {step === 4 && (
            <div className="flex flex-col lg:flex-row gap-6">
              <aside className="lg:w-72 xl:w-80 shrink-0">
                <div className="lg:sticky lg:top-[140px] flex flex-col gap-4">
                  {/* From previous steps */}
                  <div className="bg-[#0d1426] border border-gray-800 rounded-xl p-5">
                    <h3 className="text-xs font-bold uppercase tracking-wider text-blue-400 mb-3">{t("sectionInputsSteps13")}</h3>
                    <div className="flex flex-col gap-1 text-sm">
                      {[
                        [t("labelRevenue"),      revenue],
                        [t("labelEBITDA"),        ebitda],
                        [t("labelNetProfit"),     netProfit],
                        [t("labelFreeCashFlow"),  freeCashFlow],
                        [t("labelNetDebt"),       netDebt],
                      ].map(([label, val]) => (
                        <div key={String(label)} className="flex justify-between py-1.5 border-b border-gray-800 last:border-0">
                          <span className="text-gray-400">{label}</span>
                          <span className={Number(val) >= 0 ? "text-white font-semibold" : "text-red-400 font-semibold"}>
                            {currency}{fmt(Math.round(Number(val)))}
                          </span>
                        </div>
                      ))}
                    </div>
                  </div>

                  {/* Multiple inputs */}
                  <div className="bg-[#0d1426] border border-gray-800 rounded-xl p-5">
                    <h3 className="text-xs font-bold uppercase tracking-wider text-purple-400 mb-3">{t("sectionMultiples")}</h3>
                    <div className="flex flex-col gap-2.5">
                      <NumInput label={t("labelEVEBITDAMult")} value={evEbitdaMult} onChange={setEvEbitdaMult} prefix="" suffix="×" step={0.5} />
                      <NumInput label={t("labelRevMult")}      value={revMult}      onChange={setRevMult}      prefix="" suffix="×" step={0.1} />
                      <NumInput label={t("labelPEMult")}       value={peMult}       onChange={setPeMult}       prefix="" suffix="×" step={0.5} />
                    </div>
                  </div>

                  {/* DCF inputs */}
                  <div className="bg-[#0d1426] border border-gray-800 rounded-xl p-5">
                    <h3 className="text-xs font-bold uppercase tracking-wider text-green-400 mb-3">{t("sectionDCF")}</h3>
                    <div className="flex flex-col gap-2.5">
                      <NumInput label={t("labelWACC")} value={discountRate} onChange={setDiscountRate} prefix="" suffix="%" step={0.5}
                        note={t("noteWACC")} />
                      <NumInput label={t("labelTermGrowth")} value={termGrowth} onChange={setTermGrowth} prefix="" suffix="%" step={0.5}
                        note={t("noteTermGrowth")} />
                    </div>
                    <p className="text-xs text-gray-600 mt-2">{t("noteDCFFCF")}</p>
                  </div>
                </div>
              </aside>

              <div className="flex-1 min-w-0 flex flex-col gap-6">
                {/* KPIs */}
                <div className="grid grid-cols-2 lg:grid-cols-4 gap-3">
                  <KpiCard label={t("kpiEVEBITDAValue")} value={eqByEbitda > 0 ? `${currency}${fmtM(eqByEbitda)}` : "—"} sub={`${evEbitdaMult}× ${t("kpiEVEBITDASub")}`}    colorClass="border-l-blue-500" />
                  <KpiCard label={t("kpiRevMultValue")}  value={eqByRev > 0   ? `${currency}${fmtM(eqByRev)}`   : "—"} sub={`${revMult}× ${t("kpiRevMultSub")}`}         colorClass="border-l-purple-500" />
                  <KpiCard label={t("kpiDCFValue")}      value={dcfEquity > 0 ? `${currency}${fmtM(dcfEquity)}` : "—"} sub={t("kpiDCFSub")}       colorClass="border-l-green-500" />
                  <KpiCard label={t("kpiBlendedExit")}   value={blendedEquity > 0 ? `${currency}${fmtM(blendedEquity)}` : "—"} sub={t("kpiBlendedSub")}  colorClass="border-l-amber-500" />
                </div>

                {/* Exit price range */}
                {blendedEquity > 0 && (
                  <div className="bg-[#0d1426] border border-blue-700/40 rounded-xl p-5">
                    <div className="text-xs text-gray-400 uppercase tracking-wider mb-3">{t("exitRangeTitle")}</div>
                    <div className="flex items-end gap-6">
                      <div>
                        <div className="text-xs text-gray-500 mb-1">{t("exitRangeLow")}</div>
                        <div className="text-2xl font-bold text-amber-400">{currency}{fmtM(exitLow)}</div>
                      </div>
                      <div className="text-gray-600 text-2xl font-light pb-1">—</div>
                      <div>
                        <div className="text-xs text-gray-500 mb-1">{t("exitRangeHigh")}</div>
                        <div className="text-2xl font-bold text-green-400">{currency}{fmtM(exitHigh)}</div>
                      </div>
                      <div className="ml-auto text-right">
                        <div className="text-xs text-gray-500 mb-1">{t("exitRangeBook")}</div>
                        <div className={`text-lg font-bold ${bookEquity >= 0 ? "text-gray-300" : "text-red-400"}`}>{currency}{fmtM(bookEquity)}</div>
                      </div>
                    </div>
                    {blendedEquity > bookEquity && bookEquity > 0 && (
                      <div className="mt-3 text-sm text-green-300">
                        {t("exitValueCreated", {
                          amount: `${currency}${fmtM(blendedEquity - bookEquity)}`,
                          mult: ((blendedEquity / bookEquity - 1) * 100).toFixed(0),
                        })}
                      </div>
                    )}
                  </div>
                )}

                {/* Valuation chart */}
                <div className="bg-[#0d1426] border border-gray-800 rounded-xl p-6">
                  <SectionHeader title={t("chartValuationTitle")} sub={t("chartValuationSub")} />
                  <ResponsiveContainer width="100%" height={280}>
                    <BarChart data={valuationChartData} margin={{ top: 10, right: 20, bottom: 10, left: 20 }}>
                      <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.05)" vertical={false} />
                      <XAxis dataKey="name" stroke="#374151" tick={{ fill: "#9ca3af", fontSize: 11 }} />
                      <YAxis stroke="#374151" tick={{ fill: "#6b7280", fontSize: 11 }}
                        tickFormatter={v => `${currency}${fmtM(Number(v))}`} />
                      <Tooltip
                        contentStyle={{ backgroundColor: "#111827", border: "1px solid #1e293b", borderRadius: "8px", fontSize: 12 }}
                        formatter={(v: unknown) => [`${currency}${fmt(Number(v))}`, t("chartTooltipEquityValue")]}
                      />
                      <Bar dataKey="value" name={t("chartTooltipEquityValue")} radius={[4, 4, 0, 0]}>
                        {valuationChartData.map((entry, i) => <Cell key={i} fill={entry.color} />)}
                      </Bar>
                    </BarChart>
                  </ResponsiveContainer>
                </div>

                {/* Insights */}
                {ebitda <= 0 && (
                  <div className="bg-red-900/20 border border-red-700/40 rounded-xl p-4 text-sm text-red-300">
                    {t("insightNegEBITDAValuation")}
                  </div>
                )}
                {blendedEquity > 0 && (
                  <div className="bg-blue-900/20 border border-blue-700/40 rounded-xl p-4 text-sm text-blue-300">
                    {t("insightBlendedValuation", { currency, amount: fmtM(blendedEquity) })}
                  </div>
                )}

                <div className="flex justify-between items-center">
                  <button onClick={() => setStep(3)} className="text-gray-400 hover:text-white text-sm transition">{t("btnBack")}</button>
                  <button onClick={() => setStep(5)} className="bg-blue-600 hover:bg-blue-500 text-white font-bold px-8 py-3 rounded-xl transition">
                    {t("nextExitStrategy")}
                  </button>
                </div>
              </div>
            </div>
          )}

          {/* ── STEP 5: Exit Strategy ─────────────────────────────────────── */}
          {step === 5 && (
            <div className="flex flex-col gap-8">

              {/* A — Company at a Glance */}
              <div>
                <div className="flex items-center gap-2 mb-4">
                  <span className="text-xl">🏢</span>
                  <h2 className="text-white font-bold text-lg">{t("glanceTitle")}</h2>
                </div>
                <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-3">
                  {[
                    { label: t("glanceRevenue"),       val: `${currency}${fmtM(revenue)}`,     color: "text-blue-400" },
                    { label: t("glanceEBITDA"),        val: `${currency}${fmtM(ebitda)}`,      color: ebitda >= 0 ? "text-green-400" : "text-red-400" },
                    { label: t("glanceEBITDAMargin"),  val: `${ebitdaMargin.toFixed(1)}%`,     color: ebitdaMargin >= 15 ? "text-green-400" : "text-amber-400" },
                    { label: t("glanceFCF"),           val: `${currency}${fmtM(freeCashFlow)}`,color: freeCashFlow >= 0 ? "text-green-400" : "text-red-400" },
                    { label: t("glanceNetDebt"),       val: `${currency}${fmtM(netDebt)}`,     color: netDebt <= 0 ? "text-green-400" : "text-amber-400" },
                    { label: t("glanceBlendedExit"),   val: blendedEquity > 0 ? `${currency}${fmtM(blendedEquity)}` : "—", color: "text-purple-400" },
                  ].map(item => (
                    <div key={item.label} className="bg-[#0d1426] border border-gray-800 rounded-xl p-4 text-center">
                      <div className="text-xs text-gray-500 uppercase tracking-wider mb-1">{item.label}</div>
                      <div className={`text-xl font-extrabold ${item.color}`}>{item.val}</div>
                    </div>
                  ))}
                </div>
              </div>

              {/* B — Exit Options */}
              <div>
                <div className="flex items-center gap-2 mb-4">
                  <span className="text-xl">🚪</span>
                  <h2 className="text-white font-bold text-lg">{t("exitOptionsTitle")}</h2>
                </div>
                <div className="grid md:grid-cols-2 gap-4">
                  {[
                    {
                      icon: "🏢", title: t("tradeSaleTitle"),
                      score: tradeSaleScore,
                      when: t("tradeSaleWhen"),
                      tips: t.raw("tradeSaleTips") as string[],
                    },
                    {
                      icon: "💼", title: t("peBuyoutTitle"),
                      score: peBuyoutScore,
                      when: t("peBuyoutWhen"),
                      tips: t.raw("peBuyoutTips") as string[],
                    },
                    {
                      icon: "🤝", title: t("mboTitle"),
                      score: mboScore,
                      when: t("mboWhen"),
                      tips: t.raw("mboTips") as string[],
                    },
                    {
                      icon: "🌱", title: t("organicGrowthTitle"),
                      score: organicGrowthScore,
                      when: t("organicGrowthWhen"),
                      tips: t.raw("organicGrowthTips") as string[],
                    },
                  ].map(option => (
                    <div key={option.title} className="bg-[#0d1426] border border-gray-800 rounded-xl p-6">
                      <div className="flex items-start justify-between mb-3">
                        <div className="flex items-center gap-3">
                          <span className="text-2xl">{option.icon}</span>
                          <h3 className="text-white font-bold text-base">{option.title}</h3>
                        </div>
                        <ScoreBadge
                          score={option.score}
                          highLabel={t("scoreBadgeHigh")}
                          medLabel={t("scoreBadgeMedium")}
                          lowLabel={t("scoreBadgeLow")}
                        />
                      </div>
                      <p className="text-gray-400 text-xs mb-3 leading-relaxed">{option.when}</p>
                      <ul className="flex flex-col gap-1.5">
                        {option.tips.map((tip, i) => (
                          <li key={i} className="flex items-start gap-2 text-xs text-gray-300">
                            <span className="text-blue-400 shrink-0 mt-0.5">›</span>
                            <span>{tip}</span>
                          </li>
                        ))}
                      </ul>
                    </div>
                  ))}
                </div>
              </div>

              {/* C — Exit Readiness Checklist */}
              <div>
                <div className="flex items-center gap-2 mb-4">
                  <span className="text-xl">✅</span>
                  <h2 className="text-white font-bold text-lg">{t("checklistTitle")}</h2>
                </div>
                <div className="bg-[#0d1426] border border-gray-800 rounded-xl p-6">
                  <div className="grid md:grid-cols-2 gap-x-8">
                    {exitChecklist.map((item, i) => (
                      <ChecklistItem key={i} item={item} />
                    ))}
                  </div>
                  <div className="mt-4 pt-4 border-t border-gray-800 flex items-center gap-3">
                    <div className="text-sm text-gray-400">
                      {t("checklistPassed")} <span className="text-green-400 font-bold">{exitChecklist.filter(i => i.pass).length}</span>
                      {" "}{t("checklistOf")}{" "}{exitChecklist.length} {t("checklistChecks")}
                    </div>
                    {exitChecklist.filter(i => i.amber).length > 0 && (
                      <div className="text-sm text-gray-400">
                        {t("checklistAmber")} <span className="text-amber-400 font-bold">{exitChecklist.filter(i => i.amber && !i.pass).length}</span>
                      </div>
                    )}
                  </div>
                </div>
              </div>

              {/* D — Key Actions */}
              <div>
                <div className="flex items-center gap-2 mb-4">
                  <span className="text-xl">🎯</span>
                  <h2 className="text-white font-bold text-lg">{t("keyActionsTitle")}</h2>
                </div>
                <div className="bg-[#0d1426] border border-gray-800 rounded-xl p-6">
                  <ul className="flex flex-col gap-4">
                    {dynamicActions.map((action, i) => (
                      <li key={i} className="flex items-start gap-3">
                        <span className="flex-shrink-0 w-6 h-6 rounded-full bg-blue-600/20 border border-blue-500/30 text-blue-400 text-xs font-bold flex items-center justify-center mt-0.5">
                          {i + 1}
                        </span>
                        <span className="text-sm text-gray-300 leading-relaxed">{action}</span>
                      </li>
                    ))}
                  </ul>
                </div>
              </div>

              {/* Disclaimer */}
              <div className="bg-[#0d1426] border border-gray-700/50 rounded-xl p-5 text-xs text-gray-500 leading-relaxed">
                <strong className="text-gray-400">{t("disclaimerTitle")}</strong> {t("disclaimerText")}
              </div>

              <div className="flex justify-between items-center">
                <button onClick={() => setStep(4)} className="text-gray-400 hover:text-white text-sm transition">{t("btnBack")}</button>
                <div className="flex items-center gap-3">
                  <button
                    onClick={handleExportPdf}
                    disabled={pdfLoading}
                    className="bg-blue-600 hover:bg-blue-500 disabled:opacity-50 text-white font-bold px-6 py-3 rounded-xl transition text-sm"
                  >
                    {pdfLoading ? "Generating…" : t("exportPdf")}
                  </button>
                  <Link href="/tools/business" className="bg-[#0d1426] border border-gray-700 hover:border-blue-500 text-gray-300 hover:text-white font-semibold px-6 py-3 rounded-xl transition text-sm">
                    {t("backToAllTools")}
                  </Link>
                </div>
              </div>
            </div>
          )}

        </div>
      </div>
      <RelatedTools current="financial-planner-company" />
    </main>
  );
}
