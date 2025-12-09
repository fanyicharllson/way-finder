import {
  TransportMode,
  TransportConfig,
  TRANSPORT_CONFIGS,
  GoogleMapsDirectionsResult,
  RouteOption,
  RouteStep,
} from "../types/route.type";
import { v4 as uuidv4 } from "uuid";

/**
 * Abstract Transport Calculator
 * Base class for all transport mode calculators
 */
abstract class TransportCalculator {
  protected config: TransportConfig;

  constructor(config: TransportConfig) {
    this.config = config;
  }

  /**
   * Calculate route option for this transport mode
   */
  calculate(mapsResult: GoogleMapsDirectionsResult): RouteOption {
    const distanceKm = mapsResult.distance / 1000; // Convert meters to km

    // Check if this mode is viable for the distance
    if (!this.isViable(distanceKm)) {
      throw new Error(
        `${this.config.mode} is not viable for ${distanceKm.toFixed(2)}km`
      );
    }

    const cost = this.calculateCost(distanceKm);
    const duration = this.calculateDuration(distanceKm);

    return {
      id: uuidv4(),
      mode: this.config.mode,
      cost: Math.round(cost), // Round to nearest XAF
      duration: Math.round(duration), // Round to nearest minute
      distance: parseFloat(distanceKm.toFixed(2)),
      polyline: mapsResult.polyline,
      steps: this.convertSteps(mapsResult.steps),
    };
  }

  /**
   * Check if this transport mode is viable for the distance
   */
  protected isViable(distanceKm: number): boolean {
    const { minDistance, maxDistance } = this.config.availability;
    
    if (distanceKm < minDistance) {
      return false;
    }
    
    if (maxDistance && distanceKm > maxDistance) {
      return false;
    }
    
    return true;
  }

  /**
   * Calculate cost based on distance
   * Formula: baseFare + (distance * costPerKm)
   */
  protected calculateCost(distanceKm: number): number {
    return this.config.baseFare + distanceKm * this.config.costPerKm;
  }

  /**
   * Calculate duration based on average speed
   * Formula: (distance / averageSpeed) * 60 (convert hours to minutes)
   */
  protected calculateDuration(distanceKm: number): number {
    return (distanceKm / this.config.averageSpeed) * 60;
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

  /**
   * Get comfort level (used by balanced strategy)
   */
  getComfortLevel(): number {
    return this.config.comfortLevel;
  }

  /**
   * Check if weather-sensitive (used for Phase 2)
   */
  isWeatherSensitive(): boolean {
    return this.config.weatherSensitive;
  }
}

/**
 * Concrete Transport Calculators
 */

class BusCalculator extends TransportCalculator {
  constructor() {
    super(TRANSPORT_CONFIGS[TransportMode.BUS]);
  }

  // Bus-specific adjustments can go here
  // e.g., add extra time for waiting at bus stops
  protected calculateDuration(distanceKm: number): number {
    const baseDuration = super.calculateDuration(distanceKm);
    const waitTime = 10; // Average 10 minutes wait time
    return baseDuration + waitTime;
  }
}

class MotoCalculator extends TransportCalculator {
  constructor() {
    super(TRANSPORT_CONFIGS[TransportMode.MOTO]);
  }

  // Moto-specific adjustments
  // Motos are faster in traffic but cost more
}

class TaxiCalculator extends TransportCalculator {
  constructor() {
    super(TRANSPORT_CONFIGS[TransportMode.TAXI]);
  }

  // Taxi-specific adjustments
  // Could add surge pricing logic here in Phase 2
}

class WalkingCalculator extends TransportCalculator {
  constructor() {
    super(TRANSPORT_CONFIGS[TransportMode.WALKING]);
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
   * Calculate route options for multiple transport modes
   */
  static calculateRoutes(
    mapsResult: GoogleMapsDirectionsResult,
    modes: TransportMode[]
  ): RouteOption[] {
    const routes: RouteOption[] = [];

    for (const mode of modes) {
      try {
        const calculator = this.getCalculator(mode);
        const route = calculator.calculate(mapsResult);
        routes.push(route);
      } catch (error) {
        // Mode not viable for this distance, skip it
        console.log(`⚠️ Skipping ${mode}: ${error}`);
      }
    }

    return routes;
  }
}