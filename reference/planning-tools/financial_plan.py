"""
financial_plan - FinancePlots tool (reference implementation)

One call turns a complete fact-find into structured planning FINDINGS.
The standards are enforced in code, so they can't be skipped:

  1. Inputs are checked first; gaps return questions, not a weak plan.
  2. Everything is projected in today's money, net of tax and fees.
  3. Stress tests ALWAYS run: market fall at retirement, low returns,
     high inflation, living to 100.
  4. Levers are measured (spend less, retire later, save more) and
     reported as effects - never as recommendations.
  5. Assumptions are listed with the reason for each.

This is planning (modelling and scenarios), not regulated advice.
"""

from __future__ import annotations
import copy
from pension_pot import (income_tax, min_pension_age, STATE_PENSION_FULL,
                         STATE_PENSION_FULL_YEARS, STATE_PENSION_MIN_YEARS,
                         LUMP_SUM_ALLOWANCE)

NI_THRESHOLD, NI_UPPER = 12_570, 50_270          # employee NI 2026/27: 8% / 2%

REQUIRED = {
    "age": "How old are you?",
    "retire_age": "At what age would you like to stop working?",
    "gross_salary": "What is your gross salary a year?",
    "pension_pot": "What are your pension pots worth today in total? (0 if none)",
    "savings": "How much do you have in savings and investments outside pensions?",
    "spending_per_year": "What do you spend a year, excluding rent or mortgage?",
    "housing": "Do you rent or own? If you own: home value, mortgage left, rate and years left.",
    "has_partner": "Do you share finances with a partner?",
}

DEFAULTS = {
    "employee_pension_pct": 5, "employer_pension_pct": 3,
    "ni_qualifying_years": 35, "state_pension_age": 67,
    "spending_in_retirement": None,       # None = same as today
    "tax_free_cash_pct": 25,
    "return_pct": 5.0, "fee_pct": 0.75, "inflation_pct": 2.5,
    "pay_growth_pct": 3.0, "plan_to_age": 95,
}

ASSUMPTION_REASONS = {
    "return_pct": "Long-run balanced portfolio before fees; not a forecast.",
    "fee_pct": "Typical platform + fund charges; fees shorten how long money lasts.",
    "inflation_pct": "Near the Bank of England 2% target with a margin; tested higher below.",
    "pay_growth_pct": "Slightly above inflation, in line with long-run UK earnings.",
    "plan_to_age": "Beyond average life expectancy - about half of people live longer; 100 is tested.",
    "state_pension": "Full new State Pension 2026/27 £12,547.60 a year, pro rata to NI years.",
}

SCENARIOS = {
    "base":            {},
    "market_fall":     {"fall_at_retirement_pct": 20},
    "low_returns":     {"return_pct_delta": -2},
    "high_inflation":  {"inflation_pct_delta": +2},
    "live_to_100":     {"plan_to_age": 100},
}


# ---------------------------------------------------------------------------
def ni(gross: float) -> float:
    return max(0, min(gross, NI_UPPER) - NI_THRESHOLD) * 0.08 + max(0, gross - NI_UPPER) * 0.02


def take_home(gross: float, sacrifice_pct: float) -> float:
    pay = gross * (1 - sacrifice_pct / 100)          # salary sacrifice
    return pay - income_tax(pay) - ni(pay)


def mortgage_payment(balance, rate_pct, years) -> float:
    if balance <= 0 or years <= 0:
        return 0.0
    r, n = rate_pct / 100 / 12, years * 12
    return balance / n if r == 0 else balance * r / (1 - (1 + r) ** -n)


def gross_up(net_needed: float, other_taxable: float, cap: float) -> float:
    """Pension withdrawal W so that W minus the extra tax it causes = net_needed."""
    if net_needed <= 0:
        return 0.0
    base_tax = income_tax(other_taxable)
    lo, hi = 0.0, cap
    for _ in range(50):
        mid = (lo + hi) / 2
        net = mid - (income_tax(other_taxable + mid) - base_tax)
        lo, hi = (mid, hi) if net < net_needed else (lo, mid)
    return hi


