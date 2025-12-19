/* eslint-disable @typescript-eslint/no-unused-vars */
/* eslint-disable react-hooks/exhaustive-deps */
import { View, Text, TouchableOpacity } from "react-native";
import React, { useEffect, useState } from "react";
import { router } from "expo-router";
import { getToken } from "@/utils/storage";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { useProfile } from "@/hooks/useAuth";
import LottieView from "lottie-react-native";

const ONBOARDING_KEY = "@wayfinder_onboarding_completed";

const Index = () => {
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<{
    message: string;
    retryFn: () => void;
  } | null>(null);
  const { data: user } = useProfile();
  const userName = user?.name.split(" ")[0] || "";

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
      } catch (error: any) {
        console.error("❌ Error checking preferences:", error);
        // If auth error, let api client handle redirect (it will guard duplicates)
        if (error?.response?.status === 401) {
          return;
        }
        // On other errors, redirect to error screen with retry option
        setError({
          message:
            "Unable to verify your preferences. Please check your internet connection and try again.",
          retryFn: checkAppState,
        });
      }
    } catch (error: any) {
      console.error("❌ Error checking app state:", error);
      // If auth error (invalid/expired token) let api client handle redirect
      if (error?.response?.status === 401) {
        return;
      }
      // Check if it's a token retrieval error
      setError({
        message:
          "Unable to retrieve your authentication details. Please ensure you're connected to the internet and try again.",
        retryFn: checkAppState,
      });
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
    <>
      {error ? (
        // Error State - Show error screen with retry option
        <View className="flex-1 bg-[#0A0F1A] items-center justify-center">
          <LottieView
            source={require("@/assets/lottie/error.json")}
            autoPlay
            loop={false}
            style={{ width: 200, height: 200 }}
          />
          <Text className="text-white text-2xl font-bold mt-6 text-center px-4">
            Oops! Something Went Wrong
          </Text>
          <Text className="text-white/60 text-sm mt-4 text-center px-6 leading-5">
            {error.message}
          </Text>
          <TouchableOpacity
            onPress={() => {
              setError(null);
              error.retryFn();
            }}
            className="mt-8 bg-blue-600 px-8 py-3 rounded-lg"
          >
            <Text className="text-white font-semibold">Try Again</Text>
          </TouchableOpacity>
        </View>
      ) : (
        // Loading State
        <View className="flex-1 bg-[#0A0F1A] items-center justify-center">
          {/* Lottie Loading Animation */}
          <LottieView
            source={require("@/assets/lottie/loading.json")}
            autoPlay
            loop
            style={{ width: 200, height: 200 }}
          />
          {/* App name or logo */}
          <Text className="text-white text-2xl font-bold">WayFinder</Text>

          <Text className="text-white/60 text-sm mt-2">
            Just a moment {userName || ""}...
          </Text>
        </View>
      )}
    </>
  );
};

export default Index;
