import React, { useState, useEffect, useRef } from "react";
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  ActivityIndicator,
  ScrollView,
  Platform,
} from "react-native";
import { Ionicons } from "@expo/vector-icons";
import DateTimePicker, { DateTimePickerEvent } from '@react-native-community/datetimepicker';
import { useGetPreferences } from "@/hooks/usePreferences";
import { useCurrentLocation } from "@/hooks/useLocation";
import { useLocationAutocomplete } from "@/hooks/useLocationAutocomplete";
import { LocationAutocomplete } from "@/components/LocationAutocomplete";
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
  const [showFromSuggestions, setShowFromSuggestions] = useState(false);
  const [showToSuggestions, setShowToSuggestions] = useState(false);
  const [isToSelected, setIsToSelected] = useState(false);
  const [departureTime, setDepartureTime] = useState(new Date());
  const [showTimePicker, setShowTimePicker] = useState(false);
  const [showDatePicker, setShowDatePicker] = useState(false);
  const [pickerMode, setPickerMode] = useState<'date' | 'time'>('date');
  const [useCustomTime, setUseCustomTime] = useState(false);
  const [tempDate, setTempDate] = useState(new Date());
  const destinationInputRef = useRef<TextInput>(null);
  const fromInputRef = useRef<TextInput>(null);

  const { data: preferences, isLoading: prefsLoading } = useGetPreferences();
  const {
    location: currentLocationName,
    isLoading: isLoadingLocation,
    error: locationError,
    refetch: getCurrentLocation,
  } = useCurrentLocation();

  const {
    suggestions: fromSuggestions,
    isLoading: isLoadingFromSuggestions,
    fetchSuggestions: fetchFromSuggestions,
  } = useLocationAutocomplete();

  const {
    suggestions: toSuggestions,
    isLoading: isLoadingToSuggestions,
    fetchSuggestions: fetchToSuggestions,
  } = useLocationAutocomplete();

  // Fetch current location on mount
  useEffect(() => {
    if (isUsingCurrentLocation) {
      getCurrentLocation();
    }
  }, []);

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

      input.blur();
      const rafId = requestAnimationFrame(() => {
        input.focus();
        onDestinationFocused?.();
      });

      return () => cancelAnimationFrame(rafId);
    }
  }, [shouldFocusDestination, onDestinationFocused]);

  const handleFromChange = (text: string) => {
    setFrom(text);
    if (text.trim().length >= 2) {
      setShowFromSuggestions(true);
      fetchFromSuggestions(text);
    } else {
      setShowFromSuggestions(false);
    }
  };

  const handleToChange = (text: string) => {
    setTo(text);
    setIsToSelected(false);
    if (text.trim().length >= 2) {
      setShowToSuggestions(true);
      fetchToSuggestions(text);
    } else {
      setShowToSuggestions(false);
    }
  };

  const handleSelectFromLocation = (location: any) => {
    setFrom(location.name);
    setShowFromSuggestions(false);
  };

  const handleSelectToLocation = (location: any) => {
    setTo(location.name);
    setIsToSelected(true);
    setShowToSuggestions(false);
  };

  const hasNoToResults =
    !isLoadingToSuggestions &&
    to.trim().length >= 2 &&
    toSuggestions.length === 0 &&
    !isToSelected;

  const isDestinationReady = to.trim().length > 0 && !hasNoToResults;

  const handleSearchPress = () => {
    // If user didn’t tap a suggestion but suggestions exist, use the top result
    const resolvedTo =
      isToSelected || toSuggestions.length === 0
        ? to
        : toSuggestions[0].name;

    // Use custom time if set, otherwise use current time
    const timeToUse = useCustomTime ? departureTime : new Date();
    console.log("Searching routes with:", {
      from: isUsingCurrentLocation ? currentLocationName : from,
      to: resolvedTo,
      departureTime: timeToUse,
    });

    onSearch(
      isUsingCurrentLocation ? currentLocationName : from,
      resolvedTo,
      timeToUse.toISOString()
    );
  };

  const handleSwap = () => {
    if (isUsingCurrentLocation) return;
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
    <ScrollView
      keyboardShouldPersistTaps="handled"
      scrollEnabled={showFromSuggestions || showToSuggestions}
      className="mx-4 mb-6"
    >
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
            <View>
              <View className="flex-row items-center bg-gray-50 dark:bg-gray-900 rounded-2xl px-4 h-14 border border-gray-200 dark:border-gray-700">
                <Ionicons
                  name="location"
                  size={22}
                  color={isDark ? "#9CA3AF" : "#6B7280"}
                />
                <TextInput
                  ref={fromInputRef}
                  className="flex-1 ml-3 text-gray-900 dark:text-white text-base"
                  placeholder="Enter starting point"
                  placeholderTextColor="#9CA3AF"
                  value={from}
                  onChangeText={handleFromChange}
                  onFocus={() => from.length >= 2 && setShowFromSuggestions(true)}
                />
                <TouchableOpacity
                  onPress={() => {
                    getCurrentLocation();
                    setIsUsingCurrentLocation(true);
                  }}
                >
                  <Ionicons name="locate" size={20} color="#3B82F6" />
                </TouchableOpacity>
              </View>
              {showFromSuggestions && (
                <LocationAutocomplete
                  suggestions={fromSuggestions}
                  isLoading={isLoadingFromSuggestions}
                  isDark={isDark}
                  onSelectLocation={handleSelectFromLocation}
                />
              )}
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
        <View className="flex-row items-center mt-3 mb-2 bg-gray-50 dark:bg-gray-900 rounded-2xl px-4 h-14 border border-gray-200 dark:border-gray-700">
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
            onChangeText={handleToChange}
            onFocus={() => to.length >= 2 && setShowToSuggestions(true)}
          />
        </View>

        {hasNoToResults && (
          <Text className="text-xs text-red-500 mb-2 ml-1">
            Destination not found. Please pick a suggestion or try a nearby landmark.
          </Text>
        )}

        {showToSuggestions && (
          <LocationAutocomplete
            suggestions={toSuggestions}
            isLoading={isLoadingToSuggestions}
            isDark={isDark}
            onSelectLocation={handleSelectToLocation}
          />
        )}

        {/* Departure Time Section */}
        <View className="mb-4 mt-2">
          <Text className="text-sm font-semibold text-gray-700 dark:text-gray-300 mb-2 ml-1">
            Departure Time
          </Text>
          
          {/* Time Options */}
          <View className="flex-row gap-2 mb-2">
            <TouchableOpacity
              onPress={() => {
                setUseCustomTime(false);
                setDepartureTime(new Date());
              }}
              className={`flex-1 h-12 rounded-2xl flex-row items-center justify-center ${
                !useCustomTime
                  ? 'bg-blue-500 border-2 border-blue-500'
                  : isDark
                  ? 'bg-gray-800 border border-gray-700'
                  : 'bg-gray-100 border border-gray-200'
              }`}
              activeOpacity={0.7}
            >
              <Ionicons
                name="time"
                size={18}
                color={!useCustomTime ? 'white' : isDark ? '#9CA3AF' : '#6B7280'}
              />
              <Text
                className={`ml-2 font-semibold ${
                  !useCustomTime
                    ? 'text-white'
                    : isDark
                    ? 'text-gray-300'
                    : 'text-gray-700'
                }`}
              >
                Now
              </Text>
            </TouchableOpacity>

            <TouchableOpacity
              onPress={() => {
                setUseCustomTime(true);
                if (Platform.OS === 'android') {
                  setPickerMode('date');
                  setShowDatePicker(true);
                } else {
                  setShowTimePicker(true);
                }
              }}
              className={`flex-1 h-12 rounded-2xl flex-row items-center justify-center ${
                useCustomTime
                  ? 'bg-blue-500 border-2 border-blue-500'
                  : isDark
                  ? 'bg-gray-800 border border-gray-700'
                  : 'bg-gray-100 border border-gray-200'
              }`}
              activeOpacity={0.7}
            >
              <Ionicons
                name="calendar"
                size={18}
                color={useCustomTime ? 'white' : isDark ? '#9CA3AF' : '#6B7280'}
              />
              <Text
                className={`ml-2 font-semibold ${
                  useCustomTime
                    ? 'text-white'
                    : isDark
                    ? 'text-gray-300'
                    : 'text-gray-700'
                }`}
              >
                Custom
              </Text>
            </TouchableOpacity>
          </View>

          {/* Display Selected Time */}
          {useCustomTime && (
            <TouchableOpacity
              onPress={() => {
                if (Platform.OS === 'android') {
                  setPickerMode('date');
                  setShowDatePicker(true);
                } else {
                  setShowTimePicker(true);
                }
              }}
              className={`flex-row items-center justify-between p-3 rounded-xl ${
                isDark ? 'bg-gray-800' : 'bg-gray-100'
              }`}
              activeOpacity={0.7}
            >
              <View className="flex-row items-center">
                <Ionicons name="time-outline" size={20} color="#3B82F6" />
                <Text className="text-gray-900 dark:text-white font-medium ml-2">
                  {departureTime.toLocaleString('en-US', {
                    month: 'short',
                    day: 'numeric',
                    hour: 'numeric',
                    minute: '2-digit',
                    hour12: true,
                  })}
                </Text>
              </View>
              <Ionicons name="chevron-forward" size={20} color={isDark ? '#9CA3AF' : '#6B7280'} />
            </TouchableOpacity>
          )}

          {/* DateTimePicker - Android (shows as modal dialog) */}
          {showDatePicker && Platform.OS === 'android' && (
            <DateTimePicker
              value={pickerMode === 'date' ? departureTime : tempDate}
              mode={pickerMode}
              display="default"
              minimumDate={new Date()}
              onChange={(event: DateTimePickerEvent, selectedDate?: Date) => {
                if (event.type === 'dismissed') {
                  setShowDatePicker(false);
                  return;
                }
                
                if (event.type === 'set' && selectedDate) {
                  if (pickerMode === 'date') {
                    // Date selected, now show time picker
                    setTempDate(selectedDate);
                    setPickerMode('time');
                    // Keep picker open for time selection
                  } else {
                    // Time selected, combine and close
                    setDepartureTime(selectedDate);
                    setUseCustomTime(true);
                    setShowDatePicker(false);
                    setPickerMode('date'); // Reset for next time
                  }
                }
              }}
            />
          )}

          {/* DateTimePicker - iOS (inline spinner) */}
          {showTimePicker && Platform.OS === 'ios' && (
            <DateTimePicker
              value={departureTime}
              mode="datetime"
              display="spinner"
              onChange={(event: DateTimePickerEvent, selectedDate?: Date) => {
                if (event.type === 'set' && selectedDate) {
                  setDepartureTime(selectedDate);
                  setUseCustomTime(true);
                }
                setShowTimePicker(false);
              }}
              minimumDate={new Date()}
            />
          )}

          {/* Info Text */}
          <Text className="text-xs text-gray-500 dark:text-gray-400 mt-2 ml-1">
            {useCustomTime
              ? 'Routes will be optimized for your selected time'
              : 'Routes will be optimized for current traffic conditions'}
          </Text>
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
          onPress={handleSearchPress}
          disabled={
            !isDestinationReady ||
            (isLoadingLocation && isUsingCurrentLocation)
          }
          activeOpacity={0.8}
          className={`h-14 rounded-2xl items-center justify-center flex-row gap-1 ${
            isDestinationReady && !isLoadingLocation
              ? "bg-blue-500"
              : "bg-gray-300 dark:bg-gray-700"
          }`}
        >
          <Ionicons
            name="search"
            size={18}
            color={
              !isLoadingLocation && isDestinationReady ? "white" : "gray"
            }
          />
          <Text
            className={`text-lg font-bold ${
              isDestinationReady && !isLoadingLocation
                ? "text-white"
                : "text-gray-500"
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
    </ScrollView>
  );
};
