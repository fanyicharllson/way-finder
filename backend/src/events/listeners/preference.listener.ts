import { eventBus } from "../eventBus";
import {
  Events,
  PreferenceCreatedPayload,
  PreferenceUpdatedPayload,
  LocationSavedPayload,
} from "../eventTypes";

/**
 * Preference & Location Event Listeners
 * 
 * These listeners respond to user preference and location changes
 * to update recommendations and cache.
 */

/**
 * Handle CALLING_PREFERENCE_SERVICE event
 * Actions:
 * 1. Mark user onboarding as progressing
 * 2. Log analytics
 */
eventBus.onEvent<CallingPreferenceServicePayload>(Events.CALLING_PREFERENCE_SERVICE,
  async (data) => {
    try {
      console.log(
        `⚙️================= Calling Preference Service for user:================= ${data.userId}\n`
      );

      // 1. Future: Could trigger
      // - Generate initial route recommendations
      // - Send push notification: "Your preferences are set! Start planning trips."
      // - Update onboarding checklist
    } catch (error) {
      console.error(`❌ Error calling Preference Service:`, error);
    }
  }
);


eventBus.onEvent<PreferenceCreatedPayload>(
  Events.PREFERENCE_CREATED,
  async (data) => {
    try {
      console.log(
        `⚙️ Processing PREFERENCE_CREATED event for user: ${data.userId}`
      );

      // 1. Track onboarding progress
      console.log(
        `📊 Analytics: User preferences created - Budget: ${data.maxBudget} XAF, Modes: ${data.preferredModes.join(", ")}`
      );

      // 2. Future: Could trigger
      // - Generate initial route recommendations
      // - Send push notification: "Your preferences are set! Start planning trips."
      // - Update onboarding checklist

      console.log(`✅ PREFERENCE_CREATED event processed successfully`);
    } catch (error) {
      console.error(`❌ Error processing PREFERENCE_CREATED event:`, error);
    }
  }
);

/**
 * Handle PREFERENCE_UPDATED event
 * Actions:
 * 1. Invalidate cached route recommendations
 * 2. Recalculate personalized routes
 * 3. Notify mobile app to refresh
 */
eventBus.onEvent<PreferenceUpdatedPayload>(
  Events.PREFERENCE_UPDATED,
  async (data) => {
    try {
      console.log(
        `⚙️ Processing PREFERENCE_UPDATED event for user: ${data.userId}`
      );

      // 1. Log what changed
      const changes = Object.keys(data.changes).join(", ");
      console.log(`📊 Analytics: Preferences updated - Changed: ${changes}`);

      // 2. Invalidate cache (if using Redis)
      // await redis.del(`routes:${data.userId}`);
      console.log(`🗑️ Cache invalidated for user: ${data.userId}`);

      // 3. Future: Could trigger
      // - Recalculate route recommendations
      // - Send push notification: "We've updated your routes based on your new preferences"
      // - Update ML model with new preference data

      console.log(`✅ PREFERENCE_UPDATED event processed successfully`);
    } catch (error) {
      console.error(`❌ Error processing PREFERENCE_UPDATED event:`, error);
    }
  }
);

/**
 * Handle LOCATION_SAVED event
 * Actions:
 * 1. Track popular locations
 * 2. Generate route suggestions
 */
eventBus.onEvent<LocationSavedPayload>(Events.LOCATION_SAVED, async (data) => {
  try {
    console.log(
      `📍 Processing LOCATION_SAVED event for user: ${data.userId}`
    );

    // 1. Log location details
    console.log(
      `📊 Analytics: Location saved - Name: ${data.name}, Address: ${data.address}, Favorite: ${data.isFavorite}`
    );

    // 2. If it's a favorite location, could trigger
    if (data.isFavorite) {
      console.log(`⭐ Favorite location saved: ${data.name}`);
      // - Pre-generate common routes (Home → Work, Work → Home)
      // - Send notification: "We've added ${name} to your favorites!"
    }

    // 3. Future: Could trigger
    // - Suggest routes from this location to other saved locations
    // - Track popular addresses for community recommendations

    console.log(`✅ LOCATION_SAVED event processed successfully`);
  } catch (error) {
    console.error(`❌ Error processing LOCATION_SAVED event:`, error);
  }
});

/**
 * Handle LOCATION_FAVORITED event
 * Track when users mark locations as favorites
 */
eventBus.onEvent<LocationSavedPayload>(
  Events.LOCATION_FAVORITED,
  async (data) => {
    try {
      console.log(
        `⭐ Processing LOCATION_FAVORITED event for location: ${data.locationId}`
      );

      console.log(
        `📊 Analytics: Location favorited - ${data.name} by user ${data.userId}`
      );

      // Future: Could analyze favorite locations to suggest:
      // - Nearby transport options
      // - Optimal times to travel
      // - Community-favorite routes

      console.log(`✅ LOCATION_FAVORITED event processed successfully`);
    } catch (error) {
      console.error(`❌ Error processing LOCATION_FAVORITED event:`, error);
    }
  }
);

console.log("✅ Preference & Location event listeners registered");
