import { z } from "zod";

export const updatePreferenceSchema = z.object({
  maxBudget: z
    .number()
    .min(100, "Budget must be at least 100")
    .max(1000000000, "Budget is too high"),
  preferredModes: z
    .array(z.string())
    .min(1, "Select at least one transport mode"),
  avoidanceZones: z.array(z.string()),
  priorityType: z.enum(["speed", "cost", "balanced"] as const, {
    message: "Please select a priority",
  }),
});

export const createLocationSchema = z.object({
  name: z.string().min(1, "Name is required"),
  address: z.string().min(1, "Address is required"),
  latitude: z.number().min(-90).max(90),
  longitude: z.number().min(-180).max(180),
  isFavorite: z.boolean().optional(),
});

export const updateLocationSchema = z.object({
  name: z.string().min(1).optional(),
  address: z.string().min(1).optional(),
  latitude: z.number().min(-90).max(90).optional(),
  longitude: z.number().min(-180).max(180).optional(),
  isFavorite: z.boolean().optional(),
});

export type UpdatePreferenceDTO = z.infer<typeof updatePreferenceSchema>;
export type CreateLocationDTO = z.infer<typeof createLocationSchema>;
export type UpdateLocationDTO = z.infer<typeof updateLocationSchema>;
