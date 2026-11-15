"""
pension_pot - FinancePlots tool (reference implementation)

UK defined-contribution pension pot: grows the pot to retirement, takes
tax-free cash, then finds the income it can pay until a chosen age,
alongside the State Pension. Everything is in TODAY'S MONEY (real terms),
so the result can be passed straight into life_plan's `retire` event as
`pension_per_year`.

Rules and figures: tax year 2026/27, England/Wales/NI income tax bands.
All growth rates are the user's assumptions - a planning sketch, not advice.
"""

from __future__ import annotations

# --- UK constants, 2026/27 ---------------------------------------------------
STATE_PENSION_FULL = 12_547.60      # £241.30 a week x 52
STATE_PENSION_FULL_YEARS = 35       # qualifying NI years for the full rate
STATE_PENSION_MIN_YEARS = 10        # below this: nothing
LUMP_SUM_ALLOWANCE = 268_275        # cap on total tax-free cash
ANNUAL_ALLOWANCE = 60_000           # contributions a year before a tax charge
PERSONAL_ALLOWANCE = 12_570
BASIC_LIMIT = 50_270
HIGHER_LIMIT = 125_140
TAPER_START = 100_000


def min_pension_age(birth_year: int) -> int:
    """Normal minimum pension age: 55, rising to 57 from 6 April 2028.
    Simplified: anyone who turns 55 after 2028 gets 57."""
    return 55 if birth_year + 55 < 2028 else 57


def income_tax(gross: float) -> float:
    """Income tax on a year's taxable income (England/Wales/NI, 2026/27),
    with the personal allowance withdrawn £1 for every £2 over £100k."""
    pa = max(0.0, PERSONAL_ALLOWANCE - max(0.0, gross - TAPER_START) / 2)
    taxable = max(0.0, gross - pa)
    basic_band = BASIC_LIMIT - PERSONAL_ALLOWANCE           # £37,700
    tax = min(taxable, basic_band) * 0.20
    if taxable > basic_band:
        higher_band_top = HIGHER_LIMIT - pa if pa else HIGHER_LIMIT
        tax += (min(taxable, higher_band_top) - basic_band) * 0.40
        if taxable > higher_band_top:
            tax += (taxable - higher_band_top) * 0.45
    return round(tax, 2)


def _real_rate(nominal_pct: float, fee_pct: float, inflation_pct: float) -> float:
    return (1 + (nominal_pct - fee_pct) / 100) / (1 + inflation_pct / 100) - 1


def _drawdown(pot: float, start_age: int, end_age: int, total_income: float,
              state_from: int, state_amount: float, r_real: float):
    """Year-by-year drawdown. The pot tops up the State Pension to
    `total_income` (gross, today's money). Withdrawal at the start of the
    year, growth on the rest. Returns (rows, age the pot runs out or None)."""
    rows, ran_out = [], None
    for age in range(start_age, end_age):
        state = state_amount if age >= state_from else 0.0
        wanted = max(0.0, total_income - state)
        taken = min(wanted, max(pot, 0.0))
        if taken < wanted - 0.5 and ran_out is None:
            ran_out = age
        pot = (pot - taken) * (1 + r_real)
        gross = state + taken
        rows.append({
            "age": age,
            "state_pension": round(state),
            "from_pot": round(taken),
            "gross_income": round(gross),
            "tax": round(income_tax(gross)),
            "net_income": round(gross - income_tax(gross)),
            "pot_end": round(max(pot, 0.0)),
        })
    return rows, ran_out


