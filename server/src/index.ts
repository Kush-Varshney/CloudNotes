import express from "express"
import cors from "cors"
import cookieParser from "cookie-parser"
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

      // Allow the main client origin
      if (origin === CLIENT_ORIGIN) return callback(null, true)

      // Allow all Vercel preview URLs for the client
      if (/\.vercel\.app$/.test(origin)) {
        return callback(null, true)
      }

      // Allow localhost for development
      if (origin.includes("localhost") || origin.includes("127.0.0.1")) {
        return callback(null, true)
      }

      // Block all other origins
      return callback(new Error("Not allowed by CORS"))
    },
    credentials: true,
    methods: ["GET", "POST", "PUT", "DELETE", "OPTIONS"],
    allowedHeaders: ["Content-Type", "Authorization", "Cookie"],
  }),
)

// Only initialize passport for Google OAuth, but don't use sessions
app.use(passport.initialize())

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
