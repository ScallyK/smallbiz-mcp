import { McpServer, ResourceTemplate } from "@modelcontextprotocol/sdk/server/mcp.js";
import squareClient from "../../../clients/squareClient.js";
import normalizeBigInt from "../../../helpers/normalizeBigInt.js";

// Search for Square invoice by invoice ID
export default function lookupSquareInvoiceById(mcpServerName: McpServer) {

    mcpServerName.registerResource(
        "lookup-square-invoice-by-id",
        new ResourceTemplate("square://invoices/by-id/{invoiceID}", { list: undefined }),
        {
            title: "Square Invoice Lookup (Invoice ID)",
            description: "Lookup a Square invoice by invoice ID",
            mimeType: "application/json"
        },
        async (uri, { invoiceID }) => {

            if (!invoiceID) {
                return {
                    contents: [
                        {
                            uri: uri.href,
                            text: "Invoice ID is required to search invoices.",
                        },
                    ],
                };
            }

            // Decode since ID #s can be weird
            const decodedInvoiceId = decodeURIComponent(Array.isArray(invoiceID) ? invoiceID[0] : invoiceID);

            try {

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
                        contents: [
                            {
                                uri: uri.href,
                                text: `No invoice found for: ${invoiceID}`,
                            },
                        ],
                    };
                }

                const normalizedInvoice = normalizeBigInt(invoice);

                return {
                    contents: [
                        {
                            uri: uri.href,
                            text: JSON.stringify(normalizedInvoice, null, 2),
                            structuredContent: normalizedInvoice,
                        },
                    ],
                };
            } catch (error) {
                return {
                    contents: [
                        {
                            uri: uri.href,
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