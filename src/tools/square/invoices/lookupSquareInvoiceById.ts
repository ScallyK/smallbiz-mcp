import { McpServer, ResourceTemplate } from "@modelcontextprotocol/sdk/server/mcp.js";
import squareClient from "../../../clients/squareClient.js";
import normalizeBigInt from "../../../helpers/normalizeBigInt.js";
import z from "zod";

// Search for Square invoice by invoice ID
export default function lookupSquareInvoiceById(mcpServerName: McpServer) {

    mcpServerName.registerTool(
        "lookup-square-invoice-by-id",
        {
            title: "Square Invoice Lookup (Invoice ID)",
            description: "Lookup a Square invoice by invoice ID",
            inputSchema: {
                invoiceId: z.string().min(1).describe("The ID of the invoice to look up."),
            }
        },
        async ({
            invoiceId,
        }) => {
            try {

                // Decode since ID #s can be weird
                const decodedInvoiceId = decodeURIComponent(Array.isArray(invoiceId) ? invoiceId[0] : invoiceId);

                const response = await squareClient.invoices.get({
                    invoiceId: decodedInvoiceId
                });

                // wrapping in array for consistency
                const invoice = response.invoice || [];
                const invoicesArray = Array.isArray(invoice) ? invoice : invoice ? [invoice] : [];

                const safeInvoice = invoicesArray.map(invoice => ({
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

                if (invoicesArray.length === 0) {
                    return {
                        content: [
                            {
                                type: "text",
                                text: `No invoice found for: ${invoiceId}`,
                            },
                        ],
                    };
                }

                const normalizedInvoice = normalizeBigInt(safeInvoice);

                return {
                    content: [
                        {
                            type: "text",
                            text: JSON.stringify(normalizedInvoice, null, 2),
                        },
                    ],
                    structuredContent: normalizedInvoice,
                };
            } catch (error) {
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