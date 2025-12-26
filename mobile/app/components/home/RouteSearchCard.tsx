import React, { useState, useEffect, useRef } from "react";
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  ActivityIndicator,
} from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { useGetPreferences } from "@/hooks/usePreferences";
import { useCurrentLocation } from "@/hooks/useLocation";
import { showToast } from "@/utils/toast";

export const RouteSearchCard: React.FC<RouteSearchCardProps> = ({
  onSearch,
  onChooseFavorite,
  onEditPreferences,
  isDark,
  shouldFocusDestination = false,
  onDestinationFocused,
}) => {
  const [from, setFrom] = useState("");
  const [to, setTo] = useState("");
  const [isUsingCurrentLocation, setIsUsingCurrentLocation] = useState(true);
  const destinationInputRef = useRef<TextInput>(null);

  const { data: preferences, isLoading: prefsLoading } = useGetPreferences();
  const {
    location: currentLocationName,
    isLoading: isLoadingLocation,
    error: locationError,
    refetch: getCurrentLocation,
  } = useCurrentLocation();

  // Show toast notifications for location status
  useEffect(() => {
    if (locationError) {
      showToast({
        type: "error",
        text1: "Location Error",
        text2:
          locationError === "Permission denied"
            ? "Please enable location permissions in settings"
            : "Unable to get your current location",
        duration: 4000,
      });
      setIsUsingCurrentLocation(false);
    }
  }, [locationError]);

  useEffect(() => {
    if (currentLocationName && !isLoadingLocation && !locationError) {
      showToast({
        type: "success",
        text1: "Location Found",
        text2: `Using: ${currentLocationName}`,
        duration: 2000,
      });
    }
  }, [currentLocationName, isLoadingLocation, locationError]);

  useEffect(() => {
    if (shouldFocusDestination) {
      const input = destinationInputRef.current;
      if (!input) return;

      // Force a blur then focus on next frame to reliably show keyboard
      input.blur();
      const rafId = requestAnimationFrame(() => {
        input.focus();
        onDestinationFocused?.();
      });

      return () => cancelAnimationFrame(rafId);
    }
  }, [shouldFocusDestination, onDestinationFocused]);

  const handleSwap = () => {
    if (isUsingCurrentLocation) return; // Can't swap current location
    const temp = from;
    setFrom(to);
    setTo(temp);
  };

 

  const getPriorityIcon = () => {
    switch (preferences?.priorityType) {
      case "speed":
        return "flash";
      case "cost":
        return "cash";
      default:
        return "scale";
    }
  };

  return (
    <View className="mx-4 mb-6">
      <View
        className="bg-white dark:bg-gray-800 rounded-3xl p-6 border border-gray-200 dark:border-gray-700"
        style={{
          shadowColor: "#000",
          shadowOffset: { width: 0, height: 4 },
          shadowOpacity: 0.1,
          shadowRadius: 12,
          elevation: 8,
        }}
      >
        <Text className="text-xl font-bold text-gray-900 dark:text-white mb-4">
          Where to?
        </Text>

        {/* From Input - Current Location */}
        <View className="mb-3">
          {isUsingCurrentLocation ? (
            <View className="flex-row items-center bg-green-50 dark:bg-green-900/20 rounded-2xl px-4 h-14 border-2 border-green-500">
              <Ionicons name="navigate" size={22} color="#10B981" />
              <View className="flex-1 ml-3">
                {isLoadingLocation ? (
                  <ActivityIndicator size="small" color="#10B981" />
                ) : (
                  <Text className="text-gray-900 dark:text-white font-medium">
                    {currentLocationName}
                  </Text>
                )}
              </View>
              <TouchableOpacity
                onPress={() => setIsUsingCurrentLocation(false)}
                className="ml-2"
              >
                <Ionicons name="create-outline" size={20} color="#10B981" />
              </TouchableOpacity>
            </View>
          ) : (
            <View className="flex-row items-center bg-gray-50 dark:bg-gray-900 rounded-2xl px-4 h-14 border border-gray-200 dark:border-gray-700">
              <Ionicons
                name="location"
                size={22}
                color={isDark ? "#9CA3AF" : "#6B7280"}
              />
              <TextInput
                className="flex-1 ml-3 text-gray-900 dark:text-white text-base"
                placeholder="Enter starting point"
                placeholderTextColor="#9CA3AF"
                value={from}
                onChangeText={setFrom}
              />
              <TouchableOpacity
                onPress={() => {
                  getCurrentLocation();
                  setIsUsingCurrentLocation(true);
                  showToast({
                    type: "info",
                    text1: "Getting Location",
                    text2: "Fetching your current location...",
                    duration: 2000,
                  });
                }}
              >
                <Ionicons name="locate" size={20} color="#3B82F6" />
              </TouchableOpacity>
            </View>
          )}
          {isUsingCurrentLocation && (
            <Text className="text-xs text-gray-500 dark:text-gray-400 mt-1 ml-1">
              Tap edit icon if location is incorrect
            </Text>
          )}
        </View>

        {/* Swap Button */}
        <View className="items-center -my-1 z-10">
          <TouchableOpacity
            onPress={handleSwap}
            disabled={isUsingCurrentLocation}
            className={`w-10 h-10 rounded-full items-center justify-center ${
              isUsingCurrentLocation
                ? "bg-gray-300 dark:bg-gray-700"
                : "bg-blue-500"
            }`}
            activeOpacity={0.7}
          >
            <Ionicons name="swap-vertical" size={20} color="white" />
          </TouchableOpacity>
        </View>

        {/* To Input */}
        <View className="flex-row items-center mt-3 mb-4 bg-gray-50 dark:bg-gray-900 rounded-2xl px-4 h-14 border border-gray-200 dark:border-gray-700">
          <Ionicons
            name="location"
            size={22}
            color={isDark ? "#EF4444" : "#DC2626"}
          />
          <TextInput
            ref={destinationInputRef}
            className="flex-1 ml-3 text-gray-900 dark:text-white text-base"
            placeholder="Enter destination"
            placeholderTextColor="#9CA3AF"
            value={to}
            onChangeText={setTo}
          />
        </View>

        {/* User Preferences Display */}
        {!prefsLoading && preferences?.isComplete && (
          <View className="mb-4 p-3 bg-blue-50 dark:bg-blue-900/20 rounded-xl border border-blue-200 dark:border-blue-800">
            <View className="flex-row items-center justify-between mb-2">
              <View className="flex-row items-center">
                <Ionicons name="settings-outline" size={16} color="#3B82F6" />
                <Text className="text-blue-600 dark:text-blue-400 font-semibold text-xs ml-1">
                  Search based on your preferences
                </Text>
              </View>
              <TouchableOpacity onPress={onEditPreferences}>
                <Text className="text-blue-500 text-xs font-semibold">
                  Edit
                </Text>
              </TouchableOpacity>
            </View>
            <View className="flex-row flex-wrap gap-2">
              <View className="flex-row items-center bg-white/50 dark:bg-gray-800/50 px-2 py-1 rounded-lg">
                <Ionicons name={getPriorityIcon()} size={12} color="#3B82F6" />
                <Text className="text-xs text-gray-700 dark:text-gray-300 ml-1 capitalize">
                  {preferences.priorityType}
                </Text>
              </View>
              {preferences.preferredModes.slice(0, 2).map((mode) => (
                <View
                  key={mode}
                  className="bg-white/50 dark:bg-gray-800/50 px-2 py-1 rounded-lg"
                >
                  <Text className="text-xs text-gray-700 dark:text-gray-300 capitalize">
                    {mode}
                  </Text>
                </View>
              ))}
              <View className="bg-white/50 dark:bg-gray-800/50 px-2 py-1 rounded-lg">
                <Text className="text-xs text-gray-700 dark:text-gray-300">
                  ≤ {preferences.maxBudget}
                </Text>
              </View>
            </View>
          </View>
        )}

        {/* Search Button */}
        <TouchableOpacity
          onPress={() =>
            onSearch(isUsingCurrentLocation ? currentLocationName : from, to)
          }
          disabled={!to.trim() || (isLoadingLocation && isUsingCurrentLocation)}
          activeOpacity={0.8}
          className={`h-14 rounded-2xl items-center justify-center ${
            to.trim() && !isLoadingLocation
              ? "bg-blue-500"
              : "bg-gray-300 dark:bg-gray-700"
          }`}
        >
          <Text
            className={`text-lg font-bold ${
              to.trim() && !isLoadingLocation ? "text-white" : "text-gray-500"
            }`}
          >
            Search Routes
          </Text>
        </TouchableOpacity>

        {/* Favorites Link */}
        <TouchableOpacity
          onPress={onChooseFavorite}
          className="items-center mt-4"
          activeOpacity={0.7}
        >
          <Text className="text-blue-500 font-semibold text-sm">
            Choose from favorites
          </Text>
        </TouchableOpacity>
      </View>
    </View>
  );
};
