import { Router } from "express";
import { PreferenceController } from "../controllers/preference.controller";
import { authMiddleware } from "../middleware/auth.middleware";
import { validate } from "../middleware/validation.middleware";
import { updatePreferenceSchema } from "../validators/preference.validator";

const router = Router();
const preferenceController = new PreferenceController();

// All routes are protected (gateway also applies auth)
router.use(authMiddleware);

// Create preferences
router.post("/", validate(updatePreferenceSchema), (req, res) =>
  preferenceController.createPreferences(req, res)
);

// Get preferences
router.get("/", (req, res) => preferenceController.getPreferences(req, res));

// Update preferences
router.put("/", validate(updatePreferenceSchema), (req, res) =>
  preferenceController.updatePreferences(req, res)
);

// Delete preferences
router.delete("/", (req, res) =>
  preferenceController.deletePreferences(req, res)
);

export default router;
