"use client";

import { useState, useMemo, useCallback } from "react";
import Link from "next/link";
import { useLocale, useTranslations } from "next-intl";
import RelatedTools from "@/components/RelatedTools";
import CurrencyPicker, { useCurrency } from "@/components/CurrencyPicker";
import CashFlowChat from "./CashFlowChat";
import SpreadsheetIO from "@/components/SpreadsheetIO";
import type { SheetField } from "@/lib/spreadsheet-io";
import {
  DEFAULT_SCHEDULES, FREQUENCIES, INFLOW_LINES, LINES, OUTFLOW_LINES, WEEKS,
  fillAll, fillWeeks, forecast, summarise,
  type Frequency, type Line, type Lines, type Schedule, type Schedules,
} from "@/lib/cash-flow";
import {
  AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer,
  BarChart, Bar, ReferenceLine,
} from "recharts";

const fmt = (n: number) => Math.round(n).toLocaleString("en-GB", { maximumFractionDigits: 0 });

const WEEK_KEYS = Array.from({ length: WEEKS }, (_, i) => `W${i + 1}`);

// Colours tell the lines apart: greens for cash in, warm tones for cash out.
const COLOURS: Record<Line, string> = {
  revenue: "#22c55e",
  otherIncome: "#86efac",
  suppliers: "#ef4444",
  payroll: "#f97316",
  taxes: "#eab308",
  directDebits: "#a855f7",
};

// Inputs as spreadsheet rows (components/SpreadsheetIO.tsx), one row per line.
const SHEET_FIELDS: SheetField[] = [
  { key: "name", kind: "text", label: { en: "Forecast name", es: "Nombre de la previsión" } },
  { key: "opening", kind: "number", label: { en: "Opening cash balance", es: "Saldo de caja inicial" } },
  { key: "buffer", kind: "number", label: { en: "Minimum cash buffer", es: "Colchón mínimo de caja" } },
  { key: "revenue", kind: "series", periods: WEEK_KEYS, label: { en: "Revenue (customer receipts)", es: "Ventas (cobros a clientes)" } },
  { key: "otherIncome", kind: "series", periods: WEEK_KEYS, label: { en: "Other income", es: "Otros ingresos" } },
  { key: "suppliers", kind: "series", periods: WEEK_KEYS, label: { en: "Supplier payment runs", es: "Remesas de pago a proveedores" } },
  { key: "payroll", kind: "series", periods: WEEK_KEYS, label: { en: "Payroll", es: "Nóminas" } },
  { key: "taxes", kind: "series", periods: WEEK_KEYS, label: { en: "Taxes", es: "Impuestos" } },
  { key: "directDebits", kind: "series", periods: WEEK_KEYS, label: { en: "Direct debits", es: "Domiciliaciones" } },
];

function KpiCard({ label, value, sub, color = "blue" }: { label: string; value: string; sub: string; color?: "blue" | "green" | "red" | "amber" }) {
  const border = { blue: "border-l-blue-500", green: "border-l-green-500", red: "border-l-red-500", amber: "border-l-amber-500" }[color];
  return (
    <div className={`bg-[#0d1426] border border-gray-800 border-l-4 ${border} rounded-xl p-4`}>
      <div className="text-xs text-gray-400 uppercase tracking-wider font-semibold mb-1">{label}</div>
      <div className="text-2xl font-extrabold text-white leading-tight">{value}</div>
      <div className="text-xs text-gray-500 mt-1">{sub}</div>
    </div>
  );
}

function NumInput({ label, value, onChange, prefix, step = 1000, min, max }: {
  label: string; value: number; onChange: (v: number) => void; prefix?: string; step?: number; min?: number; max?: number;
}) {
  const [currency] = useCurrency();
  return (
    <div className="flex flex-col gap-1 min-w-0">
      <label className="text-xs text-gray-400">{label}</label>
      <div className="flex items-center bg-[#111827] border border-gray-700 rounded-lg px-3 py-1.5 focus-within:border-blue-500 transition">
        <span className="text-gray-500 text-sm mr-1.5 shrink-0">{prefix ?? currency}</span>
        <input
          type="number"
          step={step}
          min={min}
          max={max}
          value={value}
          onChange={e => onChange(parseFloat(e.target.value) || 0)}
          className="bg-transparent text-white text-sm w-full outline-none min-w-0"
        />
      </div>
    </div>
  );
}

