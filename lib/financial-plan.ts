import { incomeTax, monthlyPayment, takeHomePay } from "@/lib/calculators";
import { LUMP_SUM_ALLOWANCE, minPensionAge, statePension, STATE_PENSION_FULL_YEARS } from "@/lib/pension-pot";

// A fact-find turned into planning FINDINGS. The standards are in code so no
// assistant can skip them:
//   1. Nothing is projected until every required answer is in — the tool
//      returns ONE next question instead (and the assumptions it would use).
//   2. Everything is in today's money, net of tax and fees.
//   3. Five stress tests always run; three levers are measured as effects.
//   4. Assumptions come with reasons; the not-advice footer is fixed.
// Planning (modelling and scenarios), never a recommendation.
//
// Ported from reference/planning-tools/financial_plan.py (the answer key);
// tests/financial-plan.test.ts pins its outputs.

export type Housing =
  | { type: "rent"; rent_monthly?: number }
  | { type: "own"; home_value?: number; mortgage_left?: number; mortgage_rate_pct?: number; years_left?: number };

export interface FactFind {
  age?: number;
  retire_age?: number;
  gross_salary?: number;
  pension_pot?: number;
  savings?: number;
  spending_per_year?: number;
  housing?: Housing;
  has_partner?: boolean;
  partner_included_in_figures?: boolean;
  employee_pension_pct?: number;
  employer_pension_pct?: number;
  ni_qualifying_years?: number;
  state_pension_age?: number;
  spending_in_retirement?: number;
  tax_free_cash_pct?: number;
  return_pct?: number;
  fee_pct?: number;
  inflation_pct?: number;
  pay_growth_pct?: number;
  plan_to_age?: number;
  /** The user has seen and accepted the assumptions (or given their own). */
  assumptions_confirmed?: boolean;
}

export const FP_DEFAULTS = {
  employee_pension_pct: 5,
  employer_pension_pct: 3,
  ni_qualifying_years: 35,
  state_pension_age: 67,
  tax_free_cash_pct: 25,
  return_pct: 5,
  fee_pct: 0.75,
  inflation_pct: 2.5,
  pay_growth_pct: 3,
  plan_to_age: 95,
};

/** Asked in this order, one at a time. */
export const QUESTIONS: { field: string; question: string }[] = [
  { field: "age", question: "How old are you?" },
  { field: "retire_age", question: "At what age would you like to stop working?" },
  { field: "gross_salary", question: "What is your gross salary a year, before tax?" },
  { field: "has_partner", question: "Do you share your finances with a partner?" },
  { field: "pension_pot", question: "What are your pension pots worth today, in total? (0 if none)" },
  { field: "savings", question: "How much do you have in savings and investments outside pensions?" },
  { field: "spending_per_year", question: "Roughly what do you spend a year, not counting rent or mortgage?" },
  { field: "housing", question: "Do you rent or own your home?" },
];

export const ASSUMPTION_REASONS: Record<string, string> = {
  return_pct: "Long-run balanced portfolio before fees; not a forecast.",
  fee_pct: "Typical platform and fund charges; fees shorten how long money lasts.",
  inflation_pct: "Near the Bank of England's 2% target with a margin; a higher rate is tested too.",
  pay_growth_pct: "Slightly above inflation, in line with long-run UK earnings.",
  plan_to_age: "Beyond average life expectancy — about half of people live longer; 100 is tested too.",
  employee_pension_pct: "Your contribution; 5% is the auto-enrolment minimum split.",
  employer_pension_pct: "Your employer's contribution; 3% is the auto-enrolment minimum.",
  ni_qualifying_years: "35 years gives the full new State Pension (£12,547.60 a year in 2026/27).",
};

export const SCENARIOS = {
  base: {},
  market_fall: { fall_at_retirement_pct: 20 },
  low_returns: { return_pct_delta: -2 },
  high_inflation: { inflation_pct_delta: 2 },
  live_to_100: { plan_to_age: 100 },
} as const;
export type ScenarioName = keyof typeof SCENARIOS;
type Scenario = { fall_at_retirement_pct?: number; return_pct_delta?: number; inflation_pct_delta?: number; plan_to_age?: number };

