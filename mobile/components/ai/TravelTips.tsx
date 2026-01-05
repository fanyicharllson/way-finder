import React, { useState } from "react";
import { View, Text, ActivityIndicator, TouchableOpacity } from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { useTravelTips } from "@/hooks/useAI";
import { useQueryClient } from "@tanstack/react-query";

interface TravelTipsWidgetProps {
  isDark: boolean;
}

export function TravelTips({ isDark }: TravelTipsWidgetProps) {
  const [isExpanded, setIsExpanded] = useState(false);
  const queryClient = useQueryClient();
  const currentHour = new Date().getHours();
  const currentDay = new Date().toLocaleDateString("en-US", {
    weekday: "long",
  });

  const timeOfDay =
    currentHour < 12 ? "morning" : currentHour < 17 ? "afternoon" : "evening";

  const {
    data: tips,
    isLoading,
    isError,
    refetch,
  } = useTravelTips({
    timeOfDay,
    dayOfWeek: currentDay,
  });

  const handleRefresh = () => {
    queryClient.invalidateQueries({ queryKey: ["travel-tips"] });
    refetch();
  };

  if (isLoading) {
    return (
      <View className="bg-blue-50 dark:bg-blue-900/20 rounded-2xl p-4 mb-4">
        <View className="flex-row items-center mb-3">
          <View className="w-8 h-8 bg-blue-500/20 rounded-full items-center justify-center mr-2">
            <Ionicons name="information-circle" size={16} color="#3B82F6" />
          </View>
          <Text className="text-base font-bold text-gray-900 dark:text-white">
            Today's Travel Tips
          </Text>
        </View>
        <View className="py-6 items-center">
          <ActivityIndicator size="small" color="#3B82F6" />
          <Text className="text-sm text-gray-500 dark:text-gray-400 mt-2">
            Generating travel tips...
          </Text>
        </View>
      </View>
    );
  }

  if (isError || !tips) {
    return null;
  }

  // Parse tips (assuming they come as bullet points)
  const tipsList = tips
    .split("\n")
    .filter((tip) => tip.trim().startsWith("•") || tip.trim().startsWith("-"))
    .map((tip) => tip.replace(/^[•\-]\s*/, "").trim());

  return (
    <View className="bg-blue-50 dark:bg-blue-900/20 rounded-2xl mb-4 border border-blue-200 dark:border-blue-800">
      <TouchableOpacity
        onPress={() => setIsExpanded(!isExpanded)}
        activeOpacity={0.7}
        className="p-4 flex-row items-center justify-between"
      >
        <View className="flex-row items-center flex-1">
          <View className="w-8 h-8 bg-blue-500/20 rounded-full items-center justify-center mr-2">
            <Ionicons name="information-circle" size={16} color="#3B82F6" />
          </View>
          <Text className="text-base font-bold text-gray-900 dark:text-white">
            Today's Travel Tips
          </Text>
          <View className="bg-blue-100 dark:bg-blue-900/50 px-2 py-1 rounded-full ml-2">
            <Text className="text-xs text-blue-600 dark:text-blue-400 font-semibold capitalize">
              {timeOfDay}
            </Text>
          </View>
        </View>

        <View className="flex-row items-center gap-2">
          <TouchableOpacity
            onPress={(e) => {
              e.stopPropagation();
              handleRefresh();
            }}
            className="w-8 h-8 bg-blue-100 dark:bg-blue-900/50 rounded-full items-center justify-center"
            activeOpacity={0.7}
            disabled={isLoading}
          >
            <Ionicons name="refresh" size={16} color="#3B82F6" />
          </TouchableOpacity>

          <Ionicons
            name={isExpanded ? "chevron-up" : "chevron-down"}
            size={20}
            color="#3B82F6"
          />
        </View>
      </TouchableOpacity>

      {isExpanded && (
        <View className="px-4 pb-4">
          <View className="gap-2 mb-3">
            {tipsList.map((tip, index) => (
              <View key={index} className="flex-row items-start">
                <Ionicons
                  name="checkmark-circle"
                  size={16}
                  color="#3B82F6"
                  style={{ marginTop: 2, marginRight: 8 }}
                />
                <Text className="flex-1 text-sm text-gray-700 dark:text-gray-300 leading-5">
                  {tip}
                </Text>
              </View>
            ))}
          </View>

          <View className="pt-3 border-t border-blue-200 dark:border-blue-800">
            <Text className="text-xs text-blue-600 dark:text-blue-400 text-center">
              ✨ AI-generated tips for your commute
            </Text>
          </View>
        </View>
      )}
    </View>
  );
}
