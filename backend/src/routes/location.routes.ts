import { Router } from "express";
import { LocationController } from "../controllers/location.controller";
import { authMiddleware } from "../middleware/auth.middleware";
import {
  createLocationSchema,
  updateLocationSchema,
} from "../validators/preference.validator";
import { validate } from "../middleware/validation.middleware";

const router = Router();
const locationCOntroller = new LocationController();

// Protect aall routes
router.use(authMiddleware);
// Locations routes
router.get("/locations", (req, res) =>
  locationCOntroller.getLocations(req, res)
);

router.get("/locations/favorites", (req, res) =>
  locationCOntroller.getFavorites(req, res)
);

router.get("/locations/:id", (req, res) =>
  locationCOntroller.getLocationById(req, res)
);

router.post("/locations", validate(createLocationSchema), (req, res) =>
  locationCOntroller.createLocation(req, res)
);

router.put("/locations/:id", validate(updateLocationSchema), (req, res) =>
  locationCOntroller.updateLocation(req, res)
);

router.delete("/locations/:id", (req, res) =>
  locationCOntroller.deleteLocation(req, res)
);

export default router;
