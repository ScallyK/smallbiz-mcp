# smallbiz-mcp-server

smallbiz-mcp is a MCP server for small business operations (calendar, CRM, sales, marketing)

This is a TypeScript-based MCP server that implements:

- Interfacing with Square and Google calendar data
- 2
- 3

## Features

### Resources
- List and access notes via `note://` URIs
- Each note has a title, content and metadata
- Plain text mime type for simple content access

### Tools
- `create_note` - Create new text notes
  - Takes title and content as required parameters
  - Stores note in server state

### Prompts
- `summarize_notes` - Generate a summary of all stored notes
  - Includes all note contents as embedded resources
  - Returns structured prompt for LLM summarization

## Development

Install dependencies:
```bash
npm install
```

Build the container:
```bash
docker compose up -d
```

Verify images:
```bash
docker compose logs postgres
```

Run Prisma migration:
```bash
npx prisma migrate dev --name init
```

Update the Prisma client:
```bash
npx prisma generate
```

Build the server:
```bash
npm run build
```

For development with auto-rebuild:
```bash
npm run watch
```

To test with MCP Inspector:

```bash
npm run build
```

```bash
npx @modelcontextprotocol/inspector build/index.js
```

## Installation

To use with Claude Desktop, add the server config:

On MacOS: `~/Library/Application Support/Claude/claude_desktop_config.json`
On Windows: `%APPDATA%/Claude/claude_desktop_config.json`

```json
{
  "mcpServers": {
    "smallbiz-mcp-server": {
      "command": "/path/to/smallbiz-mcp-server/build/index.js"
    }
  }
}
```

### Debugging

Since MCP servers communicate over stdio, debugging can be challenging. We recommend using the [MCP Inspector](https://github.com/modelcontextprotocol/inspector), which is available as a package script:

```bash
npm run inspector
```

The Inspector will provide a URL to access debugging tools in your browser.

Run debug_tools scripts with:
```bash
node --loader ts-node/esm debug_tools/<script_here>
```


### Other Notes:

For machines not running Windows, change the dev line in package.json to:

"dev": "npx nodemon --watch src --ext ts --exec ts-node src/index.ts"

if "npm run dev" is giving you issues.

You must use npm install @modelcontextprotocol/sdk zod@3 and not zod@latest or compiler will throw errors

For Google Calendar itegration:

- [Follow these steps](https://developers.google.com/workspace/calendar/api/quickstart/nodejs)
- Create an external app
- Add your email as a test user
- If you subscribe to Google Workspace, you can set the app as internal.


/* --------------------------------------------
-------------------Square Tools------------------
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

/* ---------------------------------------------------
-----------------Google Calendar Tools----------------
--------------------------------------------------- */

// list-events: fetch the next 30 upcoming events. DONE

// get-event: retrieve details for a specific event by ID. DONE

// create-event: schedule a meeting/event with details. DONE

// update-event: modify an event. DONE

// delete-event: cancel/remove an event. DONE