function ScheduleCard({ line, schedule, onChange }: { line: Line; schedule: Schedule; onChange: (patch: Partial<Schedule>) => void }) {
  const t = useTranslations("cashFlow");
  return (
    <div className="border border-gray-800 rounded-lg p-3 flex flex-col gap-2">
      <div className="flex items-center gap-2">
        <span className="w-2.5 h-2.5 rounded-full shrink-0" style={{ backgroundColor: COLOURS[line] }} aria-hidden />
        <span className="text-sm font-semibold text-white">{t(`lines.${line}`)}</span>
      </div>
      <p className="text-[11px] text-gray-500 leading-snug">{t(`hints.${line}`)}</p>
      <NumInput label={t("labelAmount")} value={schedule.amount} min={0} onChange={v => onChange({ amount: Math.max(0, v) })} />
      <div className="grid grid-cols-2 gap-2">
        <div className="flex flex-col gap-1">
          <label className="text-xs text-gray-400">{t("labelFrequency")}</label>
          <select
            value={schedule.frequency}
            onChange={e => onChange({ frequency: e.target.value as Frequency })}
            className="bg-[#111827] border border-gray-700 rounded-lg px-2 py-2 text-white text-sm outline-none focus:border-blue-500"
          >
            {FREQUENCIES.map(f => <option key={f} value={f}>{t(`freq.${f}`)}</option>)}
          </select>
        </div>
        <div className="flex flex-col gap-1">
          <label className="text-xs text-gray-400">{t("labelFirstWeek")}</label>
          <select
            value={schedule.firstWeek}
            onChange={e => onChange({ firstWeek: Number(e.target.value) })}
            className="bg-[#111827] border border-gray-700 rounded-lg px-2 py-2 text-white text-sm outline-none focus:border-blue-500"
          >
            {Array.from({ length: WEEKS }, (_, i) => <option key={i} value={i + 1}>{t("weekShort", { n: i + 1 })}</option>)}
          </select>
        </div>
      </div>
      {line === "revenue" && (
        <NumInput label={t("labelGrowth")} value={schedule.growthPct ?? 0} prefix="%" step={0.5} onChange={v => onChange({ growthPct: v })} />
      )}
    </div>
  );
}

