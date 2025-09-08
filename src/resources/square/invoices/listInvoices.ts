import { McpServer, ResourceTemplate } from "@modelcontextprotocol/sdk/server/mcp.js";
import squareClient from "../../../clients/squareClient.js";
import normalizeBigInt from "../../../helpers/normalizeBigInt.js";

// List all Square invoices
export default function listInvoices(mcpServerName: McpServer) {

    mcpServerName.registerResource(
        "list-invoices",
        new ResourceTemplate("square://invoices/by-location/{locationId}", { list: undefined }),
        {
            title: "List Square Invoices",
            description: "Rerieve a list of all Square invoices by location ID",
            mimeType: "application/json"
        },
        async (uri, { locationId }) => {

            if (!locationId) {
                return {
                    contents: [
                        {
                            uri: uri.href,
                            text: "Location Id is required to search invoices.",
                        },
                    ],
                };
            }


            try {

                const response = await squareClient.invoices.list({
                    locationId: Array.isArray(locationId) ? locationId[0] : locationId,
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
                        contents: [
                            {
                                uri: uri.href,
                                text: `No invoices found for location ID: ${locationId}.`,
                            },
                        ],
                    };
                }

                const normalizedInvoices = normalizeBigInt(safeInvoice);

                return {
                    contents: [
                        {
                            uri: uri.href,
                            text: JSON.stringify(normalizedInvoices, null, 2),
                            structuredContent: normalizedInvoices,
                        },
                    ],
                };
            } catch (error) {
                return {
                    contents: [
                        {
                            uri: uri.href,
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