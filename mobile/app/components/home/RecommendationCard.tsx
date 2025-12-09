import React from "react";
import { View, Text, TouchableOpacity } from "react-native";
import { Ionicons } from "@expo/vector-icons";

export const RecommendationCard: React.FC<RecommendationCardProps> = ({
  recommendation,
  onViewDetails,
  isDark,
}) => {
  const getModeIcon = () => {
    switch (recommendation.mode) {
      case "bus":
        return "bus";
      case "moto":
        return "bicycle";
      case "taxi":
        return "car";
      case "walk":
        return "walk";
    }
  };

  return (
    <View className="mx-6 mb-6">
      <Text className="text-gray-600 dark:text-gray-400 text-sm mb-3 font-medium">
        Based on your preferences
      </Text>

      <View
        className="bg-gradient-to-br from-blue-500 to-blue-600 rounded-3xl p-6"
        style={{
          shadowColor: "#3B82F6",
          shadowOffset: { width: 0, height: 4 },
          shadowOpacity: 0.3,
          shadowRadius: 12,
          elevation: 8,
        }}
      >
        {/* Route */}
        <View className="flex-row items-center mb-4">
          <View className="flex-1">
            <Text className="text-white/80 text-xs mb-1">From</Text>
            <Text className="text-white font-bold text-base" numberOfLines={1}>
              {recommendation.from}
            </Text>
          </View>
          <Ionicons name="arrow-forward" size={20} color="white" />
          <View className="flex-1 items-end">
            <Text className="text-white/80 text-xs mb-1">To</Text>
            <Text className="text-white font-bold text-base" numberOfLines={1}>
              {recommendation.to}
            </Text>
          </View>
        </View>

        {/* Details */}
        <View className="flex-row items-center justify-between bg-white/10 rounded-2xl p-4 mb-4">
          <View className="flex-row items-center">
            <View className="w-10 h-10 rounded-full bg-white/20 items-center justify-center">
              <Ionicons name={getModeIcon()} size={20} color="white" />
            </View>
            <Text className="text-white font-semibold ml-3 capitalize">
              {recommendation.mode}
            </Text>
          </View>

          <View className="flex-row items-center gap-4">
            <View className="items-end">
              <Text className="text-white/80 text-xs">Cost</Text>
              <Text className="text-white font-bold text-lg">
                {recommendation.cost}
              </Text>
            </View>
            <View className="items-end">
              <Text className="text-white/80 text-xs">Time</Text>
              <Text className="text-white font-bold text-lg">
                {recommendation.duration}
              </Text>
            </View>
          </View>
        </View>

        {/* View Details Button */}
        <TouchableOpacity
          onPress={onViewDetails}
          className="bg-white h-12 rounded-xl items-center justify-center"
          activeOpacity={0.8}
        >
          <Text className="text-blue-600 font-bold text-base">
            View Details
          </Text>
        </TouchableOpacity>
      </View>
    </View>
  );
};
