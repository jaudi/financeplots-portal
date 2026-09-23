import { describe, expect, it, vi } from "vitest";
import { mapQuote, type RawQuote } from "@/lib/markets";
import { callTool } from "./mcp-client";

// Raw Yahoo quotes as they arrive unvalidated (times in epoch seconds).
const RAW: RawQuote[] = [
  { symbol: "^GSPC", regularMarketPrice: 7706.03, regularMarketChange: -58.61, regularMarketChangePercent: -0.755, currency: "USD", regularMarketTime: 1790195782 },
  { symbol: "^TNX", regularMarketPrice: 4.12, regularMarketChange: 0.118, regularMarketChangePercent: 2.94, currency: "USD", regularMarketTime: 1790193594 },
  { symbol: "^VIX", regularMarketPrice: 15.18, regularMarketChange: 0.97, regularMarketChangePercent: 6.83, currency: "USD" },
];

vi.mock("@/lib/markets", async (importOriginal) => {
  const actual = await importOriginal<typeof import("@/lib/markets")>();
  return { ...actual, getMarketQuotes: async () => RAW.map(actual.mapQuote) };
});

describe("market_snapshot (item 5)", () => {
  it("stamps each quote with its UTC time, and the response with the latest", async () => {
    const r = (await callTool("market_snapshot")).json;
    const spx = r.quotes.find((q: { symbol: string }) => q.symbol === "^GSPC");
    expect(spx.as_of).toBe(new Date(1790195782 * 1000).toISOString());
    expect(r.as_of).toBe(spx.as_of);
    expect(r.quotes.find((q: { symbol: string }) => q.symbol === "^VIX").as_of).toBeNull();
  });

  it("puts the VIX in a Volatility group, not Rates", async () => {
    const r = (await callTool("market_snapshot")).json;
    expect(r.quotes.find((q: { symbol: string }) => q.symbol === "^VIX").group).toBe("Volatility");
  });

  it("gives the 10-year yield's move in basis points and keeps change_pct", async () => {
    const tnx = (await callTool("market_snapshot")).json.quotes.find((q: { symbol: string }) => q.symbol === "^TNX");
    expect(tnx.change_bp).toBe(11.8);
    expect(tnx.change_pct).toBe(2.94);
    expect(tnx.price).toBe(4.12);
    const spx = (await callTool("market_snapshot")).json.quotes.find((q: { symbol: string }) => q.symbol === "^GSPC");
    expect(spx.change_bp).toBeUndefined();
  });

  it("reads Yahoo's time whether it comes as a Date or epoch seconds", () => {
    const iso = "2026-09-23T20:36:22.000Z";
    expect(mapQuote({ symbol: "X", regularMarketTime: new Date(iso) }).time).toBe(iso);
    expect(mapQuote({ symbol: "X", regularMarketTime: Date.parse(iso) / 1000 }).time).toBe(iso);
    expect(mapQuote({ symbol: "X" }).time).toBeNull();
  });
});
