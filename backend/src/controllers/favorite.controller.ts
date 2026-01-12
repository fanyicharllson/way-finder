import { Request, Response } from "express";
import { favoriteService } from "../services/favorite.service";
import { Logger } from "../utils/logger.util";

export class FavoriteController {
  /**
   * GET /api/favorites
   * Get user's favorite routes
   */
  async getFavorites(req: Request, res: Response): Promise<void> {
    try {
      const userId = req.user!.userId;

      const favorites = await favoriteService.getFavorites(userId);

      res.status(200).json({
        success: true,
        favorites,
        count: favorites.length,
      });
    } catch (error: any) {
      Logger.error("❌ Get favorites error:", error);
      res.status(500).json({
        success: false,
        message: "Failed to get favorites",
        error: error.message,
      });
    }
  }

  /**
   * POST /api/favorites
   * Add route to favorites
   */
  async addFavorite(req: Request, res: Response): Promise<void> {
    try {
      const userId = req.user!.userId;
      const {
        name,
        fromAddress,
        toAddress,
        fromLat,
        fromLng,
        toLat,
        toLng,
        preferredMode,
        notes,
      } = req.body;

      const favorite = await favoriteService.addFavorite({
        userId,
        name,
        fromAddress,
        toAddress,
        fromLat,
        fromLng,
        toLat,
        toLng,
        preferredMode,
        notes,
      });

      res.status(201).json({
        success: true,
        favorite,
      });
    } catch (error: any) {
      Logger.error("❌ Add favorite error:", error);
      res.status(500).json({
        success: false,
        message: "Failed to add favorite",
        error: error.message,
      });
    }
  }

  /**
   * POST /api/favorites/toggle
   * Toggle favorite (add/remove)
   */
  async toggleFavorite(req: Request, res: Response): Promise<void> {
    try {
      const userId = req.user!.userId;
      const {
        name,
        fromAddress,
        toAddress,
        fromLat,
        fromLng,
        toLat,
        toLng,
        preferredMode,
      } = req.body;

      const result = await favoriteService.toggleFavorite({
        userId,
        name,
        fromAddress,
        toAddress,
        fromLat,
        fromLng,
        toLat,
        toLng,
        preferredMode,
      });

      res.status(200).json({
        success: true,
        ...result,
      });
    } catch (error: any) {
      Logger.error("❌ Toggle favorite error:", error);
      res.status(500).json({
        success: false,
        message: "Failed to toggle favorite",
        error: error.message,
      });
    }
  }

  /**
   * DELETE /api/favorites/:id
   * Remove from favorites
   */
  async removeFavorite(req: Request, res: Response): Promise<void> {
    try {
      const userId = req.user!.userId;
      const { id } = req.params;

      const result = await favoriteService.removeFavorite(id, userId);

      res.status(200).json(result);
    } catch (error: any) {
      Logger.error("❌ Remove favorite error:", error);
      res.status(404).json({
        success: false,
        message: error.message || "Failed to remove favorite",
      });
    }
  }

  /**
   * PUT /api/favorites/:id
   * Update favorite
   */
  async updateFavorite(req: Request, res: Response): Promise<void> {
    try {
      const userId = req.user!.userId;
      const { id } = req.params;
      const { name, preferredMode, notes } = req.body;

      const result = await favoriteService.updateFavorite(id, userId, {
        name,
        preferredMode,
        notes,
      });

      res.status(200).json(result);
    } catch (error: any) {
      Logger.error("❌ Update favorite error:", error);
      res.status(404).json({
        success: false,
        message: error.message || "Failed to update favorite",
      });
    }
  }
}

export const favoriteController = new FavoriteController();
