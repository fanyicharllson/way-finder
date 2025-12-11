import { mapApiService } from "./map-api.service";
import {
  Events,
  RouteSearchStartedPayload,
  RouteSearchCompletedPayload,
  RouteSearchFailedPayload,
  PreferencesFetchedPayload,
  PreferencesFetchFailedPayload,
} from "../events/eventTypes";
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
      let routes = TransportFactory.calculateRoutes(
        mapsResult,
        modesToCalculate
      );

      // 5. Filter routes by user's budget
      routes = this.filterByBudget(routes, preferences.maxBudget);

      // 6. Apply optimization strategy (Strategy Pattern)
      const strategy = StrategyFactory.getStrategy(preferences.priorityType);
      routes = strategy.optimize(routes);

      // 7. Get origin/destination addresses
      const origin = await this.resolveLocation(request.from);
      const destination = await this.resolveLocation(request.to);

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
      console.warn(
        `⚠️ Failed to fetch preferences for user ${userId}: ${error.message}`
      );
      console.log("Using default preferences instead");

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
   */
  private filterByBudget(
    routes: RouteOption[],
    maxBudget: number
  ): RouteOption[] {
    // return routes.filter((route) => route.cost <= maxBudget);
    return routes;
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
