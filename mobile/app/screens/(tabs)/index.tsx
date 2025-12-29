import React, { useRef, useState } from "react";
import { ScrollView, View, Text, TouchableOpacity } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { useColorScheme } from "nativewind";
import { router } from "expo-router";
import { Ionicons } from "@expo/vector-icons";
import { HomeHeader } from "@/components/home/HomeHeader";
import { RecentSearches } from "@/components/home/RecentSearches";
import { RecommendationCard } from "@/components/home/RecommendationCard";
import { RouteSearchCard } from "@/components/home/RouteSearchCard";
import { useProfile } from "@/hooks/useAuth";
import { AIFloatingButton } from "@/components/ui/AIFloatingButton";
import { SmartSuggestion } from "@/components/ai/SmartSuggestion";
import { TravelTips } from "@/components/ai/TravelTips";

// Section Header Component
const SectionHeader = ({ icon, title, subtitle, isDark }: { icon: any, title: string, subtitle?: string, isDark: boolean }) => (
  <View className="px-4 mb-3">
    <View className="flex-row items-center">
      <View className="w-9 h-9 bg-blue-500/10 dark:bg-blue-500/20 rounded-full items-center justify-center mr-3">
        <Ionicons name={icon} size={20} color="#3B82F6" />
      </View>
      <View className="flex-1">
        <Text className="text-lg font-bold text-gray-900 dark:text-white">
          {title}
        </Text>
        {subtitle && (
          <Text className="text-xs text-gray-500 dark:text-gray-400 mt-0.5">
            {subtitle}
          </Text>
        )}
      </View>
    </View>
  </View>
);

export default function HomeScreen() {
  const { colorScheme } = useColorScheme();
  const isDark = colorScheme === "dark";
  const { data: user } = useProfile();
  const scrollViewRef = useRef<ScrollView>(null);
  const [shouldFocusDestination, setShouldFocusDestination] = useState(false);

  const userName = user?.name.split(" ")[0] || "";

  const handleSearch = (from: string, to: string) => {
    console.log("Searching route:", { from, to });
    router.push(
      `/screens/(extrascreens)/route-results?from=${encodeURIComponent(
        from
      )}&to=${encodeURIComponent(to)}`
    );
  };

  const scrollToSearch = () => {
    // Scroll to the search section with a smooth animation then focus input
    scrollViewRef.current?.scrollTo({
      y: 550, // Adjust if layout changes
      animated: true,
    });
    // Trigger focus once the section is in view
    setShouldFocusDestination(true);
  };

  function handleAIPress(): void {
    router.push("/screens/(extrascreens)/ai-chat");
  }

  return (
    <SafeAreaView className="flex-1 bg-gray-50 dark:bg-gray-900">
      <ScrollView ref={scrollViewRef} showsVerticalScrollIndicator={false}>
        <HomeHeader
          userName={userName}
          temperature={28}
          onNotificationPress={() => console.log("Notifications")}
          isDark={isDark}
        />

        {/* Sticky Search Bar */}
        <TouchableOpacity
          onPress={scrollToSearch}
          className={`mx-4 mb-3 flex-row items-center px-4 py-3 rounded-full border ${
            isDark
              ? "bg-gray-800 border-gray-700"
              : "bg-white border-gray-200"
          }`}
          activeOpacity={0.3}
        >
          <Ionicons
            name="search"
            size={18}
            color={isDark ? "#9CA3AF" : "#6B7280"}
          />
          <Text
            className={`ml-3 text-base ${
              isDark ? "text-gray-400" : "text-gray-500"
            }`}
          >
            Where to?
          </Text>
        </TouchableOpacity>

        {/* AI Insights Section */}
        <View className="mt-2 mb-4">
          <SectionHeader 
            icon="sparkles" 
            title="AI Insights" 
            subtitle="Personalized suggestions powered by AI"
            isDark={isDark}
          />
          <View className="px-4 space-y-4">
            <SmartSuggestion isDark={isDark} />
            <TravelTips isDark={isDark} />
          </View>
        </View>

        {/* Search Route Section */}
        <View className="mb-4">
          <SectionHeader 
            icon="search" 
            title="Search Route" 
            subtitle="Where do you want to go today?"
            isDark={isDark}
          />
          <RouteSearchCard
            onSearch={handleSearch}
            onChooseFavorite={() => router.push("/screens/(tabs)/favorite")}
            onEditPreferences={() =>
              router.push("/screens/(extrascreens)/preferences")
            }
            isDark={isDark}
            shouldFocusDestination={shouldFocusDestination}
            onDestinationFocused={() => setShouldFocusDestination(false)}
          />
        </View>

        {/* Quick Access Section */}
        <View className="mb-4">
          <SectionHeader 
            icon="star" 
            title="Quick Access" 
            subtitle="Based on your preferences"
            isDark={isDark}
          />
          <RecommendationCard
            onViewDetails={() => console.log("View details")}
            isDark={isDark}
          />
        </View>

        {/* Recent Searches Section */}
        <View className="mb-4">
          <SectionHeader 
            icon="time" 
            title="Recent Searches" 
            subtitle="Pick up where you left off"
            isDark={isDark}
          />
          <RecentSearches
            onSelectSearch={(from, to) => handleSearch(from, to)}
            isDark={isDark}
          />
        </View>

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
