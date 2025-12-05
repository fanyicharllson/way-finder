/**
 * Event Names - Centralized event constants
 * Using namespace pattern for better organization
 */
export const Events = {
  // User Events
  USER_REGISTERED: "user.registered",
  USER_LOGGED_IN: "user.logged_in",
  USER_PROFILE_UPDATED: "user.profile.updated",

  // Preference Events
  PREFERENCE_CREATED: "preference.created",
  PREFERENCE_UPDATED: "preference.updated",

  // Location Events
  LOCATION_SAVED: "location.saved",
  LOCATION_FAVORITED: "location.favorited",

  // Trip Events
  TRIP_STARTED: "trip.started",
  TRIP_COMPLETED: "trip.completed",
  TRIP_RATED: "trip.rated",
} as const;

/**
 * Event Payload Interfaces
 * Define the structure of data passed with each event
 */

export interface UserRegisteredPayload {
  userId: string;
  email: string;
  name: string;
  timestamp: Date;
}

export interface UserLoggedInPayload {
  userId: string;
  email: string;
  timestamp: Date;
}

export interface PreferenceCreatedPayload {
  userId: string;
  preferenceId: string;
  maxBudget: number;
  preferredModes: string[];
  timestamp: Date;
}

export interface PreferenceUpdatedPayload {
  userId: string;
  preferenceId: string;
  changes: {
    maxBudget?: number;
    preferredModes?: string[];
    avoidanceZones?: string[];
    priorityType?: string;
  };
  timestamp: Date;
}

export interface LocationSavedPayload {
  userId: string;
  locationId: string;
  name: string;
  address: string;
  isFavorite: boolean;
  timestamp: Date;
}

export interface TripCompletedPayload {
  userId: string;
  tripId: string;
  origin: string;
  destination: string;
  transportMode: string;
  actualCost: number;
  actualTime: number;
  distance: number;
  timestamp: Date;
}

export interface TripRatedPayload {
  userId: string;
  tripId: string;
  rating: number;
  timestamp: Date;
}
