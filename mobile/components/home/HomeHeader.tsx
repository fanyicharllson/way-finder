import React from "react";
import { View, Text, TouchableOpacity } from "react-native";
import { Ionicons } from "@expo/vector-icons";

export const HomeHeader: React.FC<HomeHeaderProps> = ({
  userName,
  temperature = 28,
  onNotificationPress,
  isDark,
}) => {
  const getGreeting = () => {
    const hour = new Date().getHours();
    if (hour < 12) return "Good morning";
    if (hour < 18) return "Good afternoon";
    return "Good evening";
  };

  return (
    <View className="px-6 pt-2 pb-3 bg-white dark:bg-gray-900">
      <View className="flex-row items-center justify-between">
        <View className="flex-1">
          <Text className="text-2xl font-bold text-gray-900 dark:text-white">
            {/* {getGreeting()}, {userName} */}
            WayFinder
          </Text>
          <View className="flex-row items-center mt-1">
            {/* <Ionicons name="location-outline" size={18} color="#3B82F6" /> */}
            <Text className="text-gray-600 dark:text-gray-400 font-medium">
              {/* {temperature}°C */}
            {getGreeting()}, {userName}

            </Text>
          </View>
        </View>

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
  );
};
