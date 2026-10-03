"use client";

import { useState, useMemo, useRef } from "react";
import Link from "next/link";
import { useTranslations } from "next-intl";
import RelatedTools from "@/components/RelatedTools";
import { allocationAt, debtSchedule, glidePath, growthPath, RETIREMENT_AGE, RISK_PROFILES, type RiskKey } from "@/lib/planner";
import { BudgetFlow, chartImages, DebtPayoff, GlidePathChart, GrowthChart } from "./charts";

const fmt = (n: number) => n.toLocaleString("en-GB", { maximumFractionDigits: 0 });

const CURRENCIES = ["£", "$", "€", "¥", "₹"];

const STEPS = [
  { num: 1, labelKey: "step1Label", icon: "💰", descKey: "step1Desc" },
  { num: 2, labelKey: "step2Label", icon: "💳", descKey: "step2Desc" },
  { num: 3, labelKey: "step3Label", icon: "📈", descKey: "step3Desc" },
  { num: 4, labelKey: "step4Label", icon: "🎯", descKey: "step4Desc" },
  { num: 5, labelKey: "step5Label", icon: "📋", descKey: "step5Desc" },
];

const EXPENSE_CATS = [
  { key: "housing",       labelKey: "catHousing",       color: "#3b82f6", default: 1200 },
  { key: "transport",     labelKey: "catTransport",     color: "#8b5cf6", default: 300  },
  { key: "food",          labelKey: "catFood",          color: "#f59e0b", default: 400  },
  { key: "utilities",     labelKey: "catUtilities",     color: "#22c55e", default: 200  },
  { key: "health",        labelKey: "catHealth",        color: "#ec4899", default: 100  },
  { key: "entertainment", labelKey: "catEntertainment", color: "#14b8a6", default: 150  },
  { key: "other",         labelKey: "catOther",         color: "#9ca3af", default: 150  },
];

const DEBT_ITEMS = [
  { key: "mortgage",    labelKey: "debtMortgage",    rate: 4.5,  term: 25, color: "#3b82f6" },
  { key: "car",         labelKey: "debtCar",         rate: 7.0,  term: 5,  color: "#8b5cf6" },
  { key: "credit_card", labelKey: "debtCreditCard",  rate: 22.0, term: 3,  color: "#ef4444" },
  { key: "student",     labelKey: "debtStudent",     rate: 5.0,  term: 10, color: "#f59e0b" },
  { key: "personal",    labelKey: "debtPersonal",    rate: 12.0, term: 5,  color: "#ec4899" },
];

const RATE_PRESETS = [
  { label: "S&P 500", rate: 10 },
  { label: "Global",  rate: 8  },
  { label: "Bonds",   rate: 4  },
  { labelKey: "presetCustom", rate: null },
];

function NumInput({ label, value, onChange, prefix = "£", step = 100, note }: {
  label: string; value: number; onChange: (v: number) => void;
  prefix?: string; step?: number; note?: string;
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
      </div>
      {note && <p className="text-xs text-gray-600">{note}</p>}
    </div>
  );
}

function KpiCard({ label, value, sub, colorClass }: { label: string; value: string; sub: string; colorClass: string }) {
  return (
    <div className={`bg-[#0d1426] border border-gray-800 border-l-4 ${colorClass} rounded-xl p-4`}>
      <div className="text-xs text-gray-400 uppercase tracking-wider font-semibold mb-1">{label}</div>
      <div className="text-2xl font-extrabold text-white leading-tight">{value}</div>
      <div className="text-xs text-gray-500 mt-1">{sub}</div>
    </div>
  );
}

