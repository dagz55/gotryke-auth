import { z } from "zod"

// We're keeping a simple non-relational schema here.
// IRL, you will have a schema for your data models.
export const userSchema = z.object({
  id: z.string(),
  name: z.string(),
  phone: z.string(),
  email: z.string().email().optional(),
  pin: z.string().optional(),
  provider: z.string(),
  status: z.string(),
  role: z.string(),
  toda: z.string().optional(),
  bodyNumber: z.string().optional(),
  city: z.string().optional(),
  walletBalance: z.number().optional(),
  driversLicense: z.object({
    number: z.string(),
    expiryDate: z.string(),
  }).optional(),
  tricycleRegistration: z.object({
    plateNumber: z.string(),
    expiryDate: z.string(),
  }).optional(),
  isVerified: z.boolean().optional(),
})

export type User = z.infer<typeof userSchema>
