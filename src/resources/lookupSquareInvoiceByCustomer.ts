import { McpServer, ResourceTemplate } from "@modelcontextprotocol/sdk/server/mcp.js";
import squareClient from "../clients/squareClient.js";

// Search for Square invoice by customer ID and location ID
export default function lookupSquareInvoiceByCustomer(mcpServerName: McpServer) {

    mcpServerName.registerResource(
        "lookup-square-invoice-by-customer",
        new ResourceTemplate("square://invoice/{locationID}/{customerID}", { list: undefined }),
        {
            title: "Square Invoice Lookup (Customer ID)",
            description: "Lookup a Square invoice by customer ID and location ID",
            mimeType: "application/json"
        },
        async (uri, { locationID, customerID }) => {

            if (!locationID || !customerID) {
                return {
                    contents: [
                        {
                            uri: uri.href,
                            text: "Both locationID and customerID are required to search invoices.",
                        },
                    ],
                };
            }


            try {

                const response = await squareClient.invoices.search({
                    query: {
                        filter: {

                            locationIds: [Array.isArray(locationID) ? locationID[0] : locationID],

                            customerIds: [Array.isArray(customerID) ? customerID[0] : customerID],
                        },
                    },
                });

                const invoice = response.invoices || [];

                const safeInvoice = invoice.map(invoice => ({
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

                if (invoice.length === 0) {
                    return {
                        contents: [
                            {
                                uri: uri.href,
                                text: `No invoice found for: ${locationID} and ${customerID}`,
                            },
                        ],
                    };
                }

                return {
                    contents: [
                        {
                            uri: uri.href,
                            text: JSON.stringify(safeInvoice, null, 2),
                            structuredContent: safeInvoice,
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