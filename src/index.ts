import { McpServer, ResourceTemplate } from "@modelcontextprotocol/sdk/server/mcp.js";
import { SquareClient, SquareEnvironment, SquareError } from "square";
import { PrismaClient } from "@prisma/client";
import { StdioServerTransport } from "@modelcontextprotocol/sdk/server/stdio.js";
import { z } from "zod";

// Init Prisma Client
const prisma = new PrismaClient();

// Init Square Client
const squareClient = new SquareClient({
  token: process.env.SQUARE_ACCESS_TOKEN,
  environment: SquareEnvironment.Sandbox,
});

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

// ping: always returns pong.

// healthcheck: verifies DB connection and returns status.

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

/* -----------------------------------------------------
----------------Square Tools & Resources----------------
----------------------------------------------------- */

// Search for square customer by email
smallbiz_MCP.registerResource(
  "lookup-square-customer-by-email",
  new ResourceTemplate("square://customer/{email}", { list: undefined }),
  {
    title: "Square Customer Lookup (Email)",
    description: "Lookup a Square customer by email address",
    mimeType: "application/json"
  },
  async (uri, { email }) => {

    email = Array.isArray(email) ? email[0] : email;
    email = decodeURIComponent(email);

    try {

      if (!email || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
        return {
          contents: [
            { uri: uri.href, text: `Please provide a valid email address.` },
          ],
        };
      }

      if (!email) {
        return {
          contents: [
            {
              uri: uri.href,
              text: "Please provide an email address to search.",
            },
          ],
        };
      }

      const response = await squareClient.customers.search({
        query: {
          filter: {
            emailAddress: {
              exact: Array.isArray(email) ? email[0] : email,
            },
          },
        },
      });

      const customers = response.customers || [];

      const safeCustomers = customers.map(customer => ({
        id: customer.id,
        email: customer.emailAddress,
        phone: customer.phoneNumber,
        givenName: customer.givenName,
        familyName: customer.familyName,
      }));

      if (customers.length === 0) {
        return {
          contents: [
            {
              uri: uri.href,
              text: `No customer found for email: ${email}`,
            },
          ],
        };
      }

      return {
        contents: [
          {
            uri: uri.href,
            text: JSON.stringify(safeCustomers, null, 2),
            structuredContent: safeCustomers,
          },
        ],
      };
    } catch (error) {
      return {
        contents: [
          {
            uri: uri.href,
            text: `Error looking up customer: ${typeof error === "object" && error !== null && "message" in error
              ? (error as any).message
              : String(error)
              }`,
          },
        ],
      };
    }
  }
);

