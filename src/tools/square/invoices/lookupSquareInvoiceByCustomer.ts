import { McpServer } from "@modelcontextprotocol/sdk/server/mcp.js";
import squareClient from "../../../clients/squareClient.js";
import normalizeBigInt from "../../../helpers/normalizeBigInt.js";
import { z } from "zod";

// Search for Square invoice by customer ID and location ID
export default function lookupSquareInvoiceByCustomer(mcpServerName: McpServer) {

    mcpServerName.registerTool(
        "lookup-square-invoice-by-customer",
        {
            title: "Square Invoice Lookup (Customer ID)",
            description: "Lookup a Square invoice by customer ID and location ID",
            inputSchema: {
                locationId: z.string().min(1).describe("The ID of the location associated with the invoice."),
                customerId: z.string().min(1).describe("The ID of the customer associated with the invoice.")
            }
        },
        async ({
            locationId,
            customerId,
        }: { locationId: string; customerId: string }) => {
            try {
                const response = await squareClient.invoices.search({
                    query: {
                        filter: {
                            locationIds: [Array.isArray(locationId) ? locationId[0] : locationId],
                            customerIds: [Array.isArray(customerId) ? customerId[0] : customerId],
                        },
                    },
                });

                const invoices = response.invoices || [];

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

                const normalizedInvoice = normalizeBigInt(safeInvoice);

                if (invoices.length === 0) {
                    return {
                        content: [
                            {
                                type: "text",
                                text: `No invoice found for: ${locationId} and ${customerId}`,
                            },
                        ],
                    };
                }

                return {
                    content: [
                        {
                            type: "text",
                            text: JSON.stringify(normalizedInvoice, null, 2),
                        },
                    ],
                    structuredContent: normalizedInvoice,
                };
            } 
            catch (error) {
                return {
                    content: [
                        {
                            type: "text",
                            text: `Error looking up invoice: ${typeof error === "object" && error !== null && "message" in error
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