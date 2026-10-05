// The 13-week cash flow's maths, kept out of the page so it can be tested.
//
// Cash in is split into customer receipts (revenue) and other income; cash out
// into the four ways money actually leaves a business bank account: supplier
// payment runs, payroll, taxes and direct debits. Each line is filled from a
// simple schedule (an amount, how often, and the first week it lands), then
// any week can be overwritten by hand.

export const WEEKS = 13;

export const INFLOW_LINES = ["revenue", "otherIncome"] as const;
export const OUTFLOW_LINES = ["suppliers", "payroll", "taxes", "directDebits"] as const;
export const LINES = [...INFLOW_LINES, ...OUTFLOW_LINES] as const;

export type InflowLine = (typeof INFLOW_LINES)[number];
export type OutflowLine = (typeof OUTFLOW_LINES)[number];
export type Line = (typeof LINES)[number];

/** `monthly` lands every 52/12 weeks (weeks 1, 5, 10 from week 1); `once` lands
 *  in the first week only — a quarterly VAT bill or a one-off grant. */
export const FREQUENCIES = ["weekly", "fortnightly", "monthly", "once"] as const;
export type Frequency = (typeof FREQUENCIES)[number];

export interface Schedule {
  /** Per payment, not per week. */
  amount: number;
  frequency: Frequency;
  /** 1–13. */
  firstWeek: number;
  /** % change per week, compounded from week 1 (used for revenue). */
  growthPct?: number;
}

export type Schedules = Record<Line, Schedule>;
export type Lines = Record<Line, number[]>;

/** The weeks (1-based) a schedule pays in, within the 13. */
export function paymentWeeks(frequency: Frequency, firstWeek: number): number[] {
  const first = Math.min(WEEKS, Math.max(1, Math.round(firstWeek) || 1));
  if (frequency === "once") return [first];
  const out: number[] = [];
  for (let k = 0; ; k++) {
    const w = frequency === "weekly" ? first + k
      : frequency === "fortnightly" ? first + 2 * k
      : first + Math.round((k * 52) / 12);
    if (w > WEEKS) break;
    out.push(w);
  }
  return out;
}

/** Thirteen weekly amounts from a schedule. */
export function fillWeeks(s: Schedule): number[] {
  const g = (s.growthPct ?? 0) / 100;
  const weeks = new Set(paymentWeeks(s.frequency, s.firstWeek));
  return Array.from({ length: WEEKS }, (_, i) =>
    weeks.has(i + 1) ? Math.round(Math.max(0, s.amount) * Math.pow(1 + g, i)) : 0,
  );
}

export function fillAll(schedules: Schedules): Lines {
  return Object.fromEntries(LINES.map((l) => [l, fillWeeks(schedules[l])])) as Lines;
}

export interface WeekRow {
  week: number;
  opening: number;
  lines: Record<Line, number>;
  inflows: number;
  outflows: number;
  net: number;
  closing: number;
}

const sum = (xs: number[]) => xs.reduce((a, b) => a + b, 0);

export function forecast(opening: number, lines: Lines): WeekRow[] {
  let balance = opening;
  return Array.from({ length: WEEKS }, (_, i) => {
    const week = Object.fromEntries(LINES.map((l) => [l, lines[l]?.[i] ?? 0])) as Record<Line, number>;
    const inflows = sum(INFLOW_LINES.map((l) => week[l]));
    const outflows = sum(OUTFLOW_LINES.map((l) => week[l]));
    const start = balance;
    balance += inflows - outflows;
    return { week: i + 1, opening: start, lines: week, inflows, outflows, net: inflows - outflows, closing: balance };
  });
}

export interface Summary {
  totals: Record<Line, number>;
  totalIn: number;
  totalOut: number;
  closing: number;
  /** Lowest closing balance, and the first week it happens. */
  lowest: number;
  lowestWeek: number;
  weeksNegative: number;
}

export function summarise(opening: number, rows: WeekRow[]): Summary {
  const totals = Object.fromEntries(LINES.map((l) => [l, sum(rows.map((r) => r.lines[l]))])) as Record<Line, number>;
  let lowest = Infinity;
  let lowestWeek = 1;
  for (const r of rows) if (r.closing < lowest) { lowest = r.closing; lowestWeek = r.week; }
  return {
    totals,
    totalIn: sum(INFLOW_LINES.map((l) => totals[l])),
    totalOut: sum(OUTFLOW_LINES.map((l) => totals[l])),
    closing: rows.length ? rows[rows.length - 1].closing : opening,
    lowest: rows.length ? lowest : opening,
    lowestWeek,
    weeksNegative: rows.filter((r) => r.closing < 0).length,
  };
}

/** A starting point that shows why a weekly forecast matters: steady receipts,
 *  lumpy payments (payroll and a quarterly tax bill land in the same month). */
export const DEFAULT_SCHEDULES: Schedules = {
  revenue: { amount: 19000, frequency: "weekly", firstWeek: 1, growthPct: 0 },
  otherIncome: { amount: 2000, frequency: "monthly", firstWeek: 4 },
  suppliers: { amount: 16000, frequency: "fortnightly", firstWeek: 2 },
  payroll: { amount: 30000, frequency: "monthly", firstWeek: 4 },
  taxes: { amount: 18000, frequency: "once", firstWeek: 7 },
  directDebits: { amount: 4000, frequency: "monthly", firstWeek: 1 },
};
