/* eslint-disable react-hooks/exhaustive-deps */
import React, { useState, useRef, useEffect } from 'react';
import { View, Text, TouchableOpacity, Dimensions, ScrollView } from 'react-native';
import { useColorScheme } from 'nativewind';
import { Ionicons } from '@expo/vector-icons';
import MapboxGL from '@rnmapbox/maps';
import { decodePolyline } from '@/utils/polyline';
import { router } from 'expo-router';
import { RouteCard } from '@/app/components/routes/RouteCard';

const { height } = Dimensions.get('window');

// TODO: Replace with your Mapbox token
MapboxGL.setAccessToken('pk.eyJ1IjoiZWpvaGRhcnlsIiwiYSI6ImNtaXh1bnMzbzAwaHkzZXNkY2JxNXZzeGUifQ.XtXSXOW8DwHqnEiCpPwiLQ');

export default function MapScreen() {
  const { colorScheme } = useColorScheme();
  const isDark = colorScheme === 'dark';
  const mapRef = useRef<MapboxGL.MapView>(null);
  const cameraRef = useRef<MapboxGL.Camera>(null);
  
  const [isDrawerExpanded, setIsDrawerExpanded] = useState(false);
  const [selectedRoute, setSelectedRoute] = useState<any>(null);
  const [userLocation, setUserLocation] = useState<[number, number]>([11.5021, 3.848]);

  // TODO: Get from navigation params or global state
  const mockRoutes = [
    {
      id: '1',
      mode: 'moto' as const,
      cost: 500,
      duration: 15,
      distance: 5.2,
      polyline: '_zqViaieAg@GoAO_BS_AKG@GB[LAEEAACGAE?C@EDCDAF@HDDDBD?D?TXxEdEdA~@FLDJLlBgAfAsArAOLoBp@wBv@{@JE?C?GBCBCD?F@B@B@BFBD@`@ZZh@x@rAPh@D^MNEJELCN@H@HDFDFLDHBH?VTHJE^',
      recommendation: 'best-value' as const,
      steps: [],
    },
    {
      id: '2',
      mode: 'taxi' as const,
      cost: 1200,
      duration: 12,
      distance: 5.0,
      polyline: '_zqViaieAg@GoAO_BS_AKG@GB[LAEEAACGAE?C@EDCDAF@HDDDBD?D?TXxEdEdA~@FLDJLlB',
      recommendation: 'fastest' as const,
      steps: [],
    },
  ];

  useEffect(() => {
    if (mockRoutes.length > 0) {
      setSelectedRoute(mockRoutes[0]);
      fitMapToRoute(mockRoutes[0]);
    }
  }, []);

  const fitMapToRoute = (route: any) => {
    const coordinates = decodePolyline(route.polyline);
    if (coordinates.length > 0 && cameraRef.current) {
      const lngs = coordinates.map(c => c[0]);
      const lats = coordinates.map(c => c[1]);
      
      const bounds = {
        ne: [Math.max(...lngs), Math.max(...lats)],
        sw: [Math.min(...lngs), Math.min(...lats)],
      };

      cameraRef.current.fitBounds(bounds.ne, bounds.sw, [50, 50, 50, 250], 1000);
    }
  };

  const getModeColor = (mode: string) => {
    switch (mode) {
      case 'bus': return '#3B82F6';
      case 'moto': return '#F97316';
      case 'taxi': return '#10B981';
      case 'walk': return '#6B7280';
      default: return '#3B82F6';
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

        {/* Render selected route polyline */}
        {selectedRoute && (
          <MapboxGL.ShapeSource
            id={`route-${selectedRoute.id}`}
            shape={{
              type: 'Feature',
              geometry: {
                type: 'LineString',
                coordinates: decodePolyline(selectedRoute.polyline),
              },
              properties: {},
            }}
          >
            <MapboxGL.LineLayer
              id={`route-line-${selectedRoute.id}`}
              style={{
                lineColor: getModeColor(selectedRoute.mode),
                lineWidth: 6,
                lineCap: 'round',
                lineJoin: 'round',
              }}
            />
          </MapboxGL.ShapeSource>
        )}

        {/* Origin Marker */}
        <MapboxGL.PointAnnotation
          id="origin"
          coordinate={userLocation}
        >
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
            shadowColor: '#000',
            shadowOffset: { width: 0, height: 2 },
            shadowOpacity: 0.2,
            shadowRadius: 8,
            elevation: 8,
          }}
          activeOpacity={0.9}
        >
          <Ionicons name="search" size={20} color={isDark ? '#9CA3AF' : '#6B7280'} />
          <Text className="flex-1 ml-3 text-gray-900 dark:text-white font-medium" numberOfLines={1}>
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
            shadowColor: '#000',
            shadowOffset: { width: 0, height: 2 },
            shadowOpacity: 0.2,
            shadowRadius: 4,
            elevation: 4,
          }}
        >
          <Ionicons name="locate" size={24} color="#3B82F6" />
        </TouchableOpacity>
      </View>

      {/* Bottom Sheet */}
      <View
        className="absolute left-0 right-0 bottom-0 bg-white dark:bg-gray-800 rounded-t-3xl"
        style={{
          height: isDrawerExpanded ? height * 0.7 : 200,
          shadowColor: '#000',
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
                  style={{ backgroundColor: `${getModeColor(selectedRoute.mode)}20` }}
                >
                  <Ionicons
                    name={
                      selectedRoute.mode === 'bus' ? 'bus' :
                      selectedRoute.mode === 'moto' ? 'bicycle' :
                      selectedRoute.mode === 'taxi' ? 'car' : 'walk'
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
                <Text className="text-gray-500 dark:text-gray-400 text-xs">FCFA</Text>
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
          <ScrollView className="flex-1 px-6" showsVerticalScrollIndicator={false}>
            <Text className="text-xl font-bold text-gray-900 dark:text-white mb-4">
              All Routes ({mockRoutes.length})
            </Text>
            
            {mockRoutes.map((route) => (
              <RouteCard
                key={route.id}
                route={route}
                onSelect={() => handleSelectRoute(route)}
                onViewOnMap={() => handleSelectRoute(route)}
                isDark={isDark}
              />
            ))}
            
            <View className="h-6" />
          </ScrollView>
        )}
      </View>
    </View>
  );
}