export const SCENARIO_LABELS: Record<ScenarioName, string> = {
  base: "Base case",
  market_fall: "20% market fall at retirement",
  low_returns: "Returns 2% lower",
  high_inflation: "Inflation 2% higher",
  live_to_100: "Living to 100",
};

export const REQUIRED_FOOTER =
  "This is a financial planning projection based on the information and assumptions above. It is not financial advice or a recommendation. Projections are not guaranteed; investments can fall as well as rise. For free, impartial pension guidance, contact Pension Wise (MoneyHelper); for advice on your circumstances, speak to an FCA-regulated adviser.";

// ── Questions ────────────────────────────────────────────────────────────────

export function missingAnswers(ff: FactFind): { field: string; question: string }[] {
  const out = QUESTIONS.filter((q) => ff[q.field as keyof FactFind] == null);
  if (ff.has_partner && ff.partner_included_in_figures == null) {
    out.push({
      field: "partner_included_in_figures",
      question: "Do the salary, pensions and savings you gave include your partner's? (This version models one household: give combined figures, or say they're yours only.)",
    });
  }
  const h = ff.housing;
  if (h?.type === "own") {
    const ask: [keyof typeof h, string][] = [
      ["home_value", "Roughly what is your home worth?"],
      ["mortgage_left", "How much is left on your mortgage? (0 if none)"],
      ["mortgage_rate_pct", "What interest rate is your mortgage on?"],
      ["years_left", "How many years are left on your mortgage?"],
    ];
    for (const [k, question] of ask) {
      if (h[k] == null && !(k !== "home_value" && k !== "mortgage_left" && h.mortgage_left === 0)) out.push({ field: `housing.${k}`, question });
    }
  }
  if (h?.type === "rent" && h.rent_monthly == null) out.push({ field: "housing.rent_monthly", question: "How much rent do you pay a month?" });
  return out;
}

export function assumptionsInUse(ff: FactFind) {
  return Object.keys(ASSUMPTION_REASONS).map((name) => ({
    name,
    value: (ff[name as keyof FactFind] as number | undefined) ?? FP_DEFAULTS[name as keyof typeof FP_DEFAULTS],
    given_by_user: ff[name as keyof FactFind] != null,
    reason: ASSUMPTION_REASONS[name],
  }));
}

// ── Projection ───────────────────────────────────────────────────────────────

const takeHome = (gross: number, sacrificePct: number) => takeHomePay({ grossSalary: gross, pensionPct: sacrificePct, pensionMethod: "salary_sacrifice" }).takeHome;

/** Pension withdrawal W such that W minus the extra tax it causes = netNeeded. */
function grossUp(netNeeded: number, otherTaxable: number, cap: number) {
  if (netNeeded <= 0) return 0;
  const base = incomeTax(otherTaxable);
  let lo = 0;
  let hi = cap;
  for (let i = 0; i < 50; i++) {
    const mid = (lo + hi) / 2;
    if (mid - (incomeTax(otherTaxable + mid) - base) < netNeeded) lo = mid;
    else hi = mid;
  }
  return hi;
}

export interface ProjectionRow {
  age: number;
  phase: "working" | "retired";
  income_net: number;
  spending: number;
  housing: number;
  from_pension: number;
  pension_pot: number;
  savings: number;
}

type Complete = Required<Pick<FactFind, "age" | "retire_age" | "gross_salary" | "pension_pot" | "savings" | "spending_per_year" | "housing">> & FactFind;

