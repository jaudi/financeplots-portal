// Maths for Life Plan (/tools/life-plan): a household's cash, home and debts
// projected year by year, with life events on a timeline (a home, a baby, a
// career break, retirement…), up to two plans side by side, and the dates that
// matter (deposit ready, mortgage paid off, money running out). Pure functions,
// no React, tested in tests/life-plan.test.ts.
//
// Conventions: every amount the visitor types is in today's money and grows
// with inflation (house prices with their own rate) to the year it happens.
// Rows are end-of-year positions; a year's flows all land in that year.
// Everything is an assumption the visitor sets — nothing here is a forecast.

import { monthlyPayment } from "@/lib/calculators";
import { parseAmount } from "@/lib/investment-return";

export type Housing =
  | { kind: "rent"; rentMonthly: number }
  | { kind: "own"; value: number; mortgage: number; ratePct: number; yearsLeft: number };

interface EventBase {
  id: string;
  /** Calendar year the event starts. */
  year: number;
  /** The visitor's own name for it, e.g. "Wedding". */
  label?: string;
}

export type LifeEvent =
  | (EventBase & { kind: "home"; price: number; depositPct: number; costs: number; ratePct: number; termYears: number; sellCurrent: boolean })
  | (EventBase & { kind: "baby"; costPerYear: number; years: number; incomeDropPct: number })
  | (EventBase & { kind: "oneOff"; amount: number })
  | (EventBase & { kind: "recurring"; amount: number; years: number })
  /** Take-home pay changes by `changePct` for `years` (0 = from then on): +20 a promotion, −40 part-time, −100 a career break. */
  | (EventBase & { kind: "income"; changePct: number; years: number })
  | (EventBase & { kind: "windfall"; amount: number })
  /** Pay stops; `pension` a year (today's money) replaces it. */
  | (EventBase & { kind: "retire"; pension: number });

export type EventKind = LifeEvent["kind"];
export const EVENT_KINDS: EventKind[] = ["home", "baby", "oneOff", "recurring", "income", "windfall", "retire"];

export interface Plan {
  /** Savings and investments today (not the home, not pensions). */
  savings: number;
  /** Household take-home pay per year, today. */
  takeHome: number;
  /** Living costs per year, excluding rent or mortgage. */
  spending: number;
  housing: Housing;
  /** Other debts today (loans, cards), repaid in equal payments. */
  debt: { balance: number; ratePct: number; years: number };
  payGrowthPct: number;
  inflationPct: number;
  returnPct: number;
  housePricePct: number;
  /** For the financial-independence date: the share of savings drawn each year. */
  withdrawalPct: number;
  events: LifeEvent[];
}

export interface YearRow {
  year: number;
  income: number;
  /** Living costs, childcare and recurring costs. */
  living: number;
  /** Rent, or mortgage payments. */
  housing: number;
  debtPayments: number;
  /** Deposits, buying costs and one-off costs. */
  oneOffs: number;
  /** Windfalls and the proceeds of a home sold. */
  inflows: number;
  netCash: number;
  savings: number;
  homeValue: number;
  mortgage: number;
  otherDebt: number;
  netWorth: number;
}

export type Milestone =
  | { kind: "cashOut"; year: number }
  | { kind: "depositShort"; year: number; eventId: string; needed: number; have: number; readyYear: number | null }
  | { kind: "mortgageFree"; year: number }
  | { kind: "debtFree"; year: number }
  | { kind: "independent"; year: number }
  | { kind: "netWorth"; year: number; amount: number };

export interface Projection {
  start: { year: number; savings: number; homeValue: number; mortgage: number; otherDebt: number; netWorth: number };
  rows: YearRow[];
  milestones: Milestone[];
}

/** Net-worth marks reported as milestones, in today's money. */
export const NET_WORTH_MARKS = [100_000, 250_000, 500_000, 1_000_000];

interface Loan {
  balance: number;
  /** Monthly rate, fraction. */
  r: number;
  payment: number;
}

// A balance with no term left is still owed: it is repaid within the year
// rather than dropped from the figures.
const loan = (balance: number, ratePct: number, years: number): Loan | null =>
  balance > 0 ? { balance, r: ratePct / 100 / 12, payment: monthlyPayment(ratePct / 100, Math.max(1, years), balance) } : null;

