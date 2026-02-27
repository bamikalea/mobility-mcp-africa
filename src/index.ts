import { StdioServerTransport } from "@modelcontextprotocol/sdk/server/stdio.js";
import { createServer } from "./server.js";
import { loadConfig } from "./config.js";

async function main(): Promise<void> {
  const config = loadConfig();
  const server = await createServer(config);
  const transport = new StdioServerTransport();
  await server.connect(transport);
  console.error(
    `mobility-mcp-africa server running on stdio (provider: ${config.provider})`
  );
}

main().catch((error: unknown) => {
  console.error("Fatal error starting server:", error);
  process.exit(1);
});