export function project(ff: Complete, s: Scenario = {}) {
  const a = { ...FP_DEFAULTS, ...strip(ff) } as typeof FP_DEFAULTS & Complete;
  const infPct = a.inflation_pct + (s.inflation_pct_delta ?? 0);
  const inf = infPct / 100;
  const r = (1 + (a.return_pct + (s.return_pct_delta ?? 0) - a.fee_pct) / 100) / (1 + inf) - 1;
  // Inflation shock: wages keep pace, investment returns don't.
  const g = (1 + (a.pay_growth_pct + (s.inflation_pct_delta ?? 0)) / 100) / (1 + inf) - 1;
  const endAge = s.plan_to_age ?? a.plan_to_age;
  const spendRet = a.spending_in_retirement ?? a.spending_per_year;

  const h = a.housing;
  const own = h.type === "own";
  const yearsLeft = own ? (h.years_left ?? 0) : 0;
  const payNominal = own && (h.mortgage_left ?? 0) > 0 && yearsLeft > 0 ? 12 * monthlyPayment((h.mortgage_rate_pct ?? 0) / 100, yearsLeft, h.mortgage_left!) : 0;
  const rent = h.type === "rent" ? (h.rent_monthly ?? 0) * 12 : 0;

  const state = statePension(a.ni_qualifying_years);
  const mpa = minPensionAge(new Date().getUTCFullYear() - a.age);

  let salary = a.gross_salary;
  let pot = a.pension_pot;
  let cash = a.savings;
  let runsOut: number | null = null;
  let cashGap: number | null = null;
  let tfc = 0;
  const rows: ProjectionRow[] = [];
  for (let t = 0, age = a.age; age < endAge; t++, age++) {
    const mortgage = t < yearsLeft ? payNominal / (1 + inf) ** t : 0;
    const housing = mortgage + rent;
    let income: number;
    let fromPot = 0;
    let phase: ProjectionRow["phase"];
    if (age < a.retire_age) {
      income = takeHome(salary, a.employee_pension_pct);
      pot = pot * (1 + r) + (salary * (a.employee_pension_pct + a.employer_pension_pct)) / 100;
      const net = income - a.spending_per_year - housing;
      cash = (cash > 0 ? cash * (1 + r) : cash) + net;
      if (cash < 0 && cashGap === null) cashGap = age;
      salary *= 1 + g;
      phase = "working";
    } else {
      if (age === a.retire_age) {
        const fall = (s.fall_at_retirement_pct ?? 0) / 100;
        pot *= 1 - fall;
        if (cash > 0) cash *= 1 - fall;
        tfc = Math.min((pot * a.tax_free_cash_pct) / 100, LUMP_SUM_ALLOWANCE);
        pot -= tfc;
        cash += tfc;
      }
      const sp = age >= a.state_pension_age ? state : 0;
      const need = spendRet + housing;
      const netSp = sp - incomeTax(sp);
      fromPot = age >= mpa ? Math.min(grossUp(Math.max(0, need - netSp), sp, pot), pot) : 0;
      const netFromPot = fromPot - (incomeTax(sp + fromPot) - incomeTax(sp));
      income = netSp + netFromPot;
      pot = (pot - fromPot) * (1 + r);
      cash = (cash > 0 ? cash * (1 + r) : cash) + (income - need);
      phase = "retired";
    }
    if (cash < 0 && pot <= 1 && runsOut === null) runsOut = age;
    rows.push({
      age,
      phase,
      income_net: Math.round(income),
      spending: Math.round(phase === "working" ? a.spending_per_year : spendRet),
      housing: Math.round(housing),
      from_pension: Math.round(fromPot),
      pension_pot: Math.round(pot),
      savings: Math.round(cash),
    });
  }
  return { rows, money_runs_out_at_age: runsOut, savings_negative_while_working_at_age: cashGap, tax_free_cash: Math.round(tfc), liquid_at_end: Math.round(pot + cash), end_age: endAge };
}

function strip<T extends object>(o: T): Partial<T> {
  return Object.fromEntries(Object.entries(o).filter(([, v]) => v !== undefined)) as Partial<T>;
}

const outcome = (p: ReturnType<typeof project>) => (p.money_runs_out_at_age !== null ? `runs out at ${p.money_runs_out_at_age}` : `lasts to ${p.end_age}`);

// ── The tool's answer ────────────────────────────────────────────────────────

