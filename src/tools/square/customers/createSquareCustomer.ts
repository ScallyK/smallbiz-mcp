import { McpServer } from "@modelcontextprotocol/sdk/server/mcp.js";
import { zPhoneNumber } from "../../../helpers/PhoneNumber.js"
import squareClient from "../../../clients/squareClient.js";
import { zCountry } from "../../../helpers/Country.js"
import { z } from "zod";

// Creates a customer in Square
export default function createSquareCustomer(mcpServerName: McpServer) {

    mcpServerName.registerTool(
        "create-square-customer",
        {
            title: "Create Square Customer",
            description: "Create a customer in Square.",
            inputSchema: {
                givenName: z.string(),
                familyName: z.string(),
                emailAddress: z.string().email(),
                address: z.object({
                    address_line_1: z.string(),
                    address_line_2: z.string().optional(),
                    address_line_3: z.string(),
                    administrative_district_level_1: z.string(), // State
                    administrative_district_level_2: z.string(), // County
                    administrative_district_level_3: z.string(), // A civil entity within the address's administrative_district_level_2, if any.
                    country: zCountry.default("ZZ"),
                    first_name: z.string(),
                    last_name: z.string(),
                    locality: z.string(), // The city or town of the address. 
                    postal_code: z.string(),
                    sublocality: z.string(), // A civil entity within the address's locality, if any.
                    sublocality_2: z.string(), // A civil region within the address's locality, if any.
                    // A civil region within the address's locality, if any.
                }).optional(),
                phoneNumber: zPhoneNumber.optional().refine(
                    (val) => !val || /^\+\d{1,15}$/.test(val),
                    { message: "Phone number must be formatted as E.164, e.g., +14155552671" }
                ),
                referenceId: z.string().optional(),
                note: z.string().optional(),
            },
        },
        async ({
            givenName,
            familyName,
            emailAddress,
            address,
            phoneNumber,
            referenceId,
            note,
        }) => {
            try {

                const customer = await squareClient.customers.create({
                    givenName: givenName,
                    familyName: familyName,
                    emailAddress: emailAddress,
                    address: address,
                    phoneNumber: phoneNumber,
                    referenceId: referenceId,
                    note: note,
                });

                const customerId = customer.customer?.id;

                return {
                    content: [
                        {
                            type: "text",
                            text: `Square customer created successfully! Customer ID: ${customerId}`,
                        },
                    ],
                };
            }
            catch (error: any) {

                const errorMessage = error?.message || JSON.stringify(error) || "Unknown error";
                console.error("Error creating Square customer:", error);

                return {
                    content: [
                        {
                            type: "text",
                            text: `Error creating Square customer: ${errorMessage}`,
                        },
                    ],
                };
            }
        }
    );
}
