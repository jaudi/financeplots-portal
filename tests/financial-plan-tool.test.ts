import { Client } from "@modelcontextprotocol/sdk/client/index.js";
import { InMemoryTransport } from "@modelcontextprotocol/sdk/inMemory.js";
import { describe, expect, it } from "vitest";
import { decodePlan } from "@/lib/financial-plan";
import { createFinancePlotsServer } from "@/lib/mcp-server";
import { callTool } from "./mcp-client";

// pension_pot, financial_plan and the planning_session prompt through the real
// MCP server. The maths is pinned in tests/pension-pot.test.ts and
// tests/financial-plan.test.ts; these check the conversation contract.

const FACT_FIND = {
  age: 50,
  retire_age: 67,
  gross_salary: 70_000,
  employee_pension_pct: 5,
  employer_pension_pct: 5,
  pension_pot: 60_000,
  savings: 80_000,
  spending_per_year: 30_000,
  housing: { type: "own", home_value: 450_000, mortgage_left: 290_000, mortgage_rate_pct: 4.5, years_left: 16 },
  has_partner: false,
  chart: false,
};

describe("financial_plan tool", () => {
  it("asks the first question when called with nothing", async () => {
    const r = await callTool("financial_plan", {});
    expect(r.isError).toBe(false);
    expect(r.json.status).toBe("needs_more_information");
    expect(r.json.next_question).toEqual({ field: "age", question: "How old are you?" });
    expect(r.json.findings).toBeUndefined();
  });

  it("walks the questions one at a time as answers arrive", async () => {
    const r = await callTool("financial_plan", { age: 50, retire_age: 67, gross_salary: 70_000 });
    expect(r.json.next_question.field).toBe("has_partner");
  });

  it("stops for the assumptions before projecting", async () => {
    const r = await callTool("financial_plan", FACT_FIND);
    expect(r.json.status).toBe("confirm_assumptions");
    expect(r.json.assumptions_to_confirm.map((a: { name: string }) => a.name)).toContain("inflation_pct");
  });

  it("returns the findings and a report link that rebuilds the same plan", async () => {
    const r = await callTool("financial_plan", { ...FACT_FIND, assumptions_confirmed: true });
    expect(r.json.status).toBe("complete");
    expect(r.json.findings.scenarios.base.outcome).toBe("runs out at 87");
    expect(r.json.base_projection[0].age).toBe(50);
    const url = new URL(r.json.report_page);
    expect(url.origin + url.pathname).toBe("https://www.financeplots.com/plan");
    const ff: Record<string, unknown> = { ...FACT_FIND, assumptions_confirmed: true };
    delete ff.chart;
    expect(decodePlan(url.searchParams.get("p")!)).toEqual(ff);
  });

  it("refuses a retirement age before today's age", async () => {
    const r = await callTool("financial_plan", { age: 60, retire_age: 55 });
    expect(r.isError).toBe(true);
  });
});

describe("pension_pot tool", () => {
  it("returns the sustainable income for life_plan", async () => {
    const r = await callTool("pension_pot", { age: 50, pot_today: 60_000, salary: 70_000, employee_pct: 5, employer_pct: 5, chart: false });
    expect(r.isError).toBe(false);
    expect(r.json.at_retirement.pot).toBe(229_395);
    expect(r.json.sustainable_income.life_plan_pension_per_year).toBe(18_139);
  });
});

describe("planning_session prompt", () => {
  it("is listed and tells the assistant not to guess or advise", async () => {
    const [clientSide, serverSide] = InMemoryTransport.createLinkedPair();
    const client = new Client({ name: "test", version: "0" });
    await Promise.all([createFinancePlotsServer().connect(serverSide), client.connect(clientSide)]);
    try {
      const { prompts } = await client.listPrompts();
      expect(prompts.map((p) => p.name)).toContain("planning_session");
      const p = await client.getPrompt({ name: "planning_session" });
      const text = (p.messages[0].content as { text: string }).text;
      expect(text).toMatch(/Never guess/);
      expect(text).toMatch(/required_footer, word for word/);
    } finally {
      await client.close();
    }
  });
});
