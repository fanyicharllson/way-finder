import React from 'react';
import { View, Text, ScrollView, TouchableOpacity } from 'react-native';
import { Ionicons } from '@expo/vector-icons';

export const RecentSearches: React.FC<RecentSearchesProps> = ({
  searches,
  onSelectSearch,
  isDark,
}) => {
  if (searches.length === 0) return null;

  return (
    <View className="mb-6">
      <Text className="text-gray-900 dark:text-white font-bold text-lg mb-3 px-6">
        Recent Searches
      </Text>
      
      <ScrollView
        horizontal
        showsHorizontalScrollIndicator={false}
        contentContainerStyle={{ paddingHorizontal: 24 }}
        className="flex-row"
      >
        {searches.map((search) => (
          <TouchableOpacity
            key={search.id}
            onPress={() => onSelectSearch(search)}
            activeOpacity={0.7}
            className="mr-3 bg-white dark:bg-gray-800 rounded-2xl px-4 py-3 border border-gray-200 dark:border-gray-700"
            style={{ minWidth: 200 }}
          >
            <View className="flex-row items-center mb-2">
              <Ionicons
                name="time-outline"
                size={16}
                color={isDark ? '#9CA3AF' : '#6B7280'}
              />
              <Text className="text-gray-500 dark:text-gray-400 text-xs ml-1">
                Recent
              </Text>
            </View>
            <View className="flex-row items-center">
              <Text
                className="text-gray-900 dark:text-white font-medium text-sm flex-1"
                numberOfLines={1}
              >
                {search.from}
              </Text>
              <Ionicons
                name="arrow-forward"
                size={14}
                color={isDark ? '#9CA3AF' : '#6B7280'}
              />
              <Text
                className="text-gray-900 dark:text-white font-medium text-sm flex-1 text-right"
                numberOfLines={1}
              >
                {search.to}
              </Text>
            </View>
          </TouchableOpacity>
        ))}
      </ScrollView>
    </View>
  );
};
