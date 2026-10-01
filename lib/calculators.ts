// The arithmetic behind the calculator tools. Shared by the tool pages and the
// MCP server (/api/mcp), so a figure someone gets from an AI assistant is the
// same figure the page shows for the same inputs. No React, no formatting.
//
// Rates are fractions (0.05 = 5%) unless a parameter name says Pct.

// ── Loans and mortgages ─────────────────────────────────────────────────────

export function monthlyPayment(rate: number, years: number, amount: number) {
  const r = rate / 12;
  const n = years * 12;
  if (r === 0) return amount / n;
  return (amount * r) / (1 - Math.pow(1 + r, -n));
}

export interface ScheduleRow {
  period: number;
  payment: number;
  interest: number;
  principal: number;
  balance: number;
}

export function buildSchedule(rate: number, years: number, amount: number): ScheduleRow[] {
  const r = rate / 12;
  const pmt = monthlyPayment(rate, years, amount);
  let balance = amount;
  const rows: ScheduleRow[] = [];
  for (let i = 1; i <= years * 12; i++) {
    const interest = balance * r;
    const principal = pmt - interest;
    balance = Math.max(balance - principal, 0);
    rows.push({ period: i, payment: pmt, interest, principal, balance });
  }
  return rows;
}

/** Paying `extra` on top of the scheduled payment every month: how many
 *  months until the loan is cleared, and the interest paid on the way. */
export function payoffWithExtra(rate: number, years: number, amount: number, extra: number) {
  const r = rate / 12;
  const pmt = monthlyPayment(rate, years, amount) + extra;
  let balance = amount;
  let months = 0;
  let totalInterest = 0;
  while (balance > 1e-6 && months < years * 12) {
    const interest = balance * r;
    totalInterest += interest;
    balance = Math.max(balance + interest - pmt, 0);
    months++;
  }
  return { months, totalInterest };
}

// ── Compound growth ─────────────────────────────────────────────────────────

export interface CompoundRow {
  year: number;
  portfolioValue: number;
  totalContributed: number;
  interestEarned: number;
}

/** Monthly compounding, contribution added at the end of each month. */
export function compoundGrowth(initialCapital: number, monthlyContribution: number, years: number, annualRatePct: number) {
  const rMonthly = annualRatePct / 100 / 12;
  let balance = initialCapital;
  let totalContrib = initialCapital;
  let totalInt = 0;
  const rows: CompoundRow[] = [];

  for (let m = 1; m <= years * 12; m++) {
    const interest = balance * rMonthly;
    balance = balance + interest + monthlyContribution;
    totalInt += interest;
    totalContrib += monthlyContribution;
    if (m % 12 === 0) {
      rows.push({ year: m / 12, portfolioValue: Math.round(balance), totalContributed: Math.round(totalContrib), interestEarned: Math.round(totalInt) });
    }
  }

  const totalInvested = initialCapital + monthlyContribution * years * 12;
  const returnMultiple = totalInvested > 0 ? balance / totalInvested : 1;

  return { rows, finalValue: Math.round(balance), totalInvested, totalInterest: Math.round(totalInt), returnMultiple };
}

/** A future amount in today's money, deflated at a constant annual inflation rate. */
export function realValue(nominal: number, inflationPct: number, years: number) {
  return nominal / Math.pow(1 + inflationPct / 100, years);
}

// ── Break-even ──────────────────────────────────────────────────────────────

export function breakEven(totalFixed: number, sellingPrice: number, variableCost: number, currentUnits: number) {
  const cm = sellingPrice - variableCost;
  const cmRatio = sellingPrice > 0 ? cm / sellingPrice : 0;
  const bepUnits = cm > 0 ? totalFixed / cm : null;
  const bepRevenue = bepUnits !== null ? bepUnits * sellingPrice : null;
  const currentRevenue = currentUnits * sellingPrice;
  const currentProfit = cm * currentUnits - totalFixed;
  const mosUnits = bepUnits !== null ? currentUnits - bepUnits : null;
  const mosPct =
    bepUnits !== null && currentUnits > 0
      ? ((currentUnits - bepUnits) / currentUnits) * 100
      : null;
  return { totalFixed, cm, cmRatio, bepUnits, bepRevenue, currentRevenue, currentProfit, mosUnits, mosPct };
}

