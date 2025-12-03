import { LocationService } from "../services/location.service";
import { Request, Response } from "express";

const locationService = new LocationService();

export class LocationController {
  // ===== LOCATIONS =====

  async getLocations(req: Request, res: Response) {
    try {
      const userId = req.user!.userId;

      const locations = await locationService.getUserLocations(userId);

      return res.status(200).json({
        success: true,
        data: locations,
      });
    } catch (error: any) {
      return res.status(500).json({
        success: false,
        message: error.message || "Failed to fetch locations",
      });
    }
  }

  async getLocationById(req: Request, res: Response) {
    try {
      const userId = req.user!.userId;
      const { id } = req.params;

      const location = await locationService.getLocationById(userId, id);

      return res.status(200).json({
        success: true,
        data: location,
      });
    } catch (error: any) {
      return res.status(404).json({
        success: false,
        message: error.message || "Location not found",
      });
    }
  }

  async createLocation(req: Request, res: Response) {
    try {
      const userId = req.user!.userId;
      const data = req.body;

      const location = await locationService.createLocation(userId, data);

      return res.status(201).json({
        success: true,
        message: "Location created successfully",
        data: location,
      });
    } catch (error: any) {
      return res.status(400).json({
        success: false,
        message: error.message || "Failed to create location",
      });
    }
  }

  async updateLocation(req: Request, res: Response) {
    try {
      const userId = req.user!.userId;
      const { id } = req.params;
      const data = req.body;

      const updated = await locationService.updateLocation(userId, id, data);

      return res.status(200).json({
        success: true,
        message: "Location updated successfully",
        data: updated,
      });
    } catch (error: any) {
      return res.status(400).json({
        success: false,
        message: error.message || "Failed to update location",
      });
    }
  }

  async deleteLocation(req: Request, res: Response) {
    try {
      const userId = req.user!.userId;
      const { id } = req.params;

      const result = await locationService.deleteLocation(userId, id);

      return res.status(200).json({
        success: true,
        ...result,
      });
    } catch (error: any) {
      return res.status(400).json({
        success: false,
        message: error.message || "Failed to delete location",
      });
    }
  }

  async getFavorites(req: Request, res: Response) {
    try {
      const userId = req.user!.userId;

      const favorites = await locationService.getFavoriteLocations(userId);

      return res.status(200).json({
        success: true,
        data: favorites,
      });
    } catch (error: any) {
      return res.status(500).json({
        success: false,
        message: error.message || "Failed to fetch favorites",
      });
    }
  }
}
