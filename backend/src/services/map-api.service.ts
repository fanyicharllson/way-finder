import axios from "axios";
import { GoogleMapsDirectionsResult, LocationInput } from "../types/route.type";
import { eventBus } from "../events/eventBus";
import {
  Events,
  MapsApiCalledPayload,
  MapsApiSuccessPayload,
  MapsApiFailedPayload,
} from "../events/eventTypes";
import { Logger } from "../utils/logger.util";

/**
 * Mapbox API Service (Singleton Pattern)
 *
 * Free Tier: 100,000 requests/month
 * Sign up: https://www.mapbox.com/
 */
class MapApiService {
  private static instance: MapApiService;
  private accessToken: string;
  private baseURL = "https://api.mapbox.com";

  private constructor() {
    this.accessToken = process.env.MAPBOX_ACCESS_TOKEN || "";

    if (!this.accessToken) {
      Logger.warn("⚠️ MAPBOX_ACCESS_TOKEN not set in environment variables");
    }
  }

  /**
   * Get singleton instance
   */
  public static getInstance(): MapApiService {
    if (!MapApiService.instance) {
      MapApiService.instance = new MapApiService();
    }
    return MapApiService.instance;
  }

  /**
   * Get directions from Mapbox
   */
  async getDirections(
    origin: LocationInput,
    destination: LocationInput,
    userId?: string
  ): Promise<GoogleMapsDirectionsResult> {
    const originCoords = await this.resolveToCoordinates(origin);
    const destCoords = await this.resolveToCoordinates(destination);

    // Validate that origin and destination are different
    const distance = this.calculateDistance(
      originCoords.lat,
      originCoords.lng,
      destCoords.lat,
      destCoords.lng
    );

    if (distance < 0.1) {
      // Less than 100 meters apart
      throw new Error(
        "Origin and destination are too close or identical. Please use more specific location names or landmarks (e.g., 'Mvog-Mbi, Yaoundé' instead of just neighborhood names)."
      );
    }

    const originStr = `${originCoords.lng},${originCoords.lat}`;
    const destStr = `${destCoords.lng},${destCoords.lat}`;

    // Emit event: API call started
    if (userId) {
      eventBus.emitEvent<MapsApiCalledPayload>(Events.MAPS_API_CALLED, {
        userId,
        origin: originStr,
        destination: destStr,
        timestamp: new Date(),
      });
    }

    try {
      // Mapbox Directions API endpoint
      const url = `${this.baseURL}/directions/v5/mapbox/driving/${originCoords.lng},${originCoords.lat};${destCoords.lng},${destCoords.lat}`;

      const response = await axios.get(url, {
        params: {
          access_token: this.accessToken,
          geometries: "polyline", // or "polyline6" for higher precision
          steps: "true",
          overview: "full",
        },
      });

      if (!response.data.routes || response.data.routes.length === 0) {
        throw new Error("No routes found");
      }

      const route = response.data.routes[0];

      const result: GoogleMapsDirectionsResult = {
        distance: route.distance, // meters
        duration: route.duration, // seconds
        polyline: route.geometry, // Already encoded in polyline format
        steps: route.legs[0].steps.map((step: any) => ({
          distance: step.distance,
          duration: step.duration,
          startLocation: {
            lat: step.maneuver.location[1],
            lng: step.maneuver.location[0],
          },
          endLocation: {
            // Mapbox doesn't provide end location per step
            // Use next step's start or destination
            lat: step.maneuver.location[1],
            lng: step.maneuver.location[0],
          },
          instructions: step.maneuver.instruction,
          travelMode: step.mode || "driving",
        })),
        bounds: {
          northeast: {
            lat: Math.max(originCoords.lat, destCoords.lat),
            lng: Math.max(originCoords.lng, destCoords.lng),
          },
          southwest: {
            lat: Math.min(originCoords.lat, destCoords.lat),
            lng: Math.min(originCoords.lng, destCoords.lng),
          },
        },
      };

      // Emit event: API call succeeded
      if (userId) {
        eventBus.emitEvent<MapsApiSuccessPayload>(Events.MAPS_API_SUCCESS, {
          userId,
          origin: originStr,
          destination: destStr,
          distance: result.distance,
          duration: result.duration,
          timestamp: new Date(),
        });
      }

      return result;
    } catch (error: any) {
      // Emit event: API call failed
      if (userId) {
        eventBus.emitEvent<MapsApiFailedPayload>(Events.MAPS_API_FAILED, {
          userId,
          origin: originStr,
          destination: destStr,
          error: error.response?.data?.message || error.message,
          timestamp: new Date(),
        });
      }

      throw new Error(`Failed to get directions: ${error.message}`);
    }
  }