// ── Business valuation ──────────────────────────────────────────────────────

/** Damodaran industry data — January 2026. Multiples (EV/EBITDA of firms with
 *  positive EBITDA, EV/Sales, forward P/E) plus the inputs the startup_valuation DCF
 *  uses: pre-tax operating margin %, sales / invested capital and cost of
 *  capital %. Refresh from pages.stern.nyu.edu/~adamodar each January. */
export interface Industry {
  id: string; label: string; ebitda: number; evSales: number; pe: number;
  opMargin: number; salesToCapital: number; costOfCapital: number;
}

export const INDUSTRIES: Industry[] = [
  { id: "software-saas",       label: "Software / SaaS",              ebitda: 24.5, evSales: 11.4, pe: 34.1, opMargin: 32.98, salesToCapital: 1.54, costOfCapital: 9.34 },
  { id: "software-internet",   label: "Software (Internet / Platform)",ebitda: 30.3, evSales:  9.6, pe: 64.8, opMargin: 3.69, salesToCapital: 1.35, costOfCapital: 10.66 },
  { id: "tech-services",       label: "IT & Computer Services",        ebitda: 14.1, evSales:  1.5, pe: 56.5, opMargin: 7.41, salesToCapital: 5.19, costOfCapital: 7.83 },
  { id: "healthcare-it",       label: "Healthcare IT",                 ebitda: 21.3, evSales:  5.3, pe: 37.4, opMargin: 14.71, salesToCapital: 1.25, costOfCapital: 8.22 },
  { id: "healthcare-products", label: "Healthcare Products",           ebitda: 19.8, evSales:  4.8, pe: 42.3, opMargin: 15.34, salesToCapital: 1.48, costOfCapital: 7.54 },
  { id: "pharma",              label: "Pharmaceuticals",               ebitda: 15.3, evSales:  6.2, pe: 24.2, opMargin: 29.54, salesToCapital: 1.11, costOfCapital: 7.85 },
  { id: "semiconductor",       label: "Semiconductor",                 ebitda: 34.8, evSales: 15.7, pe: 37.3, opMargin: 35.33, salesToCapital: 1.21, costOfCapital: 10.55 },
  { id: "electrical-equip",    label: "Electrical Equipment",          ebitda: 24.6, evSales:  4.4, pe: 29.6, opMargin: 9.53, salesToCapital: 2.03, costOfCapital: 8.99 },
  { id: "business-services",   label: "Business & Consumer Services",  ebitda: 14.3, evSales:  2.5, pe: 18.7, opMargin: 12.27, salesToCapital: 2.80, costOfCapital: 7.23 },
  { id: "advertising",         label: "Advertising / Marketing",       ebitda: 12.0, evSales:  2.1, pe: 52.9, opMargin: 10.07, salesToCapital: 3.85, costOfCapital: 7.81 },
  { id: "education",           label: "Education",                     ebitda:  9.3, evSales:  2.0, pe: 18.1, opMargin: 14.01, salesToCapital: 1.63, costOfCapital: 6.75 },
  { id: "entertainment",       label: "Entertainment / Media",         ebitda: 19.4, evSales:  4.3, pe: 42.7, opMargin: 10.60, salesToCapital: 1.39, costOfCapital: 7.13 },
  { id: "restaurant",          label: "Restaurant / Dining",           ebitda: 17.5, evSales:  4.2, pe: 31.9, opMargin: 15.79, salesToCapital: 1.51, costOfCapital: 7.16 },
  { id: "retail-general",      label: "Retail (General)",              ebitda: 17.4, evSales:  2.1, pe: 24.0, opMargin: 6.80, salesToCapital: 3.51, costOfCapital: 7.27 },
  { id: "retail-grocery",      label: "Retail (Grocery / Food)",       ebitda:  8.9, evSales:  0.5, pe: 14.3, opMargin: 2.29, salesToCapital: 4.65, costOfCapital: 7.24 },
  { id: "food-processing",     label: "Food Processing / FMCG",        ebitda: 10.0, evSales:  1.5, pe: 17.2, opMargin: 10.63, salesToCapital: 1.71, costOfCapital: 5.79 },
  { id: "construction",        label: "Engineering & Construction",     ebitda: 17.2, evSales:  1.7, pe: 28.1, opMargin: 6.49, salesToCapital: 4.36, costOfCapital: 8.69 },
  { id: "building-materials",  label: "Building Materials",            ebitda: 11.6, evSales:  2.1, pe: 18.4, opMargin: 12.64, salesToCapital: 2.06, costOfCapital: 7.85 },
  { id: "machinery",           label: "Industrial Machinery",          ebitda: 16.2, evSales:  3.4, pe: 24.1, opMargin: 15.86, salesToCapital: 1.95, costOfCapital: 7.70 },
  { id: "transportation",      label: "Transportation & Logistics",     ebitda: 12.6, evSales:  1.6, pe: 19.8, opMargin: 7.57, salesToCapital: 1.98, costOfCapital: 6.72 },
  { id: "trucking",            label: "Trucking / Freight",            ebitda: 10.4, evSales:  1.7, pe: 46.2, opMargin: 6.89, salesToCapital: 1.47, costOfCapital: 7.52 },
  { id: "real-estate",         label: "Real Estate",                   ebitda: 17.3, evSales:  6.8, pe: 14.3, opMargin: 21.45, salesToCapital: 0.25, costOfCapital: 6.25 },
  { id: "hotel-gaming",        label: "Hotel / Hospitality",           ebitda: 14.9, evSales:  4.3, pe: 29.1, opMargin: 19.39, salesToCapital: 1.04, costOfCapital: 7.36 },
  { id: "telecom",             label: "Telecom Services",              ebitda:  6.5, evSales:  2.6, pe: 26.5, opMargin: 20.47, salesToCapital: 0.60, costOfCapital: 5.39 },
  { id: "oil-gas",             label: "Oil & Gas",                     ebitda:  5.2, evSales:  2.7, pe: 16.1, opMargin: 25.42, salesToCapital: 0.57, costOfCapital: 6.25 },
];

