"use client";

import { Fragment, useEffect, useMemo, useState, type ReactNode } from "react";
import Link from "next/link";
import { useLocale, useTranslations } from "next-intl";
import { CartesianGrid, Legend, Line, LineChart, ReferenceLine, ResponsiveContainer, Tooltip, XAxis, YAxis } from "recharts";
import CurrencyPicker, { useCurrency } from "@/components/CurrencyPicker";
import { trackEvent } from "@/lib/analytics";
import {
  EVENT_KINDS,
  MAX_EVENTS,
  MAX_PLANS,
  encodeShared,
  newId,
  presetEvent,
  project,
  todaysMoney,
  type EventKind,
  type LifeEvent,
  type Milestone,
  type Plan,
  type Projection,
} from "@/lib/life-plan";

// The maths is in lib/life-plan.ts. Plans live in this page's state and in
// the share link only — nothing is stored. Colours follow the plan's
// position (A, B), never whether a line is higher.

const PLAN_COLOURS = ["#3987e5", "#d95926"];
const ICONS: Record<EventKind, string> = { home: "🏠", baby: "👶", oneOff: "💍", recurring: "🔁", income: "📈", windfall: "🎁", retire: "🌅" };
const HORIZONS = [10, 20, 30, 40, 50];

function Num({ label, value, onChange, prefix, suffix, step = 1, help, min, max }: {
  label: string; value: number; onChange: (v: number) => void; prefix?: string; suffix?: string; step?: number; help?: string; min?: number; max?: number;
}) {
  return (
    <label className="flex flex-col gap-1 text-xs text-gray-400 min-w-0">
      <span>{label}</span>
      <span className="flex items-center bg-[#111827] border border-gray-700 rounded-lg px-2.5 py-2 focus-within:border-blue-500 transition">
        {prefix && <span className="text-gray-500 mr-1 shrink-0">{prefix}</span>}
        <input
          type="number"
          inputMode="decimal"
          value={Number.isFinite(value) ? value : 0}
          step={step}
          min={min}
          max={max}
          onChange={(e) => onChange(e.target.value === "" ? 0 : parseFloat(e.target.value) || 0)}
          className="bg-transparent text-white text-sm w-full outline-none min-w-0"
        />
        {suffix && <span className="text-gray-500 ml-1 shrink-0">{suffix}</span>}
      </span>
      {help && <span className="text-[11px] text-gray-500 leading-snug">{help}</span>}
    </label>
  );
}

function Card({ title, children, help }: { title: string; children: ReactNode; help?: string }) {
  return (
    <div className="bg-[#0d1426] border border-gray-800 rounded-xl p-5">
      <h2 className="text-xs font-bold uppercase tracking-wider text-blue-400 mb-1">{title}</h2>
      {help && <p className="text-xs text-gray-500 mb-3 leading-relaxed">{help}</p>}
      {!help && <div className="mb-2" />}
      {children}
    </div>
  );
}

function Kpi({ label, value, sub }: { label: string; value: string; sub: string }) {
  return (
    <div className="bg-[#0d1426] border border-gray-800 border-l-4 border-l-blue-500 rounded-xl p-4">
      <div className="text-xs text-gray-400 uppercase tracking-wider font-semibold mb-1">{label}</div>
      <div className="text-2xl font-extrabold text-white leading-tight">{value}</div>
      <div className="text-xs text-gray-500 mt-1">{sub}</div>
    </div>
  );
}

