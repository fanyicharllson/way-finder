import {
  TransportMode,
  GoogleMapsDirectionsResult,
  RouteOption,
  RouteStep,
} from "../types/route.type";
import { v4 as uuidv4 } from "uuid";
import { pricingService, PricingContext } from "../services/pricing.service";
import { Logger } from "../utils/logger.util";

/**
 * Abstract Transport Calculator
 * Base class for all transport mode calculators
 */
abstract class TransportCalculator {
  protected mode: TransportMode;
  protected minDistance: number;
  protected maxDistance?: number;

  constructor(mode: TransportMode, minDistance: number, maxDistance?: number) {
    this.mode = mode;
    this.minDistance = minDistance;
    this.maxDistance = maxDistance;
  }

  /**
   * Calculate route option for this transport mode using dynamic pricing
   */
  async calculate(
    mapsResult: GoogleMapsDirectionsResult,
    pricingContext?: Partial<PricingContext>
  ): Promise<RouteOption> {
    const distanceKm = mapsResult.distance / 1000; // Convert meters to km

    // Check if this mode is viable for the distance
    if (!this.isViable(distanceKm)) {
      throw new Error(
        `${this.mode} is not viable for ${distanceKm.toFixed(2)}km`
      );
    }

    // Get pricing configuration from database
    const pricingConfig = await pricingService.calculatePrice({
      mode: this.mode,
      distanceKm,
      departureTime: pricingContext?.departureTime || new Date(),
      weatherCondition: pricingContext?.weatherCondition || "clear",
      trafficLevel: pricingContext?.trafficLevel || "low",
    });

    // Calculate duration
    const duration = await this.calculateDuration(distanceKm);

    return {
      id: uuidv4(),
      mode: this.mode,
      cost: pricingConfig.finalCost,
      duration: Math.round(duration), // Round to nearest minute
      distance: parseFloat(distanceKm.toFixed(2)),
      polyline: mapsResult.polyline,
      steps: this.convertSteps(mapsResult.steps),
      pricingBreakdown: pricingConfig.breakdown,
      appliedMultipliers: pricingConfig.multipliers,
      trafficLevel: pricingContext?.trafficLevel,
    };
  }

  /**
   * Check if this transport mode is viable for the distance
   */
  protected isViable(distanceKm: number): boolean {
    if (distanceKm < this.minDistance) {
      return false;
    }

    if (this.maxDistance && distanceKm > this.maxDistance) {
      return false;
    }

    return true;
  }

  /**
   * Calculate duration based on average speed from database
   * Can be overridden by subclasses for mode-specific adjustments
   */
  protected async calculateDuration(distanceKm: number): Promise<number> {
    // Get speed from database
    const config = await pricingService["getTransportPricing"](this.mode);
    if (!config) {
      throw new Error(`Pricing config not found for mode: ${this.mode}`);
    }
    // Formula: (distance / averageSpeed) * 60 (convert hours to minutes)
    return (distanceKm / config.averageSpeed) * 60;
  }

  /**
   * Convert Google Maps steps to our RouteStep format
   */
  protected convertSteps(googleSteps: any[]): RouteStep[] {
    return googleSteps.map((step) => ({
      instruction: this.stripHtmlTags(step.instructions),
      distance: step.distance,
      duration: step.duration,
      startLocation: step.startLocation,
      endLocation: step.endLocation,
    }));
  }

  /**
   * Strip HTML tags from Google Maps instructions
   */
  protected stripHtmlTags(html: string): string {
    return html.replace(/<[^>]*>/g, "");
  }
}

/**
 * Concrete Transport Calculators
 */

class BusCalculator extends TransportCalculator {
  constructor() {
    super(TransportMode.BUS, 10); // minDistance: 10km
  }

  // Bus-specific adjustments can go here
  // e.g., add extra time for waiting at bus stops
  protected async calculateDuration(distanceKm: number): Promise<number> {
    const baseDuration = await super.calculateDuration(distanceKm);
    const waitTime = 10; // Average 10 minutes wait time
    return baseDuration + waitTime;
  }
}

class MotoCalculator extends TransportCalculator {
  constructor() {
    super(TransportMode.MOTO, 5, 100); // minDistance: 5km, maxDistance: 100km
  }

  // Moto-specific adjustments
  // Motos are faster in traffic but cost more
}

class TaxiCalculator extends TransportCalculator {
  constructor() {
    super(TransportMode.TAXI, 5); // minDistance: 5km
  }

  // Taxi-specific adjustments
  // Could add surge pricing logic here in Phase 2
}

class WalkingCalculator extends TransportCalculator {
  constructor() {
    super(TransportMode.WALKING, 0, 10); // minDistance: 0km, maxDistance: 10km
  }

  // Walking-specific adjustments
  // Free but slow
}

/**
 * Transport Factory (Factory Pattern)
 * Creates appropriate calculator for each transport mode
 */
export class TransportFactory {
  private static calculators: Map<TransportMode, TransportCalculator> =
    new Map([
      [TransportMode.BUS, new BusCalculator()],
      [TransportMode.MOTO, new MotoCalculator()],
      [TransportMode.TAXI, new TaxiCalculator()],
      [TransportMode.WALKING, new WalkingCalculator()],
    ]);

  /**
   * Get calculator for a specific transport mode
   */
  static getCalculator(mode: TransportMode): TransportCalculator {
    const calculator = this.calculators.get(mode);
    if (!calculator) {
      throw new Error(`No calculator found for mode: ${mode}`);
    }
    return calculator;
  }

  /**
   * Calculate route options for multiple transport modes with dynamic pricing
   */
  static async calculateRoutes(
    mapsResult: GoogleMapsDirectionsResult,
    modes: TransportMode[],
    pricingContext?: Partial<PricingContext>
  ): Promise<RouteOption[]> {
    const routes: RouteOption[] = [];

    for (const mode of modes) {
      try {
        const calculator = this.getCalculator(mode);
        const route = await calculator.calculate(mapsResult, pricingContext);
        routes.push(route);
      } catch (error) {
        // Mode not viable for this distance, skip it
        Logger.info(`⚠️ Skipping ${mode}: ${error}`);
      }
    }

    return routes;
  }
}