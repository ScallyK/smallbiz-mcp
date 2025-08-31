import { McpServer } from "@modelcontextprotocol/sdk/server/mcp.js";
import { StdioServerTransport } from "@modelcontextprotocol/sdk/server/stdio.js";

// Tools
import pingTool from "./tools/ping.js";
import healthCheck from "./tools/healthCheck.js";
import createSquareInvoice from "./tools/createSquareInvoice.js";

// Resources
import lookupSquareCustomerByEmail from "./resources/lookupSquareCustomerByEmail.js";
import listSquareCustomers from "./resources/listSquareCustomers.js";
import lookupSquareInvoiceByCustomer from "./resources/lookupSquareInvoiceByCustomer.js";
import lookupSquareInvoiceById from "./resources/lookupSquareInvoiceById.js";
import listInvoices from "./resources/listInvoices.js";

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
    },
    tools: {},
  },
});

/* --------------------------------------------
-------------------Core Tools------------------
-------------------------------------------- */

// Basic ping tool, always returns "pong".
pingTool(smallbiz_MCP);

// Verifies that the server and backend dependencies are healthy. (postgres and redis)
healthCheck(smallbiz_MCP);

/* -----------------------------------------------------
----------------Square Resources----------------
----------------------------------------------------- */

// Search for square customer by email
lookupSquareCustomerByEmail(smallbiz_MCP);

// Search for Square invoice by customer ID and location ID
lookupSquareInvoiceByCustomer(smallbiz_MCP);

// Search for Square invoice by invoice ID
lookupSquareInvoiceById(smallbiz_MCP);

// List all Square invoices
listInvoices(smallbiz_MCP);

// List all Square customers
listSquareCustomers(smallbiz_MCP);

/* -----------------------------------------------------
-----------------------Square Tools---------------------
----------------------------------------------------- */

// Creates a new invoice in Square given the below parameters.
createSquareInvoice(smallbiz_MCP);

/* --------------------------------------------
-------------------CRM Tools------------------
-------------------------------------------- */

// list-customers: fetches list of all customers.

// get-customer: retrieve details for a customer by ID or by email.

// create-customer: add a new customer to the CRM.

// update-customer: update customer contact info, preferences, tags, etc.

// delete-customer: archive or delete a customer record.

// search-customers: query customer by name, email, or tag.

/* --------------------------------------------
-----------------Calendar Tools----------------
-------------------------------------------- */

// list-events: fetch events for a given date range.

// create-event: schedule a meeting/event with details.

// update-event: modify an event.

// delete-event: cancel/remove an event.

// find-availability: check available time slots (per user/team).

/* --------------------------------------------
-------------------Sales Tools-----------------
-------------------------------------------- */

// list-leads: return active leads with statuses.

// get-lead: fetch lead details.

// create-lead: add a new sales lead.

// create-estimate: generates a new estimate based on criteria (Labor only, parts & labor, scope, etc.)

// create-invoice: generates a new invoice based on a previous estimate or from scratch.

// update-lead-status: change lead stage.

// list-deals: get open and/or closed deals.

// create-deal: start a new deal or opportunity.

// update-deal: update deal value, stage, or owner.

/* --------------------------------------------
----------------Marketing Tools----------------
-------------------------------------------- */

// list-campaigns: return all marketing campaigns.

// get-campaign: get details for one campaign.

// create-campaign: start a new email/social media campaign.

// update-campaign: adjust messaging, dates, or audiences for a given campaign.

// send-email-blast: trigger an outbound campaign email.

// track-metrics: pull some analytics (open rate, click rate, conversions).

/* --------------------------------------------
----------------Reporting Tools----------------
-------------------------------------------- */

// sales-report: revenue, deals won or lost over a given time period.

// customer-growth: new customers over time.

// lead-conversion-rate: lead to deal conversion ratios.

// campaign-performance: KPIs for campaigns.

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



