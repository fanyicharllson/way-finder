import React from "react";
import { View, Text, TouchableOpacity } from "react-native";
import { Ionicons } from "@expo/vector-icons";

interface RouteCardProps {
  route: RouteOption;
  onSelect: () => void;
  onViewOnMap: () => void;
  onAIAnalysis: () => void;
  isDark: boolean;
}

export const RouteCard: React.FC<RouteCardProps> = ({
  route,
  onSelect,
  onViewOnMap,
  onAIAnalysis,
  isDark,
}) => {
  const getModeConfig = () => {
    switch (route.mode) {
      case "bus":
        return { icon: "bus", color: "#3B82F6", bg: "#DBEAFE", label: "Bus" };
      case "moto":
        return {
          icon: "bicycle",
          color: "#F97316",
          bg: "#FFEDD5",
          label: "Moto",
        };
      case "taxi":
        return { icon: "car", color: "#10B981", bg: "#D1FAE5", label: "Taxi" };
      case "walk":
        return { icon: "walk", color: "#6B7280", bg: "#F3F4F6", label: "Walk" };
    }
  };

  const config = getModeConfig();

  const getRecommendationBadge = () => {
    if (!route.recommendation) return null;

    const badges = {
      "best-value": { text: "Best Value", color: "#10B981" },
      fastest: { text: "Fastest", color: "#3B82F6" },
      cheapest: { text: "Cheapest", color: "#F59E0B" },
    };

    const badge = badges[route.recommendation];

    return (
      <View
        className="absolute top-3 right-3 px-3 py-1 rounded-full"
        style={{ backgroundColor: badge.color }}
      >
        <Text className="text-white text-xs font-bold">{badge.text}</Text>
      </View>
    );
  };

  return (
    <View
      className="bg-white dark:bg-gray-800 rounded-3xl p-5 mb-4 border border-gray-200 dark:border-gray-700"
      style={{
        shadowColor: "#000",
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.1,
        shadowRadius: 8,
        elevation: 4,
      }}
    >
      {getRecommendationBadge()}

      {/* Mode Header */}
      <View className="flex-row items-center mb-4">
        <View
          className="w-14 h-14 rounded-2xl items-center justify-center"
          style={{ backgroundColor: isDark ? `${config.color}20` : config.bg }}
        >
          <Ionicons name={config.icon as any} size={28} color={config.color} />
        </View>
        <View className="ml-4 flex-1">
          <Text className="text-xl font-bold text-gray-900 dark:text-white">
            {config.label}
          </Text>
          <Text className="text-gray-500 dark:text-gray-400 text-sm">
            {route.distance.toFixed(1)} km
          </Text>
        </View>
      </View>

      {/* Stats */}
      <View className="flex-row justify-between mb-5">
        <View className="flex-1 items-center py-3 bg-gray-50 dark:bg-gray-900 rounded-xl">
          <Text className="text-gray-500 dark:text-gray-400 text-xs mb-1">
            Cost
          </Text>
          <Text className="text-2xl font-bold text-gray-900 dark:text-white">
            {route.cost.toLocaleString()}
          </Text>
          <Text className="text-xs text-gray-500 dark:text-gray-400 mt-1">
            FCFA
          </Text>
        </View>

        <View className="w-3" />

        <View className="flex-1 items-center py-3 bg-gray-50 dark:bg-gray-900 rounded-xl">
          <Text className="text-gray-500 dark:text-gray-400 text-xs mb-1">
            Duration
          </Text>
          <Text className="text-2xl font-bold text-gray-900 dark:text-white">
            {route.duration}
          </Text>
          <Text className="text-xs text-gray-500 dark:text-gray-400 mt-1">
            minutes
          </Text>
        </View>
      </View>

      {/* AI Analysis Button */}
      <TouchableOpacity
        onPress={onAIAnalysis}
        className="mb-3 h-11 rounded-xl bg-purple-50 dark:bg-purple-900/20 border border-purple-200 dark:border-purple-800 items-center justify-center flex-row"
        activeOpacity={0.7}
      >
        <Ionicons
          name="sparkles"
          size={16}
          color="#8B5CF6"
        />
        <Text className="ml-2 text-purple-700 dark:text-purple-300 font-semibold text-sm">
          Get AI Cost Analysis
        </Text>
      </TouchableOpacity>

      {/* Actions */}
      <View className="flex-row gap-3">
        <TouchableOpacity
          onPress={onViewOnMap}
          className="flex-1 h-12 rounded-xl bg-gray-100 dark:bg-gray-700 items-center justify-center flex-row"
          activeOpacity={0.7}
        >
          <Ionicons
            name="map-outline"
            size={18}
            color={isDark ? "#9CA3AF" : "#4B5563"}
          />
          <Text className="ml-2 text-gray-700 dark:text-gray-300 font-semibold">
            View on Map
          </Text>
        </TouchableOpacity>

        <TouchableOpacity
          onPress={onSelect}
          className="flex-1 h-12 rounded-xl items-center justify-center"
          style={{ backgroundColor: config.color }}
          activeOpacity={0.8}
        >
          <Text className="text-white font-bold">Select Route</Text>
        </TouchableOpacity>
      </View>
    </View>
  );
};