export interface ValuationInputs {
  revenue: number;
  ebitda: number;
  netIncome: number;
  fcf: number;
  growthRatePct: number;
  discountRatePct: number;
  terminalGrowthPct: number;
  ebitdaMultiple: number;
  evSalesMultiple: number;
  peRatio: number;
  /** Debt minus cash; negative when the company holds more cash than debt. */
  netDebt: number;
  /** Optional haircut for a private, illiquid company, percent. Taken off
   *  enterprise value before net debt, so cash is never discounted. */
  privateDiscountPct?: number;
}

export type ValuationMethod = "dcf" | "evEbitda" | "evSales" | "pe";

/** null = the method's driver is zero or negative, so it has no meaningful
 *  value; `average` is over the other methods, null if none is left. */
export interface MethodValues { dcf: number | null; evEbitda: number | null; evSales: number | null; pe: number | null; average: number | null }

export interface ExcludedMethod { method: ValuationMethod; reason: string }

/** Five-year DCF with a Gordon-growth terminal value, next to three multiples.
 *
 *  The DCF (of free cash flow to the firm), EV/EBITDA and EV/Sales give an
 *  enterprise value — the business including its debt — while P/E gives an
 *  equity value. Averaging the four as they come mixes the two, so each is
 *  converted with net debt (equity = enterprise − net debt) and both sets are
 *  returned, each with its own average.
 *
 *  A method whose driver is zero or negative is left out (null, listed in
 *  `excluded`): a multiple of a loss isn't a value, and growing a negative FCF
 *  only makes the loss bigger. The DCF isn't projected at all in that case. */
