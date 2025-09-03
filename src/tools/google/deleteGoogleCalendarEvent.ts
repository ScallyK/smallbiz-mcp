import { McpServer } from "@modelcontextprotocol/sdk/server/mcp.js";
import authorizeGoogleClient from "../../clients/googleClient.js";
import { google } from 'googleapis';
import { z } from "zod";

// Deletes a Google Calendar event
export default function deleteGoogleCalendarEvent(mcpServerName: McpServer) {

    mcpServerName.registerTool(
        "delete-google-calendar-event",
        {
            title: "Delete Google Calendar Event",
            description: "Deletes a Google Calendar event",
            inputSchema: {
                eventId: z.string(),
            },
        },
        async ({
            eventId,
        }) => {

            try {
                
                const googleClientAuth = await authorizeGoogleClient();
                
                const response = await google.calendar('v3').events.delete({
                    calendarId: 'primary',
                    eventId: eventId,
                    auth: googleClientAuth
                });

                const confirmation = response.status === 204 ? "Event deleted successfully." : "Failed to delete event.";

                return {
                    content: [
                        {
                            type: "text",
                            text: confirmation,
                        },
                    ],
                };
            }
            catch (error: any) {
                return {
                    content: [
                        {
                            type: "text",
                            text: `Failed to delete event: ${error.message}`,
                        },
                    ],
                };
            }
        }
    );
}
