import { z } from "zod";

/**
 * Location input validation
 * Must have either coordinates OR address
 */
const locationInputSchema = z
  .object({
    address: z.string().optional(),
    lat: z.number().optional(),
    lng: z.number().optional(),
  })
  .refine(
    (data) => {
      // Must have either (lat AND lng) OR address
      const hasCoordinates = data.lat !== undefined && data.lng !== undefined;
      const hasAddress = data.address !== undefined && data.address.length > 0;
      return hasCoordinates || hasAddress;
    },
    {
      message: "Must provide either coordinates (lat, lng) or address",
    }
  )
  .refine(
    (data) => {
      // If lat is provided, lng must be provided (and vice versa)
      if (data.lat !== undefined || data.lng !== undefined) {
        return data.lat !== undefined && data.lng !== undefined;
      }
      return true;
    },
    {
      message: "Both lat and lng must be provided together",
    }
  );

/**
 * Route search request validation
 */
export const routeSearchSchema = z.object({
  from: locationInputSchema,
  to: locationInputSchema,
  departureTime: z.string().datetime().optional(), // ISO 8601 format
});

/**
 * Route comparison validation (Phase 2)
 */
export const routeCompareSchema = z.object({
  routeIds: z
    .array(z.string().uuid())
    .min(2, "Must provide at least 2 route IDs")
    .max(10, "Cannot compare more than 10 routes"),
});

/**
 * Type exports for TypeScript
 */
export type RouteSearchInput = z.infer<typeof routeSearchSchema>;
export type RouteCompareInput = z.infer<typeof routeCompareSchema>;