/** Twelve monthly payments; returns what was paid this year. */
function payYear(l: Loan): number {
  let paid = 0;
  for (let m = 0; m < 12 && l.balance > 1e-6; m++) {
    const due = Math.min(l.payment, l.balance * (1 + l.r));
    l.balance = l.balance * (1 + l.r) - due;
    paid += due;
  }
  if (l.balance < 0.005) l.balance = 0;
  return paid;
}

const activeIn = (e: { year: number; years: number }, y: number) => y >= e.year && (e.years === 0 || y < e.year + e.years);

/**
 * The plan year by year, from `startYear` for `horizon` years. Rows are
 * nominal (each year's own money); divide by `todaysMoney()` to compare.
 */
export function project(plan: Plan, startYear: number, horizon: number): Projection {
  const g = plan.payGrowthPct / 100;
  const inf = plan.inflationPct / 100;
  const ret = plan.returnPct / 100;
  const hp = plan.housePricePct / 100;
  const events = [...plan.events].sort((a, b) => a.year - b.year);

  let savings = plan.savings;
  // `bought`: the year a home was bought here; it starts growing the year after.
  const homes: { value: number; loan: Loan | null; current: boolean; bought: number }[] = [];
  if (plan.housing.kind === "own") {
    homes.push({ value: plan.housing.value, loan: loan(plan.housing.mortgage, plan.housing.ratePct, plan.housing.yearsLeft), current: true, bought: -Infinity });
  }
  let renting = plan.housing.kind === "rent";
  const other = loan(plan.debt.balance, plan.debt.ratePct, plan.debt.years);
  const retireYear = events.find((e) => e.kind === "retire")?.year ?? Infinity;

  const position = () => {
    const homeValue = homes.reduce((s, h) => s + h.value, 0);
    const mortgage = homes.reduce((s, h) => s + (h.loan?.balance ?? 0), 0);
    const otherDebt = other?.balance ?? 0;
    return { homeValue, mortgage, otherDebt, netWorth: savings + homeValue - mortgage - otherDebt };
  };
  const start = { year: startYear, savings, ...position() };

  const rows: YearRow[] = [];
  for (let i = 0; i < horizon; i++) {
    const y = startYear + i;
    const prices = (1 + inf) ** i;

    // Income: pay grown and changed by any income events; a pension once retired.
    let income: number;
    const retire = events.find((e) => e.kind === "retire" && e.year <= y);
    if (retire && retire.kind === "retire") income = retire.pension * prices;
    else {
      income = plan.takeHome * (1 + g) ** i;
      for (const e of events) {
        if (e.kind === "income" && activeIn(e, y)) income *= Math.max(0, 1 + e.changePct / 100);
        if (e.kind === "baby" && e.year === y && y < retireYear) income *= Math.max(0, 1 - e.incomeDropPct / 100);
      }
    }

    let living = plan.spending * prices;
    let oneOffs = 0;
    let inflows = 0;
    for (const e of events) {
      if (e.kind === "baby" && activeIn(e, y)) living += e.costPerYear * prices;
      if (e.kind === "recurring" && activeIn(e, y)) living += e.amount * prices;
      if (e.kind === "oneOff" && e.year === y) oneOffs += e.amount * prices;
      if (e.kind === "windfall" && e.year === y) inflows += e.amount * prices;
      if (e.kind === "home" && e.year === y) {
        if (e.sellCurrent) {
          const current = homes.findIndex((h) => h.current);
          if (current >= 0) {
            const [sold] = homes.splice(current, 1);
            inflows += sold.value - (sold.loan?.balance ?? 0);
          }
        }
        const price = e.price * (1 + hp) ** i;
        const deposit = price * Math.min(100, Math.max(0, e.depositPct)) / 100;
        oneOffs += deposit + e.costs * prices;
        for (const h of homes) h.current = false;
        homes.push({ value: price, loan: loan(price - deposit, e.ratePct, e.termYears), current: true, bought: y });
        renting = false;
      }
    }

    let housing = renting && plan.housing.kind === "rent" ? plan.housing.rentMonthly * 12 * prices : 0;
    for (const h of homes) if (h.loan) housing += payYear(h.loan);
    const debtPayments = other ? payYear(other) : 0;

    const netCash = income + inflows - living - housing - debtPayments - oneOffs;
    savings = (savings > 0 ? savings * (1 + ret) : savings) + netCash;
    for (const h of homes) if (h.bought < y) h.value *= 1 + hp;

    rows.push({ year: y, income, living, housing, debtPayments, oneOffs, inflows, netCash, savings, ...position() });
  }

  return { start, rows, milestones: milestones(plan, startYear, horizon, start, rows) };
}

