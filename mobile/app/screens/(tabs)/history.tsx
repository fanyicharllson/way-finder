import React, { useState } from "react";
import {
  View,
  Text,
  ScrollView,
  TouchableOpacity,
  RefreshControl,
  SectionList,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { Ionicons } from "@expo/vector-icons";
import { useColorScheme } from "react-native";
import {
  Skeleton,
  SkeletonCard,
  SkeletonAnalyticsCard,
} from "@/components/ui/Skeleton";
import { showToast } from "@/utils/toast";
import { AnalyticsCards } from "@/components/history/AnalyticsCards";
import { FilterModal } from "@/components/history/FilterModal";
import { TripCard } from "@/components/history/TripCard";
import { useTripHistory, useTripAnalytics } from "@/hooks/useTrip";
import { FloatingActionButton } from "@/components/ui/FloatingActionButton";
import { AIFloatingButton } from "@/components/ui/AIFloatingButton";
import { AddTripModal } from "@/components/history/AddTripModal";
import { router } from "expo-router";

const HistoryScreen = () => {
  const colorScheme = useColorScheme();
  const isDark = colorScheme === "dark";

  const [refreshing, setRefreshing] = useState(false);
  const [showFilter, setShowFilter] = useState(false);
  const [filters, setFilters] = useState<any>({});
  const [showAddTrip, setShowAddTrip] = useState(false);
  

  const {
    data: tripsData,
    isLoading: tripsLoading,
    isError: tripsError,
    refetch: refetchTrips,
  } = useTripHistory(filters);
  const { data: analyticsData, isLoading: analyticsLoading } =
    useTripAnalytics();

  const onRefresh = async () => {
    setRefreshing(true);
    await refetchTrips();
    setRefreshing(false);
  };

  const handleApplyFilters = (newFilters: any) => {
    setFilters(newFilters);
    const modeCount = newFilters.modes?.length || 0;
    if (modeCount > 0) {
      showToast({
        type: "info",
        text1: "Filter Applied",
        text2: `Showing trips for ${modeCount} transport ${
          modeCount === 1 ? "mode" : "modes"
        }`,
      });
    }
  };

  const handleAddTrip = () => {
    setShowAddTrip(true);
  };

  const handleAIPress = () => {
    router.push("/screens/(extrascreens)/ai-chat");
  };
  

  const groupTripsByDate = (trips: any[]) => {
    const grouped: { [key: string]: any[] } = {};

    trips.forEach((trip) => {
      const date = new Date(trip.startTime);
      const today = new Date();
      const yesterday = new Date(today);
      yesterday.setDate(yesterday.getDate() - 1);

      let dateKey;
      if (date.toDateString() === today.toDateString()) {
        dateKey = "Today";
      } else if (date.toDateString() === yesterday.toDateString()) {
        dateKey = "Yesterday";
      } else {
        dateKey = date.toLocaleDateString("en-US", {
          month: "short",
          day: "numeric",
        });
      }

      if (!grouped[dateKey]) {
        grouped[dateKey] = [];
      }
      grouped[dateKey].push(trip);
    });

    return Object.keys(grouped).map((key) => ({
      title: key,
      data: grouped[key],
    }));
  };

  // Loading State
  if (tripsLoading && analyticsLoading) {
    return (
      <View className="flex-1 bg-gray-50 dark:bg-gray-900">
        <View className="px-6 pt-6 pb-4 bg-white dark:bg-gray-900">
          <View className="mt-7">
            <Skeleton width="40%" height={28} style={{ marginBottom: 8 }} />
            <Skeleton width="30%" height={16} />
          </View>
        </View>

        <View className="mt-4">
          <ScrollView
            horizontal
            showsHorizontalScrollIndicator={false}
            contentContainerStyle={{ paddingHorizontal: 24 }}
          >
            <SkeletonAnalyticsCard />
            <SkeletonAnalyticsCard />
            <SkeletonAnalyticsCard />
            <SkeletonAnalyticsCard />
          </ScrollView>
        </View>

        <View className="px-6 mt-6">
          {[1, 2, 3, 4, 5].map((i) => (
            <SkeletonCard key={i} />
          ))}
        </View>
      </View>
    );
  }

  // Error State
  if (tripsError) {
    return (
      <View className="flex-1 bg-gray-50 dark:bg-gray-900">
        <View className="px-6 pt-6 pb-4 bg-white dark:bg-gray-800 border-b border-gray-200 dark:border-gray-700">
          <View className="flex-row items-center justify-between mt-7">
            <View>
              <Text className="text-gray-900 dark:text-white font-bold text-2xl">
                Trip History
              </Text>
            </View>
            <TouchableOpacity onPress={() => refetchTrips()} className="p-2">
              <Ionicons
                name="refresh"
                size={24}
                color={isDark ? "#60A5FA" : "#2563EB"}
              />
            </TouchableOpacity>
          </View>
        </View>

        {analyticsData && (
          <View className="mt-4">
            <AnalyticsCards data={analyticsData} isDark={isDark} />
          </View>
        )}

        <View className="flex-1 justify-center items-center px-6">
          <View className="bg-red-50 dark:bg-red-900/20 rounded-2xl p-6 items-center w-full">
            <Ionicons
              name="alert-circle"
              size={48}
              color={isDark ? "#EF4444" : "#DC2626"}
            />
            <Text className="text-gray-900 dark:text-white font-bold text-xl mt-4 text-center">
              Failed to Load Trips
            </Text>
            <Text className="text-gray-600 dark:text-gray-400 text-center mt-2">
              Unable to fetch your trip history
            </Text>
            <TouchableOpacity
              onPress={() => refetchTrips()}
              className="mt-6 bg-blue-600 dark:bg-blue-500 px-6 py-3 rounded-full"
            >
              <Text className="text-white font-semibold">Retry</Text>
            </TouchableOpacity>
          </View>
        </View>
      </View>
    );
  }

  // Empty State
  if (!tripsData || tripsData.trips.length === 0) {
    return (
      <SafeAreaView className="flex-1 bg-gray-50 dark:bg-gray-900">
        <View className="px-6 pt-4 pb-4 bg-white dark:bg-gray-900">
          <View className="flex-row items-center justify-between">
            <View>
              <Text className="text-gray-900 dark:text-white font-bold text-2xl">
                Trip History
              </Text>
              <Text className="text-gray-600 dark:text-gray-400 mt-1">
                Track your journey
              </Text>
            </View>
            <TouchableOpacity
              onPress={() => setShowFilter(true)}
              className="p-2"
            >
              <Ionicons
                name="filter"
                size={24}
                color={isDark ? "#60A5FA" : "#2563EB"}
              />
            </TouchableOpacity>
          </View>
        </View>

        <View className="flex-1 justify-center items-center px-6">
          <View className="bg-white dark:bg-gray-800 rounded-3xl p-8 items-center w-full max-w-sm">
            <View className="bg-blue-100 dark:bg-blue-900/30 rounded-full p-6 mb-4">
              <Ionicons
                name="car-outline"
                size={48}
                color={isDark ? "#60A5FA" : "#2563EB"}
              />
            </View>
            <Text className="text-gray-900 dark:text-white font-bold text-xl text-center">
              No Trips Yet
            </Text>
            <Text className="text-gray-600 dark:text-gray-400 text-center mt-2">
              Start your first journey and track your travel history here
            </Text>
            <TouchableOpacity 
              onPress={handleAddTrip}
              className="mt-6 bg-blue-600 dark:bg-blue-500 px-6 py-3 rounded-full"
            >
              <Text className="text-white font-semibold">Add Manual Trip</Text>
            </TouchableOpacity>
          </View>
        </View>
        <FilterModal
          visible={showFilter}
          onClose={() => setShowFilter(false)}
          onApply={handleApplyFilters}
          isDark={isDark}
        />

        <AddTripModal
          visible={showAddTrip}
          onClose={() => setShowAddTrip(false)}
          isDark={isDark}
        />

        {/* Floating Action Buttons */}
        <View style={{ position: 'absolute', bottom: 0, right: 0, left: 0, top: 0, pointerEvents: 'box-none', zIndex: 99999, elevation: 20 }}>
          <FloatingActionButton
            onPress={handleAddTrip}
            icon="add"
            visible={true}
            bottom={130}
            right={24}
            testID="add-trip-fab"
          />

          <AIFloatingButton
            onPress={handleAIPress}
            visible={true}
            bottom={190}
            right={24}
            testID="ai-fab"
          />
        </View>
      </SafeAreaView>
    );
  }
  // Success State
  const sections = groupTripsByDate(tripsData.trips);
  return (
    <SafeAreaView className="flex-1 bg-gray-50 dark:bg-gray-900">
      <View className="px-6 pt-4 pb-4 bg-white dark:bg-gray-900">
        <View className="flex-row items-center justify-between">
          <View className="flex-1">
            <Text className="text-gray-900 dark:text-white font-bold text-2xl">
              Trip History
            </Text>
            <Text className="text-gray-600 dark:text-gray-400 mt-1">
              {tripsData.count} total {tripsData.count === 1 ? "trip" : "trips"}
            </Text>
          </View>
          <View className="flex-row items-center">
            <TouchableOpacity
              onPress={() => setShowFilter(true)}
              className="p-2 mr-2"
            >
              <Ionicons
                name="filter"
                size={24}
                color={isDark ? "#60A5FA" : "#2563EB"}
              />
            </TouchableOpacity>
            <TouchableOpacity onPress={() => refetchTrips()} className="p-2">
              <Ionicons
                name="refresh"
                size={24}
                color={isDark ? "#60A5FA" : "#2563EB"}
              />
            </TouchableOpacity>
          </View>
        </View>
      </View>
      <SectionList
        sections={sections}
        keyExtractor={(item) => item.id}
        renderItem={({ item }) => <TripCard trip={item} isDark={isDark} />}
        renderSectionHeader={({ section: { title } }) => (
          <View className="bg-gray-50 dark:bg-gray-900 px-6 py-2">
            <Text className="text-gray-700 dark:text-gray-300 font-semibold text-sm">
              {title}
            </Text>
          </View>
        )}
        ListHeaderComponent={
          analyticsData ? (
            <View className="mt-4 mb-2">
              <AnalyticsCards data={analyticsData} isDark={isDark} />
            </View>
          ) : null
        }
        refreshControl={
          <RefreshControl refreshing={refreshing} onRefresh={onRefresh} />
        }
        contentContainerStyle={{ paddingHorizontal: 24, paddingBottom: 140 }}
        stickySectionHeadersEnabled={true}
      />

      <FilterModal
        visible={showFilter}
        onClose={() => setShowFilter(false)}
        onApply={handleApplyFilters}
        isDark={isDark}
      />

      <AddTripModal
        visible={showAddTrip}
        onClose={() => setShowAddTrip(false)}
        isDark={isDark}
      />

      {/* Floating Action Buttons */}
      <View style={{ position: 'absolute', bottom: 0, right: 0, left: 0, top: 0, pointerEvents: 'box-none', zIndex: 99999, elevation: 20 }}>
        <FloatingActionButton
          onPress={handleAddTrip}
          icon="add"
          visible={true}
          bottom={130}
          right={24}
          testID="add-trip-fab"
        />

        <AIFloatingButton
          onPress={handleAIPress}
          visible={true}
          bottom={190}
          right={24}
          testID="ai-fab"
        />
      </View>
    </SafeAreaView>
  );
};

export default HistoryScreen;
