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
    origin: (origin, callback) => {
      // Allow requests with no origin (like mobile apps or curl requests)
      if (!origin) return callback(null, true)

      // Allow the configured client origin
      if (origin === CLIENT_ORIGIN) return callback(null, true)

      // Allow localhost for development
      if (origin.includes("localhost") || origin.includes("127.0.0.1")) {
        return callback(null, true)
      }

      // Allow Vercel preview deployments
      if (origin.includes(".vercel.app")) return callback(null, true)

      callback(new Error("Not allowed by CORS"))
    },
    credentials: true,
    methods: ["GET", "POST", "PUT", "DELETE", "OPTIONS"],
    allowedHeaders: ["Content-Type", "Authorization", "Cookie"],
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
      sameSite: process.env.NODE_ENV === "production" ? "none" : "lax",
      domain: process.env.NODE_ENV === "production" ? undefined : undefined,
    },
  }),
)

app.use(passport.initialize())
app.use(passport.session())

app.use((req, res, next) => {
  console.log(`  ${req.method} ${req.path}`)
  console.log(`  Cookies:`, req.cookies)
  console.log(`  Origin:`, req.get("origin"))
  next()
})

app.get("/health", (_req, res) => res.json({ status: "ok" }))

app.use("/auth", authRoutes)
app.use("/notes", authMiddleware, notesRoutes)

connectDB()
  .then(() => {
    app.listen(PORT, () => console.log(`Server listening on :${PORT}`))
  })
  .catch((err) => {
    console.error("Failed to connect DB", err)
    process.exit(1)
  })
