import { useState } from 'react';
import { apiClient } from "@/app/api/client";


interface WeatherData {
  temperature: number;
  feelsLike: number;
  humidity: number;
  description: string;
  main: string;
  windSpeed: number;
  timestamp: Date;
  location: {
    lat: number;
    lng: number;
    name: string;
  };
}

export const useWeather = () => {
  const [weatherData, setWeatherData] = useState<WeatherData | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const fetchWeather = async (lat: number, lng: number) => {
    setIsLoading(true);
    setError(null);

    try {
      // Call backend weather service
      const response = await apiClient.get("/weather/current", {
        params: { lat, lng },
      });

      // Backend returns { success: true, data: WeatherData }
      if (response.data.success && response.data.data) {
        setWeatherData(response.data.data);
      } else {
        throw new Error('Invalid response format');
      }
    } catch (err: any) {
      const errorMessage =
        err.response?.data?.message ||
        err.message ||
        'Failed to fetch weather data';
      setError(errorMessage);
      console.error('Weather fetch error:', err);
    } finally {
      setIsLoading(false);
    }
  };

  const clearWeather = () => {
    setWeatherData(null);
    setError(null);
  };

  return {
    weatherData,
    isLoading,
    error,
    fetchWeather,
    clearWeather,
  };
};