export function financialPlan(ff: FactFind) {
  const missing = missingAnswers(ff);
  if (missing.length > 0) {
    return {
      status: "needs_more_information" as const,
      next_question: missing[0],
      still_missing: missing.map((m) => m.field),
      assumptions_to_confirm: assumptionsInUse(ff),
      instruction:
        "Ask the user next_question in plain words and wait for their answer. Do not guess, estimate or fill in any answer yourself. Call financial_plan again with everything gathered so far plus the new answer.",
    };
  }
  if (!ff.assumptions_confirmed) {
    return {
      status: "confirm_assumptions" as const,
      assumptions_to_confirm: assumptionsInUse(ff),
      instruction:
        "Show the user these assumptions with their reasons and ask whether to keep them or change any. Then call financial_plan again with any changes and assumptions_confirmed: true.",
    };
  }

  const c = ff as Complete;
  const a = { ...FP_DEFAULTS, ...strip(c) } as typeof FP_DEFAULTS & Complete;
  const results = Object.fromEntries((Object.keys(SCENARIOS) as ScenarioName[]).map((n) => [n, project(c, SCENARIOS[n])])) as Record<ScenarioName, ReturnType<typeof project>>;
  const base = results.base;

  const leverChanges: Record<string, Partial<FactFind>> = {
    spend_10pct_less: { spending_per_year: a.spending_per_year * 0.9, spending_in_retirement: (a.spending_in_retirement ?? a.spending_per_year) * 0.9 },
    retire_2_years_later: { retire_age: a.retire_age + 2 },
    pension_plus_2pct: { employee_pension_pct: a.employee_pension_pct + 2 },
  };
  const levers = Object.fromEntries(
    Object.entries(leverChanges).map(([name, change]) => {
      const p = project({ ...c, ...change } as Complete);
      return [name, { base: outcome(base), with_change: outcome(p), liquid_at_end_change: p.liquid_at_end - base.liquid_at_end, money_runs_out_at_age: p.money_runs_out_at_age, end_age: p.end_age }];
    }),
  );

  const first = base.rows[0];
  const gap = first.income_net - first.spending - first.housing;
  const h = a.housing;
  const passed = (Object.keys(results) as ScenarioName[]).filter((n) => results[n].money_runs_out_at_age === null);
  const earliest = minPensionAge(new Date().getUTCFullYear() - a.age);

  const flags: string[] = [];
  if (gap < 0) flags.push(`Spending and housing exceed take-home pay by £${Math.round(-gap).toLocaleString("en-GB")} a year today.`);
  if (base.savings_negative_while_working_at_age !== null) flags.push(`Savings fall below zero at ${base.savings_negative_while_working_at_age}, before pensions can be accessed.`);
  if (a.retire_age < earliest) flags.push("Retirement is before the earliest pension access age.");
  if (a.ni_qualifying_years < STATE_PENSION_FULL_YEARS) flags.push("NI record short of the full State Pension.");

  return {
    status: "complete" as const,
    money: "today's money (real terms), net of tax and fees",
    findings: {
      cashflow_today: { net_income: first.income_net, spending: first.spending, housing: first.housing, surplus_or_gap: gap },
      milestones: {
        mortgage_paid_off_age: h.type === "own" && (h.mortgage_left ?? 0) > 0 ? a.age + (h.years_left ?? 0) : null,
        retire_age: a.retire_age,
        state_pension_age: a.state_pension_age,
        bridge_years_before_state_pension: Math.max(0, a.state_pension_age - a.retire_age),
        earliest_pension_access_age: earliest,
        tax_free_cash: base.tax_free_cash,
      },
      scenarios: Object.fromEntries(
        (Object.keys(results) as ScenarioName[]).map((n) => [
          n,
          { label: SCENARIO_LABELS[n], outcome: outcome(results[n]), money_runs_out_at_age: results[n].money_runs_out_at_age, liquid_at_end: results[n].liquid_at_end },
        ]),
      ) as Record<ScenarioName, { label: string; outcome: string; money_runs_out_at_age: number | null; liquid_at_end: number }>,
      resilience: `${passed.length} of ${Object.keys(results).length} scenarios last to the end`,
      levers,
    },
    flags,
    assumptions: assumptionsInUse(ff),
    projections: Object.fromEntries((Object.keys(results) as ScenarioName[]).map((n) => [n, results[n].rows])) as Record<ScenarioName, ProjectionRow[]>,
    report_sections: ["Your situation today", "Your goals", "Base projection", "Stress tests", "What moves the numbers", "Assumptions", "Data gaps", "Important information"],
    required_footer: REQUIRED_FOOTER,
  };
}

