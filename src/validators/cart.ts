import { z } from "zod";

export const addToCartSchema = z.object({
  eventId: z.string().min(1, { message: "Event ID is required" }),
  seatNumber: z.string().min(1, { message: "Seat number is required" }),
  quantity: z.number().min(1, { message: "Quantity is required" }),
  totalPrice: z.number().min(1, { message: "Total price is required" }),
});

export const updateCartSchema = addToCartSchema.partial();
