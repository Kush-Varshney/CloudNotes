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
  const token = req.cookies?.token as string | undefined

  if (!token) {
    return res.status(401).json({ error: "Unauthorized - No token" })
  }

  try {
    const decoded = jwt.verify(token, JWT_SECRET) as AuthPayload
    req.auth = decoded
    next()
  } catch (error) {
    return res.status(401).json({ error: "Unauthorized - Invalid token" })
  }
}
