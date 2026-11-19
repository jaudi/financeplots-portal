import { buildSchedule, monthlyPayment, overpaymentPlan } from "@/lib/calculators";

// "£200,000 mortgage" pages: one static page per loan amount, each answering
// "<amount> mortgage monthly payments" with figures from the Lending
// Calculator's own maths (monthlyPayment, buildSchedule, overpaymentPlan), so a
// page and the calculator agree for the same inputs. Rates are examples, never
// quotes: the page says so, and the grid shows a range rather than one rate.

/** £50k–£500k in £5k steps, then £550k–£1m in £50k steps. */
export const MORTGAGE_PAGES: number[] = [
  ...Array.from({ length: 91 }, (_, i) => 50_000 + i * 5_000),
  ...Array.from({ length: 10 }, (_, i) => 550_000 + i * 50_000),
];

const SET = new Set(MORTGAGE_PAGES);

export const mortgageSlug = (amount: number) => `${amount}-mortgage`;
export const mortgagePath = (amount: number) => `/tools/lending/${mortgageSlug(amount)}`;

/** The amount a slug names, or null when it is not one of MORTGAGE_PAGES. */
export function parseMortgageSlug(slug: string): number | null {
  const m = /^(\d{5,7})-mortgage$/.exec(slug);
  if (!m) return null;
  const n = Number(m[1]);
  // Exact match only, so "0200000-mortgage" isn't a second URL for the same page.
  return SET.has(n) && slug === mortgageSlug(n) ? n : null;
}

/** The example the page leads with, and the Lending Calculator's own defaults. */
export const HEADLINE_RATE_PCT = 4.5;
export const HEADLINE_YEARS = 25;
export const GRID_RATES_PCT = [3.5, 4, 4.5, 5, 5.5, 6];
export const GRID_YEARS = [15, 20, 25, 30, 35];
export const OVERPAYMENTS = [100, 250];
/** Lenders' usual income multiples, for the rough income guide. */
export const INCOME_MULTIPLES = [4, 4.5] as const;

export interface MortgagePage {
  amount: number;
  monthly: number;
  totalInterest: number;
  totalRepaid: number;
  /** Share of the first payment that is interest (0.7 = 70%). */
  firstPaymentInterestShare: number;
  /** grid[rateIndex][termIndex] = monthly payment. */
  grid: number[][];
  /** Interest-only monthly payment for each GRID_RATES_PCT. */
  interestOnly: number[];
  /** Monthly cost of one percentage point more on the headline rate. */
  onePointMore: number;
  balanceAfter2: number;
  balanceAfter5: number;
  overpaying: { extra: number; monthsSaved: number; interestSaved: number }[];
  /** Household income at INCOME_MULTIPLES[1] and [0]: [lower, upper]. */
  incomeRange: [number, number];
  prev: number | null;
  next: number | null;
  nearby: number[];
}

export function mortgagePage(amount: number): MortgagePage {
  const rate = HEADLINE_RATE_PCT / 100;
  const schedule = buildSchedule(rate, HEADLINE_YEARS, amount);
  const monthly = monthlyPayment(rate, HEADLINE_YEARS, amount);
  const totalRepaid = monthly * HEADLINE_YEARS * 12;
  const i = MORTGAGE_PAGES.indexOf(amount);
  return {
    amount,
    monthly,
    totalInterest: totalRepaid - amount,
    totalRepaid,
    firstPaymentInterestShare: (amount * rate) / 12 / monthly,
    grid: GRID_RATES_PCT.map((r) => GRID_YEARS.map((y) => monthlyPayment(r / 100, y, amount))),
    interestOnly: GRID_RATES_PCT.map((r) => (amount * r) / 100 / 12),
    onePointMore: monthlyPayment(rate + 0.01, HEADLINE_YEARS, amount) - monthly,
    balanceAfter2: schedule[23].balance,
    balanceAfter5: schedule[59].balance,
    overpaying: OVERPAYMENTS.map((extra) => {
      const p = overpaymentPlan(rate, HEADLINE_YEARS, amount, extra);
      return { extra, monthsSaved: p.monthsSaved, interestSaved: p.interestSaved };
    }),
    incomeRange: [amount / INCOME_MULTIPLES[1], amount / INCOME_MULTIPLES[0]],
    prev: i > 0 ? MORTGAGE_PAGES[i - 1] : null,
    next: i >= 0 && i < MORTGAGE_PAGES.length - 1 ? MORTGAGE_PAGES[i + 1] : null,
    nearby: i < 0 ? [] : MORTGAGE_PAGES.slice(Math.max(0, i - 4), i + 5).filter((a) => a !== amount),
  };
}

/** "3 years 4 months", "11 months", "2 years". */
export function yearsMonths(months: number): string {
  const y = Math.floor(months / 12);
  const m = months % 12;
  const part = (n: number, w: string) => `${n} ${w}${n === 1 ? "" : "s"}`;
  if (y && m) return `${part(y, "year")} ${part(m, "month")}`;
  return y ? part(y, "year") : part(m, "month");
}