export function valuation(v: ValuationInputs) {
  const r  = v.discountRatePct   / 100;
  const g  = v.growthRatePct     / 100;
  const tg = v.terminalGrowthPct / 100;

  const excluded: ExcludedMethod[] = [];
  if (v.fcf <= 0)       excluded.push({ method: "dcf",      reason: "Free cash flow is zero or negative; projecting it forward only compounds the loss." });
  if (v.ebitda <= 0)    excluded.push({ method: "evEbitda", reason: "EBITDA is zero or negative, so an EV/EBITDA multiple gives no meaningful value." });
  if (v.revenue <= 0)   excluded.push({ method: "evSales",  reason: "Revenue is zero." });
  if (v.netIncome <= 0) excluded.push({ method: "pe",       reason: "Net income is zero or negative, so a P/E multiple gives no meaningful value." });
  const usable = (m: ValuationMethod) => !excluded.some((e) => e.method === m);

  let cumPV = 0;
  let projectedFCF = v.fcf;
  const dcfRows: { year: number; fcf: number; discountedFCF: number; cumulativePV: number }[] = [];
  let pvTerminal: number | null = null;

  if (usable("dcf")) {
    for (let yr = 1; yr <= 5; yr++) {
      projectedFCF = projectedFCF * (1 + g);
      const discountedFCF = projectedFCF / Math.pow(1 + r, yr);
      cumPV += discountedFCF;
      dcfRows.push({ year: yr, fcf: Math.round(projectedFCF), discountedFCF: Math.round(discountedFCF), cumulativePV: Math.round(cumPV) });
    }
    const terminalValue = (projectedFCF * (1 + tg)) / (r - tg);
    pvTerminal = terminalValue / Math.pow(1 + r, 5);
  }

  const nd = v.netDebt;
  const keep = 1 - (v.privateDiscountPct ?? 0) / 100;
  // Every method as an enterprise value (P/E gives equity, so net debt is
  // added back), then the private discount on that, before net debt.
  const ev: Record<ValuationMethod, number> = {
    dcf: (cumPV + (pvTerminal ?? 0)) * keep,
    evEbitda: v.ebitda * v.ebitdaMultiple * keep,
    evSales: v.revenue * v.evSalesMultiple * keep,
    pe: (v.netIncome * v.peRatio + nd) * keep,
  };

  const methods = (x: Record<ValuationMethod, number>): MethodValues => {
    const val = (m: ValuationMethod) => (usable(m) ? x[m] : null);
    const valid = (["dcf", "evEbitda", "evSales", "pe"] as const).filter(usable).map((m) => x[m]);
    return {
      dcf: val("dcf") === null ? null : Math.round(x.dcf),
      evEbitda: val("evEbitda") === null ? null : Math.round(x.evEbitda),
      evSales: val("evSales") === null ? null : Math.round(x.evSales),
      pe: val("pe") === null ? null : Math.round(x.pe),
      average: valid.length ? Math.round(valid.reduce((s, n) => s + n, 0) / valid.length) : null,
    };
  };
  const enterprise = methods(ev);
  const equity     = methods({ dcf: ev.dcf - nd, evEbitda: ev.evEbitda - nd, evSales: ev.evSales - nd, pe: ev.pe - nd });

  return { dcfRows, pvTerminal: pvTerminal === null ? null : Math.round(pvTerminal), enterprise, equity, excluded };
}

// ── Startup valuation ───────────────────────────────────────────────────────

export interface StartupInputs {
  /** Price paid per share in the latest round. */
  pricePerShare?: number;
  /** Shares in issue after the round (fully diluted if known). */
  sharesOutstanding?: number;
  /** Alternatively: money raised in the round and the stake it bought. */
  investment?: number;
  stakePct?: number;
  /** Revenue-multiple method. */
  revenue?: number;
  evSalesMultiple?: number;
  /** Cash minus debt; added to enterprise value to get equity value. */
  netCash?: number;
  /** Optional haircut for a private, illiquid company, percent. */
  privateDiscountPct?: number;
  /** Runway. */
  cash?: number;
  annualBurn?: number;
}

/** For companies with no profits to value: what the last round implies, a
 *  revenue multiple, and how long the cash lasts. Each part is computed only
 *  when its inputs are given. */
export function startupValuation(v: StartupInputs) {
  let round: { postMoney: number; preMoney: number | null; basis: string } | null = null;
  if (v.pricePerShare !== undefined && v.sharesOutstanding !== undefined) {
    const postMoney = v.pricePerShare * v.sharesOutstanding;
    const preMoney = v.investment !== undefined ? postMoney - v.investment : null;
    round = { postMoney, preMoney, basis: "price per share × shares outstanding" };
  } else if (v.investment !== undefined && v.stakePct !== undefined && v.stakePct > 0) {
    const postMoney = v.investment / (v.stakePct / 100);
    round = { postMoney, preMoney: postMoney - v.investment, basis: "investment ÷ stake acquired" };
  }

  let revenueMultiple: { enterpriseValue: number; equityValue: number; afterDiscount: number } | null = null;
  if (v.revenue !== undefined && v.evSalesMultiple !== undefined) {
    const enterpriseValue = v.revenue * v.evSalesMultiple;
    const equityValue = enterpriseValue + (v.netCash ?? 0);
    // The discount is for an illiquid operating business: it comes off
    // enterprise value, and cash is added back in full.
    const afterDiscount = enterpriseValue * (1 - (v.privateDiscountPct ?? 0) / 100) + (v.netCash ?? 0);
    revenueMultiple = { enterpriseValue, equityValue, afterDiscount };
  }

  const runwayMonths =
    v.cash !== undefined && v.annualBurn !== undefined && v.annualBurn > 0 ? (v.cash / v.annualBurn) * 12 : null;

  return { round, revenueMultiple, runwayMonths };
}

