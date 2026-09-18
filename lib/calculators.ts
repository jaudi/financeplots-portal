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

/** Damodaran industry multiples — January 2026. */
export interface Industry { id: string; label: string; ebitda: number; evSales: number; pe: number }

export const INDUSTRIES: Industry[] = [
  { id: "software-saas",       label: "Software / SaaS",              ebitda: 24.5, evSales: 11.4, pe: 34.1 },
  { id: "software-internet",   label: "Software (Internet / Platform)",ebitda: 30.3, evSales:  9.6, pe: 64.8 },
  { id: "tech-services",       label: "IT & Computer Services",        ebitda: 14.1, evSales:  1.5, pe: 56.5 },
  { id: "healthcare-it",       label: "Healthcare IT",                 ebitda: 21.3, evSales:  5.3, pe: 37.4 },
  { id: "healthcare-products", label: "Healthcare Products",           ebitda: 19.8, evSales:  4.8, pe: 42.3 },
  { id: "pharma",              label: "Pharmaceuticals",               ebitda: 15.3, evSales:  6.2, pe: 24.2 },
  { id: "semiconductor",       label: "Semiconductor",                 ebitda: 34.8, evSales: 15.7, pe: 37.3 },
  { id: "electrical-equip",    label: "Electrical Equipment",          ebitda: 24.6, evSales:  4.4, pe: 29.6 },
  { id: "business-services",   label: "Business & Consumer Services",  ebitda: 14.3, evSales:  2.5, pe: 18.7 },
  { id: "advertising",         label: "Advertising / Marketing",       ebitda: 12.0, evSales:  2.1, pe: 52.9 },
  { id: "education",           label: "Education",                     ebitda:  9.3, evSales:  2.0, pe: 18.1 },
  { id: "entertainment",       label: "Entertainment / Media",         ebitda: 19.4, evSales:  4.3, pe: 42.7 },
  { id: "restaurant",          label: "Restaurant / Dining",           ebitda: 17.5, evSales:  4.2, pe: 31.9 },
  { id: "retail-general",      label: "Retail (General)",              ebitda: 17.4, evSales:  2.1, pe: 24.0 },
  { id: "retail-grocery",      label: "Retail (Grocery / Food)",       ebitda:  8.9, evSales:  0.5, pe: 14.3 },
  { id: "food-processing",     label: "Food Processing / FMCG",        ebitda: 10.0, evSales:  1.5, pe: 17.2 },
  { id: "construction",        label: "Engineering & Construction",     ebitda: 17.2, evSales:  1.7, pe: 28.1 },
  { id: "building-materials",  label: "Building Materials",            ebitda: 11.6, evSales:  2.1, pe: 18.4 },
  { id: "machinery",           label: "Industrial Machinery",          ebitda: 16.2, evSales:  3.4, pe: 24.1 },
  { id: "transportation",      label: "Transportation & Logistics",     ebitda: 12.6, evSales:  1.6, pe: 19.8 },
  { id: "trucking",            label: "Trucking / Freight",            ebitda: 10.4, evSales:  1.7, pe: 46.2 },
  { id: "real-estate",         label: "Real Estate",                   ebitda: 17.3, evSales:  6.8, pe: 14.3 },
  { id: "hotel-gaming",        label: "Hotel / Hospitality",           ebitda: 14.9, evSales:  4.3, pe: 29.1 },
  { id: "telecom",             label: "Telecom Services",              ebitda:  6.5, evSales:  2.6, pe: 26.5 },
  { id: "oil-gas",             label: "Oil & Gas",                     ebitda:  5.2, evSales:  2.7, pe: 16.1 },
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
}

/** Five-year DCF with a Gordon-growth terminal value, next to three multiples. */
export function valuation(v: ValuationInputs) {
  const r  = v.discountRatePct   / 100;
  const g  = v.growthRatePct     / 100;
  const tg = v.terminalGrowthPct / 100;

  let cumPV = 0;
  let projectedFCF = v.fcf;
  const dcfRows: { year: number; fcf: number; discountedFCF: number; cumulativePV: number }[] = [];

  for (let yr = 1; yr <= 5; yr++) {
    projectedFCF = projectedFCF * (1 + g);
    const discountedFCF = projectedFCF / Math.pow(1 + r, yr);
    cumPV += discountedFCF;
    dcfRows.push({ year: yr, fcf: Math.round(projectedFCF), discountedFCF: Math.round(discountedFCF), cumulativePV: Math.round(cumPV) });
  }

  const terminalValue = (projectedFCF * (1 + tg)) / (r - tg);
  const pvTerminal    = terminalValue / Math.pow(1 + r, 5);
  const dcfValue      = Math.round(cumPV + pvTerminal);
  const epsValue      = Math.round(v.netIncome * v.peRatio);
  const evValue       = Math.round(v.ebitda * v.ebitdaMultiple);
  const evSalesValue  = Math.round(v.revenue * v.evSalesMultiple);
  const avgValuation  = Math.round((dcfValue + epsValue + evValue + evSalesValue) / 4);

  return { dcfRows, pvTerminal: Math.round(pvTerminal), dcfValue, epsValue, evValue, evSalesValue, avgValuation };
}
