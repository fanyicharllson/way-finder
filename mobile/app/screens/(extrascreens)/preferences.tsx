import PreferencesScreenComponent from "@/app/components/screens.components/userpreference.component";
import SuccessErrorScreen from "@/app/components/success.error.screen";
import { useGetPreferences } from "@/hooks/usePreferences";
import { router } from "expo-router";
import { ActivityIndicator, View, Text } from "react-native";

export default function UserPreferenceScreen() {
  const {
    data: existingPreferences,
    isLoading,
    error,
    refetch,
  } = useGetPreferences();

  if (isLoading) {
    return (
      <View className="flex-1 bg-[#0A0F1A] items-center justify-center">
        {/* Loading indicator */}
        <ActivityIndicator size="large" color="white" />

        <Text className="text-white text-3xl font-bold mt-6">WayFinder</Text>

        <Text className="text-white/90 text-sm mt-2 italic animate-pulse">
          Please give me a sec while I load your preferences...
        </Text>
      </View>
    );
  }

  if (error) {
    return (
      <SuccessErrorScreen
        type="error"
        title="Something went wrong!"
        message={`${error.message}`}
        animationSource={require("@/assets/lottie/error.json")}
        onContinue={() => router.back()}
        onRetry={() => refetch()}
      />
    );
  }

  return (
    <PreferencesScreenComponent
      initialData={
        existingPreferences
          ? {
              maxBudget: existingPreferences.maxBudget,
              preferredModes: existingPreferences.preferredModes,
              avoidanceZones: existingPreferences.avoidanceZones,
              priorityType: existingPreferences.priorityType as any,
            }
          : undefined
      }
    />
  );
}
