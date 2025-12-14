import { prisma } from "../config/database";
import { eventBus } from "../events/eventBus";
import { Events } from "../events/eventTypes";

/**
 * Trip Service
 * Manages trip history and analytics
 */
export class TripService {
  /**
   * Save a completed trip
   */
  async saveTrip(data: {
    userId: string;
    origin: string;
    destination: string;
    transportMode: string;
    actualCost: number;
    actualTime: number;
    distance: number;
    startTime: Date;
    endTime?: Date;
  }) {
    const trip = await prisma.trip.create({
      data: {
        userId: data.userId,
        origin: data.origin,
        destination: data.destination,
        transportMode: data.transportMode,
        actualCost: data.actualCost,
        actualTime: data.actualTime,
        distance: data.distance,
        startTime: data.startTime,
        endTime: data.endTime || new Date(),
      },
    });

    // Emit event
    eventBus.emitEvent(Events.TRIP_COMPLETED, {
      userId: data.userId,
      tripId: trip.id,
      mode: data.transportMode,
      cost: data.actualCost,
      timestamp: new Date(),
    });

    return trip;
  }

  /**
   * Get user's trip history
   */
  async getTripHistory(
    userId: string,
    options?: {
      limit?: number;
      offset?: number;
      startDate?: Date;
      endDate?: Date;
    }
  ) {
    const where: any = { userId };

    if (options?.startDate || options?.endDate) {
      where.startTime = {};
      if (options.startDate) where.startTime.gte = options.startDate;
      if (options.endDate) where.startTime.lte = options.endDate;
    }

    const trips = await prisma.trip.findMany({
      where,
      orderBy: { startTime: "desc" },
      take: options?.limit || 50,
      skip: options?.offset || 0,
      cacheStrategy: { ttl: 60, swr: 30 },
    });

    return trips;
  }

  /**
   * Get trip by ID
   */
  async getTripById(tripId: string, userId: string) {
    const trip = await prisma.trip.findFirst({
      where: { id: tripId, userId },
      cacheStrategy: { ttl: 300, swr: 60 },
    });

    return trip;
  }

  /**
   * Rate a trip
   */
  async rateTrip(tripId: string, userId: string, rating: number) {
    if (rating < 1 || rating > 5) {
      throw new Error("Rating must be between 1 and 5");
    }

    const trip = await prisma.trip.updateMany({
      where: { id: tripId, userId },
      data: { rating },
    });

    if (trip.count === 0) {
      throw new Error("Trip not found");
    }

    // Emit event
    eventBus.emitEvent(Events.TRIP_RATED, {
      userId,
      tripId,
      rating,
      timestamp: new Date(),
    });

    return { success: true, rating };
  }

  /**
   * Get user analytics
   */
  async getUserAnalytics(userId: string, month?: Date) {
    const startDate = month
      ? new Date(month.getFullYear(), month.getMonth(), 1)
      : new Date(new Date().getFullYear(), new Date().getMonth(), 1);

    const endDate = new Date(startDate);
    endDate.setMonth(endDate.getMonth() + 1);

    const trips = await prisma.trip.findMany({
      where: {
        userId,
        startTime: {
          gte: startDate,
          lt: endDate,
        },
      },
    });

    // Calculate analytics
    const totalSpent = trips.reduce((sum, trip) => sum + trip.actualCost, 0);
    const totalTrips = trips.length;
    const totalDistance = trips.reduce((sum, trip) => sum + trip.distance, 0);

    // Group by transport mode
    const modeBreakdown = trips.reduce((acc, trip) => {
      acc[trip.transportMode] = (acc[trip.transportMode] || 0) + 1;
      return acc;
    }, {} as Record<string, number>);

    const mostUsedMode =
      Object.entries(modeBreakdown).sort((a, b) => b[1] - a[1])[0]?.[0] ||
      "none";

    // Calculate savings (comparing to most expensive option - taxi)
    const taxiCostEstimate = totalDistance * 25 + totalTrips * 2000; // Taxi formula
    const savings = Math.max(0, taxiCostEstimate - totalSpent);

    return {
      month: startDate.toISOString().slice(0, 7), // "YYYY-MM"
      totalSpent,
      totalTrips,
      totalDistance: parseFloat(totalDistance.toFixed(2)),
      mostUsedMode,
      modeBreakdown,
      estimatedSavings: Math.round(savings),
      averageCostPerTrip:
        totalTrips > 0 ? Math.round(totalSpent / totalTrips) : 0,
    };
  }
}

export const tripService = new TripService();
