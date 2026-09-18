import { WebStandardStreamableHTTPServerTransport } from "@modelcontextprotocol/sdk/server/webStandardStreamableHttp.js";
import { createFinancePlotsServer } from "@/lib/mcp-server";

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

async function handle(req: Request): Promise<Response> {
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
