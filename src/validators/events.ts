import { z } from "zod";

export const createEventSchema = z.object({
  title: z.string().min(1, { message: "Title is required" }),
  description: z.string().min(1, { message: "Description is required" }),
  date: z.coerce.date({ message: "Date is required" }),
  location: z.string().min(1, { message: "Location is required" }),
  price: z.number().min(1, { message: "Price is required" }),
  totalSeats: z.number().min(1, { message: "Total seats is required" }),
  availableSeats: z.number().min(1, { message: "Available seats is required" }),
  image: z.string().min(1, { message: "Image is required" }),
  organizer: z.string().min(1, { message: "Organizer is required" }),
});

export const updateEventSchema = createEventSchema.partial();
