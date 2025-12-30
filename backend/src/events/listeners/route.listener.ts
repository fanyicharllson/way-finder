import { eventBus } from "../eventBus";
import {
  Events,
  RouteSearchFailedPayload,
  MapsApiFailedPayload,
} from "../eventTypes";

/**
 * Route Event Listeners
 * 
 * Only keeping listeners that perform actual actions (error tracking).
 * Removed listeners that only console.log for memory efficiency.
 * 
 * 
 */

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
 * Maps API Failed Event Listener
 * Critical errors should be tracked even without external service
 */
eventBus.onEvent<MapsApiFailedPayload>(Events.MAPS_API_FAILED, async (data) => {
  console.error(`❌ CRITICAL: Google Maps API failed for user: ${data.userId}`);
  console.error(`   Error: ${data.error}`);
  console.error(`   Time: ${new Date().toISOString()}`);
  
  // Log to file or database for later analysis
  // This is important for debugging and monitoring API health
});

console.log("📡 Route error listeners registered (cleaned up)");
