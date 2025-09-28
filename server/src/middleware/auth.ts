import type { Request, Response, NextFunction } from "express"
import jwt from "jsonwebtoken"
import { JWT_SECRET } from "../config/env"

export interface AuthPayload {
  sub: string // userId
  email: string
}

declare global {
  namespace Express {
    interface Request {
      auth?: AuthPayload
    }
  }
}

export function authMiddleware(req: Request, res: Response, next: NextFunction) {
  console.log(`  Auth middleware - cookies:`, req.cookies)
  const token = req.cookies?.token as string | undefined
  console.log(`  Auth middleware - token:`, token ? "present" : "missing")

  if (!token) return res.status(401).json({ error: "Unauthorized" })

  try {
    const decoded = jwt.verify(token, JWT_SECRET) as AuthPayload
    console.log(`  Auth middleware - decoded:`, decoded)
    req.auth = decoded
    next()
  } catch (error) {
    console.log(`  Auth middleware - JWT error:`, error)
    return res.status(401).json({ error: "Unauthorized" })
  }
}
