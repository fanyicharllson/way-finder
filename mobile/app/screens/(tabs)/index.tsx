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

export default function HomeScreen() {
  const { colorScheme } = useColorScheme();
  const isDark = colorScheme === "dark";
  const { data: user } = useProfile();

  const userName = user?.name.split(" ")[0] || "";
  const mockRecommendation = {
    from: "Mokolo",
    to: "Carrefour Nlongkak",
    mode: "moto" as const,
    cost: 500,
    duration: "15m",
  };
  

  const handleSearch = (from: string, to: string) => {
    console.log("Searching route:", { from, to });
    router.push(
      `/screens/(extrascreens)/route-results?from=${encodeURIComponent(
        from
      )}&to=${encodeURIComponent(to)}`
    );
  };

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
          recommendation={mockRecommendation}
          onViewDetails={() => console.log("View details")}
          isDark={isDark}
        />

        <RecentSearches
          onSelectSearch={(from, to) => handleSearch(from, to)}
          isDark={isDark}
        />

        <View className="h-8" />
      </ScrollView>
    </SafeAreaView>
  );
}
