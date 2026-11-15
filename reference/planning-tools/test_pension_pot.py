import pytest
from pension_pot import income_tax, pension_pot, min_pension_age


# Income tax - matches FinancePlots take_home_pay (£70k, 5% sacrifice -> £14,032)
def test_tax_matches_take_home_pay_tool():
    assert income_tax(70_000 - 3_500) == 14_032

def test_tax_personal_allowance_taper():
    assert income_tax(110_000) == 33_432          # PA cut to £7,570

def test_tax_below_allowance():
    assert income_tax(12_547.60) == 0             # full State Pension alone: no tax

def test_tax_additional_rate():
    assert income_tax(150_000) == pytest.approx(53_703, abs=1)


def test_min_pension_age_rises_to_57():
    assert min_pension_age(1970) == 55            # turns 55 in 2025
    assert min_pension_age(1976) == 57            # turns 55 in 2031


# Zero real growth: the pot just splits evenly over the years
def test_zero_growth_even_split():
    r = pension_pot(age=60, pot_today=100_000, retire_age=67, plan_to_age=77,
                    ni_qualifying_years=0, tax_free_cash_pct=0,
                    return_pct=2.5, return_in_retirement_pct=2.5,
                    fee_pct=0, inflation_pct=2.5)
    assert r["at_retirement"]["pot"] == 100_000
    assert r["sustainable_income"]["gross_per_year"] == pytest.approx(10_000, abs=2)
    assert r["drawdown"][-1]["pot_end"] == pytest.approx(0, abs=5)


def test_tax_free_cash_capped():
    r = pension_pot(age=60, pot_today=2_000_000, retire_age=67)
    assert r["at_retirement"]["tax_free_cash"] == 268_275


def test_target_runs_out():
    r = pension_pot(age=60, pot_today=50_000, retire_age=67, target_income=40_000)
    assert r["target"]["lasts_to_plan_age"] is False
    assert 67 <= r["target"]["pot_runs_out_at_age"] < 95


def test_warns_retiring_too_early():
    r = pension_pot(age=50, pot_today=100_000, retire_age=55, birth_year=1976)
    assert any("57" in w for w in r["warnings"])


def test_bridge_years():
    r = pension_pot(age=50, pot_today=300_000, retire_age=60, state_pension_age=67)
    assert r["state_pension"]["bridge_years_before_it"] == 7
    first = r["drawdown"][0]
    assert first["state_pension"] == 0 and first["from_pot"] > 0
