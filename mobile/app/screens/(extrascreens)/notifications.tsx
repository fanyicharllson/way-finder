import React, { useState, useEffect, useCallback } from "react";
import {
  View,
  Text,
  ScrollView,
  TouchableOpacity,
  RefreshControl,
} from "react-native";
import { router } from "expo-router";
import { Ionicons } from "@expo/vector-icons";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { useColorScheme } from "nativewind";
import {
  NotificationStorage,
  StoredNotification,
} from "@/utils/notificationStorage";
import { NotificationService } from "@/utils/notification";

const NotificationsScreen = () => {
  const insets = useSafeAreaInsets();
  const { colorScheme } = useColorScheme();
  const isDark = colorScheme === 'dark';
  const [notifications, setNotifications] = useState<StoredNotification[]>([]);
  const [refreshing, setRefreshing] = useState(false);

  const loadNotifications = useCallback(async () => {
    const data = await NotificationStorage.getAll();
    setNotifications(data);
  }, []);

  useEffect(() => {
    loadNotifications();
  }, [loadNotifications]);

  const onRefresh = async () => {
    setRefreshing(true);
    await loadNotifications();
    setRefreshing(false);
  };

  const handleNotificationPress = async (notification: StoredNotification) => {
    await NotificationStorage.markAsRead(notification.id);
    await loadNotifications();
    await NotificationService.setBadgeCount(
      await NotificationStorage.getUnreadCount()
    );

    // Handle navigation based on notification type
    if (notification.data?.type === "trip_started") {
      router.push("/screens/(tabs)/history");
    }
  };

  const handleDelete = async (id: string) => {
    await NotificationStorage.delete(id);
    await loadNotifications();
    await NotificationService.setBadgeCount(
      await NotificationStorage.getUnreadCount()
    );
  };

  const handleClearAll = async () => {
    await NotificationStorage.clearAll();
    await loadNotifications();
    await NotificationService.clearBadge();
  };

  const handleMarkAllRead = async () => {
    await NotificationStorage.markAllAsRead();
    await loadNotifications();
    await NotificationService.clearBadge();
  };

  const getNotificationIcon = (type: string) => {
    switch (type) {
      case "trip_started":
        return "car";
      case "trip_near_end":
        return "location";
      case "weather_alert":
        return "rainy";
      case "price_drop":
        return "trending-down";
      case "budget_exceeded":
        return "warning";
      case "routine_suggestion":
        return "time";
      default:
        return "notifications";
    }
  };

  const formatTime = (timestamp: number) => {
    const date = new Date(timestamp);
    const now = new Date();
    const diff = now.getTime() - date.getTime();
    const minutes = Math.floor(diff / 60000);
    const hours = Math.floor(diff / 3600000);
    const days = Math.floor(diff / 86400000);

    if (minutes < 1) return "Just now";
    if (minutes < 60) return `${minutes}m ago`;
    if (hours < 24) return `${hours}h ago`;
    if (days < 7) return `${days}d ago`;
    return date.toLocaleDateString();
  };

  const unreadCount = notifications.filter((n) => !n.read).length;

  return (
    <View
      className="flex-1 bg-gray-50 dark:bg-gray-900"
      style={{ paddingTop: insets.top, paddingBottom: insets.bottom }}
    >
      {/* Header */}
      <View className="bg-white dark:bg-gray-900  px-4 py-4">
        <View className="flex-row items-center justify-between">
          <View className="flex-row items-center gap-3">
            <TouchableOpacity onPress={() => router.back()}>
              <Ionicons name="arrow-back" size={24} color={isDark ? "#F3F4F6" : "#1F2937"} />
            </TouchableOpacity>
            <View>
              <Text className="text-2xl font-bold text-gray-900 dark:text-white">
                Notifications
              </Text>
              {unreadCount > 0 && (
                <Text className="text-sm text-gray-500 dark:text-gray-400">
                  {unreadCount} unread
                </Text>
              )}
            </View>
          </View>

          {notifications.length > 0 && (
            <View className="flex-row gap-2">
              {unreadCount > 0 && (
                <TouchableOpacity
                  onPress={handleMarkAllRead}
                  className="px-3 py-1.5 rounded-lg bg-blue-50 dark:bg-blue-900/30"
                >
                  <Text className="text-sm font-medium text-blue-600 dark:text-blue-400">
                    Mark all read
                  </Text>
                </TouchableOpacity>
              )}
              <TouchableOpacity
                onPress={handleClearAll}
                className="px-3 py-1.5 rounded-lg bg-red-50 dark:bg-red-900/30"
              >
                <Text className="text-sm font-medium text-red-600 dark:text-red-400">
                  Clear all
                </Text>
              </TouchableOpacity>
            </View>
          )}
        </View>
      </View>

      {/* Notifications List */}
      <ScrollView
        className="flex-1"
        refreshControl={
          <RefreshControl refreshing={refreshing} onRefresh={onRefresh} />
        }
      >
        {notifications.length === 0 ? (
          <View className="flex-1 items-center justify-center py-20">
            <Ionicons name="notifications-off" size={64} color={isDark ? "#6B7280" : "#9CA3AF"} />
            <Text className="text-gray-500 dark:text-gray-400 text-lg font-medium mt-4">
              No notifications yet
            </Text>
            <Text className="text-gray-400 dark:text-gray-500 text-sm mt-2 text-center px-8">
              You'll see trip updates, weather alerts, and more here
            </Text>
          </View>
        ) : (
          <View className="px-4 py-2">
            {notifications.map((notification) => (
              <TouchableOpacity
                key={notification.id}
                onPress={() => handleNotificationPress(notification)}
                className={`mb-3 p-4 rounded-xl border ${
                  notification.read
                    ? "bg-white dark:bg-gray-800 border-gray-200 dark:border-gray-700"
                    : "bg-blue-50 dark:bg-blue-900/20 border-blue-200 dark:border-blue-800"
                }`}
              >
                <View className="flex-row gap-3">
                  {/* Icon */}
                  <View
                    className={`w-10 h-10 rounded-full items-center justify-center ${
                      notification.read ? "bg-gray-100 dark:bg-gray-700" : "bg-blue-100 dark:bg-blue-900/40"
                    }`}
                  >
                    <Ionicons
                      name={getNotificationIcon(notification.data?.type)}
                      size={20}
                      color={notification.read ? (isDark ? "#9CA3AF" : "#6B7280") : "#3B82F6"}
                    />
                  </View>

                  {/* Content */}
                  <View className="flex-1">
                    <View className="flex-row justify-between items-start mb-1">
                      <Text
                        className={`flex-1 font-semibold ${
                          notification.read ? "text-gray-700 dark:text-gray-300" : "text-gray-900 dark:text-white"
                        }`}
                      >
                        {notification.title}
                      </Text>
                      {!notification.read && (
                        <View className="w-2 h-2 rounded-full bg-blue-500 ml-2" />
                      )}
                    </View>
                    <Text className="text-gray-600 dark:text-gray-400 text-sm mb-2">
                      {notification.body}
                    </Text>
                    <View className="flex-row items-center justify-between">
                      <Text className="text-xs text-gray-400 dark:text-gray-500">
                        {formatTime(notification.timestamp)}
                      </Text>
                      <TouchableOpacity
                        onPress={() => handleDelete(notification.id)}
                        className="p-1"
                      >
                        <Ionicons
                          name="trash-outline"
                          size={16}
                          color="#EF4444"
                        />
                      </TouchableOpacity>
                    </View>
                  </View>
                </View>
              </TouchableOpacity>
            ))}
          </View>
        )}
      </ScrollView>
    </View>
  );
};

export default NotificationsScreen;
