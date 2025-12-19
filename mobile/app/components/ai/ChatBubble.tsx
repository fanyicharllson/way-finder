import React from 'react';
import { View, Text, TouchableOpacity } from 'react-native';
import { Ionicons } from '@expo/vector-icons';

export const ChatBubble: React.FC<ChatBubbleProps> = ({
  role,
  text,
  timestamp,
  onActionPress,
  actionLabel,
  isDark,
}) => {
  const isUser = role === 'user';

  return (
    <View className={`mb-4 ${isUser ? 'items-end' : 'items-start'}`}>
      {/* AI Avatar */}
      {!isUser && (
        <View className="flex-row items-start mb-2">
          <View className="w-8 h-8 rounded-full bg-blue-500 items-center justify-center mr-2">
            <Ionicons name="sparkles" size={16} color="white" />
          </View>
          <Text className="text-gray-900 dark:text-white font-semibold text-sm">
            WayFinder AI
          </Text>
        </View>
      )}

      {/* Message Bubble */}
      <View
        className={`max-w-[80%] rounded-3xl px-4 py-3 ${
          isUser
            ? 'bg-blue-500 rounded-tr-sm'
            : 'bg-gray-100 dark:bg-gray-800 rounded-tl-sm'
        }`}
        style={{
          shadowColor: '#000',
          shadowOffset: { width: 0, height: 1 },
          shadowOpacity: 0.1,
          shadowRadius: 2,
          elevation: 2,
        }}
      >
        <Text
          className={`text-base leading-6 ${
            isUser ? 'text-white' : 'text-gray-900 dark:text-white'
          }`}
        >
          {text}
        </Text>

        {/* Action Button */}
        {!isUser && actionLabel && onActionPress && (
          <TouchableOpacity
            onPress={onActionPress}
            className="mt-3 bg-blue-500 rounded-xl px-4 py-2 flex-row items-center justify-center"
            activeOpacity={0.8}
          >
            <Ionicons name="navigate" size={16} color="white" />
            <Text className="text-white font-semibold ml-2">{actionLabel}</Text>
          </TouchableOpacity>
        )}
      </View>

      {/* Timestamp */}
      {timestamp && (
        <Text className="text-gray-400 dark:text-gray-500 text-xs mt-1 mx-2">
          {timestamp}
        </Text>
      )}
    </View>
  );
};

