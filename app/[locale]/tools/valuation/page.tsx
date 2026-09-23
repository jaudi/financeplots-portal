"use client";

import { useState, useMemo, useCallback } from "react";
import Link from "next/link";
import { useTranslations } from "next-intl";
import RelatedTools from "@/components/RelatedTools";
import { INDUSTRIES, valuation, type Industry } from "@/lib/calculators";
import {
  BarChart, Bar, Cell, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer,
  LineChart, Line,
} from "recharts";

const fmt  = (n: number) => n.toLocaleString("en-GB", { maximumFractionDigits: 0 });
const fmtM = (n: number) => n.toLocaleString("en-GB", { minimumFractionDigits: 1, maximumFractionDigits: 1 });
const fmtX = (n: number) => n.toLocaleString("en-GB", { minimumFractionDigits: 1, maximumFractionDigits: 1 });

// ── Sub-components ────────────────────────────────────────────────────────────

function KpiCard({ label, value, sub, color = "blue" }: {
  label: string; value: string; sub: string; color?: "blue" | "green" | "gold" | "purple";
}) {
  const border =
    color === "green"  ? "border-l-green-500" :
    color === "gold"   ? "border-l-yellow-400" :
    color === "purple" ? "border-l-purple-500" :
    "border-l-blue-500";
  return (
    <div className={`bg-[#0d1426] border border-gray-800 border-l-4 ${border} rounded-xl p-4`}>
      <div className="text-xs text-gray-400 uppercase tracking-wider font-semibold mb-1">{label}</div>
      <div className="text-xl font-extrabold text-white leading-tight">{value}</div>
      <div className="text-xs text-gray-500 mt-1">{sub}</div>
    </div>
  );
}

