import { McpServer } from "@modelcontextprotocol/sdk/server/mcp.js";
import squareClient from "../../../clients/squareClient.js";
import normalizeBigInt from "../../../helpers/normalizeBigInt.js";
import { z } from "zod";

// List all Square invoices
export default function listInvoices(mcpServerName: McpServer) {

    mcpServerName.registerTool(
        "list-invoices",
        {
            title: "List Square Invoices",
            description: "Retrieve a list of all Square invoices by location ID",
            inputSchema: {
                locationId: z.string().describe("The ID of the location to list invoices for."),
            },
        },

        async ({
            locationId
        }) => {
            try {
                const response = await squareClient.invoices.list({
                    locationId: locationId,
                });

                const invoices = response.data || [];

                const safeInvoice = invoices.map(invoice => ({
                    id: invoice.id,
                    invoiceNumber: invoice.invoiceNumber,
                    title: invoice.title,
                    status: invoice.status,
                    customerFirstName: invoice.primaryRecipient?.givenName,
                    customerLastName: invoice.primaryRecipient?.familyName,
                    customerPhoneNumber: invoice.primaryRecipient?.phoneNumber,
                    customerEmail: invoice.primaryRecipient?.emailAddress,
                    createdAt: invoice.createdAt,
                    dueDate: invoice.paymentRequests?.[0]?.dueDate,
                    totalAmount: invoice.paymentRequests?.[0]?.computedAmountMoney
                }));

                if (invoices.length === 0) {
                    return {
                        content: [
                            {
                                type: "text",
                                text: `No invoices found for location ID: ${locationId}.`,
                            },
                        ],
                    };
                }

                const normalizedInvoices = normalizeBigInt(safeInvoice);

                return {
                    content: [
                        {
                            type: "text",
                            text: JSON.stringify(normalizedInvoices),
                        },
                    ],
                    structuredContent: normalizedInvoices,
                };
            } catch (error) {
                return {
                    content: [
                        {
                            type: "text",
                            text: `Error listing invoices: ${typeof error === "object" && error !== null && "message" in error
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