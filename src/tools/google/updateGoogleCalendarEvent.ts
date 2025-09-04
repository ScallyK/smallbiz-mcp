import { McpServer } from "@modelcontextprotocol/sdk/server/mcp.js";
import authorizeGoogleClient from "../../clients/googleClient.js";
import { google } from 'googleapis';
import { z } from "zod";
import { zRFC3339 } from "../../helpers/RFC3339.js";


// Creates a Google Calendar event
export default function updateGoogleCalendarEvent(mcpServerName: McpServer) {

    mcpServerName.registerTool(
        "update-google-calendar-event",
        {
            title: "Update Google Calendar Event",
            description: "Updates a Google Calendar event",
            inputSchema: {
                eventId: z.string(),
                eventTitle: z.string().optional(),
                eventDescription: z.string().optional(),
                eventStartDate: z.string(),
                eventStartTime: z.string(),
                eventEndDate: z.string(),
                eventEndTime: z.string(),
                attendees: z.array(z.string().email()).optional(),
                timeZone: z.string().optional(),
            },
        },
        async ({
            eventId,
            eventTitle,
            eventDescription,
            eventStartDate,
            eventStartTime,
            eventEndDate,
            eventEndTime,
            attendees,
        }) => {

            try {

                const googleClientAuth = await authorizeGoogleClient();
                const response = await google.calendar('v3').events.update({
                    auth: googleClientAuth,
                    calendarId: 'primary',
                    eventId: eventId,
                    requestBody: {
                        summary: eventTitle,
                        description: eventDescription,
                        attendees: attendees ? attendees.map(email => ({ email })) : [],
                        start: {
                            dateTime: `${eventStartDate}T${eventStartTime}:00Z`,
                        },
                        end: {
                            dateTime: `${eventEndDate}T${eventEndTime}:00Z`,
                        }
                    }
                });

                const createdEvent = response.data;
                const confirmation = response.status === 200 ? `Event updated successfully: ${createdEvent.htmlLink}` : "Failed to update event.";

                return {
                    content: [
                        {
                            type: "text",
                            text: confirmation,
                        },
                        {
                            type: "text",
                            text: `Event Details: ${JSON.stringify(createdEvent, null, 2)}`,
                        },
                        {
                            type: "text",
                            text: `Event Link: ${createdEvent.htmlLink}`,
                        }
                    ],
                };
            }
            catch (error: any) {
                return {
                    content: [
                        {
                            type: "text",
                            text: `Failed to update event: ${error.message}`,
                        },
                    ],
                };
            }
        }
    );
}
