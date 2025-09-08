import { McpServer, ResourceTemplate } from "@modelcontextprotocol/sdk/server/mcp.js";
import squareClient from "../../../clients/squareClient.js";
import normalizeBigInt from "../../../helpers/normalizeBigInt.js";

// Search for square customer by ID
export default function lookupSquareCustomerByID(mcpServerName: McpServer) {

    mcpServerName.registerResource(
        "lookup-square-customer-by-id",
        new ResourceTemplate("square://customer/by-id/{id}", { list: undefined }),
        {
            title: "Square Customer Lookup (ID)",
            description: "Lookup a Square customer by ID",
            mimeType: "application/json"
        },
        async (uri, { id }) => {

            try {
                const response = await squareClient.customers.get({ customerId: Array.isArray(id) ? id[0] : id });
                const customer = response.customer;
                const normalizedCustomer = normalizeBigInt(customer);

                if (!customer) {
                    return {
                        contents: [
                            {
                                uri: uri.href,
                                text: "Customer not found",
                            },
                        ],
                    };
                }

                else return {
                    contents: [
                        {
                            uri: uri.href,
                            text: JSON.stringify(normalizedCustomer, null, 2),
                            structuredContent: normalizedCustomer,
                        },
                    ],
                };
            }
            catch (error) {
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