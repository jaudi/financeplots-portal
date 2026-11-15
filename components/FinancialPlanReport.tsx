"use client";

import { useLocale, useTranslations } from "next-intl";
import Link from "next/link";
import { useCallback, useMemo, useState } from "react";
import { trackEvent } from "@/lib/analytics";
import { layoutChart, THEMES, type Theme } from "@/lib/charts/layout";
import type { ChartSpec } from "@/lib/charts/spec";
import { sceneToSvg } from "@/lib/charts/svg";
import { financialPlanCharts } from "@/lib/charts/tool-charts";
import { decodePlan, financialPlan, FP_DEFAULTS, type CompletePlan, type PlanScenario } from "@/lib/financial-plan";

// The /plan report: a financial_plan result rebuilt from its ?p= link, with the
// same charts the MCP tool returns and a PDF built in the browser. Nothing is
// stored; the figures live in the link. Planning, not advice: levers are shown
// as measured effects, and the footer is the tool's, word for word.

const CHART = { width: 800, height: 450 };

function chartSvg(spec: ChartSpec, theme: Theme) {
  return sceneToSvg(layoutChart(spec, { ...CHART, theme }));
}

/** Rasterises a chart for the PDF (react-pdf takes images, not SVG markup). */
async function chartPng(spec: ChartSpec): Promise<string> {
  const svg = chartSvg(spec, THEMES.light);
  const img = new Image();
  img.src = `data:image/svg+xml;charset=utf-8,${encodeURIComponent(svg)}`;
  await img.decode();
  const canvas = document.createElement("canvas");
  canvas.width = CHART.width * 2;
  canvas.height = CHART.height * 2;
  const ctx = canvas.getContext("2d")!;
  ctx.scale(2, 2);
  ctx.drawImage(img, 0, 0, CHART.width, CHART.height);
  return canvas.toDataURL("image/png");
}