// ── Young-company DCF (Damodaran) ───────────────────────────────────────────

export interface YoungDcfInputs {
  revenue: number;
  /** Revenue growth in years 1–5; it then steps down to terminalGrowthPct by year 10. */
  revenueGrowthPct: number;
  /** Today's operating margin; may be negative. */
  currentMarginPct: number;
  /** Margin the business reaches as it matures (Damodaran: the industry's). */
  targetMarginPct: number;
  /** Year by which the margin reaches the target. */
  yearsToTargetMargin: number;
  /** Revenue generated per unit of capital invested — sets reinvestment. */
  salesToCapital: number;
  /** Cost of capital in years 1–5; it then moves to matureCostOfCapitalPct by year 10. */
  initialCostOfCapitalPct: number;
  matureCostOfCapitalPct: number;
  terminalGrowthPct: number;
  taxRatePct: number;
  /** Tax losses already carried forward. */
  netOperatingLoss: number;
  /** Chance the business fails before it matures, percent. */
  failureProbabilityPct: number;
  /** What is recovered if it fails. */
  failureProceeds: number;
  netCash: number;
  optionsValue: number;
}

export interface YoungDcfYear {
  year: number;
  growthPct: number;
  revenue: number;
  marginPct: number;
  ebit: number;
  tax: number;
  reinvestment: number;
  fcff: number;
  costOfCapitalPct: number;
  pv: number;
}

/** Damodaran's approach to valuing young, loss-making companies ("Valuing
 *  Young, Start-up and Growth Companies", 2009): grow revenue, move the margin
 *  to a mature target, fund growth through the sales-to-capital ratio, carry
 *  tax losses forward, let the cost of capital fall as the firm matures, then
 *  weight the going-concern value by the chance it survives. Ten explicit years,
 *  then stable growth with a return on capital equal to the cost of capital. */
export function youngCompanyDcf(v: YoungDcfInputs) {
  const g1 = v.revenueGrowthPct / 100;
  const gT = v.terminalGrowthPct / 100;
  const t = v.taxRatePct / 100;
  const r0 = v.initialCostOfCapitalPct / 100;
  const rM = v.matureCostOfCapitalPct / 100;
  const conv = Math.max(1, v.yearsToTargetMargin);

  const years: YoungDcfYear[] = [];
  let revenue = v.revenue;
  let nol = v.netOperatingLoss;
  let discount = 1;
  let pvSum = 0;

  for (let yr = 1; yr <= 10; yr++) {
    const g = yr <= 5 ? g1 : g1 - ((g1 - gT) * (yr - 5)) / 5;
    const prev = revenue;
    revenue = prev * (1 + g);
    const margin = yr >= conv ? v.targetMarginPct : v.targetMarginPct - ((v.targetMarginPct - v.currentMarginPct) * (conv - yr)) / conv;
    const ebit = (revenue * margin) / 100;

    // Losses build up a carry-forward; profits use it up before any tax is due.
    let taxable = ebit;
    if (ebit < 0) {
      nol += -ebit;
      taxable = 0;
    } else {
      const used = Math.min(nol, ebit);
      nol -= used;
      taxable = ebit - used;
    }
    const tax = taxable * t;
    const reinvestment = (revenue - prev) / v.salesToCapital;
    const fcff = ebit - tax - reinvestment;

    const r = yr <= 5 ? r0 : r0 - ((r0 - rM) * (yr - 5)) / 5;
    discount *= 1 + r;
    const pv = fcff / discount;
    pvSum += pv;
    years.push({ year: yr, growthPct: g * 100, revenue, marginPct: margin, ebit, tax, reinvestment, fcff, costOfCapitalPct: r * 100, pv });
  }

  // Stable growth: full tax, reinvestment rate = g / return on capital, with
  // return on capital = cost of capital (no excess returns forever).
  const revenue11 = revenue * (1 + gT);
  const ebitAfterTax11 = ((revenue11 * v.targetMarginPct) / 100) * (1 - t);
  const reinvestmentRate = rM > 0 ? gT / rM : 0;
  const fcff11 = ebitAfterTax11 * (1 - reinvestmentRate);
  const terminalValue = fcff11 / (rM - gT);
  const pvTerminal = terminalValue / discount;

  const goingConcern = pvSum + pvTerminal;
  const p = v.failureProbabilityPct / 100;
  const operatingValue = goingConcern * (1 - p) + v.failureProceeds * p;
  const equityValue = operatingValue + v.netCash - v.optionsValue;

  return { years, pvOfCashFlows: pvSum, terminalValue, pvTerminal, goingConcern, operatingValue, equityValue };
}

