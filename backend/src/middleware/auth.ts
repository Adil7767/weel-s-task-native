import { NextFunction, Request, Response } from "express";
import { verifyToken } from "../utils/jwt";

declare module "express-serve-static-core" {
  interface Request {
    userId?: string;
  }
}

export const requireAuth = (req: Request, res: Response, next: NextFunction) => {
  const authHeader = req.headers.authorization;
  if (!authHeader) {
    return res.status(401).json({ message: "Missing Authorization header" });
  }

  const [scheme, token] = authHeader.split(" ");

  if (scheme !== "Bearer" || !token) {
    return res.status(401).json({ message: "Invalid Authorization header" });
  }

  try {
    const payload = verifyToken(token);
    req.userId = payload.sub;
    next();
  } catch (error) {
    return res.status(401).json({ message: "Invalid or expired token" });
  }
};