// List all Square customers
smallbiz_MCP.registerResource(
  "list-square-customers",
  "square://customer/listAll",
  {
    title: "List Square Customers",
    description: "Retrieve a list of all Square customers",
    mimeType: "application/json"
  },
  async (uri) => {
    try {

      const response = await squareClient.customers.list();

      const customers = response.data || [];

      const safeCustomers = customers.map(customer => ({
        id: customer.id,
        firstName: customer.givenName,
        lastName: customer.familyName,
        phoneNumber: customer.phoneNumber,
        email: customer.emailAddress,
        createdAt: customer.createdAt,
      }));

      if (safeCustomers.length === 0) {
        return {
          contents: [
            {
              uri: uri.href,
              text: `No customers found! Get out there and start making some sales, dagnabit!`,
            },
          ],
        };
      }

      return {
        contents: [
          {
            uri: uri.href,
            text: JSON.stringify(safeCustomers, null, 2),
            structuredContent: safeCustomers,
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

// Search for Square invoice by customer ID and location ID
smallbiz_MCP.registerResource(
  "lookup-square-invoice-by-customer",
  new ResourceTemplate("square://invoice/{locationID}/{customerID}", { list: undefined }),
  {
    title: "Square Invoice Lookup (Customer ID)",
    description: "Lookup a Square invoice by customer ID and location ID",
    mimeType: "application/json"
  },
  async (uri, { locationID, customerID }) => {

    if (!locationID || !customerID) {
      return {
        contents: [
          {
            uri: uri.href,
            text: "Both locationID and customerID are required to search invoices.",
          },
        ],
      };
    }


    try {

      const response = await squareClient.invoices.search({
        query: {
          filter: {

            locationIds: [Array.isArray(locationID) ? locationID[0] : locationID],

            customerIds: [Array.isArray(customerID) ? customerID[0] : customerID],
          },
        },
      });

      const invoice = response.invoices || [];

      const safeInvoice = invoice.map(invoice => ({
        id: invoice.id,
        invoiceNumber: invoice.invoiceNumber,
        title: invoice.title,
        status: invoice.status,
        customerFirstName: invoice.primaryRecipient?.givenName,
        customerLastName: invoice.primaryRecipient?.familyName,
        customerPhoneNumber: invoice.primaryRecipient?.phoneNumber,
        customerEmail: invoice.primaryRecipient?.emailAddress,
        createdAt: invoice.createdAt,
        dueDate: invoice.paymentRequests?.[0]?.dueDate,
        totalAmount: invoice.paymentRequests?.[0]?.computedAmountMoney
      }));

      if (invoice.length === 0) {
        return {
          contents: [
            {
              uri: uri.href,
              text: `No invoice found for: ${locationID} and ${customerID}`,
            },
          ],
        };
      }

      return {
        contents: [
          {
            uri: uri.href,
            text: JSON.stringify(safeInvoice, null, 2),
            structuredContent: safeInvoice,
          },
        ],
      };
    } catch (error) {
      return {
        contents: [
          {
            uri: uri.href,
            text: `Error looking up invoice: ${typeof error === "object" && error !== null && "message" in error
              ? (error as any).message
              : String(error)
              }`,
          },
        ],
      };
    }
  }
);

// Search for Square invoice by invoice ID
smallbiz_MCP.registerResource(
  "lookup-square-invoice-by-id",
  new ResourceTemplate("square://invoice/{invoiceID}", { list: undefined }),
  {
    title: "Square Invoice Lookup (Invoice ID)",
    description: "Lookup a Square invoice by invoice ID",
    mimeType: "application/json"
  },
  async (uri, { invoiceID }) => {

    if (!invoiceID) {
      return {
        contents: [
          {
            uri: uri.href,
            text: "Invoice ID is required to search invoices.",
          },
        ],
      };
    }


    try {

      const response = await squareClient.invoices.get({
        invoiceId: Array.isArray(invoiceID) ? invoiceID[0] : invoiceID,
      });

      // wrapping in array for consistency
      const invoice = response.invoice || [];
      const invoicesArray = Array.isArray(invoice) ? invoice : invoice ? [invoice] : [];

      const safeInvoice = invoicesArray.map(invoice => ({
        id: invoice.id,
        invoiceNumber: invoice.invoiceNumber,
        title: invoice.title,
        status: invoice.status,
        customerFirstName: invoice.primaryRecipient?.givenName,
        customerLastName: invoice.primaryRecipient?.familyName,
        customerPhoneNumber: invoice.primaryRecipient?.phoneNumber,
        customerEmail: invoice.primaryRecipient?.emailAddress,
        createdAt: invoice.createdAt,
        dueDate: invoice.paymentRequests?.[0]?.dueDate,
        totalAmount: invoice.paymentRequests?.[0]?.computedAmountMoney
      }));

      if (invoicesArray.length === 0) {
        return {
          contents: [
            {
              uri: uri.href,
              text: `No invoice found for: ${invoiceID}`,
            },
          ],
        };
      }

      return {
        contents: [
          {
            uri: uri.href,
            text: JSON.stringify(safeInvoice, null, 2),
            structuredContent: safeInvoice,
          },
        ],
      };
    } catch (error) {
      return {
        contents: [
          {
            uri: uri.href,
            text: `Error looking up invoice: ${typeof error === "object" && error !== null && "message" in error
              ? (error as any).message
              : String(error)
              }`,
          },
        ],
      };
    }
  }
);

// List all Square invoices
smallbiz_MCP.registerResource(
  "list-invoices",
  new ResourceTemplate("square://invoice/{locationId}", { list: undefined }),
  {
    title: "List Square Invoices",
    description: "Rerieve a list of all Square invoices by location ID",
    mimeType: "application/json"
  },
  async (uri, { locationId }) => {

    if (!locationId) {
      return {
        contents: [
          {
            uri: uri.href,
            text: "Location Id is required to search invoices.",
          },
        ],
      };
    }


    try {

      const response = await squareClient.invoices.list({
        locationId: Array.isArray(locationId) ? locationId[0] : locationId,
      });

      const invoices = response.data || [];

      const safeInvoice = invoices.map(invoice => ({
        id: invoice.id,
        invoiceNumber: invoice.invoiceNumber,
        title: invoice.title,
        status: invoice.status,
        customerFirstName: invoice.primaryRecipient?.givenName,
        customerLastName: invoice.primaryRecipient?.familyName,
        customerPhoneNumber: invoice.primaryRecipient?.phoneNumber,
        customerEmail: invoice.primaryRecipient?.emailAddress,
        createdAt: invoice.createdAt,
        dueDate: invoice.paymentRequests?.[0]?.dueDate,
        totalAmount: invoice.paymentRequests?.[0]?.computedAmountMoney
      }));

      if (invoices.length === 0) {
        return {
          contents: [
            {
              uri: uri.href,
              text: `No invoices found for location ID: ${locationId}.`,
            },
          ],
        };
      }

      return {
        contents: [
          {
            uri: uri.href,
            text: JSON.stringify(safeInvoice, null, 2),
            structuredContent: safeInvoice,
          },
        ],
      };
    } catch (error) {
      return {
        contents: [
          {
            uri: uri.href,
            text: `Error listing invoices: ${typeof error === "object" && error !== null && "message" in error
              ? (error as any).message
              : String(error)
              }`,
          },
        ],
      };
    }
  }
);

smallbiz_MCP.tool(
  "create-invoice",
  "Create a new invoice in Square for a customer given their customer ID.",
  {
    locationID: z.string().describe("The Square location ID"),
    invoiceTitle: z.string().describe("Title of the invoice"),
    invoiceDescription: z.string().optional().describe("Description of the invoice"),
    invoiceScheduledDate: z.string().describe("Scheduled date for the invoice in ISO format (YYYY-MM-DD)"),
    primaryRecipientID: z.string().describe("Customer ID of the primary recipient"),
  },
  async (
    {
      locationID,
      invoiceTitle,
      invoiceDescription,
      invoiceScheduledDate,
      primaryRecipientID,
    },
    _extra
  ) => {
    try {
      const invoiceData: any = {
        invoice: {
          deliveryMethod: "EMAIL",
          locationId: locationID,
          primaryRecipient: { customerId: primaryRecipientID },
          title: invoiceTitle,
          description: invoiceDescription || "",
          saleOrServiceDate: new Date().toISOString().split("T")[0], // current date
          scheduledAt: invoiceScheduledDate || new Date().toISOString(),
          storePaymentMethodEnabled: true,
          paymentRequests: [],
          acceptedPaymentMethods: {
            bankAccount: false,
            buyNowPayLater: true,
            cashAppPay: false,
            squareGiftCard: false,
          },
        },
      };

      const response = await squareClient.invoices.create(invoiceData);

      return {
        content: [
          {
            type: "text",
            text: `Invoice created successfully! Invoice ID: ${response.invoice?.id}`,
          },
        ],
        structuredContent: { ...response },
      };

    } catch (error: any) {
      const errorMessage =
        error?.message || JSON.stringify(error) || "Unknown error";

      return {
        content: [
          {
            type: "text",
            text: `Error creating invoice: ${errorMessage}`,
          },
        ],
      };
    }
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


