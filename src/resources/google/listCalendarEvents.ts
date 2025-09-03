import { McpServer } from "@modelcontextprotocol/sdk/server/mcp.js";
import authorizeGoogleClient from "../../clients/googleClient.js";
import { calendar_v3 } from 'googleapis';
import { google } from 'googleapis';

// Lists 10 upcoming Google Calendar events
export default function listCalendarEvents(mcpServerName: McpServer) {

    mcpServerName.registerResource(
        "list-google-calendar-events",
        "google://calendar/events/list",
        {
            title: "List Google Calendar Events",
            description: "Retrieve a list of 30 upcoming Google Calendar events",
            mimeType: "application/json"
        },
        async (uri) => {
            try {

                const googleClientAuth = await authorizeGoogleClient();
                
                const response = await google.calendar('v3').events.list({
                    calendarId: 'primary',
                    timeMin: (new Date()).toISOString(),
                    maxResults: 30,
                    singleEvents: true,
                    orderBy: 'startTime',
                    auth: googleClientAuth
                });

                const events = response.data.items || [];

                interface SafeEvent {
                    id: string | undefined;
                    summary: string | undefined;
                    start: string | undefined;
                    end: string | undefined;
                    attendees: string | undefined;
                    description: string | undefined;
                }

                const safeEvents: SafeEvent[] = events.map((event: calendar_v3.Schema$Event) => ({
                    id: event.id ?? undefined,
                    summary: event.summary ?? undefined,
                    start: event.start?.dateTime ?? event.start?.date ?? undefined,
                    end: event.end?.dateTime ?? event.end?.date ?? undefined,
                    attendees: event.attendees ? event.attendees.map(attendee => attendee.email).join(", ") : undefined,
                    description: event.description ?? undefined,
                }));


                if (safeEvents.length === 0) {
                    return {
                        contents: [
                            {
                                uri: uri.href,
                                text: `No events found! Get out there and start making some sales, dagnabit!`,
                            },
                        ],
                    };
                }

                return {
                    contents: [
                        {
                            uri: uri.href,
                            text: JSON.stringify(safeEvents, null, 2),
                            structuredContent: safeEvents,
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