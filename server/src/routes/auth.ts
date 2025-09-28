import { Router } from "express"
import passport from "passport"
import { z } from "zod"
import { User } from "../models/User"
import { Otp } from "../models/Otp"
import bcrypt from "bcryptjs"
import jwt from "jsonwebtoken"
import { JWT_SECRET, GOOGLE_ENABLED, CLIENT_ORIGIN } from "../config/env"
import { signupStartSchema, signupVerifySchema, emailSchema } from "../utils/validators"
import { sendOtpEmail } from "../utils/mailer"
import { authMiddleware } from "../middleware/auth"

const router = Router()

function signJwt(userId: string, email: string, keepSignedIn?: boolean) {
  const payload = { sub: userId, email }
  const expiresIn = keepSignedIn ? "30d" : "7d"
  return jwt.sign(payload, JWT_SECRET, { expiresIn })
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

  if (record.expiresAt < new Date()) return res.status(400).json({ error: "OTP expired" })
  if (record.attempts >= 5) return res.status(429).json({ error: "Too many attempts" })

  const ok = await bcrypt.compare(otp, record.otpHash)
  if (!ok) {
    record.attempts += 1
    await record.save()
    return res.status(400).json({ error: "Invalid OTP" })
  }

  if (!record.name || !record.dob) {
    return res.status(400).json({ error: "Signup data missing. Please start signup again." })
  }

  const exists = await User.findOne({ email })
  if (exists) return res.status(400).json({ error: "Email already registered" })

  const user = await User.create({
    name: record.name,
    dob: record.dob,
    email,
    isEmailVerified: true,
  })

  await Otp.deleteOne({ _id: record._id })

  const token = signJwt(user._id.toString(), user.email)
  return res.json({ token, user: { id: user._id, name: user.name, email: user.email } })
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
      otp: z.string().length(6).regex(/^\d{6}$/),
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

  await Otp.deleteOne({ _id: record._id })

  const token = signJwt(user._id.toString(), user.email, keepSignedIn)

  return res.json({ token, user: { id: user._id, name: user.name, email: user.email } })
})

// POST /auth/logout
router.post("/logout", async (_req, res) => {
  // On the client-side, the token will be removed from localStorage.
  // This endpoint can be used for any server-side cleanup if necessary in the future.
  return res.json({ message: "Logged out" })
})

// GET /auth/me
router.get("/me", authMiddleware, async (req, res) => {
  const userId = req.auth!.sub
  const user = await User.findOne({ _id: userId })
  if (!user) return res.status(404).json({ error: "User not found" })
  return res.json({ user: { id: user._id, name: user.name, email: user.email } })
})

router.get("/login", (_req, res) => {
  res.json({ message: "Login endpoint exists. Use POST /auth/login/start to begin login." })
})

// Google OAuth routes
if (GOOGLE_ENABLED) {
  router.get("/google", passport.authenticate("google", { scope: ["profile", "email"], session: false }))

  router.get(
    "/google/callback",
    passport.authenticate("google", { failureRedirect: `${CLIENT_ORIGIN}/login?error=google_auth_failed`, session: false }),
    (req, res) => {
      try {
        const user = req.user as any
        if (!user) {
          console.error("  No user found after Google authentication")
          return res.redirect(`${CLIENT_ORIGIN}/login?error=no_user`)
        }
        const token = signJwt(user._id.toString(), user.email)
        // Redirect with token in query params for the client to store
        res.redirect(`${CLIENT_ORIGIN}/auth/callback?token=${token}`)
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
