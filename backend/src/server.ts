import express, { Express, Request, Response } from "express";
import helmet from "helmet";
import dotenv from "dotenv";

// 🎯 Import event system - registers all event listeners
import "./events/listeners/user.listener";
import "./events/listeners/preference.listener";
import "./events/listeners/trip.listener";
import "./events/listeners/route.listener";
import "./events/listeners/favorites.listeners";
import "./events/listeners/search.listeners";

// 🚪 Import API Gateway - handles routing and middleware
import {
  setupGatewayRoutes,
  requestLogger,
  authGateway,
  corsGateway,
  cleanupRateLimitRecords,
} from "./gateway";
import { Logger } from "./utils/logger.util";

dotenv.config();

const app: Express = express();
const PORT = process.env.PORT || 3000;

// ═══════════════════════════════════════════════════════════════
// API GATEWAY MIDDLEWARE STACK
// ═══════════════════════════════════════════════════════════════

// Security
app.use(helmet());

// Body parsing
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// API Gateway Middleware (in order)
app.use(requestLogger); // 1. Log all requests
app.use(corsGateway); // 2. Handle CORS
// app.use(rateLimitGateway); // 3. Rate limiting
app.use(authGateway); // 4. Authentication check

// ═══════════════════════════════════════════════════════════════
// HEALTH CHECK ENDPOINT
// ═══════════════════════════════════════════════════════════════

app.get("/health", (req: Request, res: Response) => {
  res.json({
    success: true,
    message: "WayFinder API is running 🚀",
    timestamp: new Date().toISOString(),
    environment: process.env.NODE_ENV || "development",
    uptime: process.uptime()
  });
});

// ═══════════════════════════════════════════════════════════════
// API GATEWAY ROUTE SETUP
// ═══════════════════════════════════════════════════════════════

setupGatewayRoutes(app);

// 404 handler
app.use((req: Request, res: Response) => {
  res.status(404).json({
    success: false,
    message: `Route ${req.method} ${req.path} not found`,
  });
});

//* Global error handler
app.use((err: any, req: Request, res: Response, next: any) => {
  Logger.error("Error:", err);
  res.status(err.status || 500).json({
    success: false,
    message: err.message || "Internal server error! Please try again later",
    ...(process.env.NODE_ENV === "development" && {
      stack: err.stack,
      details: err,
    }),
  });
});

// Start cleanup task for rate limiting
cleanupRateLimitRecords();

// Start server
app.listen(PORT, () => {
  Logger.info(`
╔═══════════════════════════════════════════════════════════╗
║                 🚀 WayFinder Backend                      ║
╚═══════════════════════════════════════════════════════════╝

🌐 Server Details:
   Port       : ${PORT}
   Environment: ${process.env.NODE_ENV || "development"}   
🚀 Ready to accept requests!

  `);
});

export default app;
