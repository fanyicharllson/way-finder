// components/history/TripCard.tsx
import React, { useState } from 'react';
import { View, Text, TouchableOpacity, Animated } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { showToast } from '@/utils/toast';
import { useRateTrip } from '@/hooks/useTrip';

interface Trip {
  id: string;
  origin: string;
  destination: string;
  transportMode: string;
  actualCost: number;
  actualTime: number;
  distance: number;
  startTime: string;
  endTime?: string;
  rating?: number;
}

interface TripCardProps {
  trip: Trip;
  isDark: boolean;
}

export const TripCard: React.FC<TripCardProps> = ({ trip, isDark }) => {
  const [expanded, setExpanded] = useState(false);
  const [selectedRating, setSelectedRating] = useState(trip.rating || 0);
  const rateTrip = useRateTrip();
  const animatedHeight = useState(new Animated.Value(0))[0];

  const getModeIcon = (mode: string): any => {
    switch (mode.toLowerCase()) {
      case 'bus':
        return 'bus';
      case 'moto':
        return 'bicycle';
      case 'taxi':
        return 'car';
      case 'walk':
        return 'walk';
      default:
        return 'navigate';
    }
  };

  const getModeColor = (mode: string) => {
    switch (mode.toLowerCase()) {
      case 'bus':
        return { bg: isDark ? '#1E3A8A' : '#DBEAFE', icon: '#3B82F6' };
      case 'moto':
        return { bg: isDark ? '#7C2D12' : '#FED7AA', icon: '#F97316' };
      case 'taxi':
        return { bg: isDark ? '#14532D' : '#D1FAE5', icon: '#10B981' };
      case 'walk':
        return { bg: isDark ? '#4B5563' : '#E5E7EB', icon: '#6B7280' };
      default:
        return { bg: isDark ? '#1F2937' : '#F3F4F6', icon: '#9CA3AF' };
    }
  };

  const formatTime = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleTimeString('en-US', {
      hour: '2-digit',
      minute: '2-digit',
      hour12: true,
    });
  };

  const formatDuration = (minutes: number) => {
    const hours = Math.floor(minutes / 60);
    const mins = minutes % 60;
    if (hours > 0) {
      return `${hours}h ${mins}min`;
    }
    return `${mins}min`;
  };

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('fr-FR', {
      style: 'decimal',
      minimumFractionDigits: 0,
    }).format(amount);
  };

  const handleExpand = () => {
    const toValue = expanded ? 0 : 1;
    setExpanded(!expanded);
    Animated.spring(animatedHeight, {
      toValue,
      useNativeDriver: false,
      friction: 8,
    }).start();
  };

  const handleRate = async (rating: number) => {
    setSelectedRating(rating);
    try {
      await rateTrip.mutateAsync({ tripId: trip.id, rating });
      showToast({
        type: 'success',
        text1: 'Thanks for rating!',
        text2: 'Your feedback helps us improve',
      });
    } catch (error) {
      showToast({
        type: 'error',
        text1: 'Failed to save rating',
        text2: 'Please try again',
      });
      setSelectedRating(trip.rating || 0);
    }
  };

  const modeColor = getModeColor(trip.transportMode);

  return (
    <TouchableOpacity
      onPress={handleExpand}
      activeOpacity={0.7}
      className="bg-white dark:bg-gray-800 rounded-2xl p-4 mb-3 border border-gray-200 dark:border-gray-700"
    >
      <View className="flex-row items-center">
        {/* Mode Icon */}
        <View
          className="rounded-xl w-12 h-12 items-center justify-center"
          style={{ backgroundColor: modeColor.bg }}
        >
          <Ionicons name={getModeIcon(trip.transportMode)} size={24} color={modeColor.icon} />
        </View>

        {/* Main Content */}
        <View className="flex-1 ml-3">
          <Text className="text-gray-900 dark:text-white font-bold text-base mb-1">
            {trip.origin} → {trip.destination}
          </Text>
          <View className="flex-row items-center">
            <Ionicons name="time-outline" size={14} color={isDark ? '#9CA3AF' : '#6B7280'} />
            <Text className="text-gray-600 dark:text-gray-400 text-xs ml-1">
              {formatTime(trip.startTime)}
              {trip.endTime && ` - ${formatTime(trip.endTime)}`}
            </Text>
            <Text className="text-gray-400 dark:text-gray-500 mx-2">•</Text>
            <Text className="text-gray-600 dark:text-gray-400 text-xs">
              {formatDuration(trip.actualTime)}
            </Text>
          </View>
        </View>

        {/* Cost */}
        <View className="items-end">
          <Text className="text-gray-900 dark:text-white font-bold text-lg">
            {formatCurrency(trip.actualCost)}
          </Text>
          <Text className="text-gray-500 dark:text-gray-400 text-xs">XAF</Text>
        </View>
      </View>

      {/* Expanded Content */}
      {expanded && (
        <View className="mt-4 pt-4 border-t border-gray-200 dark:border-gray-700">
          <View className="flex-row items-center justify-between mb-3">
            <View className="flex-row items-center">
              <Ionicons name="speedometer-outline" size={16} color={isDark ? '#9CA3AF' : '#6B7280'} />
              <Text className="text-gray-600 dark:text-gray-400 text-sm ml-2">
                {trip.distance} km
              </Text>
            </View>
            <View className="flex-row items-center">
              <Ionicons name="bus-outline" size={16} color={isDark ? '#9CA3AF' : '#6B7280'} />
              <Text className="text-gray-600 dark:text-gray-400 text-sm ml-2 capitalize">
                {trip.transportMode}
              </Text>
            </View>
          </View>

          {/* Rating Section */}
          <View className="bg-gray-50 dark:bg-gray-700/50 rounded-xl p-3">
            <Text className="text-gray-700 dark:text-gray-300 text-sm font-medium mb-2">
              {trip.rating ? 'Your Rating' : 'Rate this trip'}
            </Text>
            <View className="flex-row items-center">
              {[1, 2, 3, 4, 5].map((star) => (
                <TouchableOpacity
                  key={star}
                  onPress={() => handleRate(star)}
                  disabled={rateTrip.isPending}
                  className="mr-2"
                >
                  <Ionicons
                    name={star <= selectedRating ? 'star' : 'star-outline'}
                    size={24}
                    color={star <= selectedRating ? '#F59E0B' : (isDark ? '#4B5563' : '#D1D5DB')}
                  />
                </TouchableOpacity>
              ))}
            </View>
          </View>
        </View>
      )}
    </TouchableOpacity>
  );
};