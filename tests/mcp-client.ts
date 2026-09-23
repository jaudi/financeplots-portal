import { Client } from "@modelcontextprotocol/sdk/client/index.js";
import { InMemoryTransport } from "@modelcontextprotocol/sdk/inMemory.js";
import { createFinancePlotsServer } from "@/lib/mcp-server";

// Calls a tool on the real MCP server in-process, the way a client would, so
// tests cover the input schema and the response shape as well as the maths.
// Tools that fetch data need their data module mocked with vi.mock.

export interface ToolResult {
  isError: boolean;
  text: string;
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  json: any;
}

export async function callTool(name: string, args: Record<string, unknown> = {}): Promise<ToolResult> {
  const [clientSide, serverSide] = InMemoryTransport.createLinkedPair();
  const server = createFinancePlotsServer();
  const client = new Client({ name: "test", version: "0" });
  await Promise.all([server.connect(serverSide), client.connect(clientSide)]);
  try {
    const res = await client.callTool({ name, arguments: args });
    const content = res.content as { type: string; text?: string }[];
    const text = content.find((c) => c.type === "text")?.text ?? "";
    let json: unknown = null;
    try {
      json = JSON.parse(text);
    } catch {
      // an error message, not JSON
    }
    return { isError: Boolean(res.isError), text, json };
  } finally {
    await client.close();
  }
}
