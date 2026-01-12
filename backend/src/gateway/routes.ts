import { Express } from "express";
import authRoutes from "../routes/auth.routes";
import preferenceRoutes from "../routes/preference.routes";
import locationRoutes from "../routes/location.routes";
import routeRoutes from "../routes/route.routes";
import recentSearchRoute from "../routes/recent.search.routes";
import favoriteRoutes from "../routes/favorite.routes";
import tripRoutes from "../routes/trip.routes";
import aiRoutes from '../routes/ai.routes';
import weatherRoutes from '../routes/weather.routes';
import { Logger } from "../utils/logger.util";

/**
 * API Gateway - Route Configuration
 *
 * Central routing configuration for all API endpoints
 * Routes are processed through middleware stack before reaching handlers
 */

export function setupGatewayRoutes(app: Express) {
  Logger.info("🛣️ Setting up API Gateway routes...\n");
  // AUTH ROUTES (Public)
  app.use("/api/auth", authRoutes);
  Logger.info("Auth routes mounted:");
  //! PROTECTED ROUTES ********************************************************
  // PREFERENCE ROUTES
  app.use("/api/preferences", preferenceRoutes);
  Logger.info("Preference routes mounted:");

  // Routes ROUTES
  app.use("/api/routes", routeRoutes);
  Logger.info("Route routes mounted");

  // recent search ROUTES
  app.use("/api/searches", recentSearchRoute);
  Logger.info("Recent search  routes mounted");

  // Favorite ROUTES
  app.use("/api/favorites", favoriteRoutes);
  Logger.info("Favorite routes mounted");

  // Trip ROUTES
  app.use("/api/trips", tripRoutes);
  Logger.info("Trip routes mounted");

  // LOCATION ROUTES
  app.use("/api/locations", locationRoutes);
  Logger.info("Location routes mounted");

  // AI ROUTES
  app.use("/api/ai", aiRoutes);
  Logger.info("AI routes mounted");

  // WEATHER ROUTES (Public)
  app.use("/api/weather", weatherRoutes);
  Logger.info("Weather routes mounted");

  // GATEWAY INFO
  Logger.info("═════════════════════════════════════════════════════════");
  Logger.info("📊 API GATEWAY SUMMARY");
  Logger.info("═════════════════════════════════════════════════════════");
  Logger.info("🔓 Public Routes  : /api/auth/register, /api/auth/login");
  Logger.info("🔐 Protected Routes: All others (require JWT token)");
  Logger.info("⏱️  Rate Limiting  :");
  Logger.info("   - Auth endpoints: 5 requests/15 minutes");
  Logger.info("   - API endpoints : 100 requests/minute");
  Logger.info("   - Other         : 30 requests/minute");
  Logger.info("📝 Logging        : All requests logged with Request ID");
  Logger.info("═════════════════════════════════════════════════════════\n");
}

/**
 * Helper: Get route list for documentation
 */
export function getGatewayRoutes() {
  return {
    auth: [
      { method: "POST", path: "/api/auth/register", protected: false },
      { method: "POST", path: "/api/auth/login", protected: false },
      { method: "GET", path: "/api/auth/me", protected: true },
    ],
    preferences: [
      { method: "POST", path: "/api/preferences", protected: true },
      { method: "GET", path: "/api/preferences", protected: true },
      { method: "PUT", path: "/api/preferences", protected: true },
      { method: "DELETE", path: "/api/preferences", protected: true },
    ],
    locations: [
      { method: "POST", path: "/api/locations", protected: true },
      { method: "GET", path: "/api/locations", protected: true },
      { method: "GET", path: "/api/locations/:id", protected: true },
      { method: "PUT", path: "/api/locations/:id", protected: true },
      { method: "DELETE", path: "/api/locations/:id", protected: true },
      { method: "GET", path: "/api/locations/favorites", protected: true },
    ],
  };
}
