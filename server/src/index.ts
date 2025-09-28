import express from "express"
import cors from "cors"
import cookieParser from "cookie-parser"
import session from "express-session"
import passport from "passport"
import { connectDB } from "./config/db"
import { CLIENT_ORIGIN, PORT } from "./config/env"
import "./config/passport"
import authRoutes from "./routes/auth"
import notesRoutes from "./routes/notes"
import { authMiddleware } from "./middleware/auth"

const app = express()

app.use(express.json())
app.use(cookieParser())
app.use(
  cors({
    origin: CLIENT_ORIGIN,
    credentials: true,
  }),
)

// Session configuration for Passport
app.use(
  session({
    secret: process.env.JWT_SECRET || "fallback-secret",
    resave: false,
    saveUninitialized: false,
    cookie: {
      secure: process.env.NODE_ENV === "production",
      maxAge: 24 * 60 * 60 * 1000, // 24 hours
    },
  })
)

app.use(passport.initialize())
app.use(passport.session())

app.get("/health", (_req, res) => res.json({ status: "ok" }))

app.use("/auth", authRoutes)
app.use("/notes", authMiddleware, notesRoutes)

connectDB()
  .then(() => {
    app.listen(PORT, () => console.log(`[v0] Server listening on :${PORT}`))
  })
  .catch((err) => {
    console.error("[v0] Failed to connect DB", err)
    process.exit(1)
  })
