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

// Public autocomplete route 
router.get("/search/suggestions", (req, res) =>
  locationCOntroller.autocompleteLocation(req, res)
);

// Protect all location routes
router.use(authMiddleware);
// Locations routes
router.get("/", (req, res) =>
  locationCOntroller.getLocations(req, res)
);

router.get("/favorites", (req, res) =>
  locationCOntroller.getFavorites(req, res)
);

router.get("/:id", (req, res) =>
  locationCOntroller.getLocationById(req, res)
);

router.post("/", validate(createLocationSchema), (req, res) =>
  locationCOntroller.createLocation(req, res)
);

router.put("/:id", validate(updateLocationSchema), (req, res) =>
  locationCOntroller.updateLocation(req, res)
);

router.delete("/:id", (req, res) =>
  locationCOntroller.deleteLocation(req, res)
);

export default router;
