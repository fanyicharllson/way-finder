import { Request, Response, NextFunction } from "express";
import { Logger } from "../../utils/logger.util";

/**
 * API Gateway - Rate Limiting Middleware
 * 
 * Prevents abuse by limiting requests per user/IP
 * Different limits for different endpoints
 */

// Store for tracking requests: { key: { count: number, resetTime: number } }
const requestCounts = new Map<
  string,
  { count: number; resetTime: number }
>();

/**
 * Rate limit configuration
 */
const RATE_LIMITS = {
  auth: {
    windowMs: 15 * 60 * 1000, // 15 minutes
    maxRequests: 5, // 5 requests per window
    message: "Too many authentication attempts, please try again later",
  },
  api: {
    windowMs: 60 * 1000, // 1 minute
    maxRequests: 100, // 100 requests per minute
    message: "Too many requests, please try again later",
  },
  default: {
    windowMs: 60 * 1000, // 1 minute
    maxRequests: 30, // 30 requests per minute
    message: "Rate limit exceeded",
  },
};

/**
 * Get rate limit config based on route
 */
function getLimitConfig(path: string) {
  if (path.startsWith("/api/auth")) {
    return RATE_LIMITS.auth;
  } else if (path.startsWith("/api/")) {
    return RATE_LIMITS.api;
  }
  return RATE_LIMITS.default;
}

/**
 * Get rate limit key (user ID or IP)
 */
function getRateLimitKey(req: Request): string {
  // Use user ID if authenticated, otherwise use IP
  const userId = (req as any).userId;
  return userId || `ip_${req.ip}`;
}

/**
 * Rate limiting middleware
 */
export const rateLimitGateway = (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  // Skip rate limiting for health check
  if (req.path === "/health") {
    return next();
  }

  const config = getLimitConfig(req.path);
  const key = getRateLimitKey(req);

  // Get current request count for this key
  let record = requestCounts.get(key);

  // Reset if window has passed
  if (!record || Date.now() > record.resetTime) {
    record = {
      count: 1,
      resetTime: Date.now() + config.windowMs,
    };
    requestCounts.set(key, record);

    Logger.dev(`⏱️ Rate limit window started for ${key}`);
    Logger.dev(
      `   (${record.count}/${config.maxRequests} requests in ${config.windowMs / 1000}s)`
    );

    return next();
  }

  // Increment request count
  record.count++;

  // Check if exceeded limit
  if (record.count > config.maxRequests) {
    const remainingTime = Math.ceil(
      (record.resetTime - Date.now()) / 1000
    );

    Logger.warn(`🚫 Rate limit exceeded for ${key}`);
    Logger.warn(
      `   (${record.count}/${config.maxRequests} requests) - Reset in ${remainingTime}s`
    );

    return res.status(429).json({
      success: false,
      message: config.message,
      retryAfter: remainingTime,
    });
  }

  Logger.dev(
    `📊 Rate limit check: ${record.count}/${config.maxRequests} for ${key}`
  );

  next();
};

/**
 * Cleanup old records periodically
 * Run this every 30 minutes to free up memory
 */
export const cleanupRateLimitRecords = () => {
  setInterval(() => {
    const now = Date.now();
    let cleaned = 0;

    for (const [key, record] of requestCounts.entries()) {
      if (now > record.resetTime) {
        requestCounts.delete(key);
        cleaned++;
      }
    }

    if (cleaned > 0) {
      Logger.dev(`🧹 Cleaned up ${cleaned} expired rate limit records`);
    }
  }, 30 * 60 * 1000); // Every 30 minutes
};