# ---------------------------------------------------------------------------
def validate(ff: dict) -> list[dict]:
    qs = [{"field": k, "question": q} for k, q in REQUIRED.items() if ff.get(k) is None]
    h = ff.get("housing") or {}
    if h.get("type") == "own":
        for k in ("home_value", "mortgage_left", "mortgage_rate_pct", "years_left"):
            if h.get(k) is None:
                qs.append({"field": f"housing.{k}", "question": f"Housing: what is the {k.replace('_', ' ')}?"})
    if ff.get("has_partner") and not ff.get("partner_included_in_figures"):
        qs.append({"field": "partner_included_in_figures",
                   "question": "Do the salary, pots and savings you gave include your partner's? "
                               "(v1 models one household income; give combined figures or say they're yours only)"})
    return qs


def project(ff: dict, s: dict) -> dict:
    """Year-by-year household projection in today's money for one scenario."""
    a = {**DEFAULTS, **ff}
    inf = (a["inflation_pct"] + s.get("inflation_pct_delta", 0)) / 100
    ret = (a["return_pct"] + s.get("return_pct_delta", 0) - a["fee_pct"]) / 100
    r = (1 + ret) / (1 + inf) - 1
    # Inflation shock: wages keep pace (pay growth moves with it), investment
    # returns don't (nominal return unchanged) - so it bites through real returns.
    pay_nom = a["pay_growth_pct"] + s.get("inflation_pct_delta", 0)
    g = (1 + pay_nom / 100) / (1 + inf) - 1
    end_age = s.get("plan_to_age", a["plan_to_age"])
    spend_ret = a["spending_in_retirement"] or a["spending_per_year"]

    h = a["housing"]
    pay_nominal = 12 * mortgage_payment(h.get("mortgage_left", 0), h.get("mortgage_rate_pct", 0),
                                        h.get("years_left", 0)) if h["type"] == "own" else 0
    rent = h.get("rent_monthly", 0) * 12 if h["type"] == "rent" else 0

    yrs = min(a["ni_qualifying_years"], STATE_PENSION_FULL_YEARS)
    state = 0 if yrs < STATE_PENSION_MIN_YEARS else STATE_PENSION_FULL * yrs / STATE_PENSION_FULL_YEARS
    mpa = min_pension_age(2026 - a["age"])

    salary, pot, cash = a["gross_salary"], a["pension_pot"], a["savings"]
    rows, runs_out, cash_gap_age, tfc_taken = [], None, None, 0
    for t, age in enumerate(range(a["age"], end_age)):
        mortgage = pay_nominal / (1 + inf) ** t if t < h.get("years_left", 0) else 0
        housing = mortgage + rent
        if age < a["retire_age"]:
            income = take_home(salary, a["employee_pension_pct"])
            pot = pot * (1 + r) + salary * (a["employee_pension_pct"] + a["employer_pension_pct"]) / 100
            net = income - a["spending_per_year"] - housing
            cash = (cash * (1 + r) if cash > 0 else cash) + net
            from_pot = 0
            if cash < 0 and cash_gap_age is None:
                cash_gap_age = age
            salary *= 1 + g
            phase = "working"
        else:
            if age == a["retire_age"]:
                fall = s.get("fall_at_retirement_pct", 0) / 100
                pot *= 1 - fall
                cash = cash * (1 - fall) if cash > 0 else cash
                tfc_taken = min(pot * a["tax_free_cash_pct"] / 100, LUMP_SUM_ALLOWANCE)
                pot -= tfc_taken
                cash += tfc_taken
            sp = state if age >= a["state_pension_age"] else 0
            need = spend_ret + housing
            net_sp = sp - income_tax(sp)
            shortfall = max(0, need - net_sp)
            from_pot = gross_up(shortfall, sp, pot) if age >= mpa else 0
            from_pot = min(from_pot, pot)
            net_from_pot = from_pot - (income_tax(sp + from_pot) - income_tax(sp))
            income = net_sp + net_from_pot
            pot = (pot - from_pot) * (1 + r)
            net = income - need
            cash = (cash * (1 + r) if cash > 0 else cash) + net
            phase = "retired"
        if cash < 0 and pot <= 1 and runs_out is None:
            runs_out = age
        rows.append({"age": age, "phase": phase, "income_net": round(income),
                     "spending": round(a["spending_per_year"] if phase == "working" else spend_ret),
                     "housing": round(housing), "from_pension": round(from_pot),
                     "pension_pot": round(pot), "savings": round(cash)})
    return {"rows": rows, "money_runs_out_at_age": runs_out,
            "savings_negative_while_working_at_age": cash_gap_age,
            "tax_free_cash": round(tfc_taken),
            "liquid_at_end": round(pot + cash), "end_age": end_age}


