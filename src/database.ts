// Provides a safe and typed way to interact with the database within MCP tools.

import { PrismaClient } from "@prisma/client";
export const prisma = new PrismaClient();