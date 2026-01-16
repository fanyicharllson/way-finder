/* eslint-disable react-hooks/exhaustive-deps */
import React, { useState, useRef, useEffect } from "react";
import {
  View,
  Text,
  TouchableOpacity,
  Dimensions,
  ScrollView,
} from "react-native";
import { useColorScheme } from "nativewind";
import { Ionicons } from "@expo/vector-icons";
import MapboxGL from "@rnmapbox/maps";
import { decodePolyline } from "@/utils/polyline";
import { router } from "expo-router";
import { RouteCard } from "@/components/routes/RouteCard";
import { useLocalSearchParams } from "expo-router";

const { height } = Dimensions.get("window");

MapboxGL.setAccessToken(
  "pk.eyJ1IjoiZWpvaGRhcnlsIiwiYSI6ImNtaXh1bnMzbzAwaHkzZXNkY2JxNXZzeGUifQ.XtXSXOW8DwHqnEiCpPwiLQ"
);

export default function MapScreen() {
  const { colorScheme } = useColorScheme();
  const isDark = colorScheme === "dark";
  const mapRef = useRef<MapboxGL.MapView>(null);
  const cameraRef = useRef<MapboxGL.Camera>(null);

  const [isDrawerExpanded, setIsDrawerExpanded] = useState(false);
  const [selectedRoute, setSelectedRoute] = useState<any>(null);
  const [userLocation, setUserLocation] = useState<[number, number]>([
    11.5021, 3.848,
  ]);
  const [routes, setRoutes] = useState<any[]>([]);

  // If navigated from route results, parse passed params
  const params = useLocalSearchParams();

  const passedRoutes = (() => {
    try {
      if (params?.allRoutes) return JSON.parse(String(params.allRoutes));
    } catch (e) {
      console.warn("Failed to parse allRoutes param", e);
    }
    return null;
  })();

  const passedSelectedRoute = (() => {
    try {
      if (params?.selectedRoute) return JSON.parse(String(params.selectedRoute));
    } catch (e) {
      console.warn("Failed to parse selectedRoute param", e);
    }
    return null;
  })();

  const passedContext = (() => {
    try {
      if (params?.context) return JSON.parse(String(params.context));
    } catch (e) {
      console.warn("Failed to parse context param", e);
    }
    return null;
  })();

  useEffect(() => {
    if (passedRoutes && passedRoutes.length > 0) {
      setRoutes(passedRoutes);
      setSelectedRoute(passedSelectedRoute || passedRoutes[0]);
      fitMapToRoute(passedSelectedRoute || passedRoutes[0]);
    }
    // otherwise leave `routes` empty — map will render nothing until routes are provided
  }, []);

  const fitMapToRoute = (route: any) => {
    const coordinates = decodePolyline(route.polyline);
    if (coordinates.length > 0 && cameraRef.current) {
      const lngs = coordinates.map((c) => c[0]);
      const lats = coordinates.map((c) => c[1]);

      const bounds = {
        ne: [Math.max(...lngs), Math.max(...lats)],
        sw: [Math.min(...lngs), Math.min(...lats)],
      };

      cameraRef.current.fitBounds(
        bounds.ne,
        bounds.sw,
        [50, 50, 50, 250],
        1000
      );
    }
  };

  const getModeColor = (mode: string) => {
    switch (mode) {
      case "bus":
        return "#3B82F6";
      case "moto":
        return "#F97316";
      case "taxi":
        return "#10B981";
      case "walk":
        return "#6B7280";
      default:
        return "#3B82F6";
    }
  };

  const handleSelectRoute = (route: any) => {
    setSelectedRoute(route);
    fitMapToRoute(route);
    setIsDrawerExpanded(false);
  };

  return (
    <View className="flex-1">
      <MapboxGL.MapView
        ref={mapRef}
        style={{ flex: 1 }}
        styleURL={isDark ? MapboxGL.StyleURL.Dark : MapboxGL.StyleURL.Street}
        compassEnabled
        compassViewPosition={3}
        compassViewMargins={{ x: 16, y: 100 }}
      >
        <MapboxGL.Camera
          ref={cameraRef}
          zoomLevel={13}
          centerCoordinate={userLocation}
          animationDuration={2000}
        />

        <MapboxGL.UserLocation
          visible
          showsUserHeadingIndicator
          androidRenderMode="gps"
        />

        {/* Render all routes and highlight the selected one */}
        {routes.map((r) => {
          const coords = decodePolyline(r.polyline);
          const isSelected = selectedRoute && selectedRoute.id === r.id;
          return (
            <MapboxGL.ShapeSource
              key={`route-${r.id}`}
              id={`route-${r.id}`}
              shape={{
                type: "Feature",
                geometry: { type: "LineString", coordinates: coords },
                properties: {},
              }}
            >
              <MapboxGL.LineLayer
                id={`route-line-${r.id}`}
                style={{
                  lineColor: getModeColor(r.mode),
                  lineWidth: isSelected ? 8 : 4,
                  lineOpacity: isSelected ? 1 : 0.5,
                  lineCap: "round",
                  lineJoin: "round",
                }}
              />
            </MapboxGL.ShapeSource>
          );
        })}

        {/* Origin Marker */}
        <MapboxGL.PointAnnotation id="origin" coordinate={userLocation}>
          <View className="w-10 h-10 bg-green-500 rounded-full items-center justify-center border-4 border-white">
            <Ionicons name="location" size={20} color="white" />
          </View>
        </MapboxGL.PointAnnotation>

        {/* Destination Marker */}
        {selectedRoute && (
          <MapboxGL.PointAnnotation
            id="destination"
            coordinate={decodePolyline(selectedRoute.polyline).slice(-1)[0]}
          >
            <View className="w-10 h-10 bg-red-500 rounded-full items-center justify-center border-4 border-white">
              <Ionicons name="flag" size={20} color="white" />
            </View>
          </MapboxGL.PointAnnotation>
        )}
      </MapboxGL.MapView>

      {/* Floating Search Bar */}
      <View className="absolute top-16 left-4 right-4">
        <TouchableOpacity
          onPress={() => router.back()}
          className="bg-white dark:bg-gray-800 rounded-2xl p-4 flex-row items-center"
          style={{
            shadowColor: "#000",
            shadowOffset: { width: 0, height: 2 },
            shadowOpacity: 0.2,
            shadowRadius: 8,
            elevation: 8,
          }}
          activeOpacity={0.9}
        >
          <Ionicons
            name="search"
            size={20}
            color={isDark ? "#9CA3AF" : "#6B7280"}
          />
          <Text
            className="flex-1 ml-3 text-gray-900 dark:text-white font-medium"
            numberOfLines={1}
          >
            Bastos → Nlongkak
          </Text>
          <Ionicons name="create-outline" size={20} color="#3B82F6" />
        </TouchableOpacity>
      </View>

      {/* Map Controls */}
      <View className="absolute right-4 bottom-40 gap-2">
        <TouchableOpacity
          onPress={() => {
            if (cameraRef.current) {
              cameraRef.current.setCamera({
                centerCoordinate: userLocation,
                zoomLevel: 15,
                animationDuration: 1000,
              });
            }
          }}
          className="w-12 h-12 bg-white dark:bg-gray-800 rounded-full items-center justify-center"
          style={{
            shadowColor: "#000",
            shadowOffset: { width: 0, height: 2 },
            shadowOpacity: 0.2,
            shadowRadius: 4,
            elevation: 4,
          }}
        >
          <Ionicons name="locate" size={24} color="#3B82F6" />
        </TouchableOpacity>
      </View>

      {/* View All Routes Button - Only show if routes exist, came from route results, and drawer is NOT expanded */}
      {routes.length > 0 && passedRoutes && !isDrawerExpanded && (
        <View className="absolute left-4 bottom-60">
          <TouchableOpacity
            onPress={() => {
              // Navigate back to route-results with search params - React Query will use cached data
              if (params?.from && params?.to) {
                router.push({
                  pathname: '/screens/(extrascreens)/route-results',
                  params: {
                    from: String(params.from),
                    to: String(params.to),
                    departureTime: params.departureTime ? String(params.departureTime) : undefined,
                  },
                });
              } else {
                router.back();
              }
            }}
            className="bg-blue-500 rounded-2xl px-4 py-3 flex-row items-center gap-2"
            style={{
              shadowColor: "#3B82F6",
              shadowOffset: { width: 0, height: 4 },
              shadowOpacity: 0.3,
              shadowRadius: 8,
              elevation: 8,
            }}
            activeOpacity={0.8}
          >
            <Ionicons name="list" size={20} color="white" />
            <Text className="text-white font-bold text-sm">
              View All Routes ({routes.length})
            </Text>
          </TouchableOpacity>
        </View>
      )}

      {/* Bottom Sheet (only if routes exist) */}
      {routes.length > 0 && (
        <View
          className="absolute left-0 right-0 bottom-0 bg-white dark:bg-gray-800 rounded-t-3xl"
          style={{
            height: isDrawerExpanded ? height * 0.7 : 200,
            shadowColor: "#000",
            shadowOffset: { width: 0, height: -4 },
            shadowOpacity: 0.1,
            shadowRadius: 12,
            elevation: 12,
          }}
        >
          <TouchableOpacity
            onPress={() => setIsDrawerExpanded(!isDrawerExpanded)}
            className="items-center py-3"
          >
            <View className="w-12 h-1 bg-gray-300 dark:bg-gray-600 rounded-full" />
          </TouchableOpacity>

          {!isDrawerExpanded && selectedRoute && (
            <View className="px-6 pb-6">
              <View className="flex-row items-center justify-between mb-4">
                <View className="flex-row items-center flex-1">
                  <View
                    className="w-12 h-12 rounded-xl items-center justify-center"
                    style={{
                      backgroundColor: `${getModeColor(selectedRoute.mode)}20`,
                    }}
                  >
                    <Ionicons
                      name={
                        selectedRoute.mode === "bus"
                          ? "bus"
                          : selectedRoute.mode === "moto"
                          ? "bicycle"
                          : selectedRoute.mode === "taxi"
                          ? "car"
                          : "walk"
                      }
                      size={24}
                      color={getModeColor(selectedRoute.mode)}
                    />
                  </View>
                  <View className="ml-3 flex-1">
                    <Text className="text-lg font-bold text-gray-900 dark:text-white capitalize">
                      {selectedRoute.mode}
                    </Text>
                    <Text className="text-gray-500 dark:text-gray-400 text-sm">
                      {selectedRoute.distance} km • {selectedRoute.duration} mins
                    </Text>
                  </View>
                </View>
                <View className="items-end">
                  <Text className="text-2xl font-bold text-gray-900 dark:text-white">
                    {selectedRoute.cost}
                  </Text>
                  <Text className="text-gray-500 dark:text-gray-400 text-xs">
                    FCFA
                  </Text>
                </View>
              </View>

              <TouchableOpacity
                className="h-14 rounded-2xl items-center justify-center"
                style={{ backgroundColor: getModeColor(selectedRoute.mode) }}
                activeOpacity={0.8}
              >
                <Text className="text-white font-bold text-lg">Start Trip</Text>
              </TouchableOpacity>
            </View>
          )}

          {isDrawerExpanded && (
            <ScrollView
              className="flex-1 px-6"
              showsVerticalScrollIndicator={false}
            >
              <Text className="text-xl font-bold text-gray-900 dark:text-white mb-4">
                All Routes ({routes.length})
              </Text>

              {/* Context Info - Weather & Traffic */}
              {passedContext && (
                <View className="mb-4 gap-2">
                  {/* Weather & Traffic Row */}
                  <View className="flex-row gap-2">
                    {/* Weather Button */}
                    {passedContext.weather && (
                      <TouchableOpacity
                        className="flex-1 bg-blue-50 dark:bg-blue-900/20 rounded-xl p-3 border border-blue-200 dark:border-blue-800"
                        activeOpacity={0.7}
                      >
                        <View className="flex-row items-center justify-between">
                          <View className="flex-row items-center flex-1">
                            <Ionicons
                              name={
                                passedContext.weather.condition === 'rain' || passedContext.weather.condition === 'heavy_rain'
                                  ? 'rainy'
                                  : passedContext.weather.condition === 'storm'
                                  ? 'thunderstorm'
                                  : 'sunny'
                              }
                              size={20}
                              color="#3B82F6"
                            />
                            <View className="ml-2">
                              <Text className="text-blue-900 dark:text-blue-200 font-bold text-base">
                                {passedContext.weather.temperature}°C
                              </Text>
                              <Text className="text-blue-700 dark:text-blue-300 text-xs capitalize">
                                {passedContext.weather.description}
                              </Text>
                            </View>
                          </View>
                          <Ionicons name="chevron-forward" size={16} color="#3B82F6" />
                        </View>
                      </TouchableOpacity>
                    )}

                    {/* Traffic Indicator */}
                    {passedContext.pricing && (
                      <View
                        className={`flex-1 rounded-xl p-3 border ${
                          passedContext.pricing.trafficLevel === 'high'
                            ? 'bg-red-50 dark:bg-red-900/20 border-red-200 dark:border-red-800'
                            : passedContext.pricing.trafficLevel === 'moderate'
                            ? 'bg-yellow-50 dark:bg-yellow-900/20 border-yellow-200 dark:border-yellow-800'
                            : 'bg-green-50 dark:bg-green-900/20 border-green-200 dark:border-green-800'
                        }`}
                      >
                        <View className="flex-row items-center">
                          <View
                            className={`w-3 h-3 rounded-full ${
                              passedContext.pricing.trafficLevel === 'high'
                                ? 'bg-red-500'
                                : passedContext.pricing.trafficLevel === 'moderate'
                                ? 'bg-yellow-500'
                                : 'bg-green-500'
                            }`}
                          />
                          <View className="ml-2 flex-1">
                            <Text
                              className={`font-semibold text-xs ${
                                passedContext.pricing.trafficLevel === 'high'
                                  ? 'text-red-900 dark:text-red-200'
                                  : passedContext.pricing.trafficLevel === 'moderate'
                                  ? 'text-yellow-900 dark:text-yellow-200'
                                  : 'text-green-900 dark:text-green-200'
                              }`}
                            >
                              Traffic
                            </Text>
                            <Text
                              className={`text-xs capitalize ${
                                passedContext.pricing.trafficLevel === 'high'
                                  ? 'text-red-700 dark:text-red-300'
                                  : passedContext.pricing.trafficLevel === 'moderate'
                                  ? 'text-yellow-700 dark:text-yellow-300'
                                  : 'text-green-700 dark:text-green-300'
                              }`}
                            >
                              {passedContext.pricing.trafficLevel}
                            </Text>
                          </View>
                        </View>
                      </View>
                    )}
                  </View>

                  {/* Surge Alert */}
                  {passedContext.pricing?.isSurgeActive && (
                    <View className="bg-orange-50 dark:bg-orange-900/20 rounded-xl p-3 border border-orange-200 dark:border-orange-800">
                      <View className="flex-row items-center">
                        <Ionicons name="trending-up" size={16} color="#F97316" />
                        <Text className="text-orange-900 dark:text-orange-200 font-semibold text-xs ml-2 flex-1">
                          {passedContext.pricing.surgeReason}
                        </Text>
                      </View>
                    </View>
                  )}
                </View>
              )}

              {routes.map((route) => (
                <RouteCard
                  key={route.id}
                  route={route}
                  onSelect={() => handleSelectRoute(route)}
                  onViewOnMap={() => handleSelectRoute(route)}
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

              <View className="h-6" />
              {/* Bottom padding for floating tab bar */}
              <View className="h-28" />
            </ScrollView>
          )}
        </View>
      )}
    </View>
  );
}
  