  /**
   * Resolve location input to coordinates
   */
  private async resolveToCoordinates(
    location: LocationInput
  ): Promise<{ lat: number; lng: number }> {
    if (location.lat !== undefined && location.lng !== undefined) {
      return { lat: location.lat, lng: location.lng };
    }

    if (location.address) {
      return await this.geocodeAddress(location.address);
    }

    throw new Error(
      "Invalid location: must provide either coordinates or address"
    );
  }

  /**
   * Geocode an address to coordinates
   * Uses Mapbox Geocoding API with fallback strategies
   * ALL SEARCHES ARE RESTRICTED TO CAMEROON
   */
  async geocodeAddress(address: string): Promise<{ lat: number; lng: number }> {
    try {
      const cleanAddress = address.trim();
      
      // Strategy 1: Try exact search with specific location types
      let response = await axios.get(
        `${this.baseURL}/geocoding/v5/mapbox.places/${encodeURIComponent(cleanAddress)}.json`,
        {
          params: {
            access_token: this.accessToken,
            limit: 5,
            country: "CM", // Always restrict to Cameroon
            types: "place,locality,neighborhood,address,poi",
            language: "en", // Prefer English results
          },
        }
      );

      // Strategy 2: Try with just major location types (cities, towns)
      if (!response.data.features || response.data.features.length === 0) {
        Logger.dev(`⚠️ No results for "${cleanAddress}", trying major locations only...`);
        
        response = await axios.get(
          `${this.baseURL}/geocoding/v5/mapbox.places/${encodeURIComponent(cleanAddress)}.json`,
          {
            params: {
              access_token: this.accessToken,
              limit: 5,
              country: "CM", // Keep Cameroon filter
              types: "place,locality,region", // Broader location types
              proximity: "11.5021,3.8480", // Yaoundé center for bias
            },
          }
        );
      }

      // Strategy 3: Try fuzzy search with first keyword only
      if (!response.data.features || response.data.features.length === 0) {
        const mainTerm = cleanAddress.split(/[,\s]+/)[0];
        if (mainTerm && mainTerm !== cleanAddress) {
          Logger.dev(`⚠️ Still no results, trying fuzzy search with "${mainTerm}"...`);
          
          response = await axios.get(
            `${this.baseURL}/geocoding/v5/mapbox.places/${encodeURIComponent(mainTerm)}.json`,
            {
              params: {
                access_token: this.accessToken,
                limit: 5,
                country: "CM", // Keep Cameroon filter
                fuzzyMatch: true,
                proximity: "11.5021,3.8480",
              },
            }
          );
        }
      }

      if (!response.data.features || response.data.features.length === 0) {
        throw new Error(
          `Location "${cleanAddress}" not found in Cameroon. Please use a well-known city, landmark, or full address (e.g., "ICT University, Yaoundé" or "Bamenda")`
        );
      }

      // Log all results for debugging
      // Logger.log(`📍 Found ${response.data.features.length} results for "${cleanAddress}":`);
      // response.data.features.forEach((feature: any, idx: number) => {
      //   Logger.log(`  ${idx + 1}. ${feature.place_name} (relevance: ${feature.relevance})`);
      // });

      // Filter out results not in Cameroon (safety check)
      const cameroonResults = response.data.features.filter((feature: any) =>
        feature.place_name.toLowerCase().includes("cameroon") ||
        feature.place_name.toLowerCase().includes("cameroun")
      );

      if (cameroonResults.length === 0) {
        throw new Error(
          `Location "${cleanAddress}" not found in Cameroon. Please use a well-known city, landmark, or full address.`
        );
      }

      const bestMatch = cameroonResults[0];
      const coordinates = bestMatch.center;
      
      Logger.success(`Using: ${bestMatch.place_name}`);

      return {
        lng: coordinates[0], // Mapbox returns [lng, lat]
        lat: coordinates[1],
      };
    } catch (error: any) {
      throw new Error(`Failed to geocode address: ${error.message}`);
    }
  }

  /**
   * Reverse geocode coordinates to address
   */
  async reverseGeocode(lat: number, lng: number): Promise<string> {
    try {
      const url = `${this.baseURL}/geocoding/v5/mapbox.places/${lng},${lat}.json`;

      const response = await axios.get(url, {
        params: {
          access_token: this.accessToken,
          limit: 1,
        },
      });

      if (!response.data.features || response.data.features.length === 0) {
        throw new Error("Location not found");
      }

      return response.data.features[0].place_name;
    } catch (error: any) {
      throw new Error(`Failed to reverse geocode: ${error.message}`);
    }
  }

  /**
   * Calculate distance between two coordinates in kilometers using Haversine formula
   */
  private calculateDistance(
    lat1: number,
    lng1: number,
    lat2: number,
    lng2: number
  ): number {
    const R = 6371; // Earth's radius in km
    const dLat = this.toRadians(lat2 - lat1);
    const dLng = this.toRadians(lng2 - lng1);
    
    const a =
      Math.sin(dLat / 2) * Math.sin(dLat / 2) +
      Math.cos(this.toRadians(lat1)) *
        Math.cos(this.toRadians(lat2)) *
        Math.sin(dLng / 2) *
        Math.sin(dLng / 2);
    
    const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
    return R * c; // Distance in km
  }

  /**
   * Get location suggestions for autocomplete
   * Returns list of places matching the query
   */
  async getSuggestions(
    query: string
  ): Promise<
    Array<{ id: string; name: string; displayName: string; coordinates: [number, number] }>
  > {
    try {
      const cleanQuery = query.trim();

      const response = await axios.get(
        `${this.baseURL}/geocoding/v5/mapbox.places/${encodeURIComponent(cleanQuery)}.json`,
        {
          params: {
            access_token: this.accessToken,
            limit: 8, // Return top 8 suggestions
            country: "CM", // Cameroon only
            types: "place,locality,neighborhood,address,poi",
            language: "en",
          },
        }
      );

      if (!response.data.features || response.data.features.length === 0) {
        return [];
      }

      // Transform results to autocomplete format
      const suggestions = response.data.features
        .filter(
          (feature: any) =>
            feature.place_name.toLowerCase().includes("cameroon") ||
            feature.place_name.toLowerCase().includes("cameroun")
        )
        .map((feature: any) => ({
          id: feature.id,
          name: feature.place_name.split(",")[0], // Just the place name
          displayName: feature.place_name, // Full place name with region/country
          coordinates: feature.center as [number, number], // [lng, lat]
        }));

      Logger.dev(`🔍 Found ${suggestions.length} suggestions for "${cleanQuery}"`);

      return suggestions;
    } catch (error: any) {
      Logger.error(`❌ Autocomplete error for "${query}":`, error.message);
      return [];
    }
  }

  /**
   * Convert degrees to radians
   */
  private toRadians(degrees: number): number {
    return degrees * (Math.PI / 180);
  }
}

// Export singleton instance
export const mapApiService = MapApiService.getInstance();
