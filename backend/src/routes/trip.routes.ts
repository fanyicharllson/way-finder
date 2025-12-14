import { Router } from "express";
import { tripController } from "../controllers/trip.controller";

const router = Router();

/**
 * All trip endpoints require authentication
 */

/**
 * @route   POST /api/trips
 * @desc    Save a completed trip
 * @access  Private
 */
router.post("/", tripController.saveTrip.bind(tripController));

/**
 * @route   GET /api/trips/history
 * @desc    Get user's trip history
 * @access  Private
 * @query   limit, offset, startDate, endDate
 */
router.get("/history", tripController.getTripHistory.bind(tripController));

/**
 * @route   GET /api/trips/analytics
 * @desc    Get user analytics
 * @access  Private
 * @query   month (YYYY-MM format)
 */
router.get("/analytics", tripController.getAnalytics.bind(tripController));

/**
 * @route   GET /api/trips/:id
 * @desc    Get trip details
 * @access  Private
 */
router.get("/:id", tripController.getTripById.bind(tripController));

/**
 * @route   PUT /api/trips/:id/rate
 * @desc    Rate a trip
 * @access  Private
 * @body    { rating: number } (1-5)
 */
router.put("/:id/rate", tripController.rateTrip.bind(tripController));

export default router;
