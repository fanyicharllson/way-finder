import { Request, Response } from "express";
import { tripService } from "../services/trip.service";

/**
 * Trip Controller
 */
export class TripController {
  /**
   * POST /api/trips
   * Save a completed trip
   */
  async saveTrip(req: Request, res: Response): Promise<void> {
    try {
      const userId = req.user!.userId;
      const {
        origin,
        destination,
        transportMode,
        actualCost,
        actualTime,
        distance,
        startTime,
        endTime,
      } = req.body;

      const trip = await tripService.saveTrip({
        userId,
        origin,
        destination,
        transportMode,
        actualCost,
        actualTime,
        distance,
        startTime: new Date(startTime),
        endTime: endTime ? new Date(endTime) : undefined,
      });

      res.status(201).json({
        success: true,
        trip,
      });
    } catch (error: any) {
      console.error("❌ Save trip error:", error);
      res.status(500).json({
        success: false,
        message: "Failed to save trip",
        error: error.message,
      });
    }
  }

  /**
   * GET /api/trips/history
   * Get user's trip history
   */
  async getTripHistory(req: Request, res: Response): Promise<void> {
    try {
      const userId = req.user!.userId;
      const { limit, offset, startDate, endDate } = req.query;

      const trips = await tripService.getTripHistory(userId, {
        limit: limit ? parseInt(limit as string) : undefined,
        offset: offset ? parseInt(offset as string) : undefined,
        startDate: startDate ? new Date(startDate as string) : undefined,
        endDate: endDate ? new Date(endDate as string) : undefined,
      });

      res.status(200).json({
        success: true,
        trips,
        count: trips.length,
      });
    } catch (error: any) {
      console.error("❌ Get trip history error:", error);
      res.status(500).json({
        success: false,
        message: "Failed to get trip history",
        error: error.message,
      });
    }
  }

  /**
   * GET /api/trips/:id
   * Get trip details
   */
  async getTripById(req: Request, res: Response): Promise<void> {
    try {
      const userId = req.user!.userId;
      const { id } = req.params;

      const trip = await tripService.getTripById(id, userId);

      if (!trip) {
        res.status(404).json({
          success: false,
          message: "Trip not found",
        });
        return;
      }

      res.status(200).json({
        success: true,
        trip,
      });
    } catch (error: any) {
      console.error("❌ Get trip error:", error);
      res.status(500).json({
        success: false,
        message: "Failed to get trip",
        error: error.message,
      });
    }
  }

  /**
   * PUT /api/trips/:id/rate
   * Rate a trip
   */
  async rateTrip(req: Request, res: Response): Promise<void> {
    try {
      const userId = req.user!.userId;
      const { id } = req.params;
      const { rating } = req.body;

      const result = await tripService.rateTrip(id, userId, rating);

      res.status(200).json({
        success: true,
        ...result,
      });
    } catch (error: any) {
      console.error("❌ Rate trip error:", error);
      res.status(500).json({
        success: false,
        message: error.message || "Failed to rate trip",
      });
    }
  }

  /**
   * GET /api/trips/analytics
   * Get user analytics
   */
  async getAnalytics(req: Request, res: Response): Promise<void> {
    try {
      const userId = req.user!.userId;
      const { month } = req.query;

      const analytics = await tripService.getUserAnalytics(
        userId,
        month ? new Date(month as string) : undefined
      );

      res.status(200).json({
        success: true,
        analytics,
      });
    } catch (error: any) {
      console.error("❌ Get analytics error:", error);
      res.status(500).json({
        success: false,
        message: "Failed to get analytics",
        error: error.message,
      });
    }
  }
}

export const tripController = new TripController();