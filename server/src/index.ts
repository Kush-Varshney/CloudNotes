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

const whitelist = [
  CLIENT_ORIGIN,
  "https://cloudnotesbykush.vercel.app",
  "http://localhost:5173",
]
const corsOptions = {
  origin: function (origin, callback) {
    if (whitelist.indexOf(origin) !== -1 || !origin) {
      callback(null, true)
    } else {
      callback(new Error("Not allowed by CORS"))
    }
  },
  credentials: true,
  methods: ["GET", "POST", "PUT", "DELETE", "OPTIONS"],
  allowedHeaders: ["Content-Type", "Authorization", "Cookie"],
}

app.use(cors(corsOptions))

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
