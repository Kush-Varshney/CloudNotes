import dotenv from "dotenv"
dotenv.config()

const required = (v: string | undefined, name: string) => {
  if (!v) throw new Error(`Missing env: ${name}`)
  return v
}

export const SAMPLE_MODE = process.env.SAMPLE_MODE === "true"

export const NODE_ENV = process.env.NODE_ENV ?? "development"
export const PORT = Number.parseInt(process.env.PORT ?? "5000", 10)
export const MONGO_URI = SAMPLE_MODE ? "mongodb://sample-mode" : required(process.env.MONGO_URI, "MONGO_URI")
export const JWT_SECRET = SAMPLE_MODE
  ? process.env.JWT_SECRET || "dev-secret"
  : required(process.env.JWT_SECRET, "JWT_SECRET")
export const CLIENT_ORIGIN = SAMPLE_MODE
  ? process.env.CLIENT_ORIGIN || "http://localhost:5173"
  : required(process.env.CLIENT_ORIGIN, "CLIENT_ORIGIN")

export const SMTP_HOST = process.env.SMTP_HOST || ""
export const SMTP_PORT = Number.parseInt(process.env.SMTP_PORT || "0", 10)
export const SMTP_USER = process.env.SMTP_USER || ""
export const SMTP_PASS = process.env.SMTP_PASS || ""
export const SMTP_FROM = process.env.SMTP_FROM || ""
export const SMTP_ENABLED = !!SMTP_HOST && !!SMTP_PORT && !!SMTP_USER && !!SMTP_PASS && !!SMTP_FROM

export const GOOGLE_CLIENT_ID = process.env.GOOGLE_CLIENT_ID || ""
export const GOOGLE_CLIENT_SECRET = process.env.GOOGLE_CLIENT_SECRET || ""
export const GOOGLE_ENABLED = !!GOOGLE_CLIENT_ID && !!GOOGLE_CLIENT_SECRET
