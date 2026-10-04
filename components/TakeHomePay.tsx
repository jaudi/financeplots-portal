"use client";

import { useEffect, useMemo, useState } from "react";
import Link from "next/link";
import { Bar, BarChart, CartesianGrid, Legend, ReferenceLine, ResponsiveContainer, Tooltip, XAxis, YAxis } from "recharts";
import {
  grossForTakeHome,
  STUDENT_LOAN_THRESHOLDS,
  TAX_YEAR,
  takeHomePay,
  type PensionMethod,
  type StudentLoanPlan,
  type UkRegion,
} from "@/lib/calculators";
import { takeHomeChart } from "@/lib/charts/tool-charts";
import TakeHomeChat from "@/components/TakeHomeChat";

// The maths lives in lib/calculators.ts, shared with the MCP tool take_home_pay,
// so the page and the MCP always agree. Chart colours follow series position,
// like every other chart on the site.

const SERIES_COLOURS = ["#3b82f6", "#64748b", "#94a3b8", "#a78bfa", "#38bdf8"];

const gbp = (n: number, dp = 0) =>
  `£${n.toLocaleString("en-GB", { minimumFractionDigits: dp, maximumFractionDigits: dp })}`;

function NumInput({ label, value, onChange, prefix = "£", step = 1000, suffix }: {
  label: string; value: number; onChange: (v: number) => void; prefix?: string; step?: number; suffix?: string;
}) {
  return (
    <div className="flex flex-col gap-1">
      <label className="text-xs text-gray-400 font-medium">{label}</label>
      <div className="flex items-center bg-[#111827] border border-gray-700 rounded-lg px-3 py-2 focus-within:border-blue-500 transition">
        {prefix && <span className="text-gray-500 text-sm mr-1.5 shrink-0">{prefix}</span>}
        <input
          type="number"
          min={0}
          step={step}
          value={value}
          onChange={(e) => onChange(Math.max(0, parseFloat(e.target.value) || 0))}
          className="bg-transparent text-white text-sm w-full outline-none"
        />
        {suffix && <span className="text-gray-500 text-sm ml-1.5 shrink-0">{suffix}</span>}
      </div>
    </div>
  );
}

function Select<T extends string>({ label, value, onChange, options }: {
  label: string; value: T; onChange: (v: T) => void; options: { value: T; label: string }[];
}) {
  return (
    <div className="flex flex-col gap-1">
      <label className="text-xs text-gray-400 font-medium">{label}</label>
      <select
        value={value}
        onChange={(e) => onChange(e.target.value as T)}
        className="bg-[#111827] border border-gray-700 rounded-lg px-3 py-2 text-white text-sm outline-none focus:border-blue-500"
      >
        {options.map((o) => <option key={o.value} value={o.value}>{o.label}</option>)}
      </select>
    </div>
  );
}

function KpiCard({ label, value, sub }: { label: string; value: string; sub: string }) {
  return (
    <div className="bg-[#0d1426] border border-gray-800 border-l-4 border-l-blue-500 rounded-xl p-4">
      <div className="text-xs text-gray-400 uppercase tracking-wider font-semibold mb-1">{label}</div>
      <div className="text-2xl font-extrabold text-white leading-tight">{value}</div>
      <div className="text-xs text-gray-500 mt-1">{sub}</div>
    </div>
  );
}

type Mode = "salary" | "target";

