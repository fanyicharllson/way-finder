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
  trafficLevel?: "low" | "moderate" | "high";
  weatherImpact?: "low" | "moderate" | "high";
  // Dynamic pricing details
  pricingBreakdown?: {
    baseFare: number;
    distanceCost: number;
    surgeAmount: number;
    weatherAmount: number;
    trafficAmount: number;
  };
  appliedMultipliers?: {
    surge?: number;
    weather?: number;
    traffic?: number;
  };
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
  // NEW: Context information for UI enhancements
  context?: {
    weather?: {
      temperature: number; // Celsius
      condition: "clear" | "rain" | "heavy_rain" | "storm";
      description: string; // "partly cloudy", "light rain"
      humidity?: number;
      windSpeed?: number;
      feelsLike?: number;
      location: string; // Location name for the weather
    };
    pricing?: {
      trafficLevel: "low" | "moderate" | "high";
      trafficDescription: string; // "Light traffic" or "Rush hour"
      isSurgeActive: boolean;
      surgeReason?: string; // "Morning rush hour" or "Evening rush"
      timeOfDay: "morning" | "afternoon" | "evening" | "night";
      timestamp: Date;
    };
    savings?: {
      hasSavings: boolean;
      message?: string; // "You're saving 25% by traveling off-peak"
      peakPrice?: number; // What it would cost at peak time
      currentPrice?: number;
      savingsAmount?: number;
    };
    budget?: {
      isExceeded: boolean;
      userMaxBudget: number;
      cheapestRoutePrice: number;
      message?: string;
    };
  };
  message?: string;
}

// NOTE: TransportConfig and TRANSPORT_CONFIGS removed
// Pricing is now dynamically fetched from database via PricingService
// See: backend/src/services/pricing.service.ts
// Database tables: TransportPricing, SurgePricingRule, WeatherPricingRule

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