import { z } from "zod";

export const purchaseTicketSchema = z.object({
  eventId: z.string().min(1, "Event ID is required"),
  quantity: z.number().min(1, "Quantity must be at least 1").max(10, "Maximum 10 tickets per purchase"),
  paymentMethodId: z.string().min(1, "Payment method ID is required"),
});
