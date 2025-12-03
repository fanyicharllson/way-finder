import { Router } from "express";
import { PreferenceController } from "../controllers/preference.controller";
import { authMiddleware } from "../middleware/auth.middleware";
import { validate } from "../middleware/validation.middleware";
import { updatePreferenceSchema } from "../validators/preference.validator";

const router = Router();
const preferenceController = new PreferenceController();

// All routes are protected
router.use(authMiddleware);
router.post("/preferences", validate(updatePreferenceSchema), (req, res) =>
  preferenceController.createPreferences(req, res)
);

// Preferences routes
router.get("/preferences", (req, res) =>
  preferenceController.getPreferences(req, res)
);

router.put("/preferences", validate(updatePreferenceSchema), (req, res) =>
  preferenceController.updatePreferences(req, res)
);
router.delete("/preferences", (req, res) =>
  preferenceController.deletePreferences(req, res)
);

export default router;
