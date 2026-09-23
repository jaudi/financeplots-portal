import { McpServer } from "@modelcontextprotocol/sdk/server/mcp.js";
import { z } from "zod";
import { breakEven, buildSchedule, compoundGrowth, INDUSTRIES, startupValuation, valuation, youngCompanyDcf } from "@/lib/calculators";
import { compoundInterestChart } from "@/lib/charts";
import { fetchIndicators } from "@/lib/fred";
import { getMarketQuotes } from "@/lib/markets";
import { analysePortfolio, convertPoints, majorCurrency } from "@/lib/portfolio-stats";
import { getPriceHistory, isUnknownSymbol, normaliseSymbol, PRICE_RANGES, thin } from "@/lib/prices";
import { METRIC_KEYS, METRICS, type MetricKey } from "@/lib/stock-metrics";
import { getUniverse, UNIVERSE_SCREENS } from "@/lib/universe";

// The FinancePlots MCP server, served at /api/mcp. It exposes the same
// calculators and data the tool pages use, so an AI assistant gets the figures
// the site would show for the same inputs.
//
// The stock screener tool keeps the page's neutrality rules (UK MAR, see
// CLAUDE.md): it needs at least one criterion, returns companies alphabetically
// by ticker with raw figures only, and never scores, ranks or recommends. Don't
// add a tool that returns a curated or ordered list of named securities.

const SITE = "https://www.financeplots.com";

const INSTRUCTIONS = `FinancePlots (${SITE}) — free finance and FP&A tools.
Calculators: loan_repayment, compound_interest, break_even, business_valuation (with industry_multiples), startup_valuation (Damodaran's DCF for young or loss-making companies, revenue multiple, funding-round price, cash runway).
Data: us_macro_indicators (FRED), market_snapshot, price_history and portfolio_analysis (Yahoo Finance), screen_stocks and screener_metrics (S&P 500, Nasdaq-100 and IBEX 35 fundamentals, refreshed weekly).
All figures are for education and planning. Nothing returned is investment advice or a recommendation: the stock screener only filters by criteria the user sets and lists matches alphabetically.`;

function json(data: unknown) {
  return { content: [{ type: "text" as const, text: JSON.stringify(data, null, 2) }] };
}

function error(message: string) {
  return { content: [{ type: "text" as const, text: message }], isError: true };
}

const round2 = (n: number) => Math.round(n * 100) / 100;
const readOnly = { readOnlyHint: true, destructiveHint: false, openWorldHint: false } as const;

