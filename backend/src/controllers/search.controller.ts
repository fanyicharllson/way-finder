import { Request, Response } from "express";
import { recentSearchService } from "../services/recent-search.service"

/**
 * Search & Favorites Controller
 */
export class SearchController {
  /**
   * GET /api/searches/recent
   * Get user's recent searches
   */
  async getRecentSearches(req: Request, res: Response): Promise<void> {
    try {
      const userId = req.user!.userId;
      const limit = req.query.limit ? parseInt(req.query.limit as string) : 10;

      const searches = await recentSearchService.getRecentSearches(userId, limit);

      res.status(200).json({
        success: true,
        searches,
        count: searches.length,
      });
    } catch (error: any) {
      console.error("❌ Get recent searches error:", error);
      res.status(500).json({
        success: false,
        message: "Failed to get recent searches",
        error: error.message,
      });
    }
  }

  /**
   * DELETE /api/searches/recent
   * Clear all recent searches
   */
  async clearRecentSearches(req: Request, res: Response): Promise<void> {
    try {
      const userId = req.user!.userId;

      const result = await recentSearchService.clearAllSearches(userId);

      res.status(200).json(result);
    } catch (error: any) {
      console.error("❌ Clear searches error:", error);
      res.status(500).json({
        success: false,
        message: "Failed to clear searches",
        error: error.message,
      });
    }
  }

  /**
   * DELETE /api/searches/recent/:id
   * Delete specific search
   */
  async deleteSearch(req: Request, res: Response): Promise<void> {
    try {
      const userId = req.user!.userId;
      const { id } = req.params;

      const result = await recentSearchService.deleteSearch(id, userId);

      res.status(200).json(result);
    } catch (error: any) {
      console.error("❌ Delete search error:", error);
      res.status(404).json({
        success: false,
        message: error.message || "Failed to delete search",
      });
    }
  }
}

export const searchController = new SearchController();