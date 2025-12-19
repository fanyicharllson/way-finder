/* eslint-disable react-hooks/exhaustive-deps */
import React, { useEffect } from 'react';
import { View, Text, ScrollView, ActivityIndicator, TouchableOpacity } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useLocalSearchParams, router } from 'expo-router';
import { useColorScheme } from 'nativewind';
import { Ionicons } from '@expo/vector-icons';
import { useGetPreferences } from '@/hooks/usePreferences';
import { useRouteSearch } from '@/hooks/useRoutes';
import { RouteCard } from '@/app/components/routes/RouteCard';

export default function RouteResultsScreen() {
  const { from, to } = useLocalSearchParams<{ from: string; to: string }>();
  const { colorScheme } = useColorScheme();
  const isDark = colorScheme === 'dark';

  const { data: preferences } = useGetPreferences();
  const { mutate: searchRoutes, data: results, isPending, error } = useRouteSearch();

  useEffect(() => {
    if (from && to) {
      searchRoutes({
        from: { address: from },
        to: { address: to },
        departureTime: undefined,
      });
    }
  }, [from, to]);

  const handleSelectRoute = (route: any) => {
    console.log('Selected route:', route.id);
    console.log("Selected routes: ", results?.routes)
    if (!results) return;
    router.push({
      pathname: '/screens/(tabs)/map',
      params: {
        selectedRoute: JSON.stringify(route),
        allRoutes: JSON.stringify(results.routes),
      },
    });
  };

  const handleViewOnMap = (route: any) => {
    console.log('View on map:', route.id);
    console.log("View on map routes: ", results?.routes)
    if (!results) return;
    router.push({
      pathname: '/screens/(tabs)/map',
      params: {
        selectedRoute: JSON.stringify(route),
        allRoutes: JSON.stringify(results.routes),
      },
    });
  };

  if (isPending) {
    return (
      <SafeAreaView className="flex-1 bg-gray-50 dark:bg-gray-900">
        <View className="flex-1 items-center justify-center px-6">
          <View className="w-20 h-20 bg-blue-100 dark:bg-blue-900/20 rounded-full items-center justify-center mb-6">
            <ActivityIndicator size="large" color="#3B82F6" />
          </View>
          
          <Text className="text-gray-900 dark:text-white text-2xl font-bold text-center">
            Finding Best Routes
          </Text>
          <Text className="text-gray-600 dark:text-gray-400 text-center mt-2">
            Analyzing {preferences?.preferredModes?.length || 'multiple'} transport options
          </Text>
          
          <View className="mt-8 gap-3 w-full max-w-xs">
            <View className="flex-row items-center bg-green-50 dark:bg-green-900/20 p-3 rounded-xl">
              <View className="w-6 h-6 bg-green-500 rounded-full items-center justify-center">
                <Ionicons name="checkmark" size={16} color="white" />
              </View>
              <Text className="text-gray-700 dark:text-gray-300 ml-3 font-medium">
                Checking live traffic
              </Text>
            </View>
            
            <View className="flex-row items-center bg-green-50 dark:bg-green-900/20 p-3 rounded-xl">
              <View className="w-6 h-6 bg-green-500 rounded-full items-center justify-center">
                <Ionicons name="checkmark" size={16} color="white" />
              </View>
              <Text className="text-gray-700 dark:text-gray-300 ml-3 font-medium">
                Comparing costs
              </Text>
            </View>
            
            <View className="flex-row items-center bg-blue-50 dark:bg-blue-900/20 p-3 rounded-xl">
              <ActivityIndicator size="small" color="#3B82F6" />
              <Text className="text-gray-700 dark:text-gray-300 ml-3 font-medium">
                Calculating optimal routes
              </Text>
            </View>
          </View>
        </View>
      </SafeAreaView>
    );
  }

  if (error) {
    return (
      <SafeAreaView className="flex-1 bg-gray-50 dark:bg-gray-900">
        <View className="flex-1 items-center justify-center px-6">
          <View className="w-20 h-20 bg-red-100 dark:bg-red-900/20 rounded-full items-center justify-center mb-6">
            <Ionicons name="alert-circle" size={48} color="#EF4444" />
          </View>
          
          <Text className="text-gray-900 dark:text-white text-2xl font-bold text-center">
            Search Failed
          </Text>
          <Text className="text-gray-600 dark:text-gray-400 text-center mt-2 mb-8">
            {error.message || 'Unable to find routes. Please try again.'}
          </Text>
          
          <TouchableOpacity
            onPress={() => router.back()}
            className="bg-blue-500 px-8 py-4 rounded-2xl"
            activeOpacity={0.8}
          >
            <Text className="text-white font-bold text-lg">Try Again</Text>
          </TouchableOpacity>
        </View>
      </SafeAreaView>
    );
  }

  if (!results || results.routes.length === 0) {
    return (
      <SafeAreaView className="flex-1 bg-gray-50 dark:bg-gray-900">
        <View className="px-6 py-4 bg-white dark:bg-gray-800 border-b border-gray-200 dark:border-gray-700">
          <View className="flex-row items-center">
            <TouchableOpacity onPress={() => router.back()}>
              <Ionicons name="chevron-back" size={24} color={isDark ? '#FFFFFF' : '#000000'} />
            </TouchableOpacity>
            <Text className="text-xl font-bold text-gray-900 dark:text-white ml-2">
              No Routes Found
            </Text>
          </View>
        </View>

        <View className="flex-1 items-center justify-center px-6">
          <View className="w-24 h-24 bg-gray-100 dark:bg-gray-800 rounded-full items-center justify-center mb-6">
            <Ionicons name="search-outline" size={48} color="#9CA3AF" />
          </View>
          
          <Text className="text-gray-900 dark:text-white text-2xl font-bold text-center mb-2">
            No Routes Available
          </Text>
          <Text className="text-gray-600 dark:text-gray-400 text-center mb-8 leading-6">
            We couldn&apos;t find any routes matching your preferences. Try adjusting your search criteria for better results.
          </Text>

          {/* Current Search Info */}
          {results && (
            <View className="w-full bg-white dark:bg-gray-800 rounded-2xl p-4 mb-6 border border-gray-200 dark:border-gray-700">
              <Text className="text-gray-700 dark:text-gray-300 font-semibold mb-3">
                Your Search:
              </Text>
              <View className="flex-row items-center mb-2">
                <Ionicons name="location" size={16} color="#10B981" />
                <Text className="text-gray-600 dark:text-gray-400 text-sm ml-2" numberOfLines={1}>
                  {results.origin.address}
                </Text>
              </View>
              <View className="flex-row items-center">
                <Ionicons name="flag" size={16} color="#EF4444" />
                <Text className="text-gray-600 dark:text-gray-400 text-sm ml-2" numberOfLines={1}>
                  {results.destination.address}
                </Text>
              </View>
            </View>
          )}

          {/* Suggestions */}
          <View className="w-full gap-3">
            <TouchableOpacity
              onPress={() => router.push('/screens/(extrascreens)/preferences')}
              className="bg-blue-500 h-14 rounded-2xl flex-row items-center justify-center px-6"
              activeOpacity={0.8}
            >
              <Ionicons name="options-outline" size={20} color="white" />
              <Text className="text-white font-bold text-base ml-2">
                Update Preferences
              </Text>
            </TouchableOpacity>

            <TouchableOpacity
              onPress={() => router.back()}
              className="bg-white dark:bg-gray-800 h-14 rounded-2xl flex-row items-center justify-center px-6 border-2 border-gray-300 dark:border-gray-700"
              activeOpacity={0.7}
            >
              <Ionicons name="search" size={20} color={isDark ? '#9CA3AF' : '#4B5563'} />
              <Text className="text-gray-700 dark:text-gray-300 font-bold text-base ml-2">
                Try Different Location
              </Text>
            </TouchableOpacity>
          </View>

          {/* Current Preferences Display */}
          {preferences?.isComplete && (
            <View className="w-full mt-6 bg-yellow-50 dark:bg-yellow-900/20 rounded-2xl p-4 border border-yellow-200 dark:border-yellow-800">
              <View className="flex-row items-center mb-2">
                <Ionicons name="information-circle" size={18} color="#F59E0B" />
                <Text className="text-yellow-800 dark:text-yellow-400 font-semibold text-sm ml-2">
                  Current Preferences
                </Text>
              </View>
              <View className="flex-row flex-wrap gap-2">
                <View className="bg-white/50 dark:bg-gray-800/50 px-3 py-1 rounded-lg">
                  <Text className="text-xs text-gray-700 dark:text-gray-300">
                    Budget: ≤ {preferences.maxBudget}
                  </Text>
                </View>
                {preferences.preferredModes.slice(0, 3).map((mode) => (
                  <View key={mode} className="bg-white/50 dark:bg-gray-800/50 px-3 py-1 rounded-lg">
                    <Text className="text-xs text-gray-700 dark:text-gray-300 capitalize">
                      {mode}
                    </Text>
                  </View>
                ))}
              </View>
            </View>
          )}
        </View>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView className="flex-1 bg-gray-50 dark:bg-gray-900">
      <View className="px-6 py-4 bg-white dark:bg-gray-800 border-b border-gray-200 dark:border-gray-700">
        <View className="flex-row items-center mb-3">
          <TouchableOpacity onPress={() => router.back()}>
            <Ionicons
              name="chevron-back"
              size={24}
              color={isDark ? '#FFFFFF' : '#000000'}
            />
          </TouchableOpacity>
          <Text className="text-xl font-bold text-gray-900 dark:text-white ml-2">
            Route Options
          </Text>
        </View>
        
        <View className="flex-row items-center">
          <View className="flex-1">
            <Text className="text-gray-500 dark:text-gray-400 text-xs">From</Text>
            <Text className="text-gray-900 dark:text-white font-semibold" numberOfLines={1}>
              {results.origin.address}
            </Text>
          </View>
          <Ionicons name="arrow-forward" size={16} color="#6B7280" />
          <View className="flex-1 ml-3">
            <Text className="text-gray-500 dark:text-gray-400 text-xs">To</Text>
            <Text className="text-gray-900 dark:text-white font-semibold" numberOfLines={1}>
              {results.destination.address}
            </Text>
          </View>
        </View>
      </View>

      <ScrollView className="flex-1 px-6 py-4" showsVerticalScrollIndicator={false}>
        <Text className="text-gray-600 dark:text-gray-400 text-sm mb-4">
          Found {results.routes.length} route{results.routes.length > 1 ? 's' : ''}
        </Text>
        
        {results.routes.map((route) => (
          <RouteCard
            key={route.id}
            route={route}
            onSelect={() => handleSelectRoute(route)}
            onViewOnMap={() => handleViewOnMap(route)}
            isDark={isDark}
          />
        ))}
        
        <View className="h-8" />
      </ScrollView>
    </SafeAreaView>
  );
}