export function createFinancePlotsServer() {
  const server = new McpServer(
    { name: "financeplots", title: "FinancePlots", version: "1.0.0", websiteUrl: SITE },
    { instructions: INSTRUCTIONS },
  );

  // ── Calculators ──────────────────────────────────────────────────────────

  server.registerTool(
    "loan_repayment",
    {
      title: "Loan / mortgage repayment",
      description:
        "Repayment schedule for a fixed-rate, fully amortising loan or mortgage with monthly payments. Returns the monthly payment, total interest and a year-by-year summary of interest, principal and remaining balance.",
      inputSchema: {
        amount: z.number().positive().describe("Amount borrowed"),
        annual_rate_pct: z.number().min(0).max(100).describe("Annual interest rate in percent, e.g. 4.5"),
        years: z.number().int().min(1).max(50).describe("Term in years"),
      },
      annotations: readOnly,
    },
    async ({ amount, annual_rate_pct, years }) => {
      const schedule = buildSchedule(annual_rate_pct / 100, years, amount);
      const yearly = [];
      for (let y = 0; y < years; y++) {
        const rows = schedule.slice(y * 12, y * 12 + 12);
        yearly.push({
          year: y + 1,
          interest: round2(rows.reduce((s, r) => s + r.interest, 0)),
          principal: round2(rows.reduce((s, r) => s + r.principal, 0)),
          closing_balance: round2(rows[rows.length - 1].balance),
        });
      }
      return json({
        monthly_payment: round2(schedule[0].payment),
        total_paid: round2(schedule.reduce((s, r) => s + r.payment, 0)),
        total_interest: round2(schedule.reduce((s, r) => s + r.interest, 0)),
        yearly,
        tool_page: `${SITE}/tools/lending`,
      });
    },
  );

  server.registerTool(
    "compound_interest",
    {
      title: "Compound interest",
      description:
        "Grows an initial sum plus a fixed monthly contribution at an assumed annual return, compounded monthly. Returns the final value, total contributed, interest earned, a year-by-year table and, unless `chart` is false, a PNG chart of contributions and growth by year to show the user. The return is an assumption the user supplies, not a forecast.",
      inputSchema: {
        initial_capital: z.number().min(0).describe("Starting amount"),
        monthly_contribution: z.number().min(0).describe("Amount added at the end of every month"),
        annual_return_pct: z.number().min(-50).max(100).describe("Assumed annual return in percent, e.g. 7"),
        years: z.number().int().min(1).max(80).describe("Number of years"),
        chart: z.boolean().default(true).describe("Include a PNG chart of the year-by-year growth"),
      },
      annotations: readOnly,
    },
    async ({ initial_capital, monthly_contribution, annual_return_pct, years, chart }) => {
      const r = compoundGrowth(initial_capital, monthly_contribution, years, annual_return_pct);
      const result = json({
        final_value: r.finalValue,
        total_contributed: r.totalInvested,
        interest_earned: r.totalInterest,
        return_multiple: round2(r.returnMultiple),
        yearly: r.rows,
        tool_page: `${SITE}/tools/compound-interest`,
      });
      if (!chart) return result;
      try {
        const data = await compoundInterestChart(r.rows, `Compound growth at ${annual_return_pct}% a year over ${years} years`);
        return { content: [...result.content, { type: "image" as const, data, mimeType: "image/png" }] };
      } catch {
        return result; // the numbers are complete without the picture
      }
    },
  );

  server.registerTool(
    "break_even",
    {
      title: "Break-even analysis",
      description:
        "Break-even point for a product or business: contribution margin, units and revenue needed to cover fixed costs, and — if current volume is given — current profit and margin of safety.",
      inputSchema: {
        fixed_costs: z.number().min(0).describe("Total fixed costs for the period (rent, payroll, etc.)"),
        selling_price: z.number().positive().describe("Selling price per unit"),
        variable_cost: z.number().min(0).describe("Variable cost per unit"),
        current_units: z.number().min(0).optional().describe("Units currently sold in the period, if known"),
      },
      annotations: readOnly,
    },
    async ({ fixed_costs, selling_price, variable_cost, current_units }) => {
      const r = breakEven(fixed_costs, selling_price, variable_cost, current_units ?? 0);
      if (r.bepUnits === null) {
        return error("The selling price must be higher than the variable cost per unit, otherwise the business never breaks even.");
      }
      return json({
        contribution_margin_per_unit: round2(r.cm),
        contribution_margin_ratio_pct: round2(r.cmRatio * 100),
        break_even_units: round2(r.bepUnits),
        break_even_revenue: round2(r.bepRevenue ?? 0),
        ...(current_units !== undefined && {
          current_revenue: round2(r.currentRevenue),
          current_profit: round2(r.currentProfit),
          margin_of_safety_units: round2(r.mosUnits ?? 0),
          margin_of_safety_pct: r.mosPct === null ? null : round2(r.mosPct),
        }),
        tool_page: `${SITE}/tools/break-even`,
      });
    },
  );

  server.registerTool(
    "industry_multiples",
    {
      title: "Industry valuation multiples",
      description:
        "Industry averages by industry (Damodaran, January 2026): EV/EBITDA, EV/Sales and forward P/E multiples, plus pre-tax operating margin, sales-to-invested-capital and cost of capital. Use an id with business_valuation or startup_valuation.",
      inputSchema: {},
      annotations: readOnly,
    },
    async () =>
      json({
        source: "Aswath Damodaran, NYU Stern — US industry averages, January 2026",
        industries: INDUSTRIES.map((i) => ({
          id: i.id,
          label: i.label,
          ev_ebitda: i.ebitda,
          ev_sales: i.evSales,
          pe: i.pe,
          operating_margin_pct: i.opMargin,
          sales_to_capital: i.salesToCapital,
          cost_of_capital_pct: i.costOfCapital,
        })),
      }),
  );

  server.registerTool(
    "business_valuation",
    {
      title: "Business valuation (DCF + multiples)",
      description:
        "Values an established, profitable private business four ways — a five-year discounted cash flow with a terminal value, EV/EBITDA, EV/Sales and P/E — and averages them. The DCF and EV multiples give enterprise value and P/E gives equity value, so each is converted with `net_debt` and both an equity value (what the shares are worth) and an enterprise value are returned, each with its own average. " +
        "A method whose input is zero or negative (negative EBITDA, a net loss or negative free cash flow) returns null and is left out of the average; if EBITDA, net income and free cash flow are all zero or negative the call is rejected — use startup_valuation, which is built for loss-making companies. " +
        "Multiples and the discount rate default to `industry` (see industry_multiples), which are averages for US listed companies; a small private company usually deserves a higher discount rate and a `private_discount_pct`. " +
        "`warnings` flags inputs to check, including methods that disagree by more than 2x. For planning and education; not a fairness opinion.",
      inputSchema: {
        revenue: z.number().min(0).describe("Annual revenue"),
        ebitda: z.number().describe("Annual EBITDA"),
        net_income: z.number().describe("Annual net income (trailing)"),
        free_cash_flow: z
          .number()
          .describe(
            "Annual free cash flow to the firm (FCFF): operating cash flow after tax, capex and working capital, before interest and debt repayments — it is discounted at WACC. Year 0, grown from here.",
          ),
        growth_rate_pct: z.number().min(-50).max(100).default(10).describe("Annual FCF growth for years 1–5, percent"),
        discount_rate_pct: z
          .number()
          .min(0)
          .max(100)
          .optional()
          .describe("Discount rate (WACC), percent. Defaults to the industry's cost of capital if `industry` is given, else 12"),
        terminal_growth_pct: z.number().min(-10).max(20).default(2.5).describe("Growth after year 5, percent; must be below the discount rate"),
        industry: z.enum(INDUSTRIES.map((i) => i.id) as [string, ...string[]]).optional().describe("Industry id for default multiples and discount rate"),
        ev_ebitda_multiple: z.number().min(0).optional().describe("Overrides the industry EV/EBITDA multiple"),
        ev_sales_multiple: z.number().min(0).optional().describe("Overrides the industry EV/Sales multiple"),
        pe_ratio: z
          .number()
          .min(0)
          .optional()
          .describe("Overrides the industry P/E. The industry figure is a forward P/E of listed companies; applied to trailing net income it overstates a growing company"),
        net_debt: z.number().default(0).describe("Debt minus cash; negative if the company holds more cash than debt"),
        private_discount_pct: z
          .number()
          .min(0)
          .max(90)
          .default(0)
          .describe("Optional discount for a private, illiquid company, percent (20–30 is common). Taken off enterprise value only, so cash isn't discounted"),
      },
      annotations: readOnly,
    },
    async (a) => {
      if (a.ebitda <= 0 && a.net_income <= 0 && a.free_cash_flow <= 0) {
        return error(
          "EBITDA, net income and free cash flow are all zero or negative, so the DCF, EV/EBITDA and P/E methods give no meaningful value. Use startup_valuation instead: its DCF projects the path from losses to a mature margin, and its revenue multiple works without profits.",
        );
      }
      const ind = INDUSTRIES.find((i) => i.id === a.industry);
      const discountRate = a.discount_rate_pct ?? ind?.costOfCapital ?? 12;
      if (a.terminal_growth_pct >= discountRate) {
        return error(`terminal_growth_pct must be lower than the discount rate (${discountRate}%), or the terminal value is infinite.`);
      }
      // Same defaults as the valuation page when no industry is chosen.
      const ebitdaMultiple = a.ev_ebitda_multiple ?? ind?.ebitda ?? 8;
      const evSalesMultiple = a.ev_sales_multiple ?? ind?.evSales ?? 2;
      const peRatio = a.pe_ratio ?? ind?.pe ?? 15;
      const r = valuation({
        revenue: a.revenue,
        ebitda: a.ebitda,
        netIncome: a.net_income,
        fcf: a.free_cash_flow,
        growthRatePct: a.growth_rate_pct,
        discountRatePct: discountRate,
        terminalGrowthPct: a.terminal_growth_pct,
        ebitdaMultiple,
        evSalesMultiple,
        peRatio,
        netDebt: a.net_debt,
        privateDiscountPct: a.private_discount_pct,
      });

      const u = r.usable;
      const names = { dcf: "DCF", evEbitda: "EV/EBITDA", evSales: "EV/Sales", pe: "P/E" } as const;
      const keys = Object.keys(names) as (keyof typeof names)[];
      const used = keys.filter((k) => u[k]);
      const byMethod = (m: typeof r.equity) => ({
        dcf: u.dcf ? m.dcf : null,
        ev_ebitda: u.evEbitda ? m.evEbitda : null,
        ev_sales: u.evSales ? m.evSales : null,
        pe: u.pe ? m.pe : null,
        average: used.length ? m.average : null,
      });

      const warnings: string[] = [];
      const excluded = keys.filter((k) => !u[k]).map((k) => names[k]);
      if (excluded.length) {
        warnings.push(`Left out (their input is zero or negative): ${excluded.join(", ")}. For a loss-making company, startup_valuation is the better tool.`);
      }
      // Compare on enterprise value so net debt doesn't distort the ratio.
      const positive = used.filter((k) => r.enterprise[k] > 0);
      if (positive.length >= 2) {
        const lo = positive.reduce((m, k) => (r.enterprise[k] < r.enterprise[m] ? k : m));
        const hi = positive.reduce((m, k) => (r.enterprise[k] > r.enterprise[m] ? k : m));
        const ratio = r.enterprise[hi] / r.enterprise[lo];
        if (ratio > 2) {
          warnings.push(
            `The methods disagree by ${round2(ratio)}x (${names[lo]} lowest, ${names[hi]} highest), so the average hides a wide range. Check the growth and discount rate against the multiples: listed-company multiples often sit well above a private company's DCF.`,
          );
        }
      }
      if (u.pe && a.pe_ratio === undefined) {
        warnings.push("P/E uses an industry forward P/E for listed companies on trailing net income; for a growing company that overstates the value.");
      }
      if (a.private_discount_pct === 0) {
        warnings.push("No private-company discount applied. The industry multiples and cost of capital come from listed companies; a small private business is usually worth less.");
      }
      if (used.some((k) => r.equity[k] < 0)) {
        warnings.push("Some equity values are negative: net debt is larger than the enterprise value those methods give.");
      }

      return json({
        equity_value: byMethod(r.equity),
        enterprise_value: byMethod(r.enterprise),
        methods_averaged: used.map((k) => names[k]),
        net_debt: a.net_debt,
        assumptions: {
          discount_rate_pct: discountRate,
          discount_rate_source:
            a.discount_rate_pct !== undefined ? "given" : ind ? `${ind.label} cost of capital (Damodaran, US listed companies)` : "default",
          terminal_growth_pct: a.terminal_growth_pct,
          private_discount_pct: a.private_discount_pct,
        },
        multiples_used: { ev_ebitda: ebitdaMultiple, ev_sales: evSalesMultiple, pe: peRatio, industry: ind?.label ?? null },
        ...(u.dcf && { dcf_detail: { years: r.dcfRows, pv_of_terminal_value: r.pvTerminal } }),
        ...(warnings.length > 0 && { warnings }),
        tool_page: `${SITE}/tools/valuation`,
      });
    },
  );

  server.registerTool(
    "startup_valuation",
    {
      title: "Startup valuation (Damodaran DCF, revenue multiple, funding round, runway)",
      description:
        "Values a young, early-stage or loss-making company. Four parts, each computed only when its inputs are given — pass whatever is known: " +
        "(1) dcf — Aswath Damodaran's intrinsic valuation for young companies: 10 years of revenue growth (the rate given for years 1–5, stepping down to terminal growth by year 10), an operating margin moving from today's to a mature target, reinvestment set by the sales-to-capital ratio, tax losses carried forward, a cost of capital falling to a mature level, and a probability that the business fails before maturing. Needs revenue, revenue_growth_pct and current_operating_margin_pct; target margin, sales-to-capital and cost of capital default to the `industry` averages (see industry_multiples). For a young firm the initial cost of capital is usually set above the industry average. " +
        "(2) revenue_multiple — revenue × EV/Sales from `industry` or `ev_sales_multiple`, plus net cash, with an optional private-company discount taken off the enterprise value (cash is not discounted). " +
        "(3) funding_round — the post-money valuation implied by the latest round: price_per_share × shares_outstanding, or investment ÷ stake_pct. That is a price paid for preferred shares with investor protections, not an intrinsic value, and usually overstates what an ordinary share is worth. " +
        "(4) runway — months of cash left: cash ÷ annual_burn.",
      inputSchema: {
        revenue: z.number().positive().optional().describe("Latest annual revenue (DCF and revenue multiple)"),
        revenue_growth_pct: z.number().min(-50).max(300).optional().describe("DCF: annual revenue growth for years 1–5, percent"),
        current_operating_margin_pct: z.number().min(-1000).max(100).optional().describe("DCF: today's operating (EBIT) margin, percent; negative if loss-making"),
        industry: z.enum(INDUSTRIES.map((i) => i.id) as [string, ...string[]]).optional().describe("Industry id: defaults for the DCF inputs and the EV/Sales multiple"),
        target_operating_margin_pct: z.number().min(-50).max(100).optional().describe("DCF: mature operating margin; defaults to the industry's"),
        years_to_target_margin: z.number().int().min(1).max(10).default(5).describe("DCF: year by which the target margin is reached"),
        sales_to_capital: z.number().positive().optional().describe("DCF: revenue per unit of capital invested; defaults to the industry's"),
        initial_cost_of_capital_pct: z.number().min(0).max(50).optional().describe("DCF: cost of capital for years 1–5, percent; defaults to the mature one"),
        mature_cost_of_capital_pct: z.number().min(0).max(30).optional().describe("DCF: cost of capital from year 10 on, percent; defaults to the industry's"),
        terminal_growth_pct: z.number().min(-5).max(10).default(2.5).describe("DCF: growth forever after year 10, percent; must be below the mature cost of capital"),
        tax_rate_pct: z.number().min(0).max(60).default(25).describe("DCF: marginal tax rate, percent"),
        net_operating_loss: z.number().min(0).default(0).describe("DCF: tax losses already carried forward"),
        failure_probability_pct: z.number().min(0).max(100).default(0).describe("DCF: chance the business fails before maturing, percent"),
        failure_proceeds: z.number().min(0).default(0).describe("DCF: amount recovered if it fails"),
        options_value: z.number().min(0).default(0).describe("DCF: value of employee options outstanding, subtracted from equity"),
        ev_sales_multiple: z.number().min(0).optional().describe("Revenue multiple: overrides the industry EV/Sales"),
        private_discount_pct: z.number().min(0).max(90).optional().describe("Revenue multiple: optional discount for a private, illiquid company, percent, taken off enterprise value before net cash is added. Nothing is applied unless given."),
        net_cash: z.number().default(0).describe("Cash minus debt (negative if net debt), added to reach equity value in the DCF and revenue multiple"),
        price_per_share: z.number().positive().optional().describe("Funding round: price paid per share"),
        shares_outstanding: z.number().positive().optional().describe("Shares in issue after the round (fully diluted if known); also gives the DCF a value per share"),
        investment: z.number().positive().optional().describe("Funding round: amount raised"),
        stake_pct: z.number().gt(0).max(100).optional().describe("Funding round: percentage of the company the round bought, used with investment"),
        cash: z.number().min(0).optional().describe("Runway: cash in the bank"),
        annual_burn: z.number().positive().optional().describe("Runway: cash used per year (net outflow)"),
      },
      annotations: readOnly,
    },
    async (a) => {
      const ind = INDUSTRIES.find((i) => i.id === a.industry);
      const skipped: string[] = [];
      const round0 = (n: number) => Math.round(n);

      // (1) Damodaran DCF
      let dcf: Record<string, unknown> | null = null;
      const wantsDcf = a.revenue_growth_pct !== undefined || a.current_operating_margin_pct !== undefined;
      if (wantsDcf) {
        const target = a.target_operating_margin_pct ?? ind?.opMargin;
        const salesToCapital = a.sales_to_capital ?? ind?.salesToCapital;
        const mature = a.mature_cost_of_capital_pct ?? ind?.costOfCapital;
        const initial = a.initial_cost_of_capital_pct ?? mature;
        if (a.revenue === undefined || a.revenue_growth_pct === undefined || a.current_operating_margin_pct === undefined) {
          skipped.push("dcf: needs revenue, revenue_growth_pct and current_operating_margin_pct.");
        } else if (target === undefined || salesToCapital === undefined || mature === undefined || initial === undefined) {
          skipped.push("dcf: give an `industry`, or target_operating_margin_pct, sales_to_capital and mature_cost_of_capital_pct.");
        } else if (a.terminal_growth_pct >= mature) {
          skipped.push("dcf: terminal_growth_pct must be lower than the mature cost of capital.");
        } else {
          const r = youngCompanyDcf({
            revenue: a.revenue,
            revenueGrowthPct: a.revenue_growth_pct,
            currentMarginPct: a.current_operating_margin_pct,
            targetMarginPct: target,
            yearsToTargetMargin: a.years_to_target_margin,
            salesToCapital,
            initialCostOfCapitalPct: initial,
            matureCostOfCapitalPct: mature,
            terminalGrowthPct: a.terminal_growth_pct,
            taxRatePct: a.tax_rate_pct,
            netOperatingLoss: a.net_operating_loss,
            failureProbabilityPct: a.failure_probability_pct,
            failureProceeds: a.failure_proceeds,
            netCash: a.net_cash,
            optionsValue: a.options_value,
          });
          dcf = {
            assumptions: {
              industry: ind?.label ?? null,
              target_operating_margin_pct: target,
              sales_to_capital: salesToCapital,
              initial_cost_of_capital_pct: initial,
              mature_cost_of_capital_pct: mature,
              terminal_growth_pct: a.terminal_growth_pct,
              tax_rate_pct: a.tax_rate_pct,
              failure_probability_pct: a.failure_probability_pct,
            },
            years: r.years.map((y) => ({
              year: y.year,
              growth_pct: round2(y.growthPct),
              revenue: round0(y.revenue),
              operating_margin_pct: round2(y.marginPct),
              ebit: round0(y.ebit),
              tax: round0(y.tax),
              reinvestment: round0(y.reinvestment),
              fcff: round0(y.fcff),
              cost_of_capital_pct: round2(y.costOfCapitalPct),
              present_value: round0(y.pv),
            })),
            pv_of_10_years_cash_flows: round0(r.pvOfCashFlows),
            terminal_value: round0(r.terminalValue),
            pv_of_terminal_value: round0(r.pvTerminal),
            value_if_it_survives: round0(r.goingConcern),
            value_after_failure_risk: round0(r.operatingValue),
            equity_value: round0(r.equityValue),
            ...(a.shares_outstanding !== undefined && {
              value_per_share: Math.round((r.equityValue / a.shares_outstanding) * 10000) / 10000,
            }),
          };
        }
      }

      // (2)–(4) revenue multiple, funding round, runway
      const evSalesMultiple = a.ev_sales_multiple ?? ind?.evSales;
      const s = startupValuation({
        pricePerShare: a.price_per_share,
        sharesOutstanding: a.shares_outstanding,
        investment: a.investment,
        stakePct: a.stake_pct,
        revenue: a.revenue,
        evSalesMultiple,
        netCash: a.net_cash,
        privateDiscountPct: a.private_discount_pct,
        cash: a.cash,
        annualBurn: a.annual_burn,
      });

      if (!dcf && !s.round && !s.revenueMultiple && s.runwayMonths === null) {
        return error(
          [
            "Give at least one set of inputs:",
            "dcf — revenue, revenue_growth_pct, current_operating_margin_pct and an industry;",
            "revenue multiple — revenue plus industry or ev_sales_multiple;",
            "funding round — price_per_share + shares_outstanding, or investment + stake_pct;",
            "runway — cash + annual_burn.",
            ...skipped,
          ].join(" "),
        );
      }

      return json({
        ...(dcf && { dcf }),
        ...(s.revenueMultiple && {
          revenue_multiple: {
            ev_sales_multiple: evSalesMultiple,
            industry: ind?.label ?? null,
            enterprise_value: round0(s.revenueMultiple.enterpriseValue),
            equity_value: round0(s.revenueMultiple.equityValue),
            private_discount_pct: a.private_discount_pct ?? 0,
            equity_value_after_discount: round0(s.revenueMultiple.afterDiscount),
          },
        }),
        ...(s.round && {
          funding_round: {
            post_money: round0(s.round.postMoney),
            pre_money: s.round.preMoney === null ? null : round0(s.round.preMoney),
            basis: s.round.basis,
          },
        }),
        ...(s.runwayMonths !== null && { runway_months: Math.round(s.runwayMonths * 10) / 10 }),
        ...(skipped.length > 0 && { skipped }),
        notes: [
          "DCF method: A. Damodaran, 'Valuing Young, Start-up and Growth Companies' (2009). Industry inputs are US averages for listed companies, January 2026.",
          "The DCF is only as good as its growth, margin and failure assumptions; small changes move the value a lot.",
          "A funding-round price is what investors paid for preferred shares, which usually carry a liquidation preference; ordinary shares are normally worth less.",
        ],
        tool_page: `${SITE}/tools/valuation`,
      });
    },
  );

  // ── Market and macro data ────────────────────────────────────────────────

  server.registerTool(
    "us_macro_indicators",
    {
      title: "US macro indicators",
      description:
        "Latest US macro data from FRED: real GDP, industrial production, CPI, core CPI, PCE and core PCE inflation (year-on-year %; core PCE is the measure the Fed's 2% target refers to), unemployment, the Fed funds rate (daily effective rate) and the 10-year Treasury yield, each with its change from the prior reading and its date. Monthly and quarterly series report the latest published period, which can be a month or more behind today.",
      inputSchema: {},
      annotations: { ...readOnly, openWorldHint: true },
    },
    async () => {
      const apiKey = process.env.FRED_API_KEY;
      if (!apiKey) return error("Macro data is temporarily unavailable.");
      const indicators = await fetchIndicators(apiKey);
      return json({
        source: "Federal Reserve Bank of St. Louis (FRED)",
        units: "percent",
        indicators: indicators.map((i) => ({ ...i, value: round2(i.value), change: i.change === null ? null : round2(i.change) })),
        tool_page: `${SITE}/tools/macro-dashboard`,
      });
    },
  );

  server.registerTool(
    "market_snapshot",
    {
      title: "Market snapshot",
      description:
        "Latest level and daily change for major stock indices (S&P 500, Nasdaq, Dow Jones, FTSE 100, DAX), FX (EUR/USD, GBP/USD, USD/JPY), gold, WTI oil, Bitcoin, the US 10-year yield and the VIX. Delayed quotes from Yahoo Finance, each with the time it was quoted (`as_of`, UTC). The 10-year yield's price is in percent and its daily move is given in basis points (`change_bp`), not as a percentage change of the yield.",
      inputSchema: {},
      annotations: { ...readOnly, openWorldHint: true },
    },
    async () => {
      const quotes = await getMarketQuotes();
      return json({
        source: "Yahoo Finance (delayed)",
        quotes: quotes.map((q) =>
          q.group === "Rates"
            ? {
                // A yield: a 0.12-point move is 12 bp; "2.9%" of the yield would mislead
                label: q.label,
                symbol: q.symbol,
                group: q.group,
                yield_pct: q.price === null ? null : Math.round(q.price * 1000) / 1000,
                change_bp: q.change === null ? null : Math.round(q.change * 1000) / 10,
                as_of: q.time,
              }
            : {
                label: q.label,
                symbol: q.symbol,
                group: q.group,
                price: q.price,
                // FX moves are often under 0.005, which two decimals would show as 0
                change: q.change === null ? null : q.group === "FX" ? Math.round(q.change * 1e4) / 1e4 : round2(q.change),
                change_pct: q.changePct === null ? null : round2(q.changePct),
                currency: q.currency,
                as_of: q.time,
              },
        ),
      });
    },
  );

  server.registerTool(
    "price_history",
    {
      title: "Price history",
      description:
        "Closing-price history for one ticker the user names (Yahoo Finance symbol: AAPL, SAN.MC, BRK-B, ^GSPC, EURUSD=X…) over 1m, 6m, 1y, 5y or max. Returns the change over the period, the high and low closes with dates, the last close against its 200-day moving average, annualised volatility, and the series thinned to at most `max_points` for charting. Raw prices, not a forecast or recommendation.",
      inputSchema: {
        symbol: z.string().min(1).max(15).describe("Yahoo Finance ticker; add the exchange suffix outside the US, e.g. .MC Madrid, .L London, .PA Paris"),
        range: z.enum(PRICE_RANGES).default("1y").describe("Period to cover; 'max' uses weekly closes and has no 200-day average"),
        max_points: z.number().int().min(10).max(500).default(120).describe("Most points to return in the series"),
      },
      annotations: { ...readOnly, openWorldHint: true },
    },
    async ({ symbol, range, max_points }) => {
      const s = normaliseSymbol(symbol);
      if (!s) return error(`"${symbol}" isn't a valid ticker. Use a Yahoo Finance symbol such as AAPL or SAN.MC.`);
      try {
        const h = await getPriceHistory(s, range);
        return json({
          source: "Yahoo Finance (delayed)",
          symbol: h.symbol,
          name: h.name,
          currency: h.currency,
          exchange: h.exchange,
          range: h.range,
          interval: h.interval,
          stats: h.stats,
          points_total: h.points.length,
          points: thin(h.points, max_points),
          note: "Raw market data for education. Past prices say nothing about future returns; not investment advice or a recommendation.",
          tool_page: `${SITE}/tools/stock-analysis?symbol=${encodeURIComponent(h.symbol)}`,
        });
      } catch (err) {
        if (isUnknownSymbol(err)) return error(`No price data found for "${s}". Check the ticker and its exchange suffix.`);
        return error("Price data is temporarily unavailable.");
      }
    },
  );

  server.registerTool(
    "portfolio_analysis",
    {
      title: "Portfolio analysis",
      description:
        "Historical risk and return for a portfolio of up to eight tickers the user names, with weights held constant (rebalanced each period): change, annualised return, volatility, Sharpe ratio, largest fall, 95% historical VaR and expected shortfall per period (daily, or weekly for 'max'), and for each holding its return, volatility, largest fall and share of the portfolio's risk. Weights are scaled to sum to 100. " +
        "Set `base_currency` to measure everything in one currency (e.g. GBP for a UK investor holding US and Spanish shares): each holding is converted at daily Yahoo FX rates, so currency moves count as returns. Without it, each holding is measured in its own listing currency. Everything is historical — not a forecast or recommendation.",
      inputSchema: {
        holdings: z
          .array(
            z.object({
              symbol: z.string().min(1).max(15).describe("Yahoo Finance ticker, e.g. AAPL, SAN.MC, ^GSPC"),
              weight: z.number().positive().describe("Weight; any positive numbers, scaled to sum to 100"),
            }),
          )
          .min(1)
          .max(8),
        range: z.enum(["6m", "1y", "5y", "max"]).default("1y").describe("Period; 'max' uses weekly closes"),
        risk_free_pct: z.number().min(-5).max(30).default(0).describe("Annual risk-free rate for the Sharpe ratio, percent, in the base currency (us_macro_indicators has the Fed funds rate)"),
        base_currency: z
          .string()
          .regex(/^[A-Za-z]{3}$/)
          .optional()
          .describe("ISO currency to measure the portfolio in, e.g. USD, EUR, GBP. Omit to leave each holding in its own currency"),
      },
      annotations: { ...readOnly, openWorldHint: true },
    },
    async ({ holdings, range, risk_free_pct, base_currency }) => {
      const symbols = holdings.map((h) => normaliseSymbol(h.symbol));
      const bad = holdings.filter((_, i) => !symbols[i]).map((h) => h.symbol);
      if (bad.length) return error(`Not valid tickers: ${bad.join(", ")}. Use Yahoo Finance symbols such as AAPL or SAN.MC.`);
      if (new Set(symbols).size !== symbols.length) return error("A ticker appears twice; combine its weights.");

      const histories = await Promise.all(symbols.map((s) => getPriceHistory(s!, range).catch((err) => (isUnknownSymbol(err) ? null : Promise.reject(err))))).catch(() => undefined);
      if (!histories) return error("Price data is temporarily unavailable.");
      const missing = symbols.filter((_, i) => !histories[i]);
      if (missing.length) return error(`No price data for ${missing.join(", ")}. Fix or remove them — the portfolio isn't calculated with a holding missing.`);

      // Restate each holding in the base currency, if one was asked for.
      const base = base_currency?.toUpperCase();
      const series = histories.map((h) => h!.points);
      const fxUsed: Record<string, string> = {};
      if (base) {
        const needed = [...new Set(histories.map((h) => majorCurrency(h!.currency).code).filter((c) => c && c !== base))];
        const unknownCcy = histories.filter((h) => !h!.currency).map((h) => h!.symbol);
        if (unknownCcy.length) return error(`Yahoo doesn't report a currency for ${unknownCcy.join(", ")}, so it can't be converted to ${base}.`);
        const fx = await Promise.all(needed.map((c) => getPriceHistory(`${c}${base}=X`, range).catch(() => null)));
        const noFx = needed.filter((_, i) => !fx[i]);
        if (noFx.length) return error(`No FX history to convert ${noFx.join(", ")} into ${base}. Check the currency code.`);
        histories.forEach((h, i) => {
          const { code, scale } = majorCurrency(h!.currency);
          const rate = code === base ? null : fx[needed.indexOf(code)]!.points;
          if (rate) fxUsed[code] = `${code}${base}=X`;
          series[i] = rate ? convertPoints(h!.points, rate, scale) : scale === 1 ? h!.points : convertPoints(h!.points, [{ date: "", close: 1, ma200: null }], scale);
        });
      }

      const r = analysePortfolio(
        holdings.map((h, i) => ({ symbol: symbols[i]!, weight: h.weight, points: series[i] })),
        risk_free_pct,
        range === "max" ? 52 : 252,
      );
      if (!r) return error("Not enough shared price history to analyse. Try a longer period.");
      const r2 = (n: number | null) => (n === null ? null : round2(n));
      return json({
        source: "Yahoo Finance (delayed)",
        period: { start: r.start, end: r.end, interval: range === "max" ? "weekly" : "daily" },
        risk_free_pct,
        base_currency: base ?? null,
        ...(base && Object.keys(fxUsed).length > 0 && { fx_rates_used: fxUsed }),
        portfolio: {
          change_pct: r2(r.change_pct),
          annualised_pct: r2(r.annualised_pct),
          volatility_pct: r2(r.volatility_pct),
          sharpe: r2(r.sharpe),
          max_drawdown: { pct: r2(r.max_drawdown.pct), peak: r.max_drawdown.peak, trough: r.max_drawdown.trough },
          [`var95_${range === "max" ? "weekly" : "daily"}_pct`]: r2(r.var95_pct),
          [`expected_shortfall_95_${range === "max" ? "weekly" : "daily"}_pct`]: r2(r.cvar95_pct),
          worst_period: { pct: r2(r.worst_period.pct), date: r.worst_period.date },
          undiversified_volatility_pct: r2(r.undiversified_volatility_pct),
        },
        holdings: r.holdings.map((h, i) => ({
          symbol: h.symbol,
          name: histories[i]!.name,
          currency: histories[i]!.currency,
          ...(base && { measured_in: base }),
          weight_pct: r2(h.weight),
          change_pct: r2(h.change_pct),
          annualised_pct: r2(h.annualised_pct),
          volatility_pct: r2(h.volatility_pct),
          max_drawdown_pct: r2(h.max_drawdown_pct),
          risk_share_pct: r2(h.risk_share_pct),
        })),
        value_path: thin(r.path, 60).map((p) => ({ date: p.date, value: round2(p.value) })),
        note: `Historical figures with weights rebalanced each period; ${base ? `every holding converted to ${base} at daily FX rates, so currency moves are included` : "each holding measured in its own currency, with no currency effect — set base_currency to include it"}. VaR and expected shortfall are one-${range === "max" ? "week" : "day"} losses, not annual. Not a forecast, investment advice or a recommendation.`,
        tool_page: `${SITE}/tools/portfolio-analysis?h=${encodeURIComponent(r.holdings.map((h) => `${h.symbol}:${round2(h.weight)}`).join(","))}&range=${range}&rf=${risk_free_pct}`,
      });
    },
  );

  // ── Stock screener (neutral) ─────────────────────────────────────────────

  server.registerTool(
    "screener_metrics",
    {
      title: "Stock screener measures",
      description: "The measures screen_stocks can filter, sort and show, with their units and a plain-English definition, plus the exact sector names in each index.",
      inputSchema: {},
      annotations: { ...readOnly, openWorldHint: true },
    },
    async () => {
      const universes = await Promise.all(UNIVERSE_SCREENS.map((i) => getUniverse(i)));
      return json({
        indices: UNIVERSE_SCREENS,
        sectors: Object.fromEntries(
          UNIVERSE_SCREENS.map((i, n) => [i, universes[n] ? [...new Set(universes[n]!.companies.map((c) => c.sector).filter(Boolean))].sort() : null]),
        ),
        units_note: "'%' measures are percentage points (roe 16.5 means 16.5%). deuda_patrimonio is a percentage. Share prices are in the listing currency. Growth measures compare the latest year with the average of prior reported years.",
        keys_note: "Keys are the data pipeline's own (some in Spanish, e.g. per = P/E, deuda_neta_ebitda = net debt / EBITDA); `label` gives the English name.",
        metrics: METRICS.map((m) => ({ key: m.key, label: m.label, unit: m.unit, group: m.group, definition: m.help })),
      });
    },
  );

  server.registerTool(
    "screen_stocks",
    {
      title: "Screen stocks",
      description:
        "Filters the companies of one index (S&P 500, Nasdaq-100 or IBEX 35) by criteria the user sets — minimum and/or maximum values of reported measures (see screener_metrics), a sector, or a name search. At least one criterion is required. Companies missing a figure for a filtered measure are left out and counted. " +
        "Matches come alphabetically by ticker unless the user asks to sort by a measure: then pass `sort_by` and the direction they asked for in `order` (there is no default direction — higher is not better or worse). `limit` caps the rows returned (match_count still gives the total); `columns` adds measures to show without filtering on them. " +
        "This is a filter the user drives, not a ranking or recommendation: don't describe a sorted list as the best or top companies.",
      inputSchema: {
        index: z.enum(UNIVERSE_SCREENS).describe("Which index to screen"),
        filters: z
          .array(
            z.object({
              metric: z.enum(METRIC_KEYS).describe("Measure key from screener_metrics"),
              min: z.number().optional().describe("Keep companies at or above this value"),
              max: z.number().optional().describe("Keep companies at or below this value"),
            }),
          )
          .default([])
          .describe("Range filters on reported measures"),
        sector: z.string().optional().describe("Exact sector name, as in the results"),
        query: z.string().optional().describe("Text to match in the ticker or company name"),
        columns: z.array(z.enum(METRIC_KEYS)).max(12).default([]).describe("Extra measures to show for each match, beyond the filtered ones"),
        sort_by: z.enum(METRIC_KEYS).optional().describe("Only if the user asks: sort matches by this measure instead of by ticker"),
        order: z.enum(["asc", "desc"]).optional().describe("Required with sort_by: the direction the user asked for"),
        limit: z.number().int().min(1).max(500).optional().describe("Most rows to return; default all matches"),
      },
      annotations: { ...readOnly, openWorldHint: true },
    },
    async ({ index, filters, sector, query, columns, sort_by, order, limit }) => {
      const ranges = filters.filter((f) => f.min !== undefined || f.max !== undefined);
      const q = query?.trim().toLowerCase() ?? "";
      if (ranges.length === 0 && !sector && !q) {
        return error("Set at least one criterion: a min or max on a measure, a sector, or a name search.");
      }
      if (ranges.some((f) => f.min !== undefined && f.max !== undefined && f.min > f.max)) {
        return error("A filter has min greater than max.");
      }
      if (sort_by && !order) {
        return error("Say which direction to sort: order 'asc' (lowest first) or 'desc' (highest first), as the user asked.");
      }

      const data = await getUniverse(index);
      if (!data) return error("Screener data is temporarily unavailable.");

      if (sector) {
        const sectors = [...new Set(data.companies.map((c) => c.sector).filter(Boolean))].sort();
        if (!sectors.includes(sector)) {
          return error(`Unknown sector "${sector}". Sectors in ${index}: ${sectors.join(", ")}.`);
        }
      }

      // Same rules as components/StockScreener.tsx.
      let missing = 0;
      const matches = data.companies.filter((c) => {
        if (sector && c.sector !== sector) return false;
        if (q && !c.ticker.toLowerCase().includes(q) && !c.nombre.toLowerCase().includes(q)) return false;
        let lacksData = false;
        for (const f of ranges) {
          const v = c[f.metric];
          if (v === null) {
            lacksData = true;
            continue;
          }
          if ((f.min !== undefined && v < f.min) || (f.max !== undefined && v > f.max)) return false;
        }
        if (lacksData) {
          missing++;
          return false;
        }
        return true;
      });

      // Sorting by a measure the user chose; companies without that figure go last, A–Z.
      let sorted = matches;
      let noSortValue = 0;
      if (sort_by) {
        const dir = order === "desc" ? -1 : 1;
        sorted = [...matches].sort((x, y) => {
          const a = x[sort_by];
          const b = y[sort_by];
          if (a === null || b === null) return a === b ? 0 : a === null ? 1 : -1;
          return a === b ? 0 : (a - b) * dir;
        });
        noSortValue = matches.filter((c) => c[sort_by] === null).length;
      }
      const rows = limit ? sorted.slice(0, limit) : sorted;

      const shown: MetricKey[] = [...new Set([...ranges.map((f) => f.metric), ...(sort_by ? [sort_by] : []), ...columns])];
      return json({
        index,
        data_as_of: data.generated_at,
        criteria: { filters: ranges, sector: sector ?? null, query: q || null },
        universe_size: data.count,
        match_count: matches.length,
        returned: rows.length,
        left_out_for_missing_data: missing,
        order: sort_by
          ? `by ${sort_by}, ${order === "desc" ? "highest" : "lowest"} first, as requested${noSortValue ? ` (${noSortValue} without a figure listed last)` : ""}`
          : "alphabetical by ticker",
        companies: rows.map((c) => ({
          ticker: c.ticker,
          name: c.nombre,
          sector: c.sector,
          ...Object.fromEntries(shown.map((k) => [k, c[k]])),
        })),
        note: "Raw reported and market data for education. Not investment advice or a recommendation.",
        tool_page: `${SITE}/tools/stock-screener?index=${index}`,
      });
    },
  );

  return server;
}
