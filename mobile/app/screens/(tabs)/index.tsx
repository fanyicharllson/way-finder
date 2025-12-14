import React from "react";
import { ScrollView, View } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { useColorScheme } from "nativewind";
import { router } from "expo-router";
import { HomeHeader } from "@/app/components/home/HomeHeader";
import { RecentSearches } from "@/app/components/home/RecentSearches";
import { RecommendationCard } from "@/app/components/home/RecommendationCard";
import { RouteSearchCard } from "@/app/components/home/RouteSearchCard";
import { useProfile } from "@/hooks/useAuth";
import { AIFloatingButton } from "@/app/components/ui/AIFloatingButton";
import { showToast } from "@/utils/toast";

export default function HomeScreen() {
  const { colorScheme } = useColorScheme();
  const isDark = colorScheme === "dark";
  const { data: user } = useProfile();

  const userName = user?.name.split(" ")[0] || "";

  const handleSearch = (from: string, to: string) => {
    console.log("Searching route:", { from, to });
    router.push(
      `/screens/(extrascreens)/route-results?from=${encodeURIComponent(
        from
      )}&to=${encodeURIComponent(to)}`
    );
  };

  function handleAIPress(): void {
    showToast({
      type: "info",
      text1: "AI Assistant is coming soon!",
      text2: "Stay tuned for updates.",
    })
  }

  return (
    <SafeAreaView className="flex-1 bg-gray-50 dark:bg-gray-900">
      <ScrollView showsVerticalScrollIndicator={false}>
        <HomeHeader
          userName={userName}
          temperature={28}
          onNotificationPress={() => console.log("Notifications")}
          isDark={isDark}
        />

        <RouteSearchCard
          onSearch={handleSearch}
          onChooseFavorite={() => router.push("/screens/(tabs)/favorite")}
          onEditPreferences={() =>
            router.push("/screens/(extrascreens)/preferences")
          }
          isDark={isDark}
        />

        <RecommendationCard
          onViewDetails={() => console.log("View details")}
          isDark={isDark}
        />

        <RecentSearches
          onSelectSearch={(from, to) => handleSearch(from, to)}
          isDark={isDark}
        />

        <View className="h-8" />
      </ScrollView>
      <AIFloatingButton
        onPress={handleAIPress}
        visible={true}
        bottom={60}
        right={24}
        testID="ai-fab"
        
      />
    </SafeAreaView>
  );
}
