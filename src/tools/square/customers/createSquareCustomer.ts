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
                    sublocality_3: z.string(), // A civil region within the address's locality, if any.
                }).optional(),
                birthday: z.string().optional(), // YYYY-MM-DD
                company_name: z.string().optional(),
                email_address: z.string().email().optional(),
                family_name: z.string().optional(),
                given_name: z.string().optional(),
                nickname: z.string().optional(),
                note: z.string().optional(),
                phone_number: zPhoneNumber.optional(),
                reference_id: z.string().optional(),
            },
        },
        async ({
            address,
            birthday,
            company_name,
            email_address,
            family_name,
            given_name,
            nickname,
            note,
            phone_number,
            reference_id,
        }) => {
            try {

                const customer = await squareClient.customers.create({
                    address: address ? address : undefined,
                    birthday: birthday ? birthday : undefined,
                    companyName: company_name ? company_name : undefined,
                    emailAddress: email_address ? email_address : undefined,
                    familyName: family_name ? family_name : undefined,
                    givenName: given_name ? given_name : undefined,
                    nickname: nickname ? nickname : undefined,
                    note: note ? note : undefined,
                    phoneNumber: phone_number ? phone_number : undefined,
                    referenceId: reference_id ? reference_id : undefined,
                })

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
