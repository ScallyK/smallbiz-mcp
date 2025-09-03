import { McpServer, ResourceTemplate } from "@modelcontextprotocol/sdk/server/mcp.js";
import authorizeGoogleClient from "../../clients/googleClient.js";
import { calendar_v3 } from 'googleapis';
import { google } from 'googleapis';

// Search for Google Calendar event by ID
export default function lookupGoogleCalendarEventById(mcpServerName: McpServer) {

    mcpServerName.registerResource(
        "lookup-google-calendar-event-by-id",
        new ResourceTemplate("google://calendar/event/{eventId}", { list: undefined }),
        {
            title: "Google Calendar Event Lookup (ID)",
            description: "Lookup a Google Calendar event by ID",
            mimeType: "application/json"
        },
        async (uri, { eventId }) => {

            try {

                const googleClientAuth = await authorizeGoogleClient();

                const response = await google.calendar('v3').events.get({
                    calendarId: 'primary',
                    eventId: Array.isArray(eventId) ? eventId[0] : eventId,
                    auth: googleClientAuth
                });

                const event = response.data;
                const confirmation = response.status === 200 ? "Event found!" : "Event not found :(";

                return {
                    contents: [
                        {
                            uri: uri.href,
                            type: "text",
                            text: confirmation,
                        },
                        {
                            uri: uri.href,
                            text: JSON.stringify(event, null, 2),
                            structuredContent: event,
                        },
                    ],
                };

            }

            catch (error) {
                return {
                    contents: [
                        {
                            uri: uri.href,
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