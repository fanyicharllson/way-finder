import React, { useState, useEffect } from "react";
import { View, Text, TouchableOpacity } from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { WeatherModal } from './WeatherModal';
import { useWeather } from '@/hooks/useWeather';
import { useLocation } from '@/hooks/useLocation';

interface HomeHeaderProps {
  userName: string;
  temperature?: number;
  onNotificationPress: () => void;
  isDark?: boolean;
}

export const HomeHeader: React.FC<HomeHeaderProps> = ({
  userName,
  temperature = 28,
  onNotificationPress,
  isDark,
}) => {
  const [showWeatherModal, setShowWeatherModal] = useState(false);
  const [currentTemp, setCurrentTemp] = useState<number | null>(null);
  const [weatherCondition, setWeatherCondition] = useState<string>('');
  
  const { weatherData, isLoading, error, fetchWeather } = useWeather();
  const { getCurrentLocation, checkPermission } = useLocation();

  useEffect(() => {
    // Get initial location and weather on mount
    getInitialWeather();
  }, []);

  useEffect(() => {
    // Update displayed temp when weather data changes
    if (weatherData) {
      setCurrentTemp(Math.round(weatherData.temperature));
      setWeatherCondition(weatherData.main);
    }
  }, [weatherData]);

  const getInitialWeather = async () => {
    try {
      const status = await checkPermission();
      
      if (status === 'granted') {
        const coords = await getCurrentLocation();
        if (coords) {
          await fetchWeather(coords.latitude, coords.longitude);
        }
      }
    } catch (err) {
      console.log('Failed to get initial weather:', err);
    }
  };

  const handleWeatherPress = () => {
    setShowWeatherModal(true);
  };

  const handleFetchWeather = async (lat: number, lng: number) => {
    await fetchWeather(lat, lng);
  };

  const getWeatherIcon = (condition: string) => {
    const lower = condition?.toLowerCase() || '';
    if (lower.includes('rain')) return 'rainy';
    if (lower.includes('cloud')) return 'cloudy';
    if (lower.includes('storm') || lower.includes('thunder')) return 'thunderstorm';
    if (lower.includes('snow')) return 'snow';
    if (lower.includes('mist') || lower.includes('fog')) return 'cloud';
    return 'sunny';
  };

  const getGreeting = () => {
    const hour = new Date().getHours();
    if (hour < 12) return "Good morning";
    if (hour < 18) return "Good afternoon";
    return "Good evening";
  };

  return (
    <>
      <View className="px-6 pt-2 pb-3 bg-white dark:bg-gray-900">
        <View className="flex-row items-center justify-between">
          <View className="flex-1">
            <Text className="text-2xl font-bold text-gray-900 dark:text-white">
              WayFinder
            </Text>
            <View className="flex-row items-center mt-1">
              <Text className="text-gray-600 dark:text-gray-400 font-medium">
                {getGreeting()}, {userName}
              </Text>
            </View>
          </View>

          <View className="flex-row items-center gap-2">
            {/* Weather Button */}
            <TouchableOpacity
              onPress={handleWeatherPress}
              className={`h-12 px-3 rounded-full flex-row items-center ${
                isDark ? 'bg-blue-900/20' : 'bg-blue-50'
              }`}
              activeOpacity={0.7}
            >
              <Ionicons
                name={weatherCondition ? getWeatherIcon(weatherCondition) : 'partly-sunny'}
                size={20}
                color="#3B82F6"
              />
              {currentTemp !== null && (
                <Text className={`ml-2 font-bold ${
                  isDark ? 'text-blue-200' : 'text-blue-900'
                }`}>
                  {currentTemp}°C
                </Text>
              )}
              {currentTemp === null && (
                <Text className={`ml-2 text-xs ${
                  isDark ? 'text-blue-300' : 'text-blue-700'
                }`}>
                  Weather
                </Text>
              )}
            </TouchableOpacity>

            {/* Notification Button */}
            <TouchableOpacity
              onPress={onNotificationPress}
              className="w-12 h-12 rounded-full bg-gray-100 dark:bg-gray-800 items-center justify-center"
              activeOpacity={0.7}
            >
              <Ionicons
                name="notifications-outline"
                size={24}
                color={isDark ? "#9CA3AF" : "#4B5563"}
              />
              {/* Notification badge */}
              <View className="absolute top-2 right-2 w-2 h-2 bg-red-500 rounded-full" />
            </TouchableOpacity>
          </View>
        </View>
      </View>

      {/* Weather Modal */}
      <WeatherModal
        visible={showWeatherModal}
        onClose={() => setShowWeatherModal(false)}
        isDark={isDark}
        onFetchWeather={handleFetchWeather}
        weatherData={weatherData}
        isLoading={isLoading}
        error={error}
      />
    </>
  );
};
