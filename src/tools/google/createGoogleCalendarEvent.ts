import { McpServer } from "@modelcontextprotocol/sdk/server/mcp.js";
import authorizeGoogleClient from "../../clients/googleClient.js";
import { google } from 'googleapis';
import { z } from "zod";

// Creates a Google Calendar event
export default function createGoogleCalendarEvent(mcpServerName: McpServer) {

    mcpServerName.registerTool(
        "create-google-calendar-event",
        {
            title: "Create Google Calendar Event",
            description: "Creates a Google Calendar event",
            inputSchema: {
                eventTitle: z.string(),
                eventDescription: z.string(),
                eventStartDate: z.string(),
                eventStartTime: z.string(),
                eventEndDate: z.string(),
                eventEndTime: z.string(),
                attendees: z.array(z.string().email()),
            },
        },
        async ({
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
                const response = await google.calendar('v3').events.insert({
                    auth: googleClientAuth,
                    calendarId: 'primary',
                    requestBody: {
                        summary: eventTitle,
                        description: eventDescription,
                        attendees: attendees.map(email => ({ email })),
                        start: {
                            dateTime: `${eventStartDate}T${eventStartTime}:00Z`,
                        },
                        end: {
                            dateTime: `${eventEndDate}T${eventEndTime}:00Z`,
                        }
                    }
                });

                const createdEvent = response.data;
                const confirmation = response.status === 200 ? `Event created successfully: ${createdEvent.htmlLink}` : "Failed to create event.";

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
                            text: `Failed to create event: ${error.message}`,
                        },
                    ],
                };
            }
        }
    );
}