/** Divide a nominal amount in `year` by this to state it in today's money. */
export const todaysMoney = (plan: Pick<Plan, "inflationPct">, startYear: number, year: number) => (1 + plan.inflationPct / 100) ** (year - startYear);

function milestones(plan: Plan, startYear: number, horizon: number, start: Projection["start"], rows: YearRow[]): Milestone[] {
  const out: Milestone[] = [];
  const first = (test: (r: YearRow) => boolean) => rows.find(test)?.year ?? null;

  const cashOut = first((r) => r.savings < 0);
  if (cashOut !== null) out.push({ kind: "cashOut", year: cashOut });

  // Each home: is the deposit there when it's bought? If not, when would it be?
  for (const e of plan.events) {
    if (e.kind !== "home") continue;
    const i = e.year - startYear;
    if (i < 0 || i >= horizon) continue;
    const prices = (1 + plan.inflationPct / 100) ** i;
    const price = e.price * (1 + plan.housePricePct / 100) ** i;
    const needed = (price * e.depositPct) / 100 + e.costs * prices;
    const before = i === 0 ? start.savings : rows[i - 1].savings;
    // Selling the current home first counts towards the deposit.
    const sale = e.sellCurrent ? Math.max(0, (i === 0 ? start.homeValue - start.mortgage : rows[i - 1].homeValue - rows[i - 1].mortgage)) : 0;
    if (before + sale + 1e-6 < needed) {
      const without = project({ ...plan, events: plan.events.filter((x) => x.id !== e.id) }, startYear, horizon);
      const ready = without.rows.find((r) => {
        // Saved by the end of r.year, so bought in r.year + 1, at that year's prices.
        const j = r.year + 1 - startYear;
        const p = (1 + plan.inflationPct / 100) ** j;
        const need = (e.price * (1 + plan.housePricePct / 100) ** j * e.depositPct) / 100 + e.costs * p;
        return r.savings >= need;
      });
      out.push({ kind: "depositShort", year: e.year, eventId: e.id, needed, have: before + sale, readyYear: ready ? ready.year + 1 : null });
    }
  }

  // The first year-end with no mortgage (or no debt at all) after the last one with some.
  const clearedAfter = (owed: (r: { mortgage: number; otherDebt: number }) => number, kind: "mortgageFree" | "debtFree") => {
    const withDebt = rows.filter((r) => owed(r) > 0);
    if (owed(start) === 0 && withDebt.length === 0) return;
    const last = withDebt.at(-1);
    const free = last ? rows.find((r) => r.year > last.year) : rows[0];
    if (free) out.push({ kind, year: free.year });
  };
  clearedAfter((r) => r.mortgage, "mortgageFree");
  clearedAfter((r) => r.mortgage + r.otherDebt, "debtFree");

  // Financial independence: savings that would pay this year's costs at the withdrawal rate.
  if (plan.withdrawalPct > 0) {
    const fi = first((r) => r.savings * (plan.withdrawalPct / 100) >= r.living + r.housing + r.debtPayments && r.savings > 0);
    if (fi !== null) out.push({ kind: "independent", year: fi });
  }

  for (const mark of NET_WORTH_MARKS) {
    if (start.netWorth >= mark) continue;
    const y = first((r) => r.netWorth / todaysMoney(plan, startYear, r.year) >= mark);
    if (y !== null) out.push({ kind: "netWorth", year: y, amount: mark });
  }
  return out.sort((a, b) => a.year - b.year);
}

