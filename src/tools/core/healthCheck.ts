import { McpServer } from "@modelcontextprotocol/sdk/server/mcp.js";
import prisma from "../../clients/prismaClient.js";

// Verifies that the server and backend dependencies are healthy.
export default function healthCheck(mcpServerName: McpServer) {

    mcpServerName.registerTool(
        "healthcheck",
        { description: "Verify server and database connectivity" },

        async () => {

            // keep fail as fallback status
            let dbStatus = "fail";

            try {

                await prisma.$queryRaw`SELECT 1;`
                dbStatus = "ok";

            }

            catch (error) {
                dbStatus = `Connection failed. Error:  ${error}`
            }

            return {
                content: [
                    {
                        type: "text",
                        text: `Database status: ${dbStatus}`
                    }
                ],
                structuredContent: { dbStatus }
            };
        }
    );
}