function NumInput({ label, value, onChange, prefix = "£", step = 1000, min = 0 }: {
  label: string; value: number; onChange: (v: number) => void; prefix?: string; step?: number; min?: number;
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

function BenchmarkRow({ label, industryVal, userVal }: { label: string; industryVal: number; userVal: number }) {
  const pct = industryVal > 0 ? ((userVal - industryVal) / industryVal) * 100 : 0;
  const colour = Math.abs(pct) < 15 ? "text-green-400" : pct > 0 ? "text-blue-400" : "text-orange-400";
  const sign   = pct >= 0 ? "+" : "";
  return (
    <div className="flex items-center justify-between py-1.5 border-b border-gray-800/60 last:border-0">
      <span className="text-xs text-gray-400">{label}</span>
      <div className="flex items-center gap-3 text-xs">
        <span className="text-gray-500">Sector: {fmtX(industryVal)}×</span>
        <span className="text-white font-semibold">You: {fmtX(userVal)}×</span>
        <span className={`font-bold ${colour}`}>{sign}{fmtM(pct)}%</span>
      </div>
    </div>
  );
}

// ── Main component ────────────────────────────────────────────────────────────

export default function ValuationPage() {
  const t  = useTranslations("valuation");
  const tc = useTranslations("toolCommon");

  const [companyName,    setCompanyName]    = useState("My Company");
  const [industryId,     setIndustryId]     = useState("");
  const [revenue,        setRevenue]        = useState(5_000_000);
  const [ebitda,         setEbitda]         = useState(1_000_000);
  const [netIncome,      setNetIncome]      = useState(700_000);
  const [fcf,            setFcf]            = useState(800_000);
  const [netDebt,        setNetDebt]        = useState(0);
  const [growthRate,     setGrowthRate]     = useState(10);
  const [discountRate,   setDiscountRate]   = useState(12);
  const [terminalGrowth, setTerminalGrowth] = useState(2.5);
  const [ebitdaMultiple, setEbitdaMultiple] = useState(8);
  const [evSalesMultiple,setEvSalesMultiple]= useState(2.0);
  const [peRatio,        setPeRatio]        = useState(15);
  const [isExporting,    setIsExporting]    = useState(false);

  const selectedIndustry = INDUSTRIES.find(i => i.id === industryId) ?? null;

  // Apply industry multiples
  const applyIndustry = useCallback((ind: Industry) => {
    setIndustryId(ind.id);
    setEbitdaMultiple(parseFloat(ind.ebitda.toFixed(1)));
    setEvSalesMultiple(parseFloat(ind.evSales.toFixed(1)));
    setPeRatio(parseFloat(ind.pe.toFixed(1)));
  }, []);

  // Every figure on the page is an equity value (what the shares are worth);
  // the enterprise-value average is shown alongside for reference.
  const { dcfRows, dcfValue, epsValue, evValue, evSalesValue, avgValuation, enterpriseAvg } = useMemo(() => {
    const { dcfRows, equity, enterprise } = valuation({
      revenue, ebitda, netIncome, fcf,
      growthRatePct: growthRate, discountRatePct: discountRate, terminalGrowthPct: terminalGrowth,
      ebitdaMultiple, evSalesMultiple, peRatio, netDebt,
    });
    return {
      dcfRows,
      dcfValue: equity.dcf,
      epsValue: equity.pe,
      evValue: equity.evEbitda,
      evSalesValue: equity.evSales,
      avgValuation: equity.average,
      enterpriseAvg: enterprise.average,
    };
  }, [fcf, growthRate, discountRate, terminalGrowth, netIncome, peRatio, ebitda, ebitdaMultiple, revenue, evSalesMultiple, netDebt]);

  const ebitdaMargin = revenue > 0 ? (ebitda   / revenue) * 100 : 0;
  const netMargin    = revenue > 0 ? (netIncome / revenue) * 100 : 0;
  const fcfMargin    = revenue > 0 ? (fcf       / revenue) * 100 : 0;

  const barData = [
    { name: "DCF",       value: dcfValue,     fill: "#3b82f6" },
    { name: "EV/EBITDA", value: evValue,      fill: "#8b5cf6" },
    { name: "EV/Revenue",value: evSalesValue, fill: "#ec4899" },
    { name: "P/E",       value: epsValue,     fill: "#22c55e" },
    { name: "Average",   value: avgValuation, fill: "#f59e0b" },
  ];

  const dcfChartData = dcfRows.map(r => ({
    year: `Y${r.year}`,
    "Free Cash Flow": r.fcf,
    "Discounted FCF": r.discountedFCF,
  }));

  const handleExportPdf = useCallback(async () => {
    setIsExporting(true);
    try {
      const { pdf } = await import("@react-pdf/renderer");
      const { default: ValuationPDF } = await import("./pdf");
      const blob = await pdf(
        <ValuationPDF
          companyName={companyName}
          revenue={revenue}
          ebitda={ebitda}
          netIncome={netIncome}
          fcf={fcf}
          growthRate={growthRate}
          discountRate={discountRate}
          terminalGrowth={terminalGrowth}
          ebitdaMultiple={ebitdaMultiple}
          peRatio={peRatio}
          dcfValue={dcfValue}
          epsValue={epsValue}
          evValue={evValue}
          avgValuation={avgValuation}
          netDebt={netDebt}
          enterpriseAvg={enterpriseAvg}
          dcfRows={dcfRows}
        />
      ).toBlob();
      const url = URL.createObjectURL(blob);
      const a   = document.createElement("a");
      a.href = url;
      a.download = "business-valuation.pdf";
      a.click();
      URL.revokeObjectURL(url);
    } finally {
      setIsExporting(false);
    }
  }, [companyName, revenue, ebitda, netIncome, fcf, growthRate, discountRate, terminalGrowth, ebitdaMultiple, peRatio, dcfValue, epsValue, evValue, avgValuation, netDebt, enterpriseAvg, dcfRows]);

  return (
    <main className="min-h-screen bg-[#0a0f1e] text-white">
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify({
          "@context": "https://schema.org",
          "@type": "SoftwareApplication",
          "name": "Business Valuation Calculator",
          "description": "Estimate your business value using DCF, EV/EBITDA, EV/Revenue, and P/E multiples benchmarked against Damodaran industry data. Free, instant PDF export.",
          "url": "https://www.financeplots.com/tools/valuation",
          "applicationCategory": "FinanceApplication",
          "operatingSystem": "Web",
          "offers": { "@type": "Offer", "price": "0", "priceCurrency": "GBP" },
          "provider": { "@type": "Organization", "name": "FinancePlots", "url": "https://www.financeplots.com" },
        })}}
      />

      {/* Top bar */}
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

            {/* ── Sidebar ── */}
            <aside className="lg:w-72 xl:w-80 shrink-0">
              <div className="lg:sticky lg:top-[133px] flex flex-col gap-4">

                {/* Company */}
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

                {/* Industry selector */}
                <div className="bg-[#0d1426] border border-gray-800 rounded-xl p-5">
                  <h3 className="text-xs font-bold uppercase tracking-wider text-blue-400 mb-1">Industry Benchmarks</h3>
                  <p className="text-xs text-gray-500 mb-3">Select your sector to auto-fill Damodaran multiples</p>
                  <select
                    value={industryId}
                    onChange={e => {
                      const ind = INDUSTRIES.find(i => i.id === e.target.value);
                      if (ind) applyIndustry(ind);
                      else setIndustryId("");
                    }}
                    className="w-full bg-[#111827] border border-gray-700 focus:border-blue-500 text-white text-sm rounded-lg px-3 py-2 outline-none transition"
                  >
                    <option value="">— Select industry —</option>
                    {INDUSTRIES.map(ind => (
                      <option key={ind.id} value={ind.id}>{ind.label}</option>
                    ))}
                  </select>

                  {selectedIndustry && (
                    <div className="mt-3 space-y-1">
                      <BenchmarkRow label="EV/EBITDA" industryVal={selectedIndustry.ebitda} userVal={ebitdaMultiple} />
                      <BenchmarkRow label="EV/Revenue" industryVal={selectedIndustry.evSales} userVal={evSalesMultiple} />
                      <BenchmarkRow label="P/E (Fwd)" industryVal={selectedIndustry.pe} userVal={peRatio} />
                    </div>
                  )}

                  <p className="text-xs text-gray-600 mt-3">
                    Source: <a href="https://pages.stern.nyu.edu/~adamodar/" target="_blank" rel="noopener noreferrer" className="text-blue-600 hover:text-blue-400 transition">Damodaran NYU</a>, Jan 2026
                  </p>
                </div>

                {/* Financials */}
                <div className="bg-[#0d1426] border border-gray-800 rounded-xl p-5">
                  <h3 className="text-xs font-bold uppercase tracking-wider text-blue-400 mb-3">{t("sectionFinancials")}</h3>
                  <div className="flex flex-col gap-3">
                    <NumInput label={t("labelRevenue")}   value={revenue}    onChange={setRevenue}    step={100_000} />
                    <NumInput label={t("labelEBITDA")}    value={ebitda}     onChange={setEbitda}     step={50_000}  />
                    <NumInput label={t("labelNetIncome")} value={netIncome}  onChange={setNetIncome}  step={50_000}  />
                    <NumInput label={t("labelFCF")}       value={fcf}        onChange={setFcf}        step={50_000}  />
                    <NumInput label="Net Debt (debt − cash)" value={netDebt} onChange={setNetDebt} step={50_000} min={-1e15} />
                    <p className="text-xs text-gray-500 -mt-1">Negative if the company holds more cash than debt.</p>
                  </div>
                  <div className="mt-3 pt-3 border-t border-gray-800 space-y-1 text-xs text-gray-400">
                    <div className="flex justify-between"><span>EBITDA Margin</span><span className="text-white font-semibold">{fmtM(ebitdaMargin)}%</span></div>
                    <div className="flex justify-between"><span>Net Margin</span>   <span className="text-white font-semibold">{fmtM(netMargin)}%</span></div>
                    <div className="flex justify-between"><span>FCF Margin</span>   <span className="text-white font-semibold">{fmtM(fcfMargin)}%</span></div>
                  </div>
                </div>

                {/* DCF assumptions */}
                <div className="bg-[#0d1426] border border-gray-800 rounded-xl p-5">
                  <h3 className="text-xs font-bold uppercase tracking-wider text-blue-400 mb-3">{t("sectionDCF")}</h3>
                  <div className="flex flex-col gap-3">
                    <NumInput label="Revenue Growth Rate %" value={growthRate}     onChange={setGrowthRate}     prefix="%" step={0.5} />
                    <NumInput label="Discount Rate / WACC %" value={discountRate}  onChange={setDiscountRate}   prefix="%" step={0.5} />
                    <NumInput label="Terminal Growth Rate %"  value={terminalGrowth} onChange={setTerminalGrowth} prefix="%" step={0.1} />
                  </div>
                </div>

                {/* Multiples */}
                <div className="bg-[#0d1426] border border-gray-800 rounded-xl p-5">
                  <h3 className="text-xs font-bold uppercase tracking-wider text-blue-400 mb-3">{t("sectionMultiples")}</h3>
                  <div className="flex flex-col gap-3">
                    <NumInput label="EV/EBITDA Multiple" value={ebitdaMultiple}  onChange={setEbitdaMultiple}  prefix="×" step={0.5} />
                    <NumInput label="EV/Revenue Multiple" value={evSalesMultiple} onChange={setEvSalesMultiple} prefix="×" step={0.1} />
                    <NumInput label="P/E Ratio"           value={peRatio}         onChange={setPeRatio}         prefix="×" step={0.5} />
                  </div>
                  {!selectedIndustry && (
                    <div className="mt-3 bg-[#111827] rounded-lg p-3 text-xs text-gray-500">
                      Select an industry above to auto-fill sector benchmarks.
                    </div>
                  )}
                </div>

              </div>
            </aside>

            {/* ── Main Content ── */}
            <div className="flex-1 min-w-0 flex flex-col gap-6">

              {/* KPI Cards — 4 methods + average */}
              <div className="grid grid-cols-2 xl:grid-cols-5 gap-3">
                <KpiCard
                  label="Average Valuation"
                  value={`£${fmt(avgValuation)}`}
                  sub="4-method average"
                  color="gold"
                />
                <KpiCard label="DCF"        value={`£${fmt(dcfValue)}`}     sub={`${discountRate}% WACC`}       color="blue"   />
                <KpiCard label="EV/EBITDA"  value={`£${fmt(evValue)}`}      sub={`${fmtX(ebitdaMultiple)}×`}   color="purple" />
                <KpiCard label="EV/Revenue" value={`£${fmt(evSalesValue)}`} sub={`${fmtX(evSalesMultiple)}×`}  color="blue"   />
                <KpiCard label="P/E"        value={`£${fmt(epsValue)}`}     sub={`${fmtX(peRatio)}× earnings`} color="green"  />
              </div>
              <p className="text-xs text-gray-500 -mt-3">
                All figures are equity value — what the shares are worth. Including debt, the business
                (enterprise value) averages £{fmt(enterpriseAvg)}; net debt £{fmt(netDebt)}.
              </p>

              {/* Valuation comparison chart */}
              <div className="bg-[#0d1426] border border-gray-800 rounded-xl p-6">
                <h2 className="text-white font-bold mb-5">{t("chartValuation")}</h2>
                <ResponsiveContainer width="100%" height={280}>
                  <BarChart data={barData} margin={{ top: 10, right: 20, bottom: 0, left: 10 }}>
                    <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.05)" />
                    <XAxis dataKey="name" stroke="#374151" tick={{ fill: "#6b7280", fontSize: 11 }} />
                    <YAxis
                      stroke="#374151"
                      tick={{ fill: "#6b7280", fontSize: 11 }}
                      tickFormatter={v => v >= 1_000_000 ? `£${(v / 1_000_000).toFixed(1)}M` : `£${(v / 1000).toFixed(0)}k`}
                      width={75}
                    />
                    <Tooltip
                      contentStyle={{ backgroundColor: "#111827", border: "1px solid #1e293b", borderRadius: "8px", color: "#f1f5f9", fontSize: 12 }}
                      formatter={(value: unknown) => [`£${fmt(Number(value))}`, "Valuation"]}
                    />
                    <Bar dataKey="value" radius={[4, 4, 0, 0]}>
                      {barData.map((entry, i) => (
                        <Cell key={i} fill={entry.fill} />
                      ))}
                    </Bar>
                  </BarChart>
                </ResponsiveContainer>
              </div>

              {/* Valuation range insight */}
              {(() => {
                const vals = [dcfValue, evValue, evSalesValue, epsValue].filter(v => v > 0);
                const lo = Math.min(...vals);
                const hi = Math.max(...vals);
                const spread = hi > 0 ? ((hi - lo) / hi) * 100 : 0;
                const verdict =
                  spread < 20 ? { text: "Strong consensus across methods — high confidence in this range.", color: "text-green-400" } :
                  spread < 50 ? { text: "Moderate dispersion — DCF assumptions or multiples may need review.", color: "text-yellow-400" } :
                  { text: "Wide spread between methods — review growth rate, WACC, and chosen multiples carefully.", color: "text-orange-400" };
                return (
                  <div className="bg-[#0d1426] border border-gray-800 rounded-xl p-6">
                    <h2 className="text-white font-bold mb-4">Valuation Range</h2>
                    <div className="flex items-center gap-4 mb-4">
                      <div className="flex-1 text-center bg-[#111827] rounded-xl p-4">
                        <div className="text-xs text-gray-500 uppercase tracking-wider mb-1">Low</div>
                        <div className="text-2xl font-extrabold text-white">£{fmt(lo)}</div>
                      </div>
                      <div className="text-gray-600 text-xl">—</div>
                      <div className="flex-1 text-center bg-[#111827] rounded-xl p-4">
                        <div className="text-xs text-gray-500 uppercase tracking-wider mb-1">High</div>
                        <div className="text-2xl font-extrabold text-white">£{fmt(hi)}</div>
                      </div>
                      <div className="text-gray-600 text-xl">—</div>
                      <div className="flex-1 text-center bg-blue-600/10 border border-blue-600/30 rounded-xl p-4">
                        <div className="text-xs text-blue-400 uppercase tracking-wider mb-1">Mid (Average)</div>
                        <div className="text-2xl font-extrabold text-white">£{fmt(avgValuation)}</div>
                      </div>
                    </div>
                    <p className={`text-sm font-semibold ${verdict.color}`}>{verdict.text}</p>
                    <p className="text-xs text-gray-500 mt-1">Method spread: {fmtM(spread)}%</p>
                  </div>
                );
              })()}

              {/* DCF chart */}
              <div className="bg-[#0d1426] border border-gray-800 rounded-xl p-6">
                <h2 className="text-white font-bold mb-5">{t("chartDCF")}</h2>
                <ResponsiveContainer width="100%" height={260}>
                  <LineChart data={dcfChartData} margin={{ top: 10, right: 20, bottom: 0, left: 10 }}>
                    <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.05)" />
                    <XAxis dataKey="year" stroke="#374151" tick={{ fill: "#6b7280", fontSize: 12 }} />
                    <YAxis
                      stroke="#374151"
                      tick={{ fill: "#6b7280", fontSize: 11 }}
                      tickFormatter={v => v >= 1_000_000 ? `£${(v / 1_000_000).toFixed(1)}M` : `£${(v / 1000).toFixed(0)}k`}
                      width={75}
                    />
                    <Tooltip
                      contentStyle={{ backgroundColor: "#111827", border: "1px solid #1e293b", borderRadius: "8px", color: "#f1f5f9", fontSize: 12 }}
                      formatter={(value: unknown) => [`£${fmt(Number(value))}`, undefined]}
                    />
                    <Legend wrapperStyle={{ color: "#9ca3af", fontSize: 12, paddingTop: 8 }} />
                    <Line type="monotone" dataKey="Free Cash Flow"  stroke="#3b82f6" strokeWidth={2} dot={{ fill: "#3b82f6", r: 4 }} />
                    <Line type="monotone" dataKey="Discounted FCF"  stroke="#22c55e" strokeWidth={2} strokeDasharray="5 5" dot={{ fill: "#22c55e", r: 4 }} />
                  </LineChart>
                </ResponsiveContainer>
              </div>

              {/* DCF table */}
              <div className="bg-[#0d1426] border border-gray-800 rounded-xl p-6">
                <h2 className="text-white font-bold mb-4">{t("tableTitle")}</h2>
                <div className="overflow-x-auto">
                  <table className="w-full text-sm">
                    <thead>
                      <tr className="border-b border-gray-700">
                        {[t("colYear"), t("colFCF"), t("colDiscountedFCF"), t("colCumulativePV")].map(h => (
                          <th key={h} className="text-left text-xs text-gray-400 uppercase tracking-wider py-2 pr-4 font-semibold">{h}</th>
                        ))}
                      </tr>
                    </thead>
                    <tbody>
                      {dcfRows.map(row => (
                        <tr key={row.year} className="border-b border-gray-800 hover:bg-gray-800/20 transition text-xs">
                          <td className="py-2 pr-4 text-white font-bold">Year {row.year}</td>
                          <td className="py-2 pr-4 text-blue-300 font-semibold">£{fmt(row.fcf)}</td>
                          <td className="py-2 pr-4 text-green-400">£{fmt(row.discountedFCF)}</td>
                          <td className="py-2 pr-4 text-gray-300">£{fmt(row.cumulativePV)}</td>
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

      <RelatedTools current="valuation" />
      <p className="text-center text-xs text-gray-600 pb-8 px-4">{tc("disclaimer")}</p>
    </main>
  );
}
