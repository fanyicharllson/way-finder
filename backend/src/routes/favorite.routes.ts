import { Router } from "express";
import { favoriteController } from "../controllers/favorite.controller";

const router = Router();

/**
 * @route   GET /api/favorites
 * @desc    Get favorite routes
 * @access  Private
 */
router.get(
  "/",
  favoriteController.getFavorites.bind(favoriteController)
);

/**
 * @route   POST /api/favorites
 * @desc    Add route to favorites
 * @access  Private
 */
router.post(
  "/",
  favoriteController.addFavorite.bind(favoriteController)
);

/**
 * @route   POST /api/favorites/toggle
 * @desc    Toggle favorite (add/remove)
 * @access  Private
 */
router.post(
  "/toggle",
  favoriteController.toggleFavorite.bind(favoriteController)
);

/**
 * @route   PUT /api/favorites/:id
 * @desc    Update favorite
 * @access  Private
 */
router.put(
  "/:id",
  favoriteController.updateFavorite.bind(favoriteController)
);

/**
 * @route   DELETE /api/favorites/:id
 * @desc    Remove from favorites
 * @access  Private
 */
router.delete(
  "/:id",
  favoriteController.removeFavorite.bind(favoriteController)
);

export default router;
