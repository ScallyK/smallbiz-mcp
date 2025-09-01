import { McpServer } from "@modelcontextprotocol/sdk/server/mcp.js";
import { Square } from "square";
import { z } from "zod";
import squareClient from "../../../clients/squareClient.js";
import idempotencyKeyGen from "../../../helpers/idempotencyKeyGen.js";

// Updates an invoice in Square
export default function updateSquareInvoice(mcpServerName: McpServer) {
  mcpServerName.registerTool(
    "update-square-invoice",
    {
      title: "Update Square Invoice",
      description: "Update an invoice in Square for a customer given invoice ID.",
      inputSchema: {
        invoiceID: z.string(),
        invoice: z.object({
          acceptedPaymentMethods: z.object({
            bankAccount: z.boolean().optional(),
            buyNowPayLater: z.boolean().optional(),
            cashAppPay: z.boolean().optional(),
            squareGiftCard: z.boolean().optional(),
            card: z.boolean().optional(),
          }).optional(),

          paymentRequests: z.array(
            z.object({
              automaticPaymentSource: z.enum(["NONE", "CARD_ON_FILE", "BANK_ON_FILE"]).optional(),
              cardId: z.string().optional(),
              dueDate: z.string().regex(/^\d{4}-\d{2}-\d{2}$/, "Expected YYYY-MM-DD").optional(),
              percentageRequested: z.number().int().optional(),
              fixedAmountRequestedMoney: z
                .object({
                  amount: z.number().int().min(0),
                  currency: z.string().length(3),
                })
                .optional(),
              requestType: z.enum(["BALANCE", "DEPOSIT", "INSTALLMENT"]).optional(),
              tippingEnabled: z.boolean().optional(),
              uid: z.string().optional(),
            })
          ).optional(),

          primaryRecipient: z.object({
            customerId: z.string(),
          }).optional(),

          deliveryMethod: z.enum(["EMAIL", "SHARE_MANUALLY", "SMS"]).optional(),
          description: z.string().optional(),
          invoiceNumber: z.string().max(7).optional(),
          locationId: z.string().optional(),
          orderId: z.string().optional(),
          saleOrServiceDate: z.string().regex(/^\d{4}-\d{2}-\d{2}$/).optional(),
          storePaymentMethodEnabled: z.boolean().optional(),
          title: z.string().optional(),
        }),
      },
    },
    async ({ invoiceID, invoice }) => {
      try {
        const updatedInvoiceData: Square.UpdateInvoiceRequest = {
          idempotencyKey: idempotencyKeyGen(),
          invoiceId: invoiceID,
          invoice: invoice as Square.Invoice,
        };

        const updatedInvoiceResponse = await squareClient.invoices.update(updatedInvoiceData);

        return {
          content: [
            {
              type: "text",
              text: `Invoice updated successfully! Invoice ID: ${updatedInvoiceResponse.invoice?.id}`,
            },
          ],
          structuredContent: { ...updatedInvoiceResponse },
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
