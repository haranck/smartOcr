import { z } from "zod";

export const AadhaarDataSchema = z.object({
  name: z.string().default("Unknown"),
  dob: z.string().default("Unknown"),
  gender: z.string().default("Unknown"),
  aadhaarNumber: z.string().default("Unknown"),
  address: z.string().default("Unknown"),
  pincode: z.string().default("Unknown"),
  allAadhaarNumbers: z.array(z.string()).optional(),
});

export type AadhaarData = z.infer<typeof AadhaarDataSchema>;