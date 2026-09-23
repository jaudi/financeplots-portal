import { Client } from "@modelcontextprotocol/sdk/client/index.js";
import { InMemoryTransport } from "@modelcontextprotocol/sdk/inMemory.js";
import { describe, expect, it } from "vitest";
import { formatValue } from "@/lib/charts/spec";
import { createFinancePlotsServer } from "@/lib/mcp-server";

// The MCP Apps wiring: charting tools point at one ui:// view, which the server
// serves as a self-contained HTML page.

const VIEW = "ui://financeplots/charts.html";
const CHARTING = ["loan_repayment", "compound_interest", "break_even", "business_valuation", "startup_valuation", "price_history", "portfolio_analysis"];

async function connect() {
  const [c, s] = InMemoryTransport.createLinkedPair();
  const client = new Client({ name: "test", version: "0" });
  await Promise.all([createFinancePlotsServer().connect(s), client.connect(c)]);
  return client;
}

describe("MCP App chart view", () => {
  it("links every charting tool, and only those, to the view", async () => {
    const client = await connect();
    const { tools } = await client.listTools();
    for (const t of tools) {
      const meta = t._meta as { ui?: { resourceUri?: string }; "ui/resourceUri"?: string } | undefined;
      if (CHARTING.includes(t.name)) {
        expect(meta?.ui?.resourceUri, t.name).toBe(VIEW);
        expect(meta?.["ui/resourceUri"], t.name).toBe(VIEW); // older hosts
      } else {
        expect(meta?.ui, t.name).toBeUndefined();
      }
    }
    await client.close();
  });

  it("serves the view as one self-contained MCP App page", async () => {
    const client = await connect();
    const { resources } = await client.listResources();
    expect(resources.map((r) => r.uri)).toContain(VIEW);

    const { contents } = await client.readResource({ uri: VIEW });
    const page = contents[0] as { mimeType: string; text: string };
    expect(page.mimeType).toBe("text/html;profile=mcp-app");
    expect(page.text).toMatch(/^<!doctype html>/);
    // Everything inline: no external script, stylesheet or fetch target.
    expect(page.text).not.toMatch(/<script[^>]+src=|<link[^>]+href=/i);
    // Exactly one script element, so the bundle can't have closed it early.
    expect(page.text.match(/<\/script>/g)).toHaveLength(1);
    await client.close();
  });

  it("formats tick values without trailing zeros", () => {
    expect(formatValue(8, "money", "EUR")).toBe("€8");
    expect(formatValue(2.5, "money")).toBe("2.5");
    expect(formatValue(1.25, "money")).toBe("1.25");
  });
});
