import { Router } from "express"
import passport from "passport"
import { z } from "zod"
import { User } from "../models/User"
import { Otp } from "../models/Otp"
import bcrypt from "bcryptjs"
import jwt from "jsonwebtoken"
import { JWT_SECRET, NODE_ENV, GOOGLE_ENABLED, CLIENT_ORIGIN } from "../config/env"
import { signupStartSchema, signupVerifySchema, emailSchema } from "../utils/validators"
import { sendOtpEmail } from "../utils/mailer"
import { authMiddleware } from "../middleware/auth"

const router = Router()

function signJwt(userId: string, email: string, keepSignedIn?: boolean) {
  const payload = { sub: userId, email }
  const expiresIn = keepSignedIn ? "30d" : "7d"
  return jwt.sign(payload, JWT_SECRET, { expiresIn })
}

function cookieOptions(keepSignedIn?: boolean) {
  const isProd = NODE_ENV === "production"
  const maxAge = keepSignedIn ? 30 * 24 * 60 * 60 * 1000 : 7 * 24 * 60 * 60 * 1000 // ms
  return {
    httpOnly: true,
    secure: isProd,
    sameSite: isProd ? ("none" as const) : ("lax" as const),
    maxAge,
  }
}

// POST /auth/signup/start
router.post("/signup/start", async (req, res) => {
  const parse = signupStartSchema.safeParse(req.body)
  if (!parse.success) return res.status(400).json({ error: parse.error.flatten() })

  const { name, dob, email } = parse.data

  const exists = await User.findOne({ email })
  if (exists) return res.status(400).json({ error: "Email already registered" })

  const otp = Math.floor(100000 + Math.random() * 900000).toString()
  const otpHash = await bcrypt.hash(otp, 10)
  const expiresAt = new Date(Date.now() + 10 * 60 * 1000)

  // Store OTP and user data temporarily on OTP doc
  await Otp.findOneAndUpdate(
    { email, purpose: "signup" },
    { email, purpose: "signup", otpHash, expiresAt, attempts: 0, name, dob: new Date(dob) } as any,
    { upsert: true, new: true },
  ).catch(() => {})

  await sendOtpEmail(email, otp)

  return res.json({ message: "OTP sent" })
})

// POST /auth/signup/verify
router.post("/signup/verify", async (req, res) => {
  const parse = signupVerifySchema.safeParse(req.body)
  if (!parse.success) return res.status(400).json({ error: parse.error.flatten() })

  const { email, otp } = parse.data
  const record = (await Otp.findOne({ email, purpose: "signup" })) as any
  if (!record) return res.status(400).json({ error: "OTP not found. Start signup again." })

  console.log("OTP record found:", { name: record.name, dob: record.dob, email: record.email })

  if (record.expiresAt < new Date()) return res.status(400).json({ error: "OTP expired" })
  if (record.attempts >= 5) return res.status(429).json({ error: "Too many attempts" })

  const ok = await bcrypt.compare(otp, record.otpHash)
  if (!ok) {
    record.attempts += 1
    await record.save()
    return res.status(400).json({ error: "Invalid OTP" })
  }

  // Validate that we have the required signup data
  if (!record.name || !record.dob) {
    return res.status(400).json({ error: "Signup data missing. Please start signup again." })
  }

  // Create user
  const exists = await User.findOne({ email })
  if (exists) return res.status(400).json({ error: "Email already registered" })

  const user = await User.create({
    name: record.name,
    dob: record.dob,
    email,
    isEmailVerified: true,
  })

  console.log("Created user:", user)

  // Cleanup OTP
  await Otp.deleteOne({ _id: record._id })

  const token = signJwt(user._id.toString(), user.email)
  console.log("Created JWT with user ID:", user._id.toString())
  res.cookie("token", token, cookieOptions())
  return res.json({ user: { id: user._id, name: user.name, email: user.email } })
})

