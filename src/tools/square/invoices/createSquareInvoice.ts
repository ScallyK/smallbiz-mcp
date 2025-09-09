import squareClient from "../../../clients/squareClient.js";
import idempotencyKeyGen from "../../../helpers/idempotencyKeyGen.js";
import toDateOnlyOrToday from "../../../helpers/toDateOnlyOrToday.js";
import toIsoOrNow from "../../../helpers/toIsoOrNow.js";
import normalizeBigInt from "../../../helpers/normalizeBigInt.js";
import { McpServer } from "@modelcontextprotocol/sdk/server/mcp.js";
import { z } from "zod";
import { Square } from "square";
import { zCurrency } from "../../../helpers/Currency.js";

interface InvoiceItem {
  name: string;
  quantity: number;
  basePriceMoney: {
    amount: number;
    currency: string;
  };
}

export default function createSquareInvoice(mcpServerName: McpServer) {
  mcpServerName.registerTool(
    "create-square-invoice",
    {
      title: "Create Square Invoice",
      description:
        "Create a new invoice in Square for a customer given their customer ID.",
      inputSchema: {
        locationID: z.string(),
        invoiceTitle: z.string(),
        invoiceDescription: z.string().optional(),
        invoiceScheduledDate: z.string(),
        customerId: z.string(),
        invoiceDueDate: z.string(),
        invoiceItems: z.array(
          z.object({
            name: z.string(),
            quantity: z.number().min(1),
            basePriceMoney: z.object({
              amount: z.number().min(0),
              currency: z.string().length(3), // changing to zCurrency causes inspector issues
            }),
          })
        ),
        serviceCharge: z
          .object({
            name: z.string(),
            amount: z.number().min(0),
            currency: zCurrency,
            taxable: z.boolean().default(true),
          })
          .optional(),
        tax: z.array(z
          .object({
            uid: z.string(),
            appliedMoney : z.object({
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
      locationID,
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

        // Build order payload
        const orderPayload = {
          order: {
            locationId: locationID,
            customerId,
            lineItems: invoiceItems.map((item: InvoiceItem) => ({
              name: item.name,
              quantity: String(item.quantity),
              basePriceMoney: {
                amount: BigInt(item.basePriceMoney.amount),
                currency: item.basePriceMoney.currency.toUpperCase() as Square.Currency,
              },
              appliedDiscounts: discount
                ? discount.map(d => ({
                    uid: d.uid,
                    discountUid: d.uid,
                  }))
                : undefined,
              appliedTaxes: tax
                ? tax.map(t => ({
                    uid: t.uid,
                    taxUid: t.uid,
                  }))
                : undefined,
            })),
            serviceCharges: serviceCharge
              ? [
                {
                  amountMoney: {
                    amount: BigInt(serviceCharge.amount),
                    currency: serviceCharge.currency.toUpperCase() as Square.Currency,
                  },
                  // manually setting calculationPhase, could change later
                  calculationPhase: Square.OrderServiceChargeCalculationPhase.TotalPhase,
                  name: serviceCharge.name,
                  taxable: serviceCharge.taxable,
                },
              ]
              : undefined,
            state: "OPEN" as const,
          },
        };

        // Create order
        const orderResponse = await squareClient.orders.create(orderPayload);
        const orderId = orderResponse?.order?.id;
        if (!orderId) throw new Error("No order.id returned from Square");

        // Reformat dates for Square
        const scheduledAt = toIsoOrNow(invoiceScheduledDate);
        const dueDate = toDateOnlyOrToday(invoiceDueDate);

        // Build invoice payload
        const invoicePayload: Square.CreateInvoiceRequest = {
          invoice: {
            locationId: locationID,
            orderId,
            primaryRecipient: { customerId },
            scheduledAt,
            deliveryMethod: "EMAIL",
            title: invoiceTitle,
            description: invoiceDescription ?? undefined,
            saleOrServiceDate: new Date().toISOString().split("T")[0],
            storePaymentMethodEnabled: false,
            paymentRequests: [
              {
                requestType: "BALANCE",
                dueDate,
                tippingEnabled: true,
                automaticPaymentSource: "NONE",
                reminders: [
                  {
                    relativeScheduledDays: -1,
                    message:
                      "Hello, this is just a friendly reminder to let you know that your invoice is due tomorrow.",
                  },
                ],
              },
            ],
            acceptedPaymentMethods: {
              card: true,
              buyNowPayLater: true,
              bankAccount: false,
              cashAppPay: false,
              squareGiftCard: false,
            },
          },
          idempotencyKey: idempotencyKeyGen(),
        };

        // Create invoice
        const invoiceResponse = await squareClient.invoices.create(invoicePayload);
        const invoiceId = invoiceResponse?.invoice?.id;
        if (!invoiceId) throw new Error("No invoice.id returned from Square");

        const normalizedInvoice = normalizeBigInt(invoiceResponse);

        return {
          content: [
            {
              type: "text",
              text: `Square invoice created successfully! Invoice ID: ${invoiceId}`,
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
              text: `Error creating Square invoice: ${errorMessage}`,
            },
          ],
        };
      }
    }
  );
}
