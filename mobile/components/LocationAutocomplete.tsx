import React from "react";
import { View, Text, TouchableOpacity, ScrollView, ActivityIndicator } from "react-native";
import { Ionicons } from "@expo/vector-icons";


export const LocationAutocomplete: React.FC<LocationAutocompleteProps> = ({
  suggestions,
  isLoading,
  isDark,
  onSelectLocation,
}) => {
  if (!suggestions.length && !isLoading) {
    return null;
  }

  return (
    <View
      className={`${
        isDark ? "bg-gray-800" : "bg-white"
      } rounded-xl border ${isDark ? "border-gray-700" : "border-gray-200"} mt-2 mb-4 max-h-64`}
    >
      {isLoading ? (
        <View className="p-4 items-center justify-center">
          <ActivityIndicator color={isDark ? "#E5E7EB" : "#111827"} />
          <Text
            className={`mt-2 text-sm ${isDark ? "text-gray-400" : "text-gray-600"}`}
          >
            Searching locations...
          </Text>
        </View>
      ) : (
        <ScrollView
          scrollEnabled={suggestions.length > 4}
          nestedScrollEnabled={true}
          showsVerticalScrollIndicator={false}
        >
          <View
            className={`px-4 py-3 border-b ${
              isDark ? "border-gray-700" : "border-gray-100"
            }`}
          >
            <Text
              className={`text-base font-semibold ${
                isDark ? "text-white" : "text-gray-900"
              }`}
            >
              Search Results
            </Text>
          </View>
          {suggestions.map((item, index) => (
            <TouchableOpacity
              key={item.id}
              onPress={() => onSelectLocation(item)}
              activeOpacity={0.7}
              className={`px-4 py-3 border-b ${
                isDark ? "border-gray-700" : "border-gray-100"
              } ${index === suggestions.length - 1 ? "border-b-0" : ""}`}
            >
              <View className="flex-row items-center">
                <Ionicons
                  name="location-outline"
                  size={18}
                  color={isDark ? "#9CA3AF" : "#6B7280"}
                  style={{ marginRight: 12 }}
                />
                <View className="flex-1">
                  <Text
                    className={`text-base font-semibold ${
                      isDark ? "text-white" : "text-gray-900"
                    }`}
                  >
                    {item.name}
                  </Text>
                  <Text
                    className={`text-xs ${
                      isDark ? "text-gray-500" : "text-gray-500"
                    } mt-1`}
                  >
                    {item.displayName}
                  </Text>
                </View>
              </View>
            </TouchableOpacity>
          ))}
        </ScrollView>
      )}
    </View>
  );
};
