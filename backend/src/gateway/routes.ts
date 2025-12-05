import { Express } from "express";
import authRoutes from "../routes/auth.routes";
import preferenceRoutes from "../routes/preference.routes";
import locationRoutes from "../routes/location.routes";

/**
 * API Gateway - Route Configuration
 * 
 * Central routing configuration for all API endpoints
 * Routes are processed through middleware stack before reaching handlers
 */

export function setupGatewayRoutes(app: Express) {
  console.log("🛣️ Setting up API Gateway routes...\n");

  // ═══════════════════════════════════════════════════════════════
  // AUTH ROUTES (Public)
  // ═══════════════════════════════════════════════════════════════

  app.use("/api/auth", authRoutes);

  console.log("✅ Auth routes mounted:");
  console.log("   POST   /api/auth/register - Register new user");
  console.log("   POST   /api/auth/login    - Login user");
  console.log("   GET    /api/auth/me       - Get current user (protected)\n");

  // ═══════════════════════════════════════════════════════════════
  // PREFERENCE ROUTES (Protected)
  // ═══════════════════════════════════════════════════════════════

  app.use("/api/preferences", preferenceRoutes);

  console.log("✅ Preference routes mounted:");
  console.log("   POST   /api/preferences        - Create preferences (protected)");
  console.log("   GET    /api/preferences        - Get preferences (protected)");
  console.log("   PUT    /api/preferences        - Update preferences (protected)");
  console.log("   DELETE /api/preferences        - Delete preferences (protected)\n");

  // ═══════════════════════════════════════════════════════════════
  // LOCATION ROUTES (Protected)
  // ═══════════════════════════════════════════════════════════════

  app.use("/api/locations", locationRoutes);

  console.log("✅ Location routes mounted:");
  console.log(
    "   POST   /api/locations             - Create location (protected)"
  );
  console.log(
    "   GET    /api/locations             - Get all locations (protected)"
  );
  console.log(
    "   GET    /api/locations/:id         - Get location by ID (protected)"
  );
  console.log(
    "   PUT    /api/locations/:id         - Update location (protected)"
  );
  console.log(
    "   DELETE /api/locations/:id         - Delete location (protected)"
  );
  console.log(
    "   GET    /api/locations/favorites   - Get favorite locations (protected)\n"
  );

  // ═══════════════════════════════════════════════════════════════
  // GATEWAY INFO
  // ═══════════════════════════════════════════════════════════════

  console.log("═════════════════════════════════════════════════════════");
  console.log("📊 API GATEWAY SUMMARY");
  console.log("═════════════════════════════════════════════════════════");
  console.log("🔓 Public Routes  : /api/auth/register, /api/auth/login");
  console.log("🔐 Protected Routes: All others (require JWT token)");
  console.log("⏱️  Rate Limiting  :");
  console.log("   - Auth endpoints: 5 requests/15 minutes");
  console.log("   - API endpoints : 100 requests/minute");
  console.log("   - Other         : 30 requests/minute");
  console.log("📝 Logging        : All requests logged with Request ID");
  console.log("═════════════════════════════════════════════════════════\n");
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
