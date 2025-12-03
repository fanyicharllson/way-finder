import { z } from "zod";

export const preferencesSchema = z.object({
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

export type PreferencesFormData = z.infer<typeof preferencesSchema>;
