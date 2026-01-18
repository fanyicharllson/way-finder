/**
 * Event Topics - Centralized event constants
 * Using namespace pattern for better organization
 */
export const Events = {
  // User Events
  USER_REGISTERED: "user.registered",
  USER_LOGGED_IN: "user.logged_in",
  USER_PROFILE_UPDATED: "user.profile.updated",
  PASSWORD_RESET_REQUESTED: "user.password.reset.requested",
  PASSWORD_RESET_COMPLETED: "user.password.reset.completed",

  // Search Events
  SEARCH_SAVED: "search.saved",
  SEARCHES_CLEARED: "searches.cleared",

  // Favorite Events
  FAVORITE_ADDED: "favorite.added",
  FAVORITE_REMOVED: "favorite.removed",


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

  // Route Events
  ROUTE_SEARCH_STARTED: "route.search.started",
  ROUTE_SEARCH_COMPLETED: "route.search.completed",
  ROUTE_SEARCH_FAILED: "route.search.failed",
  PREFERENCES_FETCHED: "preferences.fetched",
  PREFERENCES_FETCH_FAILED: "preferences.fetch.failed",
  CALLING_PREFERENCE_SERVICE: "calling.preference.service",
  MAPS_API_CALLED: "maps.api.called",
  MAPS_API_SUCCESS: "maps.api.success",
  MAPS_API_FAILED: "maps.api.failed",

  // Traffic/Weather Events (Phase 2)
  TRAFFIC_UPDATE_RECEIVED: "traffic.update.received",
  WEATHER_UPDATE_RECEIVED: "weather.update.received",
  ROUTE_CONDITION_CHANGED: "route.condition.changed",

  //Analitics Events
  ANALITICS_EVENTS: "analitics.tracked",
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

export interface RouteSearchStartedPayload {
  userId: string;
  from: string;
  to: string;
  timestamp: Date;
}

export interface RouteSearchCompletedPayload {
  userId: string;
  from: string;
  to: string;
  routes: any[]; // Will be typed properly in route.types.ts
  duration: number; // ms
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

export interface RouteSearchFailedPayload {
  userId: string;
  from: string;
  to: string;
  error: string;
  timestamp: Date;
}

export interface PreferencesFetchedPayload {
  userId: string;
  preferences: any; // Will be typed properly
  hasFallback: boolean; // true if using default preferences
  timestamp: Date;
}

export interface PreferencesFetchFailedPayload {
  userId: string;
  error: string;
  usingDefaults: boolean;
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

export interface MapsApiCalledPayload {
  userId: string;
  origin: string;
  destination: string;
  timestamp: Date;
}

export interface MapsApiSuccessPayload {
  userId: string;
  origin: string;
  destination: string;
  distance: number;
  duration: number;
  timestamp: Date;
}

export interface MapsApiFailedPayload {
  userId: string;
  origin: string;
  destination: string;
  error: string;
  timestamp: Date;
}

export interface SearchSavedPayload {
  userId: string;
  fromAddress: string;
  toAddress: string;
  timestamp: Date;
}

export interface SearchesClearedPayload {
  userId: string;
  count: number;
  timestamp: Date;
}

export interface FavoriteAddedPayload {
  userId: string;
  favoriteId: string;
  name: string;
  timestamp: Date;
}

export interface FavoriteRemovedPayload {
  userId: string;
  favoriteId: string;
  timestamp: Date;
}

export interface PasswordResetRequestedPayload {
  userId: string;
  email: string;
  name: string;
  code: string;
  expiresAt: Date;
  timestamp: Date;
}

export interface PasswordResetCompletedPayload {
  userId: string;
  email: string;
  timestamp: Date;
}
