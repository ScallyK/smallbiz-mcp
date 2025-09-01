import { McpServer } from "@modelcontextprotocol/sdk/server/mcp.js";

// Basic ping tool
export default function registerPingTool(mcpServerName: McpServer) {

    mcpServerName.tool(

        "ping",
        "always returns pong",

        async () => {
            return {
                content: [
                    {
                        type: "text",
                        text: "pong",
                    },
                ],
            };
        },
    );
}