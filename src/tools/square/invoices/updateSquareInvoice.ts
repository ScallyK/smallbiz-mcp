import { McpServer } from "@modelcontextprotocol/sdk/server/mcp.js";
import { Square } from "square";
import { z } from "zod";
import squareClient from "../../../clients/squareClient.js";
import idempotencyKeyGen from "../../../helpers/idempotencyKeyGen.js";
import normalizeBigInt from "../../../helpers/normalizeBigInt.js";
import { zCurrency } from "../../../helpers/Currency.js";
import { version } from "os";

// Updates an invoice in Square
export default function updateSquareInvoice(mcpServerName: McpServer) {
  mcpServerName.registerTool(
    "update-square-invoice",
    {
      title: "Update Square Invoice",
      description: "Update an invoice in Square for a customer given invoice ID.",
      inputSchema: {
        invoiceID: z.string(),
        invoiceTitle: z.string().optional(),
        invoiceDescription: z.string().optional(),
        invoiceScheduledDate: z.string().optional(),
        customerId: z.string().optional(),
        invoiceDueDate: z.string().optional(),
        invoiceItems: z.array(
          z.object({
            name: z.string(),
            quantity: z.number().min(1),
            basePriceMoney: z.object({
              amount: z.number().min(0),
              currency: z.string().length(3), // chaning to zCurrency causes inspector issues
            }),
          })
        ).optional(),
        serviceCharge: z
          .object({
            name: z.string(),
            amount: z.number().min(0),
            currency: zCurrency.default("USD"),
            taxable: z.boolean().default(true),
          })
          .optional(),
        tax: z.array(z
          .object({
            uid: z.string(),
            appliedMoney: z.object({
              amount: z.number().min(0),
              currency: zCurrency,
            }),
            name: z.string(),
            percentage: z.string(),
            scope: z.enum(["ORDER", "LINE_ITEM"]),
          })
        ).optional(),
        discount: z.array(z
          .object({
            uid: z.string(),
            type: z.enum(["FIXED_AMOUNT", "FIXED_PERCENTAGE", "VARIABLE_PERCENTAGE", "VARIABLE_AMOUNT"]),
            appliedMoney: z.object({
              amount: z.number().min(0),
              currency: zCurrency,
            }),
            amountMoney: z.object({
              amount: z.number().min(0),
              currency: zCurrency,
            }),
            name: z.string(),
            percentage: z.string().optional(),
            scope: z.enum(["ORDER", "LINE_ITEM"]),
          })
        ).optional(),
      },
    },
    async ({
      invoiceID,
      invoiceTitle,
      invoiceDescription,
      invoiceScheduledDate,
      customerId,
      invoiceDueDate,
      invoiceItems,
      serviceCharge,
      tax,
      discount,
    }) => {
      try {
        const invoicePayload = {
          invoice: {
            // Need to fetch current version to avoid VERSION_MISMATCH error
          version: await squareClient.invoices.get({ invoiceId: invoiceID }).then(res => res.invoice?.version) as number,
            title: invoiceTitle,
            description: invoiceDescription ?? undefined,
            scheduledAt: invoiceScheduledDate,
            primaryRecipient: { customerId },
            dueDate: invoiceDueDate,
            lineItems: (invoiceItems ?? []).map(item => ({
              name: item.name,
              quantity: String(item.quantity),
              basePriceMoney: {
                amount: BigInt(item.basePriceMoney.amount),
                currency: item.basePriceMoney.currency.toUpperCase() as Square.Currency,
              },
            })),
            serviceCharges: serviceCharge
              ? [
                {
                  amountMoney: {
                    amount: BigInt(serviceCharge.amount),
                    currency: serviceCharge.currency.toUpperCase() as Square.Currency,
                  },
                  calculationPhase: Square.OrderServiceChargeCalculationPhase.TotalPhase,
                  name: serviceCharge.name,
                  taxable: serviceCharge.taxable,
                },
              ]
              : undefined,
            taxes: tax ?? undefined,
            discounts: discount ?? undefined,
          },
          idempotencyKey: idempotencyKeyGen(),
        };

        const response = await squareClient.invoices.update({
          invoiceId: invoiceID,
          ...invoicePayload,
        });

        const invoiceId = response?.invoice?.id;
        if (!invoiceId) throw new Error("No invoice.id returned from Square");

        const normalizedInvoice = normalizeBigInt(response);

        return {
          content: [
            {
              type: "text",
              text: `Square invoice updated successfully! Invoice ID: ${invoiceId}`,
            },
          ],
          structuredContent: { normalizedInvoice },
        };
      } catch (error: any) {
        const errorMessage =
          error?.message || JSON.stringify(error) || "Unknown error";
        return {
          content: [
            {
              type: "text",
              text: `Error updating invoice: ${errorMessage}`,
            },
          ],
        };
      }
    }
  );
}
