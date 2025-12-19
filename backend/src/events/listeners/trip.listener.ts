import { eventBus } from "../eventBus";
import {
  Events,
  TripCompletedPayload,
  TripRatedPayload,
} from "../eventTypes";
import { sendTripSummaryEmail } from "../../config/email";
import {prisma} from "../../config/database";

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
eventBus.onEvent<TripCompletedPayload>(
  Events.TRIP_COMPLETED,
  async (data) => {
    try {
      console.log(
        `🚗 Processing TRIP_COMPLETED event for trip: ${data.tripId}`
      );

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

      // 2. Update user statistics (you'd add these fields to User model)
      // const stats = await prisma.userStats.upsert({
      //   where: { userId: data.userId },
      //   update: {
      //     totalTrips: { increment: 1 },
      //     totalSpent: { increment: data.actualCost },
      //     totalDistance: { increment: data.distance },
      //     totalTime: { increment: data.actualTime },
      //   },
      //   create: {
      //     userId: data.userId,
      //     totalTrips: 1,
      //     totalSpent: data.actualCost,
      //     totalDistance: data.distance,
      //     totalTime: data.actualTime,
      //   },
      // });

      // 3. Calculate potential savings
      // If they took moto, calculate how much they would have spent on taxi
      const savingsInfo = calculatePotentialSavings(
        data.transportMode,
        data.actualCost
      );
      console.log(
        `💰 Potential savings for this trip: ${savingsInfo.saved} XAF`
      );

      // 4. Track popular routes (for future route recommendations)
      console.log(
        `📊 Analytics: Trip completed - ${data.origin} → ${data.destination} via ${data.transportMode}`
      );

      // 5. Future: Could trigger
      // - Push notification: "Trip completed! You saved X XAF today"
      // - Update route recommendations
      // - Badge achievements (e.g., "10 trips milestone!")

      console.log(`✅ TRIP_COMPLETED event processed successfully`);
    } catch (error) {
      console.error(`❌ Error processing TRIP_COMPLETED event:`, error);
    }
  }
);

/**
 * Handle TRIP_RATED event
 * Actions:
 * 1. Update transport mode quality scores
 * 2. Improve route recommendations
 * 3. Track user satisfaction
 */
eventBus.onEvent<TripRatedPayload>(Events.TRIP_RATED, async (data) => {
  try {
    console.log(`⭐ Processing TRIP_RATED event for trip: ${data.tripId}`);

    // 1. Get trip details
    const trip = await prisma.trip.findUnique({
      where: { id: data.tripId },
    });

    if (trip) {
      // 2. Track ratings by transport mode
      console.log(
        `📊 Analytics: ${trip.transportMode} rated ${data.rating}/5 stars`
      );

      // 3. If low rating, could trigger:
      if (data.rating <= 2) {
        console.log(`⚠️ Low rating detected. Consider follow-up survey.`);
        // - Send feedback request email
        // - Offer alternative routes
      }

      // 4. If high rating, could trigger:
      if (data.rating >= 4) {
        console.log(`🎉 High rating! User satisfied with route.`);
        // - Ask for app store review
        // - Recommend similar routes
      }
    }

    console.log(`✅ TRIP_RATED event processed successfully`);
  } catch (error) {
    console.error(`❌ Error processing TRIP_RATED event:`, error);
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

console.log("✅ Trip event listeners registered");
