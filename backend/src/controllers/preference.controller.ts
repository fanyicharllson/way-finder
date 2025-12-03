import { Request, Response } from "express";
import { PreferenceService } from "../services/preference.service";

const preferenceService = new PreferenceService();

export class PreferenceController {
  // ===== PREFERENCES =====
  async createPreferences(req: Request, res: Response) {
    try {
      const userId = req.user!.userId;
      const data = req.body;

      const preferences = await preferenceService.createUserPreferences(
        userId,
        data
      );

      return res.status(201).json({
        success: true,
        message: "Preferences created successfully",
        data: preferences,
      });
    } catch (error: any) {
      return res.status(400).json({
        success: false,
        message: error.message || "Failed to create preferences",
      });
    }
  }

  async getPreferences(req: Request, res: Response) {
    try {
      const userId = req.user!.userId;

      const preferences = await preferenceService.getUserPreferences(userId);

      return res.status(200).json({
        success: true,
        data: preferences,
      });
    } catch (error: any) {
      return res.status(404).json({
        success: false,
        message: error.message || "Preferences not found",
      });
    }
  }

  async updatePreferences(req: Request, res: Response) {
    try {
      const userId = req.user!.userId;
      const data = req.body;

      const updated = await preferenceService.updateUserPreferences(
        userId,
        data
      );

      return res.status(200).json({
        success: true,
        message: "Preferences updated successfully",
        data: updated,
      });
    } catch (error: any) {
      return res.status(400).json({
        success: false,
        message: error.message || "Failed to update preferences",
      });
    }
  }
  async deletePreferences(req: Request, res: Response) {
    try {
      const userId = req.user!.userId;

      const result = await preferenceService.deleteUserPreference(userId);

      return res.status(200).json({
        success: true,
        ...result,
      });
    } catch (error: any) {
      return res.status(400).json({
        success: false,
        message: error.message || "Failed to delete preferences",
      });
    }
  }
}