def _runs_out_label(p):
    return f"runs out at {p['money_runs_out_at_age']}" if p["money_runs_out_at_age"] \
        else f"lasts to {p['end_age']}"


def financial_plan(ff: dict) -> dict:
    questions = validate(ff)
    if questions:
        return {"status": "needs_more_information", "questions": questions}

    a = {**DEFAULTS, **ff}
    results = {name: project(ff, s) for name, s in SCENARIOS.items()}
    base = results["base"]

    # --- Levers: measured effects, not recommendations -------------------------
    levers = {}
    for name, change in {
        "spend_10pct_less": {"spending_per_year": a["spending_per_year"] * 0.9,
                             "spending_in_retirement": (a["spending_in_retirement"] or a["spending_per_year"]) * 0.9},
        "retire_2_years_later": {"retire_age": a["retire_age"] + 2},
        "pension_plus_2pct": {"employee_pension_pct": a["employee_pension_pct"] + 2},
    }.items():
        alt = copy.deepcopy(ff); alt.update(change)
        p = project(alt, {})
        levers[name] = {"base": _runs_out_label(base), "with_change": _runs_out_label(p),
                        "liquid_at_end_change": p["liquid_at_end"] - base["liquid_at_end"]}

    # --- Findings ----------------------------------------------------------------
    first = base["rows"][0]
    yearly_gap = first["income_net"] - first["spending"] - first["housing"]
    passed = [n for n, p in results.items() if p["money_runs_out_at_age"] is None]
    h = a["housing"]
    findings = {
        "cashflow_today": {"net_income": first["income_net"], "spending": first["spending"],
                           "housing": first["housing"], "surplus_or_gap": yearly_gap},
        "milestones": {
            "mortgage_paid_off_age": a["age"] + h["years_left"] if h["type"] == "own" else None,
            "retire_age": a["retire_age"], "state_pension_age": a["state_pension_age"],
            "bridge_years_before_state_pension": max(0, a["state_pension_age"] - a["retire_age"]),
            "earliest_pension_access_age": min_pension_age(2026 - a["age"]),
            "tax_free_cash": base["tax_free_cash"],
        },
        "scenarios": {n: {"outcome": _runs_out_label(p), "liquid_at_end": p["liquid_at_end"],
                          "savings_negative_while_working_at_age": p["savings_negative_while_working_at_age"]}
                      for n, p in results.items()},
        "resilience": f"{len(passed)} of {len(results)} scenarios last to the end",
        "levers": levers,
    }

    flags = []
    if yearly_gap < 0:
        flags.append(f"Spending and housing exceed take-home pay by £{-yearly_gap:,.0f} a year today.")
    if base["savings_negative_while_working_at_age"]:
        flags.append(f"Savings fall below zero at {base['savings_negative_while_working_at_age']}, "
                     "before pensions can be accessed.")
    if a["retire_age"] < findings["milestones"]["earliest_pension_access_age"]:
        flags.append("Retirement is before the earliest pension access age.")
    if a["ni_qualifying_years"] < STATE_PENSION_FULL_YEARS:
        flags.append("NI record short of the full State Pension.")

    return {
        "status": "complete",
        "money": "today's money (real terms), net of tax and fees",
        "findings": findings,
        "flags": flags,
        "assumptions": [{"name": k, "value": a.get(k, "see reason"), "reason": v}
                        for k, v in ASSUMPTION_REASONS.items()],
        "base_projection": base["rows"],
        "report_sections": ["Your situation today", "Your goals", "Base projection",
                            "Stress tests", "What moves the numbers", "Assumptions",
                            "Data gaps", "Important information"],
        "required_footer": ("This is a financial planning projection based on the information and "
                            "assumptions above. It is not financial advice or a recommendation. "
                            "Projections are not guaranteed; investments can fall as well as rise. "
                            "For free, impartial pension guidance, contact Pension Wise (MoneyHelper); "
                            "for advice on your circumstances, speak to an FCA-regulated adviser."),
    }
