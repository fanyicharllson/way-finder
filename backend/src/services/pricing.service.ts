import { TransportMode } from "../types/route.type";
import { prisma } from "../config/database";
import { Logger } from "../utils/logger.util";

export interface PricingContext {
  mode: TransportMode;
  distanceKm: number;
  departureTime?: Date;
  weatherCondition?: "clear" | "rain" | "heavy_rain" | "storm";
  trafficLevel?: "low" | "moderate" | "high";
}

export interface PricingResult {
  baseCost: number;
  finalCost: number;
  multipliers: {
    surge?: number;
    weather?: number;
    traffic?: number;
  };
  breakdown: {
    baseFare: number;
    distanceCost: number;
    surgeAmount: number;
    weatherAmount: number;
    trafficAmount: number;
  };
}

export class PricingService {
  /**
   * Calculate dynamic price based on multiple factors
   */
  async calculatePrice(context: PricingContext): Promise<PricingResult> {
    // 1. Get base pricing from database
    const config = await this.getTransportPricing(context.mode);
    if (!config) {
      throw new Error(`Pricing config not found for mode: ${context.mode}`);
    }

    // 2. Calculate base cost
    const baseFare = config.baseFare;
    const distanceCost = context.distanceKm * config.costPerKm;
    const baseCost = baseFare + distanceCost;

    // 3. Apply surge pricing (time-based)
    const surgeMultiplier = await this.getSurgeMultiplier(
      context.mode,
      context.departureTime || new Date()
    );

    // 4. Apply weather multiplier
    const weatherMultiplier = await this.getWeatherMultiplier(
      context.mode,
      context.weatherCondition || "clear"
    );

    // 5. Apply traffic multiplier
    const trafficMultiplier = await this.getTrafficMultiplier(
      context.trafficLevel || "low"
    );

    // 6. Calculate final cost
    const totalMultiplier = surgeMultiplier * weatherMultiplier * trafficMultiplier;
    const additionalCost = baseCost * (totalMultiplier - 1);
    const finalCost = baseCost + additionalCost;

    return {
      baseCost,
      finalCost: Math.round(finalCost),
      multipliers: {
        surge: surgeMultiplier !== 1 ? surgeMultiplier : undefined,
        weather: weatherMultiplier !== 1 ? weatherMultiplier : undefined,
        traffic: trafficMultiplier !== 1 ? trafficMultiplier : undefined,
      },
      breakdown: {
        baseFare,
        distanceCost,
        surgeAmount: Math.round(baseCost * (surgeMultiplier - 1)),
        weatherAmount: Math.round(baseCost * (weatherMultiplier - 1)),
        trafficAmount: Math.round(baseCost * (trafficMultiplier - 1)),
      },
    };
  }

  /**
   * Get transport pricing configuration from database
   */
  private async getTransportPricing(mode: TransportMode) {
    return prisma.transportPricing.findUnique({
      where: { mode, isActive: true },
    });
  }

  /**
   * Get surge pricing multiplier based on time
   */
  private async getSurgeMultiplier(
    mode: TransportMode,
    time: Date
  ): Promise<number> {
    const dayOfWeek = time.getDay();
    const hour = time.getHours();

    const rule = await prisma.surgePricingRule.findFirst({
      where: {
        mode,
        dayOfWeek,
        startHour: { lte: hour },
        endHour: { gte: hour },
        isActive: true,
      },
      orderBy: { multiplier: "desc" }, // Get highest multiplier if multiple match
    });

    return rule?.multiplier || 1.0;
  }

  /**
   * Get weather-based multiplier
   */
  private async getWeatherMultiplier(
    mode: TransportMode,
    condition: string
  ): Promise<number> {
    const rule = await prisma.weatherPricingRule.findFirst({
      where: {
        mode,
        weatherCondition: condition,
        isActive: true,
      },
    });

    return rule?.multiplier || 1.0;
  }

  /**
   * Get traffic-based multiplier from database
   */
  private async getTrafficMultiplier(level: "low" | "moderate" | "high"): Promise<number> {
    // For now, return default multipliers
    // In Phase 2, can fetch from TrafficPricingRule table
    const multipliers = {
      low: 1.0,
      moderate: 1.1,
      high: 1.25,
    };
    return multipliers[level];
  }

  /**
   * Bulk calculate prices for multiple transport modes
   */
  async calculatePricesForAllModes(
    modes: TransportMode[],
    distanceKm: number,
    departureTime?: Date,
    weatherCondition?: string,
    trafficLevel?: "low" | "moderate" | "high"
  ): Promise<Map<TransportMode, PricingResult>> {
    const results = new Map<TransportMode, PricingResult>();

    for (const mode of modes) {
      try {
        const pricing = await this.calculatePrice({
          mode,
          distanceKm,
          departureTime,
          weatherCondition: weatherCondition as any,
          trafficLevel,
        });
        results.set(mode, pricing);
      } catch (error) {
        Logger.error(`Failed to calculate price for ${mode}:`, error);
      }
    }

    return results;
  }
}

export const pricingService = new PricingService();