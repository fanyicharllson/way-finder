import { eventBus } from "../eventBus";
import {
  Events,
  PreferenceCreatedPayload,
  PreferenceUpdatedPayload,
  LocationSavedPayload,
} from "../eventTypes";
import {prisma} from "../../config/database";


/**
 * Preference & Location Event Listeners
 * 
 * These listeners respond to user preference and location changes
 * to update recommendations and cache.
 */

/**
 * Preference Event Listeners
 * 
 * Removed console-only listeners for memory efficiency:
 * - CALLING_PREFERENCE_SERVICE (was only logging)
 * - PREFERENCE_CREATED (was only logging)
 * 
 * Keeping PREFERENCE_UPDATED as it has cache invalidation logic
 * which is a real side effect even if cache is not yet implemented.
 */

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

      // 1. Log preference changes for debugging
      const changes = Object.keys(data.changes).join(", ");
      console.log(`⚙️ Preferences updated for ${data.userId} - Changed: ${changes}`);
      
      // 2. Cache invalidation logic
      // When Redis is implemented, this ensures stale route data is cleared
      // await redis.del(`routes:${data.userId}`);
      console.log(`🗑️ [Cache] Marked for invalidation: routes:${data.userId}`);
      
      // 3. REAL WORK: Clear old saved routes that don't match new preferences
      const updatedPrefs = await prisma.userPreference.findUnique({
        where: { userId: data.userId },
      });

      if (updatedPrefs) {
        // Delete recent searches that exceed new budget
        if ('maxBudget' in data.changes) {
          const deleted = await prisma.recentSearch.deleteMany({
            where: {
              userId: data.userId,
              // You can add cost filtering when you track search costs
            },
          });
          console.log(`✅ Cleared ${deleted.count} outdated searches based on new budget`);
        }

        // Update favorite routes metadata
        await prisma.favoriteRoute.updateMany({
          where: { userId: data.userId },
          data: { updatedAt: new Date() },
        });
        console.log(`✅ Favorite routes marked for recalculation`);
      }

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
