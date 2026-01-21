import { Request, Response, NextFunction } from "express";
import { Logger } from "../../utils/logger.util";

/**
 * API Gateway - CORS Configuration Middleware
 *
 * Centralized CORS handling for all routes
 * Single place to configure allowed origins
 */

export const corsGateway = (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  // Allowed origins
  const allowedOrigins = [
    "http://localhost:4200",
    "http://localhost:4201",
    "http://localhost:5173",
    "https://571c58353266.ngrok-free",
    "http://10.248.33.12:8081",
    "http://192.168.4.111:8081",
    "https://3cb6c5c8d0a1.ngrok-free.app",
    process.env.FRONTEND_URL,
  ].filter(Boolean);

  const origin = req.headers.origin;

  if (allowedOrigins.includes(origin as string)) {
    res.header("Access-Control-Allow-Origin", origin);
    Logger.info(`✅ CORS allowed for origin: ${origin}`);
  } else if (origin) {
    Logger.info(`🚫 CORS rejected for origin: ${origin}`);
  }

  // CORS headers
  res.header("Access-Control-Allow-Methods", "GET, POST, PUT, DELETE, PATCH");
  res.header("Access-Control-Allow-Headers", "Content-Type, Authorization");
  res.header("Access-Control-Allow-Credentials", "true");
  res.header("Access-Control-Max-Age", "86400"); // 24 hours

  // Handle preflight requests
  if (req.method === "OPTIONS") {
    return res.sendStatus(200);
  }

  next();
};
