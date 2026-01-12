import { mapApiService } from "./map-api.service";
import { weatherService } from "./weather.service";
import {
  Events,
  RouteSearchStartedPayload,
  RouteSearchCompletedPayload,
  RouteSearchFailedPayload,
  PreferencesFetchedPayload,
  PreferencesFetchFailedPayload,
} from "../events/eventTypes";
import { Logger } from "../utils/logger.util";
import {
  RouteSearchRequest,
  RouteSearchResponse,
  RouteOption,
  UserPreferences,
  DEFAULT_PREFERENCES,
  TransportMode,
  OptimizationType,
} from "../types/route.type";
import { eventBus } from "../events";
import { StrategyFactory } from "../factory/strategy/optimaization.stategy";
import { TransportFactory } from "../factory/transport.factory";
import { PreferenceService } from "./preference.service";

/**
 * Route Service
 * Main business logic for route searching
 */
export class RouteService {
  private preferenceService: PreferenceService = new PreferenceService();
 
  /**
   * Search for routes with graceful preference fetching
   */
  async searchRoutes(
    userId: string,
    request: RouteSearchRequest
  ): Promise<RouteSearchResponse> {
    const startTime = Date.now();

    // Emit event: Route search started
    eventBus.emitEvent<RouteSearchStartedPayload>(Events.ROUTE_SEARCH_STARTED, {
      userId,
      from: JSON.stringify(request.from),
      to: JSON.stringify(request.to),
      timestamp: new Date(),
    });

    try {
      // 1. Fetch user preferences (with graceful degradation)
      const preferences = await this.getUserPreferencesGracefully(userId);

      // 2. Get route data from Google Maps API
      const mapsResult = await mapApiService.getDirections(
        request.from,
        request.to,
        userId
      );

      // 3. Determine which transport modes to calculate
      const modesToCalculate = this.getModesToCalculate(preferences);

      // 4. Calculate routes for each viable transport mode (Factory Pattern)
      // NEW: Get current weather and traffic context for dynamic pricing
      const departureTime = request.departureTime
        ? new Date(request.departureTime)
        : new Date();
      
      const weatherCondition = await this.getCurrentWeather(request.from);
      const trafficLevel = this.estimateTrafficLevel(departureTime);

      // Get full weather data for UI context
      const weatherData = await this.getFullWeatherData(request.from);

      let routes = await TransportFactory.calculateRoutes(
        mapsResult,
        modesToCalculate,
        {
          departureTime,
          weatherCondition,
          trafficLevel,
        }
      );

      // 5. Check if all routes exceed budget (but don't filter them out)
      const budgetContext = this.checkBudgetConstraint(routes, preferences.maxBudget);
      
      // Keep the filter commented - we show all routes but notify user
      // routes = this.filterByBudget(routes, preferences.maxBudget);

      // 6. Apply optimization strategy (Strategy Pattern)
      const strategy = StrategyFactory.getStrategy(preferences.priorityType);
      routes = strategy.optimize(routes);

      // 7. Get origin/destination addresses
      const origin = await this.resolveLocation(request.from);
      const destination = await this.resolveLocation(request.to);

      // 8. Save search to recent searches (async, don't wait)
      this.saveRecentSearch(userId, origin, destination).catch((err) =>
        Logger.error("Failed to save recent search:", err)
      );

      const duration = Date.now() - startTime;

      // Emit event: Route search completed
      eventBus.emitEvent<RouteSearchCompletedPayload>(
        Events.ROUTE_SEARCH_COMPLETED,
        {
          userId,
          from: origin.address,
          to: destination.address,
          routes: routes,
          duration,
          timestamp: new Date(),
        }
      );

      return {
        success: true,
        routes,
        origin,
        destination,
        userPreferences: {
          priorityType: preferences.priorityType,
          maxBudget: preferences.maxBudget,
          preferredModes: preferences.preferredModes,
        },
        // NEW: Context data for UI enhancements
        context: {
          weather: weatherData
            ? {
                temperature: weatherData.temperature,
                condition: weatherCondition,
                description: weatherData.description,
                humidity: weatherData.humidity,
                windSpeed: weatherData.windSpeed,
                feelsLike: weatherData.feelsLike,
                location: weatherData.location.name || origin.address,
              }
            : undefined,
          pricing: this.getPricingContext(trafficLevel, departureTime, routes),
          savings: this.calculateSavings(routes, trafficLevel),
          budget: budgetContext,
        },
      };
    } catch (error: any) {
      // Emit event: Route search failed
      eventBus.emitEvent<RouteSearchFailedPayload>(Events.ROUTE_SEARCH_FAILED, {
        userId,
        from: JSON.stringify(request.from),
        to: JSON.stringify(request.to),
        error: error.message,
        timestamp: new Date(),
      });

      throw error;
    }
  }

