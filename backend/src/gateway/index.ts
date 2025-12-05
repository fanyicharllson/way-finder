/**
 * API Gateway - Main Module
 * 
 * Central export point for API Gateway
 */

export { setupGatewayRoutes, getGatewayRoutes } from "./routes";
export {
  requestLogger,
  authGateway,
  rateLimitGateway,
  corsGateway,
  cleanupRateLimitRecords,
  getUserId,
  getUser,
} from "./middleware";
