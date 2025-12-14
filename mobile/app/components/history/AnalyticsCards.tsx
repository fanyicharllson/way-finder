import React from 'react';
import { View, Text, ScrollView } from 'react-native';
import { Ionicons } from '@expo/vector-icons';

interface AnalyticsData {
  totalSpent: number;
  totalTrips: number;
  savings: number;
  mostUsedMode: string;
  mostUsedCount: number;
  modeBreakdown: {
    bus: number;
    moto: number;
    taxi: number;
    walk: number;
  };
  spentTrend?: number;
}

interface AnalyticsCardsProps {
  data: AnalyticsData;
  isDark: boolean;
}

export const AnalyticsCards: React.FC<AnalyticsCardsProps> = ({ data, isDark }) => {
  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('fr-FR', {
      style: 'decimal',
      minimumFractionDigits: 0,
    }).format(amount);
  };

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

  return (
    <ScrollView
      horizontal
      showsHorizontalScrollIndicator={false}
      contentContainerStyle={{ paddingHorizontal: 24 }}
      className="mb-4"
    >
      {/* Total Spent Card */}
      <View
        className="rounded-2xl p-4 mr-3"
        style={{
          width: 160,
          backgroundColor: isDark ? '#1E40AF' : '#3B82F6',
        }}
      >
        <View className="bg-white/20 rounded-xl w-10 h-10 items-center justify-center mb-3">
          <Ionicons name="wallet" size={20} color="#FFFFFF" />
        </View>
        <Text className="text-white text-2xl font-bold mb-1">
          {formatCurrency(data.totalSpent)}
        </Text>
        <Text className="text-white/80 text-xs mb-2">XAF This Month</Text>
        {data.spentTrend !== undefined && (
          <View className="flex-row items-center">
            <Ionicons
              name={data.spentTrend >= 0 ? 'trending-up' : 'trending-down'}
              size={12}
              color={data.spentTrend >= 0 ? '#10B981' : '#EF4444'}
            />
            <Text
              className="text-xs ml-1"
              style={{ color: data.spentTrend >= 0 ? '#10B981' : '#EF4444' }}
            >
              {Math.abs(data.spentTrend)}% vs last month
            </Text>
          </View>
        )}
      </View>

      {/* Total Trips Card */}
      <View
        className="rounded-2xl p-4 mr-3"
        style={{
          width: 160,
          backgroundColor: isDark ? '#7C3AED' : '#8B5CF6',
        }}
      >
        <View className="bg-white/20 rounded-xl w-10 h-10 items-center justify-center mb-3">
          <Ionicons name="navigate" size={20} color="#FFFFFF" />
        </View>
        <Text className="text-white text-2xl font-bold mb-1">{data.totalTrips}</Text>
        <Text className="text-white/80 text-xs mb-2">Trips Taken</Text>
        <View className="flex-row items-center">
          <View className="flex-row items-center mr-2">
            <View className="w-2 h-2 rounded-full bg-blue-300 mr-1" />
            <Text className="text-white/70 text-xs">{data.modeBreakdown.bus}%</Text>
          </View>
          <View className="flex-row items-center mr-2">
            <View className="w-2 h-2 rounded-full bg-orange-300 mr-1" />
            <Text className="text-white/70 text-xs">{data.modeBreakdown.moto}%</Text>
          </View>
          <View className="flex-row items-center">
            <View className="w-2 h-2 rounded-full bg-green-300 mr-1" />
            <Text className="text-white/70 text-xs">{data.modeBreakdown.taxi}%</Text>
          </View>
        </View>
      </View>

      {/* Savings Card */}
      <View
        className="rounded-2xl p-4 mr-3"
        style={{
          width: 160,
          backgroundColor: isDark ? '#059669' : '#10B981',
        }}
      >
        <View className="bg-white/20 rounded-xl w-10 h-10 items-center justify-center mb-3">
          <Ionicons name="trending-down" size={20} color="#FFFFFF" />
        </View>
        <Text className="text-white text-2xl font-bold mb-1">
          {formatCurrency(data.savings)}
        </Text>
        <Text className="text-white/80 text-xs mb-2">XAF Saved</Text>
        <Text className="text-white/70 text-xs">vs Always Taking Taxi</Text>
      </View>

      {/* Most Used Card */}
      <View
        className="rounded-2xl p-4"
        style={{
          width: 160,
          backgroundColor: isDark ? '#DC2626' : '#EF4444',
        }}
      >
        <View className="bg-white/20 rounded-xl w-10 h-10 items-center justify-center mb-3">
          <Ionicons name={getModeIcon(data.mostUsedMode)} size={20} color="#FFFFFF" />
        </View>
        <Text className="text-white text-xl font-bold mb-1 capitalize">
          {data.mostUsedMode}
        </Text>
        <Text className="text-white/80 text-xs mb-2">Most Used</Text>
        <Text className="text-white/70 text-xs">{data.mostUsedCount} trips</Text>
      </View>
    </ScrollView>
  );
};