import { z } from "zod";

export const eventSchema = z.object({
  title: z.string().min(3, "Title must be at least 3 characters"),
  date: z.string().min(5, "Please enter a valid date"),
  time: z.string().min(5, "Please enter a valid time"),
  location: z.string().min(3, "Location is required"),
  leadImage: z.string().url("Please enter a valid image URL"),
  desc: z.string().min(10, "Description must be at least 10 characters"),
  tickets: z.array(
    z.object({
      type: z.string().min(1, "Ticket type is required"),
      price: z
        .number({ message: "Price is required" })
        .min(0, "Price cannot be negative"),
      totalQuantity: z
        .number()
        .min(1, "Quantity must be at least 1")
        .optional()
        .nullable(),
    }),
  ),
});

export type EventFormData = z.infer<typeof eventSchema>;
