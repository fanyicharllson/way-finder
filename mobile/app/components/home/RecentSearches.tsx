import React, { useState, useMemo } from "react";
import {
  View,
  Text,
  ScrollView,
  TouchableOpacity,
  ActivityIndicator,
  Modal,
  Pressable,
  FlatList,
} from "react-native";
import { Ionicons } from "@expo/vector-icons";

import { showToast } from "@/utils/toast";
import { useFavorites, useToggleFavorite } from "@/hooks/useFavorite";
import {
  useRecentSearches,
  useClearRecentSearches,
  useDeleteSearch,
} from "@/hooks/useRecentSearch";

interface RecentSearchesProps {
  onSelectSearch: (from: string, to: string) => void;
  isDark: boolean;
}

export const RecentSearches: React.FC<RecentSearchesProps> = ({
  onSelectSearch,
  isDark,
}) => {
  const [showModal, setShowModal] = useState(false);
  const [optimisticFavorites, setOptimisticFavorites] = useState<Set<string>>(
    new Set()
  );

  const { data, isLoading, isError, refetch } = useRecentSearches(5);
  const { data: favoritesData } = useFavorites();
  const clearAll = useClearRecentSearches();
  const deleteSearch = useDeleteSearch();
  const toggleFavorite = useToggleFavorite();

  // Create a map of favorited routes for quick lookup
  const favoritedRoutes = useMemo(() => {
    if (!favoritesData?.favorites) return new Set<string>();

    return new Set(
      favoritesData.favorites.map(
        (fav) => `${fav.fromAddress}-${fav.toAddress}`
      )
    );
  }, [favoritesData]);

  // Check if a search is favorited (including optimistic updates)
  const isFavorited = (search: any) => {
    const routeKey = `${search.fromAddress}-${search.toAddress}`;

    // Check optimistic state first
    if (optimisticFavorites.has(routeKey)) {
      return true;
    }

    // Then check actual favorites
    return favoritedRoutes.has(routeKey);
  };

  const handleRefresh = () => {
    refetch();
  };

  if (isLoading) {
    return (
      <View className="mb-6 px-6">
        <Text className="text-gray-900 dark:text-white font-bold text-lg mb-3">
          Recent Searches
        </Text>
        <View className="flex-row justify-center py-8">
          <ActivityIndicator
            size="small"
            color={isDark ? "#3B82F6" : "#2563EB"}
          />
        </View>
      </View>
    );
  }

  if (isError) {
    return (
      <View className="mb-6 px-6">
        <View className="flex-row items-center justify-between mb-3">
          <Text className="text-gray-900 dark:text-white font-bold text-lg">
            Recent Searches
          </Text>
          <TouchableOpacity onPress={handleRefresh} className="p-1">
            <Ionicons
              name="refresh"
              size={20}
              color={isDark ? "#60A5FA" : "#2563EB"}
            />
          </TouchableOpacity>
        </View>
        <View className="bg-red-50 dark:bg-red-900/20 rounded-2xl p-4 flex-row items-center">
          <Ionicons
            name="alert-circle"
            size={20}
            color={isDark ? "#FCA5A5" : "#DC2626"}
          />
          <Text className="text-red-600 dark:text-red-400 ml-2 flex-1">
            Failed to load recent searches
          </Text>
        </View>
      </View>
    );
  }

  if (!data || data.searches.length === 0) {
    return (
      <View className="mb-6 px-6">
        <View className="flex-row items-center justify-between mb-3">
          <Text className="text-gray-900 dark:text-white font-bold text-lg">
            Recent Searches
          </Text>
          <TouchableOpacity onPress={handleRefresh} className="p-1">
            <Ionicons
              name="refresh"
              size={20}
              color={isDark ? "#60A5FA" : "#2563EB"}
            />
          </TouchableOpacity>
        </View>
        <View className="bg-gray-50 dark:bg-gray-800 rounded-2xl p-6 items-center">
          <Ionicons
            name="search-outline"
            size={40}
            color={isDark ? "#4B5563" : "#9CA3AF"}
          />
          <Text className="text-gray-500 dark:text-gray-400 text-center mt-3">
            No recent searches yet
          </Text>
          <Text className="text-gray-400 dark:text-gray-500 text-center text-sm mt-1">
            Your search history will appear here
          </Text>
        </View>
      </View>
    );
  }

  const handleFavorite = async (search: any, e: any) => {
    e.stopPropagation();

    if (!search.fromLat || !search.fromLng || !search.toLat || !search.toLng) {
      showToast({
        type: "error",
        text1: "Error",
        text2: "Cannot add to favorites: location data missing",
      });
      return;
    }

    const routeKey = `${search.fromAddress}-${search.toAddress}`;
    const currentlyFavorited = isFavorited(search);

    // Optimistically update UI
    if (currentlyFavorited) {
      setOptimisticFavorites((prev) => {
        const newSet = new Set(prev);
        newSet.delete(routeKey);
        return newSet;
      });
    } else {
      setOptimisticFavorites((prev) => new Set(prev).add(routeKey));
    }

    try {
      const result = await toggleFavorite.mutateAsync({
        name: `${search.fromAddress} to ${search.toAddress}`,
        fromAddress: search.fromAddress,
        toAddress: search.toAddress,
        fromLat: search.fromLat,
        fromLng: search.fromLng,
        toLat: search.toLat,
        toLng: search.toLng,
      });

      // Show success toast
      showToast({
        type: "success",
        text1:
          result.action === "added"
            ? "Added to Favorites"
            : "Removed from Favorites",
        text2:
          result.action === "added"
            ? "Route saved for quick access"
            : "Route removed from favorites",
      });

      // Clear optimistic state after server confirms
      setOptimisticFavorites((prev) => {
        const newSet = new Set(prev);
        newSet.delete(routeKey);
        return newSet;
      });
    } catch (error) {
      // Revert optimistic update on error
      if (currentlyFavorited) {
        setOptimisticFavorites((prev) => new Set(prev).add(routeKey));
      } else {
        setOptimisticFavorites((prev) => {
          const newSet = new Set(prev);
          newSet.delete(routeKey);
          return newSet;
        });
      }

      showToast({
        type: "error",
        text1: "Error",
        text2: "Failed to update favorites",
      });
    }
  };

  const SearchCard = ({ search, showDelete = false }: any) => {
    const isRouteInFavorites = isFavorited(search);

    return (
      <TouchableOpacity
        onPress={() => onSelectSearch(search.fromAddress, search.toAddress)}
        activeOpacity={0.7}
        className="bg-white dark:bg-gray-800 rounded-2xl px-4 py-3 border border-gray-200 dark:border-gray-700"
        style={showDelete ? {} : { minWidth: 200, marginRight: 12 }}
      >
        <View className="flex-row items-center justify-between mb-2">
          <View className="flex-row items-center flex-1">
            <Ionicons
              name="time-outline"
              size={16}
              color={isDark ? "#9CA3AF" : "#6B7280"}
            />
            <Text className="text-gray-500 dark:text-gray-400 text-xs ml-1">
              {search.searchCount} {search.searchCount === 1 ? "time" : "times"}
            </Text>
          </View>
          <View className="flex-row items-center">
            <TouchableOpacity
              onPress={(e) => handleFavorite(search, e)}
              className="p-1 mr-1"
              disabled={toggleFavorite.isPending}
            >
              {toggleFavorite.isPending ? (
                <ActivityIndicator
                  size="small"
                  color={isDark ? "#9CA3AF" : "#6B7280"}
                />
              ) : (
                <Ionicons
                  name={isRouteInFavorites ? "heart" : "heart-outline"}
                  size={18}
                  color={
                    isRouteInFavorites
                      ? "#EF4444"
                      : isDark
                      ? "#9CA3AF"
                      : "#6B7280"
                  }
                />
              )}
            </TouchableOpacity>
            {showDelete && (
              <TouchableOpacity
                onPress={(e) => {
                  e.stopPropagation();
                  deleteSearch.mutate(search.id);
                }}
                className="p-1"
              >
                <Ionicons
                  name="close-circle"
                  size={18}
                  color={isDark ? "#EF4444" : "#DC2626"}
                />
              </TouchableOpacity>
            )}
          </View>
        </View>
        <View className="flex-row items-center">
          <Text
            className="text-gray-900 dark:text-white font-medium text-sm flex-1"
            numberOfLines={1}
          >
            {search.fromAddress}
          </Text>
          <Ionicons
            name="arrow-forward"
            size={14}
            color={isDark ? "#9CA3AF" : "#6B7280"}
            style={{ marginHorizontal: 8 }}
          />
          <Text
            className="text-gray-900 dark:text-white font-medium text-sm flex-1 text-right"
            numberOfLines={1}
          >
            {search.toAddress}
          </Text>
        </View>
      </TouchableOpacity>
    );
  };

  return (
    <>
      <View className="mb-6">
        <View className="flex-row items-center justify-between px-6 mb-3">
          <Text className="text-gray-900 dark:text-white font-bold text-lg">
            Recent Searches
          </Text>
          <View className="flex-row items-center">
            <TouchableOpacity onPress={handleRefresh} className="p-1 mr-3">
              <Ionicons
                name="refresh"
                size={20}
                color={isDark ? "#60A5FA" : "#2563EB"}
              />
            </TouchableOpacity>
            {data.searches.length > 0 && (
              <TouchableOpacity
                onPress={() => setShowModal(true)}
                className="flex-row items-center"
              >
                <Text className="text-blue-600 dark:text-blue-400 text-sm mr-1">
                  See All
                </Text>
                <Ionicons
                  name="chevron-forward"
                  size={16}
                  color={isDark ? "#60A5FA" : "#2563EB"}
                />
              </TouchableOpacity>
            )}
          </View>
        </View>

        <ScrollView
          horizontal
          showsHorizontalScrollIndicator={false}
          contentContainerStyle={{ paddingHorizontal: 24 }}
        >
          {data.searches.map((search) => (
            <SearchCard key={search.id} search={search} />
          ))}
        </ScrollView>
      </View>

          {/* Modal to view all  */}
      <Modal
        visible={showModal}
        animationType="slide"
        transparent={true}
        onRequestClose={() => setShowModal(false)}
      >
        <Pressable
          className="flex-1 bg-black/50"
          onPress={() => setShowModal(false)}
        >
          <Pressable
            className="absolute bottom-0 left-0 right-0 bg-white dark:bg-gray-900 rounded-t-3xl pb-8"
            style={{ maxHeight: "80%" }}
            onPress={(e) => e.stopPropagation()}
          >
            <View className="pt-6 px-6">
              <View className="flex-row items-center justify-between mb-4">
                <Text className="text-gray-900 dark:text-white font-bold text-xl">
                  Recent Searches
                </Text>
                <View className="flex-row items-center">
                  <TouchableOpacity
                    onPress={() => {
                      clearAll.mutate();
                      setShowModal(false);
                    }}
                    className="mr-4 p-2"
                  >
                    <Ionicons
                      name="trash-outline"
                      size={20}
                      color={isDark ? "#EF4444" : "#DC2626"}
                    />
                  </TouchableOpacity>
                  <TouchableOpacity onPress={() => setShowModal(false)}>
                    <Ionicons
                      name="close"
                      size={24}
                      color={isDark ? "#9CA3AF" : "#6B7280"}
                    />
                  </TouchableOpacity>
                </View>
              </View>

              <FlatList
                data={data.searches}
                keyExtractor={(item) => item.id}
                renderItem={({ item }) => (
                  <View className="mb-4">
                    <SearchCard search={item} showDelete={true} />
                  </View>
                )}
                showsVerticalScrollIndicator={false}
                contentContainerStyle={{ paddingBottom: 20 }}
              />
            </View>
          </Pressable>
        </Pressable>
      </Modal>
    </>
  );
};
