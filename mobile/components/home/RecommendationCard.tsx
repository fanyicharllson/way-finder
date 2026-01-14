import React, { useState } from "react";
import { View, Text, TouchableOpacity, Modal, ScrollView } from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { router } from "expo-router";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { useGetPreferences } from "@/hooks/usePreferences";

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
  const insets = useSafeAreaInsets();

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
      <Modal
        visible={showModal}
        animationType="slide"
        transparent={true}
        onRequestClose={() => setShowModal(false)}
      >
        <View className="flex-1 bg-black/50 justify-end">
          <View className="bg-white dark:bg-gray-900 rounded-t-3xl" style={{ maxHeight: '85%', paddingBottom: insets.bottom }}>
            {/* Modal Header */}
            <View className="flex-row items-center justify-between p-6 border-b border-gray-200 dark:border-gray-800">
              <View>
                <Text className="text-2xl font-bold text-gray-900 dark:text-white">
                  Travel Preferences
                </Text>
                <Text className="text-sm text-gray-500 dark:text-gray-400 mt-1">
                  Your customized travel settings
                </Text>
              </View>
              <TouchableOpacity
                onPress={() => setShowModal(false)}
                className="w-10 h-10 rounded-full bg-gray-100 dark:bg-gray-800 items-center justify-center"
              >
                <Ionicons
                  name="close"
                  size={24}
                  color={isDark ? "#F3F4F6" : "#1F2937"}
                />
              </TouchableOpacity>
            </View>

            <ScrollView 
              // style={{ maxHeight: '50%' }}
              showsVerticalScrollIndicator={false}
              contentContainerStyle={{ paddingBottom: 20 }}
            >
              <View className="p-4">
                {/* Budget Section */}
                <View className="bg-emerald-50 dark:bg-emerald-900/20 rounded-2xl p-5 mb-4">
                  <View className="flex-row items-center gap-3 mb-3">
                    <View className="w-12 h-12 rounded-full bg-emerald-100 dark:bg-emerald-900/40 items-center justify-center">
                      <Ionicons name="wallet" size={24} color="#10B981" />
                    </View>
                    <View className="flex-1">
                      <Text className="text-sm text-emerald-700 dark:text-emerald-400 font-medium">
                        Maximum Budget
                      </Text>
                      <Text className="text-3xl font-bold text-emerald-900 dark:text-emerald-300">
                        {preferences.maxBudget?.toLocaleString() || "Not set"} <Text className="text-lg">XAF</Text>
                      </Text>
                    </View>
                  </View>
                  <Text className="text-xs text-emerald-600 dark:text-emerald-500">
                    Routes exceeding this amount will be marked
                  </Text>
                </View>

                {/* Priority Section */}
                <View className="bg-purple-50 dark:bg-purple-900/20 rounded-2xl p-5 mb-4">
                  <View className="flex-row items-center gap-3 mb-3">
                    <View className="w-12 h-12 rounded-full bg-purple-100 dark:bg-purple-900/40 items-center justify-center">
                      <Ionicons
                        name={getPriorityIcon(preferences.priorityType)}
                        size={24}
                        color="#8B5CF6"
                      />
                    </View>
                    <View className="flex-1">
                      <Text className="text-sm text-purple-700 dark:text-purple-400 font-medium">
                        Route Priority
                      </Text>
                      <Text className="text-2xl font-bold text-purple-900 dark:text-purple-300 capitalize">
                        {preferences.priorityType || "Balanced"}
                      </Text>
                    </View>
                  </View>
                  <Text className="text-xs text-purple-600 dark:text-purple-500">
                    {preferences.priorityType === "cost"
                      ? "Optimized for cheapest routes"
                      : preferences.priorityType === "time"
                      ? "Optimized for fastest routes"
                      : "Balanced cost and time"}
                  </Text>
                </View>

                {/* Preferred Modes Section */}
                <View className="bg-gray-50 dark:bg-gray-800 rounded-2xl p-5 mb-4">
                  <View className="flex-row items-center gap-3 mb-4">
                    <View className="w-12 h-12 rounded-full bg-blue-100 dark:bg-blue-900/40 items-center justify-center">
                      <Ionicons name="car" size={24} color="#3B82F6" />
                    </View>
                    <View className="flex-1">
                      <Text className="text-sm text-gray-700 dark:text-gray-400 font-medium">
                        Preferred Transport
                      </Text>
                      <Text className="text-lg font-bold text-gray-900 dark:text-white">
                        {preferences.preferredModes?.length || 0} Mode
                        {preferences.preferredModes?.length !== 1 ? "s" : ""}
                      </Text>
                    </View>
                  </View>
                  <View className="flex-row flex-wrap gap-2">
                    {preferences.preferredModes && preferences.preferredModes.length > 0 ? (
                      preferences.preferredModes.map((mode, index) => (
                        <View
                          key={index}
                          className="flex-row items-center gap-2 px-4 py-2.5 rounded-xl"
                          style={{ backgroundColor: `${getModeColor(mode)}15` }}
                        >
                          <Ionicons
                            name={getModeIcon(mode)}
                            size={18}
                            color={getModeColor(mode)}
                          />
                          <Text
                            className="text-sm font-semibold capitalize"
                            style={{ color: getModeColor(mode) }}
                          >
                            {mode.toLowerCase()}
                          </Text>
                        </View>
                      ))
                    ) : (
                      <Text className="text-sm text-gray-400 dark:text-gray-500 italic">
                        No transport modes selected
                      </Text>
                    )}
                  </View>
                </View>

                {/* Avoidance Zones Section */}
                {preferences.avoidanceZones && preferences.avoidanceZones.length > 0 && (
                  <View className="bg-red-50 dark:bg-red-900/20 rounded-2xl p-5">
                    <View className="flex-row items-center gap-3 mb-4">
                      <View className="w-12 h-12 rounded-full bg-red-100 dark:bg-red-900/40 items-center justify-center">
                        <Ionicons name="warning" size={24} color="#EF4444" />
                      </View>
                      <View className="flex-1">
                        <Text className="text-sm text-red-700 dark:text-red-400 font-medium">
                          Avoidance Zones
                        </Text>
                        <Text className="text-lg font-bold text-red-900 dark:text-red-300">
                          {preferences.avoidanceZones.length} Zone
                          {preferences.avoidanceZones.length !== 1 ? "s" : ""}
                        </Text>
                      </View>
                    </View>
                    {preferences.avoidanceZones.map((zone, index) => (
                      <View
                        key={index}
                        className="flex-row items-center gap-2 mb-2 last:mb-0"
                      >
                        <Ionicons name="location" size={16} color="#EF4444" />
                        <Text className="text-sm text-red-900 dark:text-red-300 flex-1">
                          {zone}
                        </Text>
                      </View>
                    ))}
                  </View>
                )}
              </View>
            {/* Edit Button */}
            <View className="px-4">
              <TouchableOpacity
                onPress={() => {
                  setShowModal(false);
                  router.push("/screens/(extrascreens)/preferences");
                }}
                className="bg-blue-500 rounded-xl py-4 flex-row items-center justify-center gap-2"
                activeOpacity={0.8}
              >
                <Ionicons name="create" size={20} color="white" />
                <Text className="text-white font-bold text-base">
                  Edit Preferences
                </Text>
              </TouchableOpacity>
            </View>
            </ScrollView>

          </View>
        </View>
      </Modal>
    </>
  );
};
