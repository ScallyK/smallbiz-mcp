import { McpServer, ResourceTemplate } from "@modelcontextprotocol/sdk/server/mcp.js";
import squareClient from "../clients/squareClient.js";

// List all Square customers
export default function listSquareCustomers(mcpServerName: McpServer) {

    mcpServerName.registerResource(
        "list-square-customers",
        "square://customer/listAll",
        {
            title: "List Square Customers",
            description: "Retrieve a list of all Square customers",
            mimeType: "application/json"
        },
        async (uri) => {
            try {

                const response = await squareClient.customers.list();

                const customers = response.data || [];

                const safeCustomers = customers.map(customer => ({
                    id: customer.id,
                    firstName: customer.givenName,
                    lastName: customer.familyName,
                    phoneNumber: customer.phoneNumber,
                    email: customer.emailAddress,
                    createdAt: customer.createdAt,
                }));

                if (safeCustomers.length === 0) {
                    return {
                        contents: [
                            {
                                uri: uri.href,
                                text: `No customers found! Get out there and start making some sales, dagnabit!`,
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
                            text: `Error listing customers: ${typeof error === "object" && error !== null && "message" in error
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