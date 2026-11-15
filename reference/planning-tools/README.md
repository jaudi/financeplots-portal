# Planning tools: reference designs (not yet live)

This folder holds Python reference implementations and specs for two new MCP tools, plus the agent prompt that uses them. **Nothing here is wired into the site or `/api/mcp`.** These files are the answer key for porting the tools into TypeScript.

| File | What it is |
|---|---|
| `pension_pot.py`, `SPEC-pension_pot.md` | A UK defined-contribution pot: growth, tax-free cash, State Pension, and the sustainable income to a chosen age. The output `life_plan_pension_per_year` feeds `life_plan`'s `retire` event. |
| `financial_plan.py`, `SPEC-financial_plan.md` | Fact-find → structured findings. The standards are enforced in code: missing inputs return questions, 5 stress tests always run, 3 levers are measured as effects, and every assumption comes with a reason. |
| `planning_session_prompt.md` | An MCP **prompt** that makes Claude the planning agent: fact-find, then `financial_plan`, then an 8-section report, with wording rules that keep it planning, not advice. |
| `test_*.py` | 22 tests. Run `python -m pytest -q` in this folder. |

## Cross-checks already pinned
- Income tax and NI match `take_home_pay` (£70k with 5% salary sacrifice gives £49,127.40 take-home).
- The mortgage payment matches `loan_repayment` (£290k at 4.5% over 16 years gives £2,121.57 a month).

## Porting checklist (follow CLAUDE.md conventions)
1. Put the maths in `lib/pension-pot.ts` and `lib/financial-plan.ts`. Reuse the tax and NI code behind `takeHomePay()` in `lib/calculators.ts`, and `monthlyPayment()`. Don't duplicate rates: `TAX_YEAR` constants change together each April.
2. Register the tools in `lib/mcp-server.ts` and add their names to `MCP_TOOL_NAMES` in `lib/mcp-tools.ts` (`tests/mcp-app.test.ts` checks this).
3. Register `planning_session` as an MCP prompt (`server.registerPrompt`).
4. Port the tests to `tests/` (Vitest, through the real server via `tests/mcp-client.ts`). Pin the Python outputs. For example, `pension_pot`: age 50, £60k pot, £70k salary, 5% + 5%, retiring at 67 → pot £229,395, net £18,139 a year.
5. Charts through `ChartSpec` (`lib/charts/tool-charts.ts`). Colours by position, never good/bad.
6. Update the hand-written tool list on `/mcp` (the `mcp` message namespace, en + es).
7. No Claude API calls in the tools (the open-bill rule). The agent is the user's own Claude.

## Not advice
These tools model scenarios. They never recommend. `test_no_advice_words_in_output` fails if "you should", "we recommend" or "you must" appears in the output; keep an equivalent test in the TypeScript port.
