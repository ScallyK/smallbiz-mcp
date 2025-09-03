import { McpServer, ResourceTemplate } from "@modelcontextprotocol/sdk/server/mcp.js";

// Template for creating new MCP tools
export default function mcpResourceTemplate(mcpServerName: McpServer) {

    mcpServerName.registerResource(
        "<resource_name>",
        new ResourceTemplate("<resource_uri>", { list: undefined }),
        {
            title: "<resource_title>",
            description: "<resource_description>",
            mimeType: "application/json"
        },

        async (uri, { inputParameter1, inputParameter2 }) => {

            if (!inputParameter1 || !inputParameter2) {
                return {
                    contents: [
                        {
                            uri: uri.href,
                            text: "Both inputParameter1 and inputParameter2 are required!.",
                        },
                    ],
                };
            }


            try {

                // Functionality here. (API/Function/Etc.)

                return {
                    contents: [
                        {
                            uri: uri.href,
                            text: "<text_content>",
                            structuredContent: "<structured_content>",
                        },
                    ],
                };
            } catch (error) {
                return {
                    contents: [
                        {
                            uri: uri.href,
                            text: `<error_message> ${typeof error === "object" && error !== null && "message" in error
                                ? (error as any).message
                                : String(error)
                                }`,
                        },
                    ],
                };
            }
        }
    );
}