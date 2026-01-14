import AsyncStorage from "@react-native-async-storage/async-storage";

const NOTIFICATIONS_KEY = "@notifications";

export interface StoredNotification {
  id: string;
  title: string;
  body: string;
  data?: any;
  timestamp: number;
  read: boolean;
  type: string;
}

export class NotificationStorage {
  // Get all notifications
  static async getAll(): Promise<StoredNotification[]> {
    try {
      const data = await AsyncStorage.getItem(NOTIFICATIONS_KEY);
      return data ? JSON.parse(data) : [];
    } catch (error) {
      console.error("Failed to get notifications:", error);
      return [];
    }
  }

  // Save a new notification
  static async save(notification: StoredNotification): Promise<void> {
    try {
      const notifications = await this.getAll();
      notifications.unshift(notification); // Add to start
      await AsyncStorage.setItem(NOTIFICATIONS_KEY, JSON.stringify(notifications));
    } catch (error) {
      console.error("Failed to save notification:", error);
    }
  }

  // Mark notification as read
  static async markAsRead(id: string): Promise<void> {
    try {
      const notifications = await this.getAll();
      const updated = notifications.map((n) =>
        n.id === id ? { ...n, read: true } : n
      );
      await AsyncStorage.setItem(NOTIFICATIONS_KEY, JSON.stringify(updated));
    } catch (error) {
      console.error("Failed to mark notification as read:", error);
    }
  }

  // Mark all as read
  static async markAllAsRead(): Promise<void> {
    try {
      const notifications = await this.getAll();
      const updated = notifications.map((n) => ({ ...n, read: true }));
      await AsyncStorage.setItem(NOTIFICATIONS_KEY, JSON.stringify(updated));
    } catch (error) {
      console.error("Failed to mark all as read:", error);
    }
  }

  // Delete a notification
  static async delete(id: string): Promise<void> {
    try {
      const notifications = await this.getAll();
      const filtered = notifications.filter((n) => n.id !== id);
      await AsyncStorage.setItem(NOTIFICATIONS_KEY, JSON.stringify(filtered));
    } catch (error) {
      console.error("Failed to delete notification:", error);
    }
  }

  // Clear all notifications
  static async clearAll(): Promise<void> {
    try {
      await AsyncStorage.removeItem(NOTIFICATIONS_KEY);
    } catch (error) {
      console.error("Failed to clear notifications:", error);
    }
  }

  // Get unread count
  static async getUnreadCount(): Promise<number> {
    try {
      const notifications = await this.getAll();
      return notifications.filter((n) => !n.read).length;
    } catch (error) {
      console.error("Failed to get unread count:", error);
      return 0;
    }
  }
}