  /**
   * Fetch user preferences with graceful degradation
   * Uses PreferenceService, falls back to defaults on error
   */
  private async getUserPreferencesGracefully(
    userId: string
  ): Promise<UserPreferences> {
    try {

      
      eventBus.emitEvent<CallingPreferenceServicePayload>(
        Events.CALLING_PREFERENCE_SERVICE,
        { userId, timestamp: new Date() }
      );
      // Call PreferenceService to fetch preferences
      const userPref = await this.preferenceService.getUserPreferences(userId);

      // Convert database format to our type
      const preferences: UserPreferences = {
        maxBudget: userPref.maxBudget,
        preferredModes: userPref.preferredModes as TransportMode[],
        avoidanceZones: userPref.avoidanceZones,
        priorityType: userPref.priorityType as OptimizationType,
        isComplete: userPref.isComplete,
      };

      eventBus.emitEvent<PreferencesFetchedPayload>(
        Events.PREFERENCES_FETCHED,
        {
          userId,
          preferences,
          hasFallback: false,
          timestamp: new Date(),
        }
      );

      return preferences;
    } catch (error: any) {
      // Preferences not found or fetch failed, use defaults gracefully
      Logger.warn(
        `⚠️ Failed to fetch preferences for user ${userId}: ${error.message}`
      );
      Logger.dev("Using default preferences instead");

      eventBus.emitEvent<PreferencesFetchFailedPayload>(
        Events.PREFERENCES_FETCH_FAILED,
        {
          userId,
          error: error.message,
          usingDefaults: true,
          timestamp: new Date(),
        }
      );

      return DEFAULT_PREFERENCES;
    }
  }

  /**
   * Determine which transport modes to calculate based on preferences
   */
  private getModesToCalculate(preferences: UserPreferences): TransportMode[] {
    // If user has preferred modes, use those
    if (preferences.preferredModes.length > 0) {
      return preferences.preferredModes;
    }

    // Otherwise, calculate all modes
    return Object.values(TransportMode);
  }

  /**
   * Filter routes by user's max budget
   * NOTE: Currently disabled - we show all routes but notify user if budget is exceeded
   */
  private filterByBudget(
    routes: RouteOption[],
    maxBudget: number
  ): RouteOption[] {
    // return routes.filter((route) => route.cost <= maxBudget);
    return routes;
  }

  /**
   * Check if all routes exceed user's max budget
   */
  private checkBudgetConstraint(
    routes: RouteOption[],
    maxBudget: number
  ): {
    isExceeded: boolean;
    userMaxBudget: number;
    cheapestRoutePrice: number;
    message?: string;
  } {
    if (routes.length === 0) {
      return {
        isExceeded: false,
        userMaxBudget: maxBudget,
        cheapestRoutePrice: 0,
      };
    }

    // Find the cheapest route
    const cheapestRoute = routes.reduce((min, route) =>
      route.cost < min.cost ? route : min
    );

    const isExceeded = cheapestRoute.cost > maxBudget;

    if (isExceeded) {
      const difference = cheapestRoute.cost - maxBudget;
      return {
        isExceeded: true,
        userMaxBudget: maxBudget,
        cheapestRoutePrice: cheapestRoute.cost,
        message: `All routes exceed your budget by at least ${difference.toLocaleString()} FCFA. Consider increasing your budget or exploring alternative options.`,
      };
    }

    return {
      isExceeded: false,
      userMaxBudget: maxBudget,
      cheapestRoutePrice: cheapestRoute.cost,
    };
  }