/**
 * A number as someone types it into a box: "400,000", "400.000" (Spanish
 * thousands), "£400k", "1.2m", "4,5" (Spanish decimal), "−3". Null while it
 * isn't a number yet. `decimal` is the visitor's decimal mark.
 */
export function parseTyped(raw: string, decimal: "." | "," = "."): number | null {
  const s = raw.trim().toLowerCase().replace(/%$/, "").trim();
  const m = /^(.*?)\s*([km])$/.exec(s);
  const n = parseAmount(m ? m[1] : s, decimal);
  if (n === null) return null;
  return m ? n * (m[2] === "k" ? 1_000 : 1_000_000) : n;
}

// ── Defaults, presets and the share link ────────────────────────────────────

export const DEFAULT_ASSUMPTIONS = { payGrowthPct: 3, inflationPct: 2.5, returnPct: 4, housePricePct: 3, withdrawalPct: 4 };

let counter = 0;
export const newId = () => `e${Date.now().toString(36)}${(counter++).toString(36)}`;

/** A new event of `kind` in `year`, with values a visitor can start from. */
export function presetEvent(kind: EventKind, year: number): LifeEvent {
  const id = newId();
  switch (kind) {
    case "home":
      return { id, kind, year, price: 300_000, depositPct: 10, costs: 8_000, ratePct: 4.5, termYears: 25, sellCurrent: false };
    case "baby":
      return { id, kind, year, costPerYear: 9_000, years: 4, incomeDropPct: 30 };
    case "oneOff":
      return { id, kind, year, amount: 15_000 };
    case "recurring":
      return { id, kind, year, amount: 3_000, years: 5 };
    case "income":
      return { id, kind, year, changePct: 15, years: 0 };
    case "windfall":
      return { id, kind, year, amount: 20_000 };
    case "retire":
      return { id, kind, year, pension: 18_000 };
  }
}

/** The plan the page opens with when the link carries none: amounts only. */
export function examplePlan(startYear: number): Plan {
  return {
    savings: 15_000,
    takeHome: 42_000,
    spending: 16_000,
    housing: { kind: "rent", rentMonthly: 1_100 },
    debt: { balance: 0, ratePct: 7, years: 5 },
    ...DEFAULT_ASSUMPTIONS,
    events: [presetEvent("home", startYear + 3), presetEvent("baby", startYear + 5)],
  };
}

export const MAX_PLANS = 2;
export const MAX_EVENTS = 30;
export const MAX_HORIZON = 50;

const num = (x: unknown, min: number, max: number, fallback: number) => {
  const n = typeof x === "number" ? x : Number(x);
  return Number.isFinite(n) ? Math.min(max, Math.max(min, n)) : fallback;
};
const str = (x: unknown, max = 40) => (typeof x === "string" ? x.slice(0, max) : undefined);
const MONEY = 1e9;

function cleanEvent(x: unknown, startYear: number): LifeEvent | null {
  if (!x || typeof x !== "object") return null;
  const e = x as Record<string, unknown>;
  const kind = e.kind as EventKind;
  if (!EVENT_KINDS.includes(kind)) return null;
  const base = { ...presetEvent(kind, startYear), year: Math.round(num(e.year, startYear, startYear + MAX_HORIZON, startYear)), label: str(e.label) };
  switch (base.kind) {
    case "home":
      return {
        ...base,
        price: num(e.price, 0, MONEY, base.price),
        depositPct: num(e.depositPct, 0, 100, base.depositPct),
        costs: num(e.costs, 0, MONEY, base.costs),
        ratePct: num(e.ratePct, 0, 30, base.ratePct),
        termYears: Math.round(num(e.termYears, 1, 40, base.termYears)),
        sellCurrent: e.sellCurrent === true,
      };
    case "baby":
      return { ...base, costPerYear: num(e.costPerYear, 0, MONEY, base.costPerYear), years: Math.round(num(e.years, 0, 30, base.years)), incomeDropPct: num(e.incomeDropPct, 0, 100, base.incomeDropPct) };
    case "oneOff":
    case "windfall":
      return { ...base, amount: num(e.amount, 0, MONEY, base.amount) };
    case "recurring":
      return { ...base, amount: num(e.amount, 0, MONEY, base.amount), years: Math.round(num(e.years, 0, 50, base.years)) };
    case "income":
      return { ...base, changePct: num(e.changePct, -100, 500, base.changePct), years: Math.round(num(e.years, 0, 50, base.years)) };
    case "retire":
      return { ...base, pension: num(e.pension, 0, MONEY, base.pension) };
  }
}

