// The MCP server's tool names, in registration order. Kept apart from
// lib/mcp-server.ts so pages (the homepage's "+ N more") and the endpoint's
// usage counting can use the list without loading the server.
// tests/mcp-app.test.ts checks it matches what the server registers.

export const MCP_TOOL_NAMES = [
  "take_home_pay",
  "loan_repayment",
  "compound_interest",
  "investment_return",
  "break_even",
  "industry_multiples",
  "business_valuation",
  "startup_valuation",
  "us_macro_indicators",
  "market_snapshot",
  "price_history",
  "portfolio_analysis",
  "company_profile",
  "company_snowflake",
  "screener_metrics",
  "screen_stocks",
] as const;

export type McpToolName = (typeof MCP_TOOL_NAMES)[number];

export const isMcpToolName = (s: unknown): s is McpToolName => typeof s === "string" && (MCP_TOOL_NAMES as readonly string[]).includes(s);
