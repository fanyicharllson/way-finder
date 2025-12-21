import React, { useState } from 'react';
import { View, Text, TouchableOpacity, ActivityIndicator } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useAIRecommendation } from '@/hooks/useAI';
import { router } from 'expo-router';

interface SmartSuggestionProps {
  isDark: boolean;
}

export function SmartSuggestion({ isDark }: SmartSuggestionProps) {
  const aiRecommendation = useAIRecommendation();
  const [suggestionHistory, setSuggestionHistory] = useState<string[]>([]);

  const handleGetSuggestion = () => {
    aiRecommendation.mutate('Give me a quick commute suggestion based on my recent trips', {
      onSuccess: (data) => {
        setSuggestionHistory(prev => [data.reply, ...prev.slice(0, 2)]);
      }
    });
  };

  const handleActionPress = (action: any) => {
    if (action?.type === 'search_route' && action.data) {
      router.push(
        `/screens/(extrascreens)/route-results?from=${encodeURIComponent(action.data.origin)}&to=${encodeURIComponent(action.data.destination)}`
      );
    }
  };

  return (
    <View className="bg-white dark:bg-gray-800 rounded-2xl p-4 mb-4">
      <View className="flex-row items-center justify-between mb-3">
        <View className="flex-row items-center">
          <View className="w-8 h-8 bg-purple-500/20 rounded-full items-center justify-center mr-2">
            <Ionicons name="bulb" size={16} color="#A855F7" />
          </View>
          <Text className="text-base font-bold text-gray-900 dark:text-white">
            Smart Suggestion
          </Text>
        </View>
        
        <View className="bg-purple-100 dark:bg-purple-900/30 px-2 py-1 rounded-full">
          <Text className="text-xs text-purple-600 dark:text-purple-400 font-semibold">
            AI Powered
          </Text>
        </View>
      </View>

      {aiRecommendation.isPending ? (
        <View className="py-6 items-center">
          <ActivityIndicator size="small" color="#A855F7" />
          <Text className="text-sm text-gray-500 dark:text-gray-400 mt-2">
            AI Analyzing your trips...
          </Text>
        </View>
      ) : aiRecommendation.data ? (
        <View>
          <Text className="text-sm text-gray-700 dark:text-gray-300 leading-5 mb-3">
            {aiRecommendation.data.reply}
          </Text>
          
          {aiRecommendation.data.action === 'search_route' && aiRecommendation.data.actionData && (
            <TouchableOpacity
              onPress={() => handleActionPress(aiRecommendation.data)}
              className="bg-purple-500 h-12 rounded-xl flex-row items-center justify-center"
              activeOpacity={0.8}
            >
              <Ionicons name="navigate" size={18} color="white" />
              <Text className="text-white font-semibold ml-2">
                Search This Route
              </Text>
            </TouchableOpacity>
          )}

          {/* Suggestion History */}
          {suggestionHistory.length > 1 && (
            <View className="mt-3 pt-3 border-t border-gray-200 dark:border-gray-700">
              <Text className="text-xs text-gray-500 dark:text-gray-400 font-semibold mb-2">Previous Suggestions:</Text>
              {suggestionHistory.slice(1, 3).map((suggestion, index) => (
                <View key={index} className="flex-row items-start mb-1">
                  <Text className="text-xs text-gray-400 dark:text-gray-500">• </Text>
                  <Text className="text-xs text-gray-400 dark:text-gray-500 flex-1" numberOfLines={1}>
                    {suggestion}
                  </Text>
                </View>
              ))}
            </View>
          )}
        </View>
      ) : (
        <TouchableOpacity
          onPress={handleGetSuggestion}
          className="bg-gradient-to-r from-purple-500 to-pink-500 h-12 rounded-xl flex-row items-center justify-center"
          activeOpacity={0.8}
          style={{
            shadowColor: '#A855F7',
            shadowOffset: { width: 0, height: 4 },
            shadowOpacity: 0.3,
            shadowRadius: 8,
            elevation: 6,
          }}
        >
          <Ionicons name="sparkles" size={18} color="white" />
          <Text className="text-white font-bold ml-2">
            Get Smart Suggestion
          </Text>
        </TouchableOpacity>
      )}
      
      {aiRecommendation.isError && (
        <View className="bg-red-50 dark:bg-red-900/20 p-3 rounded-xl">
          <Text className="text-sm text-red-600 dark:text-red-400">
            Couldn't generate suggestion. Please try again.
          </Text>
        </View>
      )}
    </View>
  );
}
