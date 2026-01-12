import { Request, Response } from "express";
import { weatherService } from "../services/weather.service";

export class WeatherController {
  /**
   * GET /api/weather/current
   * Get current weather for given coordinates
   */
  async getCurrentWeather(req: Request, res: Response) {
    try {
      const { lat, lng } = req.query;

      if (!lat || !lng) {
        return res.status(400).json({
          success: false,
          message: "Latitude and longitude are required",
        });
      }

      const latitude = parseFloat(lat as string);
      const longitude = parseFloat(lng as string);

      if (isNaN(latitude) || isNaN(longitude)) {
        return res.status(400).json({
          success: false,
          message: "Invalid latitude or longitude",
        });
      }

      const weatherData = await weatherService.getCurrentWeather(
        latitude,
        longitude
      );

      return res.status(200).json({
        success: true,
        data: weatherData,
      });
    } catch (error: any) {
      console.error("Weather controller error:", error);
      return res.status(500).json({
        success: false,
        message: error.message || "Failed to fetch weather data",
      });
    }
  }
}

export const weatherController = new WeatherController();
