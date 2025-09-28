import mongoose, { Schema, type InferSchemaType } from "mongoose"
import { SAMPLE_MODE } from "../config/env"

const OtpSchema = new Schema(
  {
    email: { type: String, required: true, lowercase: true, index: true },
    otpHash: { type: String, required: true },
    purpose: { type: String, enum: ["signup", "login"], required: true },
    expiresAt: { type: Date, required: true },
    attempts: { type: Number, default: 0, min: 0 },
    // Temporary signup data
    name: { type: String, required: false },
    dob: { type: Date, required: false },
  },
  { timestamps: true },
)

OtpSchema.index({ email: 1, purpose: 1 })

export type OtpDoc = InferSchemaType<typeof OtpSchema> & { _id: mongoose.Types.ObjectId }

type MemOtp = {
  _id: string
  email: string
  otpHash: string
  purpose: "signup" | "login"
  expiresAt: Date
  attempts: number
  // carry signup data temporarily
  passwordHash?: string
  name?: string
  dob?: Date
  createdAt: Date
  updatedAt: Date
}

const memOtps: MemOtp[] = []

function genId() {
  return `${Date.now().toString(36)}${Math.random().toString(36).slice(2, 8)}`
}

const OtpMemModel = {
  async findOne(filter: { email?: string; purpose?: "signup" | "login"; _id?: string }) {
    if (filter._id) return memOtps.find((o) => o._id === filter._id) || null
    const email = filter.email?.toLowerCase()
    const purpose = filter.purpose
    return memOtps.find((o) => (!email || o.email === email) && (!purpose || o.purpose === purpose)) || null
  },
  async findOneAndUpdate(
    filter: { email: string; purpose: "signup" | "login" },
    update: Partial<MemOtp>,
    _opts: { upsert?: boolean; new?: boolean } = {},
  ) {
    const email = filter.email.toLowerCase()
    const purpose = filter.purpose
    let doc = memOtps.find((o) => o.email === email && o.purpose === purpose)
    if (!doc) {
      doc = {
        _id: genId(),
        email,
        purpose,
        otpHash: "",
        expiresAt: new Date(Date.now() + 10 * 60 * 1000),
        attempts: 0,
        createdAt: new Date(),
        updatedAt: new Date(),
      }
      memOtps.push(doc)
    }
    Object.assign(doc, update)
    doc.updatedAt = new Date()
    return {
      ...doc,
      async save() {
        doc!.updatedAt = new Date()
        return this
      },
    }
  },
  async deleteOne(filter: { _id?: string; email?: string; purpose?: "signup" | "login" }) {
    const idx = memOtps.findIndex((o) =>
      filter._id
        ? o._id === filter._id
        : filter.email
          ? o.email === filter.email && o.purpose === filter.purpose
          : false,
    )
    if (idx >= 0) memOtps.splice(idx, 1)
    return { acknowledged: true, deletedCount: idx >= 0 ? 1 : 0 }
  },
}

// Keep mongoose export for real DB, fallback to mem in SAMPLE_MODE
export const Otp = SAMPLE_MODE ? (OtpMemModel as any) : mongoose.model("Otp", OtpSchema)
