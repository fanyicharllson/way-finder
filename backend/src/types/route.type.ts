/**
 * Route-related type definitions
 */

export enum TransportMode {
  BUS = "bus",
  MOTO = "moto",
  TAXI = "taxi",
  WALKING = "walking",
}

export enum OptimizationType {
  FASTEST = "fastest",
  CHEAPEST = "cheapest",
  BALANCED = "balanced",
}

export interface LocationInput {
  address?: string;
  lat?: number;
  lng?: number;
}

export interface RouteSearchRequest {
  from: LocationInput;
  to: LocationInput;
  departureTime?: string; // ISO 8601 format (for Phase 2 traffic prediction)
}

export interface GoogleMapsDirectionsResult {
  distance: number; // meters
  duration: number; // seconds
  polyline: string; // encoded polyline
  steps: GoogleMapsStep[];
  bounds: {
    northeast: { lat: number; lng: number };
    southwest: { lat: number; lng: number };
  };
}

export interface GoogleMapsStep {
  distance: number; // meters
  duration: number; // seconds
  startLocation: { lat: number; lng: number };
  endLocation: { lat: number; lng: number };
  instructions: string;
  travelMode: string;
}

export interface RouteOption {
  id: string; // unique identifier for this route option
  mode: TransportMode;
  cost: number; // XAF (Central African Franc)
  duration: number; // minutes
  distance: number; // kilometers
  polyline: string; // encoded polyline for map rendering
  steps: RouteStep[];
  recommendation?: RecommendationBadge; // "best-value", "fastest", "cheapest"
  trafficLevel?: "low" | "moderate" | "high"; // Phase 2
  weatherImpact?: "low" | "moderate" | "high"; // Phase 2
}

export interface RouteStep {
  instruction: string;
  distance: number; // meters
  duration: number; // seconds
  startLocation: { lat: number; lng: number };
  endLocation: { lat: number; lng: number };
}

export type RecommendationBadge =
  | "best-value"
  | "fastest"
  | "cheapest"
  | "recommended";

export interface RouteSearchResponse {
  success: boolean;
  routes: RouteOption[];
  origin: {
    address: string;
    coordinates: { lat: number; lng: number };
  };
  destination: {
    address: string;
    coordinates: { lat: number; lng: number };
  };
  userPreferences?: {
    priorityType: OptimizationType;
    maxBudget: number;
    preferredModes: TransportMode[];
  };
  message?: string;
}

/**
 * Transport Mode Configuration
 * Used by Factory Pattern to create transport calculators
 */
export interface TransportConfig {
  mode: TransportMode;
  baseFare: number; // XAF
  costPerKm: number; // XAF per kilometer
  averageSpeed: number; // km/h
  availability: {
    minDistance: number; // km (e.g., walking not viable for >5km)
    maxDistance?: number; // km (optional)
  };
  comfortLevel: number; // 1-5 (used in balanced strategy)
  weatherSensitive: boolean; // true for moto, false for bus/taxi
}

/**
 * Default transport configurations for Yaoundé/Cameroon
 * These can be moved to database later for dynamic pricing
 */
/**
 * Realistic transport configurations for Cameroon (Yaoundé/Douala routes)
 * Based on typical inter-city travel costs
 */
export const TRANSPORT_CONFIGS: Record<TransportMode, TransportConfig> = {
  [TransportMode.BUS]: {
    mode: TransportMode.BUS,
    baseFare: 1000, // XAF - Base ticket price
    costPerKm: 8, // XAF - ~8 XAF per km (2000 XAF for 250km = realistic)
    averageSpeed: 50, // km/h (highway speed, accounting for stops)
    availability: {
      minDistance: 10, // Not worth for <10km
    },
    comfortLevel: 3,
    weatherSensitive: false,
  },
  [TransportMode.MOTO]: {
    mode: TransportMode.MOTO,
    baseFare: 500, // XAF
    costPerKm: 20, // XAF - More expensive per km than bus
    averageSpeed: 60, // km/h (faster on highway)
    availability: {
      minDistance: 5,
      maxDistance: 100, // Not practical for very long distances (>100km)
    },
    comfortLevel: 2,
    weatherSensitive: true, // Affected by rain
  },
  [TransportMode.TAXI]: {
    mode: TransportMode.TAXI,
    baseFare: 2000, // XAF - Higher base fare
    costPerKm: 25, // XAF - Most expensive option
    averageSpeed: 55, // km/h
    availability: {
      minDistance: 5,
    },
    comfortLevel: 5,
    weatherSensitive: false,
  },
  [TransportMode.WALKING]: {
    mode: TransportMode.WALKING,
    baseFare: 0, // Free
    costPerKm: 0,
    averageSpeed: 5, // km/h
    availability: {
      minDistance: 0,
      maxDistance: 10, // Not practical for >10km
    },
    comfortLevel: 3,
    weatherSensitive: true, // Affected by rain/heat
  },
};

/**
 * User Preferences Interface (from database)
 */
export interface UserPreferences {
  maxBudget: number;
  preferredModes: TransportMode[];
  avoidanceZones: string[]; // Array of area names to avoid (Phase 2)
  priorityType: OptimizationType;
  isComplete: boolean;
}

/**
 * Default preferences (fallback if user has none or fetch fails)
 */
export const DEFAULT_PREFERENCES: UserPreferences = {
  maxBudget: 10000, // XAF (very high, no real limit)
  preferredModes: [
    TransportMode.BUS,
    TransportMode.MOTO,
    TransportMode.TAXI,
    TransportMode.WALKING,
  ],
  avoidanceZones: [],
  priorityType: OptimizationType.BALANCED,
  isComplete: false,
};