  /**
   * Resolve location to address and coordinates
   */
  private async resolveLocation(
    location: RouteSearchRequest["from"]
  ): Promise<{ address: string; coordinates: { lat: number; lng: number } }> {
    if (location.lat !== undefined && location.lng !== undefined) {
      // We have coordinates, get address
      const address = await mapApiService.reverseGeocode(
        location.lat,
        location.lng
      );
      return {
        address,
        coordinates: { lat: location.lat, lng: location.lng },
      };
    }

    if (location.address) {
      // We have address, get coordinates
      const coordinates = await mapApiService.geocodeAddress(location.address);
      return {
        address: location.address,
        coordinates,
      };
    }

    throw new Error("Invalid location input");
  }

  /**
   * Save recent search (async, non-blocking)
   */
  private async saveRecentSearch(
    userId: string,
    origin: { address: string; coordinates: { lat: number; lng: number } },
    destination: { address: string; coordinates: { lat: number; lng: number } }
  ): Promise<void> {
    try {
      const { recentSearchService } = await import("./recent-search.service");
      await recentSearchService.saveSearch({
        userId,
        fromAddress: origin.address,
        toAddress: destination.address,
        fromLat: origin.coordinates.lat,
        fromLng: origin.coordinates.lng,
        toLat: destination.coordinates.lat,
        toLng: destination.coordinates.lng,
      });
    } catch (error) {
      // Silent fail - don't break route search if saving fails
      Logger.error("Failed to save recent search:", error);
    }
  }

  /**
   * Get current weather condition for location using weather service
   */
  private async getCurrentWeather(
    location: RouteSearchRequest["from"]
  ): Promise<"clear" | "rain" | "heavy_rain" | "storm"> {
    try {
      // Get coordinates from location
      let lat: number;
      let lng: number;

      if (location.lat !== undefined && location.lng !== undefined) {
        lat = location.lat;
        lng = location.lng;
      } else if (location.address) {
        // Geocode address to get coordinates
        const coords = await mapApiService.geocodeAddress(location.address);
        lat = coords.lat;
        lng = coords.lng;
      } else {
        // Invalid location, return default
        return "clear";
      }

      // Use weather service to get condition
      return await weatherService.getWeatherConditionSimple(lat, lng);
    } catch (error) {
      Logger.error("❌ Error getting weather condition:", error);
      return "clear"; // Default to clear weather on error
    }
  }

  /**
   * Estimate traffic level based on time of day
   */
  private estimateTrafficLevel(time: Date): "low" | "moderate" | "high" {
    const hour = time.getHours();
    const dayOfWeek = time.getDay();

    // Weekend traffic is generally lighter
    if (dayOfWeek === 0 || dayOfWeek === 6) {
      return "low";
    }

    // Weekday rush hours: 7-9 AM, 5-7 PM
    if ((hour >= 7 && hour <= 9) || (hour >= 17 && hour <= 19)) {
      return "high";
    }

    // Business hours (moderate traffic)
    if (hour >= 10 && hour <= 16) {
      return "moderate";
    }

    // Off-peak hours
    return "low";
  }

  /**
   * Get full weather data for UI context
   */
  private async getFullWeatherData(
    location: RouteSearchRequest["from"]
  ): Promise<any> {
    try {
      // Get coordinates from location
      let lat: number;
      let lng: number;

      if (location.lat !== undefined && location.lng !== undefined) {
        lat = location.lat;
        lng = location.lng;
      } else if (location.address) {
        const coords = await mapApiService.geocodeAddress(location.address);
        lat = coords.lat;
        lng = coords.lng;
      } else {
        return null;
      }

      // Get full weather data from weather service
      return await weatherService.getCurrentWeather(lat, lng);
    } catch (error) {
      Logger.error("❌ Error getting full weather data:", error);
      return null;
    }
  }

