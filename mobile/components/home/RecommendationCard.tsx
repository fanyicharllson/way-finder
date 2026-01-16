import React, { useState } from "react";
import { View, Text, TouchableOpacity } from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { useGetPreferences } from "@/hooks/usePreferences";
import { PreferencesModal } from "../ui/PreferencesModal";

interface RecommendationCardProps {
  onViewDetails: () => void;
  isDark?: boolean;
}

export const RecommendationCard: React.FC<RecommendationCardProps> = ({
  onViewDetails,
  isDark,
}) => {
  const { data: preferences, isLoading } = useGetPreferences();
  const [showModal, setShowModal] = useState(false);

  if (isLoading || !preferences) {
    return (
      <View className="mx-4 mb-6">
        <View className="bg-white dark:bg-gray-800 rounded-2xl p-6 border border-gray-200 dark:border-gray-700">
          <View className="h-24 bg-gray-100 dark:bg-gray-700 rounded-lg animate-pulse" />
        </View>
      </View>
    );
  }

  const getModeIcon = (mode: string) => {
    const icons: { [key: string]: any } = {
      BUS: "bus",
      MOTO: "bicycle",
      TAXI: "car",
      WALK: "walk",
      CAR: "car-sport",
      BIKE: "bicycle",
    };
    return icons[mode.toUpperCase()] || "bus";
  };

  const getModeColor = (mode: string) => {
    const colors: { [key: string]: string } = {
      BUS: "#3B82F6",
      MOTO: "#10B981",
      TAXI: "#F59E0B",
      WALK: "#8B5CF6",
      CAR: "#EF4444",
      BIKE: "#06B6D4",
    };
    return colors[mode.toUpperCase()] || "#3B82F6";
  };

  const getPriorityIcon = (priority: string) => {
    const icons: { [key: string]: any } = {
      cost: "cash",
      time: "time",
      balanced: "scale",
    };
    return icons[priority] || "scale";
  };

  return (
    <>
      <View className="mx-4 mb-6">
        <TouchableOpacity
          onPress={() => setShowModal(true)}
          activeOpacity={0.7}
          className="bg-white dark:bg-gray-800 rounded-2xl p-5 border border-gray-200 dark:border-gray-700 shadow-sm"
        >
          {/* Header */}
          <View className="flex-row items-center justify-between mb-4">
            <View className="flex-row items-center gap-2">
              <View className="w-10 h-10 rounded-full bg-blue-50 dark:bg-blue-900/30 items-center justify-center">
                <Ionicons name="options" size={20} color="#3B82F6" />
              </View>
              <View>
                <Text className="text-base font-bold text-gray-900 dark:text-white">
                  Your Preferences
                </Text>
                <Text className="text-xs text-gray-500 dark:text-gray-400">
                  Tap to view details
                </Text>
              </View>
            </View>
            <Ionicons
              name="chevron-forward"
              size={20}
              color={isDark ? "#9CA3AF" : "#6B7280"}
            />
          </View>

          {/* Quick Stats */}
          <View className="flex-row gap-2 mb-3">
            {/* Budget */}
            <View className="flex-1 bg-emerald-50 dark:bg-emerald-900/20 rounded-xl p-3">
              <View className="flex-row items-center gap-1 mb-1">
                <Ionicons name="wallet" size={14} color="#10B981" />
                <Text className="text-xs text-emerald-700 dark:text-emerald-400 font-medium">
                  Budget
                </Text>
              </View>
              <Text className="text-lg font-bold text-emerald-900 dark:text-emerald-300">
                {preferences.maxBudget?.toLocaleString() || "N/A"}
              </Text>
              <Text className="text-xs text-emerald-600 dark:text-emerald-500">
                XAF max
              </Text>
            </View>

            {/* Priority */}
            <View className="flex-1 bg-purple-50 dark:bg-purple-900/20 rounded-xl p-3">
              <View className="flex-row items-center gap-1 mb-1">
                <Ionicons
                  name={getPriorityIcon(preferences.priorityType)}
                  size={14}
                  color="#8B5CF6"
                />
                <Text className="text-xs text-purple-700 dark:text-purple-400 font-medium">
                  Priority
                </Text>
              </View>
              <Text className="text-base font-bold text-purple-900 dark:text-purple-300 capitalize">
                {preferences.priorityType || "Balanced"}
              </Text>
            </View>
          </View>

          {/* Preferred Modes */}
          <View className="flex-row flex-wrap gap-2">
            {preferences.preferredModes && preferences.preferredModes.length > 0 ? (
              preferences.preferredModes.slice(0, 4).map((mode, index) => (
                <View
                  key={index}
                  className="flex-row items-center gap-1.5 px-3 py-1.5 rounded-full"
                  style={{ backgroundColor: `${getModeColor(mode)}15` }}
                >
                  <Ionicons
                    name={getModeIcon(mode)}
                    size={14}
                    color={getModeColor(mode)}
                  />
                  <Text
                    className="text-xs font-semibold capitalize"
                    style={{ color: getModeColor(mode) }}
                  >
                    {mode.toLowerCase()}
                  </Text>
                </View>
              ))
            ) : (
              <Text className="text-xs text-gray-400 dark:text-gray-500">
                No transport modes selected
              </Text>
            )}
          </View>
        </TouchableOpacity>
      </View>

      {/* Preference Details Modal */}
      <PreferencesModal
        visible={showModal}
        onClose={() => setShowModal(false)}
        isDark={isDark}
      />
    </>
  );
};
