import { McpServer } from "@modelcontextprotocol/sdk/server/mcp.js";
import { z } from "zod";
import squareClient from "../../../clients/squareClient.js";

// Deletes an invoice from Square
export default function deleteSquareInvoice(mcpServerName: McpServer) {

    mcpServerName.registerTool(
        "delete-square-invoice",
        {
            title: "Delete Square Invoice",
            description: "Delete a Square invoice for a given invoice ID.",
            inputSchema: {
                invoiceId: z.string(),
            },
        },
        async ({
            invoiceId,
        }) => {
            try {

                await squareClient.invoices.delete({ invoiceId });
                return {
                    content: [
                        {
                            type: "text",
                            text: `Square invoice deleted successfully! Invoice ID: ${invoiceId}`,
                        },
                    ],
                };
            }

            catch (error: any) {
                const errorMessage =
                    error?.message || JSON.stringify(error) || "Unknown error";
                console.error("Error deleting Square invoice:", error);
                return {
                    content: [
                        {
                            type: "text",
                            text: `Error deleting Square invoice: ${errorMessage}`,
                        },
                    ],
                };
            }
        }
    );
}
