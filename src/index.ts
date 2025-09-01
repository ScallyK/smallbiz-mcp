import { McpServer } from "@modelcontextprotocol/sdk/server/mcp.js";
import { StdioServerTransport } from "@modelcontextprotocol/sdk/server/stdio.js";

// Tools
import pingTool from "./tools/core/ping.js";
import healthCheck from "./tools/core/healthCheck.js";
import updateSquareCustomer from "./tools/square/customers/updateSquareCustomer.js";
import deleteSquareCustomer from "./tools/square/customers/deleteSquareCustomer.js";
import createSquareCustomer from "./tools/square/customers/createSquareCustomer.js";
import createSquareInvoice from "./tools/square/invoices/createSquareInvoice.js";

// Resources
import lookupSquareCustomerByEmail from "./resources/square/customers/lookupSquareCustomerByEmail.js";
import listSquareCustomers from "./resources/square/customers/listSquareCustomers.js";
import lookupSquareCustomerByID from "./resources/square/customers/lookupSquareCustomerByID.js";
import lookupSquareInvoiceByCustomer from "./resources/square/invoices/lookupSquareInvoiceByCustomer.js";
import lookupSquareInvoiceById from "./resources/square/invoices/lookupSquareInvoiceById.js";
import listInvoices from "./resources/square/invoices//listInvoices.js";
import updateSquareInvoice from "./tools/square/invoices/updateSquareInvoice.js";
import deleteSquareInvoice from "./tools/square/invoices/deleteSquareInvoice.js";

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

// Search for square customer by ID
lookupSquareCustomerByID(smallbiz_MCP);

// List all Square customers
listSquareCustomers(smallbiz_MCP);

// Search for Square invoice by customer ID and location ID
lookupSquareInvoiceByCustomer(smallbiz_MCP);

// Search for Square invoice by invoice ID
lookupSquareInvoiceById(smallbiz_MCP);

// List all Square invoices
listInvoices(smallbiz_MCP);


/* -----------------------------------------------------
-----------------------Square Tools---------------------
----------------------------------------------------- */

// Creates a new customer in Square
createSquareCustomer(smallbiz_MCP);

// Updates a customer in Square
updateSquareCustomer(smallbiz_MCP);

// Deletes a customer from Square
deleteSquareCustomer(smallbiz_MCP);

// Creates a new invoice in Square given the below parameters.
createSquareInvoice(smallbiz_MCP);

// Updates an invoice in Square.
updateSquareInvoice(smallbiz_MCP);

// Deletes an invoice from Square
deleteSquareInvoice(smallbiz_MCP);

/* --------------------------------------------
-------------------CRM Tools------------------
-------------------------------------------- */

// list-customers: fetches list of all customers. DONE

// get-customer: retrieve details for a customer by ID or by email. DONE

// create-customer: add a new customer to Square. DONE

// update-customer: update customer contact info, etc. DONE

// delete-customer: delete a customer record. DONE

// list-invoices: fetch all invoices for a customer. DONE

// get-invoice: retrieve details for a customer by ID or by email. DONE

// create-invoice: generates a new invoice in Square. DONE

// update-invoice: update an existing invoice in Square. DONE

// delete-invoice: delete an invoice from Square. DONE

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



