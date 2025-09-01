import { McpServer } from "@modelcontextprotocol/sdk/server/mcp.js";
import { z } from "zod";
import squareClient from "../../../clients/squareClient.js";

// Deletes a customer from Square
export default function deleteSquareCustomer(mcpServerName: McpServer) {

    mcpServerName.registerTool(
        "delete-square-customer",
        {
            title: "Delete Square Customer",
            description: "Delete a customer in Square for a given customer ID.",
            inputSchema: {
                customerId: z.string(),
            },
        },
        async ({
            customerId,
        }) => {
            try {

                await squareClient.customers.delete({ customerId });
                return {
                    content: [
                        {
                            type: "text",
                            text: `Square customer deleted successfully! Customer ID: ${customerId}`,
                        },
                    ],
                };
            }

            catch (error: any) {
                const errorMessage =
                    error?.message || JSON.stringify(error) || "Unknown error";
                console.error("Error deleting Square customer:", error);
                return {
                    content: [
                        {
                            type: "text",
                            text: `Error deleting Square customer: ${errorMessage}`,
                        },
                    ],
                };
            }
        }
    );
}
