import { eventBus } from "../eventBus";
import { Events, TripCompletedPayload, TripRatedPayload } from "../eventTypes";
import {
  sendTripSummaryEmail,
  sendMilestoneAchievementEmail,
  sendLowRatingFollowUpEmail,
  sendHighRatingCelebrationEmail,
} from "../../services/email.service";
import { prisma } from "../../config/database";
import { Logger } from "../../utils/logger.util";

/**
 * Trip Event Listeners
 *
 * These listeners handle trip-related events and perform analytics,
 * notifications, and data processing without coupling services.
 */

/**
 * Handle TRIP_COMPLETED event
 * Actions:
 * 1. Send trip summary email
 * 2. Update user statistics (total trips, total spent, etc.)
 * 3. Calculate savings compared to other transport modes
 * 4. Update location popularity
 */
eventBus.onEvent<TripCompletedPayload>(Events.TRIP_COMPLETED, async (data) => {
  try {
    Logger.info(`🚗 Processing TRIP_COMPLETED event for trip: ${data.tripId}`);

    // 1. Get user details for email
    const user = await prisma.user.findUnique({
      where: { id: data.userId },
    });

    if (user) {
      // Send trip summary email
      await sendTripSummaryEmail(user.email, user.name, {
        origin: data.origin,
        destination: data.destination,
        transportMode: data.transportMode,
        actualCost: data.actualCost,
        actualTime: data.actualTime,
        distance: data.distance,
      });
    }

    // 2. REAL WORK: Update user statistics in database
    let stats: any = null;
    try {
      stats = await prisma.userStats.upsert({
        where: { userId: data.userId },
        update: {
          totalTrips: { increment: 1 },
          totalSpent: { increment: data.actualCost },
          totalDistance: { increment: data.distance },
          totalTime: { increment: data.actualTime },
          updatedAt: new Date(),
        },
        create: {
          userId: data.userId,
          totalTrips: 1,
          totalSpent: data.actualCost,
          totalDistance: data.distance,
          totalTime: data.actualTime,
        },
      });
      Logger.info(
        `✅ User stats updated: ${stats.totalTrips} trips, ${stats.totalSpent} XAF spent`
      );
    } catch (error) {
      Logger.warn(
        `⚠️ UserStats table not found. Run 'npx prisma db push' to create it.`
      );
    }

    // 3. Calculate potential savings
    // If they took moto, calculate how much they would have spent on taxi
    const savingsInfo = calculatePotentialSavings(
      data.transportMode,
      data.actualCost
    );
    Logger.info(`💰 Potential savings for this trip: ${savingsInfo.saved} XAF`);

    // 4. REAL WORK: Track route popularity for recommendations
    try {
      await prisma.routePopularity.upsert({
        where: {
          origin_destination_transportMode: {
            origin: data.origin,
            destination: data.destination,
            transportMode: data.transportMode,
          },
        },
        update: {
          count: { increment: 1 },
          totalCost: { increment: data.actualCost },
          totalTime: { increment: data.actualTime },
          totalDistance: { increment: data.distance },
          lastUsed: new Date(),
        },
        create: {
          origin: data.origin,
          destination: data.destination,
          transportMode: data.transportMode,
          count: 1,
          totalCost: data.actualCost,
          totalTime: data.actualTime,
          totalDistance: data.distance,
          lastUsed: new Date(),
        },
      });
      Logger.info(
        `✅ Route popularity tracked: ${data.origin} → ${data.destination} via ${data.transportMode}`
      );
    } catch (error) {
      Logger.warn(
        `⚠️ RoutePopularity table not found. Run 'npx prisma db push' to create it.`
      );
    }

    // 5. Check for milestones and achievements
    if (
      stats &&
      (stats.totalTrips === 10 ||
        stats.totalTrips === 50 ||
        stats.totalTrips === 100)
    ) {
      Logger.info(`🎉 MILESTONE: User completed ${stats.totalTrips} trips!`);

      // Send achievement email
      if (user) {
        await sendMilestoneAchievementEmail(
          user.email,
          user.name,
          stats.totalTrips
        );
        Logger.info(
          `✅ Milestone achievement email sent for ${stats.totalTrips} trips`
        );
      }
    }

    Logger.info(`✅ TRIP_COMPLETED event processed successfully`);
  } catch (error) {
    Logger.error(`❌ Error processing TRIP_COMPLETED event:`, error);
  }
});

/**
 * Handle TRIP_RATED event
 * Actions:
 * 1. Update transport mode quality scores
 * 2. Improve route recommendations
 * 3. Track user satisfaction
 */
eventBus.onEvent<TripRatedPayload>(Events.TRIP_RATED, async (data) => {
  try {
    Logger.info(`⭐ Processing TRIP_RATED event for trip: ${data.tripId}`);

    // 1. Get trip details
    const trip = await prisma.trip.findUnique({
      where: { id: data.tripId },
    });

    if (trip) {
      // 2. Track ratings by transport mode
      Logger.info(
        `📊 Analytics: ${trip.transportMode} rated ${data.rating}/5 stars`
      );

      // Get user for email
      const user = await prisma.user.findUnique({
        where: { id: data.userId },
      });

      // 3. If low rating, send follow-up email
      if (data.rating <= 2) {
        Logger.info(`⚠️ Low rating detected. Sending follow-up email...`);
        if (user) {
          await sendLowRatingFollowUpEmail(
            user.email,
            user.name,
            data.rating,
            trip.origin,
            trip.destination
          );
          Logger.info(`✅ Low rating follow-up email sent to`);
        }
      }

      // 4. If high rating, send celebration email
      if (data.rating >= 4) {
        Logger.info(`🎉 High rating! User satisfied with route.`);
        if (user) {
          await sendHighRatingCelebrationEmail(
            user.email,
            user.name,
            data.rating,
            trip.transportMode
          );
          Logger.info(`✅ Celebration email sent`);
        }
      }
    }

    Logger.info(`✅ TRIP_RATED event processed successfully`);
  } catch (error) {
    Logger.error(`❌ Error processing TRIP_RATED event:`, error);
  }
});

/**
 * Helper Functions
 */

function calculatePotentialSavings(
  transportMode: string,
  actualCost: number
): { saved: number; comparison: string } {
  // Simple savings calculation logic
  const prices: Record<string, number> = {
    walk: 0,
    moto: 1.0,
    bus: 0.7,
    taxi: 2.0,
  };

  const baseCost = actualCost;
  const taxiCost = baseCost * (prices.taxi / (prices[transportMode] || 1));
  const saved = taxiCost - baseCost;

  return {
    saved: Math.round(saved),
    comparison: `taxi vs ${transportMode}`,
  };
}

Logger.info("✅ Trip event listeners registered");
