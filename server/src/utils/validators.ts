import { z } from "zod"

export const emailSchema = z.string().email()
export const passwordSchema = z
  .string()
  .min(8)
  .regex(/[A-Z]/, "Must contain an uppercase letter")
  .regex(/[0-9]/, "Must contain a number")

export const nameSchema = z.string().min(2).max(80)
export const dobSchema = z.string().refine((s) => !Number.isNaN(Date.parse(s)), "Invalid date")

export const signupStartSchema = z.object({
  name: nameSchema,
  dob: dobSchema,
  email: emailSchema,
})

export const signupVerifySchema = z.object({
  email: emailSchema,
  otp: z
    .string()
    .length(6)
    .regex(/^\d{6}$/),
})

export const loginSchema = z.object({
  email: emailSchema,
  password: z.string().min(1),
  keepSignedIn: z.boolean().optional(),
})

export const createNoteSchema = z.object({
  content: z.string().min(1).max(5000),
})
