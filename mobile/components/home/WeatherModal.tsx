import React, { useState } from "react";
import {
  View,
  Text,
  Modal,
  TouchableOpacity,
  ActivityIndicator,
  TextInput,
  ScrollView,
  Animated,
} from "react-native";
import { Ionicons } from "@expo/vector-icons";
import * as Location from "expo-location";
import { useLocation } from "@/hooks/useLocation";
import { useSafeAreaInsets } from "react-native-safe-area-context";

interface WeatherModalProps {
  visible: boolean;
  onClose: () => void;
  isDark?: boolean;
  onFetchWeather: (lat: number, lng: number) => Promise<void>;
  weatherData: any;
  isLoading: boolean;
  error: string | null;
}

export const WeatherModal: React.FC<WeatherModalProps> = ({
  visible,
  onClose,
  isDark = false,
  onFetchWeather,
  weatherData,
  isLoading,
  error,
}) => {
  const [slideAnim] = useState(new Animated.Value(0));
  const [locationError, setLocationError] = useState<string | null>(null);
  const [manualLocation, setManualLocation] = useState("");
  const [showManualInput, setShowManualInput] = useState(false);
  const [gettingLocation, setGettingLocation] = useState(false);

  const { getCurrentLocation, requestPermission } = useLocation();
  const insets = useSafeAreaInsets();

  React.useEffect(() => {
    if (visible) {
      Animated.spring(slideAnim, {
        toValue: 1,
        useNativeDriver: true,
        tension: 65,
        friction: 11,
      }).start();
    } else {
      Animated.timing(slideAnim, {
        toValue: 0,
        duration: 250,
        useNativeDriver: true,
      }).start();
    }
  }, [visible]);

  const handleGetCurrentLocation = async () => {
    setGettingLocation(true);
    setLocationError(null);

    try {
      const granted = await requestPermission();

      if (!granted) {
        setLocationError(
          "Location permission denied. Please enable in settings or enter manually."
        );
        setShowManualInput(true);
        setGettingLocation(false);
        return;
      }

      const coords = await getCurrentLocation();

      if (coords) {
        await onFetchWeather(coords.latitude, coords.longitude);
      } else {
        setLocationError("Failed to get current location");
        setShowManualInput(true);
      }
    } catch (err: any) {
      setLocationError(err.message || "Failed to get current location");
      setShowManualInput(true);
    } finally {
      setGettingLocation(false);
    }
  };

  const handleManualLocationSubmit = async () => {
    if (!manualLocation.trim()) return;

    setGettingLocation(true);
    setLocationError(null);

    try {
      // Geocode the manual location
      const results = await Location.geocodeAsync(manualLocation);

      if (results.length === 0) {
        setLocationError("Location not found. Please try a different address.");
        setGettingLocation(false);
        return;
      }

      const { latitude, longitude } = results[0];
      await onFetchWeather(latitude, longitude);
      setShowManualInput(false);
      setManualLocation("");
    } catch (err: any) {
      setLocationError(err.message || "Failed to geocode location");
    } finally {
      setGettingLocation(false);
    }
  };

  const getWeatherIcon = (condition: string) => {
    const lower = condition?.toLowerCase() || "";
    if (lower.includes("rain")) return "rainy";
    if (lower.includes("cloud")) return "cloudy";
    if (lower.includes("storm") || lower.includes("thunder"))
      return "thunderstorm";
    if (lower.includes("snow")) return "snow";
    if (lower.includes("mist") || lower.includes("fog")) return "cloud";
    return "sunny";
  };

  const translateY = slideAnim.interpolate({
    inputRange: [0, 1],
    outputRange: [600, 0],
  });

  if (!visible) return null;

  return (
    <Modal
      transparent
      visible={visible}
      onRequestClose={onClose}
      animationType="fade"
    >
      <View
        className="flex-1 bg-black/50"
        style={{ backgroundColor: "rgba(0, 0, 0, 0.5)" }}
      >
        <TouchableOpacity
          className="flex-1"
          activeOpacity={1}
          onPress={onClose}
        />

        <Animated.View
          style={{ transform: [{ translateY }] }}
          className={`rounded-t-3xl ${
            isDark ? "bg-gray-900" : "bg-white"
          } overflow-hidden`}
        >
          {/* Header */}
          <View
            className={`px-6 py-4 border-b ${
              isDark ? "border-gray-800" : "border-gray-200"
            }`}
          >
            <View className="flex-row items-center justify-between">
              <View>
                <Text
                  className={`text-xl font-bold ${
                    isDark ? "text-white" : "text-gray-900"
                  }`}
                >
                  Current Weather
                </Text>
                <Text
                  className={`text-sm ${
                    isDark ? "text-gray-400" : "text-gray-600"
                  }`}
                >
                  Live weather updates
                </Text>
              </View>
              <TouchableOpacity
                onPress={onClose}
                className={`w-10 h-10 rounded-full items-center justify-center ${
                  isDark ? "bg-gray-800" : "bg-gray-100"
                }`}
                activeOpacity={0.7}
              >
                <Ionicons
                  name="close"
                  size={24}
                  color={isDark ? "#9CA3AF" : "#4B5563"}
                />
              </TouchableOpacity>
            </View>
          </View>

          <ScrollView className="max-h-96" showsVerticalScrollIndicator={false}>
            <View className="px-6 py-6" style={{ paddingBottom: Math.max(insets.bottom, 16) + 16 }}>
              {/* Loading State */}
              {isLoading && (
                <View className="items-center justify-center py-12">
                  <ActivityIndicator size="large" color="#3B82F6" />
                  <Text
                    className={`mt-4 ${
                      isDark ? "text-gray-400" : "text-gray-600"
                    }`}
                  >
                    Fetching weather data...
                  </Text>
                </View>
              )}

              {/* Weather Data Display */}
              {!isLoading && weatherData && !error && (
                <View className="items-center">
                  {/* Main Weather Display */}
                  <View
                    className={`w-32 h-32 rounded-full items-center justify-center mb-4 ${
                      isDark ? "bg-blue-900/20" : "bg-blue-50"
                    }`}
                  >
                    <Ionicons
                      name={getWeatherIcon(weatherData.main)}
                      size={64}
                      color="#3B82F6"
                    />
                  </View>

                  <Text
                    className={`text-5xl font-bold ${
                      isDark ? "text-white" : "text-gray-900"
                    }`}
                  >
                    {Math.round(weatherData.temperature)}°C
                  </Text>

                  <Text
                    className={`text-lg capitalize mt-2 ${
                      isDark ? "text-gray-300" : "text-gray-700"
                    }`}
                  >
                    {weatherData.description}
                  </Text>

                  <Text
                    className={`text-sm mt-1 ${
                      isDark ? "text-gray-400" : "text-gray-500"
                    }`}
                  >
                    {weatherData.location?.name || "Your Location"}
                  </Text>

                  {/* Weather Details Grid */}
                  <View className="w-full mt-8 gap-3">
                    <View
                      className={`flex-row rounded-2xl p-4 ${
                        isDark ? "bg-gray-800" : "bg-gray-50"
                      }`}
                    >
                      <View className="flex-1 items-center">
                        <Ionicons
                          name="thermometer-outline"
                          size={24}
                          color="#EF4444"
                        />
                        <Text
                          className={`text-xs mt-2 ${
                            isDark ? "text-gray-400" : "text-gray-500"
                          }`}
                        >
                          Feels Like
                        </Text>
                        <Text
                          className={`text-lg font-bold ${
                            isDark ? "text-white" : "text-gray-900"
                          }`}
                        >
                          {Math.round(weatherData.feelsLike)}°C
                        </Text>
                      </View>

                      <View
                        className={`w-px ${
                          isDark ? "bg-gray-700" : "bg-gray-200"
                        }`}
                      />

                      <View className="flex-1 items-center">
                        <Ionicons
                          name="water-outline"
                          size={24}
                          color="#3B82F6"
                        />
                        <Text
                          className={`text-xs mt-2 ${
                            isDark ? "text-gray-400" : "text-gray-500"
                          }`}
                        >
                          Humidity
                        </Text>
                        <Text
                          className={`text-lg font-bold ${
                            isDark ? "text-white" : "text-gray-900"
                          }`}
                        >
                          {weatherData.humidity}%
                        </Text>
                      </View>

                      <View
                        className={`w-px ${
                          isDark ? "bg-gray-700" : "bg-gray-200"
                        }`}
                      />

                      <View className="flex-1 items-center">
                        <Ionicons
                          name="speedometer-outline"
                          size={24}
                          color="#10B981"
                        />
                        <Text
                          className={`text-xs mt-2 ${
                            isDark ? "text-gray-400" : "text-gray-500"
                          }`}
                        >
                          Wind
                        </Text>
                        <Text
                          className={`text-lg font-bold ${
                            isDark ? "text-white" : "text-gray-900"
                          }`}
                        >
                          {weatherData.windSpeed} m/s
                        </Text>
                      </View>
                    </View>

                    {/* Last Updated */}
                    <Text
                      className={`text-xs text-center ${
                        isDark ? "text-gray-500" : "text-gray-400"
                      }`}
                    >
                      Updated{" "}
                      {new Date(weatherData.timestamp).toLocaleTimeString()}
                    </Text>
                  </View>
                </View>
              )}

              {/* Error or No Data - Location Prompt */}
              {!isLoading && (!weatherData || error || locationError) && (
                <View className="py-4">
                  {(error || locationError) && (
                    <View
                      className={`rounded-2xl p-4 mb-4 ${
                        isDark
                          ? "bg-red-900/20 border border-red-800"
                          : "bg-red-50 border border-red-200"
                      }`}
                    >
                      <View className="flex-row items-start">
                        <Ionicons
                          name="alert-circle"
                          size={20}
                          color="#EF4444"
                        />
                        <Text
                          className={`flex-1 ml-2 text-sm ${
                            isDark ? "text-red-200" : "text-red-800"
                          }`}
                        >
                          {error || locationError}
                        </Text>
                      </View>
                    </View>
                  )}

                  {!showManualInput ? (
                    <View className="items-center">
                      <View
                        className={`w-20 h-20 rounded-full items-center justify-center mb-4 ${
                          isDark ? "bg-gray-800" : "bg-gray-100"
                        }`}
                      >
                        <Ionicons name="location" size={40} color="#3B82F6" />
                      </View>

                      <Text
                        className={`text-lg font-semibold mb-2 ${
                          isDark ? "text-white" : "text-gray-900"
                        }`}
                      >
                        Get Weather for Your Location
                      </Text>

                      <Text
                        className={`text-sm text-center mb-6 ${
                          isDark ? "text-gray-400" : "text-gray-600"
                        }`}
                      >
                        Allow location access to see current weather conditions
                      </Text>

                      <TouchableOpacity
                        onPress={handleGetCurrentLocation}
                        disabled={gettingLocation}
                        className="bg-blue-500 w-full h-14 rounded-2xl flex-row items-center justify-center mb-3"
                        activeOpacity={0.8}
                      >
                        {gettingLocation ? (
                          <ActivityIndicator color="white" />
                        ) : (
                          <>
                            <Ionicons name="locate" size={20} color="white" />
                            <Text className="text-white font-bold text-base ml-2">
                              Get Current Location
                            </Text>
                          </>
                        )}
                      </TouchableOpacity>

                      <TouchableOpacity
                        onPress={() => setShowManualInput(true)}
                        className={`w-full h-14 rounded-2xl flex-row items-center justify-center border-2 ${
                          isDark ? "border-gray-700" : "border-gray-300"
                        }`}
                        activeOpacity={0.7}
                      >
                        <Ionicons
                          name="create-outline"
                          size={20}
                          color={isDark ? "#9CA3AF" : "#4B5563"}
                        />
                        <Text
                          className={`font-bold text-base ml-2 ${
                            isDark ? "text-gray-300" : "text-gray-700"
                          }`}
                        >
                          Enter Location Manually
                        </Text>
                      </TouchableOpacity>
                    </View>
                  ) : (
                    <View>
                      <Text
                        className={`text-sm font-semibold mb-3 ${
                          isDark ? "text-white" : "text-gray-900"
                        }`}
                      >
                        Enter Your Location
                      </Text>

                      <TextInput
                        value={manualLocation}
                        onChangeText={setManualLocation}
                        placeholder="e.g., Douala, Cameroon"
                        placeholderTextColor={isDark ? "#6B7280" : "#9CA3AF"}
                        className={`h-14 rounded-2xl px-4 mb-3 ${
                          isDark
                            ? "bg-gray-800 text-white border border-gray-700"
                            : "bg-gray-50 text-gray-900 border border-gray-200"
                        }`}
                        autoFocus
                      />

                      <TouchableOpacity
                        onPress={handleManualLocationSubmit}
                        disabled={gettingLocation || !manualLocation.trim()}
                        className={`h-14 rounded-2xl flex-row items-center justify-center mb-3 ${
                          !manualLocation.trim() || gettingLocation
                            ? "bg-gray-300 dark:bg-gray-700"
                            : "bg-blue-500"
                        }`}
                        activeOpacity={0.8}
                      >
                        {gettingLocation ? (
                          <ActivityIndicator color="white" />
                        ) : (
                          <>
                            <Ionicons name="search" size={20} color="white" />
                            <Text className="text-white font-bold text-base ml-2">
                              Get Weather
                            </Text>
                          </>
                        )}
                      </TouchableOpacity>

                      <TouchableOpacity
                        onPress={() => {
                          setShowManualInput(false);
                          setManualLocation("");
                          setLocationError(null);
                        }}
                        className={`h-12 rounded-2xl flex-row items-center justify-center`}
                        activeOpacity={0.7}
                      >
                        <Text
                          className={`font-semibold ${
                            isDark ? "text-gray-400" : "text-gray-600"
                          }`}
                        >
                          Back to Auto-detect
                        </Text>
                      </TouchableOpacity>
                    </View>
                  )}
                </View>
              )}
            </View>
          </ScrollView>
        </Animated.View>
      </View>
    </Modal>
  );
};