export type FinancialPlanResult = ReturnType<typeof financialPlan>;
export type CompletePlan = Extract<FinancialPlanResult, { status: "complete" }>;

// ── Share link (/plan?p=) — same idea as Life Plan's: no database ───────────

const FIELDS: (keyof FactFind)[] = [
  "age", "retire_age", "gross_salary", "pension_pot", "savings", "spending_per_year", "housing", "has_partner", "partner_included_in_figures",
  "employee_pension_pct", "employer_pension_pct", "ni_qualifying_years", "state_pension_age", "spending_in_retirement", "tax_free_cash_pct",
  "return_pct", "fee_pct", "inflation_pct", "pay_growth_pct", "plan_to_age", "assumptions_confirmed",
];

export function encodePlan(ff: FactFind): string {
  const picked = Object.fromEntries(FIELDS.filter((k) => ff[k] !== undefined).map((k) => [k, ff[k]]));
  const b64 = typeof btoa === "function" ? btoa(unescape(encodeURIComponent(JSON.stringify(picked)))) : Buffer.from(JSON.stringify(picked)).toString("base64");
  return b64.replace(/\+/g, "-").replace(/\//g, "_").replace(/=+$/, "");
}

const clamp = (v: unknown, lo: number, hi: number) => (typeof v === "number" && Number.isFinite(v) ? Math.min(hi, Math.max(lo, v)) : undefined);

/** Decodes and clamps a link: anything malformed is dropped, never trusted. */
export function decodePlan(p: string): FactFind | null {
  try {
    const b64 = p.replace(/-/g, "+").replace(/_/g, "/");
    const text = typeof atob === "function" ? decodeURIComponent(escape(atob(b64))) : Buffer.from(b64, "base64").toString();
    const raw = JSON.parse(text);
    if (!raw || typeof raw !== "object") return null;
    const h = raw.housing;
    const housing: Housing | undefined =
      h?.type === "own"
        ? { type: "own", home_value: clamp(h.home_value, 0, 1e9), mortgage_left: clamp(h.mortgage_left, 0, 1e9), mortgage_rate_pct: clamp(h.mortgage_rate_pct, 0, 30), years_left: clamp(h.years_left, 0, 40) }
        : h?.type === "rent"
          ? { type: "rent", rent_monthly: clamp(h.rent_monthly, 0, 1e6) }
          : undefined;
    return strip({
      age: clamp(raw.age, 18, 100),
      retire_age: clamp(raw.retire_age, 19, 100),
      gross_salary: clamp(raw.gross_salary, 0, 1e7),
      pension_pot: clamp(raw.pension_pot, 0, 1e9),
      savings: clamp(raw.savings, -1e9, 1e9),
      spending_per_year: clamp(raw.spending_per_year, 0, 1e8),
      housing,
      has_partner: typeof raw.has_partner === "boolean" ? raw.has_partner : undefined,
      partner_included_in_figures: typeof raw.partner_included_in_figures === "boolean" ? raw.partner_included_in_figures : undefined,
      employee_pension_pct: clamp(raw.employee_pension_pct, 0, 100),
      employer_pension_pct: clamp(raw.employer_pension_pct, 0, 100),
      ni_qualifying_years: clamp(raw.ni_qualifying_years, 0, 50),
      state_pension_age: clamp(raw.state_pension_age, 60, 75),
      spending_in_retirement: clamp(raw.spending_in_retirement, 0, 1e8),
      tax_free_cash_pct: clamp(raw.tax_free_cash_pct, 0, 25),
      return_pct: clamp(raw.return_pct, -20, 30),
      fee_pct: clamp(raw.fee_pct, 0, 5),
      inflation_pct: clamp(raw.inflation_pct, -5, 20),
      pay_growth_pct: clamp(raw.pay_growth_pct, -10, 20),
      plan_to_age: clamp(raw.plan_to_age, 60, 110),
      assumptions_confirmed: raw.assumptions_confirmed === true ? true : undefined,
    }) as FactFind;
  } catch {
    return null;
  }
}
