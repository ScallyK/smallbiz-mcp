import { McpServer } from "@modelcontextprotocol/sdk/server/mcp.js";
import { Square } from "square";
import { z } from "zod";
import squareClient from "../../../clients/squareClient.js";
import idempotencyKeyGen from "../../../helpers/idempotencyKeyGen.js";
import toDateOnlyOrToday from "../../../helpers/toDateOnlyOrToday.js";
import toIsoOrNow from "../../../helpers/toIsoOrNow.js";

// Creates a new invoice in Square
export default function createSquareInvoice(mcpServerName: McpServer) {

  mcpServerName.registerTool(
    "create-square-invoice",
    {
      title: "Create Square Invoice",
      description: "Create a new invoice in Square for a customer given their customer ID.",
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
              currency: z.string().length(3),
            }),
          })
        ),
        tax: z
          .object({
            uid: z.string(),
            name: z.string(),
            percentage: z.number().min(0).max(100),
            scope: z.enum(["ORDER", "LINE_ITEM"]),
          })
          .optional(),
        discounts: z.array(
          z.object({
            uid: z.string(),
            name: z.string(),
            percentage: z.number().min(0).max(100).optional(),
            amountMoney: z
              .object({
                amount: z.number().min(0),
                currency: z.string().length(3),
              })
              .optional(),
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
      tax,
      discounts,
    }) => {
  
      try {
  
        // Create Square order data
        const orderData = {
          idempotencyKey: idempotencyKeyGen(),
          order: {
            locationId: locationID,
            customerId: customerId,
            lineItems: invoiceItems.map((item) => ({
              name: item.name,
              quantity: String(item.quantity),
              basePriceMoney: {
                amount: BigInt(item.basePriceMoney.amount),
                currency: item.basePriceMoney.currency.toUpperCase() as Square.Currency,
              },
            })),
            taxes: tax
              ? [
                {
                  uid: tax.uid,
                  name: tax.name,
                  percentage: String(tax.percentage),
                  scope: tax.scope as Square.OrderLineItemTaxScope,
                },
              ]
              : undefined,
            discounts: discounts?.map((d) => ({
              uid: d.uid,
              name: d.name,
              percentage: d.percentage ? String(d.percentage) : undefined,
              amountMoney: d.amountMoney
                ? {
                  amount: BigInt(d.amountMoney.amount),
                  currency: d.amountMoney.currency.toUpperCase() as Square.Currency,
                }
                : undefined,
              scope: d.scope as Square.OrderLineItemDiscountScope,
            })),
          },
        };
  
        // Fetch order ID if call is successful
        const orderResponse = await squareClient.orders.create(orderData);
        const orderId = orderResponse.order?.id;
        if (!orderId) throw new Error("No order.id returned from Square");
  
        // reformatting dates for Square
        const scheduledAt = toIsoOrNow(invoiceScheduledDate);
        const dueDate = toDateOnlyOrToday(invoiceDueDate);
  
        // Create Square invoice data
        const invoiceData: Square.CreateInvoiceRequest = {
          idempotencyKey: idempotencyKeyGen(),
          invoice: {
            locationId: locationID,
            orderId,
            primaryRecipient: { customerId: customerId },
            scheduledAt,
            deliveryMethod: "EMAIL",
            title: invoiceTitle,
            description: invoiceDescription ?? "",
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
                    message: "Hello, this is just a friendly reminder to let you know that your invoice is due tomorrow.",
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
        };
  
        // Call Square invoice API
        const invoiceResponse = await squareClient.invoices.create(invoiceData);
  
        return {
          content: [
            {
              type: "text",
              text: `Square invoice created successfully! Invoice ID: ${invoiceResponse.invoice?.id}`,
            },
          ],
          structuredContent: { ...invoiceResponse },
        };
      }
      catch (error: any) {
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
