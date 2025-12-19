import React from 'react';
import { View, Text, TouchableOpacity } from 'react-native';
import { Ionicons } from '@expo/vector-icons';


const SuggestionChip: React.FC<SuggestionChipProps> = ({ icon, text, onPress }) => (
  <TouchableOpacity
    onPress={onPress}
    className="bg-white dark:bg-gray-800 rounded-2xl px-4 py-3 mr-2 mb-2 border border-gray-200 dark:border-gray-700"
    activeOpacity={0.7}
  >
    <View className="flex-row items-center">
      <Ionicons name={icon as any} size={18} color="#3B82F6" />
      <Text className="text-gray-900 dark:text-white ml-2 font-medium">{text}</Text>
    </View>
  </TouchableOpacity>
);

interface EmptyStateProps {
  onSuggestionPress: (text: string) => void;
}

export const EmptyState: React.FC<EmptyStateProps> = ({ onSuggestionPress }) => {
  const suggestions = [
    { icon: 'search', text: 'Find route to work' },
    { icon: 'cash', text: 'Cheapest route to downtown' },
    { icon: 'time', text: 'Fastest way to airport' },
    { icon: 'location', text: 'Routes near me' },
  ];

  return (
    <View className="flex-1 items-center justify-center px-6 pb-20">
      <View className="w-20 h-20 bg-blue-100 dark:bg-blue-900/20 rounded-full items-center justify-center mb-4">
        <Ionicons name="sparkles" size={40} color="#3B82F6" />
      </View>
      
      <Text className="text-2xl font-bold text-gray-900 dark:text-white mb-2 text-center">
        Hi! I'm WayFinder AI
      </Text>
      <Text className="text-gray-600 dark:text-gray-400 text-center mb-8 leading-6">
        Ask me anything about routes, transport modes, or travel planning in your city
      </Text>

      {/* Suggestion Chips */}
      <View className="flex-row flex-wrap justify-center">
        {suggestions.map((suggestion, idx) => (
          <SuggestionChip
            key={idx}
            icon={suggestion.icon}
            text={suggestion.text}
            onPress={() => onSuggestionPress(suggestion.text)}
          />
        ))}
      </View>
    </View>
  );
};