  /**
   * Get pricing context for UI display
   */
  private getPricingContext(
    trafficLevel: "low" | "moderate" | "high",
    departureTime: Date,
    routes: RouteOption[]
  ) {
    const hour = departureTime.getHours();
    const dayOfWeek = departureTime.getDay();

    // Determine time of day
    let timeOfDay: "morning" | "afternoon" | "evening" | "night";
    if (hour >= 5 && hour < 12) timeOfDay = "morning";
    else if (hour >= 12 && hour < 17) timeOfDay = "afternoon";
    else if (hour >= 17 && hour < 21) timeOfDay = "evening";
    else timeOfDay = "night";

    // Check if surge is active
    const isSurgeActive = routes.some(
      (route) => route.appliedMultipliers?.surge && route.appliedMultipliers.surge > 1
    );

    let surgeReason: string | undefined;
    if (isSurgeActive) {
      if ((hour >= 7 && hour <= 9) && dayOfWeek >= 1 && dayOfWeek <= 5) {
        surgeReason = "Morning rush hour (7-9 AM)";
      } else if ((hour >= 17 && hour <= 19) && dayOfWeek >= 1 && dayOfWeek <= 5) {
        surgeReason = "Evening rush hour (5-7 PM)";
      } else if (hour >= 22 || hour <= 5) {
        surgeReason = "Late night premium";
      }
    }

    // Traffic description
    const trafficDescriptions = {
      low: "Light traffic - good time to travel",
      moderate: "Moderate traffic - expect some delays",
      high: "Heavy traffic - rush hour conditions",
    };

    return {
      trafficLevel,
      trafficDescription: trafficDescriptions[trafficLevel],
      isSurgeActive,
      surgeReason,
      timeOfDay,
      timestamp: departureTime,
    };
  }

  /**
   * Calculate savings compared to peak pricing
   */
  private calculateSavings(
    routes: RouteOption[],
    trafficLevel: "low" | "moderate" | "high"
  ) {
    if (routes.length === 0) {
      return { hasSavings: false };
    }

    // Check if any route has surge pricing applied
    const hasSurge = routes.some(
      (route) => route.appliedMultipliers?.surge && route.appliedMultipliers.surge > 1
    );

    if (hasSurge) {
      // Currently in surge pricing - no savings
      return {
        hasSavings: false,
        message: "Surge pricing is currently active",
      };
    }

    // Calculate potential savings if not in surge
    const cheapestRoute = routes.reduce((min, route) =>
      route.cost < min.cost ? route : min
    );

    // Estimate peak price (assume 1.5x surge multiplier during peak)
    const peakMultiplier = 1.5;
    const estimatedPeakPrice = Math.round(
      cheapestRoute.cost * peakMultiplier
    );
    const savingsAmount = estimatedPeakPrice - cheapestRoute.cost;
    const savingsPercent = Math.round(
      ((savingsAmount / estimatedPeakPrice) * 100)
    );

    if (savingsAmount > 0) {
      return {
        hasSavings: true,
        message: `You're saving ${savingsPercent}% by traveling off-peak`,
        peakPrice: estimatedPeakPrice,
        currentPrice: cheapestRoute.cost,
        savingsAmount,
      };
    }

    return { hasSavings: false };
  }

  /**
   * Get route by ID (for Phase 2 - store routes in DB)
   */
  async getRouteById(routeId: string): Promise<RouteOption | null> {
    // TODO: Implement in Phase 2 when we store routes
    throw new Error("Not implemented yet");
  }

  /**
   * Compare multiple routes (for Phase 2)
   */
  async compareRoutes(routeIds: string[]): Promise<RouteOption[]> {
    // TODO: Implement in Phase 2
    throw new Error("Not implemented yet");
  }
}

// Export singleton instance
export const routeService = new RouteService();
