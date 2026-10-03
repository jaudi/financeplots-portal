// Maths for the Financial Journey (/tools/financial-planner), kept out of the
// page so it can be tested. Pure functions, no React.

export interface DebtInput {
  key: string;
  balance: number;
  /** Annual rate, percent. */
  rate: number;
  /** Years to repay, on a standard repayment (amortising) schedule. */
  term: number;
}

export interface DebtSchedule {
  /** One row per year from 0 (today): each debt's balance at that year end. */
  rows: ({ year: number } & Record<string, number>)[];
  /** Interest paid over the whole term, per debt. */
  interest: Record<string, number>;
  totalInterest: number;
  /** Years until every debt is repaid (0 when there is none). */
  debtFreeYears: number;
}

/** Fixed monthly payment that repays `balance` over `term` years at `rate`%. */
export function monthlyPayment(balance: number, rate: number, term: number) {
  const n = term * 12;
  const r = rate / 100 / 12;
  if (balance <= 0 || n <= 0) return 0;
  return r === 0 ? balance / n : (balance * r) / (1 - (1 + r) ** -n);
}

/** Each debt repaid month by month on its own schedule: balances by year and real interest cost. */
export function debtSchedule(debts: DebtInput[]): DebtSchedule {
  const live = debts.filter((d) => d.balance > 0 && d.term > 0);
  const horizon = Math.max(0, ...live.map((d) => d.term));
  const interest: Record<string, number> = {};
  const byYear: Record<string, number[]> = {};
  for (const d of live) {
    const pay = monthlyPayment(d.balance, d.rate, d.term);
    const r = d.rate / 100 / 12;
    let bal = d.balance;
    let paidInterest = 0;
    const balances = [d.balance];
    for (let m = 1; m <= d.term * 12; m++) {
      const i = bal * r;
      paidInterest += i;
      bal = Math.max(0, bal + i - pay);
      if (m % 12 === 0) balances.push(m === d.term * 12 ? 0 : bal);
    }
    interest[d.key] = paidInterest;
    byYear[d.key] = balances;
  }
  const rows = Array.from({ length: horizon + 1 }, (_, year) => {
    const row: { year: number } & Record<string, number> = { year } as { year: number } & Record<string, number>;
    for (const d of live) row[d.key] = Math.round(byYear[d.key][year] ?? 0);
    return row;
  });
  return {
    rows,
    interest,
    totalInterest: Object.values(interest).reduce((a, b) => a + b, 0),
    debtFreeYears: horizon,
  };
}

export interface GrowthRow {
  year: number;
  contributions: number;
  interest: number;
  value: number;
  /** Value if returns were `spread` points lower / higher each year. */
  low: number;
  high: number;
}

function grow(monthly: number, rate: number, years: number) {
  const r = rate / 100 / 12;
  let bal = 0;
  const out: number[] = [];
  for (let m = 1; m <= years * 12; m++) {
    bal = bal * (1 + r) + monthly;
    if (m % 12 === 0) out.push(bal);
  }
  return out;
}

/** Monthly saving compounded at `rate`%, with lower and higher scenarios, and the year
 *  in which growth first earns more than is paid in that year (null if never). */
export function growthPath(monthly: number, rate: number, years: number, spread = 3) {
  const base = grow(monthly, rate, years);
  const lo = grow(monthly, Math.max(0, rate - spread), years);
  const hi = grow(monthly, rate + spread, years);
  const rows: GrowthRow[] = base.map((v, i) => {
    const contributions = monthly * 12 * (i + 1);
    return { year: i + 1, contributions: Math.round(contributions), interest: Math.round(v - contributions), value: Math.round(v), low: Math.round(lo[i]), high: Math.round(hi[i]) };
  });
  let crossover: number | null = null;
  for (let i = 0; i < base.length; i++) {
    const gained = base[i] - (i ? base[i - 1] : 0) - monthly * 12;
    if (monthly > 0 && gained > monthly * 12) {
      crossover = i + 1;
      break;
    }
  }
  return { rows, crossover };
}

export type RiskKey = "conservative" | "moderate" | "aggressive";

export const RISK_PROFILES: Record<RiskKey, { labelKey: string; stocks: number; bonds: number; cash: number; alternatives: number }> = {
  conservative: { labelKey: "riskConservative", stocks: 30, bonds: 50, cash: 15, alternatives: 5 },
  moderate: { labelKey: "riskModerate", stocks: 60, bonds: 30, cash: 7, alternatives: 3 },
  aggressive: { labelKey: "riskAggressive", stocks: 85, bonds: 10, cash: 3, alternatives: 2 },
};

export const RETIREMENT_AGE = 67;

/** The model mix at an age, unrounded: from 30, half a point a year moves from
 *  shares to bonds (70%) and cash (30%), until retirement. Sums to 100.
 *  Educational model only — not personal advice. */
function mixAt(risk: RiskKey, age: number) {
  const p = RISK_PROFILES[risk];
  const shift = Math.min(p.stocks - 10, Math.max(0, Math.min(RETIREMENT_AGE, age) - 30) * 0.5);
  return { stocks: p.stocks - shift, bonds: p.bonds + shift * 0.7, cash: p.cash + shift * 0.3, alternatives: p.alternatives };
}

/** The model mix at an age in whole percentages that still sum to 100 (cash takes the rounding). */
export function allocationAt(risk: RiskKey, age: number) {
  const p = RISK_PROFILES[risk];
  const m = mixAt(risk, age);
  const stocks = Math.round(m.stocks);
  const bonds = Math.round(m.bonds);
  const alternatives = p.alternatives;
  return { stocks, bonds, cash: 100 - stocks - bonds - alternatives, alternatives };
}

/** The model allocation at every age from `age` to retirement (at least ten years shown). */
export function glidePath(risk: RiskKey, age: number) {
  const from = Math.max(18, Math.min(age, 90));
  const to = Math.max(from + 10, RETIREMENT_AGE);
  const r1 = (n: number) => Math.round(n * 10) / 10;
  return Array.from({ length: to - from + 1 }, (_, i) => {
    const m = mixAt(risk, from + i);
    return { age: from + i, stocks: r1(m.stocks), bonds: r1(m.bonds), cash: r1(m.cash), alternatives: m.alternatives };
  });
}
