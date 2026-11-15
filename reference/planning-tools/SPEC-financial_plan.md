# financial_plan: FinancePlots tool spec (v1)

**Purpose:** one call turns a complete fact-find into structured planning findings. The quality standards live in code, not in the prompt, so they can't be skipped.

## Architecture
```
Claude (agent)  ── planning_session prompt: fact-find, wording rules, report
     │
     ▼ calls
financial_plan (MCP tool)   ← standards enforced here
     ├─ validate inputs → questions if incomplete
     ├─ take-home, mortgage, pension (pension_pot logic), household projection
     ├─ 5 scenarios ALWAYS: base, market fall 20% at retirement,
     │   returns −2pp, inflation +2pp, live to 100
     ├─ 3 levers measured: spend −10%, retire +2y, pension +2%
     └─ assumptions + reasons, flags, report sections, fixed footer
```

## Standards it enforces (from the FCA's cashflow modelling expectations and ISO 22222)
| Standard | How |
|---|---|
| Complete, current inputs | `validate()` returns questions, not a plan |
| Real terms, net of tax | the whole projection is in today's money, with income tax and NI |
| All charges included | `fee_pct` deducted from every return |
| Stress test a fall at retirement | the `market_fall` scenario always runs |
| Beyond life expectancy | to 95 by default, with 100 always tested |
| Justified assumptions | every assumption is returned with its reason |
| No advice | levers are reported as effects; a test bans advice wording |

## Cross-checks (tests)
Take-home pay, NI and the mortgage payment match the live FinancePlots `take_home_pay` and `loan_repayment` tools exactly.

## v2
- A real two-person model (partner's salary, pots and State Pension)
- Defined benefit pensions
- ISA vs pension drawdown order
- Goals as dated events (university, a car, helping children)
- Stochastic (Monte Carlo) probability of success
- Inheritance tax on pensions from April 2027
