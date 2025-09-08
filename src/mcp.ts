/* TODO: 

- Add database integration for Square/Google requests
- Finish containerization
- Properly handle response codes and errors from Square/Google APIs

*/

// MCP imports
import { McpServer } from "@modelcontextprotocol/sdk/server/mcp.js";
import { StdioServerTransport } from "@modelcontextprotocol/sdk/server/stdio.js";

// Core tool imports
import pingTool from "./tools/core/ping.js";
import healthCheck from "./tools/core/healthCheck.js";

// Square tool imports
import updateSquareCustomer from "./tools/square/customers/updateSquareCustomer.js";
import deleteSquareCustomer from "./tools/square/customers/deleteSquareCustomer.js";
import createSquareCustomer from "./tools/square/customers/createSquareCustomer.js";
import createSquareInvoice from "./tools/square/invoices/createSquareInvoice.js";
import updateSquareInvoice from "./tools/square/invoices/updateSquareInvoice.js";
import deleteSquareInvoice from "./tools/square/invoices/deleteSquareInvoice.js";

// Google Calendar tool imports
import deleteGoogleCalendarEvent from "./tools/google/deleteGoogleCalendarEvent.js";
import createGoogleCalendarEvent from "./tools/google/createGoogleCalendarEvent.js";
import updateGoogleCalendarEvent from "./tools/google/updateGoogleCalendarEvent.js";

// Square resource imports
import lookupSquareCustomerByEmail from "./resources/square/customers/lookupSquareCustomerByEmail.js";
import listSquareCustomers from "./resources/square/customers/listSquareCustomers.js";
import lookupSquareCustomerByID from "./resources/square/customers/lookupSquareCustomerByID.js";
import lookupSquareInvoiceByCustomer from "./resources/square/invoices/lookupSquareInvoiceByCustomer.js";
import lookupSquareInvoiceById from "./resources/square/invoices/lookupSquareInvoiceById.js";
import listInvoices from "./resources/square/invoices/listInvoices.js";

// Google resource imports
import listCalendarEvents from "./resources/google/listCalendarEvents.js";
import lookupGoogleCalendarEventById from "./resources/google/lookupGoogleCalendarEventById.js";

// Init MCP Server
const smallbiz_MCP = new McpServer({
  name: "smallbiz-mcp",
  version: "0.1.0",
  capabilities: {
    resources: {
      "lookup-square-customer-by-email": {
        description: "Lookup a Square customer by email address",
        uriTemplate: "square://customer/{email}",
        mimeTypes: ["application/json"],
      },
      "lookup-square-customer-by-id": {
        description: "Lookup a Square customer by ID",
        uriTemplate: "square://customer/{id}",
        mimeTypes: ["application/json"],
      },
      "list-square-customers": {
        description: "List all Square customers",
        uriTemplate: "square://customers",
        mimeTypes: ["application/json"],
      },
      "lookup-square-invoice-by-customer": {
        description: "Lookup Square invoices by customer ID and location ID",
        uriTemplate: "square://invoice/customer/{customerId}/location/{locationId}",
        mimeTypes: ["application/json"],
      },
      "lookup-square-invoice-by-id": {
        description: "Lookup Square invoice by invoice ID",
        uriTemplate: "square://invoice/{invoiceId}",
        mimeTypes: ["application/json"],
      },
      "list-square-invoices": {
        description: "List all Square invoices",
        uriTemplate: "square://invoices",
        mimeTypes: ["application/json"],
      },
      "list-google-calendar-events": {
        description: "List upcoming Google Calendar events",
        uriTemplate: "google://calendar/events",
        mimeTypes: ["application/json"],
      },
      "lookup-google-calendar-event-by-id": {
        description: "Lookup Google Calendar event by ID",
        uriTemplate: "google://calendar/event/{eventId}",
        mimeTypes: ["application/json"],
      },
    },
    tools: {
      "ping": {
        description: "Ping the server to check connectivity",
        mimeTypes: ["application/json"],
      },
      "health-check": {
        description: "Check health of server and dependencies",
        mimeTypes: ["application/json"],
      },
      "create-square-customer": {
        description: "Create a new customer in Square",
        mimeTypes: ["application/json"],
      },
      "update-square-customer": {
        description: "Update a customer in Square",
        mimeTypes: ["application/json"],
      },
      "delete-square-customer": {
        description: "Delete a customer from Square",
        mimeTypes: ["application/json"],
      },
      "create-square-invoice": {
        description: "Create a new invoice in Square",
        mimeTypes: ["application/json"],
      },
      "update-square-invoice": {
        description: "Update an invoice in Square",
        mimeTypes: ["application/json"],
      },
      "delete-square-invoice": {
        description: "Delete an invoice from Square",
        mimeTypes: ["application/json"],
      },
      "create-google-calendar-event": {
        description: "Create a Google Calendar event",
        mimeTypes: ["application/json"],
      },
      "update-google-calendar-event": {
        description: "Update a Google Calendar event",
        mimeTypes: ["application/json"],
      },
      "delete-google-calendar-event": {
        description: "Delete a Google Calendar event",
        mimeTypes: ["application/json"],
      },
    },
  },
});

