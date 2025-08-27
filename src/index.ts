#!/usr/bin/env node
// Uses Zod schemas for strict type-safe i/o handling

import { Server } from "@modelcontextprotocol/sdk/server/index.js";
import { StdioServerTransport } from "@modelcontextprotocol/sdk/server/stdio.js";
import { z } from "zod";

// Define tool input/output schemas and types
const PingInputSchema = z.object({}); // no input required
const PingOutputSchema = z.object({
  reply: z.string(),
});

type PingInput = z.infer<typeof PingInputSchema>;
type PingOutput = z.infer<typeof PingOutputSchema>;

// Init server with tools
const server = new Server(
  {
    name: "smallbiz-mcp-server",
    version: "0.1.0",
  },
  {
    capabilities: {
      resources: {},
      prompts: {},
      tools: {

        ping: {
          description: "returns pong",
          input_schema: PingInputSchema,
          output_schema: PingOutputSchema,
          handler: async (_input: PingInput): Promise<PingOutput> => {
            return { reply: "pong" };
          },
        },

      },
    },
  }
);

async function main() {
  try {
    const transport = new StdioServerTransport();
    await server.connect(transport);
    console.log("smallbiz-mcp-server is running on stdio...");
  } catch (err) {
    console.error("Server error:", err);
    process.exit(1);
  }
}

main();
