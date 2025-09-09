import { McpServer, ResourceTemplate } from "@modelcontextprotocol/sdk/server/mcp.js";
import squareClient from "../../../clients/squareClient.js";
import normalizeBigInt from "../../../helpers/normalizeBigInt.js";
import { z } from "zod";

// Search for square customer by ID
export default function lookupSquareCustomerByID(mcpServerName: McpServer) {

    mcpServerName.registerTool(
        "lookup-square-customer-by-id",
        {
            title: "Square Customer Lookup (ID)",
            description: "Lookup a Square customer by ID",
            inputSchema: {
                customerId: z.string().min(1).describe("The ID of the customer to look up."),
            },
        },
        async ({
            customerId,
        }) => {
            try {
                const response = await squareClient.customers.get({ customerId: Array.isArray(customerId) ? customerId[0] : customerId });
                const customer = response.customer;
                const normalizedCustomer = normalizeBigInt(customer);

                if (!customer) {
                    return {
                        content: [
                            {
                                type: "text",
                                text: "Customer not found",
                            },
                        ],
                    };
                }

                else return {
                    content: [
                        {
                            type: "text",
                            text: JSON.stringify(normalizedCustomer, null, 2),
                        },
                    ],
                    structuredContent: normalizedCustomer,
                };
            }
            catch (error) {
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