/** Anything decoded from a link, made safe: unknown fields dropped, numbers clamped. Null if it isn't a plan. */
export function cleanPlan(x: unknown, startYear: number): Plan | null {
  if (!x || typeof x !== "object") return null;
  const p = x as Record<string, unknown>;
  const h = (p.housing ?? {}) as Record<string, unknown>;
  const d = (p.debt ?? {}) as Record<string, unknown>;
  const housing: Housing =
    h.kind === "own"
      ? { kind: "own", value: num(h.value, 0, MONEY, 0), mortgage: num(h.mortgage, 0, MONEY, 0), ratePct: num(h.ratePct, 0, 30, 4), yearsLeft: Math.round(num(h.yearsLeft, 0, 40, 0)) }
      : { kind: "rent", rentMonthly: num(h.rentMonthly, 0, MONEY, 0) };
  return {
    savings: num(p.savings, -MONEY, MONEY, 0),
    takeHome: num(p.takeHome, 0, MONEY, 0),
    spending: num(p.spending, 0, MONEY, 0),
    housing,
    debt: { balance: num(d.balance, 0, MONEY, 0), ratePct: num(d.ratePct, 0, 100, 0), years: Math.round(num(d.years, 0, 40, 0)) },
    payGrowthPct: num(p.payGrowthPct, -10, 20, DEFAULT_ASSUMPTIONS.payGrowthPct),
    inflationPct: num(p.inflationPct, -5, 20, DEFAULT_ASSUMPTIONS.inflationPct),
    returnPct: num(p.returnPct, -20, 30, DEFAULT_ASSUMPTIONS.returnPct),
    housePricePct: num(p.housePricePct, -20, 30, DEFAULT_ASSUMPTIONS.housePricePct),
    withdrawalPct: num(p.withdrawalPct, 0, 20, DEFAULT_ASSUMPTIONS.withdrawalPct),
    events: (Array.isArray(p.events) ? p.events : [])
      .map((e) => cleanEvent(e, startYear))
      .filter((e): e is LifeEvent => e !== null)
      .slice(0, MAX_EVENTS),
  };
}

export interface Shared {
  horizon: number;
  plans: Plan[];
}

const toBase64Url = (s: string) => {
  const bytes = new TextEncoder().encode(s);
  let bin = "";
  for (const b of bytes) bin += String.fromCharCode(b);
  return btoa(bin).replace(/\+/g, "-").replace(/\//g, "_").replace(/=+$/, "");
};
const fromBase64Url = (s: string) => {
  const bin = atob(s.replace(/-/g, "+").replace(/_/g, "/"));
  return new TextDecoder().decode(Uint8Array.from(bin, (c) => c.charCodeAt(0)));
};

/** `?p=` for the share link: the plans, without event ids. */
export function encodeShared(s: Shared): string {
  const withoutId = (e: LifeEvent) => Object.fromEntries(Object.entries(e).filter(([k]) => k !== "id"));
  return toBase64Url(JSON.stringify({ v: 1, h: s.horizon, p: s.plans.map((p) => ({ ...p, events: p.events.map(withoutId) })) }));
}

export function decodeShared(raw: string | undefined, startYear: number): Shared | null {
  if (!raw || raw.length > 20_000) return null;
  try {
    const o = JSON.parse(fromBase64Url(raw)) as { v?: number; h?: unknown; p?: unknown };
    if (o.v !== 1 || !Array.isArray(o.p)) return null;
    const plans = o.p.map((p) => cleanPlan(p, startYear)).filter((p): p is Plan => p !== null).slice(0, MAX_PLANS);
    return plans.length ? { horizon: Math.round(num(o.h, 5, MAX_HORIZON, 30)), plans } : null;
  } catch {
    return null;
  }
}
