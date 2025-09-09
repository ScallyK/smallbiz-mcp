import { McpServer, ResourceTemplate } from "@modelcontextprotocol/sdk/server/mcp.js";
import authorizeGoogleClient from "../../clients/googleClient.js";
import { google } from 'googleapis';
import normalizeBigInt from "../../helpers/normalizeBigInt.js";
import { z } from "zod";

// Search for Google Calendar event by ID
export default function lookupGoogleCalendarEventById(mcpServerName: McpServer) {

    mcpServerName.registerTool(
        "lookup-google-calendar-event-by-id",
        {
            title: "Google Calendar Event Lookup (ID)",
            description: "Lookup a Google Calendar event by ID",
            inputSchema: {
                eventId: z.string().min(1).describe("The ID of the Google Calendar event to look up."),
            },
        },
        async ({ eventId }) => {

            try {

                const googleClientAuth = await authorizeGoogleClient();

                const response = await google.calendar('v3').events.get({
                    calendarId: 'primary',
                    eventId: Array.isArray(eventId) ? eventId[0] : eventId,
                    auth: googleClientAuth
                });

                const event = response.data;
                const confirmation = response.status === 200 ? "Event found!" : "Event not found :(";
                const normalizedEvent = normalizeBigInt(event);

                return {
                    content: [
                        {
                            type: "text",
                            text: confirmation,
                        },
                        {
                            type: "text",
                            text: JSON.stringify(normalizedEvent, null, 2),
                        },
                    ],
                    structuredContent: normalizedEvent,
                };
            } catch (error) {
                return {
                    content: [
                        {
                            type: "text",
                            text: `Error looking up event: ${typeof error === "object" && error !== null && "message" in error
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