/* --------------------------------------------
-------------------Core Tools------------------
-------------------------------------------- */

// Basic ping tool, always returns "pong".
pingTool(smallbiz_MCP); // TESTED WORKING

// Verifies that the server and backend dependencies are healthy. (postgres and redis)
healthCheck(smallbiz_MCP); // TESTED WORKING

/* -----------------------------------------------------
----------------Square Resources------------------------
----------------------------------------------------- */

// Search for square customer by email
lookupSquareCustomerByEmail(smallbiz_MCP);  // TESTED WORKING

// Search for square customer by ID
lookupSquareCustomerByID(smallbiz_MCP); // TESTED WORKING

// List all Square customers
listSquareCustomers(smallbiz_MCP); // TESTED WORKING

// Search for Square invoice by customer ID and location ID
lookupSquareInvoiceByCustomer(smallbiz_MCP);  // TESTED WORKING

// Search for Square invoice by invoice ID
lookupSquareInvoiceById(smallbiz_MCP);  // TESTED WORKING

// List all Square invoices
listInvoices(smallbiz_MCP); // TESTED WORKING

/* -------------------------------------------------------
-----------------Google Calendar Resources----------------
------------------------------------------------------- */

// Lists 30 upcoming Google Calendar events
listCalendarEvents(smallbiz_MCP); // TESTED WORKING

// Gets a calendar event by ID
lookupGoogleCalendarEventById(smallbiz_MCP); // TESTED WORKING

/* -----------------------------------------------------
-----------------------Square Tools---------------------
----------------------------------------------------- */

// Creates a new customer in Square
createSquareCustomer(smallbiz_MCP); // TESTED WORKING

// Updates a customer in Square
updateSquareCustomer(smallbiz_MCP); // times out

// Deletes a customer from Square
deleteSquareCustomer(smallbiz_MCP); // TESTED WORKING

// Creates a new invoice in Square given the below parameters.
createSquareInvoice(smallbiz_MCP); // Times out. Could be Square issue.

// Updates an invoice in Square.
updateSquareInvoice(smallbiz_MCP);

// Deletes an invoice from Square
deleteSquareInvoice(smallbiz_MCP); // TESTED WORKING

/* ---------------------------------------------------
-----------------Google Calendar Tools----------------
--------------------------------------------------- */

// Creates a Google Calendar event
createGoogleCalendarEvent(smallbiz_MCP); // TESTED WORKING

// Updates a Google Calendar event
updateGoogleCalendarEvent(smallbiz_MCP); // TESTED WORKING

// Deletes a Google Calendar event
deleteGoogleCalendarEvent(smallbiz_MCP); // TESTED WORKING

// Start MCP server
async function main() {

  const transport = new StdioServerTransport();
  await smallbiz_MCP.connect(transport);

  console.log("smallbiz-mcp server running on stdio!");
}

main().catch((error) => {
  console.error("Fatal error in main():", error);
  process.exit(1);
});


