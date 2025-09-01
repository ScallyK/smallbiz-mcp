import { McpServer } from "@modelcontextprotocol/sdk/server/mcp.js";
import { z } from "zod";
import squareClient from "../clients/squareClient.js";

// Template for creating new MCP tools
export default function mcpToolTemplate(mcpServerName: McpServer) {

    mcpServerName.registerTool(
        "<tool_name>",
        {
            title: "<Tool Title>",
            description: "<Tool Description>",
            inputSchema: {
                inputSchemaProp1: z.string(),
                inputSchemaProp2: z.number(),
                inputSchemaProp3: z.boolean(),
            },
        },
        async ({
            inputSchemaProp1,
            inputSchemaProp2,
            inputSchemaProp3,
        }) => {

            try {
                // Functionality here. (API/Function/Etc.)
                return {
                    content: [
                        {
                            type: "text",
                            text: `<SUCCESS_MESSAGE>`,
                        },
                    ],
                };
            }
            catch (error: any) {

                const errorMessage = error?.message || JSON.stringify(error) || "Unknown error";
                console.error("<ERROR_MESSAGE>", error);

                return {
                    content: [
                        {
                            type: "text",
                            text: `<ERROR_MESSAGE>: ${errorMessage}`,
                        },
                    ],
                };
            }
        }
    );
}