export default function CashFlowPage() {
  const t = useTranslations("cashFlow");
  const tc = useTranslations("toolCommon");
  const locale = useLocale();
  const [currency] = useCurrency();
  const [forecastName, setForecastName] = useState("Q1 Forecast");
  const [openingBalance, setOpeningBalance] = useState(50000);
  const [buffer, setBuffer] = useState(20000);
  // Schedules and the weekly grid live together: a schedule change refills its line.
  const [plan, setPlan] = useState<{ schedules: Schedules; lines: Lines }>(() => ({ schedules: DEFAULT_SCHEDULES, lines: fillAll(DEFAULT_SCHEDULES) }));
  const { schedules, lines } = plan;
  const setLines = useCallback((f: (prev: Lines) => Lines) => setPlan(p => ({ ...p, lines: f(p.lines) })), []);
  const [isExporting, setIsExporting] = useState(false);

  const money = useCallback((n: number) => `${n < 0 ? "−" : ""}${currency}${fmt(Math.abs(n))}`, [currency]);
  const lineName = useCallback((l: Line) => t(`lines.${l}`), [t]);

  // A schedule change refills its own line only, so typed one-offs on other lines stay.
  const updateSchedule = useCallback((line: Line, patch: Partial<Schedule>) => {
    setPlan(p => {
      const next = { ...p.schedules[line], ...patch };
      return { schedules: { ...p.schedules, [line]: next }, lines: { ...p.lines, [line]: fillWeeks(next) } };
    });
  }, []);

  const setCell = (line: Line, week: number, v: number) =>
    setLines(prev => ({ ...prev, [line]: prev[line].map((x, i) => (i === week ? Math.max(0, v) : x)) }));

  const rows = useMemo(() => forecast(openingBalance, lines), [openingBalance, lines]);
  const summary = useMemo(() => summarise(openingBalance, rows), [openingBalance, rows]);
  const weeksBelowBuffer = rows.filter(r => r.closing < buffer).length;

  // Cash out is drawn below the axis, so one bar per week reads as in vs out.
  const chartData = rows.map(r => ({
    week: t("weekShort", { n: r.week }),
    balance: r.closing,
    ...Object.fromEntries(INFLOW_LINES.map(l => [l, r.lines[l]])),
    ...Object.fromEntries(OUTFLOW_LINES.map(l => [l, -r.lines[l]])),
  }));
  const axisMoney = (v: number) => {
    const a = Math.abs(v);
    return `${v < 0 ? "−" : ""}${currency}${a >= 1000 ? `${(a / 1000).toFixed(0)}k` : a}`;
  };

  const handleExportPdf = useCallback(async () => {
    setIsExporting(true);
    try {
      const { pdf } = await import("@react-pdf/renderer");
      const { default: CashFlowPDF } = await import("./pdf");
      const blob = await pdf(
        <CashFlowPDF
          currency={currency}
          forecastName={forecastName}
          openingBalance={openingBalance}
          buffer={buffer}
          summary={summary}
          rows={rows}
          lineNames={Object.fromEntries(LINES.map(l => [l, lineName(l)])) as Record<Line, string>}
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
  }, [currency, forecastName, openingBalance, buffer, summary, rows, lineName]);

  const tooltipStyle = { backgroundColor: "#111827", border: "1px solid #1e293b", borderRadius: "8px", color: "#f1f5f9", fontSize: 12 };
  const cellInput = "bg-[#111827] border border-gray-700 rounded px-1.5 py-1 text-white text-xs w-[4.75rem] text-right outline-none focus:border-blue-500";
  const th = "text-right text-[11px] text-gray-400 font-semibold py-2 px-1.5 whitespace-nowrap";
  const stickyCell = "sticky left-0 bg-[#0d1426] z-10 text-left pr-3 py-1.5 whitespace-nowrap";

  const lineRow = (line: Line) => (
    <tr key={line} className="border-b border-gray-800/60">
      <td className={`${stickyCell} text-xs text-gray-300`}>
        <span className="inline-block w-2 h-2 rounded-full mr-2 align-middle" style={{ backgroundColor: COLOURS[line] }} aria-hidden />
        {lineName(line)}
      </td>
      {lines[line].map((v, i) => (
        <td key={i} className="px-1 py-1">
          <input
            type="number"
            min={0}
            value={v}
            aria-label={`${lineName(line)}, ${t("weekShort", { n: i + 1 })}`}
            onChange={e => setCell(line, i, parseFloat(e.target.value) || 0)}
            className={cellInput}
          />
        </td>
      ))}
      <td className="px-1.5 py-1 text-right text-xs text-gray-300 font-semibold whitespace-nowrap">{money(summary.totals[line])}</td>
    </tr>
  );

  const totalRow = (label: string, values: number[], total: number | null, strong = false, signed = false) => (
    <tr className={`border-b ${strong ? "border-gray-600" : "border-gray-800"}`}>
      <td className={`${stickyCell} text-xs ${strong ? "text-white font-bold" : "text-gray-400 font-semibold"}`}>{label}</td>
      {values.map((v, i) => (
        <td key={i} className={`px-1.5 py-1.5 text-right text-xs whitespace-nowrap ${v < 0 ? "text-red-400" : strong ? "text-white" : "text-gray-300"} ${strong ? "font-bold" : ""} ${strong && v < buffer && v >= 0 ? "text-amber-300" : ""}`}>
          {signed && v > 0 ? "+" : ""}{money(v)}
        </td>
      ))}
      <td className="px-1.5 py-1.5 text-right text-xs text-gray-300 font-semibold whitespace-nowrap">{total === null ? "" : `${signed && total > 0 ? "+" : ""}${money(total)}`}</td>
    </tr>
  );

  return (
    <main className="min-h-screen bg-[#0a0f1e] text-white">
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify({
          "@context": "https://schema.org",
          "@type": "SoftwareApplication",
          "name": "13-Week Cash Flow Forecast",
          "description": "Build a 13-week rolling cash flow forecast — customer receipts and other income in; supplier payment runs, payroll, taxes and direct debits out. Free tool, instant PDF export.",
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
              <div className="flex flex-col gap-4">
                <SpreadsheetIO
                  title={`13-week cash flow forecast — ${forecastName} (${currency})`}
                  fileName="cash-flow-forecast"
                  fields={SHEET_FIELDS}
                  getValues={() => ({ name: forecastName, opening: openingBalance, buffer, ...lines })}
                  onImport={v => {
                    if (typeof v.name === "string") setForecastName(v.name);
                    if (typeof v.opening === "number") setOpeningBalance(v.opening);
                    if (typeof v.buffer === "number") setBuffer(v.buffer);
                    setLines(prev => {
                      const next = { ...prev };
                      for (const l of LINES) {
                        const s = v[l];
                        if (Array.isArray(s)) next[l] = Array.from({ length: WEEKS }, (_, i) => Math.max(0, s[i] ?? 0));
                      }
                      return next;
                    });
                  }}
                />
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
                    <NumInput label={t("labelBuffer")} value={buffer} min={0} onChange={v => setBuffer(Math.max(0, v))} />
                    <p className="text-[11px] text-gray-500 leading-snug">{t("bufferHelp")}</p>
                  </div>
                </div>

                <div className="bg-[#0d1426] border border-gray-800 rounded-xl p-5">
                  <p className="text-[11px] text-gray-500 leading-snug mb-3">{t("scheduleHelp")}</p>
                  <h3 className="text-xs font-bold uppercase tracking-wider text-green-400 mb-2">{t("sectionIn")}</h3>
                  <div className="flex flex-col gap-2 mb-4">
                    {INFLOW_LINES.map(l => <ScheduleCard key={l} line={l} schedule={schedules[l]} onChange={p => updateSchedule(l, p)} />)}
                  </div>
                  <h3 className="text-xs font-bold uppercase tracking-wider text-red-400 mb-2">{t("sectionOut")}</h3>
                  <div className="flex flex-col gap-2">
                    {OUTFLOW_LINES.map(l => <ScheduleCard key={l} line={l} schedule={schedules[l]} onChange={p => updateSchedule(l, p)} />)}
                  </div>
                </div>
              </div>
            </aside>

            {/* Main Content */}
            <div className="flex-1 min-w-0 flex flex-col gap-6">
              <div className="grid grid-cols-2 xl:grid-cols-4 gap-3">
                <KpiCard label={t("kpiIn")} value={money(summary.totalIn)} sub={t("kpiTotalSub")} color="green" />
                <KpiCard label={t("kpiOut")} value={money(summary.totalOut)} sub={t("kpiTotalSub")} color="red" />
                <KpiCard
                  label={t("kpiClosing")}
                  value={money(summary.closing)}
                  sub={t("kpiClosingSub")}
                  color={summary.closing >= 0 ? "blue" : "red"}
                />
                <KpiCard
                  label={t("kpiLowest")}
                  value={money(summary.lowest)}
                  sub={t("kpiLowestSub", { week: summary.lowestWeek })}
                  color={summary.lowest < 0 ? "red" : summary.lowest < buffer ? "amber" : "green"}
                />
              </div>

              {(summary.weeksNegative > 0 || weeksBelowBuffer > 0) && (
                <div className={`${summary.weeksNegative > 0 ? "bg-red-900/20 border-red-800" : "bg-amber-900/20 border-amber-800"} border rounded-xl p-4`}>
                  <div className={`text-xs font-bold uppercase tracking-wider mb-2 ${summary.weeksNegative > 0 ? "text-red-400" : "text-amber-400"}`}>⚠ {t("alertTitle")}</div>
                  <ul className="text-sm text-gray-200 space-y-1">
                    {summary.weeksNegative > 0 && <li>{t("alertNegative", { count: summary.weeksNegative })}</li>}
                    {weeksBelowBuffer > 0 && <li>{t("alertBelowBuffer", { count: weeksBelowBuffer, buffer: money(buffer) })}</li>}
                    <li>{t("alertLowest", { amount: money(summary.lowest), week: summary.lowestWeek })}</li>
                  </ul>
                </div>
              )}

              <div className="bg-[#0d1426] border border-gray-800 rounded-xl p-6">
                <h2 className="text-white font-bold mb-5">{t("chartBalance")}</h2>
                <ResponsiveContainer width="100%" height={280}>
                  <AreaChart data={chartData} margin={{ top: 10, right: 20, bottom: 0, left: 10 }}>
                    <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.05)" />
                    <XAxis dataKey="week" stroke="#374151" tick={{ fill: "#6b7280", fontSize: 11 }} />
                    <YAxis stroke="#374151" tick={{ fill: "#6b7280", fontSize: 11 }} tickFormatter={axisMoney} width={65} />
                    <Tooltip contentStyle={tooltipStyle} formatter={(value: unknown) => [money(Number(value)), t("rowClosing")]} />
                    <ReferenceLine y={0} stroke="#ef4444" strokeDasharray="4 4" />
                    {buffer > 0 && (
                      <ReferenceLine y={buffer} stroke="#f59e0b" strokeDasharray="2 4" label={{ value: t("chartBuffer"), fill: "#f59e0b", fontSize: 11, position: "insideTopLeft" }} />
                    )}
                    <Area type="monotone" dataKey="balance" stroke="#3b82f6" fill="#3b82f6" fillOpacity={0.3} strokeWidth={2} />
                  </AreaChart>
                </ResponsiveContainer>
              </div>

              <div className="bg-[#0d1426] border border-gray-800 rounded-xl p-6">
                <h2 className="text-white font-bold mb-5">{t("chartInOut")}</h2>
                <ResponsiveContainer width="100%" height={300}>
                  <BarChart data={chartData} stackOffset="sign" margin={{ top: 10, right: 20, bottom: 0, left: 10 }}>
                    <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.05)" />
                    <XAxis dataKey="week" stroke="#374151" tick={{ fill: "#6b7280", fontSize: 11 }} />
                    <YAxis stroke="#374151" tick={{ fill: "#6b7280", fontSize: 11 }} tickFormatter={axisMoney} width={65} />
                    <Tooltip
                      contentStyle={tooltipStyle}
                      formatter={(value: unknown, name: unknown) => [money(Math.abs(Number(value))), lineName(name as Line)]}
                    />
                    <Legend wrapperStyle={{ color: "#9ca3af", fontSize: 12, paddingTop: 8 }} formatter={(name: string) => lineName(name as Line)} />
                    <ReferenceLine y={0} stroke="#4b5563" />
                    {LINES.map(l => <Bar key={l} dataKey={l} stackId="cash" fill={COLOURS[l]} />)}
                  </BarChart>
                </ResponsiveContainer>
              </div>

              <div className="bg-[#0d1426] border border-gray-800 rounded-xl p-6">
                <h2 className="text-white font-bold">{t("gridTitle")}</h2>
                <p className="text-xs text-gray-500 mt-1 mb-4">{t("gridHelp")}</p>
                <div className="overflow-x-auto">
                  <table className="text-sm border-collapse">
                    <thead>
                      <tr className="border-b border-gray-700">
                        <th className={`${stickyCell} text-[11px] text-gray-400 font-semibold`} />
                        {rows.map(r => <th key={r.week} className={th}>{t("weekShort", { n: r.week })}</th>)}
                        <th className={th}>{t("colTotal")}</th>
                      </tr>
                    </thead>
                    <tbody>
                      {totalRow(t("rowOpening"), rows.map(r => r.opening), null)}
                      <tr><td colSpan={WEEKS + 2} className={`${stickyCell} pt-3 text-[11px] font-bold uppercase tracking-wider text-green-400`}>{t("sectionIn")}</td></tr>
                      {INFLOW_LINES.map(lineRow)}
                      {totalRow(t("rowTotalIn"), rows.map(r => r.inflows), summary.totalIn)}
                      <tr><td colSpan={WEEKS + 2} className={`${stickyCell} pt-3 text-[11px] font-bold uppercase tracking-wider text-red-400`}>{t("sectionOut")}</td></tr>
                      {OUTFLOW_LINES.map(lineRow)}
                      {totalRow(t("rowTotalOut"), rows.map(r => r.outflows), summary.totalOut)}
                      {totalRow(t("rowNet"), rows.map(r => r.net), summary.totalIn - summary.totalOut, false, true)}
                      {totalRow(t("rowClosing"), rows.map(r => r.closing), null, true)}
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
            { label: locale === "es" ? "📊 Modelo financiero a 5 años" : "📊 5-Year Financial Model", href: "/tools/financial-model" },
            { label: locale === "es" ? "📋 Presupuesto anual" : "📋 Annual Budget", href: "/tools/annual-budget" },
            { label: locale === "es" ? "💎 Valoración de empresas" : "💎 Business Valuation", href: "/tools/valuation" },
          ].map(tool => (
            <Link key={tool.href} href={tool.href}
              className="text-sm text-gray-400 hover:text-white border border-gray-700 hover:border-blue-500 px-4 py-2 rounded-lg transition">
              {tool.label}
            </Link>
          ))}
        </div>
      </div>
      <CashFlowChat
        currency={currency}
        name={forecastName}
        setName={setForecastName}
        opening={openingBalance}
        setOpening={setOpeningBalance}
        schedules={schedules}
        setSchedule={updateSchedule}
        lowest={summary.lowest}
        lowestWeek={summary.lowestWeek}
      />
      <RelatedTools current="cash-flow" />
      <p className="text-center text-xs text-gray-600 pb-8 px-4">{tc("disclaimer")}</p>
    </main>
  );
}
