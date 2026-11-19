import { STUDENT_LOAN_THRESHOLDS, takeHomePay, type TakeHomeInputs, type TakeHomeResult } from "@/lib/calculators";

// "£45,000 after tax" pages: one static page per salary, each answering the
// search "<salary> after tax UK" with figures from takeHomePay() — the same
// maths as /tools/take-home-pay and the MCP tool, so all three agree. The page
// copy is built from those figures (bands, a pay rise, Scotland, a pension, a
// student loan), so every page says something specific to its own salary.

/** £15k–£100k in £1k steps, £105k–£150k in £5k steps, then £175k and £200k. */
export const SALARY_PAGES: number[] = [
  ...Array.from({ length: 86 }, (_, i) => 15_000 + i * 1_000),
  ...Array.from({ length: 10 }, (_, i) => 105_000 + i * 5_000),
  175_000,
  200_000,
];

const SET = new Set(SALARY_PAGES);

export const salarySlug = (salary: number) => `${salary}-after-tax`;
export const salaryPath = (salary: number) => `/tools/take-home-pay/${salarySlug(salary)}`;

/** The salary a slug names, or null when it is not one of SALARY_PAGES. */
export function parseSalarySlug(slug: string): number | null {
  const m = /^(\d{5,6})-after-tax$/.exec(slug);
  if (!m) return null;
  const n = Number(m[1]);
  // Exact match only, so "045000-after-tax" isn't a second URL for the same page.
  return SET.has(n) && slug === salarySlug(n) ? n : null;
}

export const gbp = (n: number, dp = 0) =>
  `£${n.toLocaleString("en-GB", { minimumFractionDigits: dp, maximumFractionDigits: dp })}`;

/** Full-time hours used for the hourly figure. */
export const HOURS_PER_WEEK = 37.5;

export interface Scenario {
  key: string;
  label: string;
  inputs: TakeHomeInputs;
  result: TakeHomeResult;
}

export interface SalaryPage {
  salary: number;
  base: TakeHomeResult;
  monthly: number;
  weekly: number;
  hourly: number;
  /** Take-home added by a £1,000 rise, per year. */
  keepOfRaise: number;
  scenarios: Scenario[];
  /** Plain sentences about where this salary sits in the bands. */
  notes: string[];
  prev: number | null;
  next: number | null;
  nearby: number[];
}

const SCENARIOS: { key: string; label: string; inputs: Omit<TakeHomeInputs, "grossSalary"> }[] = [
  { key: "standard", label: "England, Wales or Northern Ireland", inputs: {} },
  { key: "scotland", label: "Scotland", inputs: { region: "scotland" } },
  { key: "pension", label: "Paying 5% into a workplace pension", inputs: { pensionPct: 5, pensionMethod: "net_pay" } },
  { key: "plan2", label: "Repaying a Plan 2 student loan", inputs: { studentLoan: "plan2" } },
  { key: "plan5", label: "Repaying a Plan 5 student loan", inputs: { studentLoan: "plan5" } },
  { key: "plan2_pension", label: "Plan 2 loan and 5% pension", inputs: { studentLoan: "plan2", pensionPct: 5, pensionMethod: "net_pay" } },
];

const BASIC_BAND_TOP = 50_270; // personal allowance + £37,700 basic-rate band (England, Wales, NI)
const TAPER_START = 100_000;
const TAPER_END = 125_140;

function bandNotes(salary: number, base: TakeHomeResult): string[] {
  const notes: string[] = [];
  if (salary <= BASIC_BAND_TOP) {
    notes.push(
      `All of it is in the basic-rate band: the first £12,570 is tax-free and the remaining ${gbp(salary - 12_570)} is taxed at 20%.`,
    );
  } else if (salary <= TAPER_START) {
    notes.push(
      `${gbp(salary - BASIC_BAND_TOP)} of it is above £50,270, so that part is taxed at 40% instead of 20%. National Insurance on that part drops from 8% to 2%.`,
    );
  } else if (salary <= TAPER_END) {
    notes.push(
      `It is in the "60% band": between £100,000 and £125,140 the tax-free personal allowance shrinks by £1 for every £2 earned. At this salary it is ${gbp(base.personalAllowance)} instead of £12,570.`,
    );
  } else {
    notes.push(
      `The tax-free personal allowance is gone (it disappears at £125,140), and ${gbp(salary - TAPER_END)} is taxed at the 45% additional rate.`,
    );
  }
  for (const [plan, threshold] of [["Plan 2", STUDENT_LOAN_THRESHOLDS.plan2], ["Plan 5", STUDENT_LOAN_THRESHOLDS.plan5]] as const) {
    if (salary <= threshold) notes.push(`A ${plan} student loan costs nothing at this salary: repayments start above ${gbp(threshold)}.`);
  }
  return notes;
}

export function salaryPage(salary: number): SalaryPage {
  const base = takeHomePay({ grossSalary: salary });
  const raised = takeHomePay({ grossSalary: salary + 1_000 });
  const i = SALARY_PAGES.indexOf(salary);
  return {
    salary,
    base,
    monthly: base.takeHome / 12,
    weekly: base.takeHome / 52,
    hourly: base.takeHome / 52 / HOURS_PER_WEEK,
    keepOfRaise: raised.takeHome - base.takeHome,
    scenarios: SCENARIOS.map((s) => {
      const inputs = { ...s.inputs, grossSalary: salary };
      return { key: s.key, label: s.label, inputs, result: takeHomePay(inputs) };
    }),
    notes: bandNotes(salary, base),
    prev: i > 0 ? SALARY_PAGES[i - 1] : null,
    next: i >= 0 && i < SALARY_PAGES.length - 1 ? SALARY_PAGES[i + 1] : null,
    nearby: i < 0 ? [] : SALARY_PAGES.slice(Math.max(0, i - 4), i + 5).filter((s) => s !== salary),
  };
}
