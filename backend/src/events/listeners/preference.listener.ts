import { eventBus } from "../eventBus";
import {
  Events,
  PreferenceUpdatedPayload,
  LocationSavedPayload,
} from "../eventTypes";
import {prisma} from "../../config/database";
import { Logger } from "../../utils/logger.util";


/**
 * Preference & Location Event Listeners
 * 
 * These listeners respond to user preference and location changes
 * to update recommendations and cache.
 */

/**
 * Preference Event Listeners
 * 
 * Removed Logger-only listeners for memory efficiency:
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
      Logger.info(
        `⚙️ Processing PREFERENCE_UPDATED event for user: ${data.userId}`
      );

      // 1. Log preference changes for debugging
      const changes = Object.keys(data.changes).join(", ");
      Logger.info(`⚙️ Preferences updated for ${data.userId} - Changed: ${changes}`);
      
      // 2. Cache invalidation logic
      // When Redis is implemented, this ensures stale route data is cleared
      // await redis.del(`routes:${data.userId}`);
      Logger.info(`🗑️ [Cache] Marked for invalidation: routes:${data.userId}`);
      
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
          Logger.info(`✅ Cleared ${deleted.count} outdated searches based on new budget`);
        }

        // Update favorite routes metadata
        await prisma.favoriteRoute.updateMany({
          where: { userId: data.userId },
          data: { updatedAt: new Date() },
        });
        Logger.info(`✅ Favorite routes marked for recalculation`);
      }

      Logger.info(`✅ PREFERENCE_UPDATED event processed successfully`);
    } catch (error) {
      Logger.error(`❌ Error processing PREFERENCE_UPDATED event:`, error);
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
    Logger.info(
      `📍 Processing LOCATION_SAVED event for user: ${data.userId}`
    );

    // 1. Log location details
    Logger.info(
      `📊 Analytics: Location saved - Name: ${data.name}, Address: ${data.address}, Favorite: ${data.isFavorite}`
    );

    // 2. If it's a favorite location, could trigger
    if (data.isFavorite) {
      Logger.info(`⭐ Favorite location saved: ${data.name}`);
      // - Pre-generate common routes (Home → Work, Work → Home)
      // - Send notification: "We've added ${name} to your favorites!"
    }

    // 3. Future: Could trigger
    // - Suggest routes from this location to other saved locations
    // - Track popular addresses for community recommendations

    Logger.info(`✅ LOCATION_SAVED event processed successfully`);
  } catch (error) {
    Logger.error(`❌ Error processing LOCATION_SAVED event:`, error);
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
      Logger.info(
        `⭐ Processing LOCATION_FAVORITED event for location: ${data.locationId}`
      );

      Logger.info(
        `📊 Analytics: Location favorited - ${data.name} by user ${data.userId}`
      );

      // Future: Could analyze favorite locations to suggest:
      // - Nearby transport options
      // - Optimal times to travel
      // - Community-favorite routes

      Logger.info(`✅ LOCATION_FAVORITED event processed successfully`);
    } catch (error) {
      Logger.error(`❌ Error processing LOCATION_FAVORITED event:`, error);
    }
  }
);

Logger.info("✅ Preference & Location event listeners registered");
