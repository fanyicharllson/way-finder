import { Request, Response, NextFunction } from "express";
import { JWTUtil } from "../../utils/jwt.util";

/**
 * API Gateway - Authentication Middleware
 * 
 * Validates JWT tokens from Authorization header
 * Protects private routes (except auth endpoints)
 */

// Routes that don't require authentication
const PUBLIC_ROUTES = [
  "/api/auth/register",
  "/api/auth/login",
  "/health",
];

export const authGateway = (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  // Check if route is public
  const isPublicRoute = PUBLIC_ROUTES.some((route) => req.path === route);

  if (isPublicRoute) {
    console.log(`🔓 Public route accessed: ${req.method} ${req.path}`);
    return next();
  }

  // Protected route - require authentication
  console.log(`🔐 Protected route - verifying token: ${req.method} ${req.path}`);

  const authHeader = req.headers.authorization;

  if (!authHeader) {
    console.log(`❌ No authorization header provided`);
    return res.status(401).json({
      success: false,
      message: "Authorization header missing",
    });
  }

  // Extract token from "Bearer <token>"
  const token = authHeader.replace("Bearer ", "");

  if (!token) {
    console.log(`❌ Invalid authorization header format`);
    return res.status(401).json({
      success: false,
      message: "Invalid authorization header format",
    });
  }

  try {
    // Verify token
    const decoded = JWTUtil.verify(token);
    
    // Attach user info to request
    (req as any).user = decoded;
    (req as any).userId = decoded.userId;

    console.log(`✅ Token verified for user: ${decoded.email}`);
    next();
  } catch (error) {
    console.log(`❌ Invalid or expired token`);
    return res.status(401).json({
      success: false,
      message: "Invalid or expired token",
    });
  }
};

/**
 * Middleware to extract user ID from request
 * Use this in controllers: const userId = (req as any).userId
 */
export const getUserId = (req: Request): string => {
  return (req as any).userId;
};

/**
 * Middleware to extract user info from request
 */
export const getUser = (req: Request): any => {
  return (req as any).user;
};
