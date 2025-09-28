import mongoose, { Schema, type InferSchemaType } from "mongoose"
import { SAMPLE_MODE } from "../config/env"

const UserSchema = new Schema(
  {
    name: { type: String, required: true, trim: true },
    dob: { type: Date, required: true },
    email: { type: String, required: true, unique: true, lowercase: true, index: true },
    passwordHash: { type: String, required: false },
    isEmailVerified: { type: Boolean, default: false },
    googleId: { type: String, default: null },
    profileImageUrl: { type: String, default: null },
  },
  { timestamps: true },
)

type MemUser = {
  _id: string
  name: string
  dob: Date
  email: string
  passwordHash?: string
  isEmailVerified: boolean
  googleId?: string | null
  profileImageUrl?: string | null
  createdAt: Date
  updatedAt: Date
}

const memUsers: MemUser[] = []

function genId() {
  return `${Date.now().toString(36)}${Math.random().toString(36).slice(2, 8)}`
}

export type UserDoc = InferSchemaType<typeof UserSchema> & { _id: mongoose.Types.ObjectId }

export const User = {
  async findOne(query: { email?: string; _id?: string }) {
    console.log("User.findOne called with query:", query)
    console.log("SAMPLE_MODE:", SAMPLE_MODE)
    console.log("memUsers:", memUsers)
    if (!SAMPLE_MODE) {
      return mongoose.model("User", UserSchema).findOne(query)
    }
    if (query.email) {
      const found = memUsers.find((u) => u.email === query.email) || null
      console.log("Found by email:", found)
      return found
    }
    if (query._id) {
      const found = memUsers.find((u) => u._id === query._id) || null
      console.log("Found by _id:", found)
      return found
    }
    return null
  },
  async create(data: { name: string; dob: Date; email: string; passwordHash?: string; isEmailVerified?: boolean }) {
    if (!SAMPLE_MODE) {
      const UserModel = mongoose.model("User", UserSchema)
      const doc = new UserModel(data)
      return doc.save()
    }
    const doc: MemUser = {
      _id: genId(),
      name: data.name,
      dob: new Date(data.dob),
      email: data.email.toLowerCase(),
      passwordHash: data.passwordHash || undefined,
      isEmailVerified: !!data.isEmailVerified,
      googleId: null,
      profileImageUrl: null,
      createdAt: new Date(),
      updatedAt: new Date(),
    }
    memUsers.push(doc)
    return doc as any
  },
} as any
