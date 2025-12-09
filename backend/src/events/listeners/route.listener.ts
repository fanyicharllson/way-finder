import { eventBus } from "../eventBus";
import {
  Events,
  RouteSearchStartedPayload,
  RouteSearchCompletedPayload,
  RouteSearchFailedPayload,
  PreferencesFetchedPayload,
  PreferencesFetchFailedPayload,
  MapsApiCalledPayload,
  MapsApiSuccessPayload,
  MapsApiFailedPayload,
} from "../eventTypes";

/**
 * Route Search Started Event Listener
 */
eventBus.onEvent<RouteSearchStartedPayload>(
  Events.ROUTE_SEARCH_STARTED,
  async (data) => {
    console.log(`🔍 Route search started for user: ${data.userId}`);
    console.log(`   From: ${data.from} → To: ${data.to}`);

    // Future: Track analytics, log to monitoring service
  }
);

/**
 * Route Search Completed Event Listener
 */
eventBus.onEvent<RouteSearchCompletedPayload>(
  Events.ROUTE_SEARCH_COMPLETED,
  async (data) => {
    console.log(`✅ Route search completed for user: ${data.userId}`);
    console.log(`   Found ${data.routes.length} route options`);
    console.log(`   Duration: ${data.duration}ms`);

    // Future:
    // - Send analytics to tracking service
    // - Cache popular routes
    // - Update user's search history
    // - Send push notification with results (if app is in background)
  }
);

/**
 * Route Search Failed Event Listener
 */
eventBus.onEvent<RouteSearchFailedPayload>(
  Events.ROUTE_SEARCH_FAILED,
  async (data) => {
    console.error(`❌ Route search failed for user: ${data.userId}`);
    console.error(`   Error: ${data.error}`);

    // Future:
    // - Send to error tracking service (Sentry)
    // - Alert admins if critical
    // - Log for debugging
  }
);

/**
 * Preferences Fetched Event Listener
 */
eventBus.onEvent<PreferencesFetchedPayload>(
  Events.PREFERENCES_FETCHED,
  async (data) => {
    if (data.hasFallback) {
      console.log(`⚠️ User ${data.userId} has no preferences, using defaults`);
      // Future: Prompt user to set preferences (send push notification)
    } else {
      console.log(`✅ Preferences fetched for user: ${data.userId}`);
    }
  }
);

/**
 * Preferences Fetch Failed Event Listener
 */
eventBus.onEvent<PreferencesFetchFailedPayload>(
  Events.PREFERENCES_FETCH_FAILED,
  async (data) => {
    console.error(`❌ Failed to fetch preferences for user: ${data.userId}`);
    console.error(`   Error: ${data.error}`);
    console.log(`   Using default preferences instead`);

    // Future:
    // - Send alert to monitoring service
    // - Check database health
    // - Retry mechanism
  }
);

/**
 * Maps API Called Event Listener
 */
eventBus.onEvent<MapsApiCalledPayload>(Events.MAPS_API_CALLED, async (data) => {
  console.log(`🗺️ Google Maps API called for user: ${data.userId}`);
  console.log(`   Origin: ${data.origin} → Destination: ${data.destination}`);

  // Future: Track API usage for billing/quota management
});

/**
 * Maps API Success Event Listener
 */
eventBus.onEvent<MapsApiSuccessPayload>(
  Events.MAPS_API_SUCCESS,
  async (data) => {
    console.log(`✅ Google Maps API success`);
    console.log(`   Distance: ${(data.distance / 1000).toFixed(2)}km`);
    console.log(`   Duration: ${Math.round(data.duration / 60)}min`);

    // Future:
    // - Cache popular routes to reduce API calls
    // - Track API usage metrics
  }
);

/**
 * Maps API Failed Event Listener
 */
eventBus.onEvent<MapsApiFailedPayload>(Events.MAPS_API_FAILED, async (data) => {
  console.error(`❌ Google Maps API failed`);
  console.error(`   Error: ${data.error}`);

  // Future:
  // - Send to error tracking
  // - Check API quota
  // - Fallback to cached routes if available
  // - Alert admins if quota exceeded
});

console.log("📡 Route event listeners registered");
