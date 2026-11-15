import pytest
from financial_plan import financial_plan, take_home, mortgage_payment, ni, SCENARIOS

EXAMPLE = {
    "age": 50, "retire_age": 67, "gross_salary": 70_000,
    "employee_pension_pct": 5, "employer_pension_pct": 5,
    "pension_pot": 60_000, "savings": 80_000, "spending_per_year": 30_000,
    "housing": {"type": "own", "home_value": 450_000, "mortgage_left": 290_000,
                "mortgage_rate_pct": 4.5, "years_left": 16},
    "has_partner": False,
}


# --- cross-checks against the live FinancePlots tools -------------------------
def test_take_home_matches_take_home_pay_tool():
    assert take_home(70_000, 5) == pytest.approx(49_127.40, abs=0.01)

def test_ni_matches_take_home_pay_tool():
    assert ni(66_500) == pytest.approx(3_340.60, abs=0.01)

def test_mortgage_matches_loan_repayment_tool():
    assert mortgage_payment(290_000, 4.5, 16) == pytest.approx(2_121.57, abs=0.01)


# --- standards enforced in code ------------------------------------------------
def test_missing_inputs_return_questions_not_a_plan():
    r = financial_plan({"age": 50})
    assert r["status"] == "needs_more_information"
    fields = {q["field"] for q in r["questions"]}
    assert {"retire_age", "spending_per_year", "housing"} <= fields

def test_owner_needs_mortgage_details():
    ff = {**EXAMPLE, "housing": {"type": "own", "home_value": 450_000}}
    r = financial_plan(ff)
    assert any(q["field"] == "housing.years_left" for q in r["questions"])

def test_partner_must_be_clarified():
    r = financial_plan({**EXAMPLE, "has_partner": True})
    assert r["status"] == "needs_more_information"

def test_all_stress_tests_always_run():
    r = financial_plan(EXAMPLE)
    assert set(r["findings"]["scenarios"]) == set(SCENARIOS)

def test_market_fall_is_never_better_than_base():
    s = financial_plan(EXAMPLE)["findings"]["scenarios"]
    assert s["market_fall"]["liquid_at_end"] <= s["base"]["liquid_at_end"]

def test_live_to_100_projects_to_100():
    r = financial_plan(EXAMPLE)
    assert "100" in r["findings"]["scenarios"]["live_to_100"]["outcome"] or \
           r["findings"]["scenarios"]["live_to_100"]["outcome"].startswith("runs out")

def test_gap_today_is_flagged():
    r = financial_plan(EXAMPLE)
    assert r["findings"]["cashflow_today"]["surplus_or_gap"] < 0
    assert any("exceed take-home" in f for f in r["flags"])

def test_footer_and_assumptions_always_present():
    r = financial_plan(EXAMPLE)
    assert "not financial advice" in r["required_footer"]
    assert all(a["reason"] for a in r["assumptions"])

def test_no_advice_words_in_output():
    text = str(financial_plan(EXAMPLE)).lower()
    for banned in ("you should", "we recommend", "you must"):
        assert banned not in text
