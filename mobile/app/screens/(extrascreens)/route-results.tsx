import React, { useEffect } from 'react';
import { View, Text, ScrollView, ActivityIndicator, TouchableOpacity } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useLocalSearchParams, router } from 'expo-router';
import { useColorScheme } from 'nativewind';
import { Ionicons } from '@expo/vector-icons';
import { useGetPreferences } from '@/hooks/usePreferences';
import { useRouteSearchQuery } from '@/hooks/useRoutes';
import { RouteCard } from '@/components/routes/RouteCard';
import { RouteSearchProgress } from '@/components/routes/RouteSearchProgress';
import { NotificationService } from '@/utils/notification';

export default function RouteResultsScreen() {
  const { from, to, departureTime } = useLocalSearchParams<{ 
    from: string; 
    to: string;
    departureTime?: string;
  }>();
  const { colorScheme } = useColorScheme();
  const isDark = colorScheme === 'dark';

  const { data: preferences } = useGetPreferences();
  const { data: results, isLoading: isPending, error } = useRouteSearchQuery(from, to, departureTime);

  // 🔔 Notify when budget is exceeded
  useEffect(() => {
    if (results?.context?.budget?.isExceeded) {
      const routeName = `${from} → ${to}`;
      const cheapestPrice = results.context.budget.cheapestRoutePrice;
      const userBudget = results.context.budget.userMaxBudget;
      
      NotificationService.notifyBudgetExceeded(
        routeName,
        cheapestPrice,
        userBudget
      );
    }
  }, [results]);

  const handleSelectRoute = async (route: any) => {
    if (!results) return;
    
    // 🔔 Notify user that trip has started
    const destination = to;
    const estimatedArrival = new Date(Date.now() + route.duration * 60000).toLocaleTimeString('en-US', { 
      hour: 'numeric', 
      minute: '2-digit' 
    });
    
    await NotificationService.notifyTripStarted(destination, estimatedArrival);
    
    router.push({
      pathname: '/screens/(tabs)/map',
      params: {
        selectedRoute: JSON.stringify(route),
        allRoutes: JSON.stringify(results.routes),
        context: JSON.stringify(results.context),
        from: from,
        to: to,
        departureTime: departureTime || '',
      },
    });
  };

  const handleViewOnMap = (route: any) => {
    if (!results) return;
    router.push({
      pathname: '/screens/(tabs)/map',
      params: {
        selectedRoute: JSON.stringify(route),
        allRoutes: JSON.stringify(results.routes),
        context: JSON.stringify(results.context),
        from: from,
        to: to,
        departureTime: departureTime || '',
      },
    });
  };

  if (isPending) {
    return (
      <SafeAreaView className="flex-1 bg-gray-50 dark:bg-gray-900">
        <RouteSearchProgress 
          isDark={isDark}
          transportModesCount={preferences?.preferredModes?.length || 3}
        />
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
      <View className="px-6 py-4 bg-white dark:bg-gray-900 border-b border-gray-200 dark:border-gray-700">
        <View className="flex-row items-center mb-3">
          <TouchableOpacity onPress={() => router.back()}>
            <Ionicons
              name="arrow-back"
              size={24}
              color={isDark ? '#FFFFFF' : '#000000'}
            />
          </TouchableOpacity>
          <Text className="text-2xl font-bold text-gray-900 dark:text-white ml-2">
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
        {/* Context-Aware Pricing Info */}
        {results.context && (
          <View className="mb-4 gap-2">
            {/* Budget Exceeded Warning */}
            {results.context.budget?.isExceeded && (
              <View className="bg-red-50 dark:bg-red-900/20 rounded-xl p-4 border border-red-200 dark:border-red-800">
                <View className="flex-row items-start">
                  <Ionicons name="wallet-outline" size={20} color="#EF4444" />
                  <View className="flex-1 ml-3">
                    <Text className="text-red-900 dark:text-red-200 font-bold text-sm mb-1">
                      Budget Limit Exceeded
                    </Text>
                    <Text className="text-red-700 dark:text-red-300 text-xs leading-5 mb-3">
                      Your budget preference is {results.context.budget.userMaxBudget.toLocaleString()} FCFA, but the cheapest route costs {results.context.budget.cheapestRoutePrice.toLocaleString()} FCFA.
                    </Text>
                    <TouchableOpacity
                      onPress={() => router.push('/screens/(extrascreens)/preferences')}
                      className="bg-red-600 dark:bg-red-500 rounded-lg py-2 px-4 self-start"
                      activeOpacity={0.8}
                    >
                      <Text className="text-white font-semibold text-xs">
                        Edit Preferences
                      </Text>
                    </TouchableOpacity>
                  </View>
                </View>
              </View>
            )}

            {/* Surge Pricing Alert */}
            {results.context.pricing?.isSurgeActive && (
              <View className="bg-orange-50 dark:bg-orange-900/20 rounded-xl p-3 border border-orange-200 dark:border-orange-800">
                <View className="flex-row items-center">
                  <Ionicons name="trending-up" size={18} color="#F97316" />
                  <View className="flex-1 ml-2">
                    <Text className="text-orange-900 dark:text-orange-200 font-semibold text-xs">
                      Surge Pricing Active
                    </Text>
                    <Text className="text-orange-700 dark:text-orange-300 text-xs mt-0.5">
                      {results.context.pricing.surgeReason}
                    </Text>
                  </View>
                </View>
              </View>
            )}

            {/* Savings Badge */}
            {results.context.savings?.hasSavings && (
              <View className="bg-green-50 dark:bg-green-900/20 rounded-xl p-3 border border-green-200 dark:border-green-800">
                <View className="flex-row items-center">
                  <Ionicons name="checkmark-circle" size={18} color="#10B981" />
                  <Text className="text-green-900 dark:text-green-200 font-semibold text-xs ml-2 flex-1">
                    {results.context.savings.message}
                  </Text>
                </View>
              </View>
            )}

            {/* Weather & Traffic Context Row */}
            <View className="flex-row gap-2">
              {/* Weather Button */}
              {results.context.weather && (
                <TouchableOpacity
                  className="flex-1 bg-blue-50 dark:bg-blue-900/20 rounded-xl p-3 border border-blue-200 dark:border-blue-800"
                  activeOpacity={0.7}
                >
                  <View className="flex-row items-center justify-between">
                    <View className="flex-row items-center flex-1">
                      <Ionicons
                        name={
                          results.context.weather.condition === 'rain' || results.context.weather.condition === 'heavy_rain'
                            ? 'rainy'
                            : results.context.weather.condition === 'storm'
                            ? 'thunderstorm'
                            : 'sunny'
                        }
                        size={20}
                        color="#3B82F6"
                      />
                      <View className="ml-2">
                        <Text className="text-blue-900 dark:text-blue-200 font-bold text-base">
                          {results.context.weather.temperature}°C
                        </Text>
                        <Text className="text-blue-700 dark:text-blue-300 text-xs capitalize">
                          {results.context.weather.description}
                        </Text>
                      </View>
                    </View>
                    <Ionicons name="chevron-forward" size={16} color="#3B82F6" />
                  </View>
                </TouchableOpacity>
              )}

              {/* Traffic Indicator */}
              {results.context.pricing && (
                <View
                  className={`flex-1 rounded-xl p-3 border ${
                    results.context.pricing.trafficLevel === 'high'
                      ? 'bg-red-50 dark:bg-red-900/20 border-red-200 dark:border-red-800'
                      : results.context.pricing.trafficLevel === 'moderate'
                      ? 'bg-yellow-50 dark:bg-yellow-900/20 border-yellow-200 dark:border-yellow-800'
                      : 'bg-green-50 dark:bg-green-900/20 border-green-200 dark:border-green-800'
                  }`}
                >
                  <View className="flex-row items-center">
                    <View
                      className={`w-3 h-3 rounded-full ${
                        results.context.pricing.trafficLevel === 'high'
                          ? 'bg-red-500'
                          : results.context.pricing.trafficLevel === 'moderate'
                          ? 'bg-yellow-500'
                          : 'bg-green-500'
                      }`}
                    />
                    <View className="ml-2 flex-1">
                      <Text
                        className={`font-semibold text-xs ${
                          results.context.pricing.trafficLevel === 'high'
                            ? 'text-red-900 dark:text-red-200'
                            : results.context.pricing.trafficLevel === 'moderate'
                            ? 'text-yellow-900 dark:text-yellow-200'
                            : 'text-green-900 dark:text-green-200'
                        }`}
                      >
                        Traffic
                      </Text>
                      <Text
                        className={`text-xs capitalize ${
                          results.context.pricing.trafficLevel === 'high'
                            ? 'text-red-700 dark:text-red-300'
                            : results.context.pricing.trafficLevel === 'moderate'
                            ? 'text-yellow-700 dark:text-yellow-300'
                            : 'text-green-700 dark:text-green-300'
                        }`}
                      >
                        {results.context.pricing.trafficLevel}
                      </Text>
                    </View>
                  </View>
                </View>
              )}
            </View>
          </View>
        )}

        <Text className="text-gray-600 dark:text-gray-400 text-sm mb-4">
          Found {results.routes.length} route{results.routes.length > 1 ? 's' : ''}
        </Text>
        
        {results.routes.map((route) => (
          <RouteCard
            key={route.id}
            route={route}
            onSelect={() => handleSelectRoute(route)}
            onViewOnMap={() => handleViewOnMap(route)}
            onAIAnalysis={() => {
              router.push({
                pathname: '/screens/(extrascreens)/ai-chat',
                params: {
                  autoPrompt: `Analyze this route for me:\n\nTransport: ${route.mode}\nDistance: ${route.distance.toFixed(1)} km\nEstimated Cost: ${route.cost} FCFA\nEstimated Duration: ${route.duration} minutes\n\nIs this cost reasonable? Should I consider other options? What factors might affect the actual price?`
                }
              });
            }}
            isDark={isDark}
          />
        ))}
        
        {/* Price Disclaimer */}
        <View className="mt-4 mb-6 p-4 bg-gray-100 dark:bg-gray-800 rounded-2xl border border-gray-200 dark:border-gray-700">
          <View className="flex-row items-start">
            <Ionicons
              name="information-circle"
              size={18}
              color={isDark ? "#9CA3AF" : "#6B7280"}
              style={{ marginTop: 1, marginRight: 8 }}
            />
            <View className="flex-1">
              <Text className="text-sm font-semibold text-gray-700 dark:text-gray-300 mb-1">
                About Pricing
              </Text>
              <Text className="text-xs text-gray-600 dark:text-gray-400 leading-5">
                Prices shown are estimates and may vary based on traffic conditions, time of day, weather, and current demand. Actual fares may differ when you book.
              </Text>
            </View>
          </View>
        </View>
        
        <View className="h-8" />
      </ScrollView>
    </SafeAreaView>
  );
}
