import { McpServer } from "@modelcontextprotocol/sdk/server/mcp.js";
import { PrismaClient } from "@prisma/client";
import { StdioServerTransport } from "@modelcontextprotocol/sdk/server/stdio.js";
import { z } from "zod";

// Init Prisma Client
const prisma = new PrismaClient();

// Init MCP Server
const smallbiz_MCP = new McpServer({
  name: "smallbiz-mcp",
  version: "0.1.0",
  capabilities: {
    resources: {},
    tools: {},
  },
});

/* --------------------------------------------
-------------------Core Tools------------------
-------------------------------------------- */

// ping: always returns pong.

// healthcheck: verifies DB connection and returns status.

// search-docs: search internal knowledge base.

// list-resources: enumerates all available resources (users, leads, etc).

// Basic ping tool
smallbiz_MCP.tool(

  "ping",
  "always returns pong",

  async () => {
    return {
      content: [
        {
          type: "text",
          text: "pong",
        },
      ],
    };
  },
);

// Verifies that the server and backend dependencies are healthy.
smallbiz_MCP.tool(
  "healthcheck",
  "Verify server and database connectivity",

  async () => {

    // keep fail as fallback status
    let dbStatus = "fail";

    try {
      
      await prisma.$queryRaw`SELECT 1;`
      dbStatus = "ok";

    } 
    
    catch (error) {
      dbStatus = `Connection failed. Error:  ${error}`
    }

    return {
      content: [
        { 
          type: "text", 
          text: `Database status: ${dbStatus}` 
        }
      ],
      structuredContent: { dbStatus }
    };
  }
);

// list-resources
smallbiz_MCP.tool(
  "list-resources",
  "List all available resources (users, leads, campaigns)",

  {
    description: "List all available resources (users, leads, campaigns)",
    inputSchema: z.object({
      type: z.enum(["users", "leads", "campaigns"]).optional(),
    }),
    outputSchema: z.object({
      resources: z.array(
        z.object({
          id: z.string(),
          name: z.string(),
          type: z.string(),
        })
      )
    }),
  },

  // query all possible tables and return entries as requested
  async () => {

    const [users, leads, campaigns, customers] = await Promise.all([
      prisma.user.findMany({ select: { id: true, name: true } }),
      prisma.lead.findMany({ select: { id: true, name: true } }),
      prisma.campaign.findMany({ select: { id: true, name: true } }),
      prisma.customer.findMany({ select: { id: true, name: true } }),
    ]);

    type Resource = { id: string; name: string; type: string };

    const resources: Resource[] = [
      ...users.map((u: { id: any; name: any; }) => ({ id: String(u.id), name: u.name, type: "user" })),
      ...leads.map((l: { id: any; name: any; }) => ({ id: String(l.id), name: l.name, type: "lead" })),
      ...campaigns.map((c: { id: any; name: any; }) => ({ id: String(c.id), name: c.name, type: "campaign" })),
      ...customers.map((c: { id: any; name: any; }) => ({ id: String(c.id), name: c.name, type: "customer" })),
    ];

    return {
      content: [
        {
          type: "text",
          text: `Found ${resources.length} resources.`,
        },
      ],
      structuredContent: { resources },
    };
  }
);


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