// ── UK take-home pay ─────────────────────────────────────────────────────────
// Employees on PAYE with the standard tax code (1257L). Rates for 2026/27 from
// GOV.UK "Rates and thresholds for employers 2026 to 2027" (checked 1 Oct 2026).
// Change them together each April, and the TAX_YEAR label with them.
//
// Not modelled: other tax codes, benefits in kind, the marriage allowance,
// higher-rate pension relief claimed through self-assessment, and
// period-by-period rounding (figures are annual, monthly = annual / 12).

export const TAX_YEAR = "2026/27";

export type UkRegion = "england_wales_ni" | "scotland";
export type PensionMethod = "salary_sacrifice" | "net_pay" | "relief_at_source";
export type StudentLoanPlan = "plan1" | "plan2" | "plan4" | "plan5";

const PERSONAL_ALLOWANCE = 12_570;
const TAPER_START = 100_000; // allowance falls £1 for every £2 of adjusted net income above this

/** Bands of taxable income (after the personal allowance): [upper limit, rate]. */
const INCOME_TAX_BANDS: Record<UkRegion, [number, number][]> = {
  england_wales_ni: [[37_700, 0.2], [125_140, 0.4], [Infinity, 0.45]],
  scotland: [[3_967, 0.19], [16_956, 0.2], [31_092, 0.21], [62_430, 0.42], [125_140, 0.45], [Infinity, 0.48]],
};

const NI_PRIMARY_THRESHOLD = 12_570;
const NI_UPPER_EARNINGS_LIMIT = 50_270;
const NI_MAIN_RATE = 0.08;
const NI_UPPER_RATE = 0.02;

export const STUDENT_LOAN_THRESHOLDS: Record<StudentLoanPlan, number> = {
  plan1: 26_900,
  plan2: 29_385,
  plan4: 33_795,
  plan5: 25_000,
};
const STUDENT_LOAN_RATE = 0.09;
const POSTGRAD_THRESHOLD = 21_000;
const POSTGRAD_RATE = 0.06;
const BASIC_RATE_RELIEF = 0.2; // relief at source: the provider claims 20% back from HMRC

export interface TakeHomeInputs {
  grossSalary: number;
  region?: UkRegion;
  /** Employee pension contribution, % of gross salary. */
  pensionPct?: number;
  pensionMethod?: PensionMethod;
  studentLoan?: StudentLoanPlan | null;
  postgradLoan?: boolean;
}

export interface TakeHomeResult {
  grossSalary: number;
  personalAllowance: number;
  taxableIncome: number;
  incomeTax: number;
  nationalInsurance: number;
  studentLoan: number;
  postgradLoan: number;
  /** What leaves the employee's pay for the pension (relief at source: 80% of the gross contribution). */
  pensionFromPay: number;
  /** What lands in the pension pot, including basic-rate relief at source. */
  pensionTotal: number;
  takeHome: number;
  /** Tax, NI and loan repayments as a share of gross salary, percent (pension not counted). */
  effectiveRatePct: number;
  /** Share of the next £100 of salary lost to tax, NI and loans, percent. */
  marginalRatePct: number;
}

