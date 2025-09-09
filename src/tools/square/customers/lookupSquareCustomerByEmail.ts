import { McpServer, ResourceTemplate } from "@modelcontextprotocol/sdk/server/mcp.js";
import squareClient from "../../../clients/squareClient.js";
import normalizeBigInt from "../../../helpers/normalizeBigInt.js";
import z from "zod";

// Search for square customer by email
export default function lookupSquareCustomerByEmail(mcpServerName: McpServer) {

    mcpServerName.registerTool(
        "lookup-square-customer-by-email",
        {
            title: "Square Customer Lookup (Email)",
            description: "Lookup a Square customer by email address",
            inputSchema: {
                email: z.string().email().describe("The email address of the customer to look up."),
            },
        },
        async ({
            email
        }) => {
            try {

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

                const normalizedCustomers = normalizeBigInt(safeCustomers);

                if (normalizedCustomers.length === 0) {
                    return {
                        content: [
                            {
                                type: "text",
                                text: `No customer found for email: ${email}`,
                            },
                        ],
                    };
                }

                return {
                    content: [
                        {
                            type: "text",
                            text: JSON.stringify(normalizedCustomers, null, 2),
                        },
                    ],
                    structuredContent: normalizedCustomers,
                };
            } catch (error) {
                return {
                    content: [
                        {
                            type: "text",
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