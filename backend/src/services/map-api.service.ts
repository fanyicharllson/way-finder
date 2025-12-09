import axios from "axios";
import { GoogleMapsDirectionsResult, LocationInput } from "../types/route.type";
import { eventBus } from "../events/eventBus";
import {
  Events,
  MapsApiCalledPayload,
  MapsApiSuccessPayload,
  MapsApiFailedPayload,
} from "../events/eventTypes";

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
      console.warn("⚠️ MAPBOX_ACCESS_TOKEN not set in environment variables");
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
   * Uses Mapbox Geocoding API
   */
  async geocodeAddress(address: string): Promise<{ lat: number; lng: number }> {
    try {
      const url = `${
        this.baseURL
      }/geocoding/v5/mapbox.places/${encodeURIComponent(address)}.json`;

      const response = await axios.get(url, {
        params: {
          access_token: this.accessToken,
          limit: 1, // Only return best match
          country: "CM", // Limit to Cameroon (optional but faster)
        },
      });

      if (!response.data.features || response.data.features.length === 0) {
        throw new Error("Address not found");
      }

      const coordinates = response.data.features[0].center;
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
}

// Export singleton instance
export const mapApiService = MapApiService.getInstance();
