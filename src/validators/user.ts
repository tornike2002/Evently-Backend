import * as z from "zod";

export const userSignupSchema = z.object({
  firstName: z.string().min(1, { message: "First name is required" }),
  lastName: z.string().min(1, { message: "Last name is required" }),
  email: z.string().check(z.trim(), z.email(), z.toLowerCase()),
  password: z
    .string()
    .min(8, { message: "Password must be at least 8 characters long" }),
  role: z.enum(["user", "organizer", "admin"], {
    message: "Invalid role",
  }),
});
