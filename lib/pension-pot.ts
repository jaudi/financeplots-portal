import { incomeTax, TAX_YEAR } from "@/lib/calculators";

// A UK defined-contribution pension pot, in TODAY'S MONEY (real terms): grown
// to retirement, tax-free cash taken, then the steady income it can pay to a
// chosen age alongside the State Pension. The net income is what life_plan's
// `retire` event wants as `pension_per_year`.
//
// Ported from reference/planning-tools/pension_pot.py, which is the answer key:
// tests/pension-pot.test.ts pins its outputs. Rates are the user's assumptions;
// a planning sketch, not advice. Rates and allowances are for TAX_YEAR — update
// them each April with the take-home pay constants.

export const PENSION_TAX_YEAR = TAX_YEAR;
export const STATE_PENSION_FULL = 12_547.6; // £241.30 a week × 52, 2026/27
export const STATE_PENSION_FULL_YEARS = 35;
export const STATE_PENSION_MIN_YEARS = 10;
export const LUMP_SUM_ALLOWANCE = 268_275; // cap on total tax-free cash
export const ANNUAL_ALLOWANCE = 60_000;

/** Normal minimum pension age: 55, rising to 57 from 6 April 2028
 *  (simplified: anyone who turns 55 after 2028 gets 57). */
export const minPensionAge = (birthYear: number) => (birthYear + 55 < 2028 ? 55 : 57);

/** (1 + nominal − fee) / (1 + inflation) − 1, all in percent in, fraction out. */
export const realRate = (nominalPct: number, feePct: number, inflationPct: number) =>
  (1 + (nominalPct - feePct) / 100) / (1 + inflationPct / 100) - 1;

export function statePension(qualifyingYears: number): number {
  const yrs = Math.min(qualifyingYears, STATE_PENSION_FULL_YEARS);
  return yrs < STATE_PENSION_MIN_YEARS ? 0 : (STATE_PENSION_FULL * yrs) / STATE_PENSION_FULL_YEARS;
}

export interface DrawdownRow {
  age: number;
  state_pension: number;
  from_pot: number;
  gross_income: number;
  tax: number;
  net_income: number;
  pot_end: number;
}

/** The pot tops up the State Pension to `totalIncome` (gross, today's money).
 *  Withdrawal at the start of each year, growth on the rest. */
function drawdown(pot: number, startAge: number, endAge: number, totalIncome: number, stateFrom: number, stateAmount: number, r: number) {
  const rows: DrawdownRow[] = [];
  let ranOut: number | null = null;
  for (let age = startAge; age < endAge; age++) {
    const state = age >= stateFrom ? stateAmount : 0;
    const wanted = Math.max(0, totalIncome - state);
    const taken = Math.min(wanted, Math.max(pot, 0));
    if (taken < wanted - 0.5 && ranOut === null) ranOut = age;
    pot = (pot - taken) * (1 + r);
    const gross = state + taken;
    const tax = incomeTax(gross);
    rows.push({
      age,
      state_pension: Math.round(state),
      from_pot: Math.round(taken),
      gross_income: Math.round(gross),
      tax: Math.round(tax),
      net_income: Math.round(gross - tax),
      pot_end: Math.round(Math.max(pot, 0)),
    });
  }
  return { rows, ranOut };
}

export interface PensionPotInputs {
  age: number;
  potToday: number;
  salary?: number;
  employeePct?: number;
  employerPct?: number;
  extraMonthly?: number;
  retireAge?: number;
  planToAge?: number;
  statePensionAge?: number;
  niQualifyingYears?: number;
  taxFreeCashPct?: number;
  targetIncome?: number | null;
  returnPct?: number;
  returnInRetirementPct?: number;
  feePct?: number;
  inflationPct?: number;
  payGrowthPct?: number;
  birthYear?: number;
}

export const PENSION_DEFAULTS = {
  salary: 0,
  employeePct: 0,
  employerPct: 0,
  extraMonthly: 0,
  retireAge: 67,
  planToAge: 95,
  statePensionAge: 67,
  niQualifyingYears: 35,
  taxFreeCashPct: 25,
  returnPct: 5,
  returnInRetirementPct: 4,
  feePct: 0.5,
  inflationPct: 2.5,
  payGrowthPct: 3,
};

