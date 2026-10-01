"use client";

import { Bar, BarChart, CartesianGrid, Legend, ResponsiveContainer, Tooltip, XAxis, YAxis } from "recharts";
import type { FinancialHistory, HistoryYear } from "@/lib/edgar";

// Ten years from the company's annual reports (SEC 10-K). Figures as filed,
// described in plain words; colours follow series position, never whether a
// number went up or down (CLAUDE.md, UK MAR).

const COLOURS = ["#3b82f6", "#94a3b8"];

const usd = (n: number) => {
  const a = Math.abs(n);
  const sign = n < 0 ? "−" : "";
  if (a >= 1e9) return `${sign}$${(a / 1e9).toLocaleString("en-GB", { maximumFractionDigits: a >= 1e11 ? 0 : 1 })}bn`;
  if (a >= 1e6) return `${sign}$${(a / 1e6).toLocaleString("en-GB", { maximumFractionDigits: 0 })}m`;
  return `${sign}$${a.toLocaleString("en-GB")}`;
};
const fy = (y: HistoryYear) => `FY${y.end.slice(0, 4)}`;

type Series = { key: keyof HistoryYear; name: string };

function Panel({ title, sentence, years, series }: { title: string; sentence: string; years: HistoryYear[]; series: Series[] }) {
  const data = years.map((y) => ({ label: fy(y), end: y.end, ...Object.fromEntries(series.map((s) => [s.name, y[s.key]])) }));
  return (
    <div className="bg-[#0d1426] border border-gray-800 rounded-2xl p-5">
      <h3 className="text-white font-bold">{title}</h3>
      <p className="text-xs text-gray-400 mt-1 mb-3 leading-relaxed">{sentence}</p>
      <ResponsiveContainer width="100%" height={220}>
        <BarChart data={data} margin={{ top: 5, right: 5, bottom: 0, left: 0 }}>
          <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.05)" vertical={false} />
          <XAxis dataKey="label" stroke="#374151" tick={{ fill: "#6b7280", fontSize: 10 }} interval="preserveStartEnd" />
          <YAxis stroke="#374151" tick={{ fill: "#6b7280", fontSize: 10 }} tickFormatter={usd} width={58} />
          <Tooltip
            contentStyle={{ backgroundColor: "#111827", border: "1px solid #1e293b", borderRadius: "8px", color: "#f1f5f9", fontSize: 12 }}
            formatter={(v) => (v === null || v === undefined ? "not reported" : usd(Number(v)))}
            labelFormatter={(label, payload) => `${label} (year to ${payload?.[0]?.payload?.end ?? ""})`}
          />
          <Legend wrapperStyle={{ color: "#9ca3af", fontSize: 11 }} />
          {series.map((s, i) => <Bar key={s.name} dataKey={s.name} fill={COLOURS[i]} radius={[2, 2, 0, 0]} />)}
        </BarChart>
      </ResponsiveContainer>
    </div>
  );
}

/** The latest year with this figure, and the earliest, for the sentence. */
function span(years: HistoryYear[], key: keyof HistoryYear) {
  const withData = years.filter((y) => typeof y[key] === "number");
  return { first: withData[0], last: withData.at(-1) };
}

export default function CompanyHistory({ history }: { history: FinancialHistory }) {
  const { years, available } = history;
  const panels = [];

  if (available.revenue || available.netIncome) {
    const { first, last } = span(years, available.revenue ? "revenue" : "netIncome");
    const margin = last?.revenue && last.netIncome !== null ? Math.round((last.netIncome / last.revenue) * 100) : null;
    panels.push(
      <Panel
        key="pl"
        title="Revenue and profit"
        sentence={
          available.revenue && first && last
            ? `Revenue was ${usd(last.revenue!)} in ${fy(last)}, against ${usd(first.revenue!)} in ${fy(first)}.` +
              (margin !== null ? ` Net profit was ${usd(last.netIncome!)} — ${margin} of every 100 of revenue.` : "")
            : `Net profit was ${usd(last!.netIncome!)} in ${fy(last!)}.`
        }
        years={years}
        series={[
          ...(available.revenue ? [{ key: "revenue" as const, name: "Revenue" }] : []),
          ...(available.netIncome ? [{ key: "netIncome" as const, name: "Net profit" }] : []),
        ]}
      />,
    );
  }

  if (available.cashFlow) {
    const { last } = span(years, "freeCashFlow");
    panels.push(
      <Panel
        key="cf"
        title="Cash the business generated"
        sentence={`In ${fy(last!)}, operations brought in ${usd(last!.operatingCashFlow!)}; after ${usd(last!.capex!)} spent on property and equipment, ${usd(last!.freeCashFlow!)} was left (free cash flow).`}
        years={years}
        series={[
          { key: "operatingCashFlow", name: "Cash from operations" },
          { key: "freeCashFlow", name: "Free cash flow" },
        ]}
      />,
    );
  }

  if (available.balance) {
    const { last } = span(years, "debt");
    panels.push(
      <Panel
        key="bs"
        title="Debt and cash at year end"
        sentence={`At the end of ${fy(last!)} the company reported ${usd(last!.debt!)} of long-term debt and ${usd(last!.cash ?? 0)} of cash and equivalents.`}
        years={years}
        series={[
          { key: "debt", name: "Long-term debt" },
          { key: "cash", name: "Cash" },
        ]}
      />,
    );
  }

  if (panels.length === 0) return null;
  return (
    <section className="mt-10">
      <div className="flex flex-wrap items-end justify-between gap-2 mb-4">
        <h2 className="text-xl font-bold text-white">{years.length} years from the annual reports</h2>
        <a href={history.source} target="_blank" rel="noopener noreferrer" className="text-xs text-gray-500 hover:text-blue-300">
          Source: SEC filings (10-K) ↗
        </a>
      </div>
      <div className="grid lg:grid-cols-3 gap-4">{panels}</div>
      <p className="text-xs text-gray-500 mt-3 leading-relaxed">
        As reported in each year&apos;s 10-K, in US dollars. Companies label some items differently, and a year can be
        missing where a figure wasn&apos;t reported in a comparable way.
      </p>
    </section>
  );
}
