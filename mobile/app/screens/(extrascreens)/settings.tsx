import React, { useState } from "react";
import { View, Text, TouchableOpacity, ScrollView, Modal } from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { router } from "expo-router";
import { useLogout, useProfile } from "@/hooks/useAuth";
import { useColorScheme } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import SkeletonLoader from "@/components/settings/skeleton.loader.component";
import { showToast } from "@/utils/toast";

export default function SettingsScreen() {
  const colorScheme = useColorScheme();
  const isDark = colorScheme === "dark";
  const [showLogoutModal, setShowLogoutModal] = useState(false);

  const logout = useLogout();
  const { data: user, isLoading, error, refetch } = useProfile();

  const handleLogout = () => {
    setShowLogoutModal(true);
  };

  const confirmLogout = async () => {
    setShowLogoutModal(false);
    try {
      await logout.mutateAsync();
      // Redirect to login screen
      router.replace("/screens/(auth)/login" as any);
    } catch (error) {
      // If logout fails, still redirect to login
      // (the useLogout hook already clears local data in onError)
      router.replace("/screens/(auth)/login" as any);
    }
  };

  const handleRetry = () => {
    refetch();
  };

  const SettingItem = ({
    icon,
    title,
    subtitle,
    onPress,
    showChevron = true,
    textColor,
    isFirst = false,
    isLast = false,
  }: {
    icon: keyof typeof Ionicons.glyphMap;
    title: string;
    subtitle?: string;
    onPress: () => void;
    showChevron?: boolean;
    textColor?: string;
    isFirst?: boolean;
    isLast?: boolean;
  }) => (
    <TouchableOpacity
      onPress={onPress}
      className={`flex-row items-center px-4 py-4 bg-white dark:bg-gray-800 ${
        !isLast ? "border-b border-gray-100 dark:border-gray-700" : ""
      } ${isFirst ? "rounded-t-lg" : ""} ${isLast ? "rounded-b-lg" : ""}`}
      activeOpacity={0.7}
    >
      <View className="w-10 h-10 rounded-full bg-gray-100 dark:bg-gray-700 items-center justify-center mr-3">
        <Ionicons
          name={icon}
          size={20}
          color={textColor || (isDark ? "#9CA3AF" : "#4B5563")}
        />
      </View>
      <View className="flex-1">
        <Text
          className={`font-semibold ${
            textColor ? "" : "text-gray-900 dark:text-white"
          }`}
          style={textColor ? { color: textColor } : {}}
        >
          {title}
        </Text>
        {subtitle && (
          <Text className="text-sm text-gray-500 dark:text-gray-400 mt-0.5">
            {subtitle}
          </Text>
        )}
      </View>
      {showChevron && (
        <Ionicons
          name="chevron-forward"
          size={20}
          color={isDark ? "#6B7280" : "#9CA3AF"}
        />
      )}
    </TouchableOpacity>
  );

  const SectionHeader = ({ title }: { title: string }) => (
    <View className="px-4 py-2 bg-gray-50 dark:bg-gray-900">
      <Text className="text-xs font-semibold text-gray-500 dark:text-gray-400 uppercase">
        {title}
      </Text>
    </View>
  );

  const ErrorState = () => (
    <View className="flex-1 items-center justify-center px-6">
      <View className="w-20 h-20 rounded-full bg-red-100 dark:bg-red-900/20 items-center justify-center mb-4">
        <Ionicons name="alert-circle" size={40} color="#EF4444" />
      </View>
      <Text className="text-xl font-bold text-gray-900 dark:text-white text-center mb-2">
        Failed to Load Profile
      </Text>
      <Text className="text-gray-600 dark:text-gray-400 text-center mb-6">
        {error?.message ||
          "Unable to fetch your profile data. Please check your connection and try again."}
      </Text>
      <View className="flex-row gap-3">
        <TouchableOpacity
          onPress={() => router.back()}
          className="px-6 py-3 bg-gray-100 dark:bg-gray-700 rounded-xl"
          activeOpacity={0.7}
        >
          <Text className="text-gray-900 dark:text-white font-semibold">
            Go Back
          </Text>
        </TouchableOpacity>
        <TouchableOpacity
          onPress={handleRetry}
          className="px-6 py-3 bg-purple-600 rounded-xl"
          activeOpacity={0.7}
        >
          <View className="flex-row items-center gap-2">
            <Ionicons name="refresh" size={18} color="#FFFFFF" />
            <Text className="text-white font-semibold">Retry</Text>
          </View>
        </TouchableOpacity>
      </View>
    </View>
  );

  return (
    <SafeAreaView className="flex-1 bg-gray-50 dark:bg-gray-900">
      {/* Header */}
      <View className="px-4 py-4 bg-white dark:bg-gray-900">
        <View className="flex-row items-center">
          <TouchableOpacity
            onPress={() => router.back()}
            className="w-10 h-10 rounded-full bg-gray-100 dark:bg-gray-700 items-center justify-center mr-3"
            activeOpacity={0.7}
          >
            <Ionicons
              name="arrow-back"
              size={24}
              color={isDark ? "#FFFFFF" : "#000000"}
            />
          </TouchableOpacity>
          <Text className="text-2xl font-bold text-gray-900 dark:text-white flex-1">
            Settings
          </Text>
        </View>
      </View>

      {isLoading ? (
        <ScrollView className="flex-1" showsVerticalScrollIndicator={false}>
          <SkeletonLoader />
        </ScrollView>
      ) : error ? (
        <ErrorState />
      ) : (
        <ScrollView
          className="flex-1 px-4"
          showsVerticalScrollIndicator={false}
        >
          {/* Account Section */}
          <SectionHeader title="Account" />
          <View className="mb-4">
            <View className="px-4 py-4 bg-white dark:bg-gray-800 rounded-lg">
              <View className="flex-row items-center">
                <View className="w-16 h-16 rounded-full bg-purple-100 dark:bg-purple-900/20 items-center justify-center mr-3">
                  <Text className="text-2xl font-bold text-purple-600 dark:text-purple-400">
                    {user?.name.charAt(0).toUpperCase() || "U"}
                  </Text>
                </View>
                <View className="flex-1">
                  <Text className="text-lg font-bold text-gray-900 dark:text-white">
                    {user?.name || "User"}
                  </Text>
                  <Text className="text-sm text-gray-500 dark:text-gray-400">
                    {user?.email || ""}
                  </Text>
                </View>
              </View>
            </View>
          </View>

          {/* Preferences Section */}
          <SectionHeader title="App Settings" />
          <View className="mb-4">
            <SettingItem
              icon="options-outline"
              title="Travel Preferences"
              subtitle="Budget, transport modes, priorities"
              onPress={() =>
                router.push("/screens/(extrascreens)/preferences" as any)
              }
              isFirst
            />
            <SettingItem
              icon="notifications-outline"
              title="Notifications"
              subtitle="Manage your notification settings"
              onPress={() =>
                router.push("/screens/(extrascreens)/notifications" as any)
              }
              isLast
            />
          </View>

          {/* About Section */}
          <SectionHeader title="About" />
          <View className="mb-4">
            <SettingItem
              icon="information-circle-outline"
              title="App Version"
              subtitle="1.0.0"
              onPress={() => {}}
              showChevron={false}
              isFirst
            />
            <SettingItem
              icon="help-circle-outline"
              title="Help & Support"
              subtitle="Get help or report issues"
              onPress={() => {
                // TODO: Navigate to help screen
                showToast({
                  type: "info",
                  text1: "Help & Support",
                  text2: "This feature is coming soon.",
                });
              }}
            />
            <SettingItem
              icon="document-text-outline"
              title="Privacy Policy"
              subtitle="Learn how we protect your data"
              onPress={() => {
                // TODO: Navigate to privacy policy
                showToast({
                  type: "info",
                  text1: "Privacy Policy",
                  text2: "This feature is coming soon.",
                });
              }}
            />
            <SettingItem
              icon="document-outline"
              title="Terms of Service"
              subtitle="Read our terms and conditions"
              onPress={() => {
                // TODO: Navigate to terms of service
                showToast({
                  type: "info",
                  text1: "Terms of Service",
                  text2: "This feature is coming soon.",
                });
              }}
              isLast
            />
          </View>

          {/* Logout Section */}
          <View className="mb-8">
            <SettingItem
              icon="log-out-outline"
              title="Logout"
              subtitle="Sign out of your account"
              onPress={handleLogout}
              showChevron={false}
              textColor="#EF4444"
              isFirst
              isLast
            />
          </View>
        </ScrollView>
      )}

      {/* Logout Confirmation Modal */}
      <Modal
        visible={showLogoutModal}
        transparent
        animationType="fade"
        onRequestClose={() => setShowLogoutModal(false)}
      >
        <View className="flex-1 bg-black/50 items-center justify-center px-4">
          <View className="bg-white dark:bg-gray-800 rounded-2xl p-6 w-full max-w-sm">
            <View className="w-16 h-16 rounded-full bg-red-100 dark:bg-red-900/20 items-center justify-center self-center mb-4">
              <Ionicons name="log-out-outline" size={32} color="#EF4444" />
            </View>

            <Text className="text-xl font-bold text-gray-900 dark:text-white text-center mb-2">
              Logout?
            </Text>
            <Text className="text-gray-600 dark:text-gray-400 text-center mb-6">
              Are you sure you want to logout? You'll need to sign in again to
              access your account.
            </Text>

            <View className="flex-row gap-3">
              <TouchableOpacity
                onPress={() => setShowLogoutModal(false)}
                className="flex-1 py-3 bg-gray-100 dark:bg-gray-700 rounded-xl"
                activeOpacity={0.7}
              >
                <Text className="text-gray-900 dark:text-white font-semibold text-center">
                  Cancel
                </Text>
              </TouchableOpacity>

              <TouchableOpacity
                onPress={confirmLogout}
                className="flex-1 py-3 bg-red-500 rounded-xl"
                activeOpacity={0.7}
                disabled={logout.isPending}
              >
                <Text className="text-white font-semibold text-center">
                  {logout.isPending ? "Logging out..." : "Logout"}
                </Text>
              </TouchableOpacity>
            </View>
          </View>
        </View>
      </Modal>
    </SafeAreaView>
  );
}
