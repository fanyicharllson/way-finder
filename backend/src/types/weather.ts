/**
 * Weather-related types
 */

export interface WeatherData {
  temperature: number; // Celsius
  feelsLike: number;
  humidity: number; // Percentage
  description: string; // "clear sky", "light rain", etc.
  main: WeatherCondition;
  windSpeed: number; // m/s
  timestamp: Date;
  location: {
    lat: number;
    lng: number;
    name: string;
  };
}

export enum WeatherCondition {
  CLEAR = "Clear",
  CLOUDS = "Clouds",
  RAIN = "Rain",
  DRIZZLE = "Drizzle",
  THUNDERSTORM = "Thunderstorm",
  SNOW = "Snow",
  MIST = "Mist",
  FOG = "Fog",
}

export enum WeatherImpact {
  NONE = "none",
  LOW = "low",
  MODERATE = "moderate",
  HIGH = "high",
  SEVERE = "severe",
}

/**
 * Weather impact on transport modes
 */
export interface TransportWeatherImpact {
  mode: string;
  impact: WeatherImpact;
  reason: string;
  costMultiplier: number; // 1.0 = no change, 1.2 = 20% increase
  durationMultiplier: number;
}

/**
 * OpenWeather API response interface
 */
export interface OpenWeatherResponse {
  main: {
    temp: number;
    feels_like: number;
    humidity: number;
  };
  weather: Array<{
    main: string;
    description: string;
  }>;
  wind: {
    speed: number;
  };
  name: string;
  coord: {
    lat: number;
    lon: number;
  };
  dt: number;
}