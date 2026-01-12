import { Request, Response } from "express";
import { routeService } from "../services/route.service";
import { RouteSearchRequest } from "../types/route.type";
import { Logger } from "../utils/logger.util";

/**
 * Route Controller
 * Handles HTTP requests for route operations
 */
export class RouteController {
  /**
   * POST /api/routes/search
   * Search for routes between origin and destination
   */
  async searchRoutes(req: Request, res: Response): Promise<void> {
    try {
      const userId = req.user!.userId;
      const searchRequest: RouteSearchRequest = req.body;

      const result = await routeService.searchRoutes(userId, searchRequest);

      res.status(200).json(result);
    } catch (error: any) {
      Logger.error("❌ Route search error:", error);
      res.status(500).json({
        success: false,
        message: "Failed to search routes",
        error: error.message,
      });
    }
  }

  /**
   * GET /api/routes/:id
   * Get route details by ID (Phase 2)
   */
  async getRouteById(req: Request, res: Response): Promise<void> {
    try {
      const { id } = req.params;

      const route = await routeService.getRouteById(id);

      if (!route) {
        res.status(404).json({
          success: false,
          message: "Route not found",
        });
        return;
      }

      res.status(200).json({
        success: true,
        route,
      });
    } catch (error: any) {
      Logger.error("❌ Get route error:", error);
      res.status(500).json({
        success: false,
        message: "Failed to get route",
        error: error.message,
      });
    }
  }

  /**
   * POST /api/routes/compare
   * Compare multiple routes (Phase 2)
   */
  async compareRoutes(req: Request, res: Response): Promise<void> {
    try {
      const { routeIds } = req.body;

      if (!Array.isArray(routeIds) || routeIds.length === 0) {
        res.status(400).json({
          success: false,
          message: "routeIds must be a non-empty array",
        });
        return;
      }

      const routes = await routeService.compareRoutes(routeIds);

      res.status(200).json({
        success: true,
        routes,
      });
    } catch (error: any) {
      Logger.error("❌ Compare routes error:", error);
      res.status(500).json({
        success: false,
        message: "Failed to compare routes",
        error: error.message,
      });
    }
  }
}

export const routeController = new RouteController();
