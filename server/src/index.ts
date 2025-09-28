import express from "express"
import cors from "cors"
import cookieParser from "cookie-parser"
import passport from "passport"
import { connectDB } from "./config/db"
import { PORT } from "./config/env"
import "./config/passport"
import authRoutes from "./routes/auth"
import notesRoutes from "./routes/notes"
import { authMiddleware } from "./middleware/auth"

const app = express()

// Define allowed origins
const allowedOrigins = [
  "https://cloudnotesbykush.vercel.app",
  "http://localhost:5173",
  "http://127.0.0.1:5173",
]

const corsOptions: cors.CorsOptions = {
  origin: (origin, callback) => {
    // Allow requests with no origin (like mobile apps or curl requests) or from whitelisted origins
    if (!origin || allowedOrigins.includes(origin)) {
      callback(null, true)
    } else {
      callback(new Error("Not allowed by CORS"))
    }
  },
  methods: ["GET", "POST", "PUT", "DELETE", "OPTIONS"],
  allowedHeaders: ["Content-Type", "Authorization"],
}

app.use(express.json())
app.use(cookieParser()) // Maintained for any other potential uses, but not for auth
app.use(cors(corsOptions))

// Pre-flight requests
// The browser sends an OPTIONS request first to check if the actual request is safe to send.
// We need to handle this explicitly.
app.options("*", cors(corsOptions)) 

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
