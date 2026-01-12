import { Router } from "express";
import { weatherController } from "../controllers/weather.controller";

const router = Router();

/**
 * GET /api/weather/current
 * Get current weather for coordinates
 * Query params: lat, lng
 */
router.get("/current", weatherController.getCurrentWeather.bind(weatherController));

export default router;
