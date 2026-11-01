import { z } from "zod";

const baseSchema = z.object({
  firstName: z.string().min(2, "First name must be at least 2 characters"),
  lastName: z.string().min(2, "Last name must be at least 2 characters"),
  email: z.email("Please enter a valid email address"),
  guests: z
    .number({ message: "Please choose the number of guests" })
    .int("Guests must be a whole number")
    .min(1, "Guests must be at least 1")
    .max(6, "A booking can have at most 6 guests"),
});

export const roomBookingSchema = baseSchema
  .extend({
    type: z.literal("room"),
    itemType: z.string(),
    item: z.string(),
    checkIn: z.string({ message: "Please select a check-in date" }).optional(),
    checkOut: z
      .string({ message: "Please select a check-out date" })
      .optional(),
  })
  .refine(
    (data) => {
      if (!data.checkIn || !data.checkOut) return true;
      return new Date(data.checkOut) > new Date(data.checkIn);
    },
    {
      message: "Check-out date must be after check-in date",
      path: ["checkOut"],
    },
  )
  .refine((data) => data.checkIn !== undefined, {
    message: "Please select a check-in date",
    path: ["checkIn"],
  })
  .refine((data) => data.checkOut !== undefined, {
    message: "Please select a check-out date",
    path: ["checkOut"],
  });

export const diningBookingSchema = baseSchema
  .extend({
    type: z.literal("dining"),
    itemType: z.string(),
    item: z.string(),
    diningDate: z.string({ message: "Please select a date" }).optional(),
    arrivalHour: z
      .number({ message: "Please select an arrival time" })
      .min(8)
      .max(23)
      .optional(),
    departureHour: z
      .number({ message: "Please select a departure time" })
      .min(8)
      .max(23)
      .optional(),
  })
  .refine(
    (data) => {
      if (data.arrivalHour === undefined || data.departureHour === undefined)
        return true;
      return data.departureHour > data.arrivalHour;
    },
    {
      message: "Departure must be after arrival",
      path: ["departureHour"],
    },
  )
  .refine(
    (data) => {
      if (data.arrivalHour === undefined || data.departureHour === undefined)
        return true;
      return data.departureHour - data.arrivalHour <= 3;
    },
    {
      message: "Maximum duration is 3 hours",
      path: ["departureHour"],
    },
  )
  .refine((data) => data.diningDate !== undefined, {
    message: "Please select a date",
    path: ["diningDate"],
  })
  .refine((data) => data.arrivalHour !== undefined, {
    message: "Please select an arrival time",
    path: ["arrivalHour"],
  })
  .refine((data) => data.departureHour !== undefined, {
    message: "Please select a departure time",
    path: ["departureHour"],
  });

export const bookingSchema = z.discriminatedUnion("type", [
  roomBookingSchema,
  diningBookingSchema,
]);

export type BookingFormData = z.infer<typeof bookingSchema>;