export default function FinancialPlanReport({ p }: { p?: string }) {
  const t = useTranslations("planReport");
  const locale = useLocale();
  const [exporting, setExporting] = useState(false);

  const ff = useMemo(() => (p ? decodePlan(p) : null), [p]);
  // A link is the user's own confirmed plan: assumptions travel with it.
  const result = useMemo(() => (ff ? financialPlan({ ...ff, assumptions_confirmed: true }) : null), [ff]);

  const money = useCallback(
    (n: number) => `${n < 0 ? "−" : ""}£${Math.abs(Math.round(n)).toLocaleString(locale === "es" ? "es-ES" : "en-GB")}`,
    [locale],
  );

  const view = useMemo(() => {
    if (!result || result.status !== "complete" || !ff) return null;
    const plan = result as CompletePlan;
    const f = plan.findings;
    const names = Object.keys(f.scenarios) as PlanScenario[];
    const label = (n: PlanScenario) => t(`scenario_${n}`);
    const outcome = (age: number | null, end: number) => (age !== null ? t("runsOut", { age }) : t("lastsTo", { age: end }));
    const endAge = ff.plan_to_age ?? FP_DEFAULTS.plan_to_age;
    const endOf = (n: PlanScenario) => (n === "live_to_100" ? 100 : endAge);

    // The MCP tool's charts, with this page's language.
    const specs = financialPlanCharts(
      plan.projections,
      Object.fromEntries(names.map((n) => [n, label(n)])),
      endAge,
      Object.fromEntries(names.map((n) => [n, f.scenarios[n].money_runs_out_at_age])),
      Object.fromEntries(names.map((n) => [n, t(`short_${n}`)])),
    );
    const [money1, income, lasts] = specs;
    const localised: ChartSpec[] = [
      { ...money1, title: t("chartMoneyTitle"), subtitle: t("chartMoneySub"), x: { ...money1.x, title: t("axisAge") }, refLines: [{ value: 0, label: t("refRunsOut") }], note: "financeplots.com" },
      {
        ...income,
        title: t("chartIncomeTitle"),
        subtitle: t("chartIncomeSub"),
        x: { ...income.x, title: t("axisAge") },
        series: income.series.map((s, i) => ({ ...s, name: i === 0 ? t("seriesIncome") : t("seriesOut") })),
        note: "financeplots.com",
      },
      {
        ...lasts,
        title: t("chartLastsTitle"),
        subtitle: t("chartLastsSub"),
        series: lasts.series.map((s) => ({ ...s, name: t("seriesLasts") })),
        refLines: [{ value: endAge, label: t("refPlanAge") }],
        note: "financeplots.com",
      },
    ];

    const flags: string[] = [];
    if (f.cashflow_today.surplus_or_gap < 0) flags.push(t("flagGap", { amount: money(-f.cashflow_today.surplus_or_gap) }));
    const neg = (plan.projections.base.find((r) => r.phase === "working" && r.savings < 0) ?? null)?.age;
    if (neg !== undefined) flags.push(t("flagCashNegative", { age: neg }));
    if (f.milestones.retire_age < f.milestones.earliest_pension_access_age) flags.push(t("flagEarlyRetire", { age: f.milestones.earliest_pension_access_age }));
    if ((ff.ni_qualifying_years ?? FP_DEFAULTS.ni_qualifying_years) < 35) flags.push(t("flagNi"));

    const passed = names.filter((n) => f.scenarios[n].money_runs_out_at_age === null).length;
    const leverRows = Object.entries(f.levers).map(([k, v]) => ({
      name: t(`lever_${k}`),
      outcome: outcome(v.money_runs_out_at_age, v.end_age),
      change: v.liquid_at_end_change,
    }));
    const pctKeys = new Set(["return_pct", "fee_pct", "inflation_pct", "pay_growth_pct", "employee_pension_pct", "employer_pension_pct"]);
    const assumptions = plan.assumptions.map((a) => ({
      name: t(`a_${a.name}`),
      value: `${a.value}${pctKeys.has(a.name) ? "%" : ""}${a.given_by_user ? ` (${t("yours")})` : ""}`,
      reason: t(`r_${a.name}`),
    }));
    const m = f.milestones;
    const milestones: [string, string][] = [
      [t("retireAge"), String(m.retire_age)],
      [t("statePensionAge"), String(m.state_pension_age)],
      [t("bridgeYears"), String(m.bridge_years_before_state_pension)],
      [t("earliestAccess"), String(m.earliest_pension_access_age)],
      [t("mortgagePaid"), m.mortgage_paid_off_age === null ? t("none") : String(m.mortgage_paid_off_age)],
      [t("taxFreeCash"), money(m.tax_free_cash)],
      ...(m.inheritance ? [[t("inheritance"), t("inheritanceAt", { amount: money(m.inheritance.amount), age: m.inheritance.at_age })] as [string, string]] : []),
      ...(m.other_property
        ? [[t("otherProperty"), m.other_property.sold_at_age ? t("propertySold", { value: money(m.other_property.value), age: m.other_property.sold_at_age }) : t("propertyKept", { value: money(m.other_property.value), rent: money(m.other_property.rent_per_year) })] as [string, string]]
        : []),
      ...(m.other_income ? [[t("otherIncome"), t("otherIncomeUntil", { amount: money(m.other_income.per_year), age: m.other_income.until_age })] as [string, string]] : []),
    ];
    const scenarios = names.map((n) => ({ name: label(n), outcome: outcome(f.scenarios[n].money_runs_out_at_age, endOf(n)), atEnd: money(f.scenarios[n].liquid_at_end) }));
    return { f, specs: localised, flags, passed, total: names.length, leverRows, assumptions, milestones, scenarios };
  }, [result, ff, t, money]);

  const downloadPdf = useCallback(async () => {
    if (!view) return;
    setExporting(true);
    try {
      const [{ pdf }, { default: PlanPDF }, images] = await Promise.all([import("@react-pdf/renderer"), import("@/app/[locale]/plan/pdf"), Promise.all(view.specs.map(chartPng))]);
      const c = view.f.cashflow_today;
      const blob = await pdf(
        <PlanPDF
          s={{
            title: t("pdfTitle"),
            generated: t("generated", { date: new Date().toLocaleDateString(locale === "es" ? "es-ES" : "en-GB", { day: "numeric", month: "long", year: "numeric" }) }),
            secSituation: t("secSituation"),
            secFlags: t("secFlags"),
            secMilestones: t("secMilestones"),
            secStress: t("secStress"),
            secLevers: t("secLevers"),
            secCharts: t("secCharts"),
            secAssumptions: t("secAssumptions"),
            secGaps: t("secGaps"),
            secImportant: t("secImportant"),
            colTest: t("colTest"),
            colOutcome: t("colOutcome"),
            colAtEnd: t("colAtEnd"),
            colLever: t("colLever"),
            colWith: t("colWith"),
            colChange: t("colChange"),
            colAssumption: t("colAssumption"),
            colValue: t("colValue"),
            colReason: t("colReason"),
            noFlags: t("noFlags"),
            leversNote: t("leversNote"),
            resilience: t("resilience", { passed: view.passed, total: view.total }),
            gapsBody: t("gapsBody"),
            footer: t("footer"),
          }}
          kpis={[
            [t("netIncome"), money(c.net_income)],
            [t("spending"), money(c.spending)],
            [t("housing"), money(c.housing)],
            [c.surplus_or_gap < 0 ? t("gap") : t("surplus"), money(Math.abs(c.surplus_or_gap))],
          ]}
          flags={view.flags}
          milestones={view.milestones}
          scenarios={view.scenarios}
          levers={view.leverRows.map((l) => ({ ...l, change: `${l.change >= 0 ? "+" : "−"}${money(Math.abs(l.change))}` }))}
          assumptions={view.assumptions}
          charts={images}
        />,
      ).toBlob();
      const url = URL.createObjectURL(blob);
      const a = document.createElement("a");
      a.href = url;
      a.download = locale === "es" ? "plan-financiero.pdf" : "financial-plan.pdf";
      a.click();
      trackEvent("export", { format: "pdf" });
      URL.revokeObjectURL(url);
    } finally {
      setExporting(false);
    }
  }, [view, t, locale, money]);

  const card = "bg-[#0d1426] border border-white/10 rounded-xl p-5";
  const h2 = "text-blue-400 text-xs font-bold uppercase tracking-widest mb-3";

  if (!ff) {
    return (
      <div className={`${card} max-w-xl mx-auto text-center`}>
        <h2 className="text-xl font-bold mb-2">{t("noPlanTitle")}</h2>
        <p className="text-gray-400 text-sm mb-4">{t("noPlanBody")}</p>
        <Link href="/mcp" className="text-blue-400 hover:text-blue-300 text-sm font-semibold">{t("noPlanLink")} →</Link>
      </div>
    );
  }
  if (!view || !result || result.status === "needs_more_information") {
    const missing = result && result.status === "needs_more_information" ? result.still_missing : [];
    return (
      <div className={`${card} max-w-xl mx-auto`}>
        <h2 className="text-xl font-bold mb-2">{t("incompleteTitle")}</h2>
        <p className="text-gray-400 text-sm mb-3">{t("incompleteBody")}</p>
        <ul className="list-disc pl-5 text-sm text-gray-300">{missing.map((m) => <li key={m}>{m}</li>)}</ul>
      </div>
    );
  }

  const c = view.f.cashflow_today;
  const kpis: [string, string][] = [
    [t("netIncome"), money(c.net_income)],
    [t("spending"), money(c.spending)],
    [t("housing"), money(c.housing)],
    [c.surplus_or_gap < 0 ? t("gap") : t("surplus"), money(Math.abs(c.surplus_or_gap))],
  ];

  return (
    <div className="space-y-6">
      <div className="flex justify-end">
        <button onClick={downloadPdf} disabled={exporting} className="px-4 py-2 rounded-lg bg-blue-600 hover:bg-blue-500 disabled:opacity-50 text-sm font-semibold">
          {exporting ? t("generating") : t("downloadPdf")}
        </button>
      </div>

      <section className={card}>
        <h2 className={h2}>{t("secSituation")}</h2>
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
          {kpis.map(([k, v]) => (
            <div key={k} className="bg-white/5 rounded-lg p-3">
              <div className="text-[11px] text-gray-400 uppercase">{k}</div>
              <div className="text-lg font-bold">{v}</div>
            </div>
          ))}
        </div>
        <h3 className="text-sm font-semibold mt-5 mb-2">{t("secFlags")}</h3>
        {view.flags.length ? <ul className="list-disc pl-5 text-sm text-gray-300 space-y-1">{view.flags.map((x) => <li key={x}>{x}</li>)}</ul> : <p className="text-sm text-gray-400">{t("noFlags")}</p>}
      </section>

      <section className={card}>
        <h2 className={h2}>{t("secMilestones")}</h2>
        <dl className="grid grid-cols-2 sm:grid-cols-3 gap-3 text-sm">
          {view.milestones.map(([k, v]) => (
            <div key={k}><dt className="text-gray-400 text-xs">{k}</dt><dd className="font-semibold">{v}</dd></div>
          ))}
        </dl>
      </section>

      <section className={card}>
        <h2 className={h2}>{t("secStress")}</h2>
        <p className="text-sm text-gray-300 mb-3">{t("resilience", { passed: view.passed, total: view.total })}</p>
        <table className="w-full text-sm">
          <thead><tr className="text-left text-gray-400 text-xs"><th className="py-1">{t("colTest")}</th><th>{t("colOutcome")}</th><th className="text-right">{t("colAtEnd")}</th></tr></thead>
          <tbody>{view.scenarios.map((s) => <tr key={s.name} className="border-t border-white/5"><td className="py-2">{s.name}</td><td>{s.outcome}</td><td className="text-right">{s.atEnd}</td></tr>)}</tbody>
        </table>
      </section>

      <section className={card}>
        <h2 className={h2}>{t("secLevers")}</h2>
        <p className="text-xs text-gray-400 mb-3">{t("leversNote")}</p>
        <table className="w-full text-sm">
          <thead><tr className="text-left text-gray-400 text-xs"><th className="py-1">{t("colLever")}</th><th>{t("colWith")}</th><th className="text-right">{t("colChange")}</th></tr></thead>
          <tbody>
            {view.leverRows.map((l) => (
              <tr key={l.name} className="border-t border-white/5">
                <td className="py-2">{l.name}</td>
                <td>{l.outcome}</td>
                <td className="text-right">{l.change >= 0 ? "▲" : "▼"} {money(Math.abs(l.change))}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </section>

      <section className={card}>
        <h2 className={h2}>{t("secCharts")}</h2>
        <div className="space-y-6">
          {view.specs.map((s) => (
            <div key={s.title} className="[&>svg]:w-full [&>svg]:h-auto rounded-lg overflow-hidden" dangerouslySetInnerHTML={{ __html: chartSvg(s, THEMES.dark) }} />
          ))}
        </div>
      </section>

      <section className={card}>
        <h2 className={h2}>{t("secAssumptions")}</h2>
        <table className="w-full text-sm">
          <thead><tr className="text-left text-gray-400 text-xs"><th className="py-1">{t("colAssumption")}</th><th>{t("colValue")}</th><th>{t("colReason")}</th></tr></thead>
          <tbody>{view.assumptions.map((a) => <tr key={a.name} className="border-t border-white/5 align-top"><td className="py-2 pr-3">{a.name}</td><td className="pr-3 whitespace-nowrap">{a.value}</td><td className="text-gray-400">{a.reason}</td></tr>)}</tbody>
        </table>
      </section>

      <section className={card}>
        <h2 className={h2}>{t("secGaps")}</h2>
        <p className="text-sm text-gray-300">{t("gapsBody")}</p>
      </section>

      <section className="border border-amber-500/30 bg-amber-500/5 rounded-xl p-5">
        <h2 className="text-amber-400 text-xs font-bold uppercase tracking-widest mb-2">{t("secImportant")}</h2>
        <p className="text-sm text-gray-300">{t("footer")}</p>
        <p className="text-xs text-gray-500 mt-3">{t("privacy")}</p>
      </section>
    </div>
  );
}
