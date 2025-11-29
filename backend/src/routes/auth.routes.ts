import { Router } from "express";
import { AuthController } from "../controllers/auth.controller";
import { authMiddleware } from "../middleware/auth.middleware";

const router = Router();
const authController = new AuthController();

// Public routes
router.post("/register", (req, res) => authController.register(req, res));
router.post("/login", (req, res) => authController.login(req, res));

// Protected routes
router.get("/me", authMiddleware, (req, res) => authController.getMe(req, res));
router.post("/logout", authMiddleware, (req, res) =>
  authController.logout(req, res)
);

export default router;