export default function TakeHomePay({ initialSalary, initialTarget }: { initialSalary: number | null; initialTarget: number | null }) {
  const [mode, setMode] = useState<Mode>(initialTarget !== null && initialSalary === null ? "target" : "salary");
  const [salary, setSalary] = useState(initialSalary ?? 45_000);
  const [target, setTarget] = useState(initialTarget ?? 3_000);
  const [region, setRegion] = useState<UkRegion>("england_wales_ni");
  const [pensionPct, setPensionPct] = useState(5);
  const [pensionMethod, setPensionMethod] = useState<PensionMethod>("salary_sacrifice");
  const [loan, setLoan] = useState<StudentLoanPlan | "none">("none");
  const [postgrad, setPostgrad] = useState(false);
  const [raise, setRaise] = useState(5_000);

  const options = useMemo(
    () => ({ region, pensionPct, pensionMethod, studentLoan: loan === "none" ? null : loan, postgradLoan: postgrad }),
    [region, pensionPct, pensionMethod, loan, postgrad],
  );

  const gross = useMemo(() => {
    if (mode === "salary") return salary;
    const g = grossForTakeHome(target * 12, options);
    return Number.isFinite(g) ? g : 0;
  }, [mode, salary, target, options]);

  const r = useMemo(() => takeHomePay({ ...options, grossSalary: gross }), [options, gross]);
  const afterRaise = useMemo(() => takeHomePay({ ...options, grossSalary: gross + raise }), [options, gross, raise]);
  const raiseMonthly = (afterRaise.takeHome - r.takeHome) / 12;

  const chart = useMemo(() => {
    const spec = takeHomeChart({ ...options, grossSalary: gross });
    const data = spec.x.labels.map((label, i) => ({
      label,
      ...Object.fromEntries(spec.series.map((s) => [s.name, s.values[i] ?? 0])),
    }));
    const marker = spec.markers?.[0];
    const markerLabel = marker ? spec.x.labels[Math.round(marker.index)] : undefined;
    return { spec, data, markerLabel };
  }, [options, gross]);

  // Keep the address shareable: ?salary=45000 or ?target=3000.
  useEffect(() => {
    const url = new URL(window.location.href);
    url.searchParams.delete("salary");
    url.searchParams.delete("target");
    url.searchParams.set(mode, String(Math.round(mode === "salary" ? salary : target)));
    window.history.replaceState(null, "", url);
  }, [mode, salary, target]);

  const monthly = (n: number) => n / 12;
  const inTaperBand = gross > 100_000 && gross <= 125_140;
  const rows = [
    { label: "Gross salary", yearly: r.grossSalary },
    ...(r.pensionFromPay > 0 ? [{ label: pensionMethod === "relief_at_source" ? "Pension (after 20% relief)" : "Pension", yearly: -r.pensionFromPay }] : []),
    { label: "Income tax", yearly: -r.incomeTax },
    { label: "National Insurance", yearly: -r.nationalInsurance },
    ...(r.studentLoan > 0 ? [{ label: "Student loan", yearly: -r.studentLoan }] : []),
    ...(r.postgradLoan > 0 ? [{ label: "Postgraduate loan", yearly: -r.postgradLoan }] : []),
  ];

  return (
    <div className="flex flex-col lg:flex-row gap-6">
      <aside className="lg:w-72 xl:w-80 shrink-0">
        <div className="lg:sticky lg:top-[100px] flex flex-col gap-4">
          <div className="bg-[#0d1426] border border-gray-800 rounded-xl p-5">
            <div className="grid grid-cols-2 gap-2 mb-4">
              {(["salary", "target"] as Mode[]).map((m) => (
                <button
                  key={m}
                  onClick={() => {
                    // Carry the current figure across, so switching shows the same person.
                    if (m === "target") setTarget(Math.round(monthly(r.takeHome)));
                    else setSalary(Math.round(gross));
                    setMode(m);
                  }}
                  className={`py-2 px-2 rounded-lg text-xs font-semibold transition ${mode === m ? "bg-blue-600 text-white" : "bg-[#111827] text-gray-400 border border-gray-700 hover:text-white"}`}
                >
                  {m === "salary" ? "I know my salary" : "I know what I want to take home"}
                </button>
              ))}
            </div>
            {mode === "salary" ? (
              <NumInput label="Gross salary per year" value={salary} onChange={setSalary} />
            ) : (
              <NumInput label="Take-home wanted per month" value={target} onChange={setTarget} step={100} />
            )}
          </div>

          <div className="bg-[#0d1426] border border-gray-800 rounded-xl p-5 flex flex-col gap-3">
            <h3 className="text-xs font-bold uppercase tracking-wider text-blue-400">Your situation</h3>
            <Select
              label="Where you pay income tax"
              value={region}
              onChange={setRegion}
              options={[{ value: "england_wales_ni", label: "England, Wales or Northern Ireland" }, { value: "scotland", label: "Scotland" }]}
            />
            <NumInput label="Your pension contribution" value={pensionPct} onChange={setPensionPct} prefix="" suffix="% of salary" step={1} />
            {pensionPct > 0 && (
              <Select
                label="How your pension is paid"
                value={pensionMethod}
                onChange={setPensionMethod}
                options={[
                  { value: "salary_sacrifice", label: "Salary sacrifice (saves tax and NI)" },
                  { value: "net_pay", label: "Net pay (saves tax)" },
                  { value: "relief_at_source", label: "Relief at source (from net pay)" },
                ]}
              />
            )}
            <Select
              label="Student loan"
              value={loan}
              onChange={setLoan}
              options={[
                { value: "none", label: "None" },
                ...(Object.keys(STUDENT_LOAN_THRESHOLDS) as StudentLoanPlan[]).map((p) => ({
                  value: p,
                  label: `${p.replace("plan", "Plan ")} (above ${gbp(STUDENT_LOAN_THRESHOLDS[p])})`,
                })),
              ]}
            />
            <label className="flex items-center gap-2 text-sm text-gray-300">
              <input type="checkbox" checked={postgrad} onChange={(e) => setPostgrad(e.target.checked)} className="accent-blue-500" />
              Postgraduate loan
            </label>
          </div>
        </div>
      </aside>

      <div className="flex-1 min-w-0 flex flex-col gap-6">
        <div className="grid grid-cols-2 xl:grid-cols-4 gap-3">
          <KpiCard label="Take-home per month" value={gbp(monthly(r.takeHome))} sub={`${gbp(r.takeHome)} a year`} />
          <KpiCard
            label={mode === "target" ? "Gross salary needed" : "Gross salary"}
            value={gbp(r.grossSalary)}
            sub={`${gbp(monthly(r.grossSalary))} a month before deductions`}
          />
          <KpiCard label="Effective rate" value={`${r.effectiveRatePct.toFixed(1)}%`} sub="of salary to tax, NI and loans" />
          <KpiCard label="Marginal rate" value={`${r.marginalRatePct.toFixed(0)}%`} sub="of your next £100 goes to deductions" />
        </div>

        {inTaperBand && (
          <div className="bg-amber-500/5 border border-amber-500/30 rounded-xl px-5 py-4 text-sm text-gray-300 leading-relaxed">
            <span className="text-amber-300 font-bold">The 60% band.</span> Between £100,000 and £125,140 your personal allowance
            shrinks by £1 for every £2 you earn, so each extra pound is taxed far more than the 40% headline rate. Paying
            more into your pension by salary sacrifice brings your income down and gives the allowance back.
          </div>
        )}

        <div className="bg-[#0d1426] border border-gray-800 rounded-xl p-6">
          <h2 className="text-white font-bold mb-4">Your payslip, in round figures</h2>
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-gray-700">
                  {["", "Per year", "Per month"].map((h) => (
                    <th key={h} className="text-left text-xs text-gray-400 uppercase tracking-wider py-2 pr-4 font-semibold">{h}</th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {rows.map((row) => (
                  <tr key={row.label} className="border-b border-gray-800 text-gray-300">
                    <td className="py-2 pr-4">{row.label}</td>
                    <td className="py-2 pr-4">{row.yearly < 0 ? "−" : ""}{gbp(Math.abs(row.yearly))}</td>
                    <td className="py-2 pr-4">{row.yearly < 0 ? "−" : ""}{gbp(Math.abs(monthly(row.yearly)))}</td>
                  </tr>
                ))}
                <tr className="text-white font-bold">
                  <td className="py-2 pr-4">Take-home</td>
                  <td className="py-2 pr-4">{gbp(r.takeHome)}</td>
                  <td className="py-2 pr-4">{gbp(monthly(r.takeHome))}</td>
                </tr>
              </tbody>
            </table>
          </div>
          {r.pensionTotal > 0 && (
            <p className="text-xs text-gray-500 mt-3">
              {gbp(r.pensionTotal)} a year goes into your pension pot (your contribution only; add your employer&apos;s on top).
            </p>
          )}
        </div>

        <div className="grid sm:grid-cols-2 gap-4">
          <div className="bg-[#0d1426] border border-gray-800 rounded-xl p-5">
            <h3 className="text-white font-bold mb-3">What would a pay rise really add?</h3>
            <NumInput label="Pay rise per year" value={raise} onChange={setRaise} step={500} />
            <p className="text-sm text-gray-300 mt-3">
              A {gbp(raise)} rise adds <span className="text-white font-bold">{gbp(raiseMonthly)}</span> a month to your take-home
              {raise > 0 && <> — you keep {Math.round((raiseMonthly * 12 * 100) / raise)}p of every £1.</>}
            </p>
          </div>
          <div className="bg-[#0d1426] border border-blue-500/40 rounded-xl p-5 flex flex-col justify-between">
            <div>
              <h3 className="text-white font-bold mb-2">Now plan where it goes</h3>
              <p className="text-sm text-gray-400">
                Open the Personal Budget with {gbp(monthly(r.takeHome))} a month already filled in as your salary.
              </p>
            </div>
            <Link
              href={`/tools/personal-budget?salary=${Math.round(monthly(r.takeHome))}`}
              className="mt-4 self-start bg-blue-600 hover:bg-blue-500 text-white font-semibold px-4 py-2 rounded-lg text-sm transition"
            >
              Plan your budget with this →
            </Link>
          </div>
        </div>

        <div className="bg-[#0d1426] border border-gray-800 rounded-xl p-6">
          <h2 className="text-white font-bold">{chart.spec.title}</h2>
          <p className="text-xs text-gray-500 mb-4">{chart.spec.subtitle}</p>
          <ResponsiveContainer width="100%" height={340}>
            <BarChart data={chart.data} margin={{ top: 20, right: 10, bottom: 10, left: 10 }}>
              <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.05)" />
              <XAxis dataKey="label" stroke="#374151" tick={{ fill: "#6b7280", fontSize: 11 }} />
              <YAxis
                stroke="#374151"
                tick={{ fill: "#6b7280", fontSize: 11 }}
                tickFormatter={(v) => `£${Math.round(v / 1000)}k`}
                width={55}
              />
              <Tooltip
                contentStyle={{ backgroundColor: "#111827", border: "1px solid #1e293b", borderRadius: "8px", color: "#f1f5f9", fontSize: 12 }}
                formatter={(value) => gbp(Number(value))}
              />
              <Legend wrapperStyle={{ color: "#9ca3af", fontSize: 12, paddingTop: 8 }} />
              {chart.spec.series.map((s, i) => (
                <Bar key={s.name} dataKey={s.name} stackId="s" fill={SERIES_COLOURS[s.slot ?? i]} />
              ))}
              {chart.markerLabel && (
                <ReferenceLine x={chart.markerLabel} stroke="#f1f5f9" strokeDasharray="4 4" label={{ value: "≈ you", fill: "#f1f5f9", fontSize: 11, position: "top" }} />
              )}
            </BarChart>
          </ResponsiveContainer>
        </div>

        <p className="text-xs text-gray-500 leading-relaxed">
          Tax year {TAX_YEAR}, rates from GOV.UK. Assumes you are an employee on the standard tax code (1257L) with
          one job. Figures are yearly, and monthly is yearly ÷ 12, so a real payslip can differ by a few pounds. Not
          included: other tax codes, benefits in kind, bonuses, and higher-rate pension relief you claim through
          self-assessment.
        </p>
      </div>

      <TakeHomeChat
        api={{
          mode, salary, target, pensionPct, takeHomeMonthly: monthly(r.takeHome),
          setMode, setSalary, setTarget, setRegion, setPensionPct, setPensionMethod, setLoan, setPostgrad,
        }}
      />
    </div>
  );
}
