import axios from "axios";
import {
  WeatherData,
  WeatherCondition,
} from "../types/weather";
import { eventBus } from "../events/eventBus";
import { Events } from "../events/eventTypes";
import { Logger } from "../utils/logger.util";

/**
 * Weather Service
 * Integrates OpenWeather API (FREE - 1000 calls/day)
 * Sign up: https://openweathermap.org/api
 */
class WeatherService {
  private apiKey: string;
  private baseURL = "https://api.openweathermap.org/data/2.5";
  private cache: Map<string, { data: WeatherData; expiry: number }> = new Map();
  private CACHE_TTL = 10 * 60 * 1000; // 10 minutes

  constructor() {
    this.apiKey = process.env.OPENWEATHER_API_KEY || "";
    if (!this.apiKey) {
      Logger.warn("⚠️ OPENWEATHER_API_KEY not set - weather features disabled");
    }
  }

  /**
   * Get current weather for coordinates (with caching)
   */
  async getCurrentWeather(lat: number, lng: number): Promise<WeatherData> {
    const cacheKey = `${lat.toFixed(2)},${lng.toFixed(2)}`;
    const cached = this.cache.get(cacheKey);

    // Return cached data if still valid
    if (cached && cached.expiry > Date.now()) {
      Logger.dev(`📦 Weather cache hit for ${cacheKey}`);
      return cached.data;
    }

    // If no API key, return default weather
    if (!this.apiKey) {
      Logger.dev("No api key at line 43 in weather.service.ts")
      return this.getDefaultWeather(lat, lng);
    }

    try {
      const response = await axios.get<any>(
        `${this.baseURL}/weather`,
        {
          params: {
            lat,
            lon: lng,
            appid: this.apiKey,
            units: "metric", // Celsius
          },
        }
      );

      const data: WeatherData = {
        temperature: response.data.main.temp,
        feelsLike: response.data.main.feels_like,
        humidity: response.data.main.humidity,
        description: response.data.weather[0].description,
        main: response.data.weather[0].main as WeatherCondition,
        windSpeed: response.data.wind.speed,
        timestamp: new Date(response.data.dt * 1000),
        location: {
          lat: response.data.coord.lat,
          lng: response.data.coord.lon,
          name: response.data.name,
        },
      };

      // Cache the result
      this.cache.set(cacheKey, {
        data,
        expiry: Date.now() + this.CACHE_TTL,
      });

      // Emit event
      eventBus.emitEvent(Events.WEATHER_UPDATE_RECEIVED, {
        weather: data,
        timestamp: new Date(),
      });

      Logger.dev(`🌤️ Weather fetched: ${data.main} (${data.temperature}°C)`);
      return data;
    } catch (error: any) {
      Logger.error("❌ Failed to fetch weather:", error.message);
      // Return default weather (assume clear) instead of failing
      return this.getDefaultWeather(lat, lng);
    }
  }

  /**
   * Convert weather condition to pricing service format
   * Maps OpenWeather conditions to our database weather conditions
   */
  getWeatherConditionForPricing(
    weather: WeatherData
  ): "clear" | "rain" | "heavy_rain" | "storm" {
    switch (weather.main) {
      case WeatherCondition.THUNDERSTORM:
        return "storm";
      
      case WeatherCondition.RAIN:
        // Heavy rain if intensity > 7.5mm/h (we can refine this with rain volume data)
        // For now, just check description
        if (weather.description.toLowerCase().includes("heavy")) {
          return "heavy_rain";
        }
        return "rain";
      
      case WeatherCondition.DRIZZLE:
        return "rain";
      
      case WeatherCondition.CLEAR:
      case WeatherCondition.CLOUDS:
      case WeatherCondition.MIST:
      case WeatherCondition.FOG:
      default:
        return "clear";
    }
  }

  /**
   * Get weather condition from coordinates (simplified for route service)
   */
  async getWeatherConditionSimple(
    lat: number,
    lng: number
  ): Promise<"clear" | "rain" | "heavy_rain" | "storm"> {
    try {
      const weather = await this.getCurrentWeather(lat, lng);
      return this.getWeatherConditionForPricing(weather);
    } catch (error) {
      Logger.error("❌ Error getting weather:", error);
      return "clear"; // Default to clear weather
    }
  }

  /**
   * Get default weather (fallback if API fails)
   */
  private getDefaultWeather(lat: number, lng: number): WeatherData {
    return {
      temperature: 28,
      feelsLike: 30,
      humidity: 70,
      description: "Weather data unavailable",
      main: WeatherCondition.CLEAR,
      windSpeed: 0,
      timestamp: new Date(),
      location: { lat, lng, name: "Unknown" },
    };
  }
}

export const weatherService = new WeatherService();