export function pensionPot(input: PensionPotInputs) {
  const a = { ...PENSION_DEFAULTS, ...Object.fromEntries(Object.entries(input).filter(([, v]) => v !== undefined)) } as Required<Omit<PensionPotInputs, "targetIncome" | "birthYear">> &
    Pick<PensionPotInputs, "targetIncome" | "birthYear">;
  if (!(a.age >= 18 && a.age < a.retireAge && a.retireAge < a.planToAge && a.planToAge <= 110)) {
    throw new RangeError("Need 18 ≤ age < retire_age < plan_to_age ≤ 110.");
  }
  if (a.taxFreeCashPct < 0 || a.taxFreeCashPct > 25) throw new RangeError("tax_free_cash_pct must be 0–25.");

  const warnings: string[] = [];
  const thisYear = new Date().getUTCFullYear();
  const birthYear = a.birthYear ?? thisYear - a.age;
  const mpa = minPensionAge(birthYear);
  if (a.retireAge < mpa) warnings.push(`Pension can't normally be accessed before ${mpa}; retiring at ${a.retireAge} needs other money until then.`);

  // 1. Accumulation, monthly, real terms
  const rAcc = (1 + realRate(a.returnPct, a.feePct, a.inflationPct)) ** (1 / 12) - 1;
  const gPay = (1 + a.payGrowthPct / 100) / (1 + a.inflationPct / 100) - 1;
  let pot = a.potToday;
  let paidIn = 0;
  let salary = a.salary;
  const accumulation: { age: number; contributions: number; pot_end: number }[] = [];
  for (let year = 0; year < a.retireAge - a.age; year++) {
    const contrib = (salary * (a.employeePct + a.employerPct)) / 100 + a.extraMonthly * 12;
    if (year === 0 && contrib > ANNUAL_ALLOWANCE) {
      warnings.push(`Contributions of £${Math.round(contrib).toLocaleString("en-GB")} a year exceed the £${ANNUAL_ALLOWANCE.toLocaleString("en-GB")} annual allowance.`);
    }
    for (let m = 0; m < 12; m++) pot = pot * (1 + rAcc) + contrib / 12;
    paidIn += contrib;
    accumulation.push({ age: a.age + year + 1, contributions: Math.round(contrib), pot_end: Math.round(pot) });
    salary *= 1 + gPay;
  }
  const potAtRetirement = pot;
  const nominal = pot * (1 + a.inflationPct / 100) ** (a.retireAge - a.age);

  // 2. Tax-free cash
  const tfc = Math.min((pot * a.taxFreeCashPct) / 100, LUMP_SUM_ALLOWANCE);
  const potForIncome = pot - tfc;

  // 3. State Pension
  const state = statePension(a.niQualifyingYears);
  if (Math.min(a.niQualifyingYears, STATE_PENSION_FULL_YEARS) < STATE_PENSION_FULL_YEARS) {
    warnings.push(`${STATE_PENSION_FULL_YEARS - Math.min(a.niQualifyingYears, STATE_PENSION_FULL_YEARS)} NI years short of the full State Pension; check gov.uk/check-state-pension.`);
  }

  // 4. Sustainable income: the total gross income (State Pension + pot) that
  //    empties the pot exactly at plan_to_age, by bisection.
  const rRet = realRate(a.returnInRetirementPct, a.feePct, a.inflationPct);
  let lo = 0;
  let hi = 500_000;
  for (let i = 0; i < 60; i++) {
    const mid = (lo + hi) / 2;
    if (drawdown(potForIncome, a.retireAge, a.planToAge, mid, a.statePensionAge, state, rRet).ranOut === null) lo = mid;
    else hi = mid;
  }
  const sustainable = lo;
  const sust = drawdown(potForIncome, a.retireAge, a.planToAge, sustainable, a.statePensionAge, state, rRet).rows;
  const steady = sust.find((r) => r.age >= a.statePensionAge) ?? sust[0];

  const target =
    a.targetIncome != null
      ? (() => {
          const t = drawdown(potForIncome, a.retireAge, a.planToAge, a.targetIncome!, a.statePensionAge, state, rRet);
          return { gross_per_year: Math.round(a.targetIncome!), pot_runs_out_at_age: t.ranOut, lasts_to_plan_age: t.ranOut === null };
        })()
      : undefined;

  return {
    currency: "GBP",
    money: "today's money (real terms)",
    at_retirement: {
      age: a.retireAge,
      pot: Math.round(potAtRetirement),
      pot_nominal: Math.round(nominal),
      paid_in: Math.round(paidIn),
      growth: Math.round(potAtRetirement - a.potToday - paidIn),
      tax_free_cash: Math.round(tfc),
      pot_for_income: Math.round(potForIncome),
    },
    state_pension: {
      per_year: Math.round(state),
      from_age: a.statePensionAge,
      bridge_years_before_it: Math.max(0, a.statePensionAge - a.retireAge),
    },
    sustainable_income: {
      until_age: a.planToAge,
      gross_per_year: Math.round(sustainable),
      from_pot_per_year: Math.round(Math.max(0, sustainable - state)),
      net_per_year: steady.net_income,
      net_per_month: Math.round(steady.net_income / 12),
      life_plan_pension_per_year: steady.net_income,
    },
    ...(target && { target }),
    accumulation,
    drawdown: sust,
    warnings,
    assumptions:
      "Real terms: returns net of fees and inflation; tax bands held at today's levels in today's money; State Pension rises with inflation; tax-free cash taken at retirement; England/Wales/NI tax. A planning sketch, not advice.",
  };
}

export type PensionPotResult = ReturnType<typeof pensionPot>;