export default function LifePlan({ initialPlans, initialHorizon, startYear }: { initialPlans: Plan[]; initialHorizon: number; startYear: number }) {
  const t = useTranslations("lifePlan");
  const locale = useLocale();
  const [currency] = useCurrency();
  const nf = (n: number, dp = 0) => n.toLocaleString(locale === "es" ? "es-ES" : "en-GB", { minimumFractionDigits: dp, maximumFractionDigits: dp });
  const money = (n: number) => `${n < 0 ? "−" : ""}${currency}${nf(Math.abs(n))}`;
  const short = (n: number) => {
    const a = Math.abs(n);
    const s = a >= 1e6 ? `${nf(a / 1e6, 1)}M` : a >= 1e3 ? `${nf(a / 1e3, 0)}k` : nf(a);
    return `${n < 0 ? "−" : ""}${currency}${s}`;
  };

  const [plans, setPlans] = useState<Plan[]>(initialPlans);
  const [active, setActive] = useState(0);
  const [horizon, setHorizon] = useState(initialHorizon);
  const [real, setReal] = useState(true);
  const [showSavings, setShowSavings] = useState(false);
  const [showTable, setShowTable] = useState(false);
  const [copied, setCopied] = useState(false);
  const plan = plans[Math.min(active, plans.length - 1)];
  const planName = (i: number) => (i === 0 ? t("planA") : t("planB"));

  const update = (patch: Partial<Plan>) => setPlans((ps) => ps.map((p, i) => (i === active ? { ...p, ...patch } : p)));
  const updateEvent = (id: string, patch: Partial<LifeEvent>) => update({ events: plan.events.map((e) => (e.id === id ? ({ ...e, ...patch } as LifeEvent) : e)) });
  const addEvent = (kind: EventKind) => {
    if (plan.events.length >= MAX_EVENTS) return;
    const lastYear = Math.max(startYear, ...plan.events.map((e) => e.year));
    update({ events: [...plan.events, presetEvent(kind, Math.min(startYear + horizon - 1, plan.events.length ? lastYear + 1 : startYear + 2))] });
  };
  const addPlanB = () => {
    if (plans.length >= MAX_PLANS) return;
    setPlans((ps) => [...ps, { ...ps[0], events: ps[0].events.map((e) => ({ ...e, id: newId() })) }]);
    setActive(1);
  };
  const removePlanB = () => {
    setPlans((ps) => ps.slice(0, 1));
    setActive(0);
  };

  const projections: Projection[] = useMemo(() => plans.map((p) => project(p, startYear, horizon)), [plans, startYear, horizon]);
  const proj = projections[Math.min(active, projections.length - 1)];
  const lastYear = startYear + horizon - 1;
  const show = (p: Plan, n: number, year: number) => (real ? n / todaysMoney(p, startYear, year) : n);

  // ── Chart rows: "now" then each year-end ──────────────────────────────────
  const chartRows = useMemo(() => {
    const out: Record<string, number | string>[] = [{ label: t("now"), year: startYear - 1 }];
    plans.forEach((p, k) => {
      out[0][`nw${k}`] = projections[k].start.netWorth;
      out[0][`sv${k}`] = projections[k].start.savings;
    });
    for (let i = 0; i < horizon; i++) {
      const year = startYear + i;
      const row: Record<string, number | string> = { label: String(year), year };
      plans.forEach((p, k) => {
        const r = projections[k].rows[i];
        row[`nw${k}`] = Math.round(show(p, r.netWorth, year));
        row[`sv${k}`] = Math.round(show(p, r.savings, year));
      });
      out.push(row);
    }
    return out;
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [plans, projections, horizon, real, startYear, t]);

  // ── Share link, kept in the address bar ───────────────────────────────────
  const shareQuery = useMemo(() => {
    const q = new URLSearchParams({ p: encodeShared({ horizon, plans }) }).toString();
    return q.length < 12_000 ? q : null;
  }, [plans, horizon]);
  useEffect(() => {
    if (!shareQuery) return;
    const url = new URL(window.location.href);
    url.search = shareQuery;
    window.history.replaceState(null, "", url);
  }, [shareQuery]);
  async function copyLink() {
    try {
      await navigator.clipboard.writeText(window.location.href);
      setCopied(true);
      trackEvent("share_link");
      setTimeout(() => setCopied(false), 2000);
    } catch {
      // Clipboard blocked: the address bar has the same link.
    }
  }

  // ── Milestone text ────────────────────────────────────────────────────────
  const milestoneText = (p: Plan, m: Milestone): { icon: string; text: string; warn?: boolean; sub?: string } => {
    switch (m.kind) {
      case "cashOut":
        return { icon: "⚠️", text: t("m.cashOut", { year: m.year }), warn: true };
      case "depositShort":
        return {
          icon: "🏠",
          warn: true,
          text: t("m.depositShort", { year: m.year, needed: money(show(p, m.needed, m.year)), have: money(show(p, m.have, m.year)) }),
          sub: m.readyYear !== null && m.readyYear <= lastYear + 1 ? t("m.depositReady", { year: m.readyYear }) : t("m.depositNever"),
        };
      case "mortgageFree":
        return { icon: "🔑", text: t("m.mortgageFree", { year: m.year }) };
      case "debtFree":
        return { icon: "✅", text: t("m.debtFree", { year: m.year }) };
      case "independent":
        return { icon: "🌿", text: t("m.independent", { year: m.year }) };
      case "netWorth":
        return { icon: "📈", text: t("m.netWorth", { year: m.year, amount: short(m.amount) }) };
    }
  };

  const end = proj.rows[proj.rows.length - 1];
  const lowest = proj.rows.reduce((a, r) => (show(plan, r.savings, r.year) < show(plan, a.savings, a.year) ? r : a), proj.rows[0]);
  const debtFree = proj.milestones.find((m) => m.kind === "debtFree");
  const hadDebt = proj.start.mortgage + proj.start.otherDebt > 0 || proj.rows.some((r) => r.mortgage + r.otherDebt > 0);
  const compareYears = [...new Set([startYear + 4, startYear + 9, startYear + 19, lastYear].filter((y) => y <= lastYear))];
  const events = [...plan.events].sort((a, b) => a.year - b.year);

  const field = (e: LifeEvent): ReactNode => {
    const cur = currency;
    switch (e.kind) {
      case "home":
        return (
          <>
            <Num label={t("f.price")} value={e.price} prefix={cur} step={5000} onChange={(v) => updateEvent(e.id, { price: v })} />
            <Num label={t("f.depositPct")} value={e.depositPct} suffix="%" step={1} min={0} max={100} onChange={(v) => updateEvent(e.id, { depositPct: v })} />
            <Num label={t("f.costs")} value={e.costs} prefix={cur} step={500} help={t("f.costsHelp")} onChange={(v) => updateEvent(e.id, { costs: v })} />
            <Num label={t("f.ratePct")} value={e.ratePct} suffix="%" step={0.1} onChange={(v) => updateEvent(e.id, { ratePct: v })} />
            <Num label={t("f.termYears")} value={e.termYears} step={1} min={1} max={40} onChange={(v) => updateEvent(e.id, { termYears: Math.max(1, Math.round(v)) })} />
            {plan.housing.kind === "own" && (
              <label className="col-span-2 flex items-center gap-2 text-xs text-gray-300">
                <input type="checkbox" checked={e.sellCurrent} onChange={(x) => updateEvent(e.id, { sellCurrent: x.target.checked })} />
                {t("f.sellCurrent")}
              </label>
            )}
          </>
        );
      case "baby":
        return (
          <>
            <Num label={t("f.costPerYear")} value={e.costPerYear} prefix={cur} step={500} onChange={(v) => updateEvent(e.id, { costPerYear: v })} />
            <Num label={t("f.years")} value={e.years} step={1} min={0} onChange={(v) => updateEvent(e.id, { years: Math.max(0, Math.round(v)) })} />
            <Num label={t("f.incomeDropPct")} value={e.incomeDropPct} suffix="%" step={5} min={0} max={100} onChange={(v) => updateEvent(e.id, { incomeDropPct: v })} />
          </>
        );
      case "oneOff":
      case "windfall":
        return <Num label={t("f.amount")} value={e.amount} prefix={cur} step={1000} onChange={(v) => updateEvent(e.id, { amount: v })} />;
      case "recurring":
        return (
          <>
            <Num label={t("f.amountPerYear")} value={e.amount} prefix={cur} step={500} onChange={(v) => updateEvent(e.id, { amount: v })} />
            <Num label={t("f.years")} value={e.years} step={1} min={0} help={t("f.yearsForever")} onChange={(v) => updateEvent(e.id, { years: Math.max(0, Math.round(v)) })} />
          </>
        );
      case "income":
        return (
          <>
            <Num label={t("f.changePct")} value={e.changePct} suffix="%" step={5} min={-100} help={t("f.changeHelp")} onChange={(v) => updateEvent(e.id, { changePct: Math.max(-100, v) })} />
            <Num label={t("f.years")} value={e.years} step={1} min={0} help={t("f.yearsForever")} onChange={(v) => updateEvent(e.id, { years: Math.max(0, Math.round(v)) })} />
          </>
        );
      case "retire":
        return <Num label={t("f.pension")} value={e.pension} prefix={cur} step={1000} onChange={(v) => updateEvent(e.id, { pension: v })} />;
    }
  };

  const tab = (i: number) =>
    `px-4 py-2 rounded-lg text-sm font-semibold transition border ${active === i ? "bg-white/10 text-white" : "text-gray-400 hover:text-white border-gray-700"}`;

  return (
    <div className="flex flex-col gap-6">
      {/* Plans, horizon, money basis */}
      <div className="flex flex-wrap items-center gap-3">
        <div className="flex flex-wrap items-center gap-2" role="tablist">
          {plans.map((_, i) => (
            <button key={i} type="button" role="tab" aria-selected={active === i} onClick={() => setActive(i)} className={tab(i)} style={{ borderColor: active === i ? PLAN_COLOURS[i] : undefined }}>
              <span className="inline-block w-2.5 h-2.5 rounded-full mr-2 align-middle" style={{ background: PLAN_COLOURS[i] }} />
              {planName(i)}
            </button>
          ))}
          {plans.length < MAX_PLANS ? (
            <button type="button" onClick={addPlanB} title={t("addPlanBHelp")} className="px-3 py-2 rounded-lg text-sm text-blue-300 hover:text-white border border-dashed border-gray-600 hover:border-blue-500 transition">
              {t("addPlanB")}
            </button>
          ) : (
            <button type="button" onClick={removePlanB} className="px-3 py-2 text-sm text-gray-500 hover:text-white transition">
              {t("removePlanB")}
            </button>
          )}
        </div>
        <div className="flex flex-wrap items-center gap-3 ml-auto">
          <label className="flex items-center gap-2 text-xs text-gray-400">
            {t("horizon")}
            <select value={horizon} onChange={(e) => setHorizon(Number(e.target.value))} className="bg-[#111827] border border-gray-700 rounded-lg px-2 py-1.5 text-white text-sm">
              {HORIZONS.map((h) => (
                <option key={h} value={h}>
                  {t("horizonValue", { years: h })}
                </option>
              ))}
            </select>
          </label>
          <label className="flex items-center gap-2 text-xs text-gray-300" title={t("todaysMoneyHelp")}>
            <input type="checkbox" checked={real} onChange={(e) => setReal(e.target.checked)} />
            {t("todaysMoney")}
          </label>
          <CurrencyPicker label={t("currency")} hideLabel />
        </div>
      </div>
      {plans.length > 1 && <p className="text-xs text-gray-500 -mt-3">{t("editing", { plan: planName(active) })}</p>}

      <div className="flex flex-col lg:flex-row gap-6">
        {/* Inputs for the plan being edited */}
        <aside className="lg:w-[27rem] shrink-0 flex flex-col gap-4">
          <Card title={t("sectionToday")}>
            <div className="grid grid-cols-2 gap-3">
              <Num label={t("savings")} value={plan.savings} prefix={currency} step={1000} help={t("savingsHelp")} onChange={(v) => update({ savings: v })} />
              <div className="flex flex-col gap-1">
                <Num label={t("takeHome")} value={plan.takeHome} prefix={currency} step={1000} help={t("takeHomeHelp")} onChange={(v) => update({ takeHome: Math.max(0, v) })} />
                {/* The take-home pay calculator is UK tax only. */}
                {locale !== "es" && <Link href="/tools/take-home-pay" className="text-[11px] text-blue-400 hover:text-blue-300">{t("takeHomeLink")}</Link>}
              </div>
              <div className="flex flex-col gap-1 col-span-2 sm:col-span-1">
                <Num label={t("spending")} value={plan.spending} prefix={currency} step={500} help={t("spendingHelp")} onChange={(v) => update({ spending: Math.max(0, v) })} />
                <Link href="/tools/personal-budget" className="text-[11px] text-blue-400 hover:text-blue-300">{t("spendingLink")}</Link>
              </div>
            </div>

            <div className="mt-4">
              <div className="text-xs text-gray-400 mb-1.5">{t("housing")}</div>
              <div className="flex gap-2 mb-3" role="radiogroup" aria-label={t("housing")}>
                {(["rent", "own"] as const).map((k) => (
                  <button
                    key={k}
                    type="button"
                    role="radio"
                    aria-checked={plan.housing.kind === k}
                    onClick={() =>
                      update({ housing: k === "rent" ? { kind: "rent", rentMonthly: 1_000 } : { kind: "own", value: 250_000, mortgage: 150_000, ratePct: 4, yearsLeft: 20 } })
                    }
                    className={`px-3 py-1.5 rounded-lg text-xs font-semibold border transition ${plan.housing.kind === k ? "bg-blue-600 border-blue-600 text-white" : "border-gray-700 text-gray-400 hover:text-white"}`}
                  >
                    {t(k)}
                  </button>
                ))}
              </div>
              {plan.housing.kind === "rent" ? (
                <Num label={t("rentMonthly")} value={plan.housing.rentMonthly} prefix={currency} step={50} onChange={(v) => update({ housing: { kind: "rent", rentMonthly: Math.max(0, v) } })} />
              ) : (
                <div className="grid grid-cols-2 gap-3">
                  {(() => {
                    const h = plan.housing;
                    const set = (patch: Partial<typeof h>) => update({ housing: { ...h, ...patch } });
                    return (
                      <>
                        <Num label={t("homeValue")} value={h.value} prefix={currency} step={5000} onChange={(v) => set({ value: Math.max(0, v) })} />
                        <Num label={t("mortgageLeft")} value={h.mortgage} prefix={currency} step={5000} onChange={(v) => set({ mortgage: Math.max(0, v) })} />
                        <Num label={t("rate")} value={h.ratePct} suffix="%" step={0.1} onChange={(v) => set({ ratePct: Math.max(0, v) })} />
                        <Num label={t("yearsLeft")} value={h.yearsLeft} step={1} onChange={(v) => set({ yearsLeft: Math.max(0, Math.round(v)) })} />
                      </>
                    );
                  })()}
                </div>
              )}
            </div>

            <div className="mt-4">
              <div className="text-xs text-gray-400 mb-1.5">{t("otherDebt")}</div>
              <div className="grid grid-cols-3 gap-2">
                <Num label={t("debtBalance")} value={plan.debt.balance} prefix={currency} step={500} onChange={(v) => update({ debt: { ...plan.debt, balance: Math.max(0, v) } })} />
                <Num label={t("rate")} value={plan.debt.ratePct} suffix="%" step={0.5} onChange={(v) => update({ debt: { ...plan.debt, ratePct: Math.max(0, v) } })} />
                <Num label={t("debtYears")} value={plan.debt.years} step={1} onChange={(v) => update({ debt: { ...plan.debt, years: Math.max(0, Math.round(v)) } })} />
              </div>
            </div>
          </Card>

          <Card title={t("sectionEvents")} help={t("eventsHelp")}>
            <div className="flex flex-col gap-3">
              {events.length === 0 && <p className="text-sm text-gray-500">{t("eventsEmpty")}</p>}
              {events.map((e) => (
                <div key={e.id} className="border border-gray-800 rounded-lg p-3 bg-black/20">
                  <div className="flex items-center gap-2 mb-2">
                    <span className="text-lg" aria-hidden="true">{ICONS[e.kind]}</span>
                    <input
                      value={e.label ?? ""}
                      placeholder={t(`kind.${e.kind}`)}
                      aria-label={t("nameLabel")}
                      maxLength={40}
                      onChange={(x) => updateEvent(e.id, { label: x.target.value || undefined })}
                      className="flex-1 min-w-0 bg-transparent text-white text-sm font-semibold outline-none placeholder:text-gray-300 border-b border-transparent focus:border-gray-600"
                    />
                    <input
                      type="number"
                      value={e.year}
                      min={startYear}
                      max={lastYear}
                      aria-label={t("year")}
                      onChange={(x) => updateEvent(e.id, { year: Math.round(Number(x.target.value) || startYear) })}
                      className="w-20 bg-[#111827] border border-gray-700 rounded-lg px-2 py-1 text-white text-sm"
                    />
                    <button type="button" onClick={() => update({ events: plan.events.filter((x) => x.id !== e.id) })} aria-label={t("remove")} className="w-5 text-gray-500 hover:text-white text-lg leading-none">
                      ×
                    </button>
                  </div>
                  <div className="grid grid-cols-2 gap-2">{field(e)}</div>
                </div>
              ))}
            </div>
            <div className="mt-3">
              <div className="text-[11px] text-gray-500 uppercase tracking-wider mb-1.5">{t("addEvent")}</div>
              <div className="flex flex-wrap gap-1.5">
                {EVENT_KINDS.map((k) => (
                  <button
                    key={k}
                    type="button"
                    onClick={() => addEvent(k)}
                    title={t(`kindHint.${k}`)}
                    disabled={plan.events.length >= MAX_EVENTS}
                    className="text-xs text-gray-300 hover:text-white border border-gray-700 hover:border-blue-500 rounded-full px-3 py-1.5 transition disabled:opacity-40"
                  >
                    {ICONS[k]} {t(`kind.${k}`)}
                  </button>
                ))}
              </div>
            </div>
          </Card>

          <Card title={t("sectionAssumptions")} help={t("assumptionsHelp")}>
            <div className="grid grid-cols-2 gap-3">
              <Num label={t("payGrowth")} value={plan.payGrowthPct} suffix="%" step={0.5} onChange={(v) => update({ payGrowthPct: v })} />
              <Num label={t("inflation")} value={plan.inflationPct} suffix="%" step={0.5} onChange={(v) => update({ inflationPct: v })} />
              <Num label={t("returnPct")} value={plan.returnPct} suffix="%" step={0.5} onChange={(v) => update({ returnPct: v })} />
              <Num label={t("housePrices")} value={plan.housePricePct} suffix="%" step={0.5} onChange={(v) => update({ housePricePct: v })} />
              <Num label={t("withdrawal")} value={plan.withdrawalPct} suffix="%" step={0.5} help={t("withdrawalHelp")} onChange={(v) => update({ withdrawalPct: Math.max(0, v) })} />
            </div>
          </Card>
        </aside>

        {/* Results */}
        <div className="flex-1 min-w-0 flex flex-col gap-6">
          <div className="grid grid-cols-2 xl:grid-cols-4 gap-3">
            <Kpi label={t("kpiNetWorth", { year: lastYear })} value={money(show(plan, end.netWorth, end.year))} sub={t("kpiNetWorthSub")} />
            <Kpi label={t("kpiSavings", { year: lastYear })} value={money(show(plan, end.savings, end.year))} sub={t("kpiSavingsSub")} />
            <Kpi label={t("kpiLowest")} value={money(show(plan, lowest.savings, lowest.year))} sub={t("kpiLowestSub", { year: lowest.year })} />
            <Kpi label={t("kpiDebtFree")} value={debtFree ? String(debtFree.year) : hadDebt ? "—" : "✓"} sub={debtFree ? (plans.length > 1 ? planName(active) : "") : hadDebt ? t("kpiDebtFreeNone") : t("kpiDebtFreeNoDebt")} />
          </div>

          <div className={`grid gap-4 ${plans.length > 1 ? "md:grid-cols-2" : ""}`}>
            {plans.map((p, k) => (
              <div key={k} className="bg-[#0d1426] border border-gray-800 rounded-xl p-5" style={{ borderTopColor: PLAN_COLOURS[k], borderTopWidth: plans.length > 1 ? 3 : 1 }}>
                <h2 className="text-white font-bold mb-3">
                  {t("milestonesTitle")}
                  {plans.length > 1 && <span className="text-gray-400 font-normal"> · {planName(k)}</span>}
                </h2>
                {projections[k].milestones.length === 0 ? (
                  <p className="text-sm text-gray-500">{t("milestonesEmpty")}</p>
                ) : (
                  <ul className="flex flex-col gap-2 text-sm">
                    {projections[k].milestones.map((m, j) => {
                      const x = milestoneText(p, m);
                      return (
                        <li key={j} className={`flex gap-2 ${x.warn ? "text-amber-200" : "text-gray-200"}`}>
                          <span aria-hidden="true">{x.icon}</span>
                          <span>
                            {x.text}
                            {x.sub && <span className="block text-xs text-gray-400">{x.sub}</span>}
                          </span>
                        </li>
                      );
                    })}
                  </ul>
                )}
              </div>
            ))}
          </div>

          <div className="bg-[#0d1426] border border-gray-800 rounded-xl p-6">
            <div className="flex flex-wrap items-center justify-between gap-3 mb-4">
              <h2 className="text-white font-bold">{t("chartTitle")}</h2>
              <label className="flex items-center gap-2 text-xs text-gray-400">
                <input type="checkbox" checked={showSavings} onChange={(e) => setShowSavings(e.target.checked)} />
                {t("chartSavings")}
              </label>
            </div>
            <ResponsiveContainer width="100%" height={360}>
              <LineChart data={chartRows} margin={{ top: 20, right: 20, bottom: 10, left: 10 }}>
                <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.05)" />
                <XAxis dataKey="label" stroke="#374151" tick={{ fill: "#6b7280", fontSize: 11 }} minTickGap={20} />
                <YAxis stroke="#374151" tick={{ fill: "#6b7280", fontSize: 11 }} tickFormatter={(v: number) => short(v)} width={68} />
                <Tooltip
                  contentStyle={{ backgroundColor: "#111827", border: "1px solid #1e293b", borderRadius: "8px", color: "#f1f5f9", fontSize: 12 }}
                  formatter={(v) => money(Number(v))}
                />
                <Legend wrapperStyle={{ color: "#9ca3af", fontSize: 12, paddingTop: 12 }} />
                <ReferenceLine y={0} stroke="#4b5563" />
                {/* One marker per year, so two events in the same year don't hide each other. */}
                {[...new Set(events.map((e) => e.year))].map((year) => (
                  <ReferenceLine
                    key={year}
                    x={String(year)}
                    stroke="#374151"
                    strokeDasharray="2 4"
                    label={{ value: events.filter((e) => e.year === year).map((e) => ICONS[e.kind]).join(""), position: "top", fontSize: 14 }}
                  />
                ))}
                {plans.map((_, k) => (
                  <Line key={`nw${k}`} type="monotone" dataKey={`nw${k}`} name={t("seriesNetWorth", { plan: planName(k) })} stroke={PLAN_COLOURS[k]} strokeWidth={2} dot={false} isAnimationActive={false} />
                ))}
                {showSavings &&
                  plans.map((_, k) => (
                    <Line key={`sv${k}`} type="monotone" dataKey={`sv${k}`} name={t("seriesSavings", { plan: planName(k) })} stroke={PLAN_COLOURS[k]} strokeDasharray="5 4" strokeWidth={1.5} dot={false} isAnimationActive={false} />
                  ))}
              </LineChart>
            </ResponsiveContainer>
          </div>

          {plans.length > 1 && (
            <div className="bg-[#0d1426] border border-gray-800 rounded-xl p-5 overflow-x-auto">
              <h2 className="text-white font-bold mb-3">{t("compareTitle")}</h2>
              <table className="w-full text-sm">
                <thead>
                  <tr className="text-xs text-gray-400 uppercase tracking-wider">
                    <th className="text-left py-2 pr-3 font-semibold" />
                    {compareYears.map((y) => (
                      <th key={y} className="text-right py-2 px-2 font-semibold">{t("compareIn", { year: y })}</th>
                    ))}
                  </tr>
                </thead>
                <tbody>
                  {(["netWorth", "savings"] as const).map((key) => (
                    <Fragment key={key}>
                      {plans.map((p, k) => (
                        <tr key={`${key}${k}`} className="border-t border-gray-800">
                          <td className="py-2 pr-3 text-gray-300 whitespace-nowrap">
                            <span className="inline-block w-2 h-2 rounded-full mr-2" style={{ background: PLAN_COLOURS[k] }} />
                            {t(key === "netWorth" ? "compareRowNetWorth" : "compareRowSavings")} · {planName(k)}
                          </td>
                          {compareYears.map((y) => {
                            const r = projections[k].rows[y - startYear];
                            return <td key={y} className="py-2 px-2 text-right text-white">{money(show(p, r[key], y))}</td>;
                          })}
                        </tr>
                      ))}
                      <tr key={`${key}diff`} className="text-gray-400">
                        <td className="py-1.5 pr-3 text-xs">{t("compareDiff")}</td>
                        {compareYears.map((y) => {
                          const d = show(plans[1], projections[1].rows[y - startYear][key], y) - show(plans[0], projections[0].rows[y - startYear][key], y);
                          return (
                            <td key={y} className="py-1.5 px-2 text-right text-xs">
                              {Math.round(d) === 0 ? "=" : `${d > 0 ? "▲" : "▼"} ${money(Math.abs(d))}`}
                            </td>
                          );
                        })}
                      </tr>
                    </Fragment>
                  ))}
                  {(["debtFree", "independent"] as const).map((kind) => (
                    <tr key={kind} className="border-t border-gray-800">
                      <td className="py-2 pr-3 text-gray-300">{t(kind === "debtFree" ? "compareDebtFree" : "compareIndependent")}</td>
                      <td colSpan={compareYears.length} className="py-2 px-2 text-right text-white">
                        {plans.map((_, k) => `${planName(k)}: ${projections[k].milestones.find((m) => m.kind === kind)?.year ?? t("never")}`).join("  ·  ")}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}

          <div className="bg-[#0d1426] border border-gray-800 rounded-xl p-5">
            <div className="flex items-center justify-between gap-3">
              <h2 className="text-white font-bold">
                {t("tableTitle")}
                {plans.length > 1 && <span className="text-gray-400 font-normal"> · {planName(active)}</span>}
              </h2>
              <button type="button" onClick={() => setShowTable((s) => !s)} aria-expanded={showTable} className="text-sm text-blue-300 hover:text-white">
                {showTable ? t("tableHide") : t("tableShow")}
              </button>
            </div>
            {showTable && (
              <div className="overflow-x-auto mt-3">
                <table className="w-full text-xs">
                  <thead>
                    <tr className="text-gray-400 uppercase tracking-wider border-b border-gray-700">
                      {(["year", "income", "living", "housing", "oneOffs", "netCash", "savings", "equity", "netWorth"] as const).map((c) => (
                        <th key={c} className={`py-2 px-2 font-semibold ${c === "year" ? "text-left" : "text-right"}`}>{t(`col.${c}`)}</th>
                      ))}
                    </tr>
                  </thead>
                  <tbody>
                    {proj.rows.map((r) => {
                      const v = (n: number) => money(show(plan, n, r.year));
                      return (
                        <tr key={r.year} className="border-b border-gray-800 text-gray-300">
                          <td className="py-1.5 px-2 text-white">{r.year}</td>
                          <td className="py-1.5 px-2 text-right">{v(r.income + r.inflows)}</td>
                          <td className="py-1.5 px-2 text-right">{v(r.living)}</td>
                          <td className="py-1.5 px-2 text-right">{v(r.housing + r.debtPayments)}</td>
                          <td className="py-1.5 px-2 text-right">{v(r.oneOffs)}</td>
                          <td className="py-1.5 px-2 text-right">{v(r.netCash)}</td>
                          <td className={`py-1.5 px-2 text-right ${r.savings < 0 ? "text-amber-300" : ""}`}>{v(r.savings)}</td>
                          <td className="py-1.5 px-2 text-right">{v(r.homeValue - r.mortgage)}</td>
                          <td className="py-1.5 px-2 text-right text-white">{v(r.netWorth)}</td>
                        </tr>
                      );
                    })}
                  </tbody>
                </table>
              </div>
            )}
          </div>

          {shareQuery && (
            <div className="flex flex-wrap items-center gap-3">
              <button type="button" onClick={copyLink} className="text-sm text-gray-300 hover:text-white border border-gray-700 hover:border-blue-500 rounded-lg px-4 py-2 transition">
                {copied ? `✓ ${t("linkCopied")}` : t("copyLink")}
              </button>
              <span className="text-xs text-gray-500">{t("privacy")}</span>
            </div>
          )}

          <div className="bg-[#0d1426] border border-gray-800 rounded-xl p-5 text-sm text-gray-400 leading-relaxed">
            <h2 className="text-white font-bold mb-2">{t("howTitle")}</h2>
            <ul className="list-disc pl-5 flex flex-col gap-1.5">
              {[0, 1, 2].map((i) => (
                <li key={i}>{t(`how.${i}`)}</li>
              ))}
            </ul>
          </div>
        </div>
      </div>
    </div>
  );
}
