import { WebStandardStreamableHTTPServerTransport } from "@modelcontextprotocol/sdk/server/webStandardStreamableHttp.js";
import { track } from "@vercel/analytics/server";
import { after } from "next/server";
import { createFinancePlotsServer } from "@/lib/mcp-server";
import { isMcpToolName } from "@/lib/mcp-tools";

// Public MCP endpoint: https://www.financeplots.com/api/mcp
// Stateless Streamable HTTP — a fresh server per request, no sessions, plain
// JSON responses — which is what a serverless function can do. Connect it as a
// custom connector in Claude, or in any client that speaks remote MCP.

export const maxDuration = 30;

// Browser-based clients (e.g. the MCP Inspector) call this cross-origin.
const CORS = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Methods": "GET, POST, DELETE, OPTIONS",
  "Access-Control-Allow-Headers": "Content-Type, Accept, Authorization, Mcp-Session-Id, Mcp-Protocol-Version, Last-Event-ID",
  "Access-Control-Expose-Headers": "Mcp-Session-Id, Mcp-Protocol-Version",
};

// Usage counting (Vercel Web Analytics custom events): which tool was called,
// and which app connected — never the arguments, so nothing a user asks is
// recorded. Sent after the response, and a failure never touches the call.
async function countUsage(req: Request) {
  if (req.method !== "POST") return;
  let body: unknown;
  try {
    body = await req.json();
  } catch {
    return;
  }
  for (const msg of Array.isArray(body) ? body : [body]) {
    const m = msg as { method?: unknown; params?: { name?: unknown; clientInfo?: { name?: unknown } } } | null;
    if (m?.method === "tools/call" && isMcpToolName(m.params?.name)) {
      await track("mcp_call", { tool: m.params.name }, { headers: req.headers }).catch(() => {});
    } else if (m?.method === "initialize") {
      const client = typeof m.params?.clientInfo?.name === "string" ? m.params.clientInfo.name.slice(0, 40) : "unknown";
      await track("mcp_connect", { client }, { headers: req.headers }).catch(() => {});
    }
  }
}

async function handle(req: Request): Promise<Response> {
  const copy = req.clone();
  after(() => countUsage(copy));
  const server = createFinancePlotsServer();
  const transport = new WebStandardStreamableHTTPServerTransport({
    sessionIdGenerator: undefined,
    enableJsonResponse: true,
  });
  await server.connect(transport);
  const res = await transport.handleRequest(req);
  for (const [k, v] of Object.entries(CORS)) res.headers.set(k, v);
  return res;
}

export { handle as GET, handle as POST, handle as DELETE };

export function OPTIONS() {
  return new Response(null, { status: 204, headers: CORS });
}
