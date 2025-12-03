/* eslint-disable @typescript-eslint/no-unused-vars */
/* eslint-disable react-hooks/exhaustive-deps */
import { ActivityIndicator, View, Text } from "react-native";
import React, { useEffect, useState } from "react";
import { router } from "expo-router";
import { getToken } from "@/utils/storage";
import AsyncStorage from "@react-native-async-storage/async-storage";

const ONBOARDING_KEY = "@wayfinder_onboarding_completed";

const Index = () => {
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    checkAppState();
  }, []);

  const checkAppState = async () => {
    try {
      // Step 1: Check if onboarding has been completed
      const hasSeenOnboarding = await AsyncStorage.getItem(ONBOARDING_KEY);

      if (!hasSeenOnboarding) {
        // First time user - show onboarding
        console.log("📱 First launch - showing onboarding");
        router.replace("/screens/onboarding.screen");
        return;
      }

      // Step 2: Check if user has valid authentication token
      const token = await getToken();

      if (!token) {
        // No token - user needs to login or register
        console.log("🔐 No token found - showing login");
        router.replace("/screens/login");
        return;
      }

      // Step 3: User is authenticated - check preferences
      console.log("✅ User authenticated - checking preferences");

      try {
        // Check if user has preferences in backend
        const preferences = await checkUserPreferences();

        if (!preferences) {
          // No preferences found - show preferences setup
          console.log("⚙️ No preferences found - showing preferences setup");
          router.replace("/screens/(extrascreens)/preferences");
          return;
        }

        if (!preferences.isComplete) {
          // Preferences exist but incomplete - show preferences setup
          console.log("⚙️ Incomplete preferences - showing preferences setup");
          router.replace("/screens/(extrascreens)/preferences");
          return;
        }

        // Preferences are complete - go to home
        console.log("🎉 Complete preferences found - showing home");
        router.replace("/screens/(tabs)");
      } catch (error) {
        console.error("❌ Error checking preferences:", error);
        // On error, still go to home (graceful fallback)
        router.replace("/screens/(tabs)");
      }
    } catch (error) {
      console.error("❌ Error checking app state:", error);
      // On error, default to login screen for safety
      router.replace("/screens/login");
    } finally {
      setIsLoading(false);
    }
  };

  /**
   * Check if user has completed their preferences
   * Calls backend API to verify preferences status
   * @returns Promise<UserPreferenceResponse | null>
   */
  const checkUserPreferences = async (): Promise<any | null> => {
    try {
      // Import apiClient dynamically to avoid circular dependencies
      const { apiClient } = await import("@/app/api/client");

      const response = await apiClient.get("/preferences");

      if (response.data?.data) {
        return response.data.data;
      }

      return null;
    } catch (error: any) {
      if (error.response?.status === 404) {
        // 404 means user has no preferences - this is expected for new users
        return null;
      }
      // For other errors, re-throw to be handled by caller
      throw error;
    }
  };

  return (
    <View className="flex-1 bg-[#0A0F1A] items-center justify-center">
      {/* Loading indicator */}
      <ActivityIndicator size="large" color="white" />

      {/* App name or logo */}
      <Text className="text-white text-2xl font-bold mt-6">WayFinder</Text>

      <Text className="text-white/60 text-sm mt-2">
        Loading your journey...
      </Text>
    </View>
  );
};

export default Index;