def pension_pot(
    age: int,
    pot_today: float,
    salary: float = 0,
    employee_pct: float = 0,
    employer_pct: float = 0,
    extra_monthly: float = 0,
    retire_age: int = 67,
    plan_to_age: int = 95,
    state_pension_age: int = 67,
    ni_qualifying_years: int = 35,
    tax_free_cash_pct: float = 25,
    target_income: float | None = None,
    return_pct: float = 5.0,
    return_in_retirement_pct: float = 4.0,
    fee_pct: float = 0.5,
    inflation_pct: float = 2.5,
    pay_growth_pct: float = 3.0,
    birth_year: int | None = None,
) -> dict:
    if not 18 <= age < retire_age < plan_to_age <= 110:
        raise ValueError("Need 18 <= age < retire_age < plan_to_age <= 110")
    if not 0 <= tax_free_cash_pct <= 25:
        raise ValueError("tax_free_cash_pct must be 0-25")

    warnings = []
    birth_year = birth_year or 2026 - age
    mpa = min_pension_age(birth_year)
    if retire_age < mpa:
        warnings.append(f"Pension can't normally be accessed before {mpa}; "
                        f"retiring at {retire_age} needs other money until then.")

    # --- 1. Accumulation (monthly, real terms) ---------------------------------
    r_acc = (1 + _real_rate(return_pct, fee_pct, inflation_pct)) ** (1 / 12) - 1
    g_pay = (1 + pay_growth_pct / 100) / (1 + inflation_pct / 100) - 1
    pot, paid_in, growth_rows = pot_today, 0.0, []
    sal = salary
    for year in range(retire_age - age):
        yearly_contrib = sal * (employee_pct + employer_pct) / 100 + extra_monthly * 12
        if yearly_contrib > ANNUAL_ALLOWANCE and year == 0:
            warnings.append(f"Contributions of £{yearly_contrib:,.0f} a year exceed "
                            f"the £{ANNUAL_ALLOWANCE:,} annual allowance.")
        for _ in range(12):
            pot = pot * (1 + r_acc) + yearly_contrib / 12
        paid_in += yearly_contrib
        growth_rows.append({"age": age + year + 1, "contributions": round(yearly_contrib),
                            "pot_end": round(pot)})
        sal *= 1 + g_pay

    pot_at_retirement = pot
    nominal_at_retirement = pot * (1 + inflation_pct / 100) ** (retire_age - age)

    # --- 2. Tax-free cash ---------------------------------------------------
    tfc = min(pot * tax_free_cash_pct / 100, LUMP_SUM_ALLOWANCE)
    pot_for_income = pot - tfc

    # --- 3. State Pension -------------------------------------------------------
    yrs = min(ni_qualifying_years, STATE_PENSION_FULL_YEARS)
    state = 0.0 if yrs < STATE_PENSION_MIN_YEARS else STATE_PENSION_FULL * yrs / STATE_PENSION_FULL_YEARS
    if yrs < STATE_PENSION_FULL_YEARS:
        warnings.append(f"{STATE_PENSION_FULL_YEARS - yrs} NI years short of the full "
                        "State Pension; check gov.uk/check-state-pension.")
    bridge_years = max(0, state_pension_age - retire_age)

    # --- 4. Sustainable income: binary search for the total gross income
    #        (State Pension + pot) that empties the pot exactly at plan_to_age
    r_ret = _real_rate(return_in_retirement_pct, fee_pct, inflation_pct)
    lo, hi = 0.0, 500_000.0
    for _ in range(60):
        mid = (lo + hi) / 2
        _, out = _drawdown(pot_for_income, retire_age, plan_to_age, mid,
                           state_pension_age, state, r_ret)
        lo, hi = (mid, hi) if out is None else (lo, mid)
    sustainable = lo
    sust_rows, _ = _drawdown(pot_for_income, retire_age, plan_to_age, sustainable,
                             state_pension_age, state, r_ret)
    # the steady-state year: after the State Pension has started
    steady = next((r for r in sust_rows if r["age"] >= state_pension_age), sust_rows[0])

    result = {
        "currency": "GBP",
        "money": "today's money (real terms)",
        "at_retirement": {
            "age": retire_age,
            "pot": round(pot_at_retirement),
            "pot_nominal": round(nominal_at_retirement),
            "paid_in": round(paid_in),
            "growth": round(pot_at_retirement - pot_today - paid_in),
            "tax_free_cash": round(tfc),
            "pot_for_income": round(pot_for_income),
        },
        "state_pension": {
            "per_year": round(state),
            "from_age": state_pension_age,
            "bridge_years_before_it": bridge_years,
        },
        "sustainable_income": {
            "until_age": plan_to_age,
            "gross_per_year": round(sustainable),
            "from_pot_per_year": round(max(0, sustainable - state)),
            "net_per_year": steady["net_income"],
            "net_per_month": round(steady["net_income"] / 12),
            # feed this into life_plan's retire event:
            "life_plan_pension_per_year": steady["net_income"],
        },
        "accumulation": growth_rows,
        "drawdown": sust_rows,
        "warnings": warnings,
        "assumptions": ("Real terms: returns net of fees and inflation; tax bands held "
                        "at 2026/27 levels in today's money; State Pension rises with "
                        "inflation; tax-free cash taken at retirement; England/Wales/NI "
                        "tax. A planning sketch, not advice."),
    }

    # --- 5. Optional: does a target income last? -------------------------------
    if target_income is not None:
        t_rows, ran_out = _drawdown(pot_for_income, retire_age, plan_to_age,
                                    target_income, state_pension_age, state, r_ret)
        result["target"] = {
            "gross_per_year": round(target_income),
            "pot_runs_out_at_age": ran_out,
            "lasts_to_plan_age": ran_out is None,
        }
    return result