function incomeTaxOn(taxable: number, region: UkRegion) {
  let tax = 0;
  let lower = 0;
  for (const [upper, rate] of INCOME_TAX_BANDS[region]) {
    if (taxable <= lower) break;
    tax += (Math.min(taxable, upper) - lower) * rate;
    lower = upper;
  }
  return tax;
}

function deductions(v: TakeHomeInputs) {
  const region = v.region ?? "england_wales_ni";
  const method = v.pensionMethod ?? "salary_sacrifice";
  const gross = Math.max(0, v.grossSalary);
  const contribution = (gross * Math.max(0, v.pensionPct ?? 0)) / 100;

  const sacrifice = method === "salary_sacrifice" ? contribution : 0;
  const netPay = method === "net_pay" ? contribution : 0;
  const reliefAtSource = method === "relief_at_source" ? contribution : 0;

  const niablePay = gross - sacrifice; // salary sacrifice also lowers NI and student loan earnings
  const taxablePay = niablePay - netPay;
  const adjustedNetIncome = taxablePay - reliefAtSource;
  const allowance = Math.max(0, PERSONAL_ALLOWANCE - Math.floor(Math.max(0, adjustedNetIncome - TAPER_START) / 2));
  const taxableIncome = Math.max(0, taxablePay - allowance);
  const incomeTax = incomeTaxOn(taxableIncome, region);

  const ni =
    Math.max(0, Math.min(niablePay, NI_UPPER_EARNINGS_LIMIT) - NI_PRIMARY_THRESHOLD) * NI_MAIN_RATE +
    Math.max(0, niablePay - NI_UPPER_EARNINGS_LIMIT) * NI_UPPER_RATE;

  const studentLoan = v.studentLoan ? Math.floor(Math.max(0, niablePay - STUDENT_LOAN_THRESHOLDS[v.studentLoan]) * STUDENT_LOAN_RATE) : 0;
  const postgradLoan = v.postgradLoan ? Math.floor(Math.max(0, niablePay - POSTGRAD_THRESHOLD) * POSTGRAD_RATE) : 0;

  const pensionFromPay = sacrifice + netPay + reliefAtSource * (1 - BASIC_RATE_RELIEF);
  const takeHome = gross - pensionFromPay - incomeTax - ni - studentLoan - postgradLoan;
  return { gross, allowance, taxableIncome, incomeTax, ni, studentLoan, postgradLoan, pensionFromPay, pensionTotal: contribution, takeHome };
}

const r2 = (n: number) => Math.round(n * 100) / 100;

export function takeHomePay(v: TakeHomeInputs): TakeHomeResult {
  const d = deductions(v);
  const next = deductions({ ...v, grossSalary: d.gross + 100 });
  // The extra £100 also raises the pension contribution; count only what goes to tax, NI and loans.
  const lostOnNext100 = 100 - (next.takeHome - d.takeHome) - (next.pensionFromPay - d.pensionFromPay);
  const charges = d.incomeTax + d.ni + d.studentLoan + d.postgradLoan;
  return {
    grossSalary: r2(d.gross),
    personalAllowance: d.allowance,
    taxableIncome: r2(d.taxableIncome),
    incomeTax: r2(d.incomeTax),
    nationalInsurance: r2(d.ni),
    studentLoan: d.studentLoan,
    postgradLoan: d.postgradLoan,
    pensionFromPay: r2(d.pensionFromPay),
    pensionTotal: r2(d.pensionTotal),
    takeHome: r2(d.takeHome),
    effectiveRatePct: d.gross > 0 ? r2((charges / d.gross) * 100) : 0,
    marginalRatePct: r2(lostOnNext100),
  };
}

/** The gross salary that leaves `targetTakeHome` a year, by bisection
 *  (take-home rises with gross at every level, so the answer is unique). */
export function grossForTakeHome(targetTakeHome: number, v: Omit<TakeHomeInputs, "grossSalary">): number {
  let lo = 0;
  let hi = 5_000_000;
  if (deductions({ ...v, grossSalary: hi }).takeHome < targetTakeHome) return NaN;
  while (hi - lo > 0.005) {
    const mid = (lo + hi) / 2;
    if (deductions({ ...v, grossSalary: mid }).takeHome < targetTakeHome) lo = mid;
    else hi = mid;
  }
  return Math.ceil(hi * 100) / 100;
}
