# pension_pot: FinancePlots tool spec

**One line for the MCP description:** a UK defined-contribution pension pot grown to retirement, with tax-free cash, then the income it can pay until a chosen age alongside the State Pension. Everything is in today's money. `life_plan_pension_per_year` feeds straight into `life_plan`'s `retire` event.

## Inputs
| Field | Default | Notes |
|---|---|---|
| age, pot_today | required | |
| salary, employee_pct, employer_pct, extra_monthly | 0 | contributions; salary grows at pay_growth_pct |
| retire_age / plan_to_age | 67 / 95 | warns if below the minimum pension age (55, rising to 57 from Apr 2028) |
| state_pension_age, ni_qualifying_years | 67 / 35 | £12,547.60 full rate 2026/27, pro rata, nothing under 10 years |
| tax_free_cash_pct | 25 | capped at the £268,275 lump sum allowance |
| target_income | none | optional: does this gross income last? |
| return_pct, return_in_retirement_pct, fee_pct, inflation_pct, pay_growth_pct | 5, 4, 0.5, 2.5, 3 | user assumptions |

## Outputs
- `at_retirement`: pot (real and nominal), paid in, growth, tax-free cash
- `state_pension`: amount, start age, **bridge years** (retirement years before it starts)
- `sustainable_income`: gross, from the pot, net a year and a month, `life_plan_pension_per_year`
- `target`: the age the pot runs out at the target income
- `accumulation` and `drawdown` year-by-year tables
- `warnings`: early access, annual allowance (£60k), NI gaps

## Method
Monthly real-terms growth to retirement. At retirement, take the tax-free cash. Then binary-search the constant total gross income (State Pension plus pot) that empties the pot exactly at plan_to_age. Income tax uses 2026/27 England/Wales/NI bands with the personal allowance taper.

## Not modelled (v2 ideas)
Defined benefit pensions, annuities, Scottish bands, the Money Purchase Annual Allowance after first drawdown, inheritance tax on pensions from April 2027, a second earner, and higher-rate relief claimed through self-assessment.

## Chart ideas (match life_plan's style)
1. Pot over time: an area chart of contributions against growth, then drawdown.
2. Retirement income stacked by year: State Pension plus pot, with a net-income line.
