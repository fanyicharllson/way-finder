/* eslint-disable @typescript-eslint/no-unused-vars */
/* eslint-disable react-hooks/exhaustive-deps */
import { ActivityIndicator, View, Text } from "react-native";
import React, { useEffect, useState } from "react";
import { router } from "expo-router";
import { getToken } from "@/utils/storage";
import AsyncStorage from "@react-native-async-storage/async-storage";

const ONBOARDING_KEY = "@wayfinder_onboarding_completed";
const USER_PREFERENCES_KEY = "@wayfinder_user_preferences";

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
        router.replace("/screens/(auth)/login");
        return;
      }

      // Step 3: User is authenticated - check preferences
      // TODO: Verify token validity with backend (optional)
      // const isValidToken = await verifyToken(token);
      // if (!isValidToken) {
      //   await clearAuthData();
      //   router.replace("/(auth)/login");
      //   return;
      // }

      // TODO: Step 4 - Check if user has completed preferences setup
      // This will be implemented when you design the preferences screen
      const hasCompletedPreferences = await checkUserPreferences();

      if (!hasCompletedPreferences) {
        // User is authenticated but hasn't set preferences
        console.log("⚙️ Authenticated user - showing preferences setup");
        // TODO: Uncomment when preferences screen is ready
        // router.replace("/(preferences)/setup");

        // For now, go to main app
        router.replace("/screens/(tabs)");
        return;
      }

      // Step 5: All checks passed - go to main app
      console.log("✅ Authenticated user with preferences - showing dashboard");
      router.replace("/screens/(tabs)");
    } catch (error) {
      console.error("❌ Error checking app state:", error);
      // On error, default to login screen for safety
      router.replace("/screens/(auth)/login");
    } finally {
      setIsLoading(false);
    }
  };

  /**
   * Check if user has completed their preferences
   * TODO: Replace with actual API call to check preferences in database
   * @returns Promise<boolean>
   */
  const checkUserPreferences = async (): Promise<boolean> => {
    try {
      // TODO: Call backend API to check if user has preferences
      // const response = await fetch('YOUR_API/user/preferences');
      // const data = await response.json();
      // return data.hasPreferences;

      // For now, check local storage
      const preferences = await AsyncStorage.getItem(USER_PREFERENCES_KEY);
      return !!preferences;
    } catch (error) {
      console.error("Error checking preferences:", error);
      return false;
    }
  };

  return (
    <View className="flex-1 bg-[#0A0F1A] items-center justify-center">
      {/* Loading indicator */}
      <ActivityIndicator size="large" color="white" />

      {/* App name or logo */}
      <Text className="text-white text-2xl font-bold mt-6">WayFinder</Text>

      <Text className="text-white/60 text-sm mt-2 animate-pulse">
        Loading your journey...
      </Text>
    </View>
  );
};

export default Index;