export default function FinancialPlannerPage() {
  const t = useTranslations("financialPlanner");
  const tc = useTranslations("toolCommon");

  const [step, setStep] = useState(1);
  const [currency, setCurrency] = useState("£");
  const [pdfLoading, setPdfLoading] = useState(false);
  const reportCharts = useRef<HTMLDivElement>(null);

  // Step 1 — Budget
  const [income, setIncome] = useState(4000);
  const [expenses, setExpenses] = useState<Record<string, number>>(
    Object.fromEntries(EXPENSE_CATS.map(c => [c.key, c.default]))
  );

  // Step 2 — Debt
  const [debts, setDebts] = useState<Record<string, number>>({
    mortgage: 200000, car: 15000, credit_card: 3000, student: 0, personal: 0,
  });

  // Step 3 — Compounding
  const [years, setYears] = useState(20);
  const [ratePreset, setRatePreset] = useState(1);
  const [customRate, setCustomRate] = useState(8);

  // Step 4 — Allocation
  const [age, setAge] = useState(35);
  const [risk, setRisk] = useState<RiskKey>("moderate");

  // ── Translated label lookups ─────────────────────────────────────────────
  type TKey = Parameters<typeof t>[0];

  // ── Step 1 calculations ──────────────────────────────────────────────────
  const totalExpenses = useMemo(() => Object.values(expenses).reduce((a, b) => a + b, 0), [expenses]);
  const netSavings = income - totalExpenses;
  const savingsRate = income > 0 ? (netSavings / income) * 100 : 0;

  const flowCategories = EXPENSE_CATS.map(c => ({ name: t(c.labelKey as TKey), value: expenses[c.key] ?? 0, color: c.color }));
  const flowLabels = { income: t("flowIncome"), spending: t("flowSpending"), savings: t("flowSavings"), shortfall: t("flowShortfall") };

  // ── Step 2 calculations ──────────────────────────────────────────────────
  const totalDebt = useMemo(() => Object.values(debts).reduce((a, b) => a + b, 0), [debts]);
  const schedule = useMemo(
    () => debtSchedule(DEBT_ITEMS.map(d => ({ key: d.key, balance: debts[d.key] ?? 0, rate: d.rate, term: d.term }))),
    [debts],
  );
  const totalInterestCost = schedule.totalInterest;
  const debtSeries = DEBT_ITEMS.filter(d => (debts[d.key] ?? 0) > 0).map(d => ({ key: d.key, name: t(d.labelKey as TKey), color: d.color }));

  const highestRateDebt = DEBT_ITEMS
    .filter(d => debts[d.key] > 0)
    .sort((a, b) => b.rate - a.rate)[0];

  // ── Step 3 calculations ──────────────────────────────────────────────────
  const annualRate = RATE_PRESETS[ratePreset].rate ?? customRate;
  const monthlyContrib = Math.max(0, netSavings);

  const growth = useMemo(() => growthPath(monthlyContrib, annualRate, years), [monthlyContrib, annualRate, years]);
  const lastGrowth = growth.rows[growth.rows.length - 1];
  const finalValue = lastGrowth?.value ?? 0;
  const finalInterest = lastGrowth?.interest ?? 0;
  const growthLabels = {
    paidIn: t("s3LegendPaidIn"),
    growth: t("s3LegendGrowth"),
    low: t("s3ScenarioLine", { rate: String(Math.max(0, annualRate - 3)) }),
    high: t("s3ScenarioLine", { rate: String(annualRate + 3) }),
    crossover: growth.crossover !== null ? t("s3Crossover", { year: String(growth.crossover) }) : "",
    year: t("s3YearLabel"),
  };

  // ── Step 4 calculations ──────────────────────────────────────────────────
  const profile = RISK_PROFILES[risk];
  const mix = allocationAt(risk, age);
  const allocData = [
    { name: t("allocStocks"),       value: mix.stocks },
    { name: t("allocBonds"),        value: mix.bonds },
    { name: t("allocCash"),         value: mix.cash },
    { name: t("allocAlternatives"), value: mix.alternatives },
  ];
  const glide = useMemo(() => glidePath(risk, age), [risk, age]);
  const glideSeries = [
    { key: "stocks" as const,       name: t("allocStocks"),       color: "#3b82f6" },
    { key: "bonds" as const,        name: t("allocBonds"),        color: "#22c55e" },
    { key: "cash" as const,         name: t("allocCash"),         color: "#f59e0b" },
    { key: "alternatives" as const, name: t("allocAlternatives"), color: "#8b5cf6" },
  ];
  const glideLabels = { you: t("s4You"), retirement: t("s4Retirement"), age: t("s4AgeAxis") };

  const ALLOC_COLORS: Record<string, string> = {
    [t("allocStocks")]:       "#3b82f6",
    [t("allocBonds")]:        "#22c55e",
    [t("allocCash")]:         "#f59e0b",
    [t("allocAlternatives")]: "#8b5cf6",
  };

  // ── Step 5: Build recommendations ───────────────────────────────────────
  const recommendations: { icon: string; title: string; body: string; color: "green" | "amber" | "red" }[] = [];

  // 1. Savings rate
  if (savingsRate < 10) {
    recommendations.push({
      icon: "💸",
      title: t("s5TitleSavingsLow"),
      body: t("s5RecSavingsLow", { rate: savingsRate.toFixed(1) }),
      color: "red",
    });
  } else if (savingsRate < 20) {
    recommendations.push({
      icon: "💰",
      title: t("s5TitleSavingsOk"),
      body: t("s5RecSavingsOk", { rate: savingsRate.toFixed(1) }),
      color: "amber",
    });
  } else {
    recommendations.push({
      icon: "🏆",
      title: t("s5TitleSavingsGood"),
      body: t("s5RecSavingsGood", { rate: savingsRate.toFixed(1) }),
      color: "green",
    });
  }

  // 2. Emergency fund (always shown)
  recommendations.push({
    icon: "🛡️",
    title: t("s5TitleEmergency"),
    body: t("s5RecEmergencyFund", { currency: currency, amount: fmt(totalExpenses * 3) }),
    color: "amber",
  });

  // 3. High-rate debt
  if (highestRateDebt && (highestRateDebt.key === "credit_card" || highestRateDebt.key === "personal") && debts[highestRateDebt.key] > 0) {
    recommendations.push({
      icon: "🔥",
      title: t("s5TitleHighDebt"),
      body: t("s5RecHighDebt", { rate: String(highestRateDebt.rate) }),
      color: "red",
    });
  }

  // 4. Debt-to-income ratio
  const annualIncome = income * 12;
  if (annualIncome > 0) {
    const dtiRatio = totalDebt / annualIncome;
    if (dtiRatio > 3) {
      recommendations.push({
        icon: "⚠️",
        title: t("s5TitleDebtRatio"),
        body: t("s5RecDebtHigh", { x: dtiRatio.toFixed(1) }),
        color: "amber",
      });
    } else if (dtiRatio <= 1) {
      recommendations.push({
        icon: "✅",
        title: t("s5TitleDebtRatio"),
        body: t("s5RecDebtLow"),
        color: "green",
      });
    }
  }

  // 5. Compound growth
  recommendations.push({
    icon: "📈",
    title: t("s5TitleCompound"),
    body: t("s5RecCompound", { currency: currency, monthly: fmt(monthlyContrib), rate: String(annualRate), years: String(years), final: fmt(finalValue) }),
    color: "green",
  });

  // 6. Asset allocation tip
  const allocTipKey = risk === "aggressive"
    ? "s5RecAllocAggressive"
    : risk === "conservative"
    ? "s5RecAllocConservative"
    : "s5RecAllocModerate";
  recommendations.push({
    icon: "🎯",
    title: t("s5TitleAllocation"),
    body: t(allocTipKey as Parameters<typeof t>[0]),
    color: risk === "conservative" ? "amber" : "green",
  });

  async function handleExportPdf() {
    setPdfLoading(true);
    const { pdf } = await import("@react-pdf/renderer");
    const { PlannerPdf } = await import("./pdf");
    const images = reportCharts.current ? await chartImages(reportCharts.current).catch(() => []) : [];
    const chartTitles = [t("s1FlowTitle"), t("s2PayoffTitle"), t("s3ChartTitle", { years: String(years) }), t("s4GlideTitle")];
    const blob = await pdf(
      <PlannerPdf
        currency={currency}
        income={income}
        totalExpenses={totalExpenses}
        netSavings={netSavings}
        savingsRate={savingsRate}
        totalDebt={totalDebt}
        totalInterestCost={totalInterestCost}
        finalValue={finalValue}
        annualRate={annualRate}
        years={years}
        monthlyContrib={monthlyContrib}
        risk={risk}
        allocData={allocData}
        recommendations={recommendations}
        charts={images.map((src, i) => ({ src, title: chartTitles[i] ?? "" }))}
        chartsTitle={t("s5ChartsTitle")}
        date={new Date().toLocaleDateString("en-GB", { day: "numeric", month: "long", year: "numeric" })}
      />
    ).toBlob();
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = "financial-plan.pdf";
    a.click();
    URL.revokeObjectURL(url);
    setPdfLoading(false);
  }

  return (
    <main className="min-h-screen bg-[#0a0f1e] text-white">
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify({
          "@context": "https://schema.org",
          "@type": "SoftwareApplication",
          "name": "Personal Financial Planner",
          "description": "5-step personal financial plan covering income, debt, investments, goals, and personalised recommendations. Free, no signup.",
          "url": "https://www.financeplots.com/tools/financial-planner",
          "applicationCategory": "FinanceApplication",
          "operatingSystem": "Web",
          "offers": { "@type": "Offer", "price": "0", "priceCurrency": "GBP" },
          "provider": { "@type": "Organization", "name": "FinancePlots", "url": "https://www.financeplots.com" }
        })}}
      />
      {/* Fixed header with stepper */}
      <div className="fixed top-[65px] left-0 right-0 z-40 bg-[#0d1426]/95 backdrop-blur border-b border-gray-800 px-4 py-3">
        <div className="max-w-7xl mx-auto flex items-center justify-between gap-4">
          <div className="flex items-center gap-3 shrink-0">
            <Link href="/tools/personal" className="text-gray-400 hover:text-white text-sm transition">{tc("backPersonal")}</Link>
            <span className="text-gray-700 hidden md:block">|</span>
            <span className="text-white font-bold text-sm hidden md:block">{t("title")}</span>
          </div>
          {/* Step pills */}
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
                  <span className="hidden sm:block">{t(s.labelKey as TKey)}</span>
                </button>
                {i < STEPS.length - 1 && <span className="text-gray-700 text-xs">›</span>}
              </div>
            ))}
          </div>
        </div>
        {/* Progress bar */}
        <div className="max-w-7xl mx-auto mt-2">
          <div className="h-1 bg-gray-800 rounded-full overflow-hidden">
            <div
              className="h-full bg-blue-600 rounded-full transition-all duration-500"
              style={{ width: `${((step - 1) / (STEPS.length - 1)) * 100}%` }}
            />
          </div>
        </div>
      </div>

      <div className="pt-[140px] pb-20">
        <div className="max-w-7xl mx-auto px-4 sm:px-6">

          {/* ── STEP 1: Budget ─────────────────────────────────────────────── */}
          {step === 1 && (
            <div className="flex flex-col lg:flex-row gap-6">
              <aside className="lg:w-72 xl:w-80 shrink-0">
                <div className="lg:sticky lg:top-[140px] flex flex-col gap-4">
                  <div className="bg-[#0d1426] border border-gray-800 rounded-xl p-5">
                    <h3 className="text-xs font-bold uppercase tracking-wider text-blue-400 mb-3">{t("labelCurrency")}</h3>
                    <div className="flex gap-2 flex-wrap mb-4">
                      {CURRENCIES.map(c => (
                        <button
                          key={c}
                          onClick={() => setCurrency(c)}
                          className={`px-3 py-1.5 rounded-lg text-sm font-semibold transition ${currency === c ? "bg-blue-600 text-white" : "bg-[#111827] text-gray-400 border border-gray-700 hover:text-white"}`}
                        >
                          {c}
                        </button>
                      ))}
                    </div>
                    <h3 className="text-xs font-bold uppercase tracking-wider text-green-400 mb-3">{t("s1IncomeHeader")}</h3>
                    <NumInput label={t("s1TakeHome")} value={income} onChange={setIncome} step={200} prefix={currency} />
                  </div>
                  <div className="bg-[#0d1426] border border-gray-800 rounded-xl p-5">
                    <h3 className="text-xs font-bold uppercase tracking-wider text-red-400 mb-3">{t("s1ExpensesHeader")}</h3>
                    <div className="flex flex-col gap-2.5">
                      {EXPENSE_CATS.map(cat => (
                        <NumInput
                          key={cat.key}
                          label={t(cat.labelKey as TKey)}
                          value={expenses[cat.key]}
                          onChange={v => setExpenses(p => ({ ...p, [cat.key]: v }))}
                          step={50}
                          prefix={currency}
                        />
                      ))}
                    </div>
                  </div>
                </div>
              </aside>

              <div className="flex-1 min-w-0 flex flex-col gap-6">
                <div className="grid grid-cols-3 gap-3">
                  <KpiCard label={t("s1KpiIncome")} value={`${currency}${fmt(income)}`} sub={t("s1TakeHome")} colorClass="border-l-green-500" />
                  <KpiCard label={t("s1KpiExpenses")} value={`${currency}${fmt(totalExpenses)}`} sub={t("s1AllCategories")} colorClass="border-l-red-500" />
                  <KpiCard
                    label={t("s1KpiSavings")}
                    value={`${currency}${fmt(Math.abs(netSavings))}`}
                    sub={t("s1KpiSavingsRate", { x: savingsRate.toFixed(1) })}
                    colorClass={netSavings >= 0 ? "border-l-blue-500" : "border-l-red-500"}
                  />
                </div>

                <div className="bg-[#0d1426] border border-gray-800 rounded-xl p-6">
                  <h2 className="text-white font-bold mb-1">{t("s1FlowTitle")}</h2>
                  <p className="text-gray-500 text-xs mb-2">{t("s1FlowSub")}</p>
                  {income > 0 || totalExpenses > 0 ? (
                    <div className="overflow-x-auto"><div className="min-w-[560px]">
                      <BudgetFlow currency={currency} income={income} categories={flowCategories} labels={flowLabels} />
                    </div></div>
                  ) : (
                    <div className="h-[360px] flex items-center justify-center text-gray-500">{t("s1EmptyState")}</div>
                  )}
                </div>

                {netSavings < 0 && (
                  <div className="bg-red-900/20 border border-red-700/40 rounded-xl p-4 text-sm text-red-300">
                    ⚠️ {t("s1WarningOverspend", { amount: `${currency}${fmt(Math.abs(netSavings))}` })}
                  </div>
                )}
                {netSavings > 0 && savingsRate >= 20 && (
                  <div className="bg-green-900/20 border border-green-700/40 rounded-xl p-4 text-sm text-green-300">
                    ✅ {t("s1SuccessSavings", { x: savingsRate.toFixed(1) })}
                  </div>
                )}

                <div className="flex justify-end">
                  <button onClick={() => setStep(2)} className="bg-blue-600 hover:bg-blue-500 text-white font-bold px-8 py-3 rounded-xl transition">
                    {t("s1NextBtn")}
                  </button>
                </div>
              </div>
            </div>
          )}

          {/* ── STEP 2: Debt ───────────────────────────────────────────────── */}
          {step === 2 && (
            <div className="flex flex-col lg:flex-row gap-6">
              <aside className="lg:w-72 xl:w-80 shrink-0">
                <div className="lg:sticky lg:top-[140px] flex flex-col gap-4">
                  <div className="bg-[#0d1426] border border-gray-800 rounded-xl p-5">
                    <h3 className="text-xs font-bold uppercase tracking-wider text-red-400 mb-3">{t("s2BalancesHeader")}</h3>
                    <div className="flex flex-col gap-3">
                      {DEBT_ITEMS.map(d => (
                        <div key={d.key} className="flex flex-col gap-1">
                          <label className="text-xs text-gray-400">
                            {t(d.labelKey as TKey)}
                            <span className="text-gray-600 ml-1">({d.rate}% APR · {d.term}yr)</span>
                          </label>
                          <div className="flex items-center bg-[#111827] border border-gray-700 rounded-lg px-3 py-2 focus-within:border-blue-500 transition">
                            <span className="text-gray-500 text-sm mr-1.5 shrink-0">{currency}</span>
                            <input
                              type="number" min={0} step={1000}
                              value={debts[d.key] ?? 0}
                              onChange={e => setDebts(p => ({ ...p, [d.key]: parseFloat(e.target.value) || 0 }))}
                              className="bg-transparent text-white text-sm w-full outline-none"
                            />
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                </div>
              </aside>

              <div className="flex-1 min-w-0 flex flex-col gap-6">
                <div className="grid grid-cols-2 gap-3">
                  <KpiCard label={t("s2KpiDebt")} value={`${currency}${fmt(totalDebt)}`} sub={t("s2KpiDebtSub")} colorClass="border-l-red-500" />
                  <KpiCard label={t("s2KpiInterest")} value={`${currency}${fmt(totalInterestCost)}`} sub={t("s2KpiInterestSub")} colorClass="border-l-orange-500" />
                </div>

                <div className="bg-[#0d1426] border border-gray-800 rounded-xl p-6">
                  <h2 className="text-white font-bold mb-1">{t("s2PayoffTitle")}</h2>
                  <p className="text-gray-500 text-xs mb-4">{t("s2PayoffSub")}</p>
                  {debtSeries.length > 0 ? (
                    <DebtPayoff
                      currency={currency}
                      rows={schedule.rows}
                      debts={debtSeries}
                      debtFreeYears={schedule.debtFreeYears}
                      debtFreeLabel={t("s2DebtFreeIn", { years: String(schedule.debtFreeYears) })}
                      yearLabel={t("s3YearLabel")}
                    />
                  ) : (
                    <div className="h-[280px] flex items-center justify-center text-green-400 font-semibold">
                      {t("s2DebtFree")}
                    </div>
                  )}
                </div>

                {highestRateDebt && (
                  <div className="bg-amber-900/20 border border-amber-700/40 rounded-xl p-4 text-sm text-amber-300">
                    {t("s2AvalancheTip", { debt: t(highestRateDebt.labelKey as TKey), rate: String(highestRateDebt.rate) })}
                  </div>
                )}

                <div className="flex justify-between items-center">
                  <button onClick={() => setStep(1)} className="text-gray-400 hover:text-white text-sm transition">{t("btnBack")}</button>
                  <button onClick={() => setStep(3)} className="bg-blue-600 hover:bg-blue-500 text-white font-bold px-8 py-3 rounded-xl transition">
                    {t("s2NextBtn")}
                  </button>
                </div>
              </div>
            </div>
          )}

          {/* ── STEP 3: Compounding ─────────────────────────────────────────── */}
          {step === 3 && (
            <div className="flex flex-col lg:flex-row gap-6">
              <aside className="lg:w-72 xl:w-80 shrink-0">
                <div className="lg:sticky lg:top-[140px] flex flex-col gap-4">
                  <div className="bg-[#0d1426] border border-gray-800 rounded-xl p-5">
                    <h3 className="text-xs font-bold uppercase tracking-wider text-blue-400 mb-3">{t("s3SavingsHeader")}</h3>
                    <div className="bg-[#111827] border border-gray-700 rounded-lg p-3 mb-3">
                      <div className="text-xs text-gray-400 mb-1">{t("s3MonthlySavingsLabel")}</div>
                      <div className={`text-2xl font-extrabold ${netSavings >= 0 ? "text-green-400" : "text-red-400"}`}>
                        {currency}{fmt(Math.max(0, netSavings))}<span className="text-sm font-normal text-gray-400">/mo</span>
                      </div>
                    </div>
                    <div className="flex flex-col gap-1">
                      <label className="text-xs text-gray-400">{t("s3HorizonLabel")}</label>
                      <div className="flex items-center gap-3">
                        <input
                          type="range" min={1} max={40} value={years}
                          onChange={e => setYears(parseInt(e.target.value))}
                          className="w-full accent-blue-500"
                        />
                        <span className="text-white font-bold text-sm shrink-0 w-12">{years}yr</span>
                      </div>
                    </div>
                  </div>
                  <div className="bg-[#0d1426] border border-gray-800 rounded-xl p-5">
                    <h3 className="text-xs font-bold uppercase tracking-wider text-blue-400 mb-3">{t("s3ReturnHeader")}</h3>
                    <div className="grid grid-cols-2 gap-2 mb-3">
                      {RATE_PRESETS.map((p, i) => (
                        <button
                          key={i}
                          onClick={() => setRatePreset(i)}
                          className={`py-2 px-3 rounded-lg text-xs font-semibold transition ${ratePreset === i ? "bg-blue-600 text-white" : "bg-[#111827] text-gray-400 border border-gray-700 hover:text-white"}`}
                        >
                          {"labelKey" in p ? t(p.labelKey as TKey) : p.label}{p.rate !== null ? ` ${p.rate}%` : ""}
                        </button>
                      ))}
                    </div>
                    {RATE_PRESETS[ratePreset].rate === null && (
                      <NumInput label={t("s3CustomRate")} value={customRate} onChange={setCustomRate} prefix="%" step={0.5} />
                    )}
                    <div className="mt-3 bg-[#111827] rounded-lg p-3 text-xs text-gray-500">
                      <div>🇺🇸 S&P 500 (1928–2024): ~10%/yr</div>
                      <div>🌍 MSCI World: ~8%/yr</div>
                      <div className="text-gray-600 mt-1">Past performance ≠ future results</div>
                    </div>
                  </div>
                </div>
              </aside>

              <div className="flex-1 min-w-0 flex flex-col gap-6">
                <div className="grid grid-cols-3 gap-3">
                  <KpiCard label={t("s3KpiContrib")} value={`${currency}${fmt(monthlyContrib)}`} sub={t("s3KpiContribSub")} colorClass="border-l-blue-500" />
                  <KpiCard
                    label={t("s3KpiValue", { years: String(years) })}
                    value={`${currency}${fmt(finalValue)}`}
                    sub={t("s3KpiValueSub", { rate: String(annualRate) })}
                    colorClass="border-l-green-500"
                  />
                  <KpiCard
                    label={t("s3KpiInterest")}
                    value={`${currency}${fmt(finalInterest)}`}
                    sub={t("s3KpiInterestSub", { pct: finalValue > 0 ? ((finalInterest / finalValue) * 100).toFixed(0) : "0" })}
                    colorClass="border-l-yellow-400"
                  />
                </div>

                <div className="bg-[#0d1426] border border-gray-800 rounded-xl p-6">
                  <h2 className="text-white font-bold mb-1">{t("s3ChartTitle", { years: String(years) })}</h2>
                  <p className="text-gray-500 text-xs mb-4">
                    {t("s3ChartSub", { amount: `${currency}${fmt(monthlyContrib)}`, rate: String(annualRate) })}
                  </p>
                  <GrowthChart currency={currency} rows={growth.rows} crossover={growth.crossover} labels={growthLabels} />
                  <p className="text-gray-600 text-xs mt-2">{t("s3ScenarioNote")}</p>
                </div>

                <div className="flex justify-between items-center">
                  <button onClick={() => setStep(2)} className="text-gray-400 hover:text-white text-sm transition">{t("btnBack")}</button>
                  <button onClick={() => setStep(4)} className="bg-blue-600 hover:bg-blue-500 text-white font-bold px-8 py-3 rounded-xl transition">
                    {t("s3NextBtn")}
                  </button>
                </div>
              </div>
            </div>
          )}

          {/* ── STEP 4: Allocation ─────────────────────────────────────────── */}
          {step === 4 && (
            <div className="flex flex-col lg:flex-row gap-6">
              <aside className="lg:w-72 xl:w-80 shrink-0">
                <div className="lg:sticky lg:top-[140px] flex flex-col gap-4">
                  <div className="bg-[#0d1426] border border-gray-800 rounded-xl p-5">
                    <h3 className="text-xs font-bold uppercase tracking-wider text-blue-400 mb-3">{t("s4ProfileHeader")}</h3>
                    <div className="flex flex-col gap-4">
                      <NumInput label={t("s4AgeLabel")} value={age} onChange={setAge} prefix="" step={1} />
                      <div className="flex flex-col gap-1">
                        <label className="text-xs text-gray-400">{t("s4RiskLabel")}</label>
                        <div className="flex flex-col gap-2">
                          {(Object.entries(RISK_PROFILES) as [RiskKey, typeof RISK_PROFILES[RiskKey]][]).map(([key, p]) => (
                            <button
                              key={key}
                              onClick={() => setRisk(key)}
                              className={`flex items-center justify-between px-4 py-3 rounded-xl text-sm font-semibold transition border ${risk === key ? "bg-blue-600/20 border-blue-500 text-white" : "bg-[#111827] border-gray-700 text-gray-400 hover:text-white"}`}
                            >
                              <span>{t(p.labelKey as TKey)}</span>
                              <span className="text-xs text-gray-400">{p.stocks}{t("s4StocksPct")}</span>
                            </button>
                          ))}
                        </div>
                      </div>
                    </div>
                  </div>
                  <div className="bg-[#0d1426] border border-gray-800 rounded-xl p-5">
                    <h3 className="text-xs font-bold uppercase tracking-wider text-blue-400 mb-3">{t("s4ExploreHeader")}</h3>
                    <p className="text-xs text-gray-500 mb-3">{t("s4ExploreDesc")}</p>
                    <div className="flex flex-col gap-2">
                      {[
                        { label: t("s4LinkPortfolio"), href: "/tools/portfolio-analysis" },
                        { label: t("s4LinkStockComp"), href: "/tools/stock-comparison"   },
                        { label: t("s4LinkStockAnal"), href: "/tools/stock-analysis"     },
                      ].map(tool => (
                        <Link
                          key={tool.href}
                          href={tool.href}
                          target="_blank"
                          className="block bg-[#111827] border border-gray-700 hover:border-blue-500 text-gray-300 hover:text-white text-sm px-4 py-2.5 rounded-lg transition"
                        >
                          {tool.label}
                        </Link>
                      ))}
                    </div>
                  </div>
                </div>
              </aside>

              <div className="flex-1 min-w-0 flex flex-col gap-6">
                {/* Allocation KPIs */}
                <div className="grid grid-cols-4 gap-3">
                  {allocData.map(a => (
                    <div key={a.name} className="bg-[#0d1426] border border-gray-800 rounded-xl p-4" style={{ borderLeftColor: ALLOC_COLORS[a.name], borderLeftWidth: 4 }}>
                      <div className="text-xs text-gray-400 uppercase tracking-wider mb-1">{a.name}</div>
                      <div className="text-2xl font-extrabold text-white">{a.value}%</div>
                    </div>
                  ))}
                </div>

                {/* Model mix from today to retirement */}
                <div className="bg-[#0d1426] border border-gray-800 rounded-xl p-6">
                  <h2 className="text-white font-bold mb-1">{t("s4GlideTitle")}</h2>
                  <p className="text-gray-500 text-xs mb-4">
                    {t("s4AllocSub", { profile: t(profile.labelKey as TKey), age: String(age) })}
                  </p>
                  <GlidePathChart rows={glide} age={age} retirementAge={RETIREMENT_AGE} series={glideSeries} labels={glideLabels} />
                  <p className="text-amber-300/80 text-xs mt-3 bg-amber-900/10 border border-amber-700/30 rounded-lg px-3 py-2">{t("s4ModelNote")}</p>
                </div>

                {/* Final journey summary */}
                <div className="bg-gradient-to-br from-blue-900/30 via-purple-900/20 to-[#0d1426] border border-blue-700/30 rounded-2xl p-6">
                  <h2 className="text-white font-bold text-lg mb-5">{t("s4SummaryTitle")}</h2>
                  <div className="grid grid-cols-2 sm:grid-cols-4 gap-5">
                    {[
                      {
                        icon: "💰",
                        label: t("s4SumSurplus"),
                        value: `${currency}${fmt(Math.max(0, netSavings))}`,
                        sub: t("s4SumSavingsRate", { x: savingsRate.toFixed(1) }),
                        color: netSavings >= 0 ? "text-green-400" : "text-red-400",
                      },
                      {
                        icon: "💳",
                        label: t("s4SumDebt"),
                        value: `${currency}${fmt(totalDebt)}`,
                        sub: t("s4SumEstInterest", { amount: `${currency}${fmt(totalInterestCost)}` }),
                        color: "text-red-400",
                      },
                      {
                        icon: "📈",
                        label: t("s4SumWealth", { years: String(years) }),
                        value: `${currency}${fmt(finalValue)}`,
                        sub: t("s4SumAtRate", { rate: String(annualRate) }),
                        color: "text-blue-300",
                      },
                      {
                        icon: "🎯",
                        label: t("s4SumAlloc"),
                        value: `${allocData[0].value}${t("s4StocksPct")}`,
                        sub: t("s4SumProfile", { profile: t(profile.labelKey as TKey) }),
                        color: "text-white",
                      },
                    ].map(card => (
                      <div key={card.label} className="text-center">
                        <div className="text-2xl mb-1">{card.icon}</div>
                        <div className="text-xs text-gray-400 mb-1">{card.label}</div>
                        <div className={`text-lg font-bold ${card.color}`}>{card.value}</div>
                        <div className="text-xs text-gray-500 mt-0.5">{card.sub}</div>
                      </div>
                    ))}
                  </div>
                </div>

                <div className="flex justify-between items-center">
                  <button onClick={() => setStep(3)} className="text-gray-400 hover:text-white text-sm transition">{t("btnBack")}</button>
                  <button onClick={() => setStep(5)} className="bg-blue-600 hover:bg-blue-500 text-white font-bold px-8 py-3 rounded-xl transition">
                    {t("step5Label")} →
                  </button>
                </div>
              </div>
            </div>
          )}

          {/* ── STEP 5: Financial Report ───────────────────────────────────── */}
          {step === 5 && (
            <div className="max-w-4xl mx-auto flex flex-col gap-8">
              <div className="text-center">
                <h1 className="text-3xl font-extrabold text-white mb-2">{t("s5Title")}</h1>
                <p className="text-gray-400 text-sm">{t("step5Desc")}</p>
              </div>

              {/* Investment horizon slider */}
              <div className="bg-[#0d1426] border border-gray-800 rounded-xl px-6 py-4 flex items-center gap-4">
                <span className="text-xs text-gray-400 shrink-0">{t("s3YearsLabel")}</span>
                <input
                  type="range" min={1} max={40} value={years}
                  onChange={e => setYears(parseInt(e.target.value))}
                  className="flex-1 accent-blue-500"
                />
                <span className="text-white font-bold text-sm shrink-0 w-12">{years}yr</span>
              </div>

              {/* A — Financial Snapshot */}
              <div>
                <h2 className="text-xs font-bold uppercase tracking-wider text-blue-400 mb-4">{t("s5SnapshotTitle")}</h2>
                <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
                  <KpiCard
                    label={t("s4SumSurplus")}
                    value={`${currency}${fmt(Math.max(0, netSavings))}`}
                    sub={t("s4SumSavingsRate", { x: savingsRate.toFixed(1) })}
                    colorClass={netSavings >= 0 ? "border-l-green-500" : "border-l-red-500"}
                  />
                  <KpiCard
                    label={t("s5KpiSavingsRate")}
                    value={`${savingsRate.toFixed(1)}%`}
                    sub={savingsRate >= 20 ? t("s5RatingExcellent") : savingsRate >= 10 ? t("s5RatingGood") : t("s5RatingBelowTarget")}
                    colorClass={savingsRate >= 20 ? "border-l-green-500" : savingsRate >= 10 ? "border-l-yellow-400" : "border-l-red-500"}
                  />
                  <KpiCard
                    label={t("s4SumDebt")}
                    value={`${currency}${fmt(totalDebt)}`}
                    sub={t("s4SumEstInterest", { amount: `${currency}${fmt(totalInterestCost)}` })}
                    colorClass="border-l-red-500"
                  />
                  <KpiCard
                    label={t("s5KpiEstInterest")}
                    value={`${currency}${fmt(totalInterestCost)}`}
                    sub={t("s5KpiDebtSub")}
                    colorClass="border-l-orange-500"
                  />
                  <KpiCard
                    label={t("s4SumWealth", { years: String(years) })}
                    value={`${currency}${fmt(finalValue)}`}
                    sub={t("s5KpiAtRate", { rate: String(annualRate) })}
                    colorClass="border-l-blue-500"
                  />
                  <KpiCard
                    label={t("s5KpiAllocProfile")}
                    value={risk.charAt(0).toUpperCase() + risk.slice(1)}
                    sub={t("s5KpiStocksPct", { pct: String(allocData[0].value) })}
                    colorClass="border-l-purple-500"
                  />
                </div>
              </div>

              {/* A2 — The plan in charts (also copied into the PDF) */}
              <div>
                <h2 className="text-xs font-bold uppercase tracking-wider text-blue-400 mb-4">{t("s5ChartsTitle")}</h2>
                <div ref={reportCharts} className="grid grid-cols-1 md:grid-cols-2 gap-3">
                  <div className="bg-[#0d1426] border border-gray-800 rounded-xl p-4 min-w-0">
                    <p className="text-white text-sm font-semibold mb-1">{t("s1FlowTitle")}</p>
                    <div className="overflow-x-auto"><div className="min-w-[440px]">
                      <BudgetFlow currency={currency} income={income} categories={flowCategories} labels={flowLabels} height={250} />
                    </div></div>
                  </div>
                  <div className="bg-[#0d1426] border border-gray-800 rounded-xl p-4 min-w-0">
                    <p className="text-white text-sm font-semibold mb-1">{t("s2PayoffTitle")}</p>
                    {debtSeries.length > 0 ? (
                      <DebtPayoff currency={currency} rows={schedule.rows} debts={debtSeries} debtFreeYears={schedule.debtFreeYears}
                        debtFreeLabel={t("s2DebtFreeIn", { years: String(schedule.debtFreeYears) })} yearLabel={t("s3YearLabel")} height={250} compact />
                    ) : (
                      <div className="h-[250px] flex items-center justify-center text-green-400 font-semibold text-sm">{t("s2DebtFree")}</div>
                    )}
                  </div>
                  <div className="bg-[#0d1426] border border-gray-800 rounded-xl p-4 min-w-0">
                    <p className="text-white text-sm font-semibold mb-1">{t("s3ChartTitle", { years: String(years) })}</p>
                    <GrowthChart currency={currency} rows={growth.rows} crossover={growth.crossover} labels={growthLabels} height={250} compact />
                  </div>
                  <div className="bg-[#0d1426] border border-gray-800 rounded-xl p-4 min-w-0">
                    <p className="text-white text-sm font-semibold mb-1">{t("s4GlideTitle")}</p>
                    <GlidePathChart rows={glide} age={age} retirementAge={RETIREMENT_AGE} series={glideSeries} labels={glideLabels} height={250} compact />
                  </div>
                </div>
              </div>

              {/* B — Personalised Recommendations */}
              <div>
                <h2 className="text-xs font-bold uppercase tracking-wider text-blue-400 mb-4">{t("s5RecommTitle")}</h2>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  {recommendations.map((rec, i) => {
                    const borderColor =
                      rec.color === "green" ? "border-l-green-500" :
                      rec.color === "red"   ? "border-l-red-500"   :
                                             "border-l-amber-400";
                    const badgeBg =
                      rec.color === "green" ? "bg-green-900/30 text-green-400" :
                      rec.color === "red"   ? "bg-red-900/30 text-red-400"     :
                                             "bg-amber-900/30 text-amber-400";
                    return (
                      <div key={i} className={`bg-[#0d1426] border border-gray-800 border-l-4 ${borderColor} rounded-xl p-4`}>
                        <div className="flex items-center gap-2 mb-2">
                          <span className="text-xl">{rec.icon}</span>
                          <span className="font-semibold text-white text-sm">{rec.title}</span>
                          <span className={`ml-auto text-xs font-semibold px-2 py-0.5 rounded-full ${badgeBg}`}>
                            {rec.color === "green" ? "Good" : rec.color === "red" ? "Action needed" : "Review"}
                          </span>
                        </div>
                        <p className="text-gray-400 text-xs leading-relaxed">{rec.body}</p>
                      </div>
                    );
                  })}
                </div>
              </div>

              {/* C — Best Practices Checklist */}
              <div>
                <h2 className="text-xs font-bold uppercase tracking-wider text-blue-400 mb-4">{t("s5BestPracticesTitle")}</h2>
                <div className="bg-[#0d1426] border border-gray-800 rounded-xl p-5">
                  <ul className="flex flex-col gap-2.5">
                    {(t.raw("s5BestPractices") as string[]).map((item, i) => (
                      <li key={i} className="flex items-start gap-3 text-sm text-gray-300">
                        <span className="text-green-400 mt-0.5 shrink-0">✅</span>
                        <span>{item}</span>
                      </li>
                    ))}
                  </ul>
                </div>
              </div>

              {/* D — PDF Export */}
              <div className="flex justify-center">
                <button
                  onClick={handleExportPdf}
                  disabled={pdfLoading}
                  className="bg-blue-600 hover:bg-blue-500 disabled:opacity-60 text-white font-bold px-10 py-4 rounded-xl text-base transition flex items-center gap-2"
                >
                  {pdfLoading ? t("s5Generating") : t("s5ExportPdf")}
                </button>
              </div>

              {/* E — Navigation */}
              <div className="flex justify-between items-center">
                <button onClick={() => setStep(4)} className="text-gray-400 hover:text-white text-sm transition">{t("btnBack")}</button>
                <button
                  onClick={() => setStep(1)}
                  className="text-blue-400 hover:text-blue-300 text-sm font-semibold transition border border-blue-800 px-4 py-2 rounded-lg"
                >
                  ↺ {t("s5StartOver")}
                </button>
              </div>
            </div>
          )}

        </div>
      </div>
            <RelatedTools current="financial-planner" />
      <p className="text-center text-xs text-gray-600 pb-8 px-4">{tc("disclaimer")}</p>
    </main>
  );
}
