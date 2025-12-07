import { Router } from "express";
import { AuthController } from "../controllers/auth.controller";
import { authMiddleware } from "../middleware/auth.middleware";
import { validate } from "../middleware/validation.middleware";
import { loginSchema, registerSchema } from "../validators/auth.validator";

const router = Router();
const authController = new AuthController();

// Public routes
router.post("/register", validate(registerSchema), (req, res) =>
authController.register(req, res)
);
router.post("/login", validate(loginSchema), (req, res) => authController.login(req, res));

// Protected routes
router.get("/me", authMiddleware, (req, res) => authController.getMe(req, res));
router.post("/logout", authMiddleware, (req, res) =>
  authController.logout(req, res)
);

export default router;
