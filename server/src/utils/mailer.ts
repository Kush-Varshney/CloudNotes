import nodemailer from "nodemailer"
import { SMTP_ENABLED, SMTP_HOST, SMTP_PASS, SMTP_PORT, SMTP_USER, SMTP_FROM, NODE_ENV } from "../config/env"

export async function sendOtpEmail(to: string, otp: string) {
  if (!SMTP_ENABLED) {
    if (NODE_ENV !== "production") {
      console.log("[v0] OTP (dev):", otp)
    }
    return { delivered: false }
  }

  const transporter = nodemailer.createTransport({
    host: SMTP_HOST,
    port: SMTP_PORT,
    secure: SMTP_PORT === 465,
    auth: { user: SMTP_USER, pass: SMTP_PASS },
  })

  await transporter.sendMail({
    from: SMTP_FROM,
    to,
    subject: "Your CloudNotes verification code",
    text: `Your verification code is: ${otp}`,
    html: `<p>Your verification code is: <b>${otp}</b></p>`,
  })

  return { delivered: true }
}
