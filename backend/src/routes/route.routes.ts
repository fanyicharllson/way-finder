import { Router } from "express";
import { routeController } from "../controllers/route.controller";
import { validate } from "../middleware/validation.middleware";
import {
  routeSearchSchema,
  routeCompareSchema,
} from "../validators/route.validators";

const router = Router();

/**
 * All route endpoints require authentication
 */

/**
 * @route   POST /api/routes/search
 * @desc    Search for routes between origin and destination
 * @access  Private (requires auth)
 * @body    { from: LocationInput, to: LocationInput, departureTime?: string }
 */
router.post(
  "/search",
  validate(routeSearchSchema),
  routeController.searchRoutes.bind(routeController)
);

/**
 * @route   GET /api/routes/:id
 * @desc    Get route details by ID (Phase 2)
 * @access  Private
 */
router.get(
  "/:id",
  routeController.getRouteById.bind(routeController)
);

/**
 * @route   POST /api/routes/compare
 * @desc    Compare multiple routes (Phase 2)
 * @access  Private
 * @body    { routeIds: string[] }
 */
router.post(
  "/compare",
  validate(routeCompareSchema),
  routeController.compareRoutes.bind(routeController)
);

export default router;
