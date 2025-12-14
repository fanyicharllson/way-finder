import { Router } from "express";
import { searchController } from "../controllers/search.controller";

const router = Router();

/**
 * RECENT SEARCHES ROUTES
 */

/**
 * @route   GET /api/searches/recent
 * @desc    Get recent searches
 * @access  Private
 */
router.get(
  "/recent",
  searchController.getRecentSearches.bind(searchController)
);

/**
 * @route   DELETE /api/searches/recent
 * @desc    Clear all recent searches
 * @access  Private
 */
router.delete(
  "/recent",
  searchController.clearRecentSearches.bind(searchController)
);

/**
 * @route   DELETE /api/searches/recent/:id
 * @desc    Delete specific search
 * @access  Private
 */
router.delete(
  "/recent/:id",
  searchController.deleteSearch.bind(searchController)
);

export default router;
