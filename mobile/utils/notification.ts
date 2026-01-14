import * as Notifications from "expo-notifications";
import * as Device from "expo-device";
import { Platform } from "react-native";
import Constants from "expo-constants";
import { NotificationStorage } from "./notificationStorage";

// Configure notification behavior
Notifications.setNotificationHandler({
  handleNotification: async () => ({
    shouldPlaySound: true,
    shouldSetBadge: true,
    shouldShowBanner: true,
    shouldShowList: true,
  }),
});

export class NotificationService {
  private static expoPushToken: string | null = null;

  // Initialize notifications and get permission
  static async initialize(): Promise<string | null> {
    if (!Device.isDevice) {
      console.log("📱 Notifications only work on physical devices");
      return null;
    }

    try {
      // Request permissions
      const { status: existingStatus } =
        await Notifications.getPermissionsAsync();
      let finalStatus = existingStatus;

      if (existingStatus !== "granted") {
        const { status } = await Notifications.requestPermissionsAsync();
        finalStatus = status;
      }

      if (finalStatus !== "granted") {
        console.log("⚠️ Notification permission denied");
        return null;
      }

      console.log("✅ Notification permissions granted");

      // Configure Android channel (required for local notifications)
      if (Platform.OS === "android") {
        await Notifications.setNotificationChannelAsync("default", {
          name: "default",
          importance: Notifications.AndroidImportance.MAX,
          vibrationPattern: [0, 250, 250, 250],
          lightColor: "#3B82F6",
        });
        console.log("✅ Android notification channel configured");
      }

      // Try to get push token (optional - only for push notifications)
      try {
        const token = await Notifications.getExpoPushTokenAsync({
          projectId: Constants.expoConfig?.extra?.eas?.projectId,
        });
        this.expoPushToken = token.data;
        console.log("✅ Push token obtained:", token.data);
      } catch (pushError) {
        // Firebase/FCM not configured - that's OK, local notifications still work
        console.log("ℹ️ Push notifications not available (Firebase not configured)");
        console.log("✅ Local notifications will still work!");
      }

      return this.expoPushToken;
    } catch (error) {
      console.error("❌ Failed to initialize notifications:", error);
      return null;
    }
  }

  // Schedule local notification
  static async scheduleNotification(
    title: string,
    body: string,
    data?: any,
    trigger?: Notifications.NotificationTriggerInput
  ) {
    try {
      const id = await Notifications.scheduleNotificationAsync({
        content: {
          title,
          body,
          data,
          sound: true,
        },
        trigger: trigger || null, // null = immediate
      });

      // Save to storage for notification screen
      await NotificationStorage.save({
        id,
        title,
        body,
        data,
        timestamp: Date.now(),
        read: false,
        type: data?.type || "general",
      });

      // Update badge count
      const unreadCount = await NotificationStorage.getUnreadCount();
      await this.setBadgeCount(unreadCount);

      return id;
    } catch (error) {
      console.error("Failed to schedule notification:", error);
      return null;
    }
  }

  // Trip notifications
  static async notifyTripStarted(
    destination: string,
    estimatedArrival: string
  ) {
    return this.scheduleNotification(
      "🚗 Trip Started",
      `Your trip to ${destination} has started! Estimated arrival: ${estimatedArrival}`,
      { type: "trip_started" }
    );
  }

  static async notifyTripNearEnd(destination: string) {
    return this.scheduleNotification(
      "📍 Almost There",
      `Are you almost at ${destination}? Tap to complete your trip.`,
      { type: "trip_near_end" }
    );
  }

  static async notifyWeatherAlert(condition: string, routeName: string) {
    return this.scheduleNotification(
      `${condition === "rain" ? "🌧️" : "⚠️"} Weather Alert`,
      `${condition} detected on your route to ${routeName}. Consider alternatives.`,
      { type: "weather_alert" }
    );
  }

  static async notifyPriceDrop(
    route: string,
    oldPrice: number,
    newPrice: number
  ) {
    const savings = oldPrice - newPrice;
    return this.scheduleNotification(
      "🎉 Price Drop Alert",
      `${route} now ${newPrice} FCFA (was ${oldPrice} FCFA). Save ${savings} FCFA!`,
      { type: "price_drop" }
    );
  }

  static async notifyBudgetExceeded(
    route: string,
    cost: number,
    budget: number
  ) {
    return this.scheduleNotification(
      "⚠️ Budget Alert",
      `${route} now costs ${cost} FCFA - above your ${budget} FCFA budget.`,
      { type: "budget_exceeded" }
    );
  }

  static async notifyRoutineSuggestion(destination: string, time: string) {
    return this.scheduleNotification(
      "🚗 Time to Go?",
      `It's ${time}. Ready for your usual trip to ${destination}?`,
      { type: "routine_suggestion" }
    );
  }

  // Cancel notification
  static async cancelNotification(notificationId: string) {
    await Notifications.cancelScheduledNotificationAsync(notificationId);
  }

  // Cancel all notifications
  static async cancelAllNotifications() {
    await Notifications.cancelAllScheduledNotificationsAsync();
  }

  // Get notification badge count
  static async getBadgeCount(): Promise<number> {
    return await Notifications.getBadgeCountAsync();
  }

  // Set notification badge count
  static async setBadgeCount(count: number) {
    await Notifications.setBadgeCountAsync(count);
  }

  // Clear badge
  static async clearBadge() {
    await Notifications.setBadgeCountAsync(0);
  }
}