// POST /auth/login/start
router.post("/login/start", async (req, res) => {
  const parse = z.object({ email: emailSchema }).safeParse(req.body)
  if (!parse.success) return res.status(400).json({ error: parse.error.flatten() })

  const { email } = parse.data
  const user = await User.findOne({ email })
  if (!user) return res.status(400).json({ error: "No account found with this email" })

  const otp = Math.floor(100000 + Math.random() * 900000).toString()
  const otpHash = await bcrypt.hash(otp, 10)
  const expiresAt = new Date(Date.now() + 10 * 60 * 1000) // 10 minutes

  await Otp.findOneAndUpdate(
    { email, purpose: "login" },
    { email, purpose: "login", otpHash, expiresAt, attempts: 0 },
    { upsert: true, new: true },
  ).catch(() => {})

  await sendOtpEmail(email, otp)

  return res.json({ message: "OTP sent" })
})

// POST /auth/login/verify
router.post("/login/verify", async (req, res) => {
  const parse = z
    .object({
      email: emailSchema,
      otp: z
        .string()
        .length(6)
        .regex(/^\d{6}$/),
      keepSignedIn: z.boolean().optional(),
    })
    .safeParse(req.body)
  if (!parse.success) return res.status(400).json({ error: parse.error.flatten() })

  const { email, otp, keepSignedIn } = parse.data
  const record = await Otp.findOne({ email, purpose: "login" })
  if (!record) return res.status(400).json({ error: "OTP not found. Request a new one." })

  if (record.expiresAt < new Date()) return res.status(400).json({ error: "OTP expired" })
  if (record.attempts >= 5) return res.status(429).json({ error: "Too many attempts" })

  const ok = await bcrypt.compare(otp, record.otpHash)
  if (!ok) {
    record.attempts += 1
    await record.save()
    return res.status(400).json({ error: "Invalid OTP" })
  }

  const user = await User.findOne({ email })
  if (!user) return res.status(400).json({ error: "User not found" })

  // Cleanup OTP
  await Otp.deleteOne({ _id: record._id })

  const token = signJwt(user._id.toString(), user.email, keepSignedIn)
  res.cookie("token", token, cookieOptions(keepSignedIn))
  return res.json({ user: { id: user._id, name: user.name, email: user.email } })
})

// POST /auth/logout
router.post("/logout", async (_req, res) => {
  const isProd = NODE_ENV === "production"
  res.clearCookie("token", {
    httpOnly: true,
    sameSite: isProd ? "none" : "lax",
    secure: isProd,
  })
  return res.json({ message: "Logged out" })
})

// GET /auth/me
router.get("/me", authMiddleware, async (req, res) => {
  const userId = req.auth!.sub
  console.log("  Looking for user with ID:", userId)
  const user = await User.findOne({ _id: userId })
  console.log("  Found user:", user)
  if (!user) return res.status(404).json({ error: "User not found" })
  return res.json({ user: { id: user._id, name: user.name, email: user.email } })
})

router.get("/login", (_req, res) => {
  res.json({ message: "Login endpoint exists. Use POST /auth/login/start to begin login." })
})

// Google OAuth routes
if (GOOGLE_ENABLED) {
  router.get("/google", passport.authenticate("google", { scope: ["profile", "email"] }))

  router.get(
    "/google/callback",
    passport.authenticate("google", { failureRedirect: `${CLIENT_ORIGIN}/login?error=google_auth_failed` }),
    (req, res) => {
      try {
        const user = req.user as any
        if (!user) {
          console.error("  No user found after Google authentication")
          return res.redirect(`${CLIENT_ORIGIN}/login?error=no_user`)
        }

        console.log("  Google OAuth success for user:", user.email)
        const token = signJwt(user._id.toString(), user.email)

        const isProd = NODE_ENV === "production"
        res.cookie("token", token, {
          httpOnly: true,
          secure: isProd,
          sameSite: isProd ? "none" : "lax",
          maxAge: 7 * 24 * 60 * 60 * 1000,
          domain: isProd ? undefined : undefined,
        })

        console.log("  Cookie set, redirecting to dashboard")
        res.redirect(`${CLIENT_ORIGIN}/dashboard`)
      } catch (error) {
        console.error("  Google OAuth callback error:", error)
        res.redirect(`${CLIENT_ORIGIN}/login?error=callback_error`)
      }
    },
  )
} else {
  router.get("/google", (_req, res) => res.status(501).json({ error: "Google OAuth not configured" }))
  router.get("/google/callback", (_req, res) => res.status(501).json({ error: "Google OAuth not configured" }))
}

export default router
