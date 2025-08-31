import { McpServer, ResourceTemplate } from "@modelcontextprotocol/sdk/server/mcp.js";
import squareClient from "../clients/squareClient.js";

// Search for square customer by email
export default function lookupSquareCustomerByEmail(mcpServerName: McpServer) {

    mcpServerName.registerResource(
        "lookup-square-customer-by-email",
        new ResourceTemplate("square://customer/{email}", { list: undefined }),
        {
            title: "Square Customer Lookup (Email)",
            description: "Lookup a Square customer by email address",
            mimeType: "application/json"
        },
        async (uri, { email }) => {

            email = Array.isArray(email) ? email[0] : email;
            email = decodeURIComponent(email);

            try {

                if (!email || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
                    return {
                        contents: [
                            { uri: uri.href, text: `Please provide a valid email address.` },
                        ],
                    };
                }

                if (!email) {
                    return {
                        contents: [
                            {
                                uri: uri.href,
                                text: "Please provide an email address to search.",
                            },
                        ],
                    };
                }

                const response = await squareClient.customers.search({
                    query: {
                        filter: {
                            emailAddress: {
                                exact: Array.isArray(email) ? email[0] : email,
                            },
                        },
                    },
                });

                const customers = response.customers || [];

                const safeCustomers = customers.map(customer => ({
                    id: customer.id,
                    email: customer.emailAddress,
                    phone: customer.phoneNumber,
                    givenName: customer.givenName,
                    familyName: customer.familyName,
                }));

                if (customers.length === 0) {
                    return {
                        contents: [
                            {
                                uri: uri.href,
                                text: `No customer found for email: ${email}`,
                            },
                        ],
                    };
                }

                return {
                    contents: [
                        {
                            uri: uri.href,
                            text: JSON.stringify(safeCustomers, null, 2),
                            structuredContent: safeCustomers,
                        },
                    ],
                };
            } catch (error) {
                return {
                    contents: [
                        {
                            uri: uri.href,
                            text: `Error looking up customer: ${typeof error === "object" && error !